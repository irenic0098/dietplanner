from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WeightLogViewSet,
    WaterLogViewSet,
    DailyMealCompletionViewSet,
    TodaySummaryView,
    ActivityLogViewSet,
    WellnessLogViewSet,
    WeightNoteViewSet,
    BodyMeasurementViewSet,
    WeightStatsView,
    AdminWeightInsightsView,
)

router = DefaultRouter()
router.register('weight', WeightLogViewSet, basename='weight')
router.register('water', WaterLogViewSet, basename='water')
router.register('meal-completions', DailyMealCompletionViewSet, basename='meal-completion')
router.register('activity', ActivityLogViewSet, basename='activity')
router.register('wellness', WellnessLogViewSet, basename='wellness')
router.register('today-summary', TodaySummaryView, basename='today-summary')
router.register('weight-notes', WeightNoteViewSet, basename='weight-notes')
router.register('body-measurements', BodyMeasurementViewSet, basename='body-measurements')
router.register('weight-stats', WeightStatsView, basename='weight-stats')
router.register('admin-weight-insights', AdminWeightInsightsView, basename='admin-weight-insights')

urlpatterns = [
    path('', include(router.urls)),
]
