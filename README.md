# BoardPrep — Class 10

**Live:** https://dilshanking7.github.io/boardprep/
Repo: https://github.com/dilshanking7/boardprep

Mobile-first study app for Class 10 board exams. Ek hi website me sab boards,
same format, Hindi/English UI. Har board ka apna pattern, bhasha aur color.

## Run

```bash
cd ~/boardprep
python3 -m http.server 8000
# browser me: http://127.0.0.1:8000/
```

## Data refresh (questions/PDFs)

```bash
python3 build_data.py
```

- `../class 10/` (E:\logo\class 10) se MCQ, PYQ, model papers, important questions
- `../class10/website/js/data` se chapter-wise questions
- output: `assets/data/data.js` + `assets/pdfs/`

## Structure

```
index.html
assets/css/style.css      base UI
assets/css/tools.css      tools + components
assets/data/data.js     8356 prashn + freq + papers
assets/data/board-bank.js  board-specific banks (CBSE: 84 official MCQ)
assets/js/subjects.js   subject list + map (saare boards)
assets/js/boards.js       board config (29) — pattern, bhasha, color, sections
assets/js/i18n.js         Hindi/English labels
assets/js/app.js          state, router, home dashboard, subjects, quiz, search, papers, important
assets/js/tools.js        learn/practice/profile, notes, formulas, periodic, lab, mathlab, diagrams, timeline, stories, brain, settings
assets/js/study.js        progress, streak, mock exam, revision, study assistant (offline)
assets/js/icons.js        ek jaisa SVG icon set (Lucide-style, stroke)
assets/data/data.js       generated questions (8356) + freq + papers
assets/data/important.js  important questions 2027 (clean, numbered)
assets/data/formulas.js   maths 14 chapters + physics/chemistry/bio formulas + tricks
assets/data/periodic.js   118 elements
assets/data/lab.js        reagents + reactions
assets/data/diagrams.js   20 diagrams + har part ki jaankari
assets/data/timeline.js   history/SST timeline (77 events)
assets/data/brain.js      brain level test (20 sawal)
assets/data/models3d.js   3D catalog — biology 21 + physics 16
assets/js/models3d.js     3D viewer (three.js + GLTF + raycast tap)
assets/js/scenes3d.js     procedural 3D scenes (optics, circuits, bio)
assets/js/models3d-ui.js  3D page controller
assets/vendor/three/      three.js r160 + OrbitControls + GLTFLoader + RoomEnvironment
assets/vendor/three/models/  anatomy-male.glb / anatomy-female.glb (CC BY 4.0)
assets/vendor/three/catalog.json  147 named structures
3D realism: ACESFilmic tone mapping, RoomEnvironment IBL, per-structure colour palette
(models3d-ui.js REAL map), physical glass/transmission, metallic mirrors, glowing rays.
Optics (mirror/lens) ray diagrams case-wise bante hain — `scenes3d.js` ka `optics(kind, caseIdx)`
asli ray tracing (parallel ray + focus/centre ray) karta hai, aur model page pe case chips
(`models3d-ui.js`) se 1-6 cases badalte hain. Optics scene ko `Viewer.frameFlat()` se seedha
2D view milta hai (axis horizontal).
assets/pdfs/              PYQ / model papers
assets/pdfs/cbse-sqp/     CBSE official SQP + MS 2025-26 (aur 2024-25) + parser scripts
build_data.py             data builder
```

## Board-specific question banks

Har board ke apne prashn ho sakte hain. CBSE ke liye `assets/pdfs/cbse-sqp/` me
cbseacademic.nic.in ke official Class X Sample Question Papers (2025-26 + 2024-25)
download kiye gaye hain. `parse.py` un PDF se MCQ nikalta hai, `gen_bank.py`
`assets/data/board-bank.js` banata hai.

`app.js` me `BOARD_BANK[board]` active hota hai: board badalte hi us board ka bank,
uska language (CBSE = English) aur papers load ho jate hain. Board ki English
metadata (`state_en`, `medium_en`, `note_en`, `sections_en`) `boards.js` me hai.

## Content ki English (`assets/data/en-dict.js`)

English mode me `app.js` ka `applyContentLang()` content globals
(FORMULAS, PERIODIC, LAB, DIAGRAMS, TIMELINE, IMPORTANT, BRAIN, MODELS3D) ko
`window.HI_EN` dictionary se translate karke replace karta hai. Dictionary
`assets/pdfs/cbse-sqp/translate.py` se banta hai (MyMemory API). Nayi Hindi string
aaye to pehle `hi_strings.json` dobara nikalo, phir `translate.py` chalao — cache
`/tmp/hi_en_cache.json` me ban rehta hai.

- Hindi mode me `L(en)` single-argument wale calls English de dete the (bug) — ab
  `L(en, hi)` ka `hi` default `en` hai, aur tools.js ke saare L() calls me Hindi
  fallback likha hai.
- `pick(hi, en)` = lang ke hisaab se naam (diagrams/models/stories me use hota hai).

## Pages

| Route | Kya hai |
|---|---|
| `#/` | home dashboard — आज का लक्ष्य (ring), exam countdown, continue learning, विषय प्रगति, quick actions, weak chapters, आज के काम, tools |
| `#/learn` | subjects + सीखने के साधन (notes, stories, diagrams, 3D, formulas, periodic, timeline, lab) |
| `#/practice` | question bank, quiz, mock exam, papers, important, revision, search, brain, songs |
| `#/progress` | analytics — attempted/correct/wrong, streak, 7-din chart, weak chapters, mock history |
| `#/profile` | नाम, board, भाषा, थीम, टेक्स्ट साइज़, बैकअप/रिस्टोर/क्लियर, अबाउट, प्राइवेसी |
| `#/revision` | गलत + bookmarked सवाल |
| `#/exam` | mock exam — instructions + timer, auto-submit, palette, mark-for-review |
| `#/bank` | प्रश्न बैंक — subject/type/answer-status/chapter filter, search, pagination |
| `#/calc` | विषय टूल — molar mass (hydrate/bracket), pH, Ohm, दर्पण/लेंस, Punnett, वर्गमूल, HCF/LCM, stats |
| `#/remind` | अध्ययन अनुस्मारक — समय/संदेश, रोज़ एक बार (ऑफ़लाइन) |
| `#/quiz` | 8 modes — तेज़/अध्याय/विषय/मिक्स/कमज़ोर/रिवीज़न/रैंडम/रोज़ |
| `#/subjects`, `#/subject/:key` | chapter/type filter, pagination |
| `#/quiz` | setup → checking → result + weak chapters |
| `#/search` | Hindi + English search |
| `#/notes`, `#/notes/:group`, `#/note/:group/:ch` | 140 अध्याय नोट्स + 81 भाषा अध्याय (रंगबिरंगा) |
| `#/tools` | saare tools ka hub |
| `#/models`, `#/model/biology/:id`, `#/model/physics/:id` | 3D मॉडल — घुमाओ, हिस्सा छूकर देखो |
| `#/formulas` | maths/physics/chemistry/bio — 127 formulas + tricks |
| `#/periodic` | 118 तत्व, tap → विवरण, तापमान स्लाइडर (ठोस/द्रव/गैस) |
| `#/lab` | टैप करके दो पदार्थ मिलाओ → अभिक्रिया + सूत्र |
| `#/mathlab` | सूत्र याद, उत्तर लिखो, जाँचो + लिखने का पेज |
| `#/diagrams`, `#/diagram/:id` | 20 diagrams, हर hisse पर टैप |
| `#/timeline` | 77 घटनाएँ, साल-दर-साल |
| `#/stories`, `#/stories/:subj`, `#/story/:subj?c=` | अध्यायवार कहानी/सारांश + मुख्य बातें + अभ्यास |
| `#/brain` | 20 सवाल, brain level + category report |
| `#/papers` | PYQ + model papers (sal ke hisaab se) |
| `#/important` | 2027 के महत्वपूर्ण प्रश्न + strategy + tips + FAQ |
| `#/songs` | फ़ोकस गीत (audio player) |
| `#/help` | कैसे use करें — 7 steps |

## v3.0 design system

- **Tokens** — `assets/css/style.css` ke `:root` me `--color-*`, `--radius-*`, `--shadow-*`,
  `--space-*`, `--fs-*`. Board ka rang `--accent`/`--accent-soft` me aata hai; baaki
  semantic tokens usi par depend karte hain, isliye har board par UI consistent rehta hai.
- **Dark theme** — `html[data-theme="dark"]` + Profile → Theme (System/Light/Dark).
  System preference bhi respect hoti hai.
- **Text size** — Small / Normal / Large (Profile → Text size).
- **Typography** — Inter → Roboto → Noto Sans → Noto Sans Devanagari → Mangal fallback
  (Devanagari Android par bhi sahi render hota hai).
- **Icons** — `assets/js/icons.js` ka ek hi SVG set (stroke-based, 24px). Koi emoji nahi.
- **Accessibility** — `:focus-visible`, `prefers-reduced-motion`, safe-area insets,
  touch targets ≥ 44px, colour ke saath saath icon/label bhi status dikhata hai.
- **Micro-interactions** — button press feedback, card transitions, toast, skeleton
  shimmer, sheet/slide-up animation.

## Reports (repo me)

`BUG_REPORT.md`, `SECURITY_REPORT.md`, `PERFORMANCE_REPORT.md`, `TEST_RESULTS.md`,
`FEATURES.md`, `audit_report.md`, `missing_answers.md`

## Notes

- Data NCERT-syllabus based hai; board selection pattern/medium dikhata hai.
- 547 MCQ me answer parse nahi hua — quiz unhe skip karta hai (`missing_answers.md`).
- 28 boards ka apna bank nahi — shared NCERT/JAC practice + साफ़ लेबल.
- Stories: 81 अध्याय का नाम, लेखक और Hindi/English सारांश `assets/data/stories.js` में;
  पूरा पाठ्य-पुस्तक text book se jodna baaki hai.
- Sab progress localStorage में (device par hi) — कोई server/analytics नहीं।

## Board switching

Board badalte hi: accent color, pattern (80+20 / 100 / 100×5), bhasha (Hindi/English),
subject list, exam, pass marks aur pattern card sab badal jaate hain.

## Notes

- Data NCERT-syllabus based hai; board selection pattern/medium dikhata hai.
- 547 MCQ me answer parse nahi hua — quiz unhe skip karta hai.
- Stories: 81 अध्याय (हिंदी 37 + English 32 + Sanskrit 12) ka नाम, लेखक और Hindi/English सारांश `assets/data/stories.js` me hai; पूरा pathya-text book se jodna baaki hai.
