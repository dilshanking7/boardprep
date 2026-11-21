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
