from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import YogaVideoViewSet, YogaStatsViewSet

router = DefaultRouter()
router.register('videos', YogaVideoViewSet, basename='yoga-video')
router.register('stats', YogaStatsViewSet, basename='yoga-stats')

urlpatterns = [
    path('', include(router.urls)),
]
