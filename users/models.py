import hashlib
import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = [
        ("scout", "Scout"),
        ("scouter", "Scouter"),
        ("admin", "Admin"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="scout")
    email_notifications = models.BooleanField(default=True)


class EmailSuppression(models.Model):
    email = models.EmailField(unique=True, db_index=True)
    reason = models.CharField(max_length=20)  # "bounce" or "complaint"
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.email} ({self.reason})"


class SiteSettings(models.Model):
    emails_paused = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
    )
    token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    TOKEN_EXPIRY_HOURS = 1

    class Meta:
        ordering = ["-created_at"]

    @classmethod
    def make_token(cls):
        """Return (raw_token, token_hash). Store the hash; email the raw."""
        raw = secrets.token_urlsafe(32)
        hashed = hashlib.sha256(raw.encode()).hexdigest()
        return raw, hashed

    @classmethod
    def hash_token(cls, raw):
        return hashlib.sha256(raw.encode()).hexdigest()

    def is_valid(self):
        if self.used:
            return False
        return (timezone.now() - self.created_at) <= timedelta(hours=self.TOKEN_EXPIRY_HOURS)


class PendingEmailChange(models.Model):
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="pending_email_change",
    )
    new_email = models.EmailField()
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    EXPIRY_HOURS = 24

    def is_valid(self):
        return (timezone.now() - self.created_at) <= timedelta(hours=self.EXPIRY_HOURS)
