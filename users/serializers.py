from django.contrib.auth import password_validation
from rest_framework import serializers
from .models import User


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
        ]
        read_only_fields = ["id", "username", "role"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        user = self.context["request"].user
        password_validation.validate_password(value, user=user)
        return value

class ScoutListSerializer(serializers.ModelSerializer):
    """Minimal scout profile returned to scouters/admins."""
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "last_login"]
        read_only_fields = ["id", "username", "first_name", "last_name", "last_login"]
