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

    class Meta:
        unique_together = [("scout", "requirement")]
        indexes = [
            models.Index(fields=["scout", "status"], name="sub_scout_status_idx"),
            models.Index(fields=["scout", "requirement", "status"], name="sub_scout_req_status_idx"),
        ]

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


class BadgeHandout(models.Model):
    scout = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="handouts",
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name="handouts",
    )
    completed_at = models.DateTimeField()
    handed_out = models.BooleanField(default=False)
    handed_out_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("scout", "badge")]
        ordering = ["-completed_at"]

    def __str__(self):
        status = "handed out" if self.handed_out else "pending"
        return f"{self.scout.username} - {self.badge.name} ({status})"


class ScouterNotificationState(models.Model):
    """Tracks per-day burst-protection state for each scouter/admin email address."""
    email = models.EmailField(unique=True, db_index=True)
    state_date = models.DateField()
    first_sent_today = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.email} ({self.state_date}, first_sent={self.first_sent_today})"


class PendingNotification(models.Model):
    """Queued new-submission notifications waiting to be included in the next batch."""
    submission = models.ForeignKey(
        BadgeSubmission,
        on_delete=models.CASCADE,
        related_name="pending_notifications",
    )
    recipient_email = models.EmailField(db_index=True)
    queued_at = models.DateTimeField(auto_now_add=True)
    sent = models.BooleanField(default=False, db_index=True)

    class Meta:
        unique_together = [("submission", "recipient_email")]
        indexes = [
            models.Index(fields=["recipient_email", "sent"], name="pn_email_sent_idx"),
        ]

    def __str__(self):
        return f"Pending for {self.recipient_email} — submission {self.submission_id}"


class ScoutNotificationState(models.Model):
    """Tracks per-day burst-protection state for each scout email address."""
    email = models.EmailField(unique=True, db_index=True)
    state_date = models.DateField()
    first_sent_today = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.email} ({self.state_date}, first_sent={self.first_sent_today})"


class PendingScoutNotification(models.Model):
    """Queued review notifications for scouts waiting to be included in the next batch."""
    submission = models.ForeignKey(
        BadgeSubmission,
        on_delete=models.CASCADE,
        related_name="pending_scout_notifications",
    )
    recipient_email = models.EmailField(db_index=True)
    status_at_queue = models.CharField(max_length=20)  # "approved" or "rejected"
    queued_at = models.DateTimeField(auto_now_add=True)
    sent = models.BooleanField(default=False, db_index=True)

    class Meta:
        unique_together = [("submission", "recipient_email")]
        indexes = [
            models.Index(fields=["recipient_email", "sent"], name="psn_email_sent_idx"),
        ]

    def __str__(self):
        return f"Pending scout notif for {self.recipient_email} — submission {self.submission_id}"