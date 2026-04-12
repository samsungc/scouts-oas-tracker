from django.contrib import admin
from .models import BadgeSubmission, SubmissionEvidence, BadgeHandout, ScouterNotificationState, PendingNotification


@admin.register(BadgeSubmission)
class BadgeSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "scout",
        "requirement",
        "status",
        "submitted_at",
        "reviewed_at",
        "reviewed_by",
    )
    list_filter = ("status", "requirement", "scout")
    search_fields = ("scout__username", "requirement__title", "reviewer_notes")

@admin.register(SubmissionEvidence)
class SubmissionEvidenceAdmin(admin.ModelAdmin):
    list_display = ("requirement_submission", "uploaded_at")
    search_fields = (
        "requirement_submission__scout__username",
        "requirement_submission__requirement__title",
        "text_note",
    )


@admin.register(BadgeHandout)
class BadgeHandoutAdmin(admin.ModelAdmin):
    list_display = ("scout", "badge", "completed_at", "handed_out", "handed_out_at", "created_at")
    list_filter = ("handed_out", "badge")
    search_fields = ("scout__username", "scout__first_name", "scout__last_name", "badge__name")
    readonly_fields = ("completed_at", "created_at")


@admin.register(ScouterNotificationState)
class ScouterNotificationStateAdmin(admin.ModelAdmin):
    list_display = ("email", "state_date", "first_sent_today")
    search_fields = ("email",)


@admin.register(PendingNotification)
class PendingNotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient_email", "submission", "queued_at", "sent")
    list_filter = ("sent",)
    search_fields = ("recipient_email",)
    readonly_fields = ("queued_at",)