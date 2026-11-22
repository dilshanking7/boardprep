#!/usr/bin/python3
# BoardPrep notes generator — languages (Hindi/English/Sanskrit)
# Har chapter ka apna block: shabdarth, lekhak, saar, prashn-uttar, vyakaran
import json, io, re

def H2(t): return ["h2", t]
def H3(t): return ["h3", t]
def P(t): return ["p", t]
def UL(a): return ["ul", a]
def HL(t, c="#7c3aed"): return ["hl", t, c]
def BOX(t, x): return ["box", t, x]
def LINK(t, u): return ["link", t, u]
def Q(a, b): return ["qa", a, b]
def TEN(a): return ["ten", a]

src = io.open('/home/dilshan/boardprep/assets/data/stories.js', encoding='utf-8').read()
i = src.index('window.STORIES'); j = src.index('=', i) + 1
js = src[j:].strip().rstrip(';')
js = re.sub(r'//[^\n]*', '', js)
js = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', js)
S = json.loads(js)

BLOCKS = {
 'hindi': {
   'read': ['पहली बार: ध्यान से पढ़ो और अनेक शब्दों के अर्थ लिखो।',
            'लेखक/कवि का परिचय और युग-पृष्ठभूमि याद रखो — परीक्षा में पूछा जाता है।',
            'कथावस्तु/कविता का सार तीन लाइनों में लिखो।',
            'मुख्य पात्रों के नाम और उनके गुण अलग से लिखो।',
            'नीचे दिए प्रश्नों के उत्तर अपने शब्दों में लिखो।'],
   'title': 'कैसे पढ़ें (हिंदी)',
   'vocab': 'शब्दार्थ और परिभाषिक शब्द',
   'vocabp': 'इस अध्याय के मुख्य शब्दों के अर्थ और परिभाषिक शब्द किताब से लिखो — (verify)',
   'points': ['लेखक/कवि का नाम', 'कथा/कविता का सार', 'मुख्य पात्र', 'मुख्य संवाद/पंक्तियाँ', 'व्याकरण (संधि, समास, अलंकार)', 'पाठ का उद्देश्य', 'शीर्षक का अर्थ', 'भावार्थ', 'मुहावरे', 'परीक्षा के लिए मुख्य प्रश्न'],
 },
 'english': {
   'read': ['First read: underline new words and write their meanings.',
            'Note the author/poet and the background — it is asked in exams.',
            'Write the summary in three lines in your own words.',
            'List the main characters and their qualities.',
            'Answer the questions below in your own words.'],
   'title': 'How to read (English)',
   'vocab': 'Vocabulary and definitions',
   'vocabp': 'Write the meanings of the key words and definitions from the textbook — (verify)',
   'points': ['Author/poet name', 'Summary (3 lines)', 'Main characters', 'Key lines/quotes', 'Grammar (tenses, voice, narration)', 'Theme/moral', 'Title meaning', 'Figures of speech', 'Word meanings', 'Important exam questions'],
 },
 'sanskrit': {
   'read': ['प्रथम बार: श्लोक/अध्याय का उच्चारण ध्यान से करो और नए शब्दों के अर्थ लिखो।',
            'लेखक/ऋषि का परिचय याद रखो।',
            'श्लोक का सार/भावार्थ तीन लाइनों में लिखो।',
            'व्याकरण (संधि, समास, कारक, प्रत्यय) अलग से लिखो।',
            'नीचे के प्रश्नों के उत्तर संस्कृत या हिंदी में लिखो।'],
   'title': 'कैसे पढ़ें (संस्कृत)',
   'vocab': 'शब्दार्थ और परिभाषिक शब्द',
   'vocabp': 'इस अध्याय के शब्दार्थ और परिभाषिक शब्द किताब से लिखो — (verify)',
   'points': ['लेखक/ऋषि का नाम', 'श्लोक/अध्याय का सार', 'भावार्थ', 'मुख्य श्लोक', 'व्याकरण (संधि/समास)', 'कारक और प्रत्यय', 'उच्चारण', 'शब्दार्थ', 'पाठ का उद्देश्य', 'परीक्षा के प्रश्न'],
 }
}

def build(key):
    cfg = BLOCKS[key]
    out = []
    for it in S.get(key, []):
        title = it.get('t', '')
        author = it.get('a', '')
        summ = it.get('hi', '') if key != 'english' else it.get('en', '')
        blocks = [H2(title)]
        if author:
            blocks.append(H3('लेखक / कवि: ' + author))
        blocks.append(P(summ))
        blocks.append(H3(cfg['title']))
        blocks.append(UL(cfg['read']))
        blocks.append(H3(cfg['vocab']))
        blocks.append(P(cfg['vocabp']))
        blocks.append(TEN(cfg['points']))
        blocks.append(Q('इस अध्याय का सार अपने शब्दों में लिखो।', summ))
        blocks.append(LINK('इस अध्याय के प्रश्न →', '#/story/%s?c=%s' % (key, title)))
        out.append({"ch": title, "blocks": blocks})
    with io.open('/home/dilshan/boardprep/assets/data/notes_%s.js' % key, 'w', encoding='utf-8') as f:
        f.write('// BoardPrep notes — %s (generated from stories)\n' % key)
        f.write('window.NOTES_%s = %s;\n' % (key.upper(), json.dumps(out, ensure_ascii=False, indent=1)))
    print('notes_%s.js: %d chapters' % (key, len(out)))

for k in ('hindi', 'english', 'sanskrit'):
    build(k)
