from decimal import Decimal
from django.db.models import Q, Sum
from django.db.models.functions import Coalesce
from rest_framework import serializers
from .models import Account, FinancialStatement, Transaction, VALID_DENOMINATIONS

_VALID_DENOM_KEYS = {str(d) for d in VALID_DENOMINATIONS}


class AccountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ["name"]

    def validate_name(self, value):
        if Account.objects.filter(name__iexact=value, is_active=True).exists():
            raise serializers.ValidationError("An account with this name already exists.")
        return value


class AccountListSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    denomination_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ["id", "name", "balance", "denomination_breakdown"]

    def get_balance(self, obj):
        deposit = getattr(obj, "deposit_total", None) or Decimal("0")
        withdrawal = getattr(obj, "withdrawal_total", None) or Decimal("0")
        return deposit - withdrawal

    def get_denomination_breakdown(self, obj):
        counts = {str(d): 0 for d in VALID_DENOMINATIONS}
        for txn in obj.transactions.only("transaction_type", "denomination_breakdown"):
            sign = 1 if txn.transaction_type == "deposit" else -1
            for denom, count in txn.denomination_breakdown.items():
                counts[denom] = counts.get(denom, 0) + sign * count
        return counts


class AccountDetailSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    denomination_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ["id", "name", "balance", "denomination_breakdown"]

    def get_balance(self, obj):
        return self.context.get("balance")

    def get_denomination_breakdown(self, obj):
        return self.context.get("denomination_breakdown")


class TransactionListSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    reversal_of_id = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "id",
            "transaction_type",
            "category",
            "amount",
            "denomination_breakdown",
            "note",
            "created_by_username",
            "created_at",
            "is_reversal",
            "reversal_of_id",
        ]

    def get_reversal_of_id(self, obj):
        return obj.reversal_of_id


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "transaction_type",
            "category",
            "amount",
            "denomination_breakdown",
            "note",
            "is_reversal",
            "is_opening_balance",
            "reversal_of",
            "created_at",
        ]
        extra_kwargs = {
            "created_at": {"required": False},
        }

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        amount_cents = int(round(float(value) * 100))
        if amount_cents % 5 != 0:
            raise serializers.ValidationError("Amount must be a multiple of $0.05.")
        return value

    def validate_denomination_breakdown(self, value):
        if set(value.keys()) != _VALID_DENOM_KEYS:
            expected = sorted(_VALID_DENOM_KEYS, key=int, reverse=True)
            raise serializers.ValidationError(
                f"denomination_breakdown must contain exactly these keys: {expected}"
            )
        for key, count in value.items():
            if not isinstance(count, int) or count < 0:
                raise serializers.ValidationError(
                    f"Count for denomination {key} must be a non-negative integer."
                )
        return value

    def validate(self, data):
        transaction_type = data.get("transaction_type")
        category = data.get("category")
        amount = data.get("amount")
        breakdown = data.get("denomination_breakdown")
        is_reversal = data.get("is_reversal", False)
        reversal_of = data.get("reversal_of")

        # Category must be valid for the transaction type
        if transaction_type == "withdrawal":
            valid_cats = Transaction.WITHDRAWAL_CATEGORIES
        else:
            valid_cats = Transaction.DEPOSIT_CATEGORIES

        if category not in valid_cats:
            raise serializers.ValidationError({
                "category": f"'{category}' is not a valid category for a {transaction_type}."
            })

        # Denomination breakdown must sum to amount
        if amount is not None and breakdown is not None:
            amount_cents = int(round(float(amount) * 100))
            breakdown_cents = sum(int(k) * v for k, v in breakdown.items())
            if breakdown_cents != amount_cents:
                raise serializers.ValidationError({
                    "denomination_breakdown": (
                        f"Denomination breakdown sums to ${breakdown_cents / 100:.2f} "
                        f"but amount is ${amount_cents / 100:.2f}."
                    )
                })

        # Reversal validation
        if is_reversal:
            if reversal_of is None:
                raise serializers.ValidationError({
                    "reversal_of": "reversal_of is required when is_reversal is True."
                })
            account = self.context["account"]
            if reversal_of.account_id != account.id:
                raise serializers.ValidationError({
                    "reversal_of": "The referenced transaction does not belong to this account."
                })
            if hasattr(reversal_of, "reversal"):
                raise serializers.ValidationError({
                    "reversal_of": "This transaction has already been reversed."
                })
        else:
            if reversal_of is not None:
                raise serializers.ValidationError({
                    "reversal_of": "reversal_of must be null when is_reversal is False."
                })

        return data


class FinancialStatementSerializer(serializers.ModelSerializer):
    generated_by_username = serializers.CharField(source="generated_by.username", read_only=True)
    treasurer_signed_by_username = serializers.SerializerMethodField()
    president_signed_by_username = serializers.SerializerMethodField()
    needs_president_signature = serializers.SerializerMethodField()
    financial_data = serializers.SerializerMethodField()
    account_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = FinancialStatement
        fields = [
            "id",
            "period_start",
            "period_end",
            "account_ids",
            "generated_at",
            "generated_by_username",
            "treasurer_signed_at",
            "treasurer_signed_by_username",
            "president_signed_at",
            "president_signed_by_username",
            "needs_president_signature",
            "financial_data",
        ]
        read_only_fields = [
            "id", "generated_at", "generated_by_username",
            "treasurer_signed_at", "treasurer_signed_by_username",
            "president_signed_at", "president_signed_by_username",
            "needs_president_signature",
        ]

    def get_treasurer_signed_by_username(self, obj):
        return obj.treasurer_signed_by.username if obj.treasurer_signed_by_id else None

    def get_president_signed_by_username(self, obj):
        return obj.president_signed_by.username if obj.president_signed_by_id else None

    def get_needs_president_signature(self, obj):
        return obj.treasurer_signed_at is not None and obj.president_signed_at is None

    def get_financial_data(self, obj):
        selected = obj.accounts.all()
        accounts = (selected if selected.exists()
                    else Account.objects.filter(is_active=True)).order_by("name")
        result = []
        for account in accounts:
            txns = account.transactions.all()

            # Account opening balance = sum of is_opening_balance transactions (the OB deposit)
            ob_agg = txns.filter(is_opening_balance=True).aggregate(
                dep=Coalesce(Sum("amount", filter=Q(transaction_type="deposit")), Decimal("0")),
                wdw=Coalesce(Sum("amount", filter=Q(transaction_type="withdrawal")), Decimal("0")),
            )
            account_ob = ob_agg["dep"] - ob_agg["wdw"]

            # Period opening balance = account_ob + all non-OB transactions before period_start
            pre = txns.filter(is_opening_balance=False, created_at__date__lt=obj.period_start).aggregate(
                dep=Coalesce(Sum("amount", filter=Q(transaction_type="deposit")), Decimal("0")),
                wdw=Coalesce(Sum("amount", filter=Q(transaction_type="withdrawal")), Decimal("0")),
            )
            opening = account_ob + pre["dep"] - pre["wdw"]

            # Period transactions — exclude opening balance transactions
            period = txns.filter(
                is_opening_balance=False,
                created_at__date__gte=obj.period_start,
                created_at__date__lte=obj.period_end,
            )
            # All non-opening-balance transactions up to period_end (account total)
            total_scope = txns.filter(is_opening_balance=False, created_at__date__lte=obj.period_end)

            def _cat_totals(qs, txn_type, categories):
                return {
                    cat: str(
                        qs.filter(transaction_type=txn_type, category=cat)
                        .aggregate(t=Coalesce(Sum("amount"), Decimal("0")))["t"]
                    )
                    for cat in categories
                }

            revenues = _cat_totals(period, "deposit", Transaction.DEPOSIT_CATEGORIES)
            expenses = _cat_totals(period, "withdrawal", Transaction.WITHDRAWAL_CATEGORIES)
            total_revenues = _cat_totals(total_scope, "deposit", Transaction.DEPOSIT_CATEGORIES)
            total_expenses = _cat_totals(total_scope, "withdrawal", Transaction.WITHDRAWAL_CATEGORIES)

            period_revenue = sum(Decimal(v) for v in revenues.values())
            period_expenses = sum(Decimal(v) for v in expenses.values())
            total_revenue = sum(Decimal(v) for v in total_revenues.values())
            total_expense = sum(Decimal(v) for v in total_expenses.values())
            closing = opening + period_revenue - period_expenses

            result.append({
                "account_id": account.id,
                "account_name": account.name,
                "account_opening_balance": str(account_ob),
                "opening_balance": str(opening),
                "revenues": revenues,
                "expenses": expenses,
                "period_revenue_total": str(period_revenue),
                "period_expenses_total": str(period_expenses),
                "closing_balance": str(closing),
                "total_revenues": total_revenues,
                "total_expenses": total_expenses,
                "total_revenue_total": str(total_revenue),
                "total_expenses_total": str(total_expense),
            })
        return result

    def create(self, validated_data):
        account_ids = validated_data.pop("account_ids", [])
        statement = super().create(validated_data)
        if account_ids:
            statement.accounts.set(Account.objects.filter(id__in=account_ids))
        return statement

    def validate(self, data):
        start = data.get("period_start")
        end = data.get("period_end")
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"period_end": "period_end must be after period_start."}
            )
        return data
