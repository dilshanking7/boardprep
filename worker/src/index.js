// BoardPrep API — Cloudflare Worker (free tier)
// - /api/ask      : notes से RAG + free model से जवाब (AI)
// - /api/sync/*   : D1 (SQLite) me progress cloud par (database)
// - /api/room/*   : study rooms (multi-user, D1 polling)
// Sab kuch free. Koi card nahi.

import { ensureSchema, getSetting, setSetting } from "./db.js";
import { nousChat } from "./nous.js";
import { webSearch, askAI, rateLimit, callCF, callGroq, callGemini, callOpenRouter, probe } from "./ai.js";

const json = (data, opts = {}) => new Response(JSON.stringify(data), {
  status: opts.status || 200,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    ...(opts.headers || {}),
  },
});

const CORS_PREFLIGHT = () => json({ ok: true });

function uid(raw) {
  // device id -> hex (D1 key ke liye)
  let h = 0;
  const s = String(raw || "anon");
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
  return "u" + h.toString(16);
}

async function saveProgress(db, id, data) {
  await setSetting(db, "progress_" + id, JSON.stringify({
    v: 1, t: Date.now(), data: data
  }));
}

async function loadProgress(db, id) {
  const raw = await getSetting(db, "progress_" + id, null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, "");
    if (req.method === "OPTIONS") return CORS_PREFLIGHT();

    try {
      if (p === "/health") return json({ ok: true, service: "boardprep-api", time: Date.now() });
      if (p === "/api/health") return json({ ok: true, time: Date.now() });

      // ---------- AI chat (ChatGPT/Gemini jaisa) ----------
      if (p === "/api/diag") {
        const prov = String(url.searchParams.get("list") || "all");
        if (prov === "groq") return json({ ok: true, list: await probe(env, "groq", [
          "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama-3.1-70b-versatile",
          "meta-llama/llama-3.1-8b-instant", "openai/gpt-oss-20b", "moonshotai/kimi-k2-instruct",
          "qwen/qwen3-32b", "mistralai/mistral-small-3.1-24b-instruct", "llama-3.3-70b-specdec",
          "openai/gpt-oss-120b", "gemma2-9b-it",
        ]) });
        if (prov === "gemini") return json({ ok: true, list: await probe(env, "gemini", [
          "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash",
          "gemini-1.5-flash-8b", "gemini-2.5-flash-lite", "gemini-2.0-flash-exp",
        ]) });
        const out = [];
        const one = async function (name, fn) {
          const t0 = Date.now();
          try { const r = await fn(); out.push({ name: name, ok: !!r, ms: Date.now() - t0, sample: String(r).slice(0, 90) }); }
          catch (e) { out.push({ name: name, ok: false, ms: Date.now() - t0, err: String(e.message || e).slice(0, 90) }); }
        };
        await one("cloudflare", function () { return callCF(env, [{ role: 'user', content: 'अम्ल लिटमस को कैसे बदलता है? एक लाइन में बताओ।' }]); });
        await one("nous", function () { return nousChat(env.DB, env, [{ role: 'user', content: 'अम्ल लिटमस को कैसे बदलता है? एक लाइन में बताओ।' }], { maxTokens: 120 }); });
        await one("groq", function () { return callGroq(env, [{ role: 'user', content: 'अम्ल लिटमस को कैसे बदलता है? एक लाइन में बताओ।' }]); });
        await one("gemini", function () { return callGemini(env, [{ role: 'user', content: 'अम्ल लिटमस को कैसे बदलता है? एक लाइन में बताओ।' }]); });
        await one("openrouter", function () { return callOpenRouter(env, [{ role: 'user', content: 'अम्ल लिटमस को कैसे बदलता है? एक लाइन में बताओ।' }]); });
        return json({ ok: true, providers: out });
      }
      if (p === "/api/quota" && req.method === "GET") {
        const id = uid(url.searchParams.get("id"));
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "rl_" + id, null);
        let rec = null;
        try { rec = raw ? JSON.parse(raw) : null; } catch (e) { }
        const per = Number(env.LIMIT_PER || 20);
        const winH = Number(env.WINDOW_HOURS || 1);
        const now = Date.now();
        if (!rec || now > rec.reset) {
          return json({ ok: true, left: per, per: per, windowH: winH, resetInMs: winH * 3600000 });
        }
        const left = Math.max(0, per - rec.n);
        return json({ ok: true, left: left, per: per, windowH: winH, resetInMs: rec.reset - now });
      }
      if (p === "/api/chat" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const id = uid(b.id);
        const q = String(b.q || "").slice(0, 1200);
        const hist = Array.isArray(b.history) ? b.history.slice(-10) : [];
        const wantWeb = b.web !== false;
        if (!q) return json({ error: "q required" }, { status: 400 });
        await ensureSchema(env.DB);

        // rate limit — pehle check
        const rl = await rateLimit(env.DB, id, env);
        if (!rl.ok) {
          return json({
            ok: false, error: "LIMIT", limit: true,
            retryMs: rl.retryMs, per: rl.per, windowH: rl.windowH,
          }, { status: 429 });
        }

        // web search (bahar ki info) — sirf jab zaroorat lage
        var webCtx = [];
        try {
          var low = q.toLowerCase();
          var needsWeb = /(bahar|internet|news|latest|aaj|2026|2027|google|khoj|search|खोज|नया|आज)/.test(low) || wantWeb;
          if (needsWeb) webCtx = await webSearch(q);
        } catch (e) { }

        const sys =
          "तुम BoardPrep के शिक्षक-सहायक हो — कक्षा 10 (JAC/CBSE) के विद्यार्थी की मदद करते हो। " +
          "नियम: (1) सीधा और छोटा जवाब दो, अगल-बढ़कर न लिखो। (2) संदिग्ध सवाल (जैसे 'hii', 'hello') का जवाब " +
          "सादा अभिवादन दो और काम का सवाल पूछो — अंदाज़ा या सूची मत बनाओ। (3) पढ़ाई/क्विज़/किताब के सवाल " +
          "स्पष्ट उदाहरण सहित समझाओ। (4) बाहर की ताज़ा जानकारी के लिए नीचे दिए search नतीजो से जवाब दो; " +
          "सामान्य ज्ञान/इतिहास/विज्ञान के सवाल अपने ज्ञान से भी जवाब दो। " +
          "जो पक्का नहीं है उसे मत बनाओ — अनिश्चित हो तो 'यह मुझे पक्का नहीं' लिखो। (5) जवाब 250 शब्दों के अंदर रखो।";

        const messages = [{ role: 'system', content: sys }];
        hist.forEach(function (m) {
          if (m && (m.role === 'user' || m.role === 'assistant')) {
            messages.push({ role: m.role, content: String(m.content || '').slice(0, 800) });
          }
        });
        messages.push({
          role: 'user',
          content: (webCtx.length
            ? 'बाहरी जानकारी:\n' + webCtx.map(function (w, i) {
              return '(' + (i + 1) + ') ' + w.title + ' — ' + w.text;
            }).join('\n') + '\n\n' : '') + 'सवाल: ' + q,
        });

        try {
          const r = await askAI(env.DB, env, messages);
          return json({
            ok: true, answer: r.text, model: r.model,
            web: webCtx.length, quota: { left: rl.left, per: rl.per, windowH: rl.windowH },
          });
        } catch (e) {
          return json({ ok: false, error: String(e.message || e), quota: { left: rl.left, per: rl.per, windowH: rl.windowH } },
            { status: 502 });
        }
      }

      // ---------- AI (purana — RAG + free model) ----------
      if (p === "/api/ask" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const q = String(b.q || "").slice(0, 500);
        const notes = Array.isArray(b.notes) ? b.notes.slice(0, 6) : [];
        if (!q) return json({ error: "q required" }, { status: 400 });
        await ensureSchema(env.DB);
        const ctx = notes.map((n, i) => {
          const t = typeof n === "string" ? n : ((n && (n.ch + " — " + (n.text || ""))) || "");
          return "(${i + 1}) " + t.slice(0, 900);
        }).join("\n");
        const messages = [
          {
            role: "system",
            content:
              "तुम BoardPrep के शिक्षक-सहायक हो, कक्षा 10 (JAC/CBSE) के लिए। " +
              "नीचे दिए नोट्स से ही जवाब दो — जो नोट्स में न हो, वो न बनाओ। " +
              "हिंदी/Hinglish में सरल, स्पष्ट, बुलेट वाला जवाब दो। जवाब 200 शब्दों से ज़्यादा मत बनाओ। " +
              "अगर नोट्स में जवाब नहीं मिलता तो सीधे कहो कि यह नोट्स में नहीं है।",
          },
          { role: "user", content: (ctx ? "नोट्स:\n" + ctx + "\n\n" : "") + "सवाल: " + q },
        ];
        try {
          const ans = await nousChat(env.DB, env, messages, { maxTokens: 700, temperature: 0.5 });
          return json({ ok: true, answer: ans, model: env.MODEL || "free", sources: notes.length });
        } catch (e) {
          return json({ ok: false, error: String(e.message || e), hint: "AI token set karo (NOUS)" }, { status: 502 });
        }
      }

      // ---------- cloud sync (database) ----------
      if (p === "/api/sync/save" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const id = uid(b.id);
        await ensureSchema(env.DB);
        await saveProgress(env.DB, id, b.data || {});
        return json({ ok: true, id: id, saved: Date.now() });
      }
      if (p === "/api/sync/load" && req.method === "GET") {
        const id = uid(url.searchParams.get("id"));
        await ensureSchema(env.DB);
        const r = await loadProgress(env.DB, id);
        if (!r) return json({ ok: false, found: false });
        return json({ ok: true, id: id, t: r.t, data: r.data });
      }

      // ---------- study rooms (multi-user) ----------
      // room row: settings key = room_<code> ; value = JSON {code,name,members,msgs[]}
      if (p === "/api/room/create" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const code = String(b.code || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
        if (!code) return json({ error: "code required" }, { status: 400 });
        await ensureSchema(env.DB);
        await setSetting(env.DB, "room_" + code, JSON.stringify({
          code: code, name: String(b.name || code).slice(0, 60),
          members: [String(b.name || "student").slice(0, 40)],
          msgs: [{ n: "system", t: String(b.name || "student") + " ne room banaya", ts: Date.now() }],
          ts: Date.now(),
        }));
        return json({ ok: true, code: code });
      }
      if (p === "/api/room/join" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const code = String(b.code || "").trim().toLowerCase();
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "room_" + code, null);
        if (!raw) return json({ ok: false, error: "room nahi mila" }, { status: 404 });
        const room = JSON.parse(raw);
        const nm = String(b.name || "student").slice(0, 40);
        if (!room.members.includes(nm)) room.members.push(nm);
        room.msgs.push({ n: "system", t: nm + " join hua", ts: Date.now() });
        room.ts = Date.now();
        await setSetting(env.DB, "room_" + code, JSON.stringify(room));
        return json({ ok: true, room: room });
      }
      if (p === "/api/room/post" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        const code = String(b.code || "").trim().toLowerCase();
        const msg = String(b.msg || "").slice(0, 400);
        if (!msg) return json({ error: "msg required" }, { status: 400 });
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "room_" + code, null);
        if (!raw) return json({ ok: false, error: "room nahi mila" }, { status: 404 });
        const room = JSON.parse(raw);
        room.msgs.push({ n: String(b.name || "student").slice(0, 40), t: msg, ts: Date.now() });
        if (room.msgs.length > 200) room.msgs = room.msgs.slice(-200);
        room.ts = Date.now();
        await setSetting(env.DB, "room_" + code, JSON.stringify(room));
        return json({ ok: true, room: room });
      }
      if (p === "/api/room/get" && req.method === "GET") {
        const code = String(url.searchParams.get("code") || "").trim().toLowerCase();
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "room_" + code, null);
        if (!raw) return json({ ok: false, error: "room nahi mila" }, { status: 404 });
        return json({ ok: true, room: JSON.parse(raw) });
      }

      return json({ error: "not found", path: p }, { status: 404 });
    } catch (e) {
      return json({ ok: false, error: String(e.message || e) }, { status: 500 });
    }
  },
};
