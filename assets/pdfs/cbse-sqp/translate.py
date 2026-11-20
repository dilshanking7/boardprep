#!/usr/bin/env python3
"""Hindi strings -> English (MyMemory), parallel + cache."""
import json, os, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

SRC = '/tmp/hi_strings.json'
OUT = '/home/dilshan/boardprep/assets/data/en-dict.js'
CACHE = '/tmp/hi_en_cache.json'

strs = json.load(open(SRC, encoding='utf-8'))
cache = json.load(open(CACHE, encoding='utf-8')) if os.path.exists(CACHE) else {}
lock = __import__('threading').Lock()

def tr(s):
    import urllib.parse as up
    q = up.quote(s)
    url = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=hi&tl=en&q=' + q
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'})
            with urllib.request.urlopen(req, timeout=25) as r:
                d = json.loads(r.read().decode('utf-8'))
            if isinstance(d, list):
                return s, ''.join(d).strip()
            if isinstance(d, dict) and d.get('translatedText'):
                return s, d['translatedText'].strip()
        except Exception:
            pass
        time.sleep(1.2 * (attempt + 1))
    return s, ''

todo = [s for s in strs if not cache.get(s)]
print('todo', len(todo), 'cached', len(strs) - len(todo), flush=True)
workers = int(sys.argv[1]) if len(sys.argv) > 1 else 8
done = 0
with ThreadPoolExecutor(max_workers=workers) as ex:
    futs = [ex.submit(tr, s) for s in todo]
    for f in as_completed(futs):
        s, txt = f.result()
        with lock:
            cache[s] = txt
            done += 1
            if done % 50 == 0:
                json.dump(cache, open(CACHE, 'w', encoding='utf-8'), ensure_ascii=False)
                print('progress', done, '/', len(todo), flush=True)

json.dump(cache, open(CACHE, 'w', encoding='utf-8'), ensure_ascii=False)
ok = sum(1 for s in strs if cache.get(s))
print('translated', ok, 'of', len(strs), flush=True)

# dictionary file
items = {}
for s in strs:
    if cache.get(s):
        items[s] = cache[s]
js = ('// Hindi -> English content dictionary (auto-generated).\n'
      '// English mode me content globals inka English roop lete hain.\n'
      'window.HI_EN = ' + json.dumps(items, ensure_ascii=False, indent=1) + ';\n')
open(OUT, 'w', encoding='utf-8').write(js)
print('wrote', OUT, len(js), 'bytes', flush=True)
