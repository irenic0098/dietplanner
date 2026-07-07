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
    
    def search_videos(self, query, max_results=20, category=None, page=1):
        """
        Search for videos related to yoga and meditation using multiple fallbacks.
        """
        # 1. Try YouTube Data API first if available
        if self.use_api:
            try:
                print("Trying YouTube Data API...")
                return self._search_with_api(query, max_results, category)
            except Exception as e:
                print(f"YouTube API search failed: {e}")
        
        # 2. Fallback: Try Invidious (YouTube search without API key)
        try:
            print("Trying Invidious API...")
            return self._search_with_invidious(query, max_results, category, page)
        except Exception as e:
            print(f"Invidious API failed: {e}")
            
        # 3. Fallback: Try Dailymotion API
        try:
            print("Trying Dailymotion API...")
            return self._search_with_dailymotion(query, max_results, category, page)
        except Exception as e:
            print(f"Dailymotion API failed: {e}")

        # 4. Final Fallback: Curated local videos (no pagination needed)
        print("All APIs failed, falling back to curated local videos.")
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
            videoDuration='medium'
            # No relevanceLanguage filter — return videos in all languages
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
        
        # Ensure video_source is present
        for v in sample_videos:
            if 'video_source' not in v:
                v['video_source'] = 'youtube'
        
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
        """
        Build search query preserving the user's exact language.
        We only add minimal neutral keywords when no query text is given.
        """
        # Category fallback keywords (used ONLY when no user query is present)
        category_fallbacks = {
            'weight_loss': 'yoga weight loss',
            'weight_gain': 'yoga strength muscle',
            'belly_fat': 'yoga belly fat core',
            'stress_relief': 'meditation stress relief',
            'morning': 'morning yoga',
            'beginner': 'beginner yoga',
            'yoga': 'yoga',
            'meditation': 'meditation'
        }

        user_query = query.strip() if query else ''

        if user_query:
            # Use the user's query exactly as typed — supports any language
            if category and category in category_fallbacks:
                # Append a small neutral category hint only if no overlap
                return user_query
            return user_query

        # No user query — use category fallback or generic
        if category and category in category_fallbacks:
            return category_fallbacks[category]
        return 'yoga meditation'
    
    def _format_video_data(self, video, category=None):
        """Format YouTube video data to match our YogaVideo model structure."""
        snippet = video['snippet']
        content_details = video.get('contentDetails', {})
        statistics = video.get('statistics', {})
        
        # Parse duration (ISO 8601 format)
        duration = self._parse_duration(content_details.get('duration', 'PT10M'))
        
        return {
            'youtube_id': video['id'],
            'video_source': 'youtube',
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

    def _search_with_invidious(self, query, max_results, category, page=1):
        """Search using public Invidious instances (YouTube search fallback)."""
        search_query = self._build_search_query(query, category)
        # Use popular public Invidious instances (ordered by reliability)
        instances = [
            'https://invidious.flokinet.to',
            'https://yewtu.be',
            'https://invidious.nerdvpn.de',
            'https://inv.nadeko.net',
            'https://invidious.privacyredirect.com',
            'https://invidious.projectsegfau.lt',
            'https://inv.tux.pizza',
            'https://invidious.incogniweb.net',
        ]
        
        for instance in instances:
            try:
                url = f"{instance}/api/v1/search"
                response = requests.get(
                    url, 
                    params={'q': search_query, 'type': 'video', 'page': page}, 
                    timeout=6
                )
                if response.status_code == 200:
                    results = response.json()
                    formatted_videos = []
                    for item in results[:max_results]:
                        video_id = item.get('videoId')
                        if not video_id:
                            continue
                        
                        length_sec = item.get('lengthSeconds', 600)
                        duration = max(1, round(length_sec / 60))
                        
                        # Format thumbnails
                        thumbnails = item.get('videoThumbnails', [])
                        thumb_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
                        if thumbnails:
                            thumb_url = thumbnails[0].get('url') or thumb_url
                            if thumb_url.startswith('//'):
                                thumb_url = f"https:{thumb_url}"
                                
                        formatted_videos.append({
                            'youtube_id': video_id,
                            'video_source': 'youtube',
                            'title': item.get('title'),
                            'instructor': item.get('author', 'YouTube Instructor'),
                            'thumbnail_url': thumb_url,
                            'duration_mins': duration,
                            'category': category or 'yoga',
                            'difficulty': self._estimate_difficulty(item.get('title', ''), item.get('description', '')),
                            'calorie_burn': self._estimate_calorie_burn(duration, category),
                            'flexibility': self._estimate_benefit_level('flexibility', category),
                            'relaxation': self._estimate_benefit_level('relaxation', category),
                            'strength': self._estimate_benefit_level('strength', category),
                            'view_count': int(item.get('viewCount', 0)),
                            'published_at': None,
                            'description': item.get('description', ''),
                            'is_from_youtube': True
                        })
                    if formatted_videos:
                        print(f"Successfully fetched videos from Invidious instance: {instance}")
                        return formatted_videos
            except Exception as e:
                print(f"Invidious instance {instance} failed: {e}")
                continue
                
        raise Exception("All Invidious instances failed")

    def _search_with_dailymotion(self, query, max_results, category, page=1):
        """Search using Dailymotion API."""
        search_query = self._build_search_query(query, category)
        try:
            url = "https://api.dailymotion.com/videos"
            params = {
                'fields': 'id,title,thumbnail_720_url,duration,owner.screenname,description,views_total',
                'search': search_query,
                'limit': max_results,
                'page': page,
            }
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                formatted_videos = []
                for item in data.get('list', []):
                    video_id = item.get('id')
                    if not video_id:
                        continue
                        
                    duration_sec = item.get('duration', 900)
                    duration_mins = max(1, round(duration_sec / 60))
                    
                    formatted_videos.append({
                        'youtube_id': video_id,
                        'video_source': 'dailymotion',
                        'title': item.get('title'),
                        'instructor': item.get('owner.screenname', 'Dailymotion Instructor'),
                        'thumbnail_url': item.get('thumbnail_720_url') or f"https://www.dailymotion.com/thumbnail/video/{video_id}",
                        'duration_mins': duration_mins,
                        'category': category or 'yoga',
                        'difficulty': self._estimate_difficulty(item.get('title', ''), item.get('description', '')),
                        'calorie_burn': self._estimate_calorie_burn(duration_mins, category),
                        'flexibility': self._estimate_benefit_level('flexibility', category),
                        'relaxation': self._estimate_benefit_level('relaxation', category),
                        'strength': self._estimate_benefit_level('strength', category),
                        'view_count': int(item.get('views_total', 0)),
                        'published_at': None,
                        'description': item.get('description', ''),
                        'is_from_youtube': False,
                        'is_from_dailymotion': True
                    })
                if formatted_videos:
                    print("Successfully fetched videos from Dailymotion API")
                    return formatted_videos
        except Exception as e:
            print(f"Dailymotion API search failed: {e}")
            
        raise Exception("Dailymotion search failed")
