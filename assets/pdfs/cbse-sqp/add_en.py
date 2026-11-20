#!/usr/bin/env python3
"""boards.js me har board ka English metadata jodta hai."""
import re, io

P = '/home/dilshan/boardprep/assets/js/boards.js'
src = open(P, encoding='utf-8').read()

STATE = {
 'cbse': 'All India', 'icse': 'All India', 'nios': 'All India',
 'jac': 'Jharkhand', 'bseb': 'Bihar', 'rbse': 'Rajasthan', 'upmsp': 'Uttar Pradesh',
 'mpbse': 'Madhya Pradesh', 'cgbse': 'Chhattisgarh', 'hbse': 'Haryana', 'pseb': 'Punjab',
 'ubse': 'Uttarakhand', 'hpbose': 'Himachal Pradesh', 'msbhse': 'Maharashtra',
 'kseab': 'Karnataka', 'kbpe': 'Kerala', 'wbbse': 'West Bengal', 'bseodisha': 'Odisha',
 'seba': 'Assam', 'tbse': 'Tripura', 'gseb': 'Gujarat', 'gbshse': 'Goa',
 'bseap': 'Andhra Pradesh', 'bset': 'Telangana', 'tnbse': 'Tamil Nadu',
 'mbose': 'Meghalaya', 'nbse': 'Nagaland', 'mbse': 'Mizoram', 'bsem': 'Manipur',
}
MEDIUM = {
 'cbse': 'English / Hindi', 'icse': 'English', 'nios': 'Hindi / English',
 'jac': 'Hindi / English', 'bseb': 'Hindi / English', 'rbse': 'Hindi / English',
 'upmsp': 'Hindi / English', 'mpbse': 'Hindi / English', 'cgbse': 'Hindi / English',
 'hbse': 'Hindi / English', 'pseb': 'Hindi / English', 'ubse': 'Hindi / English',
 'hpbose': 'Hindi / English', 'msbhse': 'Marathi / Hindi / English',
 'kseab': 'English / Kannada', 'kbpe': 'English / Malayalam', 'wbbse': 'English / Bengali',
 'bseodisha': 'English / Odia', 'seba': 'English / Assamese', 'tbse': 'English / Bengali',
 'gseb': 'English / Gujarati', 'gbshse': 'English', 'bseap': 'English / Telugu',
 'bset': 'English / Telugu', 'tnbse': 'English / Tamil', 'mbose': 'English',
 'nbse': 'English', 'mbse': 'English', 'bsem': 'English',
}
NOTE = {
 'cbse': 'NCERT based. 80 marks theory + 20 internal. The most common pattern.',
 'icse': 'ICSE gives more weightage to English and literature.',
 'nios': 'On-demand exam — you can appear any time. 100 marks theory.',
 'jac': 'JAC: MCQ (1) + Very Short (2) + Short (3) + Long (5). Internal = project + periodic test.',
 'bseb': 'BSEB has a high share of MCQs.',
 'rbse': 'Rajasthan board also asks questions on Rajasthani culture.',
 'upmsp': 'UP Board papers are straightforward and syllabus-based.',
 'mpbse': 'MP Board gives importance to Maths and Science numericals.',
 'cgbse': 'Chhattisgarh board asks questions on local resources.',
 'hbse': 'Haryana board asks questions close to NCERT.',
 'pseb': 'Punjab board offers Punjabi as a language option.',
 'ubse': 'Uttarakhand board asks environment-related questions.',
 'hpbose': 'HPBOSE asks Himalaya-related geography questions.',
 'msbhse': 'Maharashtra board has 35% pass marks.',
 'kseab': 'Karnataka board has 100 marks theory.',
 'kbpe': 'Kerala has 30% pass marks and follows the SCERT syllabus.',
 'wbbse': 'WBBSE values detailed answers.',
 'bseodisha': 'Odisha board follows a 100-mark pattern.',
 'seba': 'Assam board offers Assamese as a language option.',
 'tbse': 'Tripura board offers Bengali as a language option.',
 'gseb': 'GSEB pattern is close to NCERT.',
 'gbshse': 'Goa board offers Konkani as an option.',
 'bseap': 'Andhra board has Telugu as a compulsory option.',
 'bset': 'Telangana board offers Telugu as a language option.',
 'tnbse': 'Tamil Nadu board has a detailed syllabus.',
 'mbose': 'Meghalaya board follows a 100-mark pattern.',
 'nbse': 'Nagaland board uses English medium.',
 'mbse': 'Mizoram board follows a 100-mark pattern.',
 'bsem': 'Manipur board follows a 100-mark pattern.',
}
SEC = {
 'cbse': [('Section A', 'MCQ / Objective (1 mark)'), ('Section B', 'Very Short (2 marks)'),
          ('Section C', 'Short (3 marks)'), ('Section D', 'Long (5 marks)'),
          ('Section E', 'Case Based (4 marks)')],
 'icse': [('Section I', 'Compulsory MCQ (1 mark)'), ('Section II', 'Short Answer (2-3 marks)'),
          ('Section III', 'Long Answer (5-6 marks)')],
 'nios': [('Theory', '100 marks (1, 2, 3, 5 marks)')],
 'jac': [('MCQ', '1 mark each'), ('Very Short', '2 marks'), ('Short', '3 marks'), ('Long', '5 marks')],
 'bseb': [('Objective', '1 mark x 50'), ('Short', '2 marks'), ('Long', '5 marks')],
 'default': [('MCQ', '1 mark'), ('Short', '3 marks'), ('Long', '5 marks')],
 'kseab': [('MCQ', '1 mark'), ('Short', '2 marks'), ('Long', '4 marks')],
 'msbhse': [('MCQ', '1 mark'), ('Short', '3 marks'), ('Long', '5 marks')],
}

def en_for(bid):
    return SEC.get(bid, SEC['default'])

# har board block ke andar English fields jodho
out = []
idx = 0
pattern = re.compile(r'\{ id: "([a-z]+)",')
pos = 0
res = []
for m in pattern.finditer(src):
    bid = m.group(1)
    # entry ka end = note: wali line ke aakhir tak
    ni = src.index('note:', m.start())
    end = src.index('\n', ni)
    line = src[m.start():end]
    if 'state_en' in line:
        continue
    secs = en_for(bid)
    sec_txt = ', '.join('{ t: "%s", d: "%s" }' % (t, d) for t, d in secs)
    add = (', state_en: "%s", medium_en: "%s", note_en: "%s", sections_en: [%s]'
           % (STATE[bid], MEDIUM[bid], NOTE[bid], sec_txt))
    # note ke baad, ' }' se pehle jodho
    new_line = line.rstrip()
    if new_line.endswith('},'):
        new_line = new_line[:-2].rstrip()
    elif new_line.endswith('}'):
        new_line = new_line[:-1].rstrip()
    if new_line.endswith(','):
        new_line = new_line + ' ' + add + ' },'
    else:
        new_line = new_line + add + ' },'
    res.append((m.start(), end, new_line))

for s, e, nl in reversed(res):
    src = src[:s] + nl + src[e:]

open(P, 'w', encoding='utf-8').write(src)
print('boards updated:', len(res))
