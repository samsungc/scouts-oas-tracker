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
        "amount", "created_by", "created_at", "is_reversal", "reversal_of",
    )
    list_filter = ("transaction_type", "category", "account", "is_reversal")
    search_fields = ("note", "created_by__username", "account__name")

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return [f.name for f in self.model._meta.get_fields() if hasattr(f, "name")]
        return ("created_at", "created_by", "account")


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
