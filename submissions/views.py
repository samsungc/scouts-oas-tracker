from django.utils import timezone
from rest_framework import viewsets, permissions, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import BadgeSubmission, SubmissionEvidence
from .serializers import BadgeSubmissionSerializer, SubmissionEvidenceSerializer
from .permissions import IsScouterOrAdmin


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


class ReviewSubmissionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = BadgeSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsScouterOrAdmin]

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

        return queryset.order_by("-created_at")

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