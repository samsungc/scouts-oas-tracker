import datetime

from django.utils import timezone

# Keep this in sync with ec-frontend/src/utils/fiscalYear.js
FISCAL_YEAR_START_MONTH = 9


def fiscal_year_for_date(d):
    """Given a date/datetime, return (start_year, end_year) for the Sept 1 - Aug 31 fiscal year."""
    if isinstance(d, datetime.datetime):
        d = d.date()
    if d.month >= FISCAL_YEAR_START_MONTH:
        return (d.year, d.year + 1)
    return (d.year - 1, d.year)


def fiscal_year_label(start_year, end_year):
    return f"{start_year}-{end_year}"


def fiscal_year_bounds(start_year):
    """Return (period_start_lower_bound, period_start_upper_bound), inclusive."""
    return (
        datetime.date(start_year, FISCAL_YEAR_START_MONTH, 1),
        datetime.date(start_year + 1, FISCAL_YEAR_START_MONTH, 1) - datetime.timedelta(days=1),
    )


def current_fiscal_year():
    return fiscal_year_for_date(timezone.now().date())
