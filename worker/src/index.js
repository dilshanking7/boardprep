// BoardPrep API — Cloudflare Worker (free tier)
// - /api/ask, /api/chat, /api/stt, /api/vision, /api/image : authenticated AI endpoints
// - /api/sync/* : legacy D1 progress sync (authenticated)
// - /api/room/* : study rooms (authenticated)
// All free tier. No card required.

import { ensureSchema, getSetting, setSetting } from "./db.js";
import { nousChat } from "./nous.js";
import { webSearch, askAI, rateLimit, callCF, callGroq, callGemini, callOpenRouter, probe, probeCFVision } from "./ai.js";

const json = (data, opts = {}) => new Response(JSON.stringify(data), {
  status: opts.status || 200,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-BP-Device-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Vary": "Origin",
    ...(opts.headers || {}),
  },
});

const DEFAULT_ORIGINS = [
  "https://dilshanking7.github.io",
  "https://appassets.androidplatform.net",
  "http://appassets.androidplatform.net",
];

function originAllowed(origin, reqUrl, env) {
  if (!origin) return true;
  const own = new URL(reqUrl).origin;
  if (origin === own) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  const list = String(env.ALLOWED_ORIGINS || DEFAULT_ORIGINS.join(","))
    .split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  return list.indexOf("*") >= 0 || list.indexOf(origin) >= 0;
}

function withSecurity(res, origin) {
  if (origin) res.headers.set("Access-Control-Allow-Origin", origin);
  else res.headers.delete("Access-Control-Allow-Origin");
  res.headers.set("Vary", "Origin");
  return res;
}

async function hashText(s) {
  const bytes = new TextEncoder().encode(String(s || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
}

async function tokenHash(req) {
  const token = req.headers.get("X-BP-Device-Token");
  return token ? hashText(token) : "";
}

function unauthorized() {
  return json({ ok: false, error: "login required", login: true }, { status: 401 });
}

async function verifyUser(req, env) {
  const header = String(req.headers.get("Authorization") || "");
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  try {
    const r = await fetch(String(env.SUPABASE_URL).replace(/\/$/, "") + "/auth/v1/user", {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: "Bearer " + m[1] },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? { id: String(u.id) } : null;
  } catch (e) { return null; }
}

async function userKey(user) {
  return "u" + await hashText(user.id);
}

async function rateKey(req, user) {
  if (user) return await userKey(user);
  const t = await tokenHash(req);
  if (t) return "t" + t;
  return "ip" + await hashText(req.headers.get("CF-Connecting-IP") || "anon");
}

async function checkLimit(req, env, user) {
  await ensureSchema(env.DB);
  return rateLimit(env.DB, await rateKey(req, user), env);
}

function tooMany(rl) {
  return json({ ok: false, error: "LIMIT", limit: true, retryMs: rl.retryMs, per: rl.per, windowH: rl.windowH }, { status: 429 });
}

export default {
  async fetch(req, env, ctx) {
    const origin = req.headers.get("Origin") || "";
    if (!originAllowed(origin, req.url, env)) {
      const blocked = json({ ok: false, error: "origin not allowed" }, { status: 403 });
      blocked.headers.delete("Access-Control-Allow-Origin");
      return blocked;
    }
    if (req.method === "OPTIONS") {
      const pre = json({ ok: true });
      pre.headers.set("Access-Control-Allow-Origin", origin || new URL(req.url).origin);
      return pre;
    }
    return withSecurity(await handle(req, env, ctx), origin);
  },
};

function uid(raw) {
  // Device ID to hex for the D1 key
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

async function handle(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, "");
    let authUser = null;
    let authChecked = false;
    async function currentUser() {
      if (!authChecked) { authChecked = true; authUser = await verifyUser(req, env); }
      return authUser;
    }

    try {
      if (p === "/health") return json({ ok: true, service: "boardprep-api", time: Date.now() });
      if (p === "/api/health") return json({ ok: true, time: Date.now() });

      // ---------- AI chat ----------
      if (p === "/api/diag") {
        const expectedDiag = String(env.DIAG_TOKEN || "");
        const gotDiag = String(req.headers.get("X-Diag-Token") || "");
        if (!expectedDiag || gotDiag !== expectedDiag) {
          return json({ ok: false, error: "not found" }, { status: 404 });
        }
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
        if (prov === "groqv") return json({ ok: true, list: await probe(env, "groqv", [
          "llama-3.2-90b-vision-preview", "llama-3.2-11b-vision-preview", "meta-llama/llama-4-scout-17b-16e-instruct",
        ]) });
        if (prov === "cfv") return json({ ok: true, list: await probeCFVision(env, [
          "@cf/llava/llava-1.5-7b-hf", "@cf/unum/uform-gen2-qwen-500m",
        ]) });
        if (prov === "geminiall") {
          const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(env.GEMINI_KEY || ""), {});
          const j = await r.json().catch(() => ({}));
          const ids = (j && j.models || []).map(function (m) { return String(m.name || "").replace("models/", ""); });
          return json({ ok: r.ok, models: ids });
        }
        if (prov === "groqall") {
          const r = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { Authorization: 'Bearer ' + (env.GROQ_KEY || '') },
          });
          const j = await r.json();
          const ids = (j && j.data || []).map(function (m) { return m.id; });
          return json({ ok: r.ok, models: ids });
        }
        if (prov === "orall") {
          const r = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { Authorization: "Bearer " + (env.OPENROUTER_KEY || "") },
          });
          const j = await r.json().catch(() => ({}));
          const all = (j && j.data || []).map(function (m) {
            var p = (m && m.supported_parameters) || [];
            return { id: m.id, vis: p.indexOf("supports_vision") >= 0 };
          });
          return json({ ok: r.ok, free: all.filter(function (m) { return /:free$/.test(m.id); }).map(function (m) { return m.id + (m.vis ? " [vision]" : ""); }).slice(0, 80) });
        }
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
      // ---------- voice: audio -> text (Groq Whisper, free) ----------
      if (p === "/api/stt" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const rl = await checkLimit(req, env, user);
        if (!rl.ok) return tooMany(rl);
        const b = await req.json().catch(() => ({}));
        const b64 = String(b.audio || "").split(",").pop();
        const mime = String(b.mime || "audio/webm");
        if (!b64) return json({ ok: false, error: "audio required" }, { status: 400 });
        const key = env.GROQ_KEY || "";
        if (!key) return json({ ok: false, error: "no groq key" }, { status: 502 });
        let buf;
        try { buf = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); }); }
        catch (e) { return json({ ok: false, error: "bad audio" }, { status: 400 }); }
        const ext = mime.indexOf("ogg") >= 0 ? "ogg" : (mime.indexOf("mp4") >= 0 || mime.indexOf("m4a") >= 0 ? "m4a" : "webm");
        const fd = new FormData();
        fd.append("file", new Blob([buf], { type: mime }), "v." + ext);
        fd.append("model", "whisper-large-v3-turbo");
        fd.append("response_format", "json");
        const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST", headers: { Authorization: "Bearer " + key }, body: fd,
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return json({ ok: false, error: "stt " + r.status }, { status: 502 });
        return json({ ok: true, text: String((j && j.text) || "").trim() });
      }

      // ---------- photo: image -> answer (OpenRouter free vision) ----------
      if (p === "/api/vision" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const rl = await checkLimit(req, env, user);
        if (!rl.ok) return tooMany(rl);
        const b = await req.json().catch(() => ({}));
        const img = String(b.image || "");
        const q = String(b.q || "इस फोटो/नोट को पढ़कर समझाओ।").slice(0, 400);
        if (!img) return json({ ok: false, error: "image required" }, { status: 400 });
        const key = env.OPENROUTER_KEY || "";
        if (!key && !env.GEMINI_KEY) {
          return json({ ok: false, error: "vision key missing", noKey: true });
        }
        let last = "";
        // Try Gemini first, then OpenRouter
        const gkey = env.GEMINI_KEY || "";
        const gmodels = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-2.5-flash", "gemini-3-flash-preview"];
        const dataUrl = img.indexOf("data:") === 0 ? img : "data:image/jpeg;base64," + img;
        const mime = (dataUrl.split(";")[0].split(":")[1]) || "image/jpeg";
        const raw = dataUrl.split(",").pop();
        if (gkey) for (let i = 0; i < gmodels.length; i++) {
          try {
            const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + gmodels[i] +
              ":generateContent?key=" + encodeURIComponent(gkey), {
              method: "POST", headers: { "Content-Type": "application/json" },
              signal: AbortSignal.timeout(28000),
              body: JSON.stringify({
                contents: [{
                  role: "user",
                  parts: [
                    { text: "तुम कक्षा 10 के विद्यार्थी के होमवर्क/नोट्स की मदद करते हो। फोटो में जो लिखा/दिखा है उसे पढ़ो और हिंदी या English में सरल, स्पष्ट जवाब दो — पढ़ाओ, समझाओ, उदाहरण दो। 250 शब्दों के अंदर।" },
                    { inline_data: { mime_type: mime, data: raw } },
                  ],
                }],
                generationConfig: { maxOutputTokens: 800 },
              }),
            });
            if (!r.ok) { last = "gemini HTTP " + r.status; continue; }
            const j = await r.json();
            const t = j && j.candidates && j.candidates[0] && j.candidates[0].content &&
              j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text;
            if (t) return json({ ok: true, answer: String(t).trim(), model: "Gemini " + gmodels[i] });
            last = "gemini empty";
          } catch (e) { last = "gemini " + String(e.message || e).slice(0, 60); }
        }
        const models = [
          "google/gemma-3-27b-it:free",
          "qwen/qwen2.5-vl-72b-instruct:free",
          "meta-llama/llama-3.2-90b-vision-instruct:free",
          "meta-llama/llama-3.2-11b-vision-instruct:free",
        ];
        for (let i = 0; i < models.length; i++) {
          try {
            const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
              body: JSON.stringify({
                model: models[i],
                messages: [{
                  role: "user",
                  content: [
                    { type: "text", text: "तुम कक्षा 10 के विद्यार्थी के होमवर्क/नोट्स की मदद करते हो। फोटो में जो लिखा/दिखा है उसे पढ़ो और हिंदी या English में सरल, स्पष्ट जवाब दो — पढ़ाओ, समझाओ, उदाहरण दो। 250 शब्दों के अंदर।" },
                    { type: "image_url", image_url: { url: img.indexOf("data:") === 0 ? img : "data:image/jpeg;base64," + img } },
                  ],
                }],
                max_tokens: 800,
              }),
            });
            if (!r.ok) { last = "HTTP " + r.status + " " + (await r.text()).slice(0, 90); continue; }
            const j = await r.json();
            const t = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
            if (t) return json({ ok: true, answer: String(t).trim(), model: models[i] });
            last = "empty";
          } catch (e) { last = String(e.message || e).slice(0, 80); }
        }
        return json({ ok: false, error: "vision: " + last }, { status: 502 });
      }

      // ---------- YouTube: learning videos (links) ----------
      if (p === "/api/yt") {
        const q = String(url.searchParams.get("q") || "").trim().slice(0, 120);
        if (!q) return json({ ok: false, error: "q required" }, { status: 400 });
        const out = [];
        try {
          const u = "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
          const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (Android 14; Mobile)", "Accept-Language": "hi,en" } });
          const t = await r.text();
          const re = /"videoId":"([A-Za-z0-9_-]{11})"[\s\S]{0,400}?"title":\{"runs":\[\{"text":"([^"]{4,120})"/g;
          let m, seen = {};
          while ((m = re.exec(t)) && out.length < 5) {
            if (seen[m[1]]) continue; seen[m[1]] = 1;
            out.push({ id: m[1], title: m[2].replace(/\\u0026/g, "&") });
          }
          if (!out.length) {
            try {
              const d = await fetch("https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q + " site:youtube.com watch"), { headers: { "User-Agent": "Mozilla/5.0" } });
              const dt = await d.text();
              const re3 = /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})[^"<>]{0,300}?>([^<]{4,120})</g;
              let m3, n3 = 0;
              while ((m3 = re3.exec(dt)) && n3 < 5) { if (!seen[m3[1]]) { seen[m3[1]] = 1; out.push({ id: m3[1], title: m3[2].trim() }); n3++; } }
            } catch (e) { }
          }
          if (!out.length) {
            const re2 = /"videoId":"([A-Za-z0-9_-]{11})"/g;
            let n = 0;
            while ((m = re2.exec(t)) && n < 3) { out.push({ id: m[1], title: q }); n++; }
          }
        } catch (e) { }
        return json({ ok: true, q: q, videos: out, fallback: "https://www.youtube.com/results?search_query=" + encodeURIComponent(q) });
      }

      // ---------- image generation (CF flux, free) ----------
      if (p === "/api/image" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const rl = await checkLimit(req, env, user);
        if (!rl.ok) return tooMany(rl);
        const b = await req.json().catch(() => ({}));
        const pr = String(b.prompt || "").slice(0, 400);
        if (!pr) return json({ ok: false, error: "prompt required" }, { status: 400 });
        try {
          const r = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", { prompt: pr });
          const b64 = (r && (r.image || r.b64 || r.data)) || "";
          if (!b64) throw new Error("empty image");
          return json({ ok: true, b64: String(b64).split(",").pop(), prompt: pr });
        } catch (e) {
          return json({ ok: false, error: "image: " + String(e.message || e).slice(0, 90) }, { status: 502 });
        }
      }

      // ---------- feedback: AI learning from user data ----------
      if (p === "/api/feedback" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const b = await req.json().catch(() => ({}));
        const id = await userKey(user);
        const topic = String(b.topic || "general").slice(0, 60);
        const good = b.good ? 1 : -1;
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "fb_" + id, null);
        let rec = {};
        try { rec = raw ? JSON.parse(raw) : {}; } catch (e) { }
        if (!rec[topic]) rec[topic] = { up: 0, down: 0 };
        if (good > 0) rec[topic].up++; else rec[topic].down++;
        await setSetting(env.DB, "fb_" + id, JSON.stringify(rec));
        return json({ ok: true });
      }

      // User performance level (weak or normal) added to the prompt
      async function userContext(db, id) {
        try {
          const r = await loadProgress(db, id);
          const study = r && r.data && r.data.study;
          if (!study || !Array.isArray(study.attempts) || !study.attempts.length) return "";
          const by = {};
          study.attempts.forEach(function (a) {
            var k = String(a.c || "").slice(0, 60);
            if (!k) return;
            by[k] = by[k] || { n: 0, ok: 0 };
            by[k].n++; if (a.ok) by[k].ok++;
          });
          var rows = Object.keys(by).map(function (k) { return { c: k, n: by[k].n, pct: Math.round(by[k].ok / by[k].n * 100) }; });
          var weak = rows.filter(function (x) { return x.n >= 2; }).sort(function (a, b) { return a.pct - b.pct; }).slice(0, 3);
          var strong = rows.filter(function (x) { return x.n >= 2; }).sort(function (a, b) { return b.pct - a.pct; }).slice(0, 2);
          var s = "";
          if (weak.length) s += "तुम्हारे कमज़ोर अध्याय (जिनमें ज़्यादा गलती हुई): " + weak.map(function (x) { return x.c + " " + x.pct + "%"; }).join(", ") + "। ";
          if (strong.length) s += "मज़बूत: " + strong.map(function (x) { return x.c + " " + x.pct + "%"; }).join(", ") + "। ";
          return s;
        } catch (e) { return ""; }
      }

      if (p === "/api/quota" && req.method === "GET") {
        const user = await currentUser();
        if (!user) return unauthorized();
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "rl_" + await rateKey(req, user), null);
        let rec = null;
        try { rec = raw ? JSON.parse(raw) : null; } catch (e) { }
        const per = Number(env.LIMIT_PER || 60);
        const winH = Number(env.WINDOW_HOURS || 1);
        const now = Date.now();
        if (!rec || now > rec.reset) {
          return json({ ok: true, left: per, per: per, windowH: winH, resetInMs: winH * 3600000 });
        }
        const left = Math.max(0, per - rec.n);
        return json({ ok: true, left: left, per: per, windowH: winH, resetInMs: rec.reset - now });
      }
      if (p === "/api/chat" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const b = await req.json().catch(() => ({}));
        const id = await userKey(user);
        const q = String(b.q || "").slice(0, 1200);
        const hist = Array.isArray(b.history) ? b.history.slice(-10) : [];
        const wantWeb = b.web !== false;
        function langOfQ(s) { return /[\u0900-\u097F]/.test(String(s || '')) ? 'hi' : 'en'; }
        if (!q) return json({ error: "q required" }, { status: 400 });

        const rl = await checkLimit(req, env, user);
        if (!rl.ok) return tooMany(rl);

        // Web search (outside info) — only when needed
        // Return a YouTube link when a learning video is requested
        var ytCtx = [];
        try {
          if (/(video|youtube|यूट्यूब|दिखाओ|देखूं|देखूँ|show|सीखने के लिए)/.test(q)) {
            const yu = new URL(url.origin + "/api/yt?q=" + encodeURIComponent(q));
            const yj = await fetch(yu.toString()).then(function (r) { return r.json(); }).catch(function () { return { videos: [] }; });
            if (yj && yj.videos && yj.videos.length) {
              ytCtx = yj.videos.slice(0, 4).map(function (v) {
                return { title: v.title, text: "https://www.youtube.com/watch?v=" + v.id };
              });
            } else if (yj && yj.fallback) {
              ytCtx = [{ title: "YouTube: " + q, text: yj.fallback }];
            }
          }
        } catch (e) { }
        var webCtx = [];
        try {
          var low = q.toLowerCase();
          var needsWeb = /(outside|internet|news|latest|today|2026|2027|google|search|खोज|नया|आज)/.test(low) || wantWeb;
          if (needsWeb) webCtx = await webSearch(q);
        } catch (e) { }

        const ctx = await userContext(env.DB, id);
        const lang = (String(b.lang || '') === 'en') ? 'en' : (langOfQ(q) === 'en' ? 'en' : 'hi');
        const sys =
          "तुम BoardPrep के शिक्षक-सहायक हो — कक्षा 10 (JAC/CBSE) के विद्यार्थी की मदद करते हो। " +
          "तुम्हारे सामने Dilshan बैठा है: कक्षा 10 का विद्यार्थी (Jharkhand), developer, और यही BoardPrep बनाता है; " +
          "वह websites/apps बनाता है। कोई पूछे 'तुम कौन हो' तो बताओ कि तुम उसी के रूप में बने हो; " +
          "उसका portfolio https://dilshanking7.github.io/ है — कोई माँगे तो लिंक दो। " +
          "उसकी निजी जानकारी (जन्म-तिथि, स्कूल का नाम) कभी मत बताओ। " +
          (lang === 'en'
            ? "जवाब ENGLISH में दो। "
            : "जवाब हिंदी या English में दो। ") +
          (ctx ? ctx + "इन कमज़ोर चीज़ों को समझाते समय ख़ास ध्यान दो और आसान उदाहरण दो। " : "") +
          "नियम: (1) सीधा और छोटा जवाब दो, अगल-बढ़कर न लिखो। (2) किसी भी तरह का सवाल हो — पढ़ाई, क्विज़, जीवन, तकनीक, " +
          "मनोरंजन, सलाह, कहानी, कविता, चर्चा — सबका जवाब दो, मना मत करो। संदिग्ध सवाल (जैसे 'hii', 'hello') का जवाब " +
          "सादा अभिवादन दो और काम का सवाल पूछो। (3) पढ़ाई के सवाल स्पष्ट उदाहरण सहित समझाओ। " +
          "(4) बाहर की ताज़ा जानकारी के लिए नीचे दिए search नतीजो से जवाब दो; सामान्य ज्ञान/इतिहास/विज्ञान के सवाल " +
          "अपने ज्ञान से भी जवाब दो। जो जानकारी पक्की नहीं है उसे 'यह पक्का नहीं' कहकर भी अपनी बात समझाओ — जवाब देना बंद मत करो। " +
          "(5) जवाब 250 शब्दों के अंदर रखो।";

        const messages = [{ role: 'system', content: sys }];
        hist.forEach(function (m) {
          if (m && (m.role === 'user' || m.role === 'assistant')) {
            messages.push({ role: m.role, content: String(m.content || '').slice(0, 800) });
          }
        });
        // web + youtube + feedback judo
        var extraCtx = webCtx.concat(ytCtx);
        messages.push({
          role: 'user',
          content: (extraCtx.length
            ? 'बाहरी जानकारी:\n' + extraCtx.map(function (w, i) {
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

      // ---------- AI (legacy RAG + free model) ----------
      if (p === "/api/ask" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const b = await req.json().catch(() => ({}));
        const q = String(b.q || "").slice(0, 500);
        const notes = Array.isArray(b.notes) ? b.notes.slice(0, 6) : [];
        if (!q) return json({ error: "q required" }, { status: 400 });
        const rl = await checkLimit(req, env, user);
        if (!rl.ok) return tooMany(rl);
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
              "हिंदी या English में सरल, स्पष्ट, बुलेट वाला जवाब दो। जवाब 200 शब्दों से ज़्यादा मत बनाओ। " +
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
        const user = await currentUser();
        if (!user) return unauthorized();
        const b = await req.json().catch(() => ({}));
        const id = await userKey(user);
        const owner = id;
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "progress_" + id, null);
        let rec = {};
        try { rec = raw ? JSON.parse(raw) : {}; } catch (e) { rec = {}; }
        if (rec.owner && rec.owner !== owner) {
          return json({ ok: false, error: "not owner" }, { status: 403 });
        }
        rec.v = 1;
        rec.t = Date.now();
        rec.data = b.data || {};
        if (owner) rec.owner = owner;
        await setSetting(env.DB, "progress_" + id, JSON.stringify(rec));
        return json({ ok: true, id: id, saved: rec.t });
      }
      if (p === "/api/sync/load" && req.method === "GET") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const id = await userKey(user);
        const owner = id;
        await ensureSchema(env.DB);
        const r = await loadProgress(env.DB, id);
        if (!r) return json({ ok: false, found: false });
        if (r.owner && r.owner !== owner) {
          return json({ ok: false, error: "not owner" }, { status: 403 });
        }
        return json({ ok: true, id: id, t: r.t, data: r.data });
      }

      // ---------- study rooms (multi-user) ----------
      // room row: settings key = room_<code> ; value = JSON {code,name,members,msgs[]}
      if (p === "/api/room/create" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const b = await req.json().catch(() => ({}));
        const code = String(b.code || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
        if (!code) return json({ error: "code required" }, { status: 400 });
        const owner = await userKey(user);
        await ensureSchema(env.DB);
        await setSetting(env.DB, "room_" + code, JSON.stringify({
          code: code, name: String(b.name || code).slice(0, 60),
          members: [String(b.name || "student").slice(0, 40)],
          msgs: [{ n: "system", t: String(b.name || "student") + " created the room", ts: Date.now() }],
          ts: Date.now(),
          lock: owner ? [owner] : [],
        }));
        return json({ ok: true, code: code });
      }
      if (p === "/api/room/join" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const b = await req.json().catch(() => ({}));
        const code = String(b.code || "").trim().toLowerCase();
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "room_" + code, null);
        if (!raw) return json({ ok: false, error: "room not found" }, { status: 404 });
        const room = JSON.parse(raw);
        const owner = await userKey(user);
        const lock = Array.isArray(room.lock) ? room.lock : [];
        if (lock.length) {
          if (!owner) return json({ ok: false, error: "login required" }, { status: 403 });
          if (lock.indexOf(owner) < 0) lock.push(owner);
        }
        room.lock = lock;
        const nm = String(b.name || "student").slice(0, 40);
        if (!room.members.includes(nm)) room.members.push(nm);
        room.msgs.push({ n: "system", t: nm + " joined the room", ts: Date.now() });
        room.ts = Date.now();
        await setSetting(env.DB, "room_" + code, JSON.stringify(room));
        return json({ ok: true, room: room });
      }
      if (p === "/api/room/post" && req.method === "POST") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const b = await req.json().catch(() => ({}));
        const code = String(b.code || "").trim().toLowerCase();
        const msg = String(b.msg || "").slice(0, 400);
        if (!msg) return json({ error: "msg required" }, { status: 400 });
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "room_" + code, null);
        if (!raw) return json({ ok: false, error: "room not found" }, { status: 404 });
        const room = JSON.parse(raw);
        const owner = await userKey(user);
        const lock = Array.isArray(room.lock) ? room.lock : [];
        if (lock.length && (!owner || lock.indexOf(owner) < 0)) {
          return json({ ok: false, error: "not a member" }, { status: 403 });
        }
        room.msgs.push({ n: String(b.name || "student").slice(0, 40), t: msg, ts: Date.now() });
        if (room.msgs.length > 200) room.msgs = room.msgs.slice(-200);
        room.ts = Date.now();
        await setSetting(env.DB, "room_" + code, JSON.stringify(room));
        return json({ ok: true, room: room });
      }
      if (p === "/api/room/get" && req.method === "GET") {
        const user = await currentUser();
        if (!user) return unauthorized();
        const code = String(url.searchParams.get("code") || "").trim().toLowerCase();
        await ensureSchema(env.DB);
        const raw = await getSetting(env.DB, "room_" + code, null);
        if (!raw) return json({ ok: false, error: "room not found" }, { status: 404 });
        return json({ ok: true, room: JSON.parse(raw) });
      }

      return json({ error: "not found", path: p }, { status: 404 });
    } catch (e) {
      return json({ ok: false, error: String(e.message || e) }, { status: 500 });
    }
}
