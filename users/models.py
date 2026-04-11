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
