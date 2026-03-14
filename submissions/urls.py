from rest_framework.routers import DefaultRouter
from .views import BadgeSubmissionViewSet, ReviewSubmissionViewSet, SubmissionEvidenceViewSet

router = DefaultRouter()
router.register(r"submissions", BadgeSubmissionViewSet, basename="submissions")
router.register(r"review/submissions", ReviewSubmissionViewSet, basename="review-submission")
router.register(r"evidence", SubmissionEvidenceViewSet, basename="evidence")

urlpatterns = router.urls