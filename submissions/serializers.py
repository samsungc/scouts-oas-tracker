from rest_framework import serializers
from .models import BadgeSubmission, SubmissionEvidence, BadgeHandout, SubmissionComment
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


class SubmissionCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True, default=None)
    author_display_name = serializers.SerializerMethodField()
    is_edited = serializers.SerializerMethodField()

    class Meta:
        model = SubmissionComment
        fields = ["id", "author_username", "author_display_name", "body", "created_at", "is_edited"]
        read_only_fields = ["id", "author_username", "author_display_name", "created_at", "is_edited"]

    def get_author_display_name(self, obj):
        if not obj.author:
            return "Deleted user"
        full = f"{obj.author.first_name} {obj.author.last_name}".strip()
        return full or obj.author.username

    def get_is_edited(self, obj):
        return (obj.updated_at - obj.created_at).total_seconds() > 1


class ReviewBadgeSubmissionSerializer(BadgeSubmissionSerializer):
    scouter_comments = SubmissionCommentSerializer(many=True, read_only=True)

    class Meta(BadgeSubmissionSerializer.Meta):
        fields = BadgeSubmissionSerializer.Meta.fields + ["scouter_comments"]


class RejectSubmissionSerializer(serializers.Serializer):
    reviewer_notes = serializers.CharField(required=True)


class BadgeHandoutSerializer(serializers.ModelSerializer):
    scout_name = serializers.SerializerMethodField()
    scout_username = serializers.CharField(source="scout.username", read_only=True)
    badge_name = serializers.CharField(source="badge.name", read_only=True)
    badge_category = serializers.CharField(source="badge.category", read_only=True)

    class Meta:
        model = BadgeHandout
        fields = [
            "id",
            "scout_id",
            "scout_name",
            "scout_username",
            "badge_id",
            "badge_name",
            "badge_category",
            "completed_at",
            "handed_out",
            "handed_out_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "scout_id",
            "scout_name",
            "scout_username",
            "badge_id",
            "badge_name",
            "badge_category",
            "completed_at",
            "created_at",
        ]

    def get_scout_name(self, obj):
        full_name = obj.scout.get_full_name()
        return full_name if full_name.strip() else obj.scout.username


class BatchDirectApproveSerializer(serializers.Serializer):
    requirement_id = serializers.IntegerField(required=True)
    scout_ids = serializers.ListField(
        child=serializers.IntegerField(), min_length=1, required=True
    )
    reviewer_notes = serializers.CharField(allow_blank=True, default="")