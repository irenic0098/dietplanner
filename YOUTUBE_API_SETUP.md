# YouTube API Integration for Yoga & Meditation

## Overview
The yoga and meditation section now includes YouTube video search functionality, allowing users to search for any yoga or meditation videos on YouTube and view them directly in the app.

## Features
- **Live YouTube Search**: Search for yoga and meditation videos directly from YouTube
- **Category-Aware Search**: Searches are optimized based on selected category (weight loss, stress relief, etc.)
- **Smart Video Data**: Automatically estimates difficulty, calorie burn, and benefits based on video metadata
- **Dual Search Mode**: Switch between local library and YouTube search
- **Real-time Results**: Fetches up to 20 relevant videos per search

## Setup Instructions

### 1. Get YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for "YouTube Data API v3" and enable it
5. Go to **APIs & Services** > **Credentials**
6. Click "Create Credentials" > "API Key"
7. Copy the generated API key

### 2. Configure Environment Variable

Add the YouTube API key to your environment:

**For Development (local .env file):**
```bash
YOUTUBE_API_KEY=your-actual-api-key-here
```

**For Production (Render/other hosting):**
Add the same variable to your deployment environment variables.

### 3. Install Dependencies

The backend now requires the Google API Python Client:

```bash
cd backend
pip install google-api-python-client==2.108.0
```

Or update requirements.txt is already updated, just run:
```bash
pip install -r requirements.txt
```

### 4. Restart the Backend Server

After adding the API key and installing dependencies, restart your Django backend server for the changes to take effect.

## How It Works

### Backend (`backend/yoga/youtube_service.py`)
- **YouTubeSearchService**: Handles all YouTube API interactions
- **Smart Query Building**: Adds yoga/meditation context to searches
- **Video Data Processing**: Estimates difficulty, calorie burn, and benefits
- **Error Handling**: Graceful fallback if API is unavailable

### API Endpoint
- **URL**: `/api/yoga/videos/youtube_search/`
- **Method**: GET
- **Parameters**:
  - `query` (required): Search term
  - `category` (optional): Filter by category
  - `max_results` (optional): Number of results (default: 20)

### Frontend (`frontend/src/features/yoga/YogaMeditation.jsx`)
- **Search Source Toggle**: Switch between "Library" (local) and "YouTube"
- **Real-time Search**: Auto-searches when typing in YouTube mode
- **Video Display**: Shows YouTube videos in the same card format as local videos
- **Source Indicator**: Clear visual indication when showing YouTube results

## Usage

1. Navigate to the Yoga & Meditation section
2. Click the "YouTube" button in the search toggle
3. Enter any search term (e.g., "morning flow", "stress relief", "power yoga")
4. Videos will automatically load from YouTube
5. Click on any video to play it in the modal

## Limitations

- **Bookmarking**: YouTube videos cannot be bookmarked (feature can be added by saving to local database)
- **Completion Tracking**: YouTube video completion is not tracked (can be added by creating local video records)
- **API Quota**: YouTube API has daily quota limits (10,000 units/day by default)

## Category-Specific Search

The search automatically adds context based on the selected category:

- **Weight Loss**: "yoga for weight loss fat burn [query]"
- **Stress Relief**: "meditation stress relief calm [query]"
- **Morning Yoga**: "morning yoga routine wake up [query]"
- **Beginner**: "beginner yoga basics easy [query]"
- And more...

## Troubleshooting

### "YOUTUBE_API_KEY environment variable is not set"
- Make sure you've added the API key to your .env file or deployment environment
- Restart the backend server after adding the variable

### "Failed to search YouTube"
- Check that your YouTube API key is valid
- Verify the YouTube Data API v3 is enabled in your Google Cloud Console
- Check your API quota usage in the Google Cloud Console

### No videos appearing
- Try a different search term
- Ensure the category filter isn't too restrictive
- Check browser console for any errors

## Future Enhancements

Possible improvements:
- Save YouTube videos to local database for bookmarking
- Track completion of YouTube videos
- Add advanced filters (duration, upload date, view count)
- Implement pagination for more results
- Add video preview thumbnails
- Support for playlists and channels
