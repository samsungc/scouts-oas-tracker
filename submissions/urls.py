from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BadgeSubmissionViewSet, ReviewSubmissionViewSet, SubmissionEvidenceViewSet, PeerReviewViewSet, BadgeHandoutViewSet, SubmissionCommentViewSet

router = DefaultRouter()
router.register(r"submissions", BadgeSubmissionViewSet, basename="submissions")
router.register(r"review/submissions", ReviewSubmissionViewSet, basename="review-submission")
router.register(r"peer-review/submissions", PeerReviewViewSet, basename="peer-review-submission")
router.register(r"evidence", SubmissionEvidenceViewSet, basename="evidence")
router.register(r"handouts", BadgeHandoutViewSet, basename="handouts")

urlpatterns = router.urls + [
    path(
        "review/submissions/<int:submission_pk>/comments/",
        SubmissionCommentViewSet.as_view({"get": "list", "post": "create"}),
        name="submission-comments",
    ),
]