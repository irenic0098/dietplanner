"""
Check YouTube video availability by inspecting thumbnail sizes.
- hqdefault.jpg = 404 means video is private/deleted
- mqdefault.jpg size < 2000 bytes = YouTube placeholder (unavailable)
- mqdefault.jpg size >= 2000 bytes = real thumbnail, video is public
"""
import urllib.request
import json

def check_video(youtube_id):
    results = {}

    for quality in ['hqdefault', 'mqdefault', 'sddefault']:
        url = f"https://img.youtube.com/vi/{youtube_id}/{quality}.jpg"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=8)
            size = len(resp.read())
            results[quality] = size
        except urllib.error.HTTPError as e:
            results[quality] = f"HTTP {e.code}"
        except Exception as e:
            results[quality] = f"ERR: {e}"

    # mqdefault < 1500 bytes = YouTube grey "video unavailable" placeholder
    mq = results.get('mqdefault', 0)
    is_available = isinstance(mq, int) and mq > 1500
    return results, is_available


import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

import django
django.setup()

from yoga.models import YogaVideo

videos = list(YogaVideo.objects.values('id', 'title', 'youtube_id'))
print(f"Checking {len(videos)} videos...\n")
print(f"{'ID':<13} {'STATUS':<10} {'mqdefault':<12} {'hqdefault':<12}  TITLE")
print("-" * 90)

dead_ids = []
for v in videos:
    results, available = check_video(v['youtube_id'])
    status = "OK  " if available else "DEAD"
    mq = results.get('mqdefault', '?')
    hq = results.get('hqdefault', '?')
    print(f"{v['youtube_id']:<13} {status:<10} {str(mq):<12} {str(hq):<12}  {v['title'][:45]}")
    if not available:
        dead_ids.append(v['youtube_id'])

print(f"\n{'─'*90}")
print(f"Total: {len(videos)} | Available: {len(videos)-len(dead_ids)} | Dead: {len(dead_ids)}")
if dead_ids:
    print(f"Dead IDs: {dead_ids}")
