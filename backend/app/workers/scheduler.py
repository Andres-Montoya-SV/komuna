"""APScheduler hooks for MVP background processing."""

from __future__ import annotations

import logging
from contextlib import contextmanager

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@contextmanager
def _session_cm():
    from app.db.session import SessionLocal

    factory = SessionLocal()
    db = factory()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def process_queued_scan_job() -> None:
    from app.workers.scan_runner import drain_scan_queue

    try:
        with _session_cm() as db:
            processed = drain_scan_queue(db, limit=15)
            if processed:
                logger.info("scheduler_processed_scans", extra={"count": processed})
    except Exception as e:
        logger.warning("scheduler_scan_processing_failed", extra={"error_type": type(e).__name__})


def enqueue_scheduled_full_scans_job() -> None:
    settings = get_settings()
    if not settings.scheduled_scan_enabled:
        return

    from sqlalchemy import select

    from app.models.domain import Domain
    from app.models.scan import Scan, ScanStatus, ScanType

    try:
        with _session_cm() as db:
            domains = db.execute(select(Domain).where(Domain.verified.is_(True)).limit(50)).scalars().all()
            enqueued = 0
            for domain in domains:
                active_exists = db.execute(
                    select(Scan.id).where(
                        Scan.domain_id == domain.id,
                        Scan.scan_type == ScanType.full,
                        Scan.status.in_([ScanStatus.queued, ScanStatus.running]),
                    ),
                ).first()
                if active_exists is not None:
                    continue

                db.add(
                    Scan(
                        organization_id=domain.organization_id,
                        domain_id=domain.id,
                        scan_type=ScanType.full,
                        status=ScanStatus.queued,
                    ),
                )
                enqueued += 1
            if enqueued:
                logger.info(
                    "scheduler_enqueued_scheduled_full_scans",
                    extra={"enqueued": enqueued},
                )
    except Exception as e:
        logger.warning("scheduler_enqueue_failed", extra={"error_type": type(e).__name__})


def create_scheduler() -> BackgroundScheduler:
    settings = get_settings()
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        process_queued_scan_job,
        trigger="interval",
        seconds=max(5, settings.scan_poll_interval_seconds),
        id="drain-scan-queue",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )

    scheduler.add_job(
        enqueue_scheduled_full_scans_job,
        trigger="interval",
        hours=max(1, settings.scheduled_scan_interval_hours),
        id="enqueue-scheduled-full-scans",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )

    return scheduler
