#!/usr/bin/env python3
"""Fetch live data for surinamebusiness.com.

Every source is independent: one failing source never stops the others or the
build. On failure the previous file is kept (last known good) and the build
shows its age. Writes JSON into data/live/.

Sources (all public):
  rates    Central Money Exchange (cme.sr) JSON endpoints
  tenders  gov.sr WordPress REST, Staatsolie procurement page,
           World Bank procurement API, IDB open data (CC BY 4.0)
  jobs     gov.sr WordPress REST (vacature)
  news     publisher RSS feeds (headline, source, time, link only)
"""
import datetime as dt
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from email.utils import parsedate_to_datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
LIVE = os.path.join(ROOT, "data", "live")
UA = "Mozilla/5.0 (compatible; SurinameBusinessBot/1.0; +https://surinamebusiness.com/bronnen)"
SR_TZ = dt.timezone(dt.timedelta(hours=-3))


def now_iso():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def today_sr():
    return dt.datetime.now(SR_TZ).date()


def get(url, data=None, headers=None, timeout=30):
    h = {"User-Agent": UA, "Accept": "*/*"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h, method="POST" if data is not None else "GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="replace")


def load(name, default):
    p = os.path.join(LIVE, name)
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save(name, obj):
    os.makedirs(LIVE, exist_ok=True)
    p = os.path.join(LIVE, name)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1, sort_keys=True)
    os.replace(tmp, p)


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s or ""))
    return re.sub(r"\s+", " ", s).strip()


# ---------------------------------------------------------------- rates
def fetch_rates():
    body = get("https://www.cme.sr/Home/GetTodaysExchangeRates/?BusinessDate=2016-07-25",
               data=b"", headers={"Content-Type": "application/json; charset=utf-8"})
    v = json.loads(body)[0]
    ub, us = float(v["BuyUsdExchangeRate"]), float(v["SaleUsdExchangeRate"])
    eb, es = float(v["BuyEuroExchangeRate"]), float(v["SaleEuroExchangeRate"])
    if not (10 < ub < 200 and 10 < us < 200 and 10 < eb < 250 and 10 < es < 250 and ub <= us):
        raise ValueError(f"implausible rates {ub} {us} {eb} {es}")
    bdate = dt.datetime.strptime(v["BusinessDate"], "%d-%b-%Y").date().isoformat()
    rates = {
        "source": "Central Money Exchange (CME)",
        "source_url": "https://www.cme.sr/",
        "business_date": bdate,
        "updated_time": v.get("UpdatedTime"),
        "usd": {"buy": ub, "sell": us},
        "eur": {"buy": eb, "sell": es},
        "fetched_at": now_iso(),
    }
    save("rates.json", rates)

    hist = load("rate_history.json", {"note": "CME cash rates, one entry per business day", "days": {}})
    hist["days"][bdate] = {"usd": [ub, us], "eur": [eb, es]}
    # backfill sell rates of the last two weeks from the weekly endpoint
    try:
        wk = json.loads(get("https://www.cme.sr/Home/GetExchangeRatesBasedonWeek", data=b"",
                            headers={"Content-Type": "application/json; charset=utf-8"}))
        for row in wk:
            d = dt.datetime.strptime(row["Day"], "%d-%b-%Y").date().isoformat()
            if d not in hist["days"] and row.get("SaleUsdExchangeRate"):
                hist["days"][d] = {"usd": [None, float(row["SaleUsdExchangeRate"])],
                                   "eur": [None, float(row["SaleEuroExchangeRate"])]}
    except Exception as e:  # history backfill is optional
        print("  weekly backfill skipped:", e)
    keep = sorted(hist["days"])[-800:]
    hist["days"] = {d: hist["days"][d] for d in keep}
    save("rate_history.json", hist)
    return f"USD {ub}/{us} EUR {eb}/{es} ({bdate})"


# ---------------------------------------------------------------- tenders
MINISTRY_WORDS = {
    "openbare-werken": "Openbare Werken & Ruimtelijke Ordening",
    "ruimtelijke-ordening": "Openbare Werken & Ruimtelijke Ordening",
    "landbouw": "Landbouw, Veeteelt en Visserij",
    "volksgezondheid": "Volksgezondheid, Welzijn & Arbeid",
    "onderwijs": "Onderwijs, Wetenschap en Cultuur",
    "natuurlijke-hulpbronnen": "Natuurlijke Hulpbronnen",
    "regionale-ontwikkeling": "Regionale Ontwikkeling",
    "financien": "Financiën en Planning",
    "justitie": "Justitie en Veiligheid",
    "defensie": "Defensie",
    "binnenlandse-zaken": "Binnenlandse Zaken",
    "buitenlandse-zaken": "Buitenlandse Zaken",
    "transport": "Transport, Communicatie en Toerisme",
    "economische-zaken": "Economische Zaken",
    "sociale-zaken": "Sociale Zaken en Huisvesting",
    "grond-en-bosbeheer": "Grond- en Bosbeheer",
    "jeugdontwikkeling": "Jeugdontwikkeling en Sport",
    "olie-gas": "Olie, Gas en Milieu",
    "kabinet-van-de-president": "Kabinet van de President",
    "vicepresident": "Kabinet van de Vicepresident",
}


def ministry_from(classes):
    for c in classes or []:
        if c.startswith("category-"):
            slug = c[len("category-"):]
            for k, v in MINISTRY_WORDS.items():
                if k in slug:
                    return "Ministerie van " + v if not v.startswith("Kabinet") else v
    return "Overheid van Suriname"


def wp_items(post_type, n=60):
    url = f"https://gov.sr/wp-json/wp/v2/{post_type}?per_page={n}&_fields=id,date,link,title,class_list"
    return json.loads(get(url))


def tenders_gov():
    out = []
    for it in wp_items("aanbestedingen"):
        out.append({
            "id": f"gov-{it['id']}",
            "source": "gov.sr",
            "buyer": ministry_from(it.get("class_list")),
            "title": clean(it["title"]["rendered"]),
            "published": it["date"][:10],
            "deadline": None,
            "url": it["link"],
            "lang": "nl",
        })
    return out


MONTHS_EN = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july",
                                         "august", "september", "october", "november", "december"], 1)}


def parse_en_date(s):
    m = re.search(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", s or "")
    if not m or m.group(2).lower() not in MONTHS_EN:
        return None
    return dt.date(int(m.group(3)), MONTHS_EN[m.group(2).lower()], int(m.group(1))).isoformat()


def tenders_staatsolie():
    h = get("https://www.staatsolie.com/en/procurement-opportunities/")
    out = []
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", h, flags=re.S):
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.S)
        if len(cells) < 3:
            continue
        a = re.search(r'href="([^"]+)"', cells[0])
        title = clean(cells[0])
        if not a or not title:
            continue
        url = urllib.parse.urljoin("https://www.staatsolie.com", a.group(1))
        out.append({
            "id": "so-" + re.sub(r"[^a-z0-9]+", "-", a.group(1).lower()).strip("-")[-60:],
            "source": "Staatsolie",
            "buyer": "Staatsolie Maatschappij Suriname N.V.",
            "title": title,
            "published": parse_en_date(clean(cells[1])),
            "deadline": parse_en_date(clean(cells[2])),
            "url": url,
            "lang": "en",
        })
    return out


def tenders_worldbank():
    url = ("https://search.worldbank.org/api/v2/procnotices?format=json&project_ctry_code=SR"
           "&srt=submission_date&order=desc&rows=60")
    d = json.loads(get(url))
    out = []
    for n in d.get("procnotices", []):
        kind = n.get("notice_type", "")
        if "Award" in kind:
            continue
        deadline = (n.get("submission_deadline_date") or "")[:10] or None
        out.append({
            "id": "wb-" + n["id"],
            "source": "World Bank",
            "buyer": n.get("project_name") or "World Bank project",
            "title": clean(n.get("bid_description") or kind),
            "kind": kind,
            "published": (n.get("submission_date") or "")[:10] or None,
            "deadline": deadline,
            "url": f"https://projects.worldbank.org/en/projects-operations/procurement-detail/{n['id']}",
            "lang": "en",
        })
    return out


def tenders_idb():
    q = urllib.parse.urlencode({
        "resource_id": "856aabfd-2c6a-48fb-a8b8-19f3ff443618",
        "filters": json.dumps({"countryname": "SURINAME"}),
        "sort": "publicationdate desc",
        "limit": 60,
    })
    d = json.loads(get("https://data.iadb.org/api/action/datastore_search?" + q))
    out = []
    for r in d["result"]["records"]:
        if (r.get("type") or "").upper() in ("CA", "AWARD"):
            continue
        out.append({
            "id": "idb-" + str(r.get("noticeid")),
            "source": "IDB",
            "buyer": r.get("projectname") or "IDB project",
            "title": clean(r.get("noticetitle") or r.get("process_nm")),
            "kind": r.get("category_nm"),
            "published": (r.get("publicationdate") or "")[:10] or None,
            "deadline": (r.get("deadline") or "")[:10] or None,
            "url": r.get("documenturl") or r.get("proyecturl"),
            "lang": "en",
        })
    return out


def fetch_tenders():
    prev = load("tenders.json", {"items": [], "sources": {}})
    by_source = {}
    for item in prev.get("items", []):
        by_source.setdefault(item["source"], []).append(item)
    status = prev.get("sources", {})
    for name, fn in [("gov.sr", tenders_gov), ("Staatsolie", tenders_staatsolie),
                     ("World Bank", tenders_worldbank), ("IDB", tenders_idb)]:
        try:
            items = fn()
            if not items:
                raise ValueError("no items")
            by_source[name] = items
            status[name] = {"ok": True, "fetched_at": now_iso(), "count": len(items)}
            print(f"  tenders {name}: {len(items)}")
        except Exception as e:
            st = status.get(name, {})
            st.update({"ok": False, "error": str(e)[:200], "failed_at": now_iso()})
            status[name] = st
            print(f"  tenders {name} FAILED: {e}")
    today = today_sr().isoformat()
    horizon = (today_sr() - dt.timedelta(days=75)).isoformat()
    items = []
    for lst in by_source.values():
        for it in lst:
            if it.get("deadline") and it["deadline"] < today:
                continue  # closed
            if not it.get("deadline") and (it.get("published") or "0") < horizon:
                continue  # old notice without a known deadline
            items.append(it)
    items.sort(key=lambda x: x.get("published") or "", reverse=True)
    save("tenders.json", {"items": items, "sources": status, "fetched_at": now_iso()})
    return f"{len(items)} open"


# ---------------------------------------------------------------- jobs
def fetch_jobs():
    prev = load("jobs.json", {"items": []})
    try:
        items = []
        horizon = (today_sr() - dt.timedelta(days=90)).isoformat()
        for it in wp_items("vacature"):
            if it["date"][:10] < horizon:
                continue
            items.append({
                "id": f"gov-{it['id']}",
                "source": "gov.sr",
                "employer": ministry_from(it.get("class_list")),
                "title": clean(it["title"]["rendered"]),
                "published": it["date"][:10],
                "url": it["link"],
            })
        # individual consultancy notices from the development banks are jobs too
        for t in load("tenders.json", {"items": []}).get("items", []):
            kind = (t.get("kind") or "") + " " + t.get("title", "")
            if t["source"] in ("IDB", "World Bank") and re.search(r"individual|individu", kind, re.I):
                items.append({
                    "id": t["id"], "source": t["source"], "employer": t["buyer"],
                    "title": t["title"], "published": t.get("published"), "deadline": t.get("deadline"),
                    "url": t["url"], "kind": "consultancy",
                })
        items.sort(key=lambda x: x.get("published") or "", reverse=True)
        save("jobs.json", {"items": items, "ok": True, "fetched_at": now_iso()})
        return f"{len(items)} jobs"
    except Exception as e:
        prev.update({"ok": False, "error": str(e)[:200], "failed_at": now_iso()})
        save("jobs.json", prev)
        raise


# ---------------------------------------------------------------- news
FEEDS = [
    ("Starnieuws", "https://www.starnieuws.com/rss/starnieuws.rss"),
    ("de Ware Tijd", "https://www.dwtonline.com/feed/"),
    ("Suriname Herald", "https://www.srherald.com/feed/"),
    ("Dagblad Suriname", "https://www.dbsuriname.com/feed/"),
    ("Suriname Herald", "https://www.srherald.com/category/economie/feed/"),
    ("de Ware Tijd", "https://www.dwtonline.com/category/economie/feed/"),
]
# feeds that are an economy section: every headline counts as business news
ECONOMY_FEEDS = {"https://www.srherald.com/category/economie/feed/", "https://www.dwtonline.com/category/economie/feed/"}
BUSINESS_RE = re.compile(
    r"\b(economi\w*|ondernem\w*|bedrijf\w*|bedrijven|investe\w*|export\w*|import\w*|handel\w*|koers\w*|"
    r"wisselkoers|valuta|inflatie|begroting|belasting\w*|btw|cbvs|centrale bank|bank\w*|krediet\w*|lening\w*|"
    r"imf|idb|wereldbank|staatsolie|olie|gas|offshore|granmorgu|totalenergies|petronas|mijnbouw|goud\w*|"
    r"rijst|landbouw\w*|toerisme|aanbesteding\w*|tender\w*|kkf|vsb|werkgelegenheid|vacature\w*|salaris\w*|"
    r"loon\w*|minimumloon|prijs\w*|brandstof\w*|energie\w*|ebs|telesur|haven\w*|economy|business|investment|"
    r"oil|bank|export|trade)\b", re.I)
OIL_RE = re.compile(r"\b(olie\w*|gas|offshore|granmorgu|staatsolie|totalenergies|petronas|apa|exxon|chevron|"
                    r"blok \d+|block \d+|fpso|oil|qatarenergy|local content)\b", re.I)


def parse_feed(name, url):
    raw = get(url, timeout=25)
    raw = re.sub(r"^[^<]+", "", raw)
    out = []
    for block in re.findall(r"<item\b.*?</item>", raw, flags=re.S):
        def tag(name):
            m = re.search(rf"<{name}[^>]*>(.*?)</{name}>", block, flags=re.S)
            if not m:
                return ""
            v = m.group(1)
            v = re.sub(r"^\s*<!\[CDATA\[|\]\]>\s*$", "", v.strip())
            return v
        title = clean(tag("title"))
        link = html.unescape(tag("link")).strip()
        pub = tag("pubDate")
        try:
            when = parsedate_to_datetime(pub).astimezone(dt.timezone.utc).replace(microsecond=0).isoformat()
        except Exception:
            when = None
        if title and link.startswith("http"):
            out.append({"source": name, "title": title, "url": link, "published": when})
    return out


def fetch_news():
    prev = load("news.json", {"business": [], "oil": [], "sources": {}})
    status = prev.get("sources", {})
    allitems = []
    for name, url in FEEDS:
        try:
            items = parse_feed(name, url)
            for it in items:
                it["econ"] = url in ECONOMY_FEEDS
            status[name + (" economie" if url in ECONOMY_FEEDS else "")] = {"ok": True, "fetched_at": now_iso(), "count": len(items)}
            allitems.extend(items)
        except Exception as e:
            status.setdefault(name + (" economie" if url in ECONOMY_FEEDS else ""), {}).update({"ok": False, "error": str(e)[:200], "failed_at": now_iso()})
            print(f"  news {name} FAILED: {e}")
    if not allitems:
        prev["sources"] = status
        save("news.json", prev)
        raise RuntimeError("no news feeds answered")
    # keep earlier headlines for 30 days so the lists fill up between runs
    cutoff = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=30)).isoformat()
    for old in prev.get("business", []) + prev.get("oil", []):
        if (old.get("published") or "") >= cutoff:
            allitems.append(old)
    seen, business, oil = set(), [], []
    allitems.sort(key=lambda x: x.get("published") or "", reverse=True)
    for it in allitems:
        key = it["title"].lower()[:80]
        if key in seen:
            continue
        seen.add(key)
        if OIL_RE.search(it["title"]):
            oil.append(it)
        if it.get("econ") or BUSINESS_RE.search(it["title"]):
            business.append(it)
    save("news.json", {"business": business[:60], "oil": oil[:40], "sources": status, "fetched_at": now_iso()})
    return f"{len(business)} business, {len(oil)} oil"


def main():
    ok = True
    for name, fn in [("rates", fetch_rates), ("tenders", fetch_tenders), ("jobs", fetch_jobs), ("news", fetch_news)]:
        try:
            print(f"{name}: {fn()}")
        except Exception as e:
            ok = False
            print(f"{name} FAILED (keeping last known good): {e}")
    # never fail the workflow because a source is down; the build shows staleness
    return 0


if __name__ == "__main__":
    sys.exit(main())
