from django.contrib import admin
from .models import BadgeSubmission, SubmissionEvidence


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