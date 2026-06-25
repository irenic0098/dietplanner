from django.db import models
from django.conf import settings

class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    icon_name = models.CharField(max_length=50, default='Award', help_text="Lucide-react icon name")
    points_reward = models.IntegerField(default=50)

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.username} earned {self.badge.name}"


class Challenge(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration_days = models.IntegerField(default=7)
    points_reward = models.IntegerField(default=100)
    badge_reward = models.ForeignKey(Badge, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title


class UserChallenge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenges')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    joined_at = models.DateField(auto_now_add=True)
    progress_days = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'challenge')

    def __str__(self):
        return f"{self.user.username} - {self.challenge.title} ({self.progress_days}/{self.challenge.duration_days} days)"
