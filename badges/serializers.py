from rest_framework import serializers
from .models import Badge, BadgeRequirement

class BadgeRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BadgeRequirement
        fields = ["id", "title", "description", "hint"]

class BadgeRequirementDetailSerializer(serializers.ModelSerializer):
    badge_name = serializers.CharField(source='badge.name', read_only=True)

    class Meta:
        model = BadgeRequirement
        fields = ["id", "title", "description", "hint", "badge_name"]

class BadgeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ["id", "name", "category", "is_active"]

class BadgeDetailSerializer(serializers.ModelSerializer):
    requirements = BadgeRequirementSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Badge
        fields = ["id", "name", "category", "is_active", "requirements"]