// sb-api: accounts and admin backend for surinamebusiness.com
// Deploy ONLY to the Suriname Business Cloudflare account. Never to the Explore account.
//
// - Sign in with Google: the browser gets a signed ID token from Google Identity Services and posts it here.
//   We verify the RS256 signature against Google's public keys, the audience (our client ID) and expiry.
//   No client secret exists or is needed.
// - Sessions: random token in an HttpOnly, Secure, SameSite=Lax __Host- cookie on id.surinamebusiness.com;
//   only its SHA-256 is stored.
// - Shares the sb-jobs D1 database and PDF KV with the sb-jobs worker. This worker only ADDS tables
//   (sb_*) and never changes the jobs table layout. Job rows follow the exact rules of sb-jobs.
// - Every state-changing request must be JSON (or multipart for vacancies) from an allowed Origin.

const TYPES = ["FULL_TIME", "PART_TIME", "TEMPORARY", "CONTRACTOR", "INTERN"];
const LOCATIONS = ["Paramaribo", "Wanica", "Nickerie", "Coronie", "Saramacca", "Commewijne", "Marowijne",
  "Para", "Brokopondo", "Sipaliwini", "Remote"];
const CURRENCIES = ["SRD", "USD", "EUR"];
const PERIODS = ["MONTH", "HOUR", "YEAR"];
const MAX_PDF = 3 * 1024 * 1024;
const MAX_DAYS = 60;
const JOBS_PER_USER_DAY = 5;
const SESSION_DAYS = 60;
const COOKIE = "__Host-sbs";
const MAX_VALUE = 900 * 1024;          // one synced item
const MAX_USER_BYTES = 15 * 1024 * 1024;
const MAX_USER_KEYS = 1000;
const CONTENT_KINDS = ["banner", "news", "tender", "notice", "link", "company"];
// business directory: groups a listing can be filed under (same keys as companies.py GROUPS on the site)
const CO_GROUPS = ["supermarkets", "wholesale", "department", "clothing", "auto", "fuel", "building", "home", "electronics",
  "beauty", "health", "finance", "food", "jewelry", "offices", "ngo", "government", "travel", "services", "markets", "other"];
const SETTINGS = {                      // admin-editable site settings with their defaults
  jobs_open: true,                      // employers can post vacancies
  signup_open: true,                    // new accounts can be created
  featured_tools: "invoice,quote,payslip,pricing,importcost,loan,btwregister,qrcode,pdftools",
  support_whatsapp: "",
  home_message_nl: "",
  home_message_en: "",
};

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, "") || "/";
    try {
      await migrate(env);
      if (req.method === "OPTIONS") return cors(req, env, new Response(null, { status: 204 }));
      if (p === "/" || p === "/health") return cors(req, env, json({ ok: true, service: "sb-api" }));
      if (p === "/public/content" && req.method === "GET") return cors(req, env, await publicContent(env));
      if (req.method !== "GET" && req.method !== "HEAD") {
        const bad = guard(req, env);
        if (bad) return cors(req, env, bad);
      }
      const r = await route(req, env, ctx, url, p);
      return cors(req, env, r || json({ ok: false, error: "not_found" }, 404));
    } catch (e) {
      if (e instanceof HttpError) return cors(req, env, json({ ok: false, error: e.code, field: e.field }, e.status));
      console.error("sb-api error", e && e.stack || e);
      return cors(req, env, json({ ok: false, error: "server" }, 500));
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      await migrate(env);
      await env.DB.prepare("DELETE FROM sb_sessions WHERE expires_at<?").bind(nowIso()).run();
      await env.DB.prepare("DELETE FROM sb_audit WHERE at<?").bind(new Date(Date.now() - 365 * 864e5).toISOString()).run();
      await env.DB.prepare("DELETE FROM sb_job_owners WHERE job_id NOT IN (SELECT id FROM jobs)").run();
      // retention promised on /privacy: contact messages 12 months; who submitted a listing (name, email, role, IP hash) 12 months
      const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString();
      try {
        await env.DB.prepare("DELETE FROM sb_messages WHERE created_at<?").bind(yearAgo).run();
        await env.DB.prepare("UPDATE sb_content SET data=json_remove(data,'$.by_name','$.by_email','$.by_role','$.ih') WHERE kind='company' AND created_at<? AND json_valid(data) AND json_extract(data,'$.by_email') IS NOT NULL").bind(yearAgo).run();
      } catch (e) { console.error("sb-api retention", e && e.stack || e); }
    })());
  },
};

async function route(req, env, ctx, url, p) {
  const M = req.method;
  // auth
  if (p === "/auth/google" && M === "POST") return authGoogle(req, env);
  if (p === "/auth/dev" && M === "POST") return authDev(req, env);
  if (p === "/auth/logout" && M === "POST") return logout(req, env, false);
  if (p === "/auth/logout-all" && M === "POST") return logout(req, env, true);
  // public
  if (p === "/contact" && M === "POST") return contact(req, env, ctx);
  if (p === "/listing" && M === "POST") return submitListing(req, env, ctx);
  if (p === "/settings" && M === "GET") return json({ ok: true, settings: await getSettings(env) });
  // signed-in user
  if (p.startsWith("/me")) {
    const u = await requireUser(req, env);
    if (p === "/me" && M === "GET") return json({ ok: true, user: publicUser(u), settings: await getSettings(env) });
    if (p === "/me" && M === "DELETE") return deleteAccount(req, env, u);
    if (p === "/me/profile" && M === "POST") return updateProfile(req, env, u);
    if (p === "/me/sessions" && M === "GET") return sessions(env, u, req);
    if (p === "/me/data" && M === "GET") return getData(url, env, u);
    if (p === "/me/data" && M === "PUT") return putData(req, env, u);
    if (p === "/me/export" && M === "GET") return exportData(env, u);
    if (p === "/me/jobs" && M === "GET") return myJobs(env, u);
    if (p === "/me/jobs" && M === "POST") return createJob(req, env, ctx, u);
    const m = p.match(/^\/me\/jobs\/([a-z0-9]{8})$/);
    if (m && M === "GET") return json({ ok: true, job: jobOut(await ownedJob(env, u, m[1]), true) });
    if (m && M === "POST") return jobAction(req, env, ctx, u, m[1]);
    return null;
  }
  // admin
  if (p.startsWith("/admin")) {
    const u = await requireUser(req, env);
    if (u.role !== "admin") throw new HttpError(403, "forbidden");
    if (p === "/admin/stats" && M === "GET") return adminStats(env);
    if (p === "/admin/jobs" && M === "GET") return adminJobs(url, env);
    let m = p.match(/^\/admin\/jobs\/([a-z0-9]{8})$/);
    if (m && M === "POST") return adminJobAction(req, env, ctx, u, m[1]);
    m = p.match(/^\/admin\/jobs\/([a-z0-9]{8})\/pdf$/);
    if (m && M === "GET") return adminJobPdf(env, m[1]);
    if (p === "/admin/users" && M === "GET") return adminUsers(url, env);
    m = p.match(/^\/admin\/users\/([a-z0-9]{12})$/);
    if (m && M === "GET") return adminUser(env, m[1]);
    if (m && M === "POST") return adminUserAction(req, env, u, m[1]);
    if (p === "/admin/content" && M === "GET") return adminContent(env);
    if (p === "/admin/content" && M === "POST") return saveContent(req, env, u);
    m = p.match(/^\/admin\/content\/([a-z0-9]{12})$/);
    if (m && M === "DELETE") return deleteContent(env, u, m[1]);
    if (p === "/admin/messages" && M === "GET") return adminMessages(url, env);
    m = p.match(/^\/admin\/messages\/([a-z0-9]{12})$/);
    if (m && M === "POST") return messageAction(req, env, u, m[1]);
    if (p === "/admin/settings" && M === "GET") return json({ ok: true, settings: await getSettings(env), defaults: SETTINGS });
    if (p === "/admin/settings" && M === "PUT") return putSettings(req, env, u);
    if (p === "/admin/audit" && M === "GET") return adminAudit(env);
    return null;
  }
  return null;
}

// ------------------------------------------------------------------ helpers
const enc = new TextEncoder();
class HttpError extends Error {
  constructor(status, code, field) { super(code); this.status = status; this.code = code; this.field = field; }
}
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });
}
function origins(env) {
  return (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
}
function localDev(env, origin) {
  return env.DEV_LOGIN === "1" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
}
function cors(req, env, res) {
  const origin = req.headers.get("origin") || "";
  const h = new Headers(res.headers);
  if (origins(env).includes(origin) || localDev(env, origin)) {
    h.set("access-control-allow-origin", origin);
    h.set("access-control-allow-credentials", "true");
    h.set("vary", "origin");
    h.set("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
    h.set("access-control-allow-headers", "content-type");
    h.set("access-control-max-age", "600");
  }
  h.set("x-content-type-options", "nosniff");
  return new Response(res.body, { status: res.status, headers: h });
}
// CSRF: state changes only from our own pages, and only as JSON or multipart (no simple form posts)
function guard(req, env) {
  const origin = req.headers.get("origin") || "";
  if (!origins(env).includes(origin) && !localDev(env, origin)) return json({ ok: false, error: "origin" }, 403);
  const ct = req.headers.get("content-type") || "";
  if (req.method !== "DELETE" && !ct.startsWith("application/json") && !ct.startsWith("multipart/form-data"))
    return json({ ok: false, error: "content_type" }, 415);
  return null;
}
async function body(req) {
  try { return await req.json(); } catch (e) { throw new HttpError(400, "bad_json"); }
}
function hex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""); }
async function sha256(s) { return hex(await crypto.subtle.digest("SHA-256", enc.encode(s))); }
function token(n = 32) { const b = new Uint8Array(n); crypto.getRandomValues(b); return hex(b); }
function rid(n = 12) {
  const a = "abcdefghijkmnpqrstuvwxyz23456789", b = new Uint8Array(n); crypto.getRandomValues(b);
  return [...b].map(x => a[x % a.length]).join("");
}
function newJobId() {
  const a = "abcdefghjkmnpqrstuvwxyz23456789", b = new Uint8Array(8); crypto.getRandomValues(b);
  return [...b].map(x => a[x % a.length]).join("");
}
function slugify(s) {
  return String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70).replace(/-+$/, "");
}
function nowIso() { return new Date().toISOString().replace(/\.\d+Z$/, "Z"); }
function todaySR() { return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); }
function addDays(d, n) { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
function clean(s, max) {
  return String(s == null ? "" : s).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}
function oneLine(s, max) { return clean(s, max * 2).replace(/\s+/g, " ").trim().slice(0, max); }
function isEmail(s) { return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i.test(s) && s.length <= 160; }
function isUrl(s) {
  try { const u = new URL(s); return (u.protocol === "https:" || u.protocol === "http:") && s.length <= 500; } catch (e) { return false; }
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function siteUrl(env) { return (env.SITE_URL || "https://surinamebusiness.com").replace(/\/$/, ""); }
function siteJobUrl(env, j) { return `${siteUrl(env)}${j.lang === "en" ? "/en/jobs" : "/vacatures"}/${j.slug}`; }
async function ipHash(req, env) {
  return sha256((env.HASH_SALT || "sb-api") + "|ip|" + (req.headers.get("cf-connecting-ip") || "0.0.0.0"));
}

// ------------------------------------------------------------------ schema (additive only)
let migrated = false;
async function migrate(env) {
  if (migrated) return;
  await env.DB.batch([
    `CREATE TABLE IF NOT EXISTS sb_users (
      id TEXT PRIMARY KEY, google_sub TEXT UNIQUE NOT NULL, email TEXT NOT NULL, name TEXT, picture TEXT,
      company TEXT, phone TEXT, lang TEXT, role TEXT NOT NULL DEFAULT 'user', status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL, last_login_at TEXT, login_count INTEGER NOT NULL DEFAULT 0, note TEXT)`,
    `CREATE INDEX IF NOT EXISTS sb_users_email ON sb_users(email)`,
    `CREATE TABLE IF NOT EXISTS sb_sessions (
      id_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL,
      last_seen_at TEXT, ua TEXT, ip_hash TEXT)`,
    `CREATE INDEX IF NOT EXISTS sb_sessions_user ON sb_sessions(user_id)`,
    `CREATE TABLE IF NOT EXISTS sb_user_data (
      user_id TEXT NOT NULL, k TEXT NOT NULL, v TEXT, u INTEGER NOT NULL, size INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, k))`,
    `CREATE TABLE IF NOT EXISTS sb_job_owners (job_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS sb_job_owners_user ON sb_job_owners(user_id)`,
    `CREATE TABLE IF NOT EXISTS sb_content (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'live', lang TEXT NOT NULL DEFAULT 'all',
      title TEXT NOT NULL, title_en TEXT, body TEXT, body_en TEXT, url TEXT, source TEXT, starts TEXT, ends TEXT,
      sort INTEGER NOT NULL DEFAULT 0, data TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, created_by TEXT)`,
    `CREATE TABLE IF NOT EXISTS sb_messages (
      id TEXT PRIMARY KEY, name TEXT, email TEXT, subject TEXT, body TEXT NOT NULL, page TEXT, user_id TEXT,
      ip_hash TEXT, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, note TEXT)`,
    `CREATE INDEX IF NOT EXISTS sb_messages_ip ON sb_messages(ip_hash, created_at)`,
    `CREATE TABLE IF NOT EXISTS sb_settings (k TEXT PRIMARY KEY, v TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS sb_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, user_id TEXT, email TEXT, action TEXT NOT NULL,
      target TEXT, detail TEXT)`,
  ].map(s => env.DB.prepare(s)));
  migrated = true;
}
async function audit(env, u, action, target, detail) {
  await env.DB.prepare("INSERT INTO sb_audit (at,user_id,email,action,target,detail) VALUES (?,?,?,?,?,?)")
    .bind(nowIso(), u ? u.id : null, u ? u.email : null, action, target || null,
      detail == null ? null : (typeof detail === "string" ? detail : JSON.stringify(detail)).slice(0, 2000)).run();
}

// ------------------------------------------------------------------ Google sign-in
let JWKS = null, JWKS_AT = 0;
async function googleKeys(force) {
  if (!force && JWKS && Date.now() - JWKS_AT < 3600e3) return JWKS;
  const r = await fetch("https://www.googleapis.com/oauth2/v3/certs", { cf: { cacheTtl: 3600 } });
  if (!r.ok) throw new HttpError(502, "google_keys");
  JWKS = (await r.json()).keys || []; JWKS_AT = Date.now();
  return JWKS;
}
function b64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  const bin = atob(s), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
export async function verifyGoogleToken(cred, clientId, now = Date.now()) {
  const parts = String(cred || "").split(".");
  if (parts.length !== 3) throw new HttpError(400, "token");
  let header, claims;
  try {
    header = JSON.parse(new TextDecoder().decode(b64url(parts[0])));
    claims = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
  } catch (e) { throw new HttpError(400, "token"); }
  if (header.alg !== "RS256" || !header.kid) throw new HttpError(400, "token");
  let jwk = (await googleKeys()).find(k => k.kid === header.kid);
  if (!jwk) jwk = (await googleKeys(true)).find(k => k.kid === header.kid);
  if (!jwk) throw new HttpError(401, "token_key");
  const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(parts[2]), enc.encode(parts[0] + "." + parts[1]));
  if (!ok) throw new HttpError(401, "token_signature");
  if (!["accounts.google.com", "https://accounts.google.com"].includes(claims.iss)) throw new HttpError(401, "token_issuer");
  if (claims.aud !== clientId) throw new HttpError(401, "token_audience");
  if (!claims.exp || claims.exp * 1000 < now - 60e3) throw new HttpError(401, "token_expired");
  if (claims.iat && claims.iat * 1000 > now + 300e3) throw new HttpError(401, "token_future");
  if (!(claims.email_verified === true || claims.email_verified === "true") || !claims.email) throw new HttpError(401, "email_unverified");
  return claims;
}
async function authGoogle(req, env) {
  const b = await body(req);
  const c = await verifyGoogleToken(b.credential, env.GOOGLE_CLIENT_ID);
  return signIn(req, env, { sub: "g:" + c.sub, email: String(c.email).toLowerCase(), name: c.name || "",
    picture: c.picture || "", lang: (b.lang === "en" ? "en" : "nl") });
}
// local testing only: needs DEV_LOGIN=1 (never set in production) AND a localhost origin
async function authDev(req, env) {
  if (!localDev(env, req.headers.get("origin"))) return null;
  const b = await body(req);
  const email = String(b.email || "").toLowerCase();
  if (!isEmail(email)) throw new HttpError(400, "invalid", "email");
  return signIn(req, env, { sub: "dev:" + email, email, name: b.name || email.split("@")[0], picture: "", lang: "nl" });
}
function adminEmails(env) { return (env.ADMIN_EMAILS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean); }
async function signIn(req, env, g) {
  let u = await env.DB.prepare("SELECT * FROM sb_users WHERE google_sub=?").bind(g.sub).first();
  const isAdmin = adminEmails(env).includes(g.email);
  const now = nowIso();
  if (!u) {
    const st = await getSettings(env);
    if (!st.signup_open && !isAdmin) throw new HttpError(403, "signup_closed");
    const id = rid(12);
    await env.DB.prepare(`INSERT INTO sb_users (id,google_sub,email,name,picture,lang,role,status,created_at,last_login_at,login_count)
      VALUES (?,?,?,?,?,?,?,?,?,?,1)`).bind(id, g.sub, g.email, oneLine(g.name, 100), oneLine(g.picture, 500), g.lang,
      isAdmin ? "admin" : "user", "active", now, now).run();
    u = await env.DB.prepare("SELECT * FROM sb_users WHERE id=?").bind(id).first();
    await audit(env, u, "signup", u.id, { email: g.email });
  } else {
    if (u.status === "blocked") throw new HttpError(403, "blocked");
    const role = isAdmin ? "admin" : (u.role === "admin" ? "admin" : "user");
    await env.DB.prepare("UPDATE sb_users SET email=?, name=COALESCE(NULLIF(name,''),?), picture=?, role=?, last_login_at=?, login_count=login_count+1 WHERE id=?")
      .bind(g.email, oneLine(g.name, 100), oneLine(g.picture, 500), role, now, u.id).run();
    u = await env.DB.prepare("SELECT * FROM sb_users WHERE id=?").bind(u.id).first();
  }
  const tok = token(32);
  const exp = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await env.DB.prepare("INSERT INTO sb_sessions (id_hash,user_id,created_at,expires_at,last_seen_at,ua,ip_hash) VALUES (?,?,?,?,?,?,?)")
    .bind(await sha256(tok), u.id, now, exp, now, oneLine(req.headers.get("user-agent") || "", 200), await ipHash(req, env)).run();
  return json({ ok: true, user: publicUser(u), settings: await getSettings(env) }, 200,
    { "set-cookie": `${COOKIE}=${tok}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax` });
}
function readCookie(req) {
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + COOKIE.replace(/[-]/g, "\\-") + "=([a-f0-9]{64})"));
  return m ? m[1] : null;
}
async function currentUser(req, env) {
  const tok = readCookie(req);
  if (!tok) return null;
  const h = await sha256(tok);
  const s = await env.DB.prepare("SELECT * FROM sb_sessions WHERE id_hash=?").bind(h).first();
  if (!s || s.expires_at < nowIso()) return null;
  const u = await env.DB.prepare("SELECT * FROM sb_users WHERE id=?").bind(s.user_id).first();
  if (!u || u.status !== "active") return null;
  if (!s.last_seen_at || Date.now() - Date.parse(s.last_seen_at) > 3600e3)
    await env.DB.prepare("UPDATE sb_sessions SET last_seen_at=? WHERE id_hash=?").bind(nowIso(), h).run();
  u._session = h;
  return u;
}
async function requireUser(req, env) {
  const u = await currentUser(req, env);
  if (!u) throw new HttpError(401, "login");
  return u;
}
function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, picture: u.picture, company: u.company, phone: u.phone,
    lang: u.lang, role: u.role, created_at: u.created_at };
}
async function logout(req, env, all) {
  const u = await currentUser(req, env);
  if (u) {
    if (all) await env.DB.prepare("DELETE FROM sb_sessions WHERE user_id=?").bind(u.id).run();
    else await env.DB.prepare("DELETE FROM sb_sessions WHERE id_hash=?").bind(u._session).run();
  }
  return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` });
}
async function sessions(env, u) {
  const { results } = await env.DB.prepare("SELECT id_hash,created_at,last_seen_at,ua FROM sb_sessions WHERE user_id=? AND expires_at>? ORDER BY last_seen_at DESC")
    .bind(u.id, nowIso()).all();
  return json({ ok: true, sessions: results.map(s => ({ current: s.id_hash === u._session, created_at: s.created_at,
    last_seen_at: s.last_seen_at, ua: s.ua })) });
}
async function updateProfile(req, env, u) {
  const b = await body(req);
  const name = oneLine(b.name, 100), company = oneLine(b.company, 120), phone = oneLine(b.phone, 40);
  const lang = b.lang === "en" ? "en" : "nl";
  await env.DB.prepare("UPDATE sb_users SET name=?, company=?, phone=?, lang=? WHERE id=?").bind(name, company, phone, lang, u.id).run();
  const nu = await env.DB.prepare("SELECT * FROM sb_users WHERE id=?").bind(u.id).first();
  return json({ ok: true, user: publicUser(nu) });
}
async function deleteAccount(req, env, u) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sb_user_data WHERE user_id=?").bind(u.id),
    env.DB.prepare("DELETE FROM sb_sessions WHERE user_id=?").bind(u.id),
    env.DB.prepare("DELETE FROM sb_job_owners WHERE user_id=?").bind(u.id),
    env.DB.prepare("UPDATE sb_messages SET user_id=NULL WHERE user_id=?").bind(u.id),
    env.DB.prepare("DELETE FROM sb_users WHERE id=?").bind(u.id),
  ]);
  await audit(env, null, "account_deleted", u.id, null);
  return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` });
}

// ------------------------------------------------------------------ synced data (last writer wins per key)
const KEY_RE = /^[A-Za-z0-9:_.\-]{1,80}$/;
async function getData(url, env, u) {
  if (url.searchParams.get("meta") === "1") {
    const { results } = await env.DB.prepare("SELECT k,u,size,(v IS NULL) AS deleted FROM sb_user_data WHERE user_id=?").bind(u.id).all();
    return json({ ok: true, items: results.map(r => ({ k: r.k, u: r.u, size: r.size, deleted: !!r.deleted })) });
  }
  const keys = url.searchParams.getAll("k").filter(k => KEY_RE.test(k)).slice(0, 100);
  let rows;
  if (keys.length) {
    rows = (await env.DB.prepare(`SELECT k,v,u FROM sb_user_data WHERE user_id=? AND k IN (${keys.map(() => "?").join(",")})`)
      .bind(u.id, ...keys).all()).results;
  } else {
    rows = (await env.DB.prepare("SELECT k,v,u FROM sb_user_data WHERE user_id=?").bind(u.id).all()).results;
  }
  return json({ ok: true, items: rows.map(r => ({ k: r.k, v: r.v, u: r.u })) });
}
async function putData(req, env, u) {
  const b = await body(req);
  const items = Array.isArray(b.items) ? b.items.slice(0, 100) : [];
  const now = Date.now();
  const tot = await env.DB.prepare("SELECT COALESCE(SUM(size),0) bytes, COUNT(*) n FROM sb_user_data WHERE user_id=?").bind(u.id).first();
  let bytes = tot.bytes, n = tot.n;
  const accepted = [], rejected = [], stmts = [];
  for (const it of items) {
    const k = String(it && it.k || "");
    if (!KEY_RE.test(k)) { rejected.push({ k, error: "key" }); continue; }
    const v = it.v == null ? null : String(it.v);
    const t = Math.min(Number(it.u) || now, now + 60e3);
    const size = v == null ? 0 : enc.encode(v).length;
    if (size > MAX_VALUE) { rejected.push({ k, error: "too_large" }); continue; }
    const cur = await env.DB.prepare("SELECT u,size FROM sb_user_data WHERE user_id=? AND k=?").bind(u.id, k).first();
    if (cur && cur.u >= t) { rejected.push({ k, error: "older", u: cur.u }); continue; }
    const nb = bytes - (cur ? cur.size : 0) + size, nn = n + (cur ? 0 : 1);
    if (nb > MAX_USER_BYTES || nn > MAX_USER_KEYS) { rejected.push({ k, error: "quota" }); continue; }
    bytes = nb; n = nn;
    stmts.push(env.DB.prepare(`INSERT INTO sb_user_data (user_id,k,v,u,size) VALUES (?,?,?,?,?)
      ON CONFLICT(user_id,k) DO UPDATE SET v=excluded.v, u=excluded.u, size=excluded.size`).bind(u.id, k, v, t, size));
    accepted.push({ k, u: t });
  }
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true, accepted, rejected, quota: { bytes, max: MAX_USER_BYTES, keys: n } });
}
async function exportData(env, u) {
  const data = (await env.DB.prepare("SELECT k,v,u FROM sb_user_data WHERE user_id=? AND v IS NOT NULL").bind(u.id).all()).results;
  const jobs = await ownedJobs(env, u);
  return json({ ok: true, exported_at: nowIso(), user: publicUser(u),
    data: Object.fromEntries(data.map(r => { let v = r.v; try { v = JSON.parse(r.v); } catch (e) { /* keep text */ } return [r.k, v]; })),
    jobs: jobs.map(j => jobOut(j, true)) }, 200,
    { "content-disposition": `attachment; filename="surinamebusiness-${u.id}.json"` });
}

// ------------------------------------------------------------------ vacancies of the signed-in employer
// A job belongs to a user when they posted it signed in (sb_job_owners), or when its contact address is
// the user's Google-verified address (vacancies posted earlier through the public form).
async function ownedJobs(env, u) {
  const { results } = await env.DB.prepare(`SELECT j.* FROM jobs j WHERE j.id IN (SELECT job_id FROM sb_job_owners WHERE user_id=?)
      OR lower(j.contact_email)=? ORDER BY j.created_at DESC LIMIT 200`).bind(u.id, u.email.toLowerCase()).all();
  return results;
}
async function ownedJob(env, u, id) {
  const j = await env.DB.prepare(`SELECT j.* FROM jobs j WHERE j.id=? AND (j.id IN (SELECT job_id FROM sb_job_owners WHERE user_id=?)
      OR lower(j.contact_email)=?)`).bind(id, u.id, u.email.toLowerCase()).first();
  if (!j) throw new HttpError(404, "not_found");
  return j;
}
function jobOut(j, full) {
  const o = { id: j.id, slug: j.slug, status: j.status, lang: j.lang, title: j.title, employer: j.employer,
    employer_url: j.employer_url, location: j.location, employment_type: j.employment_type, deadline: j.deadline,
    salary_min: j.salary_min, salary_max: j.salary_max, salary_currency: j.salary_currency, salary_period: j.salary_period,
    apply_email: j.apply_email, apply_url: j.apply_url, has_pdf: !!j.pdf_key, created_at: j.created_at,
    approved_at: j.approved_at, closed_at: j.closed_at, reject_reason: j.reject_reason };
  if (full) Object.assign(o, { description: j.description, contact_name: j.contact_name, contact_email: j.contact_email,
    contact_phone: j.contact_phone, verified_at: j.verified_at });
  return o;
}
async function myJobs(env, u) {
  return json({ ok: true, jobs: (await ownedJobs(env, u)).map(j => jobOut(j, true)), today: todaySR(), max_days: MAX_DAYS });
}
// read and validate vacancy fields exactly like sb-jobs does
async function readJobForm(req) {
  const ct = req.headers.get("content-type") || "";
  let g, pdf = null;
  if (ct.startsWith("multipart/form-data")) {
    const f = await req.formData();
    g = k => (f.get(k) == null || typeof f.get(k) !== "string") ? "" : f.get(k);
    const p = f.get("pdf"); if (p && typeof p === "object" && p.size > 0) pdf = p;
  } else {
    const b = await body(req);
    g = k => (b[k] == null ? "" : String(b[k]));
  }
  return { g, pdf };
}
function validateJob(g, today) {
  const job = {
    lang: g("lang") === "en" ? "en" : "nl",
    title: oneLine(g("title"), 120),
    employer: oneLine(g("employer"), 120),
    employer_url: oneLine(g("employer_url"), 300) || null,
    location: g("location"),
    employment_type: g("employment_type"),
    description: clean(g("description"), 10000),
    salary_min: g("salary_min") ? Number(String(g("salary_min")).replace(/[^\d.]/g, "")) : null,
    salary_max: g("salary_max") ? Number(String(g("salary_max")).replace(/[^\d.]/g, "")) : null,
    salary_currency: g("salary_currency") || null,
    salary_period: g("salary_period") || null,
    deadline: g("deadline"),
    apply_email: oneLine(g("apply_email"), 160).toLowerCase() || null,
    apply_url: oneLine(g("apply_url"), 500) || null,
    contact_name: oneLine(g("contact_name"), 100),
    contact_phone: oneLine(g("contact_phone"), 40) || null,
  };
  const bad = f => { throw new HttpError(400, "invalid", f); };
  if (job.title.length < 3) bad("title");
  if (job.employer.length < 2) bad("employer");
  if (job.employer_url && !isUrl(job.employer_url)) bad("employer_url");
  if (!LOCATIONS.includes(job.location)) bad("location");
  if (!TYPES.includes(job.employment_type)) bad("employment_type");
  if (job.description.length < 150) bad("description");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(job.deadline) || job.deadline <= today || job.deadline > addDays(today, MAX_DAYS)) bad("deadline");
  if (!job.apply_email && !job.apply_url) bad("apply");
  if (job.apply_email && !isEmail(job.apply_email)) bad("apply_email");
  if (job.apply_url && !isUrl(job.apply_url)) bad("apply_url");
  if (job.contact_name.length < 2) bad("contact_name");
  for (const k of ["salary_min", "salary_max"]) {
    if (job[k] != null && !(isFinite(job[k]) && job[k] > 0 && job[k] < 1e8)) bad(k);
  }
  if (job.salary_min || job.salary_max) {
    if (!CURRENCIES.includes(job.salary_currency)) bad("salary_currency");
    if (!PERIODS.includes(job.salary_period)) bad("salary_period");
    if (job.salary_min && job.salary_max && job.salary_max < job.salary_min) bad("salary_max");
  } else { job.salary_currency = null; job.salary_period = null; }
  return job;
}
async function storePdf(env, id, pdf) {
  if (!pdf) return null;
  if (pdf.size > MAX_PDF) throw new HttpError(400, "invalid", "pdf");
  const buf = await pdf.arrayBuffer();
  if (new TextDecoder().decode(buf.slice(0, 5)) !== "%PDF-") throw new HttpError(400, "invalid", "pdf");
  const key = `jobs/${id}.pdf`;
  await env.FILES.put(key, buf);
  return key;
}
async function createJob(req, env, ctx, u) {
  const st = await getSettings(env);
  if (!st.jobs_open && u.role !== "admin") throw new HttpError(403, "jobs_closed");
  const { g, pdf } = await readJobForm(req);
  if (g("rules") !== "yes") throw new HttpError(400, "invalid", "rules");
  const job = validateJob(g, todaySR());
  const since = new Date(Date.now() - 864e5).toISOString();
  const c = await env.DB.prepare("SELECT COUNT(*) n FROM sb_job_owners WHERE user_id=? AND created_at>?").bind(u.id, since).first();
  if (c && c.n >= JOBS_PER_USER_DAY && u.role !== "admin") throw new HttpError(429, "rate");
  const id = newJobId();
  const pdfKey = await storePdf(env, id, pdf);
  const slug = (slugify(job.title + " " + job.employer) || "vacature") + "-" + id;
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO jobs (id,slug,status,lang,title,employer,employer_url,location,employment_type,description,
      salary_min,salary_max,salary_currency,salary_period,deadline,apply_email,apply_url,pdf_key,contact_name,contact_email,
      contact_phone,verify_hash,ip_hash,created_at,verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      id, slug, "pending", job.lang, job.title, job.employer, job.employer_url, job.location, job.employment_type,
      job.description, job.salary_min, job.salary_max, job.salary_currency, job.salary_period, job.deadline,
      job.apply_email, job.apply_url, pdfKey, job.contact_name, u.email, job.contact_phone,
      await sha256(token(16)), await ipHash(req, env), now, now),
    env.DB.prepare("INSERT INTO sb_job_owners (job_id,user_id,created_at) VALUES (?,?,?)").bind(id, u.id, now),
  ]);
  await audit(env, u, "job_create", id, job.title);
  ctx.waitUntil(notifyAdmin(env, `Nieuwe vacature ter controle: ${job.title} (${job.employer})`,
    `<p>${esc(u.name || u.email)} (${esc(u.email)}, ingelogd met Google) heeft een vacature ingediend.</p>
<p><b>${esc(job.title)}</b><br>${esc(job.employer)} &middot; ${esc(job.location)} &middot; sluit ${esc(job.deadline)}</p>
<p><a href="${esc(siteUrl(env))}/beheer#jobs">Openen in beheer</a></p>`));
  return json({ ok: true, id, status: "pending" });
}
async function jobAction(req, env, ctx, u, id) {
  const j = await ownedJob(env, u, id);
  const ct = req.headers.get("content-type") || "";
  let action, g, pdf = null, b = {};
  if (ct.startsWith("multipart/form-data")) {
    const r = await readJobForm(req); g = r.g; pdf = r.pdf; action = g("action");
  } else {
    b = await body(req); action = b.action; g = k => (b[k] == null ? "" : String(b[k]));
  }
  const today = todaySR(), now = nowIso();
  if (action === "close") {
    if (!["live", "pending", "unverified"].includes(j.status)) throw new HttpError(409, "state");
    await env.DB.prepare("UPDATE jobs SET status='closed', closed_at=? WHERE id=?").bind(now, id).run();
    await audit(env, u, "job_close", id, null);
  } else if (action === "extend") {
    const d = String(b.deadline || "");
    if (!["live", "pending"].includes(j.status)) throw new HttpError(409, "state");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d <= today || d > addDays(today, MAX_DAYS)) throw new HttpError(400, "invalid", "deadline");
    await env.DB.prepare("UPDATE jobs SET deadline=? WHERE id=?").bind(d, id).run();
    await audit(env, u, "job_extend", id, d);
  } else if (action === "update") {
    // any content change goes back to review; a live ad goes offline until approved again
    if (!["live", "pending", "rejected", "unverified"].includes(j.status)) throw new HttpError(409, "state");
    const job = validateJob(g, today);
    let pdfKey = j.pdf_key;
    if (pdf) pdfKey = await storePdf(env, id, pdf);
    else if (g("remove_pdf") === "yes" && j.pdf_key) { await env.FILES.delete(j.pdf_key); pdfKey = null; }
    await env.DB.prepare(`UPDATE jobs SET status='pending', lang=?, title=?, employer=?, employer_url=?, location=?, employment_type=?,
        description=?, salary_min=?, salary_max=?, salary_currency=?, salary_period=?, deadline=?, apply_email=?, apply_url=?,
        pdf_key=?, contact_name=?, contact_phone=?, reject_reason=NULL, approved_at=NULL WHERE id=?`).bind(
      job.lang, job.title, job.employer, job.employer_url, job.location, job.employment_type, job.description,
      job.salary_min, job.salary_max, job.salary_currency, job.salary_period, job.deadline, job.apply_email,
      job.apply_url, pdfKey, job.contact_name, job.contact_phone, id).run();
    await audit(env, u, "job_update", id, job.title);
    ctx.waitUntil(notifyAdmin(env, `Gewijzigde vacature ter controle: ${job.title}`,
      `<p>${esc(u.email)} heeft een vacature gewijzigd; hij wacht opnieuw op goedkeuring.</p>
<p><a href="${esc(siteUrl(env))}/beheer#jobs">Openen in beheer</a></p>`));
  } else if (action === "repost") {
    if (!["closed", "expired", "rejected"].includes(j.status)) throw new HttpError(409, "state");
    const nid = newJobId();
    const slug = (slugify(j.title + " " + j.employer) || "vacature") + "-" + nid;
    const dl = addDays(today, 30);
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO jobs (id,slug,status,lang,title,employer,employer_url,location,employment_type,description,
        salary_min,salary_max,salary_currency,salary_period,deadline,apply_email,apply_url,pdf_key,contact_name,contact_email,
        contact_phone,verify_hash,ip_hash,created_at,verified_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        nid, slug, "pending", j.lang, j.title, j.employer, j.employer_url, j.location, j.employment_type, j.description,
        j.salary_min, j.salary_max, j.salary_currency, j.salary_period, dl, j.apply_email, j.apply_url, null,
        j.contact_name, u.email, j.contact_phone, await sha256(token(16)), await ipHash(req, env), now, now),
      env.DB.prepare("INSERT INTO sb_job_owners (job_id,user_id,created_at) VALUES (?,?,?)").bind(nid, u.id, now),
    ]);
    await audit(env, u, "job_repost", nid, { from: id });
    ctx.waitUntil(notifyAdmin(env, `Vacature opnieuw ingediend: ${j.title}`,
      `<p>${esc(u.email)} heeft een vacature opnieuw ingediend.</p><p><a href="${esc(siteUrl(env))}/beheer#jobs">Openen in beheer</a></p>`));
    return json({ ok: true, id: nid, status: "pending", deadline: dl });
  } else if (action === "delete") {
    if (j.status === "live") throw new HttpError(409, "state");
    if (j.pdf_key) await env.FILES.delete(j.pdf_key);
    await env.DB.batch([env.DB.prepare("DELETE FROM jobs WHERE id=?").bind(id), env.DB.prepare("DELETE FROM sb_job_owners WHERE job_id=?").bind(id)]);
    await audit(env, u, "job_delete", id, j.title);
    return json({ ok: true, deleted: true });
  } else {
    throw new HttpError(400, "action");
  }
  // link jobs found through the contact address, so they stay in the account if the address changes
  await env.DB.prepare("INSERT OR IGNORE INTO sb_job_owners (job_id,user_id,created_at) VALUES (?,?,?)").bind(id, u.id, now).run();
  const nj = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  return json({ ok: true, job: jobOut(nj, true) });
}

// ------------------------------------------------------------------ mail (admin notifications only)
import { EmailMessage } from "cloudflare:email";
function b64utf8(s) {
  const bytes = enc.encode(s); let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
async function notifyAdmin(env, subject, html) {
  if (env.MAIL_LOG === "1") { console.log("MAIL admin", subject); return true; }
  if (!env.NOTIFY || !env.NOTIFY_TO) return false;
  const from = env.NOTIFY_FROM || "account@surinamebusiness.com";
  const wrapped = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#16182f;max-width:560px">
<div style="font-weight:700;font-size:17px;margin-bottom:14px;color:#1f2251">Suriname Business</div>${html}</div>`;
  const raw = [`From: Suriname Business <${from}>`, `To: ${env.NOTIFY_TO}`,
    `Subject: =?UTF-8?B?${b64utf8(subject)}?=`, `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${token(12)}@surinamebusiness.com>`, "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8", "Content-Transfer-Encoding: base64", "",
    b64utf8(wrapped).replace(/.{76}/g, "$&\r\n"), ""].join("\r\n");
  try { await env.NOTIFY.send(new EmailMessage(from, env.NOTIFY_TO, raw)); return true; }
  catch (e) { console.error("admin mail failed", e && e.message); return false; }
}

// ------------------------------------------------------------------ contact form
async function contact(req, env, ctx) {
  const b = await body(req);
  if (b.website2) return json({ ok: true });            // honeypot
  const u = await currentUser(req, env);
  const name = oneLine(b.name, 100), email = oneLine(b.email, 160).toLowerCase() || (u ? u.email : "");
  const subject = oneLine(b.subject, 150), text = clean(b.body, 5000), page = oneLine(b.page, 200);
  if (text.length < 10) throw new HttpError(400, "invalid", "body");
  if (!isEmail(email)) throw new HttpError(400, "invalid", "email");
  const ih = await ipHash(req, env);
  const since = new Date(Date.now() - 864e5).toISOString();
  const c = await env.DB.prepare("SELECT COUNT(*) n FROM sb_messages WHERE ip_hash=? AND created_at>?").bind(ih, since).first();
  if (c && c.n >= (u ? 20 : 5)) throw new HttpError(429, "rate");
  const id = rid(12);
  await env.DB.prepare("INSERT INTO sb_messages (id,name,email,subject,body,page,user_id,ip_hash,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .bind(id, name, email, subject, text, page, u ? u.id : null, ih, "new", nowIso()).run();
  ctx.waitUntil(notifyAdmin(env, "Nieuw bericht: " + (subject || name || email),
    `<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;${u ? " (ingelogd)" : ""}</p><p style="white-space:pre-wrap">${esc(text)}</p>
<p><a href="${esc(siteUrl(env))}/beheer#messages">Openen in beheer</a></p>`));
  return json({ ok: true });
}

// ------------------------------------------------------------------ business directory: add or correct a listing
// Public form on /bedrijf-aanmelden. Stored as sb_content kind "company", status "draft" until an admin checks it
// and sets it live in the admin panel; the site then shows it in the directory on the next build.
async function submitListing(req, env, ctx) {
  const b = await body(req);
  if (b.website2) return json({ ok: true });            // honeypot
  const u = await currentUser(req, env);
  const name = oneLine(b.name, 120);
  const group = CO_GROUPS.includes(b.group) ? b.group : "";
  const d = {
    group, kind: oneLine(b.kind, 60), street: oneLine(b.street, 120), place: oneLine(b.place, 60),
    phone: oneLine(b.phone, 40), whatsapp: oneLine(b.whatsapp, 40), email: oneLine(b.email, 160).toLowerCase(),
    hours: oneLine(b.hours, 200), replaces: /^[a-z0-9-]{2,90}$/.test(b.replaces || "") ? b.replaces : "",
    by_name: oneLine(b.by_name, 100), by_email: (oneLine(b.by_email, 160) || (u ? u.email : "")).toLowerCase(),
    by_role: oneLine(b.by_role, 60), pending: true,
  };
  const website = oneLine(b.website, 300);
  const about = clean(b.about, 600);
  if (name.length < 2) throw new HttpError(400, "invalid", "name");
  // a new listing needs a category, a place and one way to reach the business; a correction only what changes
  if (!d.replaces) {
    if (!group) throw new HttpError(400, "invalid", "group");
    if (!d.place) throw new HttpError(400, "invalid", "place");
    if (!d.phone && !d.email && !d.whatsapp && !website) throw new HttpError(400, "invalid", "phone");
  }
  if (d.email && !isEmail(d.email)) throw new HttpError(400, "invalid", "email");
  if (website && !isUrl(website)) throw new HttpError(400, "invalid", "website");
  if (!isEmail(d.by_email)) throw new HttpError(400, "invalid", "by_email");
  if (b.consent !== true) throw new HttpError(400, "invalid", "consent");
  const ih = await ipHash(req, env);
  d.ih = ih.slice(0, 16);
  const since = new Date(Date.now() - 864e5).toISOString();
  const mine = await env.DB.prepare("SELECT COUNT(*) n FROM sb_content WHERE kind='company' AND created_at>? AND data LIKE ?")
    .bind(since, '%"ih":"' + d.ih + '"%').first();
  if (mine && mine.n >= (u ? 10 : 3)) throw new HttpError(429, "rate");
  const all = await env.DB.prepare("SELECT COUNT(*) n FROM sb_content WHERE kind='company' AND status='draft' AND created_at>?").bind(since).first();
  if (all && all.n >= 60) throw new HttpError(429, "rate");
  const id = rid(12), now = nowIso();
  await env.DB.prepare(`INSERT INTO sb_content (id,kind,status,lang,title,title_en,body,body_en,url,source,starts,ends,sort,data,created_at,updated_at,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id, "company", "draft", "all", name, null, about || null, null, website || null,
    null, null, null, 0, JSON.stringify(d), now, now, u ? u.id : null).run();
  ctx.waitUntil(notifyAdmin(env, (d.replaces ? "Bedrijfsgegevens bijgewerkt: " : "Nieuw bedrijf aangemeld: ") + name,
    `<p><b>${esc(name)}</b>${d.kind ? " (" + esc(d.kind) + ")" : ""}<br>${esc(d.street)}${d.street ? ", " : ""}${esc(d.place)}</p>
<p>Tel: ${esc(d.phone || "-")} &middot; WhatsApp: ${esc(d.whatsapp || "-")} &middot; ${esc(d.email || "")} ${website ? "&middot; " + esc(website) : ""}</p>
${about ? `<p style="white-space:pre-wrap">${esc(about)}</p>` : ""}
<p>Aangemeld door ${esc(d.by_name || "")} &lt;${esc(d.by_email)}&gt;${d.by_role ? ", " + esc(d.by_role) : ""}${u ? " (ingelogd)" : ""}${d.replaces ? "<br>Werkt bij: /bedrijf/" + esc(d.replaces) : ""}</p>
<p><a href="${esc(siteUrl(env))}/beheer#content">Controleren in beheer</a></p>`));
  return json({ ok: true });
}

// ------------------------------------------------------------------ settings and content
async function getSettings(env) {
  const { results } = await env.DB.prepare("SELECT k,v FROM sb_settings").all();
  const out = { ...SETTINGS };
  for (const r of results) {
    if (!(r.k in SETTINGS)) continue;
    try { out[r.k] = JSON.parse(r.v); } catch (e) { /* ignore broken value */ }
  }
  return out;
}
async function putSettings(req, env, u) {
  const b = await body(req);
  const stmts = [], changed = {};
  for (const [k, def] of Object.entries(SETTINGS)) {
    if (!(k in (b.settings || {}))) continue;
    let v = b.settings[k];
    if (typeof def === "boolean") v = v === true || v === "true";
    else v = clean(String(v == null ? "" : v), 2000);
    stmts.push(env.DB.prepare("INSERT INTO sb_settings (k,v,updated_at) VALUES (?,?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v, updated_at=excluded.updated_at")
      .bind(k, JSON.stringify(v), nowIso()));
    changed[k] = v;
  }
  if (stmts.length) await env.DB.batch(stmts);
  await audit(env, u, "settings", null, changed);
  return json({ ok: true, settings: await getSettings(env) });
}
async function publicContent(env) {
  const today = todaySR();
  const { results } = await env.DB.prepare(`SELECT id,kind,lang,title,title_en,body,body_en,url,source,starts,ends,sort,data,created_at,updated_at
      FROM sb_content WHERE status='live' AND (starts IS NULL OR starts='' OR starts<=?) AND (ends IS NULL OR ends='' OR ends>=?)
      ORDER BY sort DESC, created_at DESC LIMIT 500`).bind(today, today).all();
  const items = results.map(r => {
    let d = {}; try { d = r.data ? JSON.parse(r.data) : {}; } catch (e) { /* ignore */ }
    if (r.kind === "company") { delete d.ih; delete d.by_name; delete d.by_email; delete d.by_role; delete d.pending; }
    return { ...r, data: d };
  });
  return new Response(JSON.stringify({ ok: true, generated_at: nowIso(), settings: await getSettings(env), items }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" } });
}
async function adminContent(env) {
  const { results } = await env.DB.prepare("SELECT * FROM sb_content ORDER BY kind, sort DESC, created_at DESC LIMIT 1000").all();
  return json({ ok: true, items: results.map(r => { let d = {}; try { d = r.data ? JSON.parse(r.data) : {}; } catch (e) { /* ignore */ } return { ...r, data: d }; }), kinds: CONTENT_KINDS });
}
async function saveContent(req, env, u) {
  const b = await body(req);
  const kind = String(b.kind || "");
  if (!CONTENT_KINDS.includes(kind)) throw new HttpError(400, "invalid", "kind");
  const c = {
    status: b.status === "draft" ? "draft" : "live",
    lang: ["all", "nl", "en"].includes(b.lang) ? b.lang : "all",
    title: oneLine(b.title, 300), title_en: oneLine(b.title_en, 300) || null,
    body: clean(b.body, 20000) || null, body_en: clean(b.body_en, 20000) || null,
    url: oneLine(b.url, 600) || null, source: oneLine(b.source, 120) || null,
    starts: /^\d{4}-\d{2}-\d{2}$/.test(b.starts || "") ? b.starts : null,
    ends: /^\d{4}-\d{2}-\d{2}$/.test(b.ends || "") ? b.ends : null,
    sort: Math.max(-1000, Math.min(1000, parseInt(b.sort, 10) || 0)),
    data: JSON.stringify(b.data && typeof b.data === "object" ? b.data : {}).slice(0, 20000),
  };
  if (c.title.length < 2) throw new HttpError(400, "invalid", "title");
  if (c.url && !isUrl(c.url) && !/^\/[^\s]*$/.test(c.url)) throw new HttpError(400, "invalid", "url");
  const now = nowIso();
  let id = /^[a-z0-9]{12}$/.test(b.id || "") ? b.id : null;
  if (id) {
    const r = await env.DB.prepare(`UPDATE sb_content SET kind=?,status=?,lang=?,title=?,title_en=?,body=?,body_en=?,url=?,source=?,starts=?,ends=?,sort=?,data=?,updated_at=? WHERE id=?`)
      .bind(kind, c.status, c.lang, c.title, c.title_en, c.body, c.body_en, c.url, c.source, c.starts, c.ends, c.sort, c.data, now, id).run();
    if (!r.meta.changes) throw new HttpError(404, "not_found");
  } else {
    id = rid(12);
    await env.DB.prepare(`INSERT INTO sb_content (id,kind,status,lang,title,title_en,body,body_en,url,source,starts,ends,sort,data,created_at,updated_at,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id, kind, c.status, c.lang, c.title, c.title_en, c.body, c.body_en, c.url,
      c.source, c.starts, c.ends, c.sort, c.data, now, now, u.id).run();
  }
  await audit(env, u, "content_save", id, { kind, title: c.title });
  return json({ ok: true, id });
}
async function deleteContent(env, u, id) {
  const r = await env.DB.prepare("DELETE FROM sb_content WHERE id=?").bind(id).run();
  await audit(env, u, "content_delete", id, null);
  return json({ ok: true, deleted: r.meta.changes });
}

// ------------------------------------------------------------------ admin: overview
async function adminStats(env) {
  const d = n => new Date(Date.now() - n * 864e5).toISOString();
  const q = (sql, ...a) => env.DB.prepare(sql).bind(...a).first();
  const [users, u7, u30, act7, admins, blocked, jobsBy, msgNew, dataTot, owners] = await Promise.all([
    q("SELECT COUNT(*) n FROM sb_users"), q("SELECT COUNT(*) n FROM sb_users WHERE created_at>?", d(7)),
    q("SELECT COUNT(*) n FROM sb_users WHERE created_at>?", d(30)), q("SELECT COUNT(*) n FROM sb_users WHERE last_login_at>?", d(7)),
    q("SELECT COUNT(*) n FROM sb_users WHERE role='admin'"), q("SELECT COUNT(*) n FROM sb_users WHERE status='blocked'"),
    env.DB.prepare("SELECT status, COUNT(*) n FROM jobs GROUP BY status").all(),
    q("SELECT COUNT(*) n FROM sb_messages WHERE status='new'"),
    q("SELECT COALESCE(SUM(size),0) bytes, COUNT(*) n FROM sb_user_data WHERE v IS NOT NULL"),
    q("SELECT COUNT(DISTINCT user_id) n FROM sb_job_owners"),
  ]);
  const series = (await env.DB.prepare("SELECT substr(created_at,1,10) day, COUNT(*) n FROM sb_users WHERE created_at>? GROUP BY day ORDER BY day")
    .bind(d(30)).all()).results;
  const jseries = (await env.DB.prepare("SELECT substr(created_at,1,10) day, COUNT(*) n FROM jobs WHERE created_at>? GROUP BY day ORDER BY day")
    .bind(d(30)).all()).results;
  const jobs = {}; for (const r of jobsBy.results) jobs[r.status] = r.n;
  return json({ ok: true, users: { total: users.n, new7: u7.n, new30: u30.n, active7: act7.n, admins: admins.n, blocked: blocked.n, employers: owners.n },
    jobs, messages_new: msgNew.n, data: dataTot, signups: series, job_series: jseries, today: todaySR() });
}

// ------------------------------------------------------------------ admin: vacancies
async function adminJobs(url, env) {
  const st = url.searchParams.get("status") || "";
  const qs = oneLine(url.searchParams.get("q") || "", 80).toLowerCase();
  let sql = "SELECT j.*, o.user_id owner FROM jobs j LEFT JOIN sb_job_owners o ON o.job_id=j.id";
  const where = [], args = [];
  if (["unverified", "pending", "live", "rejected", "closed", "expired"].includes(st)) { where.push("j.status=?"); args.push(st); }
  if (qs) { where.push("(lower(j.title) LIKE ? OR lower(j.employer) LIKE ? OR lower(j.contact_email) LIKE ?)"); args.push(`%${qs}%`, `%${qs}%`, `%${qs}%`); }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY CASE j.status WHEN 'pending' THEN 0 WHEN 'unverified' THEN 1 WHEN 'live' THEN 2 ELSE 3 END, j.created_at DESC LIMIT 300";
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ ok: true, jobs: results.map(j => ({ ...jobOut(j, true), owner: j.owner, url: siteJobUrl(env, j) })), today: todaySR(), max_days: MAX_DAYS });
}
async function adminJobPdf(env, id) {
  const j = await env.DB.prepare("SELECT pdf_key FROM jobs WHERE id=?").bind(id).first();
  if (!j || !j.pdf_key) throw new HttpError(404, "not_found");
  const o = await env.FILES.get(j.pdf_key, { type: "stream" });
  if (!o) throw new HttpError(404, "not_found");
  return new Response(o, { headers: { "content-type": "application/pdf", "content-security-policy": "sandbox", "cache-control": "no-store" } });
}
async function adminJobAction(req, env, ctx, u, id) {
  const j = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  if (!j) throw new HttpError(404, "not_found");
  const ct = req.headers.get("content-type") || "";
  let b = {}, g, pdf = null;
  if (ct.startsWith("multipart/form-data")) { const r = await readJobForm(req); g = r.g; pdf = r.pdf; b.action = g("action"); }
  else { b = await body(req); g = k => (b[k] == null ? "" : String(b[k])); }
  const now = nowIso(), today = todaySR();
  switch (b.action) {
    case "approve":
      if (!["pending", "unverified", "rejected", "closed"].includes(j.status)) throw new HttpError(409, "state");
      if (j.deadline < today) throw new HttpError(409, "deadline_passed");
      await env.DB.prepare("UPDATE jobs SET status='live', approved_at=?, reject_reason=NULL, closed_at=NULL WHERE id=?").bind(now, id).run();
      break;
    case "reject":
      if (!["pending", "unverified", "live"].includes(j.status)) throw new HttpError(409, "state");
      await env.DB.prepare("UPDATE jobs SET status='rejected', reject_reason=?, closed_at=? WHERE id=?").bind(oneLine(b.reason, 400), now, id).run();
      break;
    case "takedown":
      if (j.status !== "live") throw new HttpError(409, "state");
      await env.DB.prepare("UPDATE jobs SET status='closed', closed_at=? WHERE id=?").bind(now, id).run();
      break;
    case "extend": {
      const d = String(b.deadline || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d < today || d > addDays(today, 120)) throw new HttpError(400, "invalid", "deadline");
      await env.DB.prepare("UPDATE jobs SET deadline=?, status=CASE WHEN status='expired' THEN 'live' ELSE status END, closed_at=CASE WHEN status='expired' THEN NULL ELSE closed_at END WHERE id=?").bind(d, id).run();
      break;
    }
    case "update": {
      // admin edits keep the current status (no re-review needed); deadline window is wider for admins
      const job = validateJob(k => k === "deadline" && g(k) && g(k) <= addDays(today, 120) && g(k) > today ? addDays(today, 1) : g(k), today);
      job.deadline = /^\d{4}-\d{2}-\d{2}$/.test(g("deadline")) ? g("deadline") : j.deadline;
      let pdfKey = j.pdf_key;
      if (pdf) pdfKey = await storePdf(env, id, pdf);
      else if (g("remove_pdf") === "yes" && j.pdf_key) { await env.FILES.delete(j.pdf_key); pdfKey = null; }
      await env.DB.prepare(`UPDATE jobs SET lang=?, title=?, employer=?, employer_url=?, location=?, employment_type=?, description=?,
          salary_min=?, salary_max=?, salary_currency=?, salary_period=?, deadline=?, apply_email=?, apply_url=?, pdf_key=?,
          contact_name=?, contact_phone=? WHERE id=?`).bind(job.lang, job.title, job.employer, job.employer_url, job.location,
        job.employment_type, job.description, job.salary_min, job.salary_max, job.salary_currency, job.salary_period, job.deadline,
        job.apply_email, job.apply_url, pdfKey, job.contact_name, job.contact_phone, id).run();
      break;
    }
    case "delete":
      if (j.pdf_key) await env.FILES.delete(j.pdf_key);
      await env.DB.batch([env.DB.prepare("DELETE FROM jobs WHERE id=?").bind(id), env.DB.prepare("DELETE FROM sb_job_owners WHERE job_id=?").bind(id)]);
      await audit(env, u, "admin_job_delete", id, j.title);
      return json({ ok: true, deleted: true });
    default:
      throw new HttpError(400, "action");
  }
  await audit(env, u, "admin_job_" + b.action, id, b.reason || b.deadline || j.title);
  const nj = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  return json({ ok: true, job: { ...jobOut(nj, true), url: siteJobUrl(env, nj) } });
}

// ------------------------------------------------------------------ admin: users
async function adminUsers(url, env) {
  const qs = oneLine(url.searchParams.get("q") || "", 80).toLowerCase();
  const args = [];
  let sql = `SELECT u.*, (SELECT COUNT(*) FROM sb_user_data d WHERE d.user_id=u.id AND d.v IS NOT NULL) items,
      (SELECT COALESCE(SUM(size),0) FROM sb_user_data d WHERE d.user_id=u.id) bytes,
      (SELECT COUNT(*) FROM sb_job_owners o WHERE o.user_id=u.id) jobs FROM sb_users u`;
  if (qs) { sql += " WHERE lower(u.email) LIKE ? OR lower(u.name) LIKE ? OR lower(COALESCE(u.company,'')) LIKE ?"; args.push(`%${qs}%`, `%${qs}%`, `%${qs}%`); }
  sql += " ORDER BY u.created_at DESC LIMIT 500";
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ ok: true, users: results.map(u => ({ ...publicUser(u), status: u.status, last_login_at: u.last_login_at,
    login_count: u.login_count, note: u.note, items: u.items, bytes: u.bytes, jobs: u.jobs })) });
}
async function adminUser(env, id) {
  const u = await env.DB.prepare("SELECT * FROM sb_users WHERE id=?").bind(id).first();
  if (!u) throw new HttpError(404, "not_found");
  const data = (await env.DB.prepare("SELECT k,u,size FROM sb_user_data WHERE user_id=? AND v IS NOT NULL ORDER BY k").bind(id).all()).results;
  const jobs = (await ownedJobs(env, u)).map(j => jobOut(j, false));
  const log = (await env.DB.prepare("SELECT at,action,target,detail FROM sb_audit WHERE user_id=? ORDER BY id DESC LIMIT 50").bind(id).all()).results;
  return json({ ok: true, user: { ...publicUser(u), status: u.status, last_login_at: u.last_login_at, login_count: u.login_count, note: u.note },
    data, jobs, log });
}
async function adminUserAction(req, env, me, id) {
  const b = await body(req);
  const u = await env.DB.prepare("SELECT * FROM sb_users WHERE id=?").bind(id).first();
  if (!u) throw new HttpError(404, "not_found");
  const selfOrOwner = u.id === me.id || adminEmails(env).includes(u.email);
  switch (b.action) {
    case "block":
      if (selfOrOwner) throw new HttpError(409, "protected");
      await env.DB.batch([env.DB.prepare("UPDATE sb_users SET status='blocked' WHERE id=?").bind(id),
        env.DB.prepare("DELETE FROM sb_sessions WHERE user_id=?").bind(id)]);
      break;
    case "unblock": await env.DB.prepare("UPDATE sb_users SET status='active' WHERE id=?").bind(id).run(); break;
    case "make_admin": await env.DB.prepare("UPDATE sb_users SET role='admin' WHERE id=?").bind(id).run(); break;
    case "remove_admin":
      if (selfOrOwner) throw new HttpError(409, "protected");
      await env.DB.prepare("UPDATE sb_users SET role='user' WHERE id=?").bind(id).run(); break;
    case "logout": await env.DB.prepare("DELETE FROM sb_sessions WHERE user_id=?").bind(id).run(); break;
    case "note": await env.DB.prepare("UPDATE sb_users SET note=? WHERE id=?").bind(oneLine(b.note, 500), id).run(); break;
    case "delete":
      if (selfOrOwner) throw new HttpError(409, "protected");
      await env.DB.batch([
        env.DB.prepare("DELETE FROM sb_user_data WHERE user_id=?").bind(id), env.DB.prepare("DELETE FROM sb_sessions WHERE user_id=?").bind(id),
        env.DB.prepare("DELETE FROM sb_job_owners WHERE user_id=?").bind(id), env.DB.prepare("DELETE FROM sb_users WHERE id=?").bind(id)]);
      break;
    default: throw new HttpError(400, "action");
  }
  await audit(env, me, "admin_user_" + b.action, id, u.email);
  return json({ ok: true });
}

// ------------------------------------------------------------------ admin: messages and log
async function adminMessages(url, env) {
  const st = url.searchParams.get("status");
  const { results } = st && ["new", "done", "spam"].includes(st)
    ? await env.DB.prepare("SELECT * FROM sb_messages WHERE status=? ORDER BY created_at DESC LIMIT 300").bind(st).all()
    : await env.DB.prepare("SELECT * FROM sb_messages ORDER BY created_at DESC LIMIT 300").all();
  return json({ ok: true, messages: results.map(m => ({ ...m, ip_hash: undefined })) });
}
async function messageAction(req, env, u, id) {
  const b = await body(req);
  if (b.action === "delete") await env.DB.prepare("DELETE FROM sb_messages WHERE id=?").bind(id).run();
  else if (["new", "done", "spam"].includes(b.action)) await env.DB.prepare("UPDATE sb_messages SET status=? WHERE id=?").bind(b.action, id).run();
  else if (b.action === "note") await env.DB.prepare("UPDATE sb_messages SET note=? WHERE id=?").bind(oneLine(b.note, 1000), id).run();
  else throw new HttpError(400, "action");
  await audit(env, u, "message_" + b.action, id, null);
  return json({ ok: true });
}
async function adminAudit(env) {
  const { results } = await env.DB.prepare("SELECT * FROM sb_audit ORDER BY id DESC LIMIT 300").all();
  return json({ ok: true, log: results });
}
