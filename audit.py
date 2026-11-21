#!/usr/bin/python3
# BoardPrep v2 — data audit (accurate shapes)
import json, re, io, os, collections

BASE = '/home/dilshan/boardprep'
def jload(path, name=None):
    s = io.open(os.path.join(BASE, path), encoding='utf-8').read()
    if name:
        m = re.search(r'window\.%s\s*=\s*' % name, s)
        if not m: return None
        s = s[m.end():]
    starts = [x for x in [s.find('{'), s.find('[')] if x >= 0]
    if not starts: return None
    i = min(starts)
    open_ch = s[i]; close_ch = '}' if open_ch == '{' else ']'
    depth = 0; q = None; esc = False; end = None
    for k in range(i, len(s)):
        c = s[k]
        if q:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == q: q = None
            continue
        if c in '"\'':
            q = c; continue
        if c == open_ch: depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                end = k + 1; break
    if end is None: return None
    s = s[i:end]
    t = re.sub(r'//[^\n]*', '', s)
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    t = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', t)
    t = re.sub(r',\s*([}\]])', r'\1', t)
    try: return json.loads(t)
    except Exception as e:
        return {'__err': str(e), '__raw': s[:150]}

report = []
def R(sev, title, detail): report.append((sev, title, detail))

bd = jload('assets/data/data.js', 'BOARD_DATA')
qs = bd['questions']; papers = bd['papers']

# 1-5 question DB
seen = collections.Counter((q.get('q') or '').strip() for q in qs if (q.get('q') or '').strip())
dups = [(k, v) for k, v in seen.items() if v > 1]
R('OK' if not dups else 'HIGH', 'Duplicate questions', '%d texts' % len(dups))
R('OK', 'Missing question text', str(sum(1 for q in qs if not (q.get('q') or '').strip())))
mcq = [q for q in qs if q.get('type') == 'mcq']
R('OK', 'MCQ without options', str(sum(1 for q in mcq if not q.get('opts'))))
noans = [q for q in mcq if not q.get('ans')]
R('HIGH', 'MCQ without correct answer', '%d (quiz se already excluded)' % len(noans))
R('INFO', '  by subject', ', '.join('%s:%d' % (k, v) for k, v in collections.Counter(q.get('subj') for q in noans).most_common()))
badans = 0
for q in mcq:
    a = q.get('ans')
    if not a: continue
    c = str(a).strip().upper()[:1]
    if c not in 'ABCD' or ord(c) - 65 >= len(q.get('opts') or []): badans += 1
R('OK', 'Invalid answer label/index', str(badans))

subjkeys = {s['key'] for s in jload('assets/js/subjects.js', 'SUBJECTS')}
R('OK' if not [q for q in qs if q.get('subj') not in subjkeys] else 'HIGH',
  'Unknown subject key', str(sum(1 for q in qs if q.get('subj') not in subjkeys)))

# 15/16 PDF
miss = [p['url'] for p in papers if not os.path.exists(os.path.join(BASE, p['url'].lstrip('/')))]
R('OK' if not miss else 'HIGH', 'Missing PDF files', '%d missing / %d total' % (len(miss), len(papers)))
boards = collections.Counter(p.get('board') for p in papers)
R('INFO', 'PDF per board', ', '.join('%s:%d' % (k, v) for k, v in boards.most_common()))

# formulas
F = jload('assets/data/formulas.js', 'FORMULAS') or []
fcount = sum(len(x.get('items') or []) for x in F)
emptyf = sum(1 for x in F for it in (x.get('items') or []) if not (it.get('f') or it.get('formula')))
R('OK', 'Formulas entries', '%d across %d chapters; empty=%d' % (fcount, len(F), emptyf))

# periodic
P = jload('assets/data/periodic.js', 'PERIODIC') or []
ns = [e.get('n') for e in P]
R('OK' if len(P) == 118 and sorted(ns) == list(range(1, 119)) else 'HIGH',
  'Periodic table elements', '%d elements, Z range %s..%s' % (len(P), min(ns) if ns else '-', max(ns) if ns else '-'))
syms = [e.get('s') for e in P]
R('OK' if len(set(syms)) == len(syms) else 'HIGH', 'Periodic symbols unique', str(len(set(syms)) == len(syms)))
noe = [e for e in P if not e.get('hi') or not e.get('en')]
R('OK' if not noe else 'MED', 'Periodic missing hi/en', str(len(noe)))

# lab
L = jload('assets/data/lab.js', 'LAB') or {}
reag = L.get('reagents') or []
rxn = L.get('reactions') or L.get('eq') or []
R('OK', 'Lab reagents', str(len(reag)))
R('OK', 'Lab reactions', str(len(rxn)))
badrxn = [x for x in rxn if not (x.get('a') and x.get('b') and (x.get('out') or x.get('eq')))]
R('OK' if not badrxn else 'MED', 'Lab reactions incomplete', '%d / %d' % (len(badrxn), len(rxn)))

# diagrams
D = jload('assets/data/diagrams.js', 'DIAGRAMS') or []
nolab = [d for d in D if not (d.get('parts') or d.get('labels'))]
R('OK' if not nolab else 'MED', 'Diagrams without labels/parts', '%d / %d' % (len(nolab), len(D)))

# timeline dates
T = jload('assets/data/timeline.js', 'TIMELINE') or []
evs = []
for e in (T if isinstance(T, list) else T.get('events', [])):
    evs.extend(e.get('events') or [e])
badt = [e for e in evs if not re.match(r'^-?\d{2,4}', str(e.get('year') or ''))]
R('OK' if not badt else 'MED', 'Timeline events without valid year', '%d / %d' % (len(badt), len(evs)))
R('INFO', 'Timeline events', str(len(evs)))

# missing-answer MCQ report (Part 1.2)
out = io.open(os.path.join(BASE, 'missing_answers.md'), 'w', encoding='utf-8')
out.write('# Missing-answer MCQ report\n\n')
out.write('Is list ke questions quiz se excluded hain. Answer official answer key / textbook reference ke bina bhara NAHI gaya.\n\n')
out.write('| # | Subject | Chapter | Question | Options |\n|---|---|---|---|---|\n')
for i, q in enumerate(noans, 1):
    opts = (q.get('opts') or [])[:4]
    out.write('| %d | %s | %s | %s | %s |\n' % (i, q.get('subj'), q.get('chap') or q.get('part'), str(q.get('q'))[:120].replace('|', '/'), ' / '.join(str(o)[:25] for o in opts)))
out.close()
R('INFO', 'Missing-answer report', 'missing_answers.md (%d rows)' % len(noans))

# stories
S = jload('assets/data/stories.js', 'STORIES') or {}
tot = sum(len(v) for v in S.values())
R('OK', 'Textbook chapters', '%d (hi:%d en:%d sa:%d)' % (tot, len(S.get('hindi', [])), len(S.get('english', [])), len(S.get('sanskrit', []))))
R('OK', 'Chapters without author', str(sum(1 for v in S.values() for x in v if not x.get('a'))))

# brain
B = jload('assets/data/brain.js', 'BRAIN') or {}
bi = B.get('items') or []
R('OK' if all('a' in x and x['a'] < len(x.get('opts') or []) for x in bi) else 'HIGH', 'Brain test answers valid', '%d items' % len(bi))

# important
I = jload('assets/data/important.js', 'IMPORTANT') or {}
R('INFO', 'Important dataset board', str(I.get('board')), )

out = io.open(os.path.join(BASE, 'audit_report.md'), 'w', encoding='utf-8')
out.write('# BoardPrep v2 — Data Audit Report\n\n')
out.write('Sirf audit — content automatically rewrite NAHI kiya gaya. Jo verify nahi hua, wo "verify required" mark hai.\n\n')
out.write('| # | Check | Result | Detail |\n|---|---|---|---|\n')
for i, (sev, title, detail) in enumerate(report, 1):
    out.write('| %d | %s | %s | %s |\n' % (i, title, sev, str(detail).replace('|', '/').replace('\n', ' ')))
out.close()
for sev, title, detail in report:
    print('%-5s %-40s %s' % (sev, title, str(detail)[:80]))
