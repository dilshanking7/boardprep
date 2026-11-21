# BoardPrep v3.0 — Performance Report

## Site sizes (before → after)

| Asset | Pehle | Ab | Kaise |
|---|---|---|---|
| Audio (5 songs) | 42 MB | **14 MB** | ffmpeg 64kbps mono 22050 Hz |
| APK | 99.6 MB | **65.6 MB** | audio + site sync |
| data.js (question bank) | 5.1 MB | 5.1 MB | as-is (offline zaroori) |
| PDFs | 43 MB | 43 MB | as-is (26 papers + 14 PYQ/SQP) |
| JS total | ~192 KB | ~260 KB | + study.js (features) |

## Improvements

1. **Search** — pehle har keystroke par 8356 questions scan (norm() har baar). Ab ek normalized index banta hai + 160ms debounce.
2. **3D**
   - Low-end detection (`hardwareConcurrency<=4 && deviceMemory<=4` ya `deviceMemory<=2`): antialias band, pixelRatio 1, `powerPreference:'low-power'`.
   - Loading indicator (`Viewer.setLoading`) GLB download ke dauran.
   - `dispose()` ab poora cleanup: geometries, materials, textures (map/normal/roughness/metalness/emissive/env) dispose + renderer/controls cancel.
   - Model quality (colors, detail) **kam nahi hua**.
3. **Service Worker** — cache-first shell, `CACHE_ALL` serial + retry, progress events; ek missing file se poora install fail nahi hota.
4. **Quiz render** — sirf ek question card render hota hai, score lock se re-render aur state mismatch nahi.
5. **Offline** — shell + 40 PDF + 5 songs + 2 GLB + notes cache ho sakte hain; user-controlled button, progress ke saath.

## Startup (honest)

- 32 script tags abhi bhi ek saath load hote hain; `data.js` 5.1 MB seedha parse hota hai. Isse low-end phone par pehla render thoda heavy hai.
- Asli badi improvement ke liye `data.js` ka lazy-loading (quiz khulte waqt) karna chahiye — **ye abhi implement nahi kiya** (risky refactor, existing behaviour break hone ka dar). Agle phase me kar sakte hain.

## Device test

- Web: Chrome (mobile viewport 420px) par 27 routes sweep — 0 exceptions, overflow none.
- APK: runtime device test nahi (koi phone nahi).
