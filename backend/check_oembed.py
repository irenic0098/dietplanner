import urllib.request, json

ids = ['kL-v3KTYV1E', 'bwcJFUcBrDM', 'dT5bKRfB9Gg', 'H55mNBmLDKg']
for vid in ids:
    try:
        url = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + vid + '&format=json'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=8)
        data = json.loads(resp.read())
        title = data.get('title', '?')[:60]
        print(vid + ': OK - ' + title)
    except urllib.error.HTTPError as e:
        print(vid + ': HTTP ' + str(e.code) + ' - UNAVAILABLE')
    except Exception as e:
        print(vid + ': ERROR - ' + str(e))
