from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import date, timedelta
from .models import YogaVideo, YogaLog, UserYogaStats
from .serializers import YogaVideoSerializer, YogaLogSerializer, UserYogaStatsSerializer
from .youtube_service import YouTubeSearchService

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

    @action(detail=False, methods=['post'])
    def youtube_interact(self, request):
        """Interact with a YouTube or Dailymotion searched video (bookmark or complete), creating it if necessary."""
        youtube_id = request.data.get('youtube_id')
        action_type = request.data.get('action') # 'bookmark' or 'complete'
        
        if not youtube_id:
            return Response({'error': 'youtube_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not action_type or action_type not in ['bookmark', 'complete']:
            return Response({'error': 'action must be either "bookmark" or "complete"'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Get or create the YogaVideo in the database
        video, created = YogaVideo.objects.get_or_create(
            youtube_id=youtube_id,
            defaults={
                'title': request.data.get('title', 'YouTube Video'),
                'instructor': request.data.get('instructor', 'YouTube'),
                'thumbnail_url': request.data.get('thumbnail_url'),
                'duration_mins': int(request.data.get('duration_mins', 15)),
                'category': request.data.get('category', 'yoga'),
                'difficulty': request.data.get('difficulty', 'beginner'),
                'calorie_burn': int(request.data.get('calorie_burn', 100)),
                'flexibility': request.data.get('flexibility', 'Medium'),
                'relaxation': request.data.get('relaxation', 'Medium'),
                'strength': request.data.get('strength', 'Medium'),
                'video_source': request.data.get('video_source', 'youtube'),
            }
        )
        
        # Now perform the requested action
        user = request.user
        if action_type == 'bookmark':
            if video.bookmarked_by.filter(id=user.id).exists():
                video.bookmarked_by.remove(user)
                return Response({'status': 'unbookmarked', 'video_id': video.id})
            else:
                video.bookmarked_by.add(user)
                return Response({'status': 'bookmarked', 'video_id': video.id})
                
        elif action_type == 'complete':
            today = date.today()
            already_logged = YogaLog.objects.filter(user=user, video=video, completed_at=today).exists()
            if already_logged:
                return Response({'error': 'You have already completed this session today.'}, status=status.HTTP_400_BAD_REQUEST)
                
            log = YogaLog.objects.create(user=user, video=video)
            
            # Update stats
            stats, created_stats = UserYogaStats.objects.get_or_create(user=user)
            stats.total_sessions += 1
            
            yesterday = today - timedelta(days=1)
            if stats.last_completed_date == yesterday:
                stats.streak_days += 1
            elif stats.last_completed_date == today:
                pass
            else:
                stats.streak_days = 1
                
            stats.last_completed_date = today
            stats.save()
            
            if hasattr(user, 'profile'):
                user.profile.points += 20
                user.profile.save()
                
            return Response({
                'status': 'completed',
                'log': YogaLogSerializer(log, context={'request': request}).data,
                'stats': UserYogaStatsSerializer(stats).data,
                'video_id': video.id
            })

    @action(detail=False, methods=['get'])
    def youtube_search(self, request):
        """Search YouTube for yoga and meditation videos with pagination."""
        query    = request.query_params.get('query', '').strip()
        category = request.query_params.get('category', None)
        max_results = int(request.query_params.get('max_results', 20))
        page = int(request.query_params.get('page', 1))

        # Allow category-only searches — build a fallback query from the category
        if not query:
            if category and category != 'all':
                query = category.replace('_', ' ')
            else:
                return Response(
                    {'error': 'Provide a search query or select a category'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            youtube_service = YouTubeSearchService()
            videos = youtube_service.search_videos(query, max_results, category, page)
            return Response({
                'results': videos,
                'page': page,
                'has_more': len(videos) >= max_results,  # If we got a full page, assume more exists
            })
        except Exception as e:
            print(f"YouTube search error: {e}")
            return Response({'results': [], 'page': page, 'has_more': False})



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
