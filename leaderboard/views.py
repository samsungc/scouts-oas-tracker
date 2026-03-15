from datetime import timedelta, date
from collections import defaultdict

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.models import User
from submissions.models import BadgeSubmission
from badges.models import Badge

RANK_LABELS = [
    (6767, "OAS Master"),
    (5000, "Legendary Scout"),
    (3000, "Good Scout"),
    (2000, "Scout"),
    (1000, "Novice"),
    (0, "Noob"),
]

CATEGORY_LABELS = {
    'vertical_skills': 'Vertical Skills',
    'sailing_skills': 'Sailing Skills',
    'scoutcraft_skills': 'Scoutcraft Skills',
    'camping_skills': 'Camping Skills',
    'trail_skills': 'Trail Skills',
    'winter_skills': 'Winter Skills',
    'paddling_skills': 'Paddling Skills',
    'aquatic_skills': 'Aquatic Skills',
    'emergency_skills': 'Emergency Skills',
    'personal_progression': 'Personal Progression',
}

WINDOW_DELTAS = {
    '24h': timedelta(hours=24),
    '7d': timedelta(days=7),
    '30d': timedelta(days=30),
}


def get_rank_label(points):
    for threshold, label in RANK_LABELS:
        if points >= threshold:
            return label
    return "Noob"


def compute_streak(approved_dates):
    """Given a set of date objects, return (current_streak, longest_streak)."""
    if not approved_dates:
        return 0, 0

    sorted_dates = sorted(approved_dates)
    date_set = set(sorted_dates)
    today = timezone.now().date()

    current = 0
    d = today
    while d in date_set:
        current += 1
        d -= timedelta(days=1)

    longest = 1
    run = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            run += 1
            if run > longest:
                longest = run
        elif sorted_dates[i] != sorted_dates[i - 1]:
            run = 1

    return current, longest


class ActivityLeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        window = request.query_params.get('window', '7d')
        delta = WINDOW_DELTAS.get(window, timedelta(days=7))
        cutoff = timezone.now() - delta

        scouts = (
            User.objects.filter(role='scout')
            .annotate(
                approved_count=Count(
                    'badge_submissions',
                    filter=Q(
                        badge_submissions__status='approved',
                        badge_submissions__reviewed_at__gte=cutoff,
                    ),
                )
            )
            .order_by('-approved_count', 'username')
        )

        entries = []
        rank = 1
        prev_count = None
        rank_counter = 0
        for scout in scouts:
            rank_counter += 1
            if scout.approved_count != prev_count:
                rank = rank_counter
            prev_count = scout.approved_count
            display_name = scout.get_full_name() or scout.username
            entries.append({
                'rank': rank,
                'scout_id': scout.id,
                'scout_display_name': display_name,
                'scout_username': scout.username,
                'approved_count': scout.approved_count,
                'points': scout.approved_count * 10,
            })

        return Response({'window': window, 'entries': entries})


class CategoryChampionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = (
            BadgeSubmission.objects
            .filter(status='approved', requirement__badge__is_active=True)
            .values(
                'scout__id',
                'scout__first_name',
                'scout__last_name',
                'scout__username',
                'requirement__badge__id',
                'requirement__badge__name',
                'requirement__badge__category',
            )
            .annotate(req_count=Count('id'))
            .order_by('requirement__badge__category', '-req_count')
        )

        seen_categories = set()
        champions_map = {}
        for row in rows:
            cat = row['requirement__badge__category']
            if cat not in seen_categories:
                seen_categories.add(cat)
                first = row['scout__first_name'] or ''
                last = row['scout__last_name'] or ''
                full_name = f"{first} {last}".strip() or row['scout__username']
                champions_map[cat] = {
                    'scout_id': row['scout__id'],
                    'scout_display_name': full_name,
                    'badge_name': row['requirement__badge__name'],
                    'approved_req_count': row['req_count'],
                }

        champions = [
            {
                'category': cat_key,
                'category_label': cat_label,
                'champion': champions_map.get(cat_key),
            }
            for cat_key, cat_label in CATEGORY_LABELS.items()
        ]

        return Response({'champions': champions})


class MyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        approved_subs = list(
            BadgeSubmission.objects.filter(scout=user, status='approved')
            .select_related('requirement__badge')
            .order_by('reviewed_at')
        )

        total_approved = len(approved_subs)
        total_submitted = BadgeSubmission.objects.filter(
            scout=user, status='submitted'
        ).count()

        by_category = defaultdict(int)
        approved_req_ids_by_badge = defaultdict(set)
        for sub in approved_subs:
            badge = sub.requirement.badge
            by_category[badge.category] += 1
            approved_req_ids_by_badge[badge.id].add(sub.requirement_id)

        completed_badges = 0
        for badge in Badge.objects.filter(is_active=True).prefetch_related('requirements'):
            all_req_ids = {r.id for r in badge.requirements.all()}
            if all_req_ids and all_req_ids.issubset(
                approved_req_ids_by_badge.get(badge.id, set())
            ):
                completed_badges += 1

        total_points = (total_approved * 10) + (completed_badges * 25)
        rank_label = get_rank_label(total_points)

        approved_dates = {
            sub.reviewed_at.date()
            for sub in approved_subs
            if sub.reviewed_at
        }
        current_streak, longest_streak = compute_streak(approved_dates)

        today = timezone.now().date()
        daily_counts = defaultdict(int)
        for sub in approved_subs:
            if sub.reviewed_at:
                d = sub.reviewed_at.date()
                if (today - d).days <= 29:
                    daily_counts[d] += 1

        recent_activity = [
            {
                'date': (today - timedelta(days=i)).isoformat(),
                'approved_count': daily_counts.get(today - timedelta(days=i), 0),
            }
            for i in range(29, -1, -1)
        ]

        return Response({
            'total_approved': total_approved,
            'total_submitted': total_submitted,
            'completed_badges': completed_badges,
            'total_points': total_points,
            'rank_label': rank_label,
            'current_streak_days': current_streak,
            'longest_streak_days': longest_streak,
            'approved_by_category': dict(by_category),
            'recent_activity': recent_activity,
        })
