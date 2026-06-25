from rest_framework import serializers
from .models import Recipe

class RecipeSerializer(serializers.ModelSerializer):
    is_favorite = serializers.SerializerMethodField()
    favorites_count = serializers.IntegerField(source='favorited_by.count', read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'ingredients', 'instructions', 
            'prep_time', 'cook_time', 'image', 'video_url', 
            'calories', 'protein', 'carbs', 'fats', 'fiber', 
            'is_favorite', 'favorites_count', 'created_at'
        ]

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.favorited_by.filter(id=user.id).exists()
        return False
