from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('dietitian', 'Dietitian'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)

    # Use email for login if preferred, or username. We'll support username & email.
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.role})"


class UserProfile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    
    GOAL_CHOICES = (
        ('maintenance', 'Weight Maintenance'),
        ('loss', 'Weight Loss'),
        ('gain', 'Muscle Gain'),
        ('lifestyle', 'Healthy Lifestyle'),
    )

    ACTIVITY_CHOICES = (
        ('sedentary', 'Sedentary (Little or no exercise)'),
        ('lightly_active', 'Lightly Active (1-3 days/week)'),
        ('moderately_active', 'Moderately Active (3-5 days/week)'),
        ('very_active', 'Very Active (6-7 days/week)'),
        ('extra_active', 'Extra Active (Very active job/exercise)'),
    )

    DIET_PREFERENCE_CHOICES = (
        ('anything', 'Anything (No restrictions)'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('keto', 'Ketogenic (Keto)'),
        ('pescatarian', 'Pescatarian'),
    )

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    goal_weight = models.FloatField(null=True, blank=True, help_text="Target goal weight in kg")
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='lifestyle')
    activity_level = models.CharField(max_length=25, choices=ACTIVITY_CHOICES, default='sedentary')
    diet_preference = models.CharField(max_length=20, choices=DIET_PREFERENCE_CHOICES, default='anything')
    
    # Streaks and gamification trackers at profile level
    streak = models.IntegerField(default=0)
    last_active = models.DateField(null=True, blank=True)
    points = models.IntegerField(default=0)
    
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    @property
    def bmi(self):
        if self.height and self.weight:
            height_m = self.height / 100.0
            return round(self.weight / (height_m ** 2), 2)
        return 0.0

    @property
    def bmr(self):
        # Harris-Benedict Equation (Revised)
        if self.weight and self.height and self.age:
            if self.gender == 'male':
                return round(88.362 + (13.397 * self.weight) + (4.799 * self.height) - (5.677 * self.age), 2)
            else:
                return round(447.593 + (9.247 * self.weight) + (3.098 * self.height) - (4.330 * self.age), 2)
        return 0.0

    @property
    def daily_calorie_requirement(self):
        # BMR * Activity Multiplier
        bmr_val = self.bmr
        if bmr_val == 0.0:
            return 0.0
            
        multipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9,
        }
        tdee = bmr_val * multipliers.get(self.activity_level, 1.2)
        
        # Adjust for Goal
        if self.goal == 'loss':
            return round(tdee - 500, 2) # Caloric deficit
        elif self.goal == 'gain':
            return round(tdee + 500, 2) # Caloric surplus
        else:
            return round(tdee, 2)

    def __str__(self):
        return f"Profile of {self.user.username}"
