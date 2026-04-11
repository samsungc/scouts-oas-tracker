from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = [
        ("scout", "Scout"),
        ("scouter", "Scouter"),
        ("admin", "Admin"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="scout")
    email_notifications = models.BooleanField(default=True)
