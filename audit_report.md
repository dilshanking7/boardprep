# BoardPrep v2 — Data Audit Report

Sirf audit — content automatically rewrite NAHI kiya gaya. Jo verify nahi hua, wo "verify required" mark hai.

| # | Check | Result | Detail |
|---|---|---|---|
| 1 | Duplicate questions | OK | 0 texts |
| 2 | Missing question text | OK | 0 |
| 3 | MCQ without options | OK | 0 |
| 4 | MCQ without correct answer | HIGH | 547 (quiz se already excluded) |
| 5 |   by subject | INFO | sst:321, maths:97, hindi:50, english:41, science:38 |
| 6 | Invalid answer label/index | OK | 0 |
| 7 | Unknown subject key | OK | 0 |
| 8 | Missing PDF files | OK | 0 missing / 26 total |
| 9 | PDF per board | INFO | None:26 |
| 10 | Formulas entries | OK | 127 across 21 chapters; empty=0 |
| 11 | Periodic table elements | OK | 118 elements, Z range 1..118 |
| 12 | Periodic symbols unique | OK | True |
| 13 | Periodic missing hi/en | OK | 0 |
| 14 | Lab reagents | OK | 31 |
| 15 | Lab reactions | OK | 36 |
| 16 | Lab reactions incomplete | OK | 0 / 36 |
| 17 | Diagrams without labels/parts | OK | 0 / 20 |
| 18 | Timeline events without valid year | OK | 0 / 77 |
| 19 | Timeline events | INFO | 77 |
| 20 | Missing-answer report | INFO | missing_answers.md (547 rows) |
| 21 | Textbook chapters | OK | 81 (hi:37 en:32 sa:12) |
| 22 | Chapters without author | OK | 0 |
| 23 | Brain test answers valid | OK | 20 items |
| 24 | Important dataset board | INFO | JAC |
