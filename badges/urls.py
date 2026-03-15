from django.urls import path
from .views import BadgeListView, BadgeDetailView, RequirementDetailView

urlpatterns = [
    path("", BadgeListView.as_view(), name="badge-list"),
    path("requirements/<int:pk>/", RequirementDetailView.as_view(), name="requirement-detail"),
    path("<int:pk>/", BadgeDetailView.as_view(), name="badge-detail"),
]