from rest_framework import serializers
from .models import Badge, UserBadge, Challenge, UserChallenge
from accounts.serializers import CustomUserSerializer

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    badge_details = BadgeSerializer(source='badge', read_only=True)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'badge_details', 'earned_at']


class ChallengeSerializer(serializers.ModelSerializer):
    badge_reward_details = BadgeSerializer(source='badge_reward', read_only=True)

    class Meta:
        model = Challenge
        fields = '__all__'


class UserChallengeSerializer(serializers.ModelSerializer):
    challenge_details = ChallengeSerializer(source='challenge', read_only=True)

    class Meta:
        model = UserChallenge
        fields = ['id', 'challenge', 'challenge_details', 'joined_at', 'progress_days', 'completed']
        read_only_fields = ['joined_at', 'completed']


class LeaderboardSerializer(serializers.Serializer):
    username = serializers.CharField(source='user.username')
    points = serializers.IntegerField()
    streak = serializers.IntegerField()
    role = serializers.CharField(source='user.role')
