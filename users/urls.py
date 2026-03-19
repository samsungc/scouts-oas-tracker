from django.urls import path
from .views import MeView, ChangePasswordView, ScoutListView, ScoutStatsView, CreateUserView, DeactivateUserView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("scouts/stats/", ScoutStatsView.as_view(), name="scout-stats"),
    path("scouts/", ScoutListView.as_view(), name="scout-list"),
    path("create/", CreateUserView.as_view(), name="create-user"),
    path("<int:user_id>/deactivate/", DeactivateUserView.as_view(), name="deactivate-user"),
]
