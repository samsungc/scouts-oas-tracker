from rest_framework import serializers
from .models import BadgeSubmission, SubmissionEvidence
from badges.serializers import BadgeRequirementDetailSerializer


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

    def validate_file(self, value):
        if value is None:
            return value
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError("File must be 10 MB or smaller.")
        allowed_types = ("image/", "video/", "application/pdf")
        if not any(value.content_type.startswith(t) for t in allowed_types):
            raise serializers.ValidationError("Only photos, videos, and PDFs are allowed.")
        return value


class BadgeSubmissionSerializer(serializers.ModelSerializer):
    evidence = SubmissionEvidenceSerializer(many=True, read_only=True)
    scout_username = serializers.CharField(source="scout.username", read_only=True)
    scout_id = serializers.IntegerField(source="scout.id", read_only=True)
    reviewed_by_username = serializers.CharField(source="reviewed_by.username", read_only=True, default=None)
    requirement_detail = BadgeRequirementDetailSerializer(source="requirement", read_only=True)

    class Meta:
        model = BadgeSubmission
        fields = [
            "id",
            "scout_id",
            "scout_username",
            "requirement",
            "requirement_detail",
            "status",
            "submitted_at",
            "reviewed_at",
            "reviewed_by_username",
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


class RejectSubmissionSerializer(serializers.Serializer):
    reviewer_notes = serializers.CharField(required=True)


class BatchDirectApproveSerializer(serializers.Serializer):
    requirement_id = serializers.IntegerField(required=True)
    scout_ids = serializers.ListField(
        child=serializers.IntegerField(), min_length=1, required=True
    )
    reviewer_notes = serializers.CharField(allow_blank=True, default="")