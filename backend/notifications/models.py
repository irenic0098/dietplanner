from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = (
        ('meal_reminder', 'Meal Reminder'),
        ('water_reminder', 'Water Reminder'),
        ('progress_alert', 'Progress Alert'),
        ('achievement', 'Achievement Unlocked'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='progress_alert')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.notification_type})"
