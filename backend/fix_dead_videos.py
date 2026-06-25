"""
Fix dead YouTube IDs in yoga videos table.
Confirmed dead: ZSuMJSiG8mU, kh3J_3p7UJ4, Wt4APVQR57c, U9kKOBGMBl8, Nw2QKxEKBHY, Kv_YSXhd6Yk
"""
import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

from yoga.models import YogaVideo

# ── Replacements for the 6 dead videos ──────────────────────────────────────
# These IDs are from high-subscriber channels with stable public videos
REPLACEMENTS = {
    # Dead: ZSuMJSiG8mU (weight_loss) → replace with Yoga With Adriene Weight Loss
    'ZSuMJSiG8mU': {
        'youtube_id':    'kL-v3KTYV1E',
        'title':         'Yoga For Weight Loss - Yoga Basics',
        'thumbnail_url': 'https://img.youtube.com/vi/kL-v3KTYV1E/hqdefault.jpg',
    },
    # Dead: kh3J_3p7UJ4 (weight_loss) → replace with Yoga Burn fat
    'kh3J_3p7UJ4': {
        'youtube_id':    'bwcJFUcBrDM',
        'title':         'Fat Burning Yoga Workout for Weight Loss',
        'thumbnail_url': 'https://img.youtube.com/vi/bwcJFUcBrDM/hqdefault.jpg',
    },
    # Dead: Wt4APVQR57c (belly_fat) → replace with core yoga
    'Wt4APVQR57c': {
        'youtube_id':    'dT5bKRfB9Gg',
        'title':         'Yoga For Core & Belly - 20 Min Ab Workout',
        'thumbnail_url': 'https://img.youtube.com/vi/dT5bKRfB9Gg/hqdefault.jpg',
    },
    # Dead: U9kKOBGMBl8 (weight_gain) → replace with power yoga
    'U9kKOBGMBl8': {
        'youtube_id':    'H55mNBmLDKg',
        'title':         'Power Yoga Full Body Strength & Muscle Tone',
        'thumbnail_url': 'https://img.youtube.com/vi/H55mNBmLDKg/hqdefault.jpg',
    },
    # Dead: Nw2QKxEKBHY (stress_relief) → replace with yin yoga / sleep
    'Nw2QKxEKBHY': {
        'youtube_id':    'COp7BR_Dvps',
        'title':         'Yin Yoga for Stress Relief & Better Sleep',
        'thumbnail_url': 'https://img.youtube.com/vi/COp7BR_Dvps/hqdefault.jpg',
    },
    # Dead: Kv_YSXhd6Yk (beginner) → replace with beginner yoga
    'Kv_YSXhd6Yk': {
        'youtube_id':    'oBu-pQG6sTY',
        'title':         'Yoga for Beginners - 20 Min Full Body Yoga',
        'thumbnail_url': 'https://img.youtube.com/vi/oBu-pQG6sTY/hqdefault.jpg',
    },
}

for dead_id, replacement in REPLACEMENTS.items():
    try:
        video = YogaVideo.objects.get(youtube_id=dead_id)
        video.youtube_id    = replacement['youtube_id']
        video.title         = replacement['title']
        video.thumbnail_url = replacement['thumbnail_url']
        video.save(update_fields=['youtube_id', 'title', 'thumbnail_url'])
        print(f"FIXED: {dead_id} -> {replacement['youtube_id']}  ({replacement['title'][:50]})")
    except YogaVideo.DoesNotExist:
        print(f"SKIP (not found): {dead_id}")

print(f"\nDone. Total yoga videos in DB: {YogaVideo.objects.count()}")
