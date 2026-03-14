from django.urls import path
from .views import MeView, ChangePasswordView, ScoutListView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("scouts/", ScoutListView.as_view(), name="scout-list"),
]
