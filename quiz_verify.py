#!/usr/bin/python3
# BoardPrep — 50 random answerable questions ki consistency check + report
import json, re, io, random
s = io.open('/home/dilshan/boardprep/assets/data/data.js', encoding='utf-8').read()
m = re.search(r'window\.BOARD_DATA\s*=\s*(\{.*\})\s*;', s, re.S)
d = json.loads(m.group(1))
qs = [q for q in d['questions'] if q.get('opts') and q.get('ans')]
random.seed(20261122)
sample = random.sample(qs, 50)

issues = []
rows = []
for i, q in enumerate(sample, 1):
    opts = q['opts']
    a = str(q['ans']).strip().upper()[:1]
    n = ord(a) - 65
    flag = []
    if not (0 <= n < len(opts)):
        flag.append('ANS-INDEX')
    if len(opts) != len(set(opts)):
        flag.append('DUP-OPT')
    if any(not str(o).strip() for o in opts):
        flag.append('EMPTY-OPT')
    if not str(q.get('q', '')).strip():
        flag.append('EMPTY-Q')
    if flag:
        issues.append((i, q, flag))
    rows.append((i, q.get('subj'), q.get('chap') or q.get('part'), q.get('q'), opts, q.get('ans'), ';'.join(flag)))

out = io.open('/home/dilshan/boardprep/QUIZ_VERIFY_50.md', 'w', encoding='utf-8')
out.write('# BoardPrep — 50 random questions (answerable) verification\n\n')
out.write('Seed 20261122. Ye sirf STRUCTURE/consistency check hai — answer ki textbook se sahi-yanahi '
          'is list se dilshan khud milaye (main textbook access ke bina yeh nahi keh sakti).\n\n')
out.write('## Consistency issues: %d\n\n' % len(issues))
out.write('| # | Subject | Chapter | Question | Options | Answer | Flag |\n|---|---|---|---|---|---|---|\n')
for r in rows:
    out.write('| %d | %s | %s | %s | %s | %s | %s |\n' % (
        r[0], r[1], (r[2] or '')[:30], r[3][:90].replace('|', '/'),
        ' / '.join(str(x)[:22] for x in r[4]), r[5], r[6]))
out.close()

# CBSE official bank — structural check
try:
    b = io.open('/home/dilshan/boardprep/assets/data/board-bank.js', encoding='utf-8').read()
    print('board-bank size', len(b), 'bytes')
except Exception as e:
    print('board-bank read err', e)

print('sampled:', len(sample), 'structure issues:', len(issues))
for i, q, f in issues:
    print('  FLAG', i, f, str(q.get('q'))[:60])
