from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, permissions, status, mixins
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import BadgeSubmission, SubmissionEvidence
from .serializers import BadgeSubmissionSerializer, SubmissionEvidenceSerializer, RejectSubmissionSerializer, BatchDirectApproveSerializer
from .permissions import IsScouterOrAdmin
from .utils import get_peer_reviewable_requirement_ids


class BadgeSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = BadgeSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BadgeSubmission.objects.filter(
            scout=self.request.user
        ).select_related("requirement")

    def perform_create(self, serializer):
        serializer.save(scout=self.request.user)
    
    def partial_update(self, request, *args, **kwargs):
        submission = self.get_object()

        if submission.status != "draft":
            return Response(
                {"detail": "Only draft submissions can be edited."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        submission = self.get_object()

        if submission.status != "draft":
            return Response(
                {"detail": "Only draft submissions can be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        submission = self.get_object()

        if submission.status != "draft":
            return Response(
                {"detail": "Only draft submissions can be submitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission.status = "submitted"
        submission.submitted_at = timezone.now()
        submission.save()

        serializer = self.get_serializer(submission)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser],
    )
    def evidence(self, request, pk=None):
        submission = self.get_object()

        serializer = SubmissionEvidenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save(requirement_submission=submission)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReviewPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ReviewSubmissionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = BadgeSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsScouterOrAdmin]
    pagination_class = ReviewPagination

    def get_queryset(self):
        queryset = BadgeSubmission.objects.select_related(
            "scout",
            "requirement",
            "reviewed_by",
        ).prefetch_related("evidence")

        status_param = self.request.query_params.get("status")
        scout_id = self.request.query_params.get("scout_id")
        requirement_id = self.request.query_params.get("requirement_id")

        if status_param:
            queryset = queryset.filter(status=status_param)

        if scout_id:
            queryset = queryset.filter(scout_id=scout_id)

        if requirement_id:
            queryset = queryset.filter(requirement_id=requirement_id)

        days_param = self.request.query_params.get("days")
        if days_param:
            try:
                cutoff = timezone.now() - timedelta(days=int(days_param))
                queryset = queryset.filter(submitted_at__gte=cutoff)
            except ValueError:
                pass

        return queryset.order_by("-submitted_at")

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        submission = self.get_object()

        if submission.status != "submitted":
            return Response(
                {"detail": "Only submitted submissions can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission.status = "approved"
        submission.reviewed_at = timezone.now()
        submission.reviewed_by = request.user
        submission.reviewer_notes = request.data.get("reviewer_notes", "")
        submission.save()

        serializer = self.get_serializer(submission, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="batch_direct_approve")
    def batch_direct_approve(self, request):
        serializer = BatchDirectApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        requirement_id = serializer.validated_data["requirement_id"]
        scout_ids = serializer.validated_data["scout_ids"]
        reviewer_notes = serializer.validated_data["reviewer_notes"]
        now = timezone.now()

        approved_count = 0
        already_approved_count = 0

        for scout_id in scout_ids:
            submission = BadgeSubmission.objects.filter(
                scout_id=scout_id, requirement_id=requirement_id
            ).first()

            if submission is None:
                BadgeSubmission.objects.create(
                    scout_id=scout_id,
                    requirement_id=requirement_id,
                    status="approved",
                    submitted_at=now,
                    reviewed_at=now,
                    reviewed_by=request.user,
                    reviewer_notes=reviewer_notes,
                )
                approved_count += 1
            elif submission.status == "approved":
                already_approved_count += 1
            else:
                submission.status = "approved"
                submission.submitted_at = submission.submitted_at or now
                submission.reviewed_at = now
                submission.reviewed_by = request.user
                submission.reviewer_notes = reviewer_notes
                submission.save()
                approved_count += 1

        return Response(
            {"approved_count": approved_count, "already_approved_count": already_approved_count},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        submission = self.get_object()

        if submission.status != "submitted":
            return Response(
                {"detail": "Only submitted submissions can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action_serializer = RejectSubmissionSerializer(data=request.data)
        action_serializer.is_valid(raise_exception=True)

        submission.status = "rejected"
        submission.reviewed_at = timezone.now()
        submission.reviewed_by = request.user
        submission.reviewer_notes = action_serializer.validated_data["reviewer_notes"]
        submission.save()

        serializer = self.get_serializer(submission, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class PeerReviewViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = BadgeSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        eligible_req_ids = get_peer_reviewable_requirement_ids(self.request.user)

        queryset = BadgeSubmission.objects.filter(
            requirement_id__in=eligible_req_ids,
        ).exclude(
            scout=self.request.user,
        ).select_related(
            "scout",
            "requirement",
            "reviewed_by",
        ).prefetch_related("evidence")

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        else:
            queryset = queryset.filter(status="submitted")

        return queryset.order_by("-submitted_at")

    @action(detail=False, methods=["get"], url_path="eligible_requirements")
    def eligible_requirements(self, request):
        from badges.models import Badge, BadgeRequirement
        eligible_req_ids = get_peer_reviewable_requirement_ids(request.user)
        requirements = BadgeRequirement.objects.filter(
            id__in=eligible_req_ids
        ).select_related("badge").values(
            "id", "title", "badge__id", "badge__name", "badge__category"
        )
        return Response(list(requirements))

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        submission = self.get_object()

        if submission.status != "submitted":
            return Response(
                {"detail": "Only submitted submissions can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission.status = "approved"
        submission.reviewed_at = timezone.now()
        submission.reviewed_by = request.user
        submission.reviewer_notes = request.data.get("reviewer_notes", "")
        submission.save()

        serializer = self.get_serializer(submission, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        submission = self.get_object()

        if submission.status != "submitted":
            return Response(
                {"detail": "Only submitted submissions can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        action_serializer = RejectSubmissionSerializer(data=request.data)
        action_serializer.is_valid(raise_exception=True)

        submission.status = "rejected"
        submission.reviewed_at = timezone.now()
        submission.reviewed_by = request.user
        submission.reviewer_notes = action_serializer.validated_data["reviewer_notes"]
        submission.save()

        serializer = self.get_serializer(submission, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class SubmissionEvidenceViewSet(
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SubmissionEvidence.objects.all()
    serializer_class = SubmissionEvidenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow users to delete their own evidence
        return SubmissionEvidence.objects.filter(
            requirement_submission__scout=self.request.user,
            requirement_submission__status="draft",
        )  