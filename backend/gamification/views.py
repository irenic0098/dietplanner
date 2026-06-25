from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import Badge, UserBadge, Challenge, UserChallenge
from accounts.models import UserProfile
from .serializers import (
    BadgeSerializer, 
    UserBadgeSerializer, 
    ChallengeSerializer, 
    UserChallengeSerializer,
    LeaderboardSerializer
)

class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)


class ChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserChallengeViewSet(viewsets.ModelViewSet):
    serializer_class = UserChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserChallenge.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        challenge_id = self.request.data.get('challenge')
        # Check if already joined
        existing = UserChallenge.objects.filter(user=self.request.user, challenge_id=challenge_id).first()
        if existing:
            return Response({'error': 'You already joined this challenge.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def log_progress(self, request, pk=None):
        user_challenge = self.get_object()
        if user_challenge.completed:
            return Response({'message': 'Challenge already completed!'})
            
        user_challenge.progress_days += 1
        
        # Check if complete
        if user_challenge.progress_days >= user_challenge.challenge.duration_days:
            user_challenge.completed = True
            user_challenge.progress_days = user_challenge.challenge.duration_days
            
            # Award points to user profile
            profile = request.user.profile
            profile.points += user_challenge.challenge.points_reward
            profile.save()
            
            # Award badge if one exists for this challenge
            if user_challenge.challenge.badge_reward:
                UserBadge.objects.get_or_create(
                    user=request.user, 
                    badge=user_challenge.challenge.badge_reward
                )
                
        user_challenge.save()
        return Response(UserChallengeSerializer(user_challenge).data)


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Sort users by points desc
        profiles = UserProfile.objects.all().order_by('-points')[:20] # Top 20
        serializer = LeaderboardSerializer(profiles, many=True)
        return Response(serializer.data)
