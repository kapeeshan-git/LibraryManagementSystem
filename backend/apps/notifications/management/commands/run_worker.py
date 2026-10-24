import logging
import time

from django.core.management.base import BaseCommand
from django.db import InterfaceError, OperationalError, connection

from apps.notifications.services import (
    hold_scheduler_lock,
    process_jobs,
    scheduler_tick,
)

log = logging.getLogger("lms.worker")


class Command(BaseCommand):
    help = "Run the background worker: reminder scheduler + email job processor (one process)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--once",
            action="store_true",
            help="Run one scheduler tick and drain due jobs, then exit.",
        )
        parser.add_argument(
            "--interval",
            type=float,
            default=2.0,
            help="Seconds to sleep when idle.",
        )
        parser.add_argument(
            "--scan-every",
            type=int,
            default=30,
            help="Seconds between reminder scans.",
        )

    def handle(
        self, *args, once=False, interval=2.0, scan_every=30, **options
    ):
        self.stdout.write("Worker started. Ctrl+C to stop.")
        last_scan = 0.0
        while True:
            processed = 0
            try:
                if hold_scheduler_lock() and (
                    once or time.monotonic() - last_scan >= scan_every
                ):
                    queued, reaped = scheduler_tick()
                    last_scan = time.monotonic()
                    if queued or reaped:
                        log.info(
                            "Scheduler: queued %s reminder(s), reaped %s stale job(s)",
                            queued,
                            reaped,
                        )
                processed = process_jobs()
                while once and processed:
                    processed = process_jobs()
            except (OperationalError, InterfaceError):
                log.exception("Database problem; reconnecting")
                connection.close()
                time.sleep(5)
            except KeyboardInterrupt:
                break
            if once:
                break
            if not processed:
                try:
                    time.sleep(interval)
                except KeyboardInterrupt:
                    break
        self.stdout.write("Worker stopped.")
