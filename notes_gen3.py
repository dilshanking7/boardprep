import re
#!/usr/bin/python3
# BoardPrep notes generator — languages (from STORIES data)
import json, io, re

def H2(t): return ["h2", t]
def H3(t): return ["h3", t]
def P(t): return ["p", t]
def UL(a): return ["ul", a]
def HL(t, c="#7c3aed"): return ["hl", t, c]
def BOX(t, x): return ["box", t, x]
def LINK(t, u): return ["link", t, u]

src = io.open('/home/dilshan/boardprep/assets/data/stories.js', encoding='utf-8').read()
i = src.index('window.STORIES')
j = src.index('=', i) + 1
js = src[j:].strip().rstrip(';')
js = re.sub(r'//[^\n]*', '', js)
js = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', js)
S = json.loads(js)

def build(key, label):
    out = []
    for it in S.get(key, []):
        title = it.get('t', '')
        author = it.get('a', '')
        summ = it.get('hi', '') if key != 'english' else it.get('en', '')
        summ_en = it.get('en', '')
        blocks = [H2(title)]
        if author:
            blocks.append(H3("लेखक / कवि: " + author))
        blocks.append(P(summ))
        if key == 'english':
            blocks.append(P("Hindi summary: " + it.get('hi', '')))
        blocks.append(H3("कैसे पढ़ें"))
        blocks.append(UL([
            "पहली बार: ध्यान से पढ़ो, अनेक शब्दों के अर्थ लिखो।",
            "दूसरी बार: पात्रों, घटनाओं और संवाद पर ध्यान दो।",
            "अपने शब्दों में सारांश लिखो — यही तुम्हारा note है।",
            "मुख्य पंक्तियाँ/उद्धरण अलग से लिख लो — परीक्षा में उपयोगी।"
        ]))
        blocks.append(BOX("याद रखो", summ))
        blocks.append(LINK("इस अध्याय के प्रश्न →", "#/story/%s?c=%s" % (key, title)))
        out.append({"ch": title, "blocks": blocks})
    with io.open('/home/dilshan/boardprep/assets/data/notes_%s.js' % key, 'w', encoding='utf-8') as f:
        f.write('// BoardPrep notes — %s (generated from stories)\n' % key)
        f.write('window.NOTES_%s = %s;\n' % (key.upper(), json.dumps(out, ensure_ascii=False, indent=1)))
    print('notes_%s.js: %d chapters' % (key, len(out)))

build('hindi', 'हिंदी')
build('english', 'English')
build('sanskrit', 'संस्कृत')
