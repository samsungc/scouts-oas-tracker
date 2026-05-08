from decimal import Decimal

from django.db.models import Q, Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils import timezone
from .models import Account, FinancialStatement, Transaction, VALID_DENOMINATIONS
from .pagination import TransactionPagePagination
from .permissions import CanEditTreasury, CanViewTreasury
from .serializers import (
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


class AccountListView(generics.ListAPIView):
    serializer_class = AccountListSerializer
    permission_classes = [CanViewTreasury]

    def get_queryset(self):
        return Account.objects.filter(is_active=True).annotate(
            deposit_total=Coalesce(
                Sum("transactions__amount", filter=Q(transactions__transaction_type="deposit")),
                Decimal("0"),
            ),
            withdrawal_total=Coalesce(
                Sum("transactions__amount", filter=Q(transactions__transaction_type="withdrawal")),
                Decimal("0"),
            ),
        )


class AccountDetailView(generics.RetrieveAPIView):
    serializer_class = AccountDetailSerializer
    permission_classes = [CanViewTreasury]
    queryset = Account.objects.filter(is_active=True)

    def retrieve(self, request, *args, **kwargs):
        account = self.get_object()
        balance = _compute_dollar_balance(account)
        denomination_breakdown = _compute_denomination_breakdown(account)
        serializer = self.get_serializer(
            account,
            context={
                **self.get_serializer_context(),
                "balance": balance,
                "denomination_breakdown": denomination_breakdown,
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

    def get(self, request, pk):
        account = self._get_account(pk)
        queryset = (
            account.transactions
            .select_related("created_by", "reversal_of")
            .order_by("-created_at")
        )
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
        ).order_by("-period_end")
        serializer = FinancialStatementSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FinancialStatementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        statement = serializer.save(generated_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FinancialStatementDetailView(generics.RetrieveAPIView):
    serializer_class = FinancialStatementSerializer
    permission_classes = [CanViewTreasury]
    queryset = FinancialStatement.objects.select_related(
        "generated_by", "treasurer_signed_by", "president_signed_by"
    )


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
