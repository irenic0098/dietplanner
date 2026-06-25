from django.contrib import admin
from .models import YogaVideo, YogaLog, UserYogaStats

@admin.register(YogaVideo)
class YogaVideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'instructor', 'difficulty', 'duration_mins', 'calorie_burn']
    list_filter  = ['category', 'difficulty', 'recommended_goal']
    search_fields = ['title', 'instructor']

@admin.register(YogaLog)
class YogaLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'completed_at']
    list_filter  = ['completed_at']

@admin.register(UserYogaStats)
class UserYogaStatsAdmin(admin.ModelAdmin):
    list_display = ['user', 'streak_days', 'total_sessions', 'last_completed_date']
