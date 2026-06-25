from django.db import models
from django.conf import settings

class YogaVideo(models.Model):
    CATEGORY_CHOICES = (
        ('weight_loss', 'Weight Loss Yoga'),
        ('weight_gain', 'Weight Gain Yoga'),
        ('belly_fat', 'Belly Fat Reduction Yoga'),
        ('stress_relief', 'Meditation for Stress Relief'),
        ('morning', 'Morning Yoga Routine'),
        ('beginner', 'Beginner Yoga Classes'),
    )
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    title = models.CharField(max_length=200)
    youtube_id = models.CharField(max_length=50, help_text="YouTube Video ID (e.g. dQw4w9WgXcQ)")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    duration_mins = models.IntegerField(default=15)
    instructor = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES, default='beginner')
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    calorie_burn = models.IntegerField(default=100, help_text="Estimated calories burned")
    flexibility = models.CharField(max_length=15, default='Medium', help_text="Flexibility benefit level (Low/Medium/High)")
    relaxation = models.CharField(max_length=15, default='Medium', help_text="Relaxation benefit level (Low/Medium/High)")
    strength = models.CharField(max_length=15, default='Medium', help_text="Strength benefit level (Low/Medium/High)")
    
    recommended_goal = models.CharField(
        max_length=20, 
        choices=(
            ('loss', 'Weight Loss'),
            ('gain', 'Weight Gain'),
            ('lifestyle', 'Fitness/Lifestyle'),
            ('maintenance', 'Stress Management/Maintenance'),
        ),
        default='lifestyle'
    )
    
    bookmarked_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='bookmarked_yoga_videos',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"


class YogaLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='yoga_logs')
    video = models.ForeignKey(YogaVideo, on_delete=models.CASCADE)
    completed_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} completed {self.video.title} on {self.completed_at}"


class UserYogaStats(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='yoga_stats')
    streak_days = models.IntegerField(default=0)
    total_sessions = models.IntegerField(default=0)
    last_completed_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - Streak: {self.streak_days} days, Total: {self.total_sessions}"
