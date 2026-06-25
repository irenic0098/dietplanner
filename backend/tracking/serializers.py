from rest_framework import serializers
from .models import WeightLog, WaterLog, DailyMealCompletion, ActivityLog, WellnessLog, WeightNote, BodyMeasurement

class WeightLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = ['id', 'user', 'weight', 'logged_at']
        read_only_fields = ['user', 'logged_at']


class WaterLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterLog
        fields = ['id', 'user', 'amount', 'date']
        read_only_fields = ['user', 'date']


class DailyMealCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMealCompletion
        fields = ['id', 'user', 'date', 'meal_type', 'completed', 'calories', 'protein', 'carbs', 'fats', 'fiber', 'sugar']
        read_only_fields = ['user', 'date']


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'activity_type', 'duration', 'calories_burned', 'steps', 'logged_at']
        read_only_fields = ['user', 'logged_at']


class WellnessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessLog
        fields = ['id', 'user', 'sleep_hours', 'mood', 'energy_level', 'stress_level', 'logged_at']
        read_only_fields = ['user', 'logged_at']


class WeightNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightNote
        fields = ['id', 'user', 'date', 'note', 'created_at']
        read_only_fields = ['user', 'created_at']


class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = ['id', 'user', 'date', 'waist_cm', 'chest_cm', 'hips_cm', 'arms_cm', 'thighs_cm', 'created_at']
        read_only_fields = ['user', 'created_at']
