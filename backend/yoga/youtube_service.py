import os
import requests
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings


class YouTubeSearchService:
    """Service for searching YouTube videos related to yoga and meditation."""
    
    def __init__(self):
        self.api_key = os.getenv('YOUTUBE_API_KEY')
        self.use_api = self.api_key and self.api_key != 'YOUR_REAL_YOUTUBE_API_KEY_HERE'
        
        if self.use_api:
            try:
                self.youtube = build('youtube', 'v3', developerKey=self.api_key)
            except Exception as e:
                print(f"Failed to initialize YouTube API client: {e}")
                self.use_api = False
    
    def search_videos(self, query, max_results=20, category=None):
        """
        Search for YouTube videos related to yoga and meditation.
        
        Args:
            query (str): Search query
            max_results (int): Maximum number of results to return (default: 20)
            category (str): Optional category filter (yoga, meditation, etc.)
        
        Returns:
            list: List of video dictionaries with video details
        """
        # Try YouTube API first if available
        if self.use_api:
            try:
                return self._search_with_api(query, max_results, category)
            except Exception as e:
                print(f"YouTube API search failed: {e}, falling back to sample videos")
        
        # Fallback to sample videos
        return self._get_sample_videos(query, category, max_results)
    
    def _search_with_api(self, query, max_results, category):
        """Search using YouTube Data API."""
        search_query = self._build_search_query(query, category)
        
        search_response = self.youtube.search().list(
            q=search_query,
            part='id,snippet',
            maxResults=max_results,
            type='video',
            order='relevance',
            videoDuration='medium',
            relevanceLanguage='en'
        ).execute()
        
        video_ids = [item['id']['videoId'] for item in search_response['items']]
        
        videos_response = self.youtube.videos().list(
            part='id,snippet,contentDetails,statistics',
            id=','.join(video_ids)
        ).execute()
        
        return [self._format_video_data(video, category) for video in videos_response['items']]
    
    def _get_sample_videos(self, query, category, max_results):
        """Return curated sample yoga/meditation videos when API is unavailable."""
        sample_videos = self._get_curated_videos()
        
        # Filter by category if specified
        if category and category != 'all':
            filtered = [v for v in sample_videos if v.get('category') == category]
            if filtered:
                sample_videos = filtered
        
        # Filter by query if provided
        if query and query.strip():
            query_lower = query.lower()
            filtered = [v for v in sample_videos if 
                        query_lower in v['title'].lower() or 
                        query_lower in v.get('description', '').lower()]
            if filtered:
                sample_videos = filtered
        
        return sample_videos[:max_results]
    
    def _get_curated_videos(self):
        """Return a curated list of popular yoga and meditation videos."""
        return [
            {
                'youtube_id': 'v7AYKMP6rOE',
                'title': '20 Minute Morning Yoga Flow for Energy',
                'instructor': 'Yoga with Adriene',
                'thumbnail_url': 'https://img.youtube.com/vi/v7AYKMP6rOE/hqdefault.jpg',
                'duration_mins': 20,
                'category': 'morning',
                'difficulty': 'beginner',
                'calorie_burn': 100,
                'flexibility': 'High',
                'relaxation': 'Medium',
                'strength': 'Medium',
                'view_count': 15000000,
                'published_at': '2020-01-01',
                'description': 'Start your day with this energizing 20-minute morning yoga flow.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'inpok4MKVLM',
                'title': 'Yoga for Weight Loss - 40 Minute Fat Burning Workout',
                'instructor': 'Yoga with Tim',
                'thumbnail_url': 'https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg',
                'duration_mins': 40,
                'category': 'weight_loss',
                'difficulty': 'intermediate',
                'calorie_burn': 320,
                'flexibility': 'High',
                'relaxation': 'Low',
                'strength': 'High',
                'view_count': 8500000,
                'published_at': '2020-01-01',
                'description': 'A challenging 40-minute yoga workout designed for weight loss and fat burning.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'es3s0-XrL-I',
                'title': '10 Minute Guided Meditation for Stress Relief',
                'instructor': 'Great Meditation',
                'thumbnail_url': 'https://img.youtube.com/vi/es3s0-XrL-I/hqdefault.jpg',
                'duration_mins': 10,
                'category': 'stress_relief',
                'difficulty': 'beginner',
                'calorie_burn': 30,
                'flexibility': 'Low',
                'relaxation': 'High',
                'strength': 'Low',
                'view_count': 25000000,
                'published_at': '2020-01-01',
                'description': 'A quick 10-minute guided meditation to help relieve stress and anxiety.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'mRE8gIqZ_qw',
                'title': 'Yoga for Complete Beginners - 20 Minute Routine',
                'instructor': 'Yoga with Adriene',
                'thumbnail_url': 'https://img.youtube.com/vi/mRE8gIqZ_qw/hqdefault.jpg',
                'duration_mins': 20,
                'category': 'beginner',
                'difficulty': 'beginner',
                'calorie_burn': 80,
                'flexibility': 'Medium',
                'relaxation': 'Medium',
                'strength': 'Low',
                'view_count': 30000000,
                'published_at': '2020-01-01',
                'description': 'Perfect for beginners! Learn the basics of yoga with this 20-minute routine.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'k_S9z9MnJd0',
                'title': 'Power Yoga for Strength - 30 Minute Workout',
                'instructor': 'Boho Beautiful',
                'thumbnail_url': 'https://img.youtube.com/vi/k_S9z9MnJd0/hqdefault.jpg',
                'duration_mins': 30,
                'category': 'weight_gain',
                'difficulty': 'advanced',
                'calorie_burn': 250,
                'flexibility': 'Medium',
                'relaxation': 'Low',
                'strength': 'High',
                'view_count': 5000000,
                'published_at': '2020-01-01',
                'description': 'Build strength and muscle with this intense 30-minute power yoga session.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'TTF3zZ4gKjY',
                'title': 'Yoga for Belly Fat Reduction - 25 Minute Core Workout',
                'instructor': 'Yoga with Kassandra',
                'thumbnail_url': 'https://img.youtube.com/vi/TTF3zZ4gKjY/hqdefault.jpg',
                'duration_mins': 25,
                'category': 'belly_fat',
                'difficulty': 'intermediate',
                'calorie_burn': 200,
                'flexibility': 'Medium',
                'relaxation': 'Low',
                'strength': 'High',
                'view_count': 7000000,
                'published_at': '2020-01-01',
                'description': 'Target belly fat with this focused 25-minute core yoga workout.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'ish4VDr1eQs',
                'title': '15 Minute Evening Yoga for Relaxation',
                'instructor': 'Yoga with Bird',
                'thumbnail_url': 'https://img.youtube.com/vi/ish4VDr1eQs/hqdefault.jpg',
                'duration_mins': 15,
                'category': 'stress_relief',
                'difficulty': 'beginner',
                'calorie_burn': 60,
                'flexibility': 'Medium',
                'relaxation': 'High',
                'strength': 'Low',
                'view_count': 12000000,
                'published_at': '2020-01-01',
                'description': 'Wind down your day with this relaxing 15-minute evening yoga routine.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'sTANio_2E0Q',
                'title': 'Morning Yoga Stretch - 15 Minute Wake Up Routine',
                'instructor': 'PsycheTruth',
                'thumbnail_url': 'https://img.youtube.com/vi/sTANio_2E0Q/hqdefault.jpg',
                'duration_mins': 15,
                'category': 'morning',
                'difficulty': 'beginner',
                'calorie_burn': 70,
                'flexibility': 'High',
                'relaxation': 'Medium',
                'strength': 'Low',
                'view_count': 9000000,
                'published_at': '2020-01-01',
                'description': 'Wake up your body with this gentle 15-minute morning yoga stretch.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'R1lW6kIaXk0',
                'title': 'Deep Meditation for Anxiety - 20 Minute Guided Session',
                'instructor': 'Michael Sealey',
                'thumbnail_url': 'https://img.youtube.com/vi/R1lW6kIaXk0/hqdefault.jpg',
                'duration_mins': 20,
                'category': 'stress_relief',
                'difficulty': 'beginner',
                'calorie_burn': 20,
                'flexibility': 'Low',
                'relaxation': 'High',
                'strength': 'Low',
                'view_count': 18000000,
                'published_at': '2020-01-01',
                'description': 'A deep 20-minute guided meditation to help reduce anxiety and promote calm.',
                'is_from_youtube': True
            },
            {
                'youtube_id': 'v7AYKMP6rOE',
                'title': 'Full Body Yoga Flow - 30 Minute All Levels',
                'instructor': 'Yoga with Adriene',
                'thumbnail_url': 'https://img.youtube.com/vi/v7AYKMP6rOE/hqdefault.jpg',
                'duration_mins': 30,
                'category': 'yoga',
                'difficulty': 'intermediate',
                'calorie_burn': 180,
                'flexibility': 'High',
                'relaxation': 'Medium',
                'strength': 'Medium',
                'view_count': 20000000,
                'published_at': '2020-01-01',
                'description': 'A complete 30-minute full body yoga flow suitable for all levels.',
                'is_from_youtube': True
            }
        ]
    
    def _build_search_query(self, query, category=None):
        """Build search query with yoga/meditation context."""
        # Define category-specific keywords
        category_keywords = {
            'weight_loss': 'yoga for weight loss fat burn',
            'weight_gain': 'yoga strength building muscle',
            'belly_fat': 'yoga for belly fat stomach',
            'stress_relief': 'meditation stress relief calm',
            'morning': 'morning yoga routine wake up',
            'beginner': 'beginner yoga basics easy',
            'yoga': 'yoga practice routine',
            'meditation': 'meditation mindfulness guided'
        }
        
        # Add category context if provided
        if category and category in category_keywords:
            base_query = category_keywords[category]
            if query and query.strip():
                return f"{base_query} {query}"
            return base_query
        
        # Default yoga/meditation context
        if query and query.strip():
            return f"yoga meditation {query}"
        return "yoga meditation practice"
    
    def _format_video_data(self, video, category=None):
        """Format YouTube video data to match our YogaVideo model structure."""
        snippet = video['snippet']
        content_details = video.get('contentDetails', {})
        statistics = video.get('statistics', {})
        
        # Parse duration (ISO 8601 format)
        duration = self._parse_duration(content_details.get('duration', 'PT10M'))
        
        return {
            'youtube_id': video['id'],
            'title': snippet['title'],
            'instructor': snippet['channelTitle'],
            'thumbnail_url': snippet['thumbnails'].get('high', {}).get('url') or 
                            snippet['thumbnails'].get('medium', {}).get('url') or
                            snippet['thumbnails'].get('default', {}).get('url'),
            'duration_mins': duration,
            'category': category or 'yoga',
            'difficulty': self._estimate_difficulty(snippet['title'], snippet['description']),
            'calorie_burn': self._estimate_calorie_burn(duration, category),
            'flexibility': self._estimate_benefit_level('flexibility', category),
            'relaxation': self._estimate_benefit_level('relaxation', category),
            'strength': self._estimate_benefit_level('strength', category),
            'view_count': int(statistics.get('viewCount', 0)),
            'published_at': snippet.get('publishedAt'),
            'description': snippet.get('description', ''),
            'is_from_youtube': True  # Flag to identify YouTube-sourced videos
        }
    
    def _parse_duration(self, duration_str):
        """Parse ISO 8601 duration format to minutes."""
        if not duration_str:
            return 15
        
        import re
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_str)
        
        if not match:
            return 15
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        total_minutes = hours * 60 + minutes + (seconds / 60)
        return max(1, round(total_minutes))
    
    def _estimate_difficulty(self, title, description):
        """Estimate difficulty level based on title and description."""
        text = f"{title} {description}".lower()
        
        if any(word in text for word in ['beginner', 'basic', 'easy', 'intro', 'gentle', 'starter']):
            return 'beginner'
        elif any(word in text for word in ['advanced', 'expert', 'challenging', 'intense', 'power']):
            return 'advanced'
        else:
            return 'intermediate'
    
    def _estimate_calorie_burn(self, duration_mins, category):
        """Estimate calorie burn based on duration and category."""
        base_burn_per_minute = {
            'weight_loss': 8,
            'weight_gain': 6,
            'belly_fat': 7,
            'stress_relief': 3,
            'morning': 5,
            'beginner': 4,
            'yoga': 5,
            'meditation': 2
        }
        
        rate = base_burn_per_minute.get(category, 5)
        return round(duration_mins * rate)
    
    def _estimate_benefit_level(self, benefit_type, category):
        """Estimate benefit level based on category."""
        benefit_matrix = {
            'flexibility': {
                'weight_loss': 'High',
                'weight_gain': 'Medium',
                'belly_fat': 'High',
                'stress_relief': 'Medium',
                'morning': 'High',
                'beginner': 'Medium',
                'yoga': 'High',
                'meditation': 'Low'
            },
            'relaxation': {
                'weight_loss': 'Medium',
                'weight_gain': 'Low',
                'belly_fat': 'Medium',
                'stress_relief': 'High',
                'morning': 'Medium',
                'beginner': 'Medium',
                'yoga': 'Medium',
                'meditation': 'High'
            },
            'strength': {
                'weight_loss': 'High',
                'weight_gain': 'High',
                'belly_fat': 'High',
                'stress_relief': 'Low',
                'morning': 'Medium',
                'beginner': 'Low',
                'yoga': 'Medium',
                'meditation': 'Low'
            }
        }
        
        return benefit_matrix.get(benefit_type, {}).get(category, 'Medium')
