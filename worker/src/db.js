// D1 (SQLite) schema + helpers — BoardPrep API

export async function ensureSchema(db) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key)"),
  ]);
}

export async function getSetting(db, key, def = null) {
  const r = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  return r ? r.value : def;
}

export async function setSetting(db, key, value) {
  await db.prepare(
    "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).bind(key, String(value)).run();
}

export async function allSettings(db, prefix) {
  const { results } = await db.prepare("SELECT key, value FROM settings WHERE key LIKE ?").bind(prefix).all();
  const out = {};
  for (const r of results) out[r.key] = r.value;
  return out;
}
