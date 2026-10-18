// sb-jobs: vacancy board backend for surinamebusiness.com
// Employers submit a vacancy, confirm their email, an admin approves, and the static site
// pulls approved vacancies from /api/jobs/public on every build (every 30 minutes).
// Candidates apply directly with the employer: this service never receives CVs.

const TYPES = ["FULL_TIME", "PART_TIME", "TEMPORARY", "CONTRACTOR", "INTERN"];
const LOCATIONS = ["Paramaribo", "Wanica", "Nickerie", "Coronie", "Saramacca", "Commewijne", "Marowijne",
  "Para", "Brokopondo", "Sipaliwini", "Remote"];
const CURRENCIES = ["SRD", "USD", "EUR"];
const PERIODS = ["MONTH", "HOUR", "YEAR"];
const MAX_PDF = 3 * 1024 * 1024;
const MAX_DAYS = 60;
const PER_IP_DAY = 5;
const PER_EMAIL_DAY = 3;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname.replace(/\/+$/, "") || "/";
    try {
      if (req.method === "OPTIONS") return cors(req, env, new Response(null, { status: 204 }));
      if (p === "/api/health") return json({ ok: true });
      if (p === "/api/jobs" && req.method === "POST") return cors(req, env, await submit(req, env, ctx));
      if (p === "/api/jobs/public" && req.method === "GET") return cors(req, env, await publicJobs(env));
      let m = p.match(/^\/api\/file\/([a-z0-9]{8})\.pdf$/);
      if (m && req.method === "GET") return await file(env, m[1]);
      if (p === "/api/verify") return req.method === "POST" ? await verifyPost(req, env, ctx) : await verifyGet(url, env);
      if (p === "/api/review") return req.method === "POST" ? await reviewPost(req, env, ctx) : await reviewGet(url, env);
      if (p === "/api/manage") return req.method === "POST" ? await managePost(req, env, ctx) : await manageGet(url, env);
      if (p === "/api/admin" && req.method === "GET") return await admin(url, env);
      return json({ ok: false, error: "not_found" }, 404);
    } catch (e) {
      console.error("sb-jobs error", e && e.stack || e);
      return json({ ok: false, error: "server" }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(housekeeping(env));
  },
};

// ------------------------------------------------------------------ helpers
const enc = new TextEncoder();
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function cors(req, env, res) {
  const origin = req.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const h = new Headers(res.headers);
  if (ok) { h.set("access-control-allow-origin", origin); h.set("vary", "origin"); }
  h.set("access-control-allow-methods", "GET,POST,OPTIONS");
  h.set("access-control-allow-headers", "content-type");
  return new Response(res.body, { status: res.status, headers: h });
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function hex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""); }
async function sha256(s) { return hex(await crypto.subtle.digest("SHA-256", enc.encode(s))); }
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
function safeEq(a, b) {
  a = String(a || ""); b = String(b || "");
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function token(n = 24) { const b = new Uint8Array(n); crypto.getRandomValues(b); return hex(b); }
function newId() {
  const a = "abcdefghijkmnpqrstuvwxyz23456789", b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return [...b].map(x => a[x % a.length]).join("");
}
function slugify(s) {
  return String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/&/g, " en ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70).replace(/-+$/, "");
}
function nowIso() { return new Date().toISOString().replace(/\.\d+Z$/, "Z"); }
function todaySR() { return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); }
function addDays(d, n) { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
function clean(s, max) {
  // strip control characters except newline and tab, normalise line endings
  return String(s == null ? "" : s).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}
function oneLine(s, max) { return clean(s, max * 2).replace(/\s+/g, " ").trim().slice(0, max); }
function isEmail(s) { return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i.test(s) && s.length <= 160; }
function isUrl(s) {
  try { const u = new URL(s); return (u.protocol === "https:" || u.protocol === "http:") && s.length <= 500 && u.hostname.includes("."); }
  catch { return false; }
}
function siteJobUrl(env, j) {
  return (env.SITE_URL || "https://surinamebusiness.com") + (j.lang === "en" ? "/en/job/" : "/vacature/") + j.slug;
}
function apiBase(req, env) { return env.API_URL || new URL(req.url).origin; }
function t(lang, nl, en) { return lang === "en" ? en : nl; }

// ------------------------------------------------------------------ mail
import { EmailMessage } from "cloudflare:email";

// Admin notifications go out through Cloudflare Email Routing (free; only to the verified
// destination set on the NOTIFY binding). Mail to employers needs RESEND_API_KEY.
function b64utf8(s) {
  const bytes = enc.encode(s); let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
async function notifyMail(env, subject, html) {
  if (env.MAIL_LOG === "1") { console.log("MAIL admin", subject, html); return true; }
  if (env.RESEND_API_KEY && env.ADMIN_EMAIL) return sendMail(env, env.ADMIN_EMAIL, subject, html);
  if (!env.NOTIFY || !env.NOTIFY_TO) { console.log("admin mail skipped (no NOTIFY binding)", subject); return false; }
  const from = env.NOTIFY_FROM || "vacatures@surinamebusiness.com";
  const raw = [
    `From: Suriname Business <${from}>`, `To: ${env.NOTIFY_TO}`,
    `Subject: =?UTF-8?B?${b64utf8(subject)}?=`, `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${token(12)}@surinamebusiness.com>`, "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8", "Content-Transfer-Encoding: base64", "",
    b64utf8(html).replace(/.{76}/g, "$&\r\n"), ""].join("\r\n");
  try { await env.NOTIFY.send(new EmailMessage(from, env.NOTIFY_TO, raw)); return true; }
  catch (e) { console.error("admin mail failed", e && e.message); return false; }
}
async function sendMail(env, to, subject, html) {
  if (env.MAIL_LOG === "1") { console.log("MAIL", to, subject, html); return true; } // local testing only
  if (!env.RESEND_API_KEY) { console.log("mail skipped (no RESEND_API_KEY):", to, subject); return false; }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, html,
      reply_to: env.ADMIN_EMAIL || undefined }),
  });
  if (!r.ok) console.error("mail failed", r.status, await r.text());
  return r.ok;
}
function mailWrap(body) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#16182f;max-width:560px">
<div style="font-weight:700;font-size:17px;margin-bottom:14px;color:#1f2251">Suriname Business</div>${body}
<p style="color:#646a85;font-size:12px;margin-top:24px">surinamebusiness.com</p></div>`;
}
function btn(href, label) {
  return `<p><a href="${esc(href)}" style="display:inline-block;background:#e4572e;color:#fff;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:700">${esc(label)}</a></p>`;
}

// rebuild the static site right away (optional; needs GH_TOKEN + GH_REPO)
async function rebuild(env) {
  if (!env.GH_TOKEN || !env.GH_REPO) return;
  const r = await fetch(`https://api.github.com/repos/${env.GH_REPO}/actions/workflows/site.yml/dispatches`, {
    method: "POST",
    headers: { authorization: "Bearer " + env.GH_TOKEN, accept: "application/vnd.github+json",
      "user-agent": "sb-jobs", "content-type": "application/json" },
    body: JSON.stringify({ ref: "main" }),
  });
  if (!r.ok) console.error("rebuild dispatch failed", r.status, await r.text());
}

// ------------------------------------------------------------------ submit
async function submit(req, env, ctx) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data") && !ct.includes("application/x-www-form-urlencoded"))
    return json({ ok: false, error: "bad_request" }, 400);
  const f = await req.formData();
  const g = k => (f.get(k) == null || typeof f.get(k) !== "string") ? "" : f.get(k);
  if (g("website2")) return json({ ok: true, needs_verify: true }); // honeypot: pretend success

  const ip = req.headers.get("cf-connecting-ip") || "0.0.0.0";
  // Turnstile
  const ts = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: new URLSearchParams({ secret: env.TURNSTILE_SECRET || "", response: g("cf-turnstile-response"), remoteip: ip }),
  }).then(r => r.json()).catch(() => ({ success: false }));
  if (!ts.success) return json({ ok: false, error: "captcha" }, 400);

  const lang = g("lang") === "en" ? "en" : "nl";
  const job = {
    lang,
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
    contact_email: oneLine(g("contact_email"), 160).toLowerCase(),
    contact_phone: oneLine(g("contact_phone"), 40) || null,
  };
  const bad = field => json({ ok: false, error: "invalid", field }, 400);
  if (job.title.length < 3) return bad("title");
  if (job.employer.length < 2) return bad("employer");
  if (job.employer_url && !isUrl(job.employer_url)) return bad("employer_url");
  if (!LOCATIONS.includes(job.location)) return bad("location");
  if (!TYPES.includes(job.employment_type)) return bad("employment_type");
  if (job.description.length < 150) return bad("description");
  const today = todaySR();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(job.deadline) || job.deadline <= today || job.deadline > addDays(today, MAX_DAYS)) return bad("deadline");
  if (!job.apply_email && !job.apply_url) return bad("apply");
  if (job.apply_email && !isEmail(job.apply_email)) return bad("apply_email");
  if (job.apply_url && !isUrl(job.apply_url)) return bad("apply_url");
  if (job.contact_name.length < 2) return bad("contact_name");
  if (!isEmail(job.contact_email)) return bad("contact_email");
  for (const k of ["salary_min", "salary_max"]) {
    if (job[k] != null && !(isFinite(job[k]) && job[k] > 0 && job[k] < 1e8)) return bad(k);
  }
  if (job.salary_min || job.salary_max) {
    if (!CURRENCIES.includes(job.salary_currency)) return bad("salary_currency");
    if (!PERIODS.includes(job.salary_period)) return bad("salary_period");
    if (job.salary_min && job.salary_max && job.salary_max < job.salary_min) return bad("salary_max");
  } else { job.salary_currency = null; job.salary_period = null; }
  if (g("rules") !== "yes") return bad("rules");

  // rate limits
  const ipHash = await sha256((env.ADMIN_SECRET || "") + "|ip|" + ip);
  const since = new Date(Date.now() - 864e5).toISOString();
  const c1 = await env.DB.prepare("SELECT COUNT(*) n FROM jobs WHERE ip_hash=? AND created_at>?").bind(ipHash, since).first();
  const c2 = await env.DB.prepare("SELECT COUNT(*) n FROM jobs WHERE contact_email=? AND created_at>?").bind(job.contact_email, since).first();
  if ((c1 && c1.n >= PER_IP_DAY) || (c2 && c2.n >= PER_EMAIL_DAY)) return json({ ok: false, error: "rate" }, 429);

  // PDF (optional)
  const id = newId();
  let pdfKey = null;
  const pdf = f.get("pdf");
  if (pdf && typeof pdf === "object" && pdf.size > 0) {
    if (pdf.size > MAX_PDF) return bad("pdf");
    const buf = await pdf.arrayBuffer();
    const head = new TextDecoder().decode(buf.slice(0, 5));
    if (head !== "%PDF-") return bad("pdf");
    pdfKey = `jobs/${id}.pdf`;
    await env.FILES.put(pdfKey, buf);
  }

  const mailOn = !!env.RESEND_API_KEY || env.MAIL_LOG === "1";
  const vtok = token();
  const slug = (slugify(job.title + " " + job.employer) || "vacature") + "-" + id;
  await env.DB.prepare(`INSERT INTO jobs (id,slug,status,lang,title,employer,employer_url,location,employment_type,description,
      salary_min,salary_max,salary_currency,salary_period,deadline,apply_email,apply_url,pdf_key,contact_name,contact_email,
      contact_phone,verify_hash,ip_hash,created_at,verified_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    id, slug, mailOn ? "unverified" : "pending", job.lang, job.title, job.employer, job.employer_url, job.location,
    job.employment_type, job.description, job.salary_min, job.salary_max, job.salary_currency, job.salary_period,
    job.deadline, job.apply_email, job.apply_url, pdfKey, job.contact_name, job.contact_email, job.contact_phone,
    await sha256(vtok), ipHash, nowIso(), null).run();

  const base = apiBase(req, env);
  if (mailOn) {
    const link = `${base}/api/verify?id=${id}&t=${vtok}`;
    const L = job.lang;
    ctx.waitUntil(sendMail(env, job.contact_email,
      t(L, "Bevestig je vacature: ", "Confirm your vacancy: ") + job.title,
      mailWrap(`<p>${esc(t(L, "Beste", "Hi"))} ${esc(job.contact_name)},</p>
<p>${esc(t(L, "Bevestig je e-mailadres om je vacature in te dienen:", "Confirm your email address to submit your vacancy:"))} <b>${esc(job.title)}</b> (${esc(job.employer)}).</p>
${btn(link, t(L, "Vacature bevestigen", "Confirm vacancy"))}
<p>${esc(t(L, "Daarna controleren we de vacature, meestal binnen één werkdag. Je krijgt een e-mail zodra hij online staat.",
        "We then review the vacancy, usually within one working day. You get an email as soon as it is live."))}</p>
<p style="color:#646a85;font-size:13px">${esc(t(L, "Heb je dit niet aangevraagd? Negeer deze e-mail; zonder bevestiging wordt niets geplaatst.",
        "Didn't request this? Ignore this email; nothing is published without confirmation."))}</p>`)));
  } else {
    ctx.waitUntil(notifyAdmin(env, base, id));
  }
  // without employer email, hand the manage link over right away so the employer can close the ad later
  const manage_url = mailOn ? undefined : `${base}/api/manage?id=${id}&sig=${await manageSig(env, id)}`;
  return json({ ok: true, id, needs_verify: mailOn, manage_url });
}

// manage links are HMAC-derived so they can be (re)sent at any time without storing the token
async function manageSig(env, id) { return (await hmac(env.ADMIN_SECRET || "", "manage:" + id)).slice(0, 40); }
async function reviewSig(env, id) { return (await hmac(env.ADMIN_SECRET || "", "review:" + id)).slice(0, 40); }
async function adminSig(env) { return (await hmac(env.ADMIN_SECRET || "", "admin")).slice(0, 40); }

async function notifyAdmin(env, base, id) {
  const j = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  if (!j) return;
  const link = `${base}/api/review?id=${id}&sig=${await reviewSig(env, id)}`;
  await notifyMail(env, `Nieuwe vacature ter controle: ${j.title} (${j.employer})`,
    mailWrap(`<p>Nieuwe vacature wacht op goedkeuring.</p>
<p><b>${esc(j.title)}</b><br>${esc(j.employer)} &middot; ${esc(j.location)} &middot; sluit ${esc(j.deadline)}<br>
Contact: ${esc(j.contact_name)}, ${esc(j.contact_email)}${j.contact_phone ? ", " + esc(j.contact_phone) : ""}<br>
E-mailadres werkgever ${j.verified_at ? "bevestigd" : "<b>niet</b> bevestigd (e-mailverificatie staat uit)"}</p>
${btn(link, "Bekijken en goedkeuren")}
<p><a href="${esc(base)}/api/admin?sig=${await adminSig(env)}">Alle vacatures in de wachtrij</a></p>`));
}

// ------------------------------------------------------------------ public
async function publicJobs(env) {
  const today = todaySR();
  const { results } = await env.DB.prepare(
    "SELECT * FROM jobs WHERE status='live' AND deadline>=? ORDER BY approved_at DESC LIMIT 500").bind(today).all();
  const items = results.map(j => ({
    id: "sb-" + j.id, sbid: j.id, slug: j.slug, lang: j.lang, title: j.title, employer: j.employer,
    employer_url: j.employer_url, location: j.location, employment_type: j.employment_type,
    description: j.description, salary_min: j.salary_min, salary_max: j.salary_max,
    salary_currency: j.salary_currency, salary_period: j.salary_period, deadline: j.deadline,
    apply_email: j.apply_email, apply_url: j.apply_url,
    pdf_url: j.pdf_key ? `/api/file/${j.id}.pdf` : null,
    published: (j.approved_at || j.created_at).slice(0, 10),
  }));
  return new Response(JSON.stringify({ ok: true, generated_at: nowIso(), items }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" } });
}

async function file(env, id) {
  const j = await env.DB.prepare("SELECT status,pdf_key,slug FROM jobs WHERE id=?").bind(id).first();
  if (!j || j.status !== "live" || !j.pdf_key) return new Response("Not found", { status: 404 });
  const o = await env.FILES.get(j.pdf_key, { type: "stream" });
  if (!o) return new Response("Not found", { status: 404 });
  return new Response(o, { headers: { "content-type": "application/pdf",
    "content-disposition": `inline; filename="${j.slug}.pdf"`, "cache-control": "public, max-age=3600",
    "x-content-type-options": "nosniff", "content-security-policy": "sandbox" } });
}

// ------------------------------------------------------------------ HTML pages served by the worker
function page(lang, title, body, status = 200) {
  return new Response(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(title)} | Suriname Business</title>
<style>body{margin:0;background:#f7f5f1;color:#16182f;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.w{max-width:760px;margin:0 auto;padding:28px 16px}.top{background:#1f2251;color:#fff;padding:14px 16px;font-weight:700}
.top a{color:#fff;text-decoration:none}.c{background:#fff;border:1px solid #e3e1ea;border-radius:10px;padding:20px;margin:14px 0}
h1{font-size:1.6rem;line-height:1.2;margin:0 0 10px}button,.b{font:inherit;font-weight:700;background:#e4572e;color:#fff;border:0;border-radius:8px;padding:11px 18px;cursor:pointer;text-decoration:none;display:inline-block}
button.alt{background:#fff;color:#16182f;border:1px solid #e3e1ea}.m{color:#646a85;font-size:.9rem}
textarea,input{font:inherit;width:100%;padding:9px;border:1px solid #e3e1ea;border-radius:8px;box-sizing:border-box}
table{border-collapse:collapse;width:100%;font-size:.93rem}td{padding:6px 8px;border-bottom:1px solid #efedf3;vertical-align:top}
td:first-child{color:#646a85;width:34%}pre{white-space:pre-wrap;font:inherit;margin:0}a{color:#33378a}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}</style></head>
<body><div class="top"><a href="https://surinamebusiness.com${lang === "en" ? "/en/" : "/"}">Suriname Business</a></div>
<div class="w">${body}</div></body></html>`, {
    status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store",
      "x-frame-options": "DENY", "referrer-policy": "no-referrer" } });
}
const notFound = lang => page(lang, "Not found", `<h1>${t(lang, "Link niet geldig", "Link not valid")}</h1>
<p>${t(lang, "Deze link is verlopen of niet (meer) geldig.", "This link has expired or is no longer valid.")}</p>`, 404);

function detailTable(j) {
  const sal = (j.salary_min || j.salary_max)
    ? `${j.salary_currency} ${j.salary_min || ""}${j.salary_max ? " - " + j.salary_max : ""} / ${j.salary_period}` : "-";
  const rows = [["Functie", j.title], ["Werkgever", j.employer], ["Website", j.employer_url || "-"], ["Locatie", j.location],
    ["Dienstverband", j.employment_type], ["Salaris", sal], ["Sluitingsdatum", j.deadline],
    ["Solliciteren via", [j.apply_email, j.apply_url].filter(Boolean).join(" / ")], ["PDF", j.pdf_key ? "ja" : "nee"],
    ["Taal advertentie", j.lang], ["Contact (privé)", `${j.contact_name}, ${j.contact_email}${j.contact_phone ? ", " + j.contact_phone : ""}`],
    ["Ingediend", j.created_at], ["E-mail bevestigd", j.verified_at || "nee"], ["Status", j.status]];
  return `<table>${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table>`;
}

// ------------------------------------------------------------------ verify (employer)
async function loadByToken(env, id, tok, col) {
  if (!/^[a-z0-9]{8}$/.test(id || "") || !tok) return null;
  const j = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  if (!j || !safeEq(j[col], await sha256(tok))) return null;
  return j;
}
async function verifyGet(url, env) {
  const id = url.searchParams.get("id"), tok = url.searchParams.get("t");
  const j = await loadByToken(env, id, tok, "verify_hash");
  if (!j) return notFound("nl");
  const L = j.lang;
  if (j.status !== "unverified")
    return page(L, "OK", `<h1>${t(L, "Al bevestigd", "Already confirmed")}</h1><p>${t(L, "Je vacature is al bevestigd en wordt gecontroleerd.", "Your vacancy is already confirmed and under review.")}</p>`);
  // a button, not an automatic action: mail scanners open links but do not submit forms
  return page(L, t(L, "Bevestigen", "Confirm"), `<h1>${t(L, "Vacature bevestigen", "Confirm vacancy")}</h1>
<div class="c"><b>${esc(j.title)}</b><div class="m">${esc(j.employer)} &middot; ${esc(j.location)}</div></div>
<form method="post"><input type="hidden" name="id" value="${esc(id)}"><input type="hidden" name="t" value="${esc(tok)}">
<button>${t(L, "Ja, dien mijn vacature in", "Yes, submit my vacancy")}</button></form>`);
}
async function verifyPost(req, env, ctx) {
  const f = await req.formData();
  const id = f.get("id"), tok = f.get("t");
  const j = await loadByToken(env, id, tok, "verify_hash");
  if (!j) return notFound("nl");
  const L = j.lang;
  if (j.status === "unverified") {
    await env.DB.prepare("UPDATE jobs SET status='pending', verified_at=? WHERE id=? AND status='unverified'").bind(nowIso(), id).run();
    ctx.waitUntil(notifyAdmin(env, apiBase(req, env), id));
  }
  return page(L, "OK", `<h1>${t(L, "Bedankt, je vacature is ingediend", "Thanks, your vacancy has been submitted")}</h1>
<p>${t(L, "We controleren hem meestal binnen één werkdag. Je krijgt een e-mail zodra hij online staat, met een link om de vacature later te sluiten.",
    "We usually review it within one working day. You will get an email as soon as it is live, with a link to close the vacancy later.")}</p>
<p><a class="b" href="https://surinamebusiness.com${L === "en" ? "/en/jobs" : "/vacatures"}">${t(L, "Naar de vacatures", "Go to jobs")}</a></p>`);
}

// ------------------------------------------------------------------ review (admin)
async function reviewGet(url, env) {
  const id = url.searchParams.get("id"), sig = url.searchParams.get("sig");
  if (!/^[a-z0-9]{8}$/.test(id || "") || !safeEq(sig, await reviewSig(env, id))) return notFound("nl");
  const j = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  if (!j) return notFound("nl");
  const pdf = j.pdf_key ? `<p><a href="/api/review?id=${id}&sig=${sig}&pdf=1">PDF bekijken</a></p>` : "";
  if (url.searchParams.get("pdf") && j.pdf_key) {
    const o = await env.FILES.get(j.pdf_key, { type: "stream" });
    if (!o) return notFound("nl");
    return new Response(o, { headers: { "content-type": "application/pdf", "content-security-policy": "sandbox", "cache-control": "no-store" } });
  }
  const actions = ["pending", "unverified"].includes(j.status) ? `
<form method="post" class="c"><input type="hidden" name="id" value="${id}"><input type="hidden" name="sig" value="${esc(sig)}">
<div class="row"><button name="action" value="approve">Goedkeuren en publiceren</button></div>
<p class="m" style="margin-top:16px">Afwijzen? Geef een korte reden (gaat naar de werkgever):</p>
<textarea name="reason" rows="2" placeholder="Bijv. geen echte werkgever, kosten voor sollicitanten, onvolledige informatie"></textarea>
<div class="row" style="margin-top:8px"><button class="alt" name="action" value="reject">Afwijzen</button></div></form>`
    : j.status === "live" ? `<form method="post" class="c"><input type="hidden" name="id" value="${id}"><input type="hidden" name="sig" value="${esc(sig)}">
<p>Deze vacature staat online. Offline halen?</p><button class="alt" name="action" value="takedown">Offline halen</button></form>` : "";
  return page("nl", "Controle", `<h1>Vacature controleren</h1>${j.status === "live" ? `<p><a href="${esc(siteJobUrl(env, j))}">Bekijk op de site</a></p>` : ""}
<div class="c">${detailTable(j)}</div><div class="c"><b>Omschrijving</b><pre>${esc(j.description)}</pre></div>${pdf}${actions}
<p class="m">Let op: kosten voor sollicitanten, piramidespellen, vage werkgever zonder website of telefoon, gmail-adres bij een "groot bedrijf": afwijzen.</p>`);
}
async function reviewPost(req, env, ctx) {
  const f = await req.formData();
  const id = f.get("id"), sig = f.get("sig"), action = f.get("action");
  if (!/^[a-z0-9]{8}$/.test(id || "") || !safeEq(sig, await reviewSig(env, id))) return notFound("nl");
  const j = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  if (!j) return notFound("nl");
  const L = j.lang;
  const back = `<p><a href="/api/admin?sig=${await adminSig(env)}">Terug naar de wachtrij</a></p>`;
  if (action === "approve" && ["pending", "unverified"].includes(j.status)) {
    if (j.deadline < todaySR()) return page("nl", "Verlopen", `<h1>Sluitingsdatum is al voorbij</h1>${back}`);
    await env.DB.prepare("UPDATE jobs SET status='live', approved_at=? WHERE id=?").bind(nowIso(), id).run();
    const manage = `${apiBase(req, env)}/api/manage?id=${id}&sig=${await manageSig(env, id)}`;
    ctx.waitUntil(Promise.all([rebuild(env), sendMail(env, j.contact_email,
      t(L, "Je vacature staat online: ", "Your vacancy is live: ") + j.title,
      mailWrap(`<p>${esc(t(L, "Beste", "Hi"))} ${esc(j.contact_name)},</p>
<p>${esc(t(L, "Je vacature is goedgekeurd en staat binnen een half uur op Suriname Business:", "Your vacancy has been approved and will be on Suriname Business within half an hour:"))}</p>
<p><a href="${esc(siteJobUrl(env, j))}">${esc(siteJobUrl(env, j))}</a></p>
<p>${esc(t(L, "Hij blijft online tot en met", "It stays online until and including"))} ${esc(j.deadline)}. ${esc(t(L, "Is de functie eerder vervuld? Sluit de vacature met deze link (bewaar deze e-mail):", "Filled earlier? Close the vacancy with this link (keep this email):"))}</p>
${btn(manage, t(L, "Vacature beheren", "Manage vacancy"))}`))]));
    return page("nl", "Goedgekeurd", `<h1>Goedgekeurd</h1><p>${esc(j.title)} staat binnen een half uur online${env.GH_TOKEN ? " (rebuild gestart)" : ""}.</p>${back}`);
  }
  if (action === "reject" && ["pending", "unverified"].includes(j.status)) {
    const reason = oneLine(f.get("reason") || "", 400);
    await env.DB.prepare("UPDATE jobs SET status='rejected', reject_reason=?, closed_at=? WHERE id=?").bind(reason, nowIso(), id).run();
    if (j.verified_at) ctx.waitUntil(sendMail(env, j.contact_email, t(L, "Je vacature is niet geplaatst: ", "Your vacancy was not published: ") + j.title,
      mailWrap(`<p>${esc(t(L, "Beste", "Hi"))} ${esc(j.contact_name)},</p>
<p>${esc(t(L, "We hebben je vacature niet geplaatst.", "We did not publish your vacancy."))}${reason ? " " + esc(t(L, "Reden:", "Reason:")) + " " + esc(reason) : ""}</p>
<p>${esc(t(L, "Vragen? Beantwoord deze e-mail.", "Questions? Reply to this email."))}</p>`)));
    return page("nl", "Afgewezen", `<h1>Afgewezen</h1>${back}`);
  }
  if (action === "takedown" && j.status === "live") {
    await env.DB.prepare("UPDATE jobs SET status='closed', closed_at=? WHERE id=?").bind(nowIso(), id).run();
    ctx.waitUntil(rebuild(env));
    return page("nl", "Offline", `<h1>Offline gehaald</h1><p>Verdwijnt bij de volgende build van de site.</p>${back}`);
  }
  return page("nl", "Geen actie", `<h1>Geen actie uitgevoerd</h1><p>Status is ${esc(j.status)}.</p>${back}`);
}

async function admin(url, env) {
  if (!safeEq(url.searchParams.get("sig"), await adminSig(env))) return notFound("nl");
  const { results } = await env.DB.prepare(
    "SELECT id,title,employer,status,deadline,created_at,verified_at FROM jobs WHERE status IN ('pending','unverified','live') ORDER BY created_at DESC LIMIT 200").all();
  const groups = { pending: [], live: [], unverified: [] };
  for (const j of results) groups[j.status].push(j);
  const rows = async list => list.length ? (await Promise.all(list.map(async j =>
    `<tr><td>${esc(j.created_at.slice(0, 10))}</td><td><a href="/api/review?id=${j.id}&sig=${await reviewSig(env, j.id)}">${esc(j.title)}</a><div class="m">${esc(j.employer)} &middot; sluit ${esc(j.deadline)}</div></td></tr>`))).join("")
    : `<tr><td colspan="2" class="m">Geen</td></tr>`;
  return page("nl", "Wachtrij", `<h1>Vacatures</h1>
<h2>Wacht op goedkeuring (${groups.pending.length})</h2><div class="c"><table>${await rows(groups.pending)}</table></div>
<h2>Online (${groups.live.length})</h2><div class="c"><table>${await rows(groups.live)}</table></div>
<h2>E-mail nog niet bevestigd (${groups.unverified.length})</h2><div class="c"><table>${await rows(groups.unverified)}</table></div>
<p class="m">Niet bevestigde aanvragen worden na 3 dagen automatisch verwijderd.</p>`);
}

// ------------------------------------------------------------------ manage (employer)
async function manageGet(url, env) {
  const id = url.searchParams.get("id"), sig = url.searchParams.get("sig");
  if (!/^[a-z0-9]{8}$/.test(id || "") || !safeEq(sig, await manageSig(env, id))) return notFound("nl");
  const j = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  if (!j) return notFound("nl");
  const L = j.lang;
  const live = j.status === "live" || j.status === "pending";
  return page(L, t(L, "Vacature beheren", "Manage vacancy"), `<h1>${t(L, "Vacature beheren", "Manage vacancy")}</h1>
<div class="c"><b>${esc(j.title)}</b><div class="m">${esc(j.employer)} &middot; ${t(L, "sluit", "closes")} ${esc(j.deadline)} &middot; ${t(L, "status", "status")}: ${esc(j.status === "live" ? t(L, "online", "live") : ({ pending: t(L, "wordt gecontroleerd", "under review"), unverified: t(L, "wacht op bevestiging", "awaiting confirmation"), rejected: t(L, "niet geplaatst", "not published"), closed: t(L, "gesloten", "closed"), expired: t(L, "verlopen", "expired") }[j.status] || j.status))}</div>
${j.status === "live" ? `<p style="margin-top:10px"><a href="${esc(siteJobUrl(env, j))}">${t(L, "Bekijk op de site", "View on the site")}</a></p>` : ""}</div>
${live ? `<form method="post"><input type="hidden" name="id" value="${id}"><input type="hidden" name="sig" value="${esc(sig)}">
<p>${t(L, "Is de functie vervuld? Sluit de vacature, dan verdwijnt hij binnen een half uur van de site.", "Position filled? Close the vacancy and it disappears from the site within half an hour.")}</p>
<button name="action" value="close">${t(L, "Vacature sluiten", "Close vacancy")}</button></form>
<p class="m" style="margin-top:18px">${t(L, "Iets wijzigen? Mail", "Need to change something? Email")} <a href="mailto:${esc(env.ADMIN_EMAIL)}?subject=${encodeURIComponent("Vacature " + id)}">${esc(env.ADMIN_EMAIL)}</a> ${t(L, "met het nummer", "with the reference")} ${id}.</p>` : ""}`);
}
async function managePost(req, env, ctx) {
  const f = await req.formData();
  const id = f.get("id"), sig = f.get("sig");
  if (!/^[a-z0-9]{8}$/.test(id || "") || !safeEq(sig, await manageSig(env, id))) return notFound("nl");
  const j = await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(id).first();
  if (!j) return notFound("nl");
  const L = j.lang;
  if (f.get("action") === "close" && (j.status === "live" || j.status === "pending")) {
    await env.DB.prepare("UPDATE jobs SET status='closed', closed_at=? WHERE id=?").bind(nowIso(), id).run();
    ctx.waitUntil(rebuild(env));
  }
  return page(L, "OK", `<h1>${t(L, "Vacature gesloten", "Vacancy closed")}</h1><p>${t(L, "Hij verdwijnt binnen een half uur van de site. Bedankt voor het plaatsen.", "It will disappear from the site within half an hour. Thanks for posting.")}</p>`);
}

// ------------------------------------------------------------------ daily housekeeping
async function housekeeping(env) {
  const today = todaySR();
  const ago = d => new Date(Date.now() - d * 864e5).toISOString();
  const exp = await env.DB.prepare("UPDATE jobs SET status='expired', closed_at=? WHERE status='live' AND deadline<?").bind(nowIso(), today).run();
  // remove what is no longer needed: unconfirmed after 3 days, ended ads (and contact details) after 90 days
  const { results } = await env.DB.prepare(
    `SELECT id,pdf_key FROM jobs WHERE (status='unverified' AND created_at<?)
       OR (status IN ('rejected','closed','expired') AND COALESCE(closed_at,created_at)<?)
       OR (status='pending' AND created_at<?)`).bind(ago(3), ago(90), ago(30)).all();
  for (const r of results) {
    if (r.pdf_key) await env.FILES.delete(r.pdf_key);
    await env.DB.prepare("DELETE FROM jobs WHERE id=?").bind(r.id).run();
  }
  if ((exp.meta && exp.meta.changes) || results.length) await rebuild(env);
  console.log("housekeeping", { expired: exp.meta && exp.meta.changes, deleted: results.length });
}
