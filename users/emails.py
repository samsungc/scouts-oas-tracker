import logging

from django.conf import settings

from submissions.emails import _send_email

logger = logging.getLogger(__name__)


def send_email_confirmation_email(user, new_email, raw_token):
    confirm_url = f"{settings.FRONTEND_URL}/confirm-email?token={raw_token}"
    subject = "Confirm your new email address"
    body = (
        f"Hi {user.first_name or user.username},\n\n"
        f"You requested to change your OAS Tracker email to {new_email}.\n\n"
        f"Click the link below to confirm. This link expires in 24 hours.\n\n"
        f"{confirm_url}\n\n"
        f"If you didn't request this, you can safely ignore this email.\n\n"
        f"— OAS Badge Tracker"
    )
    try:
        _send_email([new_email], subject, body)
    except Exception:
        logger.exception("Failed to send email confirmation to %s", new_email)
        raise


def send_password_reset_email(user, raw_token):
    from django.core import signing
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    unsubscribe_token = signing.dumps(user.pk, salt="unsubscribe")
    unsubscribe_url = f"https://6rhventurers.ca/unsubscribe?token={unsubscribe_token}"
    subject = "Reset your OAS Tracker password"
    body = (
        f"Hi {user.first_name or user.username},\n\n"
        f"We received a request to reset your OAS Badge Tracker password.\n\n"
        f"Click the link below to choose a new password. "
        f"This link expires in 1 hour and can only be used once.\n\n"
        f"{reset_url}\n\n"
        f"If you didn't request a password reset, you can safely ignore this email.\n\n"
        f"— OAS Badge Tracker"
        f"\n\n---\nTo stop receiving these emails: {unsubscribe_url}"
    )
    try:
        _send_email([user.email], subject, body)
    except Exception:
        logger.exception("Failed to send password reset email to user %s", user.id)
