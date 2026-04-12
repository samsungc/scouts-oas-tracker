from collections import defaultdict
from datetime import datetime, timedelta, timezone

from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    MeSerializer,
    ChangePasswordSerializer,
    CreateUserSerializer,
    CaseInsensitiveTokenSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)


class CaseInsensitiveTokenView(TokenObtainPairView):
    serializer_class = CaseInsensitiveTokenSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"detail": "Password changed successfully."},
            status=status.HTTP_200_OK
        )

class ScoutListView(generics.ListAPIView):
    """Returns all users with role='scout'. Scouters and admins only."""
    from .serializers import ScoutListSerializer
    serializer_class = ScoutListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        from submissions.permissions import IsScouterOrAdmin
        return [permissions.IsAuthenticated(), IsScouterOrAdmin()]

    def get_queryset(self):
        from .models import User
        return User.objects.filter(role="scout", is_active=True).order_by("username")


class ScoutStatsView(APIView):
    """
    Returns per-scout badge stats and aggregate summary counts.
    Uses 3 lean DB queries instead of serializing all submissions.
    """

    def get_permissions(self):
        from submissions.permissions import IsScouterOrAdmin
        return [permissions.IsAuthenticated(), IsScouterOrAdmin()]

    def get(self, request):
        from django.db.models import Count, Max, Q

        from badges.models import Badge
        from submissions.models import BadgeSubmission

        from .models import User

        # Query 1: active scouts with pending count + last submission date
        scouts = list(
            User.objects.filter(role="scout", is_active=True)
            .annotate(
                pending_review_count=Count(
                    "badge_submissions",
                    filter=Q(badge_submissions__status="submitted"),
                ),
                last_submission_at=Max("badge_submissions__submitted_at"),
            )
            .order_by("username")
        )

        # Query 2: active badges — categorized
        badges = list(
            Badge.objects.filter(is_active=True).prefetch_related("requirements")
        )

        EXCLUDED = {"awards", "personal_progression"}
        regular_badges = [b for b in badges if b.category not in EXCLUDED]
        pp_badges = [b for b in badges if b.category == "personal_progression"]
        kva_badge = next((b for b in badges if b.name == "King's Venturer Award"), None)

        # Regular badge lookups
        req_to_badge = {}
        badge_req_counts = {}
        for badge in regular_badges:
            req_ids = [r.id for r in badge.requirements.all()]
            badge_req_counts[badge.id] = len(req_ids)
            for req_id in req_ids:
                req_to_badge[req_id] = badge.id

        # Personal progression lookups
        pp_badge_level = {b.id: (b.level or 0) for b in pp_badges}
        pp_req_to_badge = {}
        pp_badge_req_counts = {}
        for b in pp_badges:
            req_ids = [r.id for r in b.requirements.all()]
            pp_badge_req_counts[b.id] = len(req_ids)
            for req_id in req_ids:
                pp_req_to_badge[req_id] = b.id

        # KVA lookups
        kva_req_ids = set()
        kva_total = 0
        if kva_badge:
            kva_req_ids = {r.id for r in kva_badge.requirements.all()}
            kva_total = len(kva_req_ids)

        # Query 3: all approved submissions — only lean fields, no evidence/nested data
        approved_subs = BadgeSubmission.objects.filter(
            scout__role="scout",
            scout__is_active=True,
            status="approved",
            requirement__badge__is_active=True,
        ).values("scout_id", "requirement_id", "reviewed_at")

        # Group approved reqs by type
        scout_badge_reqs = defaultdict(lambda: defaultdict(dict))
        scout_pp_reqs = defaultdict(lambda: defaultdict(set))
        scout_kva_reqs = defaultdict(set)

        for sub in approved_subs:
            req_id = sub["requirement_id"]
            scout_id = sub["scout_id"]

            if req_id in kva_req_ids:
                scout_kva_reqs[scout_id].add(req_id)

            pp_badge_id = pp_req_to_badge.get(req_id)
            if pp_badge_id:
                scout_pp_reqs[scout_id][pp_badge_id].add(req_id)

            badge_id = req_to_badge.get(req_id)
            if badge_id:
                scout_badge_reqs[scout_id][badge_id][req_id] = sub["reviewed_at"]

        # Compute per-scout completion counts + aggregate time-window stats
        now = datetime.now(timezone.utc)
        D1, D7, D30 = timedelta(days=1), timedelta(days=7), timedelta(days=30)

        scout_stats = {}
        summary_c24h = summary_c7d = summary_c30d = 0

        all_scout_ids = (
            set(scout_badge_reqs.keys())
            | set(scout_pp_reqs.keys())
            | set(scout_kva_reqs.keys())
        )

        for scout_id in all_scout_ids:
            badges_complete = 0
            for badge_id, reqs_approved in scout_badge_reqs[scout_id].items():
                total_reqs = badge_req_counts.get(badge_id, 0)
                if total_reqs > 0 and len(reqs_approved) == total_reqs:
                    badges_complete += 1
                    completion_time = max(reqs_approved.values())
                    diff = now - completion_time
                    if diff < D1:
                        summary_c24h += 1
                    if diff < D7:
                        summary_c7d += 1
                    if diff < D30:
                        summary_c30d += 1

            pp_level = 0
            for badge_id, req_set in scout_pp_reqs[scout_id].items():
                total = pp_badge_req_counts.get(badge_id, 0)
                if total > 0 and len(req_set) == total:
                    lvl = pp_badge_level.get(badge_id, 0)
                    if lvl > pp_level:
                        pp_level = lvl

            scout_stats[scout_id] = {
                "badges_complete": badges_complete,
                "personal_progression_level": pp_level,
                "kva_requirements_completed": len(scout_kva_reqs[scout_id]),
            }

        scouts_data = [
            {
                "id": s.id,
                "username": s.username,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "last_login": s.last_login,
                "badges_complete": scout_stats.get(s.id, {}).get("badges_complete", 0),
                "personal_progression_level": scout_stats.get(s.id, {}).get("personal_progression_level", 0),
                "kva_requirements_completed": scout_stats.get(s.id, {}).get("kva_requirements_completed", 0),
                "pending_review": s.pending_review_count,
                "last_submission_at": s.last_submission_at,
            }
            for s in scouts
        ]

        return Response(
            {
                "scouts": scouts_data,
                "summary": {
                    "total": len(scouts),
                    "completions_24h": summary_c24h,
                    "completions_7d": summary_c7d,
                    "completions_30d": summary_c30d,
                    "active_badge_count": len(regular_badges),
                    "kva_total": kva_total,
                },
            }
        )


ROLE_HIERARCHY = {"scout": 0, "scouter": 1, "admin": 2}


class CreateUserView(generics.CreateAPIView):
    """Create a new user. Scouters and admins only; can only assign roles <= their own."""
    serializer_class = CreateUserSerializer

    def get_permissions(self):
        from submissions.permissions import IsScouterOrAdmin
        return [permissions.IsAuthenticated(), IsScouterOrAdmin()]

    def perform_create(self, serializer):
        requested_role = serializer.validated_data.get("role", "scout")
        creator_role = self.request.user.role
        if ROLE_HIERARCHY.get(requested_role, 0) > ROLE_HIERARCHY.get(creator_role, 0):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot create a user with a higher role than your own.")
        serializer.save()


class DeactivateUserView(APIView):
    """Set is_active=False for a user. Scouters and admins only."""

    def get_permissions(self):
        from submissions.permissions import IsScouterOrAdmin
        return [permissions.IsAuthenticated(), IsScouterOrAdmin()]

    def patch(self, request, user_id):
        from .models import User
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ROLE_HIERARCHY.get(user.role, 0) > ROLE_HIERARCHY.get(request.user.role, 0):
            return Response(
                {"detail": "You cannot deactivate a user with a higher role than your own."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"detail": "User deactivated successfully."}, status=status.HTTP_200_OK)


_RESET_SENT_MSG = "If that email address is registered, a reset link has been sent."


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": _RESET_SENT_MSG}, status=status.HTTP_200_OK)

        from .models import User
        from .emails import send_password_reset_email
        from .models import PasswordResetToken

        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response({"detail": _RESET_SENT_MSG}, status=status.HTTP_200_OK)

        cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=24)
        if PasswordResetToken.objects.filter(user=user, created_at__gte=cutoff).count() >= 5:
            return Response({"detail": _RESET_SENT_MSG}, status=status.HTTP_200_OK)

        raw_token, token_hash = PasswordResetToken.make_token()
        PasswordResetToken.objects.create(user=user, token_hash=token_hash)
        send_password_reset_email(user, raw_token)

        from leaderboard.models import PasswordResetLog
        PasswordResetLog.objects.get_or_create(user=user, date=timezone.now().date())

        return Response({"detail": _RESET_SENT_MSG}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        raw_token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        from .models import PasswordResetToken

        token_hash = PasswordResetToken.hash_token(raw_token)
        _invalid_msg = "This reset link has expired or has already been used."

        try:
            with transaction.atomic():
                token_obj = PasswordResetToken.objects.select_for_update().get(
                    token_hash=token_hash
                )
                if not token_obj.is_valid():
                    return Response({"detail": _invalid_msg}, status=status.HTTP_400_BAD_REQUEST)

                user = token_obj.user
                try:
                    password_validation.validate_password(new_password, user=user)
                except DjangoValidationError as e:
                    return Response(
                        {"new_password": list(e.messages)},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                user.set_password(new_password)
                user.save(update_fields=["password"])
                token_obj.used = True
                token_obj.save(update_fields=["used"])

        except PasswordResetToken.DoesNotExist:
            return Response({"detail": _invalid_msg}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": "Password reset successful. You can now sign in."},
            status=status.HTTP_200_OK,
        )
