from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BadgeViewSet, UserBadgeViewSet, ChallengeViewSet, UserChallengeViewSet, LeaderboardView

router = DefaultRouter()
router.register('badges', BadgeViewSet, basename='badge')
router.register('user-badges', UserBadgeViewSet, basename='userbadge')
router.register('challenges', ChallengeViewSet, basename='challenge')
router.register('user-challenges', UserChallengeViewSet, basename='userchallenge')

urlpatterns = [
    path('', include(router.urls)),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
