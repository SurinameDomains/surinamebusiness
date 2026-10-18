// sb-cbvs: read-only relay for public CBvS publications, for the surinamebusiness.com data build.
// Deploy ONLY to the Suriname Business Cloudflare account. Never to the Explore account.
//
// Why: cbvs.sr challenges traffic from outside Suriname (GitHub Actions, and Workers running in US
// data centres). A Worker runs in the data centre nearest its caller, so when a visitor in Suriname
// calls it, it runs in Paramaribo (PBM) and cbvs.sr answers. Every good copy is kept in KV, and the
// build reads that copy when the live fetch is challenged.
//
//   GET /?path=<cbvs path>  KV copy if < 10 min old, else live; live challenged -> last KV copy.
//                           Headers: x-relay-source (live|kv), x-relay-fetched-at (ISO time of the copy).
//   GET /warm               called (no-cors) by surinamebusiness.com pages. Only works from Suriname,
//                           at most once per 15 minutes: refreshes the home page and probes the
//                           current customs rate PDF. Returns 204 at once; the work runs after.
//
// Locked down: GET only, host fixed to www.cbvs.sr, only the paths in ALLOWED.
const ORIGIN = "https://www.cbvs.sr";
const ALLOWED = [
  /^\/$/,
  /^\/statistieken\/financiele-markten-statistieken\/dagelijkse-publicaties$/,
  /^\/images\/content\/publicaties\/Douanekoersen\/20\d\d\/UWKOVZ-\d{8}E?\.pdf$/,
];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const FRESH_MS = 10 * 60 * 1000;
const WARM_MS = 15 * 60 * 1000;
const ANCHOR = Date.UTC(2026, 8, 21); // Monday 21-09-2026 starts a two-week customs period
const DAY = 86400000;

const isPdf = (p) => p.endsWith(".pdf");
const cors = { "access-control-allow-origin": "*" };

async function live(path) {
  const r = await fetch(ORIGIN + path, {
    headers: { "User-Agent": UA, "Accept": "text/html,application/pdf,*/*", "Accept-Language": "nl,en;q=0.8" },
    redirect: isPdf(path) ? "manual" : "follow",
  });
  const challenged = r.headers.get("cf-mitigated") === "challenge" || r.status === 403 || r.status === 503;
  if (challenged) return { state: "challenged", status: r.status };
  if (r.status !== 200) return { state: "missing", status: r.status };
  const buf = await r.arrayBuffer();
  const head = new TextDecoder().decode(buf.slice(0, 8));
  if (isPdf(path) ? !head.startsWith("%PDF") : !head.toLowerCase().includes("<!doc") && !head.includes("<html")) {
    return { state: "missing", status: 200 };
  }
  return { state: "ok", buf, type: isPdf(path) ? "application/pdf" : "text/html; charset=utf-8" };
}

async function store(env, path, res, colo) {
  await env.STORE.put("p:" + path, res.buf, { metadata: { at: Date.now(), type: res.type, colo } });
  if (isPdf(path)) await env.STORE.put("ok:" + path, "1");
}

function reply(buf, type, at, source) {
  return new Response(buf, {
    headers: { "content-type": type, "cache-control": "no-store", "x-relay": "sb-cbvs",
               "x-relay-source": source, "x-relay-fetched-at": new Date(at).toISOString(), ...cors },
  });
}

// customs list candidates in the order the build probes them: current period, offsets 1,2,3,0,4 days
function douanePaths(now) {
  const sr = now - 3 * 3600000; // Suriname time, UTC-3
  const today = Math.floor(sr / DAY) * DAY;
  const start = ANCHOR + 14 * DAY * Math.floor((today - ANCHOR) / (14 * DAY));
  const out = [];
  for (const off of [1, 2, 3, 0, 4]) {
    const d = new Date(start + off * DAY);
    if (d.getTime() > today) continue;
    const dd = String(d.getUTCDate()).padStart(2, "0"), mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const y = d.getUTCFullYear();
    for (const suf of ["", "E"]) out.push("/images/content/publicaties/Douanekoersen/" + y + "/UWKOVZ-" + dd + mm + y + suf + ".pdf");
  }
  return out;
}

async function warm(env, colo) {
  const home = await live("/");
  if (home.state === "ok") await store(env, "/", home, colo);
  else return; // challenged here too: nothing more to do
  const paths = douanePaths(Date.now());
  for (const p of paths) if (await env.STORE.get("ok:" + p)) return; // have this period's list already
  for (const p of paths) {
    if (await env.STORE.get("miss:" + p)) continue;
    const r = await live(p);
    if (r.state === "ok") { await store(env, p, r, colo); return; }
    if (r.state === "missing") await env.STORE.put("miss:" + p, "1", { expirationTtl: 3600 });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== "GET") return new Response("method not allowed", { status: 405 });
    const colo = (request.cf && request.cf.colo) || "";

    if (url.pathname === "/warm") {
      const country = request.cf && request.cf.country;
      if (country === "SR") {
        const last = Number(await env.STORE.get("warm_at")) || 0;
        if (Date.now() - last > WARM_MS) {
          await env.STORE.put("warm_at", String(Date.now()));
          ctx.waitUntil(warm(env, colo));
        }
      }
      return new Response(null, { status: 204, headers: cors });
    }
    if (url.pathname !== "/") return new Response("not found", { status: 404 });
    if (!url.searchParams.has("path")) return new Response("sb-cbvs relay ok\n");

    const path = url.searchParams.get("path") || "";
    if (!ALLOWED.some((re) => re.test(path))) return new Response("path not allowed", { status: 403 });

    const kept = await env.STORE.getWithMetadata("p:" + path, { type: "arrayBuffer" });
    const meta = kept.metadata || {};
    if (kept.value && Date.now() - meta.at < FRESH_MS) return reply(kept.value, meta.type, meta.at, "kv");

    const r = await live(path);
    if (r.state === "ok") {
      await store(env, path, r, colo);
      return reply(r.buf, r.type, Date.now(), "live");
    }
    if (r.state === "challenged" && kept.value) return reply(kept.value, meta.type, meta.at, "kv");
    if (r.state === "missing") return new Response("not found at cbvs.sr " + r.status, { status: 404, headers: cors });
    return new Response("cbvs.sr not reachable from " + colo + " and no stored copy", { status: 502, headers: cors });
  },
};
