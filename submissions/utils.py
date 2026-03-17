from django.db.models import Count, Q

from .models import BadgeSubmission


def get_peer_reviewable_requirement_ids(scout):
    """
    Return the list of requirement IDs the scout can peer-review.

    A scout can peer-review requirements for badges at level (N-2) in the same
    category as any badge they have fully completed at level N, per the
    Canadian Path n-2 leadership rule.

    Uses 3 bulk queries instead of per-badge loops.
    """
    from badges.models import Badge, BadgeRequirement

    # Query 1: all active leveled badges with their requirement counts
    leveled_badges = list(
        Badge.objects.filter(level__isnull=False, is_active=True)
        .annotate(req_count=Count("requirements"))
        .values("id", "level", "category", "req_count")
    )

    if not leveled_badges:
        return []

    badge_ids = [b["id"] for b in leveled_badges]

    # Query 2: count approved requirements per badge for this scout
    approved_per_badge = dict(
        BadgeSubmission.objects.filter(
            scout=scout,
            status="approved",
            requirement__badge_id__in=badge_ids,
        )
        .values("requirement__badge_id")
        .annotate(approved_count=Count("requirement_id", distinct=True))
        .values_list("requirement__badge_id", "approved_count")
    )

    # Find fully completed badges and their peer-review targets
    peer_badge_ids = set()
    badge_by_id = {b["id"]: b for b in leveled_badges}

    for badge in leveled_badges:
        if badge["req_count"] == 0:
            continue
        if approved_per_badge.get(badge["id"], 0) == badge["req_count"]:
            peer_level = badge["level"] - 2
            if peer_level >= 1:
                for other in leveled_badges:
                    if other["category"] == badge["category"] and other["level"] == peer_level:
                        peer_badge_ids.add(other["id"])

    if not peer_badge_ids:
        return []

    # Query 3: get requirement IDs for the peer-reviewable badges
    return list(
        BadgeRequirement.objects.filter(badge_id__in=peer_badge_ids)
        .values_list("id", flat=True)
    )
