#!/usr/bin/env python3
"""CBSE SQP JSON -> assets/data/board-bank.js"""
import json, os, re

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = '/home/dilshan/boardprep/assets/data/board-bank.js'

MAP = {
    'Science': ('science', 'Science (Biology / Chemistry / Physics)'),
    'MathsStandard': ('maths', 'Mathematics Standard'),
    'SocialScience': ('sst', 'Social Science (History / Geo / Civics / Econ)'),
    'EnglishL': ('english', 'English Language & Literature'),
}

MARKERS = ['The following', 'DIRECTIONS:', 'Note:', 'For Visually Impaired', 'Following ', '*Please note', 'Page ', 'OR ', ' V.I']

def clean_opt(o):
    o = re.sub(r'\s+\d{1,2}\s*$', '', o)
    for m in MARKERS:
        i = o.find(m)
        if i > 0:
            o = o[:i]
    return o.strip(' .,;')

sources = [(os.path.join(BASE, f + '.json'), key, label, 'CBSE SQP 2025-26')
           for f, (key, label) in MAP.items()]
sources += [(os.path.join(BASE, 'x2425', f + '.json'), key, label, 'CBSE SQP 2024-25')
            for f, (key, label) in MAP.items()]

qs = []
for path, key, label, chap in sources:
    if not os.path.exists(path):
        continue
    d = json.load(open(path, encoding='utf-8'))
    for q in d:
        opts = [clean_opt(o) for o in q['opts']]
        opts = [o for o in opts if o]
        if len(opts) < 2:
            continue
        opts = opts[:4]
        # sirf asli MCQ rakho (4 options, chhote)
        if len(opts) != 4 or any(len(o) > 100 for o in opts):
            continue
        # answer letter ko option index se match karo (SQP options kabhi shift ho sakte hain)
        ans = (q.get('ans') or '').strip().upper()
        if ans and ans not in 'ABCD'[:len(opts)]:
            ans = ''
        qs.append({
            'id': 'cbse-%s-%s-%s' % (key, chap[-4:], q['n']),
            'subj': key,
            'part': label,
            'chap': chap,
            'type': 'mcq',
            'q': q['q'].strip(),
            'opts': opts,
            'ans': ans,
            'exp': (q.get('exp') or '').strip()
        })

# duplicates (same question number repeat) hatao
seen = set()
uniq = []
for q in qs:
    k = q['q'][:80].lower()
    if k in seen:
        continue
    seen.add(k)
    uniq.append(q)

papers = [
    {'name': 'Science — Sample Question Paper 2025-26', 'label': 'CBSE SQP', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/Science-SQP.pdf'},
    {'name': 'Science — Marking Scheme 2025-26', 'label': 'CBSE MS', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/Science-MS.pdf'},
    {'name': 'Mathematics Standard — Sample Question Paper 2025-26', 'label': 'CBSE SQP', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/MathsStandard-SQP.pdf'},
    {'name': 'Mathematics Standard — Marking Scheme 2025-26', 'label': 'CBSE MS', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/MathsStandard-MS.pdf'},
    {'name': 'Social Science — Sample Question Paper 2025-26', 'label': 'CBSE SQP', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/SocialScience-SQP.pdf'},
    {'name': 'Social Science — Marking Scheme 2025-26', 'label': 'CBSE MS', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/SocialScience-MS.pdf'},
    {'name': 'English Language & Literature — Sample Question Paper 2025-26', 'label': 'CBSE SQP', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/EnglishL-SQP.pdf'},
    {'name': 'English Language & Literature — Marking Scheme 2025-26', 'label': 'CBSE MS', 'kind': 'model', 'year': '2026',
     'url': 'assets/pdfs/cbse-sqp/EnglishL-MS.pdf'},
]

bank = {
    'cbse': {
        'name': 'CBSE',
        'source': 'cbseacademic.nic.in — Class X Sample Question Papers 2025-26 (official)',
        'questions': uniq,
        'papers': papers
    }
}

js = ('// Board-specific question banks. CBSE ke prashn CBSE ke apne official SQP se.\n'
      'window.BOARD_BANK = ' + json.dumps(bank, ensure_ascii=False, indent=1) + ';\n')
open(OUT, 'w', encoding='utf-8').write(js)
print('questions:', len(uniq), '->', OUT, len(js), 'bytes')
from collections import Counter
print(Counter(q['subj'] for q in uniq))
print('with answers:', sum(1 for q in uniq if q['ans']))
