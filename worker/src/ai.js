// BoardPrep AI — real chat engine
// Free model chain (jo key mili, use ho; warna agle par jaata hai):
//   1. Cloudflare Workers AI  (free — sirf CF account)
//   2. Nous Portal free model (longcat-2.5:free)
//   3. Groq  (free key)      4. Gemini (free key)      5. OpenRouter :free
// + web search (DuckDuckGo + Wikipedia, bina key)
// + rate limit (D1)

import { getSetting, setSetting } from "./db.js";
import { nousChat } from "./nous.js";

const enc = encodeURIComponent;

// ---- web search (free, no key) ----
async function webSearch(q) {
  const out = [];
  // Wikipedia ( sabse pakki )
  try {
    const u = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + enc(q) +
      '&format=json&srlimit=3&origin=*';
    const r = await fetch(u, { headers: { 'User-Agent': 'BoardPrep/1.0' } });
    const j = await r.json();
    (j && j.query && j.query.search || []).forEach(function (s) {
      out.push({
        title: s.title,
        text: String(s.snippet || '').replace(/<[^>]+>/g, ''),
        url: 'https://en.wikipedia.org/wiki/' + enc(s.title.replace(/ /g, '_')),
      });
    });
  } catch (e) { }
  // DuckDuckGo html
  try {
    const u = 'https://duckduckgo.com/html/?q=' + enc(q);
    const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const html = await r.text();
    const re = /result__a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]{0,400}?result__snippet[^>]*>([\s\S]*?)<\/a>/g;
    let m, n = 0;
    while ((m = re.exec(html)) && n < 4) {
      const url = m[1].replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, '').replace(/&amp;.*$/, '');
      const title = m[2].replace(/<[^>]+>/g, '').trim();
      const snip = m[3].replace(/<[^>]+>/g, '').trim();
      if (title) { out.push({ title: title, text: snip, url: decodeURIComponent(url) }); n++; }
    }
  } catch (e) { }
  return out.slice(0, 6);
}

// ---- model chain ----
// har provider ke kuch candidates — jo chala wahi
var CF_MODELS = [
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/qwen/qwen2.5-7b-instruct',
  '@cf/meta/llama-3.2-3b-instruct',
  '@cf/meta/llama-3.2-1b-instruct',
  '@cf/mistral/mistral-7b-instruct-v0.2',
  '@cf/qwen/qwen1.5-14b-chat-awq',
  '@cf/google/gemma-2b-it-lora',
];
var GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
var GEMINI_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite'];
var OR_MODELS = ['meta-llama/llama-3.1-8b-instruct:free', 'google/gemma-2b-it:free', 'mistralai/mistral-7b-instruct:free'];

async function callCF(env, messages) {
  var last = '';
  for (var i = 0; i < CF_MODELS.length; i++) {
    try {
      var r = await env.AI.run(CF_MODELS[i], { messages: messages, max_tokens: 900 });
      var t = (r && (r.response || r.text)) || '';
      if (t) return String(t).trim();
      last = 'empty';
    } catch (e) { last = String(e.message || e).slice(0, 60); }
  }
  throw new Error('CF: ' + last);
}

async function callGroq(env, messages) {
  const key = env.GROQ_KEY || '';
  if (!key) throw new Error('no groq key');
  var last = '';
  for (var i = 0; i < GROQ_MODELS.length; i++) {
    try {
      var r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({ model: GROQ_MODELS[i], messages: messages, max_tokens: 900 }),
      });
      if (!r.ok) { last = 'HTTP ' + r.status + ' ' + (await r.text()).slice(0, 120); continue; }
      var j = await r.json();
      var t = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
      if (t) return String(t).trim();
      last = 'empty';
    } catch (e) { last = String(e.message || e).slice(0, 60); }
  }
  throw new Error('groq: ' + last);
}

async function callGemini(env, messages) {
  const key = env.GEMINI_KEY || '';
  if (!key) throw new Error('no gemini key');
  const sys = messages.filter(function (m) { return m.role === 'system'; })
    .map(function (m) { return m.content; }).join('\n');
  const conv = messages.filter(function (m) { return m.role !== 'system'; }).map(function (m) {
    return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
  });
  var last = '';
  for (var i = 0; i < GEMINI_MODELS.length; i++) {
    try {
      var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' +
        GEMINI_MODELS[i] + ':generateContent?key=' + enc(key), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: conv }),
      });
      if (!r.ok) { last = 'HTTP ' + r.status + ' ' + (await r.text()).slice(0, 120); continue; }
      var j = await r.json();
      var t = j && j.candidates && j.candidates[0] && j.candidates[0].content &&
        j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text;
      if (t) return String(t).trim();
      last = 'empty';
    } catch (e) { last = String(e.message || e).slice(0, 60); }
  }
  throw new Error('gemini: ' + last);
}

async function callOpenRouter(env, messages) {
  const key = env.OPENROUTER_KEY || '';
  if (!key) throw new Error('no openrouter key');
  var last = '';
  for (var i = 0; i < OR_MODELS.length; i++) {
    try {
      var r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({ model: OR_MODELS[i], messages: messages, max_tokens: 900 }),
      });
      if (!r.ok) { last = 'HTTP ' + r.status; continue; }
      var j = await r.json();
      var t = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
      if (t) return String(t).trim();
      last = 'empty';
    } catch (e) { last = String(e.message || e).slice(0, 60); }
  }
  throw new Error('openrouter: ' + last);
}

// jo kaam kare, wahi chuno
async function askAI(db, env, messages) {
  const tries = [
    ['Groq GPT-OSS', function () { return callGroq(env, messages); }],
    ['Cloudflare AI', function () { return callCF(env, messages); }],
    ['Gemini', function () { return callGemini(env, messages); }],
    ['Nous longcat', function () { return nousChat(db, env, messages); }],
    ['OpenRouter free', function () { return callOpenRouter(env, messages); }],
  ];
  const errs = [];
  for (let i = 0; i < tries.length; i++) {
    try {
      const t = await tries[i][1]();
      if (t) return { text: t, model: tries[i][0] };
    } catch (e) { errs.push(tries[i][0] + ': ' + String(e.message || e).slice(0, 50)); }
  }
  throw new Error('sab model fail — ' + errs.join(', '));
}

// ---- rate limit (D1) ----
async function rateLimit(db, id, env) {
  const now = Date.now();
  const per = Number(env.LIMIT_PER || 20);
  const winH = Number(env.WINDOW_HOURS || 1);
  const win = winH * 3600000;
  const key = 'rl_' + id;
  const raw = await getSetting(db, key);
  let rec = null;
  try { rec = raw ? JSON.parse(raw) : null; } catch (e) { }
  if (!rec || now > rec.reset) rec = { n: 0, reset: now + win };
  if (rec.n >= per) {
    return { ok: false, left: 0, retryMs: rec.reset - now, per: per, windowH: winH };
  }
  rec.n++;
  await setSetting(db, key, JSON.stringify(rec));
  return { ok: true, left: per - rec.n, per: per, windowH: winH, reset: rec.reset };
}

// kaun sa model chalta hai — har ek aajmao (diagnostic)
async function probe(env, provider, models) {
  const out = [];
  for (let i = 0; i < models.length; i++) {
    const m = models[i];
    try {
      let r;
      if (provider === "groqv") {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (env.GROQ_KEY || '') },
          body: JSON.stringify({
            model: m,
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: 'Is this a blank image? answer yes/no' },
                { type: 'image_url', image_url: { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' } },
              ],
            }],
            max_tokens: 40,
          }),
        });
      } else if (provider === 'groq') {
        r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (env.GROQ_KEY || '') },
          body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'अम्ल नीला लिटमस कैसे बदलता है? एक लाइन में।' }], max_tokens: 80 }),
        });
      } else {
        r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + enc(env.GEMINI_KEY || ''), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'अम्ल नीला लिटमस कैसे बदलता है? एक लाइन में।' }] }] }),
        });
      }
      const txt = await r.text();
      if (r.ok) {
        const j = JSON.parse(txt);
        const t = provider === 'groq'
          ? (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content)
          : (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text);
        out.push({ model: m, ok: true, a: String(t || '').slice(0, 70) });
      } else {
        out.push({ model: m, ok: false, s: r.status, e: txt.slice(0, 80) });
      }
    } catch (e) { out.push({ model: m, ok: false, e: String(e.message || e).slice(0, 80) }); }
  }
  return out;
}

// CF vision (photo samajhna)
async function probeCFVision(env, models) {
  const out = [];
  const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  for (let i = 0; i < models.length; i++) {
    try {
      const r = await env.AI.run(models[i], {
        image: b64,
        prompt: "Is this a blank image? answer yes/no",
        max_tokens: 20,
      });
      out.push({ model: models[i], ok: true, a: String((r && (r.response || r.text)) || '').slice(0, 60) });
    } catch (e) { out.push({ model: models[i], ok: false, e: String(e.message || e).slice(0, 90) }); }
  }
  return out;
}

export { webSearch, askAI, rateLimit, callCF, callGroq, callGemini, callOpenRouter, probe, probeCFVision };
