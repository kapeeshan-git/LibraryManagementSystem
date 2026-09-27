from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        DUE_REMINDER = 'DUE_REMINDER', _('Due Date Reminder')
        OVERDUE_ALERT = 'OVERDUE_ALERT', _('Overdue Book Notice')
        HOLD_READY = 'HOLD_READY', _('Hold Available for Pickup')
        HOLD_EXPIRED = 'HOLD_EXPIRED', _('Reservation Hold Expired')
        PAPER_STATUS = 'PAPER_STATUS', _('Research Paper Status Update')
        GENERAL = 'GENERAL', _('General Library Notice')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"
