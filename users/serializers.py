from django.contrib.auth import password_validation
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class CaseInsensitiveTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs[self.username_field] = attrs[self.username_field].lower()
        return super().validate(attrs)


class MeSerializer(serializers.ModelSerializer):
    peer_review_eligible = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "last_login",
            "peer_review_eligible",
            "email_notifications",
        ]
        read_only_fields = ["id", "username", "role", "last_login"]

    def get_peer_review_eligible(self, obj):
        if obj.role != 'scout':
            return False
        from submissions.utils import get_peer_reviewable_requirement_ids
        return bool(get_peer_reviewable_requirement_ids(obj))


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


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "first_name", "last_name", "role"]
        read_only_fields = ["id"]

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=1)
    new_password = serializers.CharField(write_only=True)
