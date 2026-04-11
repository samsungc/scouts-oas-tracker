import logging

from django.conf import settings

from submissions.emails import _send_ses

logger = logging.getLogger(__name__)


def send_password_reset_email(user, raw_token):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    subject = "Reset your OAS Tracker password"
    body = (
        f"Hi {user.first_name or user.username},\n\n"
        f"We received a request to reset your OAS Badge Tracker password.\n\n"
        f"Click the link below to choose a new password. "
        f"This link expires in 1 hour and can only be used once.\n\n"
        f"{reset_url}\n\n"
        f"If you didn't request a password reset, you can safely ignore this email.\n\n"
        f"— OAS Badge Tracker"
    )
    try:
        _send_ses([user.email], subject, body)
    except Exception:
        logger.exception("Failed to send password reset email to user %s", user.id)
