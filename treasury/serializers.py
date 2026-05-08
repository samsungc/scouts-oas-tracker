from decimal import Decimal
from rest_framework import serializers
from .models import Account, FinancialStatement, Transaction, VALID_DENOMINATIONS

_VALID_DENOM_KEYS = {str(d) for d in VALID_DENOMINATIONS}


class AccountListSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ["id", "name", "balance"]

    def get_balance(self, obj):
        deposit = getattr(obj, "deposit_total", None) or Decimal("0")
        withdrawal = getattr(obj, "withdrawal_total", None) or Decimal("0")
        return deposit - withdrawal


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
            "reversal_of",
        ]

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

    class Meta:
        model = FinancialStatement
        fields = [
            "id",
            "period_start",
            "period_end",
            "generated_at",
            "generated_by_username",
            "treasurer_signed_at",
            "treasurer_signed_by_username",
            "president_signed_at",
            "president_signed_by_username",
            "needs_president_signature",
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

    def validate(self, data):
        start = data.get("period_start")
        end = data.get("period_end")
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"period_end": "period_end must be after period_start."}
            )
        return data
