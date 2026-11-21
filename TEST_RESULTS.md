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

## Route sweep (27 routes, 0 exceptions)
`/` `subjects` `subject/maths` `quiz` `search` `papers` `important` `models` `formulas` `periodic` `lab` `mathlab` `diagrams` `timeline` `stories` `songs` `brain` `notes` `notes/science` `progress` `exam` `revision` `assistant` `help` `tools` — sab render, koi exception nahi.
