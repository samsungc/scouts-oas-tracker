from django.urls import path
from .views import (
    AccountListView,
    AccountDetailView,
    TransactionListCreateView,
    FinancialStatementListCreateView,
    FinancialStatementDetailView,
    FiscalYearListView,
    TreasurerSignView,
    PresidentSignView,
)

urlpatterns = [
    path("accounts/", AccountListView.as_view(), name="treasury-account-list"),
    path("accounts/<int:pk>/", AccountDetailView.as_view(), name="treasury-account-detail"),
    path("accounts/<int:pk>/transactions/", TransactionListCreateView.as_view(), name="treasury-transaction-list-create"),
    path("statements/fiscal-years/", FiscalYearListView.as_view(), name="treasury-statement-fiscal-years"),
    path("statements/", FinancialStatementListCreateView.as_view(), name="treasury-statement-list-create"),
    path("statements/<int:pk>/", FinancialStatementDetailView.as_view(), name="treasury-statement-detail"),
    path("statements/<int:pk>/treasurer-sign/", TreasurerSignView.as_view(), name="treasury-statement-treasurer-sign"),
    path("statements/<int:pk>/president-sign/", PresidentSignView.as_view(), name="treasury-statement-president-sign"),
]
