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
        completed_at = instance.reviewed_at or timezone.now()
        BadgeHandout.objects.get_or_create(
            scout=scout,
            badge=badge,
            defaults={"completed_at": completed_at},
        )
