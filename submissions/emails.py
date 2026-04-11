import logging

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings

from users.models import User

logger = logging.getLogger(__name__)


def _send_ses(to_addresses, subject, body_text):
    if not to_addresses:
        return
    try:
        client = boto3.client(
            "ses",
            region_name=settings.SES_REGION,
        )
        client.send_email(
            Source=settings.SES_FROM_EMAIL,
            Destination={"ToAddresses": list(to_addresses)},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Text": {"Data": body_text}},
            },
        )
    except (BotoCoreError, ClientError, Exception):
        logger.error("Failed to send email to %s — subject: %s", to_addresses, subject, exc_info=True)


def notify_submission_received(submission):
    """Notify all active scouters/admins when a scout submits a requirement."""
    recipients = list(
        User.objects.filter(
            role__in=["scouter", "admin"],
            is_active=True,
            email_notifications=True,
        ).exclude(email="").values_list("email", flat=True)
    )
    if not recipients:
        return

    scout = submission.scout
    scout_name = f"{scout.first_name} {scout.last_name}".strip() or scout.username
    requirement_title = submission.requirement.title
    badge_name = submission.requirement.badge.name

    subject = f"New submission pending review \u2014 {scout_name}: {requirement_title}"
    body = (
        f"{scout_name} has submitted a badge requirement for review.\n\n"
        f"Badge: {badge_name}\n"
        f"Requirement: {requirement_title}\n"
        f"Scout: {scout_name} (@{scout.username})\n\n"
        f"Log in to review it at https://6rhventurers.ca"
    )
    _send_ses(recipients, subject, body)


def notify_submission_reviewed(submission):
    """Notify the scout when their submission is approved or rejected."""
    scout = submission.scout
    if not scout.email_notifications or not scout.email:
        return

    requirement_title = submission.requirement.title
    badge_name = submission.requirement.badge.name
    scout_first = scout.first_name or scout.username
    reviewer = submission.reviewed_by
    reviewer_name = (
        f"{reviewer.first_name} {reviewer.last_name}".strip() or reviewer.username
        if reviewer else "a scouter"
    )

    if submission.status == "approved":
        subject = f"Your submission was approved \u2014 {requirement_title}"
        notes_section = (
            f"\nReviewer notes:\n{submission.reviewer_notes}\n"
            if submission.reviewer_notes else ""
        )
        body = (
            f"Great news, {scout_first}!\n\n"
            f'Your submission for "{requirement_title}" ({badge_name}) has been approved by {reviewer_name}.'
            f"{notes_section}\n\n"
            f"Log in to view your progress at https://6rhventurers.ca"
        )
    elif submission.status == "rejected":
        subject = f"Your submission needs revision \u2014 {requirement_title}"
        body = (
            f"Hi {scout_first},\n\n"
            f'Your submission for "{requirement_title}" ({badge_name}) has been returned for revision by {reviewer_name}.\n\n'
            f"Reviewer notes:\n{submission.reviewer_notes}\n\n"
            f"Log in to update and resubmit at https://6rhventurers.ca"
        )
    else:
        return

    _send_ses([scout.email], subject, body)
