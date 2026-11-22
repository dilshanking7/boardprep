# BoardPrep v3.0 — Test Results

## Quiz tests (Chrome, mobile viewport, real clicks)
| Test | Result |
|---|---|
| Right answer select | PASS (score 1/10) |
| Ek hi option par dobara click | PASS (score same 1/10) |
| Options answer ke baad disable | PASS |
| Written: self-right → self-wrong | PASS (score same) |
| Written buttons disable | PASS |
| Next sirf answer ke baad enable | PASS |
| Last question → result | PASS |
| Final score (10/10, 100%) | PASS |
| Retry → purana score reset | PASS |
| Weak chapter calculation | PASS (progress me) |

## Board tests
| Test | Result |
|---|---|
| 29 boards select + hub/subjects/papers/quiz render | PASS (pehle se) |
| Subject mapping | PASS (0 unknown subject key) |
| Language (Hindi/English) | PASS |
| Shared-data warning (non-JAC) | PASS |
| Important label board ke hisaab se | PASS |

## Offline tests
| Test | Result |
|---|---|
| SW install (shell) | PASS code-level; ek file fail hone par bhi install complete |
| `_optics.js` missing entry | FIXED (hataya) |
| PDF/3D/audio cache list + progress | PASS code-level |
| Retry + failure message | PASS code-level |
| APK ke andar shell assets | PASS (index, sw, js, data, 40 PDF, 2 GLB, 5 songs) |
| APK offline runtime | **device nahi hai — untested** |

## Android tests
| Test | Result |
|---|---|
| Back button (WebView history) | code present |
| App restart | standard Activity |
| PDF opening (FileProvider) | code + file_paths limited |
| Screen rotation | configChanges handled |
| Low-memory | 3D low-end fallback |
| External links | sirf http/https |
| Permissions | sirf INTERNET (aapt2 verified) |

## Content tests (audit.py)
| Check | Result |
|---|---|
| Duplicate questions | 0 |
| Missing question text | 0 |
| Missing options | 0 |
| Missing correct answer | **547** (quiz se excluded, report banī) |
| Invalid answer label/index | 0 |
| Unknown subject key | 0 |
| Missing PDF files | 0 / 26 |
| Formulas empty entries | 0 |
| Periodic table (118 elements, unique symbols) | OK |
| Lab reactions complete | 36/36 |
| Diagrams with labels | 20/20 |
| Timeline valid years | 77/77 |
| Textbook chapters with author | 81/81 |
| Brain test answers valid | 20/20 |

## Phase 2 UI/UX tests
| Test | Result |
|---|---|
| Design tokens load (light) | PASS (bg rgb(248,250,252)) |
| Dark theme toggle | PASS (bg rgb(11,17,32)) |
| System theme follow | PASS |
| Text size Small/Normal/Large | PASS |
| 5-tab bottom nav labels (hi+en) | PASS |
| Learn page (subjects + resources) | PASS |
| Practice page (bank/quiz/mock/papers) | PASS |
| Profile page (settings rows) | PASS |
| Home dashboard sections | PASS (ring, exam countdown, subject progress, quick actions, tasks) |
| Exam countdown honest estimate | PASS (label + "estimate" note) |
| Toast messages | PASS |
| 27-route sweep, 0 exceptions | PASS |
| Mobile viewport no overflow | PASS (2103/2120 desktop, 420 mobile ok) |

## Route sweep (27 routes, 0 exceptions)
`/` `subjects` `subject/maths` `quiz` `search` `papers` `important` `models` `formulas` `periodic` `lab` `mathlab` `diagrams` `timeline` `stories` `songs` `brain` `notes` `notes/science` `progress` `exam` `revision` `assistant` `help` `tools` — sab render, koi exception nahi.

## Phase 4-6 tests (Nov 22, 2026)

### Question bank (`#/bank`)
| Check | Result |
|---|---|
| Total count | 8356 सवाल |
| Subject filter (विज्ञान) | 2344 सवाल, 28 chapter options |
| Type filter (MCQ) | 1482 |
| Answer-status (बिना जवाब) | 900 |
| Search "ऊर्जा" | 119 |
| Pagination | 20/page, 418 pages, prev/next works |
| Route sweep | 38 routes, 0 exceptions |

### Quiz modes
तेज़ 10 · अध्याय · विषय · मिक्स · कमज़ोर (weak chapters) · रिवीज़न (wrong+bookmarked) · रैंडम · रोज़ की चुनौती (date-seeded — us din सबके लिए वही set)

### Exam simulator
| Check | Result |
|---|---|
| Instructions screen (कुल सवाल/अंक/समय + नियम + pattern) | PASS |
| Begin → run | PASS |
| Mark for review → palette chip marker | PASS |
| Timer auto-submit | PASS |

### Subject tools (`#/calc`) — असली मानों से तुलना
| Input | Expected | Got |
|---|---|---|
| H2SO4 | 98.07 | 98.07 ✓ |
| Ca(OH)2 | 74.10 | 74.09 ✓ |
| CuSO4.5H2O | 249.68 | 249.68 ✓ |
| Al2(SO4)3 | 342.15 | 342.13 ✓ |
| C6H12O6 | 180.16 | 180.16 ✓ |
| NaCl / HCl / KOH / CaCO3 / NH3 | — | सब ✓ |
| pH 3 → [H+] | 1.0e-3 | 1.000e-3 ✓ |
| V=12, I=2 | R=6Ω, P=24W | ✓ |
| f=-20, u=-30 | v=-12 cm | ✓ |
| Punnett Tt×Tt | 1:2:1 (3:1) | ✓ |
| x²-2x-3 | 3, -1 | ✓ |
| HCF/LCM 12,18 | 6 / 36 | ✓ |
| Mean/Median/Mode 4,8,6,5,7 | 6/6/nahi | ✓ |

### Reminders
| Check | Result |
|---|---|
| Save (time + msg) | PASS (localStorage bp_remind_v1) |
| remindCheck fires at set time | PASS |
| Same day dobara nahi | PASS (null) |
| Notification API + in-app toast | PASS (permission-based) |

### Offline download (home page)
| Check | Result |
|---|---|
| Button reachable (पहले dead code था — fix) | PASS |
| 26 PDF + 5 songs cache | PASS (31/31, cache boardprep-v21) |

### APK v4.2
versionCode 6, signed, 62.6 MB; calc.js/study.js/tools routes/notes_science2/notes_jharkhand/sw v21 sab andar.

## Phase 5 — target, update, adaptive (Nov 22, 2026)

### Exam target + countdown (student khud set karta hai)
| Check | Result |
|---|---|
| Pehli baar kholne par `#/target` | PASS (hash `#/target`) |
| Save → target store | `{"exam":"2027-02-01","syllabus":60,"daily":25,"time":"07:30"}` |
| Countdown | `{"days":72,"goal":5014,"done":137,"left":4877,"perDay":68,...}` |
| Reminder auto-on | PASS |
| Home dashboard card | PASS — "मेरा टारगेट 72 दिन बचे · एग्ज़ाम: 2027-02-01 · सिलेबस 70% · आज से रोज़ 82 सवाल" |
| Skip option | PASS (`bp_target_skip`) |

### In-app update banner
| Check | Result |
|---|---|
| version.json live | 200 |
| 4.4 == 4.4 → banner chhupa | PASS |
| 9.9 (test) → banner dikha | PASS — "नया अपडेट आया: v9.9 · TEST banner" + URL + बटन |
| APK me BPApp.update(url) | PASS (dex me mojood) |
| Web par link kholo | PASS |

### Spaced repetition (SM-2 lite, offline)
| Check | Result |
|---|---|
| srsUpdate(ok) | learned 1, due 0 |
| srsUpdate(wrong) | due 1 |
| srsDue(5) | 1 |
| quiz → srs wiring | PASS (quizMark में) |
| revision mode due questions pehle | PASS |

### APK v4.4
versionCode 8, signed, 62.6 MB — target/srs/update sab andar.
