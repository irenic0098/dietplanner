from rest_framework import serializers
from .models import Food, MealPlan, Meal, MealItem

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = '__all__'


class MealItemSerializer(serializers.ModelSerializer):
    food_detail = FoodSerializer(source='food', read_only=True)
    total_calories = serializers.ReadOnlyField()
    total_protein = serializers.ReadOnlyField()
    total_carbs = serializers.ReadOnlyField()
    total_fats = serializers.ReadOnlyField()
    total_fiber = serializers.ReadOnlyField()

    class Meta:
        model = MealItem
        fields = [
            'id', 'meal', 'food', 'food_detail', 'servings', 
            'total_calories', 'total_protein', 'total_carbs', 
            'total_fats', 'total_fiber'
        ]


class MealSerializer(serializers.ModelSerializer):
    items = MealItemSerializer(many=True, read_only=True)
    total_calories = serializers.SerializerMethodField()
    total_protein = serializers.SerializerMethodField()
    total_carbs = serializers.SerializerMethodField()
    total_fats = serializers.SerializerMethodField()
    total_fiber = serializers.SerializerMethodField()

    class Meta:
        model = Meal
        fields = [
            'id', 'meal_plan', 'day_of_week', 'meal_type', 'items',
            'total_calories', 'total_protein', 'total_carbs', 
            'total_fats', 'total_fiber'
        ]

    def get_total_calories(self, obj):
        return round(sum(item.total_calories for item in obj.items.all()), 2)

    def get_total_protein(self, obj):
        return round(sum(item.total_protein for item in obj.items.all()), 2)

    def get_total_carbs(self, obj):
        return round(sum(item.total_carbs for item in obj.items.all()), 2)

    def get_total_fats(self, obj):
        return round(sum(item.total_fats for item in obj.items.all()), 2)

    def get_total_fiber(self, obj):
        return round(sum(item.total_fiber for item in obj.items.all()), 2)


class MealPlanSerializer(serializers.ModelSerializer):
    meals = MealSerializer(many=True, read_only=True)
    
    class Meta:
        model = MealPlan
        fields = ['id', 'user', 'name', 'is_template', 'goal', 'description', 'meals', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
