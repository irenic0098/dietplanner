"""
Find and verify replacement YouTube IDs using oEmbed.
Tests candidate IDs and prints which ones are publicly available.
"""
import urllib.request, json

# Candidate pool - popular yoga video IDs from well-known channels
# These are famous videos with millions of views
candidates = {
    # Weight Loss replacements
    'weight_loss': [
        ('klTKBNFADk4', 'Yoga For Weight Loss - Yoga With Adriene'),
        ('gC_L9qAHVQw', 'Yoga for Weight Loss | 30 Min Workout'),
        ('7kgZnJqzBaA', 'YOGA FOR WEIGHT LOSS - 20 Minute Practice'),
        ('j7rKKpwdXNE', 'Fat Burning Yoga | 25-Min Weight Loss'),
        ('1d0mbh6WsJI', 'Yoga For Weight Loss Beginners'),
        ('WRuBpO3GJUY', 'Yoga Burn for Weight Loss'),
    ],
    # Belly fat replacements
    'belly_fat': [
        ('vD0FiEpDOhU', 'Yoga For Belly Fat | Core & Abs'),
        ('0kfTrrWuqL4', '15 Min Yoga For Core Strength'),
        ('fNkFzROw6DA', 'Yoga Abs Workout Core Toning'),
        ('oLwCMIe6DI8', 'Yoga For Flat Tummy - 20 Min'),
        ('k3C9aA5fjU0', 'Core Yoga Full Class Yoga With Adriene'),
    ],
    # Strength replacements
    'weight_gain': [
        ('VpWOs84b-1I', 'Power Yoga Strength Training'),
        ('6l3Msx2L6Ek', 'Yoga for Strength - Travis Eliot'),
        ('pYQSUbVeM9Q', 'Strong Yoga Workout - 30 Minutes'),
        ('qmCJVpMxnOg', 'Yoga for Strength and Flexibility'),
        ('5k7mBEKHDIs', 'Power Yoga Total Body Workout'),
    ],
}

print("Testing candidates...\n")
for category, items in candidates.items():
    print(f"=== {category.upper()} ===")
    for vid_id, title in items:
        try:
            url = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + vid_id + '&format=json'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=6)
            data = json.loads(resp.read())
            real_title = data.get('title', title)[:55]
            print(f"  OK   {vid_id}  {real_title}")
        except urllib.error.HTTPError as e:
            print(f"  DEAD {vid_id}  HTTP {e.code}")
        except Exception as e:
            print(f"  ERR  {vid_id}  {e}")
    print()
