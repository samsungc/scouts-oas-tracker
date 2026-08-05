from collections import Counter
from decimal import Decimal

from django.db.models import Max, Q, Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils import timezone
from .fiscal_year import (
    current_fiscal_year,
    fiscal_year_bounds,
    fiscal_year_for_date,
    fiscal_year_label,
)
from .models import Account, FinancialStatement, Transaction, VALID_DENOMINATIONS
from .pagination import StatementPagePagination, TransactionPagePagination
from .permissions import CanEditTreasury, CanManageAccounts, CanViewTreasury
from .serializers import (
    AccountCreateSerializer,
    AccountDetailSerializer,
    AccountListSerializer,
    FinancialStatementSerializer,
    TransactionCreateSerializer,
    TransactionListSerializer,
)


def _compute_dollar_balance(account):
    agg = account.transactions.aggregate(
        deposit_total=Coalesce(
            Sum("amount", filter=Q(transaction_type="deposit")), Decimal("0")
        ),
        withdrawal_total=Coalesce(
            Sum("amount", filter=Q(transaction_type="withdrawal")), Decimal("0")
        ),
    )
    return agg["deposit_total"] - agg["withdrawal_total"]


def _compute_denomination_breakdown(account):
    counts = {str(d): 0 for d in VALID_DENOMINATIONS}
    for txn in account.transactions.only("transaction_type", "denomination_breakdown"):
        sign = 1 if txn.transaction_type == "deposit" else -1
        for denom, count in txn.denomination_breakdown.items():
            counts[denom] = counts.get(denom, 0) + sign * count
    return counts


def _compute_category_ytd_totals(account):
    start_year, _ = current_fiscal_year()
    lower, upper = fiscal_year_bounds(start_year)
    totals = {}
    type_totals = {"deposit": Decimal("0"), "withdrawal": Decimal("0")}
    qs = account.transactions.filter(created_at__date__gte=lower, created_at__date__lte=upper)
    for txn in qs.only("transaction_type", "category", "amount"):
        sign = 1 if txn.transaction_type == "deposit" else -1
        totals[txn.category] = totals.get(txn.category, Decimal("0")) + sign * txn.amount
        type_totals[txn.transaction_type] += txn.amount
    totals.update(type_totals)
    return totals


class AccountListView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [CanManageAccounts()]
        return [CanViewTreasury()]

    def get(self, request):
        queryset = Account.objects.filter(is_active=True).annotate(
            deposit_total=Coalesce(
                Sum("transactions__amount", filter=Q(transactions__transaction_type="deposit")),
                Decimal("0"),
            ),
            withdrawal_total=Coalesce(
                Sum("transactions__amount", filter=Q(transactions__transaction_type="withdrawal")),
                Decimal("0"),
            ),
            latest_txn=Max("transactions__created_at"),
        ).order_by("-latest_txn")
        serializer = AccountListSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AccountCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.save()
        return Response(AccountListSerializer(account).data, status=status.HTTP_201_CREATED)


class AccountDetailView(APIView):
    permission_classes = [CanViewTreasury]

    def _get_account(self, pk):
        return get_object_or_404(Account, pk=pk, is_active=True)

    def get(self, request, pk):
        account = self._get_account(pk)
        balance = _compute_dollar_balance(account)
        denomination_breakdown = _compute_denomination_breakdown(account)
        category_ytd_totals = _compute_category_ytd_totals(account)
        serializer = AccountDetailSerializer(
            account,
            context={
                "balance": balance,
                "denomination_breakdown": denomination_breakdown,
                "category_ytd_totals": category_ytd_totals,
            },
        )
        return Response(serializer.data)


class TransactionListCreateView(APIView):
    pagination_class = TransactionPagePagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanEditTreasury()]
        return [CanViewTreasury()]

    @property
    def paginator(self):
        if not hasattr(self, "_paginator"):
            self._paginator = self.pagination_class()
        return self._paginator

    def _get_account(self, pk):
        return get_object_or_404(Account, pk=pk, is_active=True)

    ORDERING_FIELDS = {
        "created_at": "created_at",
        "-created_at": "-created_at",
        "amount": "amount",
        "-amount": "-amount",
        "category": "category",
        "-category": "-category",
    }

    def get(self, request, pk):
        account = self._get_account(pk)
        queryset = (
            account.transactions
            .select_related("created_by", "reversal_of")
            .order_by("-created_at")
        )
        txn_types = request.query_params.getlist("transaction_type")
        categories = request.query_params.getlist("category")
        search = request.query_params.get("search", "").strip()
        ordering = request.query_params.get("ordering")

        if txn_types:
            queryset = queryset.filter(transaction_type__in=txn_types)
        if categories:
            queryset = queryset.filter(category__in=categories)
        if search:
            queryset = queryset.filter(
                Q(note__icontains=search)
                | Q(category__icontains=search)
                | Q(created_by__username__icontains=search)
                | Q(amount__icontains=search)
            )
        if ordering in self.ORDERING_FIELDS:
            queryset = queryset.order_by(self.ORDERING_FIELDS[ordering])

        page = self.paginator.paginate_queryset(queryset, request)
        serializer = TransactionListSerializer(page, many=True)
        return self.paginator.get_paginated_response(serializer.data)

    def post(self, request, pk):
        account = self._get_account(pk)
        serializer = TransactionCreateSerializer(
            data=request.data,
            context={"request": request, "account": account},
        )
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save(account=account, created_by=request.user)
        return Response(
            TransactionListSerializer(transaction).data,
            status=status.HTTP_201_CREATED,
        )


class FinancialStatementListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [CanEditTreasury()]
        return [CanViewTreasury()]

    def get(self, request):
        queryset = FinancialStatement.objects.select_related(
            "generated_by", "treasurer_signed_by", "president_signed_by"
        ).order_by("-generated_at")

        fy_start = request.query_params.get("fiscal_year_start")
        if fy_start is not None:
            try:
                fy_start = int(fy_start)
            except ValueError:
                return Response(
                    {"detail": "fiscal_year_start must be an integer year."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            lower, upper = fiscal_year_bounds(fy_start)
            queryset = queryset.filter(period_start__gte=lower, period_start__lte=upper)

        paginator = StatementPagePagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = FinancialStatementSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = FinancialStatementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        statement = serializer.save(generated_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FinancialStatementDetailView(APIView):
    def get_permissions(self):
        if self.request.method == "DELETE":
            return [CanEditTreasury()]
        return [CanViewTreasury()]

    def _get_statement(self, pk):
        return get_object_or_404(
            FinancialStatement.objects.select_related(
                "generated_by", "treasurer_signed_by", "president_signed_by"
            ),
            pk=pk,
        )

    def get(self, request, pk):
        serializer = FinancialStatementSerializer(self._get_statement(pk))
        return Response(serializer.data)

    def delete(self, request, pk):
        self._get_statement(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FinancialStatementSignView(APIView):
    """
    POST /api/treasury/statements/<pk>/treasurer-sign/
    POST /api/treasury/statements/<pk>/president-sign/
    """

    capacity = None  # set by subclasses

    def get_permissions(self):
        return [CanViewTreasury()]

    def _check_capacity_permission(self, user):
        if user.role in ("scouter", "admin"):
            return True
        if self.capacity == "treasurer":
            return user.ec_role == "treasurer"
        if self.capacity == "president":
            return user.ec_role == "president"
        return False

    def post(self, request, pk):
        statement = get_object_or_404(FinancialStatement, pk=pk)

        if not self._check_capacity_permission(request.user):
            return Response(
                {"detail": f"Only the {self.capacity} or an admin/scouter can sign in this capacity."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if self.capacity == "treasurer":
            if statement.treasurer_signed_at is not None:
                return Response(
                    {"detail": "Treasurer has already signed this statement."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            statement.treasurer_signed_at = timezone.now()
            statement.treasurer_signed_by = request.user
            statement.save(update_fields=["treasurer_signed_at", "treasurer_signed_by"])
        else:
            if statement.president_signed_at is not None:
                return Response(
                    {"detail": "President has already signed this statement."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            statement.president_signed_at = timezone.now()
            statement.president_signed_by = request.user
            statement.save(update_fields=["president_signed_at", "president_signed_by"])

        serializer = FinancialStatementSerializer(statement)
        return Response(serializer.data)


class TreasurerSignView(FinancialStatementSignView):
    capacity = "treasurer"


class PresidentSignView(FinancialStatementSignView):
    capacity = "president"


class FiscalYearListView(APIView):
    """
    GET /api/treasury/statements/fiscal-years/

    Summarizes existing FinancialStatements into their Sept-Aug fiscal years,
    always including the current fiscal year (count 0 if empty) so there's
    always a folder to create the first report of a new year in.
    """

    permission_classes = [CanViewTreasury]

    def get(self, request):
        counts = Counter()
        for period_start in FinancialStatement.objects.values_list("period_start", flat=True):
            counts[fiscal_year_for_date(period_start)] += 1

        current = current_fiscal_year()
        if current not in counts:
            counts[current] = 0

        years = sorted(counts.keys(), key=lambda fy: fy[0], reverse=True)
        data = [
            {
                "start_year": start_year,
                "end_year": end_year,
                "label": fiscal_year_label(start_year, end_year),
                "count": counts[(start_year, end_year)],
            }
            for start_year, end_year in years
        ]
        return Response(data)
