# BoardPrep Security Report

## v5.11 — Cloud/API security (step 1, 2026-11-25)

- Worker responses ab sirf allowlisted origins par CORS dete hain (`*` nahi); `ALLOWED_ORIGINS` config se control.
- Browser har API request ke saath random `X-BP-Device-Token` bhejta hai; server uska SHA-256 hash rakhta hai. Sync data aur locked rooms usi token ke bina read/write nahi hote. Purane token-less records backward-compatible hain.
- AI quota ab real hai: 60 requests/device/hour (token na ho to IP fallback). `/api/chat`, `/api/ask`, `/api/stt`, `/api/vision`, `/api/image` covered.
- `/api/diag` default band; sirf `DIAG_TOKEN` secret + `X-Diag-Token` header ke saath chaltta hai.
- Nous tokens Worker secrets (`NOUS_TOKEN`, `NOUS_REFRESH_TOKEN`, `NOUS_CLIENT_ID`) se read hote hain; secrets set hone par D1 me plaintext write nahi hota. Purana D1 fallback sirf tab hai jab secrets na ho.
- Screen text / voice / photo bhejne se pehle client par consent confirm hota hai (`bp_privacy_consent`, reset: `Cloud.resetConsent()`).
- Baaki report neeche v3.0 APK ke liye hai — usme "no network requests" wali baat ab purani hai (v5.x me opt-in AI cloud features hain).

---

# BoardPrep v3.0 — Android Security Report

APK: `BoardPrep-v3.0.apk` (com.dilshan.boardprep, versionCode 3, versionName 3.0)
Signed: keystore `CN=BoardPrep, O=Dilshan, C=IN`, RSA 2048, validity 10000 din, apksigner verify PASS.

## Permissions (before → after)

| Permission | Pehle | Ab | Reason |
|---|---|---|---|
| INTERNET | haan | haan | service worker / first-load assets ke liye |
| ACCESS_NETWORK_STATE | haan | **nahi** | code me koi use nahi — hataya |

## Hardening (kiya)

1. `android:usesCleartextTraffic` true → **false** (sirf https/local).
2. `android:allowBackup` → **false** (app user data backup me leak na kare).
3. WebView `setAllowFileAccess` true → **false**.
4. WebView `setAllowContentAccess` true → **false** (FileProvider ke bahar koi content:// access nahi).
5. `shouldOverrideUrlLoading`: sirf `https://appassets.androidplatform.net` (bundled) WebView me khule. External sirf `http/https` par ACTION_VIEW; `intent://`, `file://`, `javascript://`, unknown schemes **block**.
6. PDF: asset → cache dir → FileProvider (authority `…fileprovider`, `exported=false`, `grantUriPermissions=true`) → `file_paths.xml` sirf `cache-path pdf/`. Koi arbitrary path nahi.
7. Koi API key / secret JavaScript me nahi. Koi analytics/tracker nahi. Koi third-party SDK nahi — sirf `androidx.core` + `androidx.webkit`.
8. Sensitive data collect nahi hota. Sab progress localStorage me rehta hai (device par hi).
9. Network requests: app apne bundled assets ke alawa kuch request nahi karti.

## Verify (aapt2)

```
package: com.dilshan.boardprep
uses-permission: name='android.permission.INTERNET'
```
(bass ek permission)

## Remaining risks (honest)

- **Keystore password `boardprep` build.sh me hai** — ye file repo me nahi, `~/android-build/` me hai (private). Repo public hai, keystore public nahi. Future me password env var se lena behtar hoga.
- **APK phone par install/run test nahi hua** (device nahi). Signature aur contents verify kiye.
- WebView `JavaScript` on hai — zaroori hai (poora app JS hai). Risk keval tab badhta hai jab external untrusted HTML load ho, jo ab block hai.
