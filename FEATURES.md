# BoardPrep v3.0 — Nayе Features

Sab kuch **offline** aur **free** — koi API key/payment nahi. Data localStorage me (sirf us device par).

## 1. Student Progress Dashboard (`#/progress`)
- Total questions attempted, correct, incorrect
- Subject-wise performance (bar + %)
- Chapter-wise performance (sorted, weak pehle)
- Weak chapters (n≥3 aur <50%) — seedha subject page par link
- 7-din ka bar chart, daily goal, best day
- Mock exam history

## 2. Daily Study Streak
- Streak counter (aaj 0 ho to kal se ginti)
- Daily goal (default 5 sawal)
- 7-din ka calendar/chart
- Har attempt par din mark hota hai

## 3. Real Board Exam Simulator (`#/exam`)
- Subject, kitne sawal (10/20/40/80), samay (15/30/60/90 min)
- Board pattern note — verified ho to "board verified", nahi to clearly general
- Live countdown timer (1s tick) + **auto-submit** samay khatam hone par
- Question palette (1..N) — kisi bhi sawal par jump
- Marks per question, prev/next
- Submit → result (marks, %, attempted) + har sawal ka review (sahi/galat)
- Exam history progress me

## 4. Smart Revision System (`#/revision`)
- **Wrong** tab — quiz me galat hue sawal apne aap save
- **Bookmarked** tab — subject page par ☆/★ se save
- Question + sahi answer ke saath

## 5. Study Assistant (`#/assistant`)
- Offline rule-based (koi model/API nahi — label par saaf likha hai)
- Sawal likho → matching chapter notes (notes section se link) + similar practice questions
- Subject chips

## Bonus
- Har question card par bookmark button
- Exam ke baad bhi progress record hota hai
