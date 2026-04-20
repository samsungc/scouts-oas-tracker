from datetime import timedelta, date
from collections import defaultdict

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.models import User
from submissions.models import BadgeSubmission, SubmissionEvent
from badges.models import Badge
from leaderboard.models import UserSpecialAchievement, PasswordResetLog

RANK_LABELS = [
    (6767, "Master"),
    (5000, "Diamond"),
    (3000, "Platinum"),
    (2000, "Gold"),
    (1000, "Silver"),
    (0, "Bronze"),
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

OAS_CATEGORIES = [
    'vertical_skills', 'sailing_skills', 'scoutcraft_skills',
    'camping_skills', 'trail_skills', 'winter_skills',
    'paddling_skills', 'aquatic_skills', 'emergency_skills',
]


def _has_consecutive_days(dates, n):
    if len(dates) < n:
        return False
    sorted_dates = sorted(dates)
    run = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            run += 1
            if run >= n:
                return True
        else:
            run = 1
    return False


def _level_check(level):
    def check(ctx):
        return all(ctx['highest_level_by_category'].get(cat, 0) >= level for cat in OAS_CATEGORIES)
    return check


ACHIEVEMENTS = [
    {
        'id': 'first_submission',
        'name': 'First Steps',
        'description': 'Submit your first requirement',
        'check': lambda ctx: ctx['total_submitted'] >= 1,
    },
    {
        'id': 'first_approval',
        'name': 'Approved!',
        'description': 'Get your first requirement approved',
        'check': lambda ctx: ctx['total_approved'] >= 1,
    },
    {
        'id': 'verified_email',
        'name': 'Verified!',
        'description': 'Have a verified email address on your account',
        'check': lambda ctx: bool(ctx['email']),
    },
    {
        'id': 'week_warrior',
        'name': 'Week Warrior',
        'description': 'Achieve a 7-day submission streak',
        'check': lambda ctx: ctx['longest_streak'] >= 7,
    },
    {
        'id': 'burst_25',
        'name': 'Productive Day',
        'description': 'Submit 25 requirements in a single day that later get approved',
        'check': lambda ctx: ctx['max_approved_in_day'] >= 25,
    },
    {
        'id': 'burst_50',
        'name': 'Power Day',
        'description': 'Submit 50 requirements in a single day that later get approved',
        'check': lambda ctx: ctx['max_approved_in_day'] >= 50,
    },
    {
        'id': 'burst_100',
        'name': 'Legendary Day',
        'description': 'Submit 100 requirements in a single day that later get approved',
        'check': lambda ctx: ctx['max_approved_in_day'] >= 100,
    },
    {
        'id': 'month_of_hustle',
        'name': 'Month of Hustle',
        'description': 'Reach a 30-day submission streak',
        'check': lambda ctx: ctx['longest_streak'] >= 30,
    },
    {
        'id': 'summit_seeker',
        'name': 'Summit Seeker',
        'description': 'Reach level 5 in any OAS category',
        'check': lambda ctx: any(v >= 5 for v in ctx['highest_level_by_category'].values()),
    },
    {
        'id': 'bug_catcher',
        'name': 'Bug Catcher',
        'description': 'Helped fix a bug',
        'check': lambda ctx: 'bug_catcher' in ctx['special_achievement_ids'],
    },
    *[
        {
            'id': f'level_{level}_complete',
            'name': f'Level {level} Complete',
            'description': f'Achieve level {level} in all 9 OAS categories',
            'check': _level_check(level),
        }
        for level in range(1, 4)
    ],
    {
        'id': 'contributer',
        'name': 'Contributer',
        'description': 'Contributed an idea that was implemented on this website',
        'check': lambda ctx: 'contributer' in ctx['special_achievement_ids'],
    },
    {
        'id': 'thankful',
        'name': 'Good Turn Given',
        'description': 'Thanked Scouter Samson!',
        'check': lambda ctx: 'thankful' in ctx['special_achievement_ids'],
    },
    {
        'id': 'badge_bash_2026',
        'name': '2026 Badge Bash Winner',
        'description': 'Highest number of submissions in a 7 day period',
        'check': lambda ctx: 'badge_bash_2026' in ctx['special_achievement_ids'],
    },
    {
        'id': 'mystery_1',
        'name': 'Forgetful',
        'description': 'Used forget password 3 days in a row',
        'mystery': True,
        'check': lambda ctx: _has_consecutive_days(ctx['reset_dates'], 3),
    },
    {
        'id': 'mystery_2',
        'name': 'Who is BP?',
        'description': 'renamed themselves to Baden Powell',
        'mystery': True,
        'check': lambda ctx: ctx['is_baden_powell'] or 'mystery_2' in ctx['special_achievement_ids'],
    },
]


WINDOW_DELTAS = {
    '24h': timedelta(hours=24),
    '7d': timedelta(days=7),
    '30d': timedelta(days=30),
}


def get_rank_label(points):
    for threshold, label in RANK_LABELS:
        if points >= threshold:
            return label
    return "Bronze"


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
            User.objects.filter(role='scout', is_active=True)
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
        from badges.models import Badge

        # Load all active levelled badges, ordered highest level first within each category
        badges = list(
            Badge.objects
            .filter(is_active=True, level__isnull=False)
            .prefetch_related('requirements')
            .order_by('category', '-level')
        )

        # Count approved requirements per (scout, badge)
        approved_counts = (
            BadgeSubmission.objects
            .filter(status='approved', requirement__badge__is_active=True)
            .values('scout_id', 'requirement__badge_id')
            .annotate(approved_req_count=Count('id', distinct=True))
        )
        scout_badge_approved = {
            (r['scout_id'], r['requirement__badge_id']): r['approved_req_count']
            for r in approved_counts
        }

        # Load scouts
        scouts = {s.id: s for s in User.objects.filter(role='scout', is_active=True)}

        # For each badge, collect scouts who have completed it (all reqs approved)
        badge_completions = {}  # badge_id -> [scout_id, ...]
        for badge in badges:
            total_reqs = badge.requirements.count()
            if total_reqs == 0:
                continue
            completers = [
                scout_id
                for scout_id in scouts
                if scout_badge_approved.get((scout_id, badge.id), 0) >= total_reqs
            ]
            if completers:
                badge_completions[badge.id] = completers

        # For each category find the highest level that has at least one completion
        champions = []
        for cat_key, cat_label in CATEGORY_LABELS.items():
            cat_badges = [b for b in badges if b.category == cat_key]  # already sorted -level

            champion_entry = None
            for badge in cat_badges:
                if badge.id in badge_completions:
                    champion_scouts = []
                    for scout_id in badge_completions[badge.id]:
                        s = scouts[scout_id]
                        first = s.first_name or ''
                        last = s.last_name or ''
                        full_name = f"{first} {last}".strip() or s.username
                        champion_scouts.append({
                            'scout_id': scout_id,
                            'scout_display_name': full_name,
                        })
                    champion_entry = {
                        'badge_name': badge.name,
                        'badge_level': badge.level,
                        'scouts': champion_scouts,
                    }
                    break

            champions.append({
                'category': cat_key,
                'category_label': cat_label,
                'champion': champion_entry,
            })

        return Response({'champions': champions})


class StreakLeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scouts = list(User.objects.filter(role='scout', is_active=True))

        # Fetch all (scout_id, date) pairs in one query
        rows = (
            BadgeSubmission.objects
            .filter(scout__role='scout', scout__is_active=True, submitted_at__isnull=False)
            .values('scout_id', 'submitted_at__date')
            .distinct()
        )
        dates_by_scout = defaultdict(set)
        for row in rows:
            dates_by_scout[row['scout_id']].add(row['submitted_at__date'])

        entries = []
        for scout in scouts:
            dates = dates_by_scout.get(scout.id, set())
            current, longest = compute_streak(dates)
            display_name = scout.get_full_name() or scout.username
            entries.append({
                'scout_id': scout.id,
                'scout_display_name': display_name,
                'current_streak': current,
                'longest_streak': longest,
            })

        return Response({'entries': entries})


class PointsLeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Query 1: approved count per scout
        approved_by_scout = {
            r['scout_id']: r['approved_count']
            for r in BadgeSubmission.objects.filter(status='approved')
            .values('scout_id')
            .annotate(approved_count=Count('id'))
        }

        # Query 2: all active badges with requirements
        badges = list(Badge.objects.filter(is_active=True).prefetch_related('requirements'))
        badge_req_counts = {b.id: b.requirements.count() for b in badges}

        # Query 3: approved req count per (scout, badge)
        scout_badge_approved = {
            (r['scout_id'], r['requirement__badge_id']): r['approved_req_count']
            for r in BadgeSubmission.objects.filter(status='approved', requirement__badge__is_active=True)
            .values('scout_id', 'requirement__badge_id')
            .annotate(approved_req_count=Count('id', distinct=True))
        }

        # Compute completed badges per scout
        completed_by_scout = defaultdict(int)
        for badge in badges:
            total_reqs = badge_req_counts[badge.id]
            if total_reqs == 0:
                continue
            for scout_id in approved_by_scout:
                if scout_badge_approved.get((scout_id, badge.id), 0) >= total_reqs:
                    completed_by_scout[scout_id] += 1

        # Build and rank entries
        scouts = {s.id: s for s in User.objects.filter(role='scout', is_active=True)}
        all_scout_ids = set(scouts.keys())
        point_data = []
        for scout_id in all_scout_ids:
            approved = approved_by_scout.get(scout_id, 0)
            completed = completed_by_scout.get(scout_id, 0)
            total_points = approved * 10 + completed * 25
            s = scouts[scout_id]
            point_data.append({
                'scout_id': scout_id,
                'scout_display_name': s.get_full_name() or s.username,
                'total_approved': approved,
                'completed_badges': completed,
                'total_points': total_points,
                'rank_label': get_rank_label(total_points),
            })

        point_data.sort(key=lambda x: (-x['total_points'], x['scout_display_name']))

        entries = []
        rank = 1
        prev_pts = None
        rank_counter = 0
        for entry in point_data:
            rank_counter += 1
            if entry['total_points'] != prev_pts:
                rank = rank_counter
            prev_pts = entry['total_points']
            entries.append({'rank': rank, **entry})

        return Response({'entries': entries})



class MyAchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # --- Current user context ---
        total_submitted = BadgeSubmission.objects.filter(scout=user).count()
        total_approved = BadgeSubmission.objects.filter(scout=user, status='approved').count()

        daily = (
            BadgeSubmission.objects
            .filter(scout=user, status='approved', submitted_at__isnull=False)
            .exclude(requirement__badge__category='personal_progression')
            .values('submitted_at__date')
            .annotate(count=Count('id'))
        )
        max_approved_in_day = max((r['count'] for r in daily), default=0)

        submitted_dates = set(
            BadgeSubmission.objects
            .filter(scout=user, submitted_at__isnull=False)
            .values_list('submitted_at__date', flat=True)
        )
        _, longest_streak = compute_streak(submitted_dates)

        approved_subs = list(
            BadgeSubmission.objects
            .filter(scout=user, status='approved')
            .select_related('requirement__badge')
        )
        approved_reqs_by_badge = defaultdict(set)
        for sub in approved_subs:
            approved_reqs_by_badge[sub.requirement.badge_id].add(sub.requirement_id)

        oas_badges = list(
            Badge.objects
            .filter(is_active=True, level__isnull=False, category__in=OAS_CATEGORIES)
            .prefetch_related('requirements')
        )
        highest_level_by_category = defaultdict(int)
        for badge in oas_badges:
            all_req_ids = {r.id for r in badge.requirements.all()}
            if all_req_ids and all_req_ids.issubset(approved_reqs_by_badge.get(badge.id, set())):
                if badge.level > highest_level_by_category[badge.category]:
                    highest_level_by_category[badge.category] = badge.level

        special_achievement_ids = set(
            UserSpecialAchievement.objects
            .filter(user=user)
            .values_list('achievement_id', flat=True)
        )

        reset_dates = set(
            PasswordResetLog.objects
            .filter(user=user)
            .values_list('date', flat=True)
        )

        my_ctx = {
            'total_submitted': total_submitted,
            'total_approved': total_approved,
            'max_approved_in_day': max_approved_in_day,
            'longest_streak': longest_streak,
            'highest_level_by_category': highest_level_by_category,
            'special_achievement_ids': special_achievement_ids,
            'reset_dates': reset_dates,
            'is_baden_powell': user.get_full_name().strip().lower() == 'baden powell',
            'email': user.email,
        }

        if my_ctx['is_baden_powell']:
            UserSpecialAchievement.objects.get_or_create(user=user, achievement_id='mystery_2')
            special_achievement_ids.add('mystery_2')

        # --- All-scouts context (bulk queries for percent_holding) ---
        scout_ids = list(User.objects.filter(role='scout', is_active=True).values_list('id', flat=True))
        total_scouts = len(scout_ids)

        submitted_by_scout = defaultdict(int)
        for r in BadgeSubmission.objects.filter(scout_id__in=scout_ids).values('scout_id').annotate(c=Count('id')):
            submitted_by_scout[r['scout_id']] = r['c']

        approved_by_scout = defaultdict(int)
        for r in BadgeSubmission.objects.filter(scout_id__in=scout_ids, status='approved').values('scout_id').annotate(c=Count('id')):
            approved_by_scout[r['scout_id']] = r['c']

        max_in_day_by_scout = defaultdict(int)
        for r in (
            BadgeSubmission.objects
            .filter(scout_id__in=scout_ids, status='approved', submitted_at__isnull=False)
            .values('scout_id', 'submitted_at__date')
            .annotate(c=Count('id'))
        ):
            sid = r['scout_id']
            if r['c'] > max_in_day_by_scout[sid]:
                max_in_day_by_scout[sid] = r['c']

        date_rows = (
            BadgeSubmission.objects
            .filter(scout_id__in=scout_ids, submitted_at__isnull=False)
            .values('scout_id', 'submitted_at__date')
            .distinct()
        )
        dates_by_scout = defaultdict(set)
        for row in date_rows:
            dates_by_scout[row['scout_id']].add(row['submitted_at__date'])
        longest_streak_by_scout = {
            sid: compute_streak(dates_by_scout.get(sid, set()))[1]
            for sid in scout_ids
        }

        scout_badge_approved = {
            (r['scout_id'], r['requirement__badge_id']): r['c']
            for r in BadgeSubmission.objects.filter(
                scout_id__in=scout_ids,
                status='approved',
                requirement__badge__category__in=OAS_CATEGORIES,
                requirement__badge__is_active=True,
            ).values('scout_id', 'requirement__badge_id').annotate(c=Count('id', distinct=True))
        }
        oas_badge_req_counts = {b.id: b.requirements.count() for b in oas_badges}
        highest_level_by_scout = defaultdict(lambda: defaultdict(int))
        for badge in oas_badges:
            total_reqs = oas_badge_req_counts[badge.id]
            if total_reqs == 0:
                continue
            for sid in scout_ids:
                if scout_badge_approved.get((sid, badge.id), 0) >= total_reqs:
                    if badge.level > highest_level_by_scout[sid][badge.category]:
                        highest_level_by_scout[sid][badge.category] = badge.level

        special_ids_by_scout = defaultdict(set)
        for r in UserSpecialAchievement.objects.filter(user_id__in=scout_ids).values('user_id', 'achievement_id'):
            special_ids_by_scout[r['user_id']].add(r['achievement_id'])

        reset_dates_by_scout = defaultdict(set)
        for r in PasswordResetLog.objects.filter(user_id__in=scout_ids).values('user_id', 'date'):
            reset_dates_by_scout[r['user_id']].add(r['date'])

        scout_name_map = {
            s.id: s.get_full_name().strip().lower()
            for s in User.objects.filter(id__in=scout_ids).only('id', 'first_name', 'last_name')
        }

        email_by_scout = {
            s['id']: s['email']
            for s in User.objects.filter(id__in=scout_ids).values('id', 'email')
        }

        def scout_ctx(sid):
            return {
                'total_submitted': submitted_by_scout[sid],
                'total_approved': approved_by_scout[sid],
                'max_approved_in_day': max_in_day_by_scout[sid],
                'longest_streak': longest_streak_by_scout.get(sid, 0),
                'highest_level_by_category': highest_level_by_scout[sid],
                'special_achievement_ids': special_ids_by_scout[sid],
                'reset_dates': reset_dates_by_scout[sid],
                'is_baden_powell': scout_name_map.get(sid, '') == 'baden powell',
                'email': email_by_scout.get(sid, ''),
            }

        achievements = []
        for a in ACHIEVEMENTS:
            is_mystery = a.get('mystery', False)
            unlocked = a['check'](my_ctx)
            unlocked_count = sum(1 for sid in scout_ids if a['check'](scout_ctx(sid)))
            pct = round(unlocked_count / total_scouts * 100) if total_scouts else 0
            achievements.append({
                'id': a['id'],
                'name': a['name'],
                'description': '? mystery ?' if is_mystery else a['description'],
                'mystery': is_mystery,
                'unlocked': unlocked,
                'percent_holding': pct,
            })

        return Response({'achievements': achievements})


class AchievementScoutsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, achievement_id):
        achievement = next((a for a in ACHIEVEMENTS if a['id'] == achievement_id), None)
        if achievement is None:
            return Response({'detail': 'Achievement not found.'}, status=404)

        # Bulk queries for all active scouts
        scouts_qs = list(
            User.objects.filter(role='scout', is_active=True).only('id', 'first_name', 'last_name', 'email')
        )
        scout_ids = [s.id for s in scouts_qs]

        submitted_by_scout = defaultdict(int)
        for r in BadgeSubmission.objects.filter(scout_id__in=scout_ids).values('scout_id').annotate(c=Count('id')):
            submitted_by_scout[r['scout_id']] = r['c']

        approved_by_scout = defaultdict(int)
        for r in BadgeSubmission.objects.filter(scout_id__in=scout_ids, status='approved').values('scout_id').annotate(c=Count('id')):
            approved_by_scout[r['scout_id']] = r['c']

        max_in_day_by_scout = defaultdict(int)
        for r in (
            BadgeSubmission.objects
            .filter(scout_id__in=scout_ids, status='approved', submitted_at__isnull=False)
            .values('scout_id', 'submitted_at__date')
            .annotate(c=Count('id'))
        ):
            sid = r['scout_id']
            if r['c'] > max_in_day_by_scout[sid]:
                max_in_day_by_scout[sid] = r['c']

        date_rows = (
            BadgeSubmission.objects
            .filter(scout_id__in=scout_ids, submitted_at__isnull=False)
            .values('scout_id', 'submitted_at__date')
            .distinct()
        )
        dates_by_scout = defaultdict(set)
        for row in date_rows:
            dates_by_scout[row['scout_id']].add(row['submitted_at__date'])
        longest_streak_by_scout = {
            sid: compute_streak(dates_by_scout.get(sid, set()))[1]
            for sid in scout_ids
        }

        oas_badges = list(
            Badge.objects
            .filter(is_active=True, level__isnull=False, category__in=OAS_CATEGORIES)
            .prefetch_related('requirements')
        )
        scout_badge_approved = {
            (r['scout_id'], r['requirement__badge_id']): r['c']
            for r in BadgeSubmission.objects.filter(
                scout_id__in=scout_ids,
                status='approved',
                requirement__badge__category__in=OAS_CATEGORIES,
                requirement__badge__is_active=True,
            ).values('scout_id', 'requirement__badge_id').annotate(c=Count('id', distinct=True))
        }
        oas_badge_req_counts = {b.id: b.requirements.count() for b in oas_badges}
        highest_level_by_scout = defaultdict(lambda: defaultdict(int))
        for badge in oas_badges:
            total_reqs = oas_badge_req_counts[badge.id]
            if total_reqs == 0:
                continue
            for sid in scout_ids:
                if scout_badge_approved.get((sid, badge.id), 0) >= total_reqs:
                    if badge.level > highest_level_by_scout[sid][badge.category]:
                        highest_level_by_scout[sid][badge.category] = badge.level

        special_ids_by_scout = defaultdict(set)
        for r in UserSpecialAchievement.objects.filter(user_id__in=scout_ids).values('user_id', 'achievement_id'):
            special_ids_by_scout[r['user_id']].add(r['achievement_id'])

        reset_dates_by_scout = defaultdict(set)
        for r in PasswordResetLog.objects.filter(user_id__in=scout_ids).values('user_id', 'date'):
            reset_dates_by_scout[r['user_id']].add(r['date'])

        scout_name_map = {s.id: s.get_full_name().strip().lower() for s in scouts_qs}
        email_by_scout = {s.id: s.email for s in scouts_qs}

        def scout_ctx(sid):
            return {
                'total_submitted': submitted_by_scout[sid],
                'total_approved': approved_by_scout[sid],
                'max_approved_in_day': max_in_day_by_scout[sid],
                'longest_streak': longest_streak_by_scout.get(sid, 0),
                'highest_level_by_category': highest_level_by_scout[sid],
                'special_achievement_ids': special_ids_by_scout[sid],
                'reset_dates': reset_dates_by_scout[sid],
                'is_baden_powell': scout_name_map.get(sid, '') == 'baden powell',
                'email': email_by_scout.get(sid, ''),
            }

        scout_obj_map = {s.id: s for s in scouts_qs}
        earners = sorted(
            [scout_obj_map[sid] for sid in scout_ids if achievement['check'](scout_ctx(sid))],
            key=lambda s: (s.first_name.lower(), s.last_name.lower()),
        )

        return Response({
            'achievement_name': achievement['name'],
            'scouts': [
                {'id': s.id, 'first_name': s.first_name, 'last_name': s.last_name}
                for s in earners
            ],
        })


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
        personal_progression_level = 0
        personal_progression_name = None
        for badge in Badge.objects.filter(is_active=True).prefetch_related('requirements'):
            all_req_ids = {r.id for r in badge.requirements.all()}
            if not all_req_ids:
                continue
            if all_req_ids.issubset(approved_req_ids_by_badge.get(badge.id, set())):
                if badge.category == 'personal_progression':
                    lvl = badge.level or 0
                    if lvl > personal_progression_level:
                        personal_progression_level = lvl
                        personal_progression_name = badge.name
                elif badge.category != 'awards':
                    completed_badges += 1

        total_points = (total_approved * 10) + (completed_badges * 25)
        rank_label = get_rank_label(total_points)

        submitted_dates = set(
            BadgeSubmission.objects.filter(scout=user, submitted_at__isnull=False)
            .values_list('submitted_at__date', flat=True)
        )
        current_streak, longest_streak = compute_streak(submitted_dates)

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
            'personal_progression_level': personal_progression_level,
            'personal_progression_name': personal_progression_name,
            'total_points': total_points,
            'rank_label': rank_label,
            'current_streak_days': current_streak,
            'longest_streak_days': longest_streak,
            'approved_by_category': dict(by_category),
            'recent_activity': recent_activity,
        })


class ActivityFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        events = (
            SubmissionEvent.objects
            .select_related(
                'submission__scout',
                'submission__requirement',
                'submission__requirement__badge',
            )
            .order_by('-occurred_at')[:100]
        )
        feed = []
        for evt in events:
            sub = evt.submission
            scout = sub.scout
            display_name = f"{scout.first_name} {scout.last_name}".strip() or scout.username
            feed.append({
                'id': evt.id,
                'scout_name': display_name,
                'badge_name': sub.requirement.badge.name,
                'requirement_title': sub.requirement.title,
                'status': evt.event_type,
                'event_time': evt.occurred_at,
            })
        return Response({'feed': feed})
