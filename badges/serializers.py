from rest_framework import serializers
from .models import Badge, BadgeRequirement

class BadgeRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BadgeRequirement
        fields = ["id", "title", "description", "hint"]

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