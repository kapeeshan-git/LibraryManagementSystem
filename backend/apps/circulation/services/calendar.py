"""Due dates, closed days and fine arithmetic (guide 9.3, 9.4)."""
from datetime import datetime, timedelta
from decimal import Decimal

from django.conf import settings

from apps.core.clock import COLOMBO

from ..models import ClosedDay


def closed_days_between(start, end):
    return set(
        ClosedDay.objects.filter(day__gte=start, day__lte=end).values_list(
            "day", flat=True
        )
    )


def weekly_closed():
    return set(settings.LIBRARY_CLOSED_WEEKDAYS)


def due_date(issued_local_date, period_days, closed, weekly):
    d = issued_local_date + timedelta(days=period_days)
    for _ in range(366):
        if d not in closed and d.weekday() not in weekly:
            return d
        d += timedelta(days=1)
    return d


def compute_due_at(issued_at, period_days, return_end):
    start = issued_at.astimezone(COLOMBO).date() + timedelta(days=period_days)
    closed = closed_days_between(start, start + timedelta(days=366))
    d = due_date(
        issued_at.astimezone(COLOMBO).date(),
        period_days,
        closed,
        weekly_closed(),
    )
    return datetime.combine(d, return_end, tzinfo=COLOMBO)


def fine_days(
    due_at, returned_at, closed, weekly, grace=timedelta(0), count_closed=False
):
    if returned_at <= due_at + grace:
        return 0
    start = due_at.astimezone(COLOMBO).date()
    end = returned_at.astimezone(COLOMBO).date()
    days = 0
    d = start + timedelta(days=1)
    while d <= end:
        if count_closed or not (d in closed or d.weekday() in weekly):
            days += 1
        d += timedelta(days=1)
    return max(days, 1)


def compute_fine(due_at, returned_at, rate):
    start = due_at.astimezone(COLOMBO).date()
    end = returned_at.astimezone(COLOMBO).date()
    days = fine_days(
        due_at,
        returned_at,
        closed_days_between(start, end),
        weekly_closed(),
        grace=timedelta(minutes=settings.GRACE_MINUTES),
        count_closed=settings.COUNT_CLOSED_DAYS_IN_FINES,
    )
    return days, (Decimal(rate) * days).quantize(Decimal("0.01"))
