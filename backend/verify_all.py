import urllib.request, json

# Check the 10 known-good IDs via oEmbed to confirm they're really available
good_ids = [
    'Eh00_rniF8E', 'qX9FSZJu448', 'U9YKY7fdwyg', 'hJbRpHZr_d0',
    'COp7BR_Dvps', 'sTANio_2E0Q', '4pLUleLdwY4', 'v7AYKMP6rOE',
    'oBu-pQG6sTY', 'g_tea8ZNk5A',
]

# Also check the 4 "dead" ones to understand if they're really dead
dead_ids = ['kL-v3KTYV1E', 'bwcJFUcBrDM', 'dT5bKRfB9Gg', 'H55mNBmLDKg']

all_ids = good_ids + dead_ids

for vid in all_ids:
    try:
        url = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + vid + '&format=json'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=8)
        data = json.loads(resp.read())
        title = data.get('title', '?')[:50]
        thumb = data.get('thumbnail_url', 'none')
        print('OK   ' + vid + '  ' + title)
    except urllib.error.HTTPError as e:
        print('DEAD ' + vid + '  HTTP ' + str(e.code))
    except Exception as e:
        print('ERR  ' + vid + '  ' + str(e)[:40])
