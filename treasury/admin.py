from django.contrib import admin
from .models import Account, FinancialStatement, Transaction


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id", "account", "transaction_type", "category",
        "amount", "created_by", "created_at", "is_opening_balance",
    )
    list_filter = ("transaction_type", "category", "account", "is_opening_balance")
    search_fields = ("note", "created_by__username", "account__name")
    fields = (
        "account", "transaction_type", "category", "amount",
        "denomination_breakdown", "note", "created_at",
        "is_opening_balance", "created_by",
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ("account", "created_by")
        return ("created_by",)


@admin.register(FinancialStatement)
class FinancialStatementAdmin(admin.ModelAdmin):
    list_display = (
        "id", "period_start", "period_end", "generated_by",
        "treasurer_signed_at", "president_signed_at",
    )
    readonly_fields = (
        "generated_at", "generated_by",
        "treasurer_signed_at", "treasurer_signed_by",
        "president_signed_at", "president_signed_by",
    )
