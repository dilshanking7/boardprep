#!/usr/bin/env python3
"""tools.js ke Hindi strings ko i18n ke pe le jao (v2 — poora context ke saath)."""
P = '/home/dilshan/boardprep/assets/js/tools.js'
s = open(P, encoding='utf-8').read()

if 'function L(en, hi)' not in s:
    s = s.replace(
        "  var t = BP.t, esc = BP.esc, state = BP.state;",
        "  var t = BP.t, esc = BP.esc, state = BP.state;\n"
        "  function L(en, hi) { return state.lang === 'en' ? en : hi; }", 1)

pairs = [
    ('<div class="empty">सूत्र डेटा उपलब्ध नहीं है।</div>',
     '<div class="empty">' + "'+L('No formula data available.')+'" + '</div>'),
    ('<div class="empty">आवर्त सारणी का डेटा उपलब्ध नहीं है।</div>',
     '<div class="empty">' + "'+L('No periodic table data available.')+'" + '</div>'),
    ('<div class="pt-label">लैंथेनाइड (57-71)</div>',
     '<div class="pt-label">' + "'+L('Lanthanides (57-71)')+'" + '</div>'),
    ('<div class="pt-label">एक्टिनाइड (89-103)</div>',
     '<div class="pt-label">' + "'+L('Actinides (89-103)')+'" + '</div>'),
    ('<div class="empty">किसी तत्व पर टैप करें — पूरा विवरण यहाँ दिखेगा।</div>',
     '<div class="empty">' + "'+L('Tap an element — full details will appear here.')+'" + '</div>'),
    ("var catNm = { alkali: 'तालकीय', alkaline: 'क्षारीय मिश्र', transition: 'संक्रमण धातु', 'post-transition': 'उत्तर-संक्रमण', metalloid: 'अर्धधातु', nonmetal: 'अधातु', halogen: 'हैलोजन', noble: 'कांज्य गैस', lanthanide: 'लैंथेनाइड', actinide: 'एक्टिनाइड' }[el.cat] || el.cat;",
     "var catNm = { alkali: L('Alkali'), alkaline: L('Alkaline'), transition: L('Transition metal'), 'post-transition': L('Post-transition'), metalloid: L('Metalloid'), nonmetal: L('Non-metal'), halogen: L('Halogen'), noble: L('Noble gas'), lanthanide: L('Lanthanide'), actinide: L('Actinide') }[el.cat] || el.cat;"),
    ('<div class="empty">लैब डेटा उपलब्ध नहीं है।</div>',
     '<div class="empty">' + "'+L('No lab data available.')+'" + '</div>'),
    ('<div class="empty">पहले दो पदार्थ चुनो।</div>',
     '<div class="empty">' + "'+L('Pick two substances first.')+'" + '</div>'),
    ('<div class="board-group" style="margin-top:0">बने पदार्थ</div>',
     '<div class="board-group" style="margin-top:0">' + "'+L('Products')+'" + '</div>'),
    ('<div class="board-group" style="margin-top:0">क्या हुआ</div>',
     '<div class="board-group" style="margin-top:0">' + "'+L('What happened')+'" + '</div>'),
    ("'<div class=\"note\">शर्त: ' + esc(hit.cond) + '</div>'",
     "'<div class=\"note\">' + L('Condition: ') + esc(hit.cond) + '</div>'"),
    ("placeholder=\"अपना उत्तर यहाँ लिखो\"", "placeholder=\"' + L('Type your answer here') + '\""),
    ('<div class="empty">डायग्राम डेटा उपलब्ध नहीं है।</div>',
     '<div class="empty">' + "'+L('No diagram data available.')+'" + '</div>'),
    ("+ ' भाग</div></div>'", "+ ' ' + L('parts') + '</div></div>'"),
    ('<div class="empty">किसी नंबर वाले हिस्से पर टैप करें।</div>',
     '<div class="empty">' + "'+L('Tap a numbered part.')+'" + '</div>'),
    ('<div class="board-group">सभी भाग</div>',
     '<div class="board-group">' + "'+L('All parts')+'" + '</div>'),
    ('<div class="empty">टाइमलाइन डेटा उपलब्ध नहीं है।</div>',
     '<div class="empty">' + "'+L('No timeline data available.')+'" + '</div>'),
    ("+ ' अध्याय</div>'", "+ ' ' + L('chapters') + '</div>'"),
    ("+ ' मुख्य बातें · ' +", "+ ' ' + L('key points') + ' · ' +"),
    ("+ ' प्रश्न</div></div>'", "+ ' ' + L('questions') + '</div></div>'"),
    ("+ ' मुख्य बातें</div>'", "+ ' ' + L('key points') + '</div>'"),
    ('<div class="empty">ब्रेन टेस्ट डेटा उपलब्ध नहीं है।</div>',
     '<div class="empty">' + "'+L('No brain test data available.')+'" + '</div>'),
    ('<div class="board-group">उत्तर व व्याख्या</div>',
     '<div class="board-group">' + "'+L('Answers and explanations')+'" + '</div>'),
    ("(ok ? 'सही' : 'गलत')", "(ok ? L('Correct') : L('Wrong'))"),
    ('<div class="note">कोई प्रश्न दोबारा नहीं आएगा। ईमानदारी से उत्तर दो — यही असली level बताएगा।</div>',
     '<div class="note">' + "'+L('No question repeats. Answer honestly — that is the real level.')+'" + '</div>'),
    ("<h2>3D मॉडल</h2>", "<h2>' + '3D ' + t('models_word') + '</h2>'"),
    ("<span class=\"note\">घुमाओ · छूकर देखो</span>", "<span class=\"note\">' + t('hub_models_sub') + '</span>'"),
]
n = 0
for a, b in pairs:
    if a in s:
        s = s.replace(a, b)
        n += 1
    else:
        print('NOT FOUND:', a[:60])
open(P, 'w', encoding='utf-8').write(s)
print('replaced', n, 'of', len(pairs))
