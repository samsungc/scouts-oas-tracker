from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


@receiver(post_save, sender="submissions.BadgeSubmission")
def check_badge_completion(sender, instance, **kwargs):
    if instance.status != "approved":
        return

    badge = instance.requirement.badge
    scout = instance.scout

    requirement_ids = set(
        badge.requirements.values_list("id", flat=True)
    )
    if not requirement_ids:
        return

    approved_req_ids = set(
        sender.objects.filter(
            scout=scout,
            requirement__badge=badge,
            status="approved",
        ).values_list("requirement_id", flat=True)
    )

    if requirement_ids <= approved_req_ids:
        from .models import BadgeHandout
        from .emails import notify_badge_completed
        completed_at = instance.reviewed_at or timezone.now()
        handout, created = BadgeHandout.objects.get_or_create(
            scout=scout,
            badge=badge,
            defaults={"completed_at": completed_at},
        )
        if created:
            notify_badge_completed(handout)


@receiver(post_save, sender="submissions.BadgeSubmission")
def record_submission_event(sender, instance, created, **kwargs):
    from .models import SubmissionEvent

    update_fields = kwargs.get("update_fields")
    if not created and update_fields is not None and "status" not in update_fields:
        return

    if instance.status == "submitted":
        SubmissionEvent.objects.create(
            submission=instance,
            event_type="submitted",
            actor=instance.scout,
            occurred_at=instance.submitted_at or instance.updated_at,
        )
    elif instance.status in ("approved", "rejected"):
        SubmissionEvent.objects.create(
            submission=instance,
            event_type=instance.status,
            actor=instance.reviewed_by,
            occurred_at=instance.reviewed_at or instance.updated_at,
        )
