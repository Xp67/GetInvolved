"""
Background scheduler job that auto-concludes events whose date has passed.
"""
from django.utils import timezone
from api.models import Event
import logging

logger = logging.getLogger(__name__)


def conclude_past_events():
    """
    Mark all PUBLISHED events whose date is in the past as CONCLUDED.
    """
    today = timezone.now().date()
    updated = Event.objects.filter(
        status='PUBLISHED',
        date__isnull=False,
        date__lt=today
    ).update(status='CONCLUDED')

    if updated:
        logger.info(f"Auto-concluded {updated} event(s) past their date.")
