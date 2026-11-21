# BoardPrep v3.0 — BUG REPORT

Branch: `v2-audit-fixes` (base: master). Backup: `~/.hermes/cache/scratch/boardprep_backup_20261121_1657`

## FIXED (verified)

| # | Bug | File | Fix | Test |
|---|---|---|---|---|
| 1 | Written quiz par self-right/self-wrong baar-baar click → score baar-baar badhta | assets/js/app.js | `quizMark()` centralized — `ok[i]` pehle se set ho to ignore; buttons `disabled`; Next sirf answer ke baad | MCQ double-click 1/10→1/10 PASS; written selfright→selfwrong same PASS; retry reset PASS |
| 1b | Right→Wrong / Wrong→Right toggle score galat | assets/js/app.js | state lock + single increment | PASS |
| 2 | 547 MCQ ka answer missing | assets/data/data.js (no change) | pehle se `answerable()` filter quiz se exclude karta hai — abhi bhi excluded; report banī | `missing_answers.md` (547 rows) |
| 3 | 29 boards par shared bank "board-specific" lagta | assets/js/app.js | non-JAC board par "shared JAC model papers/bank" warning note | verified earlier |
| 4 | Important questions shared data ko selected board ke naam se dikhta | assets/js/app.js + important.js | `impLabel()` — board match par "Board-specific practice", else "NCERT-based General Practice Questions"; "5 अंक (पक्का)" jaisa unverified claim hatao | verified |
| 5 | `sw.js` SHELL me `assets/js/_optics.js` tha jo exist nahi karta → poora offline install fail | sw.js | entry hatao; `cache.add` har file alag try/catch (ek fail = poora fail nahi) | APK me `_optics.js` False |
| 6 | Offline coverage adhura | sw.js + tools.js | PDF+audio+GLB+diagram cache list, retry (1x), progress `done/total/fail`, failure par "poora nahi hua" message, SHELL_STATUS report | code verified |
| 7 | APK card v1.0 link dikhta (app v2.0) | assets/js/app.js | v3.0 link; card click ke baad remove; APK ke andar card hide | verified |
| 8 | localStorage calls try/catch ke bahar | assets/js/app.js | `storeGet()`/`storeSet()` helpers — crash nahi, default value | verified |
| 9 | Streak calculation infinite loop | assets/js/study.js | `streak()` likha dobara — aaj 0 ho to kal se ginti | 1 din data → streak 1 PASS |
| 10 | Bookmarks UI se add nahi ho rahe the | assets/js/app.js + study.js | har question card par ☆/★ bookmark button | verified |
| 11 | `window.state` undefined errors in study.js | assets/js/study.js | `lang()` helper `window.BP.state` se | exam start PASS |
| 12 | Timeline truncated text | (pura data sahi tha) | — | 77 events valid year |

## KNOWN / LIMITATIONS (honest)

- **547 MCQ answers nahi hain** — official answer key ke bina nahi bharo. Quiz inhe skip karta hai. Report: `missing_answers.md`.
- **28 boards ka apna question bank nahi** — sirf JAC + CBSE (84 official) ka bank alag hai. Baaki sab shared NCERT/JAC practice use karte hain, aur UI me sahi label lagta hai. Kisi board ke questions ko "official PYQ" nahi kaha jata.
- **AI Study Assistant ek rule-based assistant hai** (offline, koi API/model nahi) — apne label par likha hai. Asli LLM nahi.
- **APK phone par runtime test nahi hua** — koi physical device nahi. Structure, signature, contents, permissions verify kiye. WebView behaviour (PDF viewer, 3D, offline) code-level + web-level verify.
