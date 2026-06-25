from django.db import models
from django.conf import settings

class WeightLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weight_logs')
    weight = models.FloatField(help_text="Weight in kg")
    logged_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']
        unique_together = ('user', 'logged_at')

    def __str__(self):
        return f"{self.user.username} - {self.weight} kg on {self.logged_at}"


class WaterLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_logs')
    amount = models.IntegerField(default=0, help_text="Water intake in ml")
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.amount} ml on {self.date}"


class DailyMealCompletion(models.Model):
    MEAL_TYPES = (
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meal_completions')
    date = models.DateField(auto_now_add=True)
    meal_type = models.CharField(max_length=15, choices=MEAL_TYPES)
    completed = models.BooleanField(default=False)
    
    # Snapshot of macros consumed for this meal
    calories = models.FloatField(default=0.0)
    protein = models.FloatField(default=0.0)
    carbs = models.FloatField(default=0.0)
    fats = models.FloatField(default=0.0)
    fiber = models.FloatField(default=0.0)
    sugar = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('user', 'date', 'meal_type')

    def __str__(self):
        status = "Completed" if self.completed else "Pending"
        return f"{self.user.username} - {self.meal_type.capitalize()} on {self.date} - {status}"


class ActivityLog(models.Model):
    ACTIVITY_CHOICES = (
        ('walking', 'Walking'),
        ('running', 'Running'),
        ('cycling', 'Cycling'),
        ('gym', 'Gym Workout'),
        ('other', 'Other Exercise'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_logs')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='walking')
    duration = models.IntegerField(help_text="Duration in minutes")
    calories_burned = models.FloatField(help_text="Calories burned in kcal")
    steps = models.IntegerField(default=0, help_text="Number of steps")
    logged_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']

    def __str__(self):
        return f"{self.user.username} - {self.activity_type.capitalize()} for {self.duration} mins on {self.logged_at}"


class WellnessLog(models.Model):
    MOOD_CHOICES = (
        ('happy', 'Happy 😊'),
        ('neutral', 'Neutral 😐'),
        ('energetic', 'Energetic ⚡'),
        ('tired', 'Tired 😴'),
        ('stressed', 'Stressed 😰'),
        ('sad', 'Sad 😢'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wellness_logs')
    sleep_hours = models.FloatField(default=0.0, help_text="Hours of sleep")
    mood = models.CharField(max_length=15, choices=MOOD_CHOICES, default='neutral')
    energy_level = models.IntegerField(default=5, help_text="Energy level from 1-10")
    stress_level = models.IntegerField(default=5, help_text="Stress level from 1-10")
    logged_at = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']
        unique_together = ('user', 'logged_at')

    def __str__(self):
        return f"{self.user.username} - Sleep: {self.sleep_hours}h, Mood: {self.mood} on {self.logged_at}"


class WeightNote(models.Model):
    """User-added notes alongside weight entries (e.g. 'Started gym')."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weight_notes')
    date = models.DateField()
    note = models.TextField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.note[:40]}"


class BodyMeasurement(models.Model):
    """Track body measurements over time."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='body_measurements')
    date = models.DateField()
    waist_cm = models.FloatField(null=True, blank=True)
    chest_cm = models.FloatField(null=True, blank=True)
    hips_cm = models.FloatField(null=True, blank=True)
    arms_cm = models.FloatField(null=True, blank=True)
    thighs_cm = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - Measurements on {self.date}"
