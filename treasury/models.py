from django.conf import settings
from django.db import models
from django.utils import timezone

VALID_DENOMINATIONS = [10000, 5000, 2000, 1000, 500, 200, 100, 25, 10, 5]


class Account(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ("deposit", "Deposit"),
        ("withdrawal", "Withdrawal"),
    ]

    WITHDRAWAL_CATEGORIES = [
        "camp_expenses",
        "program_expenses",
        "admin_expenses",
        "other",
    ]

    DEPOSIT_CATEGORIES = [
        "registration_fee",
        "dues",
        "camp_fees",
        "program_fees",
        "other",
    ]

    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    category = models.CharField(max_length=30)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    denomination_breakdown = models.JSONField()
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="treasury_transactions",
    )
    created_at = models.DateTimeField(default=timezone.now)
    is_reversal = models.BooleanField(default=False)
    is_opening_balance = models.BooleanField(default=False)
    reversal_of = models.OneToOneField(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reversal",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["account", "-created_at"], name="txn_account_created_idx"),
        ]

    def __str__(self):
        return f"{self.transaction_type} ${self.amount} — {self.account.name} ({self.created_at:%Y-%m-%d})"


class FinancialStatement(models.Model):
    period_start = models.DateField()
    period_end = models.DateField()
    accounts = models.ManyToManyField(
        Account,
        blank=True,
        related_name="statements",
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generated_statements",
    )
    treasurer_signed_at = models.DateTimeField(null=True, blank=True)
    treasurer_signed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="treasurer_signed_statements",
    )
    president_signed_at = models.DateTimeField(null=True, blank=True)
    president_signed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="president_signed_statements",
    )

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"Financial Statement {self.period_start} – {self.period_end}"
