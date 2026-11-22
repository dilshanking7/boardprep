// Nous Portal free model client — token D1 me (refresh ke baad bhi bacha rahe)

import { allSettings, setSetting } from "./db.js";

const DEFAULT_INFERENCE = "https://inference-api.nousresearch.com/v1";
const DEFAULT_PORTAL = "https://portal.nousresearch.com";

export async function getCreds(db, env) {
  const s = await allSettings(db, "nous_%");
  return {
    access: (env.NOUS_TOKEN || s.nous_access_token || ""),
    refresh: s.nous_refresh_token || "",
    clientId: (env.NOUS_CLIENT_ID || s.nous_client_id || ""),
    portal: (env.NOUS_PORTAL || s.nous_portal_url || DEFAULT_PORTAL).replace(/\/+$/, ""),
  };
}

export async function saveCreds(db, c) {
  await setSetting(db, "nous_access_token", c.access || "");
  await setSetting(db, "nous_refresh_token", c.refresh || "");
  await setSetting(db, "nous_client_id", c.clientId || "");
  await setSetting(db, "nous_portal_url", c.portal || DEFAULT_PORTAL);
}

async function refresh(db, c) {
  const res = await fetch(c.portal + "/api/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-nous-refresh-token": c.refresh,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: c.clientId,
      refresh_token: c.refresh,
    }),
  });
  if (!res.ok) throw new Error("token refresh fail (HTTP " + res.status + ")");
  const d = await res.json();
  if (!d.access_token) throw new Error("refresh response me access_token nahi");
  const nc = {
    access: d.access_token,
    refresh: d.refresh_token || c.refresh,
    clientId: c.clientId,
    portal: c.portal,
  };
  await saveCreds(db, nc);
  return nc;
}

export async function nousChat(db, env, messages, opts = {}) {
  let c = await getCreds(db, env);
  if (!c.access) throw new Error("NOUS_CREDS_MISSING");

  const base = (env.INFERENCE_BASE_URL || DEFAULT_INFERENCE).replace(/\/+$/, "");
  const model = env.MODEL || "meituan/longcat-2.5:free";

  const send = (token) => fetch(base + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: opts.maxTokens || 1200,
      temperature: opts.temperature ?? 0.7,
    }),
  });

  let res = await send(c.access);
  if (res.status === 401 || res.status === 403) {
    if (!c.refresh) throw new Error("NOUS_TOKEN_EXPIRED");
    c = await refresh(db, c);
    res = await send(c.access);
  }
  if (!res.ok) {
    const txt = (await res.text()).slice(0, 500);
    throw new Error("Nous API HTTP " + res.status + ": " + txt);
  }
  const d = await res.json();
  const content = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
  if (!content) throw new Error("Nous API se jawab nahi aaya");
  return content.trim();
}
