from django.urls import path
from .views import BadgeListView, BadgeDetailView, RequirementDetailView, ImportBadgeRecordsView

urlpatterns = [
    path("", BadgeListView.as_view(), name="badge-list"),
    path("import/", ImportBadgeRecordsView.as_view(), name="import-badge-records"),
    path("requirements/<int:pk>/", RequirementDetailView.as_view(), name="requirement-detail"),
    path("<int:pk>/", BadgeDetailView.as_view(), name="badge-detail"),
]