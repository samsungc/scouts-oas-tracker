import logging

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from django.core import signing
from django.utils import timezone

from users.models import User

logger = logging.getLogger(__name__)

BATCH_SIZE = getattr(settings, "EMAIL_BURST_BATCH_SIZE", 10)


def _build_unsubscribe_footer(user_pk):
    token = signing.dumps(user_pk, salt="unsubscribe")
    url = f"https://6rhventurers.ca/unsubscribe?token={token}"
    return f"\n\n---\nTo stop receiving these emails: {url}"


def _is_suppressed(email):
    from users.models import EmailSuppression
    return EmailSuppression.objects.filter(email__iexact=email).exists()


def _send_ses(to_addresses, subject, body_text):
    try:
        client = boto3.client("ses", region_name=settings.SES_REGION)
        client.send_email(
            Source=settings.SES_FROM_EMAIL,
            Destination={"ToAddresses": to_addresses},
            Message={
                "Subject": {"Data": subject},
                "Body": {"Text": {"Data": body_text}},
            },
        )
    except (BotoCoreError, ClientError, Exception):
        logger.error("Failed to send email via SES to %s — subject: %s", to_addresses, subject, exc_info=True)


def _send_resend(to_addresses, subject, body_text):
    import resend
    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": to_addresses,
            "subject": subject,
            "text": body_text,
        })
    except Exception:
        logger.error("Failed to send email via Resend to %s — subject: %s", to_addresses, subject, exc_info=True)


def _send_email(to_addresses, subject, body_text):
    if not to_addresses:
        return

    from users.models import SiteSettings
    if SiteSettings.get().emails_paused:
        logger.info("Emails are globally paused — skipping send to %s", to_addresses)
        return

    active = [addr for addr in to_addresses if not _is_suppressed(addr)]
    if not active:
        return

    if getattr(settings, "EMAIL_PROVIDER", "ses") == "resend":
        _send_resend(active, subject, body_text)
    else:
        _send_ses(active, subject, body_text)


def _send_submission_notification(email, submission):
    """Send a single new-submission notification email to one recipient."""
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
        f"{_build_unsubscribe_footer_for_email(email)}"
    )
    _send_email([email], subject, body)


def _build_unsubscribe_footer_for_email(email):
    """Build an unsubscribe footer using the user pk looked up by email."""
    try:
        user = User.objects.get(email__iexact=email, is_active=True)
        return _build_unsubscribe_footer(user.pk)
    except User.DoesNotExist:
        return (
            "\n\n---\n"
            "To stop receiving these emails, log in and update your notification preferences."
        )


def _send_batch_summary(email, submissions):
    """Send a summary email for a batch of queued submissions."""
    if len(submissions) == 1:
        _send_submission_notification(email, submissions[0])
        return

    lines = []
    for sub in submissions:
        scout = sub.scout
        scout_name = f"{scout.first_name} {scout.last_name}".strip() or scout.username
        lines.append(
            f"  - {scout_name} (@{scout.username}): "
            f"{sub.requirement.title} ({sub.requirement.badge.name})"
        )

    subject = f"{len(submissions)} submissions pending review"
    body = (
        f"You have {len(submissions)} new submissions pending review:\n\n"
        + "\n".join(lines)
        + f"\n\nLog in to review them at https://6rhventurers.ca"
        f"{_build_unsubscribe_footer_for_email(email)}"
    )
    _send_email([email], subject, body)


def notify_submission_received(submission):
    """Notify all active scouters/admins when a scout submits a requirement.

    Uses daily burst protection per recipient:
    - First notification of the day is sent immediately.
    - Subsequent ones are queued; a batch summary is sent every BATCH_SIZE notifications.
    - State resets at midnight and on login (see users/views.py).
    """
    from .models import ScouterNotificationState, PendingNotification

    recipients = list(
        User.objects.filter(
            role__in=["scouter", "admin"],
            is_active=True,
            email_notifications=True,
        ).exclude(email="").values_list("email", flat=True)
    )
    if not recipients:
        return

    today = timezone.localdate()

    for email in recipients:
        if _is_suppressed(email):
            continue

        state, _ = ScouterNotificationState.objects.get_or_create(
            email=email,
            defaults={"state_date": today, "first_sent_today": False},
        )

        # New day — discard stale pending and reset
        if state.state_date != today:
            PendingNotification.objects.filter(recipient_email=email, sent=False).delete()
            state.state_date = today
            state.first_sent_today = False
            state.save(update_fields=["state_date", "first_sent_today"])

        if not state.first_sent_today:
            _send_submission_notification(email, submission)
            state.first_sent_today = True
            state.save(update_fields=["first_sent_today"])
        else:
            PendingNotification.objects.get_or_create(
                submission=submission,
                recipient_email=email,
                defaults={"sent": False},
            )

            pending_qs = PendingNotification.objects.filter(
                recipient_email=email,
                sent=False,
            ).select_related(
                "submission__scout",
                "submission__requirement__badge",
            ).order_by("queued_at")

            if pending_qs.count() >= BATCH_SIZE:
                submissions = [pn.submission for pn in pending_qs]
                _send_batch_summary(email, submissions)
                pending_qs.update(sent=True)


def _send_scout_review_single(scout, submission):
    """Send an immediate single review notification to a scout."""
    requirement_title = submission.requirement.title
    badge_name = submission.requirement.badge.name
    scout_first = scout.first_name or scout.username
    reviewer = submission.reviewed_by
    reviewer_name = (
        f"{reviewer.first_name} {reviewer.last_name}".strip() or reviewer.username
        if reviewer else "a scouter"
    )
    footer = _build_unsubscribe_footer(scout.pk)

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
            f"{footer}"
        )
    elif submission.status == "rejected":
        subject = f"Your submission needs revision \u2014 {requirement_title}"
        body = (
            f"Hi {scout_first},\n\n"
            f'Your submission for "{requirement_title}" ({badge_name}) has been returned for revision by {reviewer_name}.\n\n'
            f"Reviewer notes:\n{submission.reviewer_notes}\n\n"
            f"Log in to update and resubmit at https://6rhventurers.ca"
            f"{footer}"
        )
    else:
        return

    _send_email([scout.email], subject, body)


def _send_scout_batch_summary(scout, pending_notifications):
    """Send a grouped batch summary email to a scout for multiple reviewed submissions."""
    if len(pending_notifications) == 1:
        _send_scout_review_single(scout, pending_notifications[0].submission)
        return

    approved = [pn for pn in pending_notifications if pn.status_at_queue == "approved"]
    rejected = [pn for pn in pending_notifications if pn.status_at_queue == "rejected"]

    scout_first = scout.first_name or scout.username
    sections = []

    if approved:
        lines = [f"  - {pn.submission.requirement.title} ({pn.submission.requirement.badge.name})" for pn in approved]
        sections.append(f"Approved ({len(approved)}):\n" + "\n".join(lines))

    if rejected:
        lines = []
        for pn in rejected:
            line = f"  - {pn.submission.requirement.title} ({pn.submission.requirement.badge.name})"
            if pn.submission.reviewer_notes:
                line += f" — Reviewer notes: {pn.submission.reviewer_notes}"
            lines.append(line)
        sections.append(f"Returned for revision ({len(rejected)}):\n" + "\n".join(lines))

    subject = f"Summary of your recent submission reviews ({len(pending_notifications)} updates)"
    body = (
        f"Hi {scout_first},\n\n"
        f"Here's a summary of your recent submission reviews:\n\n"
        + "\n\n".join(sections)
        + f"\n\nLog in to view your progress at https://6rhventurers.ca"
        f"{_build_unsubscribe_footer(scout.pk)}"
    )
    _send_email([scout.email], subject, body)


def notify_submission_reviewed(submission):
    """Notify the scout when their submission is approved or rejected.

    Uses daily burst protection per scout:
    - First notification of the day is sent immediately.
    - Subsequent ones are queued; a batch summary is sent every BATCH_SIZE notifications.
    - State resets at midnight and on login (see users/views.py).
    """
    from .models import ScoutNotificationState, PendingScoutNotification, PendingNotification

    scout = submission.scout
    if not scout.email_notifications or not scout.email:
        return
    if _is_suppressed(scout.email):
        return
    if submission.status not in ("approved", "rejected"):
        return

    # Remove this submission from every scouter's pending queue — it's been reviewed.
    PendingNotification.objects.filter(submission=submission, sent=False).delete()

    today = timezone.localdate()

    state, _ = ScoutNotificationState.objects.get_or_create(
        email=scout.email,
        defaults={"state_date": today, "first_sent_today": False},
    )

    # New day — discard stale pending and reset
    if state.state_date != today:
        PendingScoutNotification.objects.filter(recipient_email=scout.email, sent=False).delete()
        state.state_date = today
        state.first_sent_today = False
        state.save(update_fields=["state_date", "first_sent_today"])

    if not state.first_sent_today:
        _send_scout_review_single(scout, submission)
        state.first_sent_today = True
        state.save(update_fields=["first_sent_today"])
    else:
        PendingScoutNotification.objects.get_or_create(
            submission=submission,
            recipient_email=scout.email,
            defaults={"sent": False, "status_at_queue": submission.status},
        )

        pending_qs = PendingScoutNotification.objects.filter(
            recipient_email=scout.email,
            sent=False,
        ).select_related(
            "submission__requirement__badge",
        ).order_by("queued_at")

        if pending_qs.count() >= BATCH_SIZE:
            _send_scout_batch_summary(scout, list(pending_qs))
            pending_qs.update(sent=True)
