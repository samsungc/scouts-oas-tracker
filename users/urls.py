from django.urls import path
from .views import (
    MeView,
    ChangePasswordView,
    ConfirmEmailChangeView,
    ScoutListView,
    ScoutStatsView,
    CreateUserView,
    DeactivateUserView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UnsubscribeView,
    SESWebhookView,
    SiteSettingsView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("confirm-email/", ConfirmEmailChangeView.as_view(), name="confirm-email"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("scouts/stats/", ScoutStatsView.as_view(), name="scout-stats"),
    path("scouts/", ScoutListView.as_view(), name="scout-list"),
    path("create/", CreateUserView.as_view(), name="create-user"),
    path("<int:user_id>/deactivate/", DeactivateUserView.as_view(), name="deactivate-user"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("unsubscribe/", UnsubscribeView.as_view(), name="unsubscribe"),
    path("ses-webhook/", SESWebhookView.as_view(), name="ses-webhook"),
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
]
