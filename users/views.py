from collections import defaultdict
from datetime import datetime, timedelta, timezone

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MeSerializer, ChangePasswordSerializer, CreateUserSerializer


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
        return User.objects.filter(role="scout").order_by("username")


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

        # Query 1: scouts with pending count + last submission date
        scouts = list(
            User.objects.filter(role="scout")
            .annotate(
                pending_review_count=Count(
                    "badge_submissions",
                    filter=Q(badge_submissions__status="submitted"),
                ),
                last_submission_at=Max("badge_submissions__submitted_at"),
            )
            .order_by("username")
        )

        # Query 2: active badges and their requirement IDs
        badges = list(
            Badge.objects.filter(is_active=True).prefetch_related("requirements")
        )
        req_to_badge = {}
        badge_req_counts = {}
        for badge in badges:
            req_ids = [r.id for r in badge.requirements.all()]
            badge_req_counts[badge.id] = len(req_ids)
            for req_id in req_ids:
                req_to_badge[req_id] = badge.id

        # Query 3: all approved submissions — only lean fields, no evidence/nested data
        approved_subs = BadgeSubmission.objects.filter(
            scout__role="scout",
            status="approved",
            requirement__badge__is_active=True,
        ).values("scout_id", "requirement_id", "reviewed_at")

        # Group approved reqs by (scout_id, badge_id)
        scout_badge_reqs = defaultdict(lambda: defaultdict(dict))
        for sub in approved_subs:
            badge_id = req_to_badge.get(sub["requirement_id"])
            if badge_id:
                scout_badge_reqs[sub["scout_id"]][badge_id][sub["requirement_id"]] = sub[
                    "reviewed_at"
                ]

        # Compute per-scout completion counts + aggregate time-window stats
        now = datetime.now(timezone.utc)
        D1, D7, D30 = timedelta(days=1), timedelta(days=7), timedelta(days=30)

        scout_stats = {}
        summary_c24h = summary_c7d = summary_c30d = 0

        for scout_id, badge_dict in scout_badge_reqs.items():
            badges_complete = 0
            for badge_id, reqs_approved in badge_dict.items():
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
            scout_stats[scout_id] = badges_complete

        scouts_data = [
            {
                "id": s.id,
                "username": s.username,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "last_login": s.last_login,
                "badges_complete": scout_stats.get(s.id, 0),
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
                    "active_badge_count": len(badges),
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
