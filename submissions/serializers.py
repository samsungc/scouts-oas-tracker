from rest_framework import serializers
from .models import BadgeSubmission, SubmissionEvidence


class SubmissionEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionEvidence
        fields = [
            "id",
            "text_note",
            "file",
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_at"]


class BadgeSubmissionSerializer(serializers.ModelSerializer):
    evidence = SubmissionEvidenceSerializer(many=True, read_only=True)
    scout_username = serializers.CharField(source="scout.username", read_only=True)

    class Meta:
        model = BadgeSubmission
        fields = [
            "id",
            "scout_username",
            "requirement",
            "status",
            "submitted_at",
            "reviewed_at",
            "reviewer_notes",
            "created_at",
            "updated_at",
            "evidence",
        ]
        read_only_fields = [
            "status",
            "submitted_at",
            "reviewed_at",
            "reviewer_notes",
            "created_at",
            "updated_at",
        ]