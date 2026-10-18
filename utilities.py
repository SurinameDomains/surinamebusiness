"""Planned power outages from EBS (N.V. Energiebedrijven Suriname), for businesses that need to plan.

Source: the public notices on nvebs.com (Stroom onderbrekingen / Gepland onderhoud).
Each notice page names the district, the date, the time window and the streets.
Keeps the last good file when the site cannot be reached.
"""
import datetime as dt
import html
import re

from markets import _get, SR_TZ

EBS_LIST = "https://nvebs.com/elektriciteit/stroom-onderbrekingen"
MONTHS = {"januari": 1, "februari": 2, "maart": 3, "april": 4, "mei": 5, "juni": 6, "juli": 7, "augustus": 8,
          "september": 9, "oktober": 10, "november": 11, "december": 12}


def _clean(s):
    s = re.sub(r"<br\s*/?>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def _date_from(text):
    m = re.search(r"(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})", text, re.I)
    if not m:
        return None
    try:
        return dt.date(int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1)))
    except ValueError:
        return None


def parse_ebs_notice(page, url):
    title = _clean((re.search(r"(?s)<h1[^>]*>(.*?)</h1>", page) or [None, ""])[1])
    body = page.split("</h1>", 1)[1] if "</h1>" in page else page
    body = body.split("Naar het overzicht", 1)[0]
    paras = [_clean(p) for p in re.findall(r"(?s)<p[^>]*>(.*?)</p>", body)]
    paras = [p for p in paras if p and not p.lower().startswith("kaart openen")]
    map_url = (re.search(r'href="(https://gisenterprise\.ebs\.sr/[^"]+)"', body) or [None, ""])[1]
    slots = []
    for i, p in enumerate(paras):
        m = re.match(r"Gepland onderhoud:\s*(.+?)\s+(?:maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\s+(.+?)\s+tussen\s+(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})", p, re.I)
        if m:
            d = _date_from(m.group(2))
            areas = paras[i + 1] if i + 1 < len(paras) and not paras[i + 1].lower().startswith("gepland onderhoud") else ""
            slots.append({"district": m.group(1).strip(), "date": d.isoformat() if d else "",
                          "from": m.group(3).replace(".", ":"), "to": m.group(4).replace(".", ":"),
                          "areas": areas[:600]})
    kind = "planned" if slots or "onderhoud" in title.lower() else "notice"
    d = _date_from(title) or (dt.date.fromisoformat(slots[0]["date"]) if slots and slots[0]["date"] else None)
    return {"title": title.capitalize() if title.isupper() else title, "url": url, "kind": kind,
            "date": d.isoformat() if d else "", "slots": slots, "map": map_url,
            "text": "" if slots else " ".join(paras)[:700]}


def fetch_ebs(load, save, now_iso, cme_usd=None):
    old = load("ebs_outages.json", {})
    known = {n["url"]: n for n in old.get("notices", [])}
    page = _get(EBS_LIST)
    links = []
    for u in re.findall(r'href="(https://nvebs\.com/nieuws/\d+/[^"#?]+)"', page):
        if u not in links:
            links.append(u)
    if not links:
        raise ValueError("no EBS notices found")
    out = []
    for u in links[:12]:
        if u in known:
            out.append(known[u])
            continue
        try:
            out.append(parse_ebs_notice(_get(u), u))
        except Exception as e:
            print(f"  EBS notice {u} failed: {e}")
    today = dt.datetime.now(SR_TZ).date().isoformat()
    # keep notices of the last 3 days and everything ahead, newest date first
    out = [n for n in out if not n["date"] or n["date"] >= (dt.date.fromisoformat(today) - dt.timedelta(days=3)).isoformat()]
    out.sort(key=lambda n: n["date"] or "9999", reverse=False)
    save("ebs_outages.json", {"notices": out, "fetched_at": now_iso(), "source": EBS_LIST})
    return f"{len(out)} notices, {sum(len(n['slots']) for n in out)} planned windows"
