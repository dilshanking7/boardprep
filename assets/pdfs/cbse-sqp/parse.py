#!/usr/bin/env python3
"""CBSE Class X SQP parser -> JSON question bank (English). v2"""
import re, json, sys, os

BASE = os.path.dirname(os.path.abspath(__file__))

def lines_of(path):
    txt = open(path, encoding='utf-8').read()
    out = []
    for ln in txt.split('\n'):
        ln = ln.rstrip()
        if ln.startswith('=== PAGE'):
            continue
        out.append(ln.strip())
    return out

QSTART = re.compile(r'^(\d{1,2})[.)]\s*(\S.*)$')
QSTART2 = re.compile(r'^(\d{1,2})\s+(\S.{5,})$')
OPTMARK = re.compile(r'(?<![A-Za-z])\(?([A-D])[).]\s*')

def clean(text):
    text = re.sub(r'\*Please note that the assessment scheme.*?2025-26', '', text)
    text = re.sub(r'Page \d+ of \d+', '', text)
    text = re.sub(r'DIRECTIONS:.*', '', text)
    return text

def extract_opts(text):
    ms = list(OPTMARK.finditer(text))
    seq = []
    want = 'A'
    for m in ms:
        if m.group(1) == want:
            seq.append(m)
            want = chr(ord(want) + 1)
        if want == 'E':
            break
    if len(seq) < 2:
        return [], 0
    opts = []
    for k in range(len(seq)):
        s = seq[k].end()
        e = seq[k + 1].start() if k + 1 < len(seq) else len(text)
        opts.append(text[s:e].strip(' .,;'))
    return opts, seq[0].start()

def parse_sqp(path):
    lines = lines_of(path)
    qs = []
    i, n = 0, len(lines)
    while i < n:
        m = QSTART.match(lines[i]) or QSTART2.match(lines[i])
        if m and 1 <= int(m.group(1)) <= 60:
            num = int(m.group(1))
            j = i + 1
            block = []
            while j < n:
                if (QSTART.match(lines[j]) or QSTART2.match(lines[j])) and len(lines[j]) < 250:
                    break
                if re.match(r'^(Section|SECTION|Sr\.No)', lines[j]):
                    break
                block.append(lines[j])
                j += 1
            text = ' '.join(block)
            text = re.sub(r'\s+', ' ', text).strip()
            text = clean(text)
            # hatao marks wale trailing numbers
            text = re.sub(r'\s+\d{1,2}\s*$', '', text)
            opts, opos = extract_opts(text)
            if len(opts) >= 2:
                qtext = (m.group(2) + ' ' + text[:opos]).strip(' .,;')
                # question text me se leading "Q.No" / number hatao
                qtext = re.sub(r'^\W*\d{1,2}[.)]?\s*', '', qtext)
                if len(qtext) > 15 and len(opts) <= 4:
                    qs.append({'n': num, 'q': qtext, 'opts': opts})
            i = j
        else:
            i += 1
    return qs

def parse_ms(path):
    lines = lines_of(path)
    ans = {}
    ms1 = re.compile(r'^(\d{1,2})\s+([A-D])[).]\s*(.*)$')
    ms2 = re.compile(r'^(\d{1,2})[.)]\s*\(([A-D])\)\s*(.*)$')
    ms3 = re.compile(r'^(\d{1,2})\s+([A-D])\s*[-–]\s*(.*)$')
    for ln in lines:
        m = ms1.match(ln) or ms2.match(ln) or ms3.match(ln)
        if m:
            ans[int(m.group(1))] = (m.group(2), m.group(3).strip())
    return ans

if __name__ == '__main__':
    subs = sys.argv[1:] or ['Science', 'MathsStandard', 'SocialScience', 'EnglishL']
    for s in subs:
        sqp = os.path.join(BASE, s + '-SQP.txt')
        ms = os.path.join(BASE, s + '-MS.txt')
        if not os.path.exists(sqp):
            print(s, 'NO SQP'); continue
        qs = parse_sqp(sqp)
        ans = parse_ms(ms) if os.path.exists(ms) else {}
        hit = 0
        for q in qs:
            a = ans.get(q['n'])
            if a:
                hit += 1
                q['ans'] = a[0]
                q['exp'] = a[1]
            else:
                q['ans'] = ''
                q['exp'] = ''
        print(s, 'questions:', len(qs), 'with answer:', hit)
        json.dump(qs, open(os.path.join(BASE, s + '.json'), 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)
