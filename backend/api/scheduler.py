"""
APScheduler configuration for GetInvolved backend.
Starts automatically when Django is ready.
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)


def start():
    from api.jobs import conclude_past_events

    scheduler.add_job(
        conclude_past_events,
        trigger=IntervalTrigger(minutes=30),
        id="conclude_past_events",
        max_instances=1,
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started – conclude_past_events runs every 30 min.")
