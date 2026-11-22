# BoardPrep Cloud — Setup Guide (step by step, मुफ़्त)

**स्थिति: worker LIVE है** → https://boardprep-api.dilshan-boardprep.workers.dev
health check चल रहा है, sync + study rooms काम कर रहे हैं।
API URL app में baked है — **users को कुछ set नहीं करना**, सब अपने-आप चलता है।

बस **एक** चीज़ बाकी: AI का token (नीचे भाग 2)।

---

## भाग 1 — Cloudflare (worker + database)  🔥 ज़रूरी

### Step 1. Cloudflare account बनाओ (मुफ़्त, 5 मिनट)
1. ब्राउज़र में खोलो: https://dash.cloudflare.com/sign-up
2. ईमेल + पासवर्ड से sign up करो (कोई कार्ड नहीं चाहिए)
3. ईमेल verify करो

### Step 2. Wrangler को लॉगिन कराओ
4. अपने computer/laptop पर **terminal** खोलो (या किसी के — जहाँ node चले)
5. लिखो:
   ```
   cd ~/boardprep-api
   npm install
   npx wrangler login
   ```
6. ब्राउज़र खुलेगा → "Allow" दबाओ → लॉगिन हो जाएगा

### Step 3. D1 database बनाओ
7. लिखो:
   ```
   npx wrangler d1 create boardprep
   ```
8. आउटपुट में **`database_id = "xxxx-xxxx"`** मिलेगा — वह कॉपी करो
9. फ़ाइल खोलो: `~/boardprep-api/wrangler.toml`
10. `database_id = "REPLACE_ME"` की जगह वह id पेस्ट करो, सेव करो

### Step 4. Worker deploy करो
11. लिखो:
    ```
    npx wrangler deploy
    ```
12. आउटपुट में एक **URL** मिलेगी, जैसे:
    `https://boardprep-api.tumhara-subdomain.workers.dev`
    उसे कॉपी कर लो

### Step 5. URL को app में डालो (rebिल्ड के बिना)
13. BoardPrep app खोलो → **Profile** (नीचे दाईं tab)
14. "Cloud sync" वाले section में **"Cloud API URL (worker)"** बॉक्स है
15. अपनी URL पेस्ट करके बाहर टैप करो (change हो जाएगा)
16. बस — AI, sync, rooms तीनों चालू

---

## भाग 2 — AI (free model)  🤖

Worker तुम्हारे Nous Portal token से free model चलाता है।

### Step 6. Nous Portal token (मुफ़्त)
1. https://portal.nousresearch.com पर जाओ और account बनाओ (मुफ़्त)
2. Login करके **API token / access token** लो
3. Token को D1 में डालो (terminal से):
   ```
   cd ~/boardprep-api
   npx wrangler d1 execute boardprep --command "INSERT INTO settings(key,value) VALUES('nous_access_token','यहाँ-token') ON CONFLICT(key) DO UPDATE SET value=excluded.value"
   ```
4. अगर token expire हो तो refresh token भी चाहिए — वही portal से मिलेगा

### Step 7. AI आज़माओ
5. app → **Assistant** → सवाल लिखो → **"AI से जवाब लो (क्लाउड)"** दबाओ
6. जवाब "स्रोत: नोट्स (RAG) + मुफ़्त मॉडल" के साथ आएगा

> अभी `/api/ask` में `NOUS_TOKEN_EXPIRED` आ रहा है — यानी token लगाना बाकी है (ऊपर Step 6)।
> sync और rooms पहले से चल रहे हैं।

---

## भाग 2 — AI chat (ChatGPT/Gemini जैसा)  🤖

**नया:** app में अब **AI चैट** है (सीखें tab → AI चैट) — पढ़ाई, क्विज़, किताबों के सवाल **और** बाहर की
जानकारी (web search) — सबका जवाब देता है।

### Worker को नया code दो (एक बार, 2 मिनट)
```
cd ~/boardprep-api
bash deploy.sh
```
(पहली बार `npm install` होगा, फिर `wrangler deploy`)

### किसका key चाहिए (सब free — जो मिले)
Chain अपने-आप उस्से आगे बढ़ती है जिसका key मिला:
1. **Cloudflare AI** — तुम्हारे CF खाते से चलता है (कुछ key नहीं) ← सबसे पहले
2. **Nous** — पुराना token (Step 6)
3. **Groq** — https://console.groq.com से free key
4. **Gemini** — https://aistudio.google.com से free key
5. **OpenRouter** — `:free` मॉडल

Key डालने के लिए (एक-एक):
```
npx wrangler secret put GROQ_KEY
npx wrangler secret put GEMINI_KEY
npx wrangler secret put OPENROUTER_KEY
```

### Rate limit
- अभी **असीमित** (LIMIT_PER 100000 — हर घंटे रीसेट, ज़बरदस्ती नहीं होता)
- फिर से लागू करना हो तो `wrangler.toml` में `LIMIT_PER = "20"` और `WINDOW_HOURS = "1"`,
  फिर `bash deploy.sh`

### चैट सेव
- चैटें अपने-आप **सेव** होती हैं — back से बाहर जाओ, वापस आओ, **चैट वहीं मिलेगी**
- ऊपर **चैटें** बटन = सेव की गई चैटों की सूची; किसी पर टैप करो → चालू
- **+ नई चैट** = नया शुरू
- हर चैट के पास **×** से हटाने का विकल्प

### AI बटन (कोने में)
- नीचे-दाईं कोने में बैंगनी **AI** बटन — हर पेज पर
- चैट पेज पर खुद छिप जाता है
- नया APK: https://dilshanking7.github.io/boardprep/downloads/BoardPrep-v5.4.apk

### आज़माओ
app → **AI चैट** → कुछ लिखो → भेजो। नीचे-दाईं कोने का **AI** बटन भी काम करता है।

---

## भाग 3 — Sync + Rooms

### Sync
- **Profile → Cloud sync → "Cloud par save"** = तुम्हारी प्रगति cloud पर
- दूसरे फ़ोन पर: दूसरा device id होगा, इसलिए पहले उसी device पर save करो,
  फिर दूसरे फ़ोन पर **"Cloud se lao"** (उसी account/device पर)
  - नोट: अभी device id हर फ़ोन अलग है — एक ही फ़ोन पर save/load सही चलेगा

### Study room
- **अभ्यास tab → Study room**
- नाम + code (जैसे `maths10`) डालो → **Room banao** (पहली बार) या **Join karo**
- दोसत को वही code दो, वो join करें — दोनों के संदेश दिखेंगे (हर 3 सेकंड refresh)
- इंटरनेट चाहिए

---

## अगर कुछ न चले (ईमानदार बात)
- Worker URL गलत है → AI/sync कुछ नहीं करेगा, पर app टूटेगा नहीं (offline fallback है)
- Token न हो → AI बॉट "token set karo" बताएगा
- Rooms अभी text-based + 3s refresh (असली realtime नहीं) — इसे बेहतर बना सकते हैं
- डेटा सिर्फ़ उसी device id पर जाता है — "दूसरा फ़ोन" अभी अलग id बनाता है

---

## फ़ाइलें (computer पर)
- worker कोड: `~/boardprep-api/src/index.js`
- app की cloud module: `~/boardprep/assets/js/cloud.js`
- deploy: `cd ~/boardprep-api && npx wrangler deploy`
