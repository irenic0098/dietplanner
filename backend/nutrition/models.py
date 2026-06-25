from django.db import models
from django.conf import settings

class Food(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='General')
    serving_size = models.CharField(max_length=100, default='100g')
    calories = models.FloatField(default=0.0, help_text="kcal")
    protein = models.FloatField(default=0.0, help_text="grams")
    carbs = models.FloatField(default=0.0, help_text="grams")
    fats = models.FloatField(default=0.0, help_text="grams")
    fiber = models.FloatField(default=0.0, help_text="grams")

    def __str__(self):
        return f"{self.name} ({self.calories} kcal/{self.serving_size})"


class MealPlan(models.Model):
    GOAL_CHOICES = (
        ('maintenance', 'Weight Maintenance'),
        ('loss', 'Weight Loss'),
        ('gain', 'Muscle Gain'),
        ('lifestyle', 'Healthy Lifestyle'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='meal_plans',
        null=True, 
        blank=True,
        help_text="Null for global system templates"
    )
    name = models.CharField(max_length=200)
    is_template = models.BooleanField(default=False)
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='lifestyle')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        prefix = "Template" if self.is_template else "User Plan"
        return f"[{prefix}] {self.name} - Goal: {self.goal}"


class Meal(models.Model):
    MEAL_TYPES = (
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    )
    
    # Can represent a weekday or offset day number for a monthly/weekly template
    DAY_CHOICES = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )

    meal_plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name='meals')
    day_of_week = models.CharField(max_length=15, choices=DAY_CHOICES, default='monday')
    meal_type = models.CharField(max_length=15, choices=MEAL_TYPES, default='breakfast')

    class Meta:
        unique_together = ('meal_plan', 'day_of_week', 'meal_type')

    def __str__(self):
        return f"{self.meal_plan.name} - {self.day_of_week.capitalize()} - {self.meal_type.capitalize()}"


class MealItem(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='items')
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    servings = models.FloatField(default=1.0, help_text="Multiplier of serving_size")

    @property
    def total_calories(self):
        return round(self.food.calories * self.servings, 2)

    @property
    def total_protein(self):
        return round(self.food.protein * self.servings, 2)

    @property
    def total_carbs(self):
        return round(self.food.carbs * self.servings, 2)

    @property
    def total_fats(self):
        return round(self.food.fats * self.servings, 2)

    @property
    def total_fiber(self):
        return round(self.food.fiber * self.servings, 2)

    def __str__(self):
        return f"{self.servings} x {self.food.name} in {self.meal}"
