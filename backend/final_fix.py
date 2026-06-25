"""
Final fix: correct video titles and replace 4 dead IDs.
The oEmbed check revealed the actual real titles of the working videos.
"""
import os, django, urllib.request, json
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from yoga.models import YogaVideo

# ── Update real titles for working videos ────────────────────────────────────
title_fixes = {
    'Eh00_rniF8E': ('Yoga For Core & Belly Fat | 15-Min Ab Yoga Flow', 'intermediate'),
    'qX9FSZJu448': ('Power Yoga For Strength | 30-Min Full Body Workout', 'advanced'),
    'U9YKY7fdwyg': ('10-Minute Meditation For Beginners', 'beginner'),
    'hJbRpHZr_d0': ('Yoga For Stress & Anxiety | 20-Min Relaxing Flow', 'beginner'),
    'COp7BR_Dvps': ('30 Min Relaxing Yoga for Mental Health & Calm', 'beginner'),
    'sTANio_2E0Q': ('20-Min Full Body Stretch Yoga for Stress & Anxiety', 'beginner'),
    '4pLUleLdwY4': ('Meditation for Anxiety - Yoga With Adriene', 'beginner'),
    'v7AYKMP6rOE': ('Yoga For Complete Beginners - 20 Min Home Yoga Class', 'beginner'),
    'oBu-pQG6sTY': ('30 Days of Yoga - Day 1: Ease Into It', 'beginner'),
    'g_tea8ZNk5A': ('15-Min Full Body Stretch | Daily Flexibility Routine', 'beginner'),
}

for yt_id, (title, diff) in title_fixes.items():
    try:
        v = YogaVideo.objects.get(youtube_id=yt_id)
        v.title = title
        v.save(update_fields=['title'])
        print('Title fixed: ' + yt_id + '  =>  ' + title[:50])
    except YogaVideo.DoesNotExist:
        print('Not found: ' + yt_id)

# ── Replace 4 dead videos ────────────────────────────────────────────────────
# Use verified IDs confirmed by oEmbed
dead_replacements = {
    # 2 weight_loss replacements
    'kL-v3KTYV1E': {
        'youtube_id':    'j7rKKpwdXNE',   # confirmed OK from earlier search
        'title':         'Yoga For Beginners | Start Yoga Here',
        'thumbnail_url': 'https://img.youtube.com/vi/j7rKKpwdXNE/hqdefault.jpg',
        'category':      'weight_loss',
        'recommended_goal': 'loss',
    },
    'bwcJFUcBrDM': {
        'youtube_id':    'Bv2xCpPqsAg',
        'title':         'Yoga For Weight Loss - 20 Min Fat Burning Yoga Flow',
        'thumbnail_url': 'https://img.youtube.com/vi/Bv2xCpPqsAg/hqdefault.jpg',
        'category':      'weight_loss',
        'recommended_goal': 'loss',
    },
    # 1 belly_fat replacement
    'dT5bKRfB9Gg': {
        'youtube_id':    'qsJLXB52vk8',
        'title':         'Core Yoga - Yoga For Your Core | Yoga With Adriene',
        'thumbnail_url': 'https://img.youtube.com/vi/qsJLXB52vk8/hqdefault.jpg',
        'category':      'belly_fat',
        'recommended_goal': 'loss',
    },
    # 1 weight_gain replacement
    'H55mNBmLDKg': {
        'youtube_id':    'yx3LGT85EKo',
        'title':         'Power Yoga For Strength | Full Body Tone',
        'thumbnail_url': 'https://img.youtube.com/vi/yx3LGT85EKo/hqdefault.jpg',
        'category':      'weight_gain',
        'recommended_goal': 'gain',
    },
}

print()
for dead_id, repl in dead_replacements.items():
    try:
        v = YogaVideo.objects.get(youtube_id=dead_id)
        v.youtube_id    = repl['youtube_id']
        v.title         = repl['title']
        v.thumbnail_url = repl['thumbnail_url']
        v.save(update_fields=['youtube_id', 'title', 'thumbnail_url'])
        print('Replaced: ' + dead_id + ' -> ' + repl['youtube_id'] + '  ' + repl['title'][:50])
    except YogaVideo.DoesNotExist:
        print('Not in DB: ' + dead_id)

print()

# ── Verify the 4 new IDs via oEmbed immediately ──────────────────────────────
new_ids = [r['youtube_id'] for r in dead_replacements.values()]
print('Verifying new IDs via oEmbed...')
for vid in new_ids:
    try:
        url = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + vid + '&format=json'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=8)
        data = json.loads(resp.read())
        print('  OK   ' + vid + '  ' + data.get('title','?')[:55])
    except urllib.error.HTTPError as e:
        print('  DEAD ' + vid + '  HTTP ' + str(e.code))
    except Exception as e:
        print('  ERR  ' + vid + '  ' + str(e)[:40])

print()
print('Total yoga videos: ' + str(YogaVideo.objects.count()))
