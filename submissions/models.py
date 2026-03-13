from django.conf import settings
from django.db import models
from badges.models import Badge, BadgeRequirement


class BadgeSubmission(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    scout = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="badge_submissions",
    )
    requirement = models.ForeignKey(
        BadgeRequirement,
        on_delete=models.CASCADE,
        related_name="requirement",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewer",
    )
    reviewer_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.scout.username} - {self.requirement.title} ({self.status})"

class SubmissionEvidence(models.Model):
    requirement_submission = models.ForeignKey(
        BadgeSubmission,
        on_delete=models.CASCADE,
        related_name="evidence",
    )
    text_note = models.TextField(blank=True)
    file = models.FileField(
        upload_to="submission_evidence/",
        null=True,
        blank=True,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.requirement_submission}"