from django.db import models
from django.conf import settings

class Recipe(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    ingredients = models.TextField(help_text="Separate ingredients with a newline or custom delimiter")
    instructions = models.TextField(help_text="Separate steps with a newline")
    prep_time = models.IntegerField(default=10, help_text="in minutes")
    cook_time = models.IntegerField(default=20, help_text="in minutes")
    image = models.ImageField(upload_to='recipes/', null=True, blank=True)
    video_url = models.CharField(max_length=300, blank=True, null=True, help_text="YouTube embed link")
    
    # Nutrition
    calories = models.FloatField(default=0.0)
    protein = models.FloatField(default=0.0)
    carbs = models.FloatField(default=0.0)
    fats = models.FloatField(default=0.0)
    fiber = models.FloatField(default=0.0)
    
    favorited_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='favorite_recipes',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
