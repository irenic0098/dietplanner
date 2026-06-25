from django.db import models
from django.conf import settings

class Subscription(models.Model):
    PLAN_CHOICES = (
        ('free', 'Free Basic Plan'),
        ('premium', 'Premium Pro Plan'),
        ('dietitian', 'Dietitian Consultation Plan'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    active = models.BooleanField(default=True)
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        status = "Active" if self.active else "Expired"
        return f"{self.user.username} - {self.get_plan_type_display()} ({status})"
