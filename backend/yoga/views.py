from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import date, timedelta
from .models import YogaVideo, YogaLog, UserYogaStats
from .serializers import YogaVideoSerializer, YogaLogSerializer, UserYogaStatsSerializer

class YogaVideoViewSet(viewsets.ModelViewSet):
    queryset = YogaVideo.objects.all()
    serializer_class = YogaVideoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = YogaVideo.objects.all()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        recommended = self.request.query_params.get('recommended', None)

        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(instructor__icontains=search)
            )
        if recommended == 'true' and hasattr(self.request.user, 'profile'):
            goal = self.request.user.profile.goal
            queryset = queryset.filter(recommended_goal=goal)

        return queryset

    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        video = self.get_object()
        user = request.user
        if video.bookmarked_by.filter(id=user.id).exists():
            video.bookmarked_by.remove(user)
            return Response({'status': 'unbookmarked'})
        else:
            video.bookmarked_by.add(user)
            return Response({'status': 'bookmarked'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        video = self.get_object()
        user = request.user
        today = date.today()

        # Check if already logged today to prevent double logging
        already_logged = YogaLog.objects.filter(user=user, video=video, completed_at=today).exists()
        if already_logged:
            return Response({'error': 'You have already completed this session today.'}, status=status.HTTP_400_BAD_REQUEST)

        # Log completion
        log = YogaLog.objects.create(user=user, video=video)

        # Update stats
        stats, created = UserYogaStats.objects.get_or_create(user=user)
        stats.total_sessions += 1

        # Calculate streak
        yesterday = today - timedelta(days=1)
        if stats.last_completed_date == yesterday:
            stats.streak_days += 1
        elif stats.last_completed_date == today:
            # Already completed something else today, streak remains same
            pass
        else:
            # Streak reset/started
            stats.streak_days = 1

        stats.last_completed_date = today
        stats.save()

        # Add XP to user profile if gamification exists
        if hasattr(user, 'profile'):
            user.profile.points += 20
            user.profile.save()

        return Response({
            'status': 'completed',
            'log': YogaLogSerializer(log, context={'request': request}).data,
            'stats': UserYogaStatsSerializer(stats).data
        })

    @action(detail=False, methods=['get'])
    def bookmarked(self, request):
        videos = YogaVideo.objects.filter(bookmarked_by=request.user)
        serializer = self.get_serializer(videos, many=True)
        return Response(serializer.data)

class YogaStatsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        stats, created = UserYogaStats.objects.get_or_create(user=user)
        
        # Get logs of last 30 days
        last_30_days = date.today() - timedelta(days=30)
        logs = YogaLog.objects.filter(user=user, completed_at__gte=last_30_days).order_by('completed_at')
        logs_serializer = YogaLogSerializer(logs, many=True, context={'request': request})

        # Calculate 7-day challenge progress
        challenge_duration = 7
        completed_dates = set(YogaLog.objects.filter(user=user).values_list('completed_at', flat=True))
        
        challenge_progress = 0
        for i in range(challenge_duration):
            check_date = date.today() - timedelta(days=i)
            if check_date in completed_dates:
                challenge_progress += 1
            else:
                break

        return Response({
            'stats': UserYogaStatsSerializer(stats).data,
            'logs': logs_serializer.data,
            'challenge': {
                'title': '7-Day Mindful Yoga Challenge',
                'description': 'Practice yoga every day for 7 consecutive days to build a consistent body-mind habit.',
                'progress_days': challenge_progress,
                'target_days': challenge_duration,
                'is_completed': challenge_progress >= challenge_duration
            }
        })
