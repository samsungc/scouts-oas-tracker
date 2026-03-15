from .models import BadgeSubmission


def get_peer_reviewable_requirement_ids(scout):
    """
    Return the list of requirement IDs the scout can peer-review.

    A scout can peer-review requirements for badges at level (N-2) in the same
    category as any badge they have fully completed at level N, per the
    Canadian Path n-2 leadership rule.
    """
    from badges.models import Badge

    leveled_badges = Badge.objects.filter(level__isnull=False, is_active=True)
    eligible_req_ids = set()

    for badge in leveled_badges:
        req_ids = list(badge.requirements.values_list('id', flat=True))
        if not req_ids:
            continue

        approved_count = BadgeSubmission.objects.filter(
            scout=scout,
            requirement_id__in=req_ids,
            status='approved',
        ).values('requirement_id').distinct().count()

        if approved_count == len(req_ids):
            peer_level = badge.level - 2
            if peer_level >= 1:
                for peer_badge in leveled_badges.filter(category=badge.category, level=peer_level):
                    eligible_req_ids.update(
                        peer_badge.requirements.values_list('id', flat=True)
                    )

    return list(eligible_req_ids)
