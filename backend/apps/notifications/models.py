from django.conf import settings
from django.db import models


class Job(models.Model):
    """Table-backed job queue: no broker needed (guide 9.6)."""

    class Status(models.TextChoices):
        PENDING = "PENDING"
        RUNNING = "RUNNING"
        DONE = "DONE"
        FAILED = "FAILED"

    type = models.CharField(max_length=40)
    payload = models.JSONField(default=dict)
    run_at = models.DateTimeField()
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    attempts = models.PositiveSmallIntegerField(default=0)
    locked_at = models.DateTimeField(null=True, blank=True)
    error_category = models.CharField(max_length=40, blank=True)
    last_error = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["status", "run_at"])]
        ordering = ["-id"]


class Notification(models.Model):
    class Status(models.TextChoices):
        QUEUED = "QUEUED"
        SENT = "SENT"
        FAILED = "FAILED"
        CANCELLED = "CANCELLED"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    template_id = models.CharField(max_length=40)
    channel = models.CharField(max_length=10, default="EMAIL")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.QUEUED
    )
    attempts = models.PositiveSmallIntegerField(default=0)
    dedupe_key = models.CharField(max_length=191, unique=True)
    related_type = models.CharField(max_length=30, blank=True)
    related_id = models.BigIntegerField(null=True, blank=True)
    subject = models.CharField(max_length=300)
    body = models.TextField()
    created_at = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    error_category = models.CharField(max_length=40, blank=True)

    class Meta:
        ordering = ["-id"]
