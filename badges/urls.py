from django.urls import path
from .views import BadgeListView, BadgeDetailView

urlpatterns = [
    path("", BadgeListView.as_view(), name="badge-list"),
    path("<int:pk>/", BadgeDetailView.as_view(), name="badge-detail"),
]