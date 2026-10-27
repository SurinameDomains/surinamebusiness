"""Market data for surinamebusiness.com: CBvS, customs rate, bank rates, gold and oil.

Every fetcher is independent and keeps the last good file in data/live when a source
fails or returns implausible numbers. Nothing on the site ever shows an unvalidated value.

Sources (all public):
  cbvs        cbvs.sr home page: weighted average rates (giraal and bank notes),
              gold certificate prices with the LBMA gold price, OMO and lending facility rates
  douane      CBvS 'Uitgebreid wisselkoersenoverzicht' PDF, the customs rate (douanekoers):
              art. 17 Wet Tarief van Invoerrechten 1996 uses the CBvS selling rate in force
              on the second working day of the two-week period
  banks       the published rates of Finabank, Hakrinbank, DSB Bank, Republic Bank, Godo
  commodities gold and silver spot (gold-api.com), Brent and WTI futures (Yahoo Finance chart)
"""
import datetime as dt
import html
import json
import re
import tempfile
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
SR_TZ = dt.timezone(dt.timedelta(hours=-3))


def _get(url, timeout=25, binary=False, follow=True):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/json,application/pdf,*/*",
                                               "Accept-Language": "nl,en;q=0.8"})
    if not follow:
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None
        opener = urllib.request.build_opener(NoRedirect)
        r = opener.open(req, timeout=timeout)
    else:
        r = urllib.request.urlopen(req, timeout=timeout)
    with r:
        data = r.read()
    return data if binary else data.decode("utf-8", errors="replace")


# cbvs.sr challenges traffic from outside Suriname, which includes GitHub Actions. SB's own relay
# (Cloudflare Worker sb-cbvs on the Suriname Business account, source in worker-cbvs/) keeps a copy
# that is refreshed whenever it runs in Paramaribo. Returns (body, copy time as ISO or None).
CBVS_RELAY = "https://data.surinamebusiness.com/"


def _cbvs_get(url, binary=False, follow=True):
    try:
        return _get(url, binary=binary, follow=follow), None
    except Exception as direct_err:
        path = url.split("cbvs.sr", 1)[1] or "/"
        req = urllib.request.Request(CBVS_RELAY + "?" + urllib.parse.urlencode({"path": path}), headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data, at = r.read(), r.headers.get("x-relay-fetched-at")
        except Exception as relay_err:
            raise RuntimeError(f"direct: {direct_err}; relay: {relay_err}")
        return (data if binary else data.decode("utf-8", errors="replace")), at


def _text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


def _nl_num(s):
    """'37,497' -> 37.497 ; '1.011.192,72' -> 1011192.72 ; '37.40' -> 37.4"""
    s = s.strip()
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    return float(s)


def _rows(table_html):
    for tr in re.findall(r"(?s)<tr[^>]*>(.*?)</tr>", table_html):
        cells = [_text(c) for c in re.findall(r"(?s)<t[dh][^>]*>(.*?)</t[dh]>", tr)]
        if cells:
            yield cells


# ---------------------------------------------------------------- CBvS home page
CBVS_URLS = ["https://www.cbvs.sr/", "https://www.cbvs.sr/statistieken/financiele-markten-statistieken/dagelijkse-publicaties"]


def parse_cbvs(page):
    out = {}
    for m in re.finditer(r'(?s)<table[^>]*class="exchange-table"[^>]*>(.*?)</table>', page):
        body = m.group(1)
        title = _text(re.search(r'(?s)class="currency-type-header"[^>]*>(.*?)</th>', body).group(1)) if 'currency-type-header' in body else ""
        t = title.lower()
        if "gewogen gemiddelde wisselkoersen" in t:
            stamp = re.search(r"(\d{1,2}\s+[a-z]+\s*-\s*\d{1,2}:\d{2}u?)", _text(body), re.I)
            rates = {}
            for cells in _rows(body):
                if len(cells) < 5:
                    continue
                code = cells[0].upper()
                per = 1
                if "PER 100" in code:
                    per = 100
                code = re.sub(r"[^A-Z]", "", code.replace("PER", ""))[:3]
                try:
                    vals = [round(_nl_num(c) / per, 5) for c in cells[1:5]]
                except ValueError:
                    continue
                if len(code) == 3:
                    rates[code] = {"giraal": [vals[0], vals[1]], "cash": [vals[2], vals[3]]}
            out["rates"] = rates
            out["stamp"] = stamp.group(1) if stamp else ""
        elif "goudcertificaten" in t:
            coupons = []
            for cells in _rows(body):
                if len(cells) == 2 and "gram" in cells[0].lower():
                    try:
                        coupons.append([int(re.sub(r"\D", "", cells[0])), _nl_num(cells[1])])
                    except ValueError:
                        pass
            lb = re.search(r"Gold\s+LBMA\s+USD\s+([\d.,]+)", _text(body) + " " + _text(page[m.end():m.end() + 600]), re.I)
            d = re.search(r"<span>\s*([A-Za-z]+\s+\d{1,2})\s*</span>", body)
            out["gold"] = {"coupons": coupons, "lbma_usd_oz": _nl_num(lb.group(1)) if lb else None, "date": d.group(1) if d else ""}
        elif "omo" in t or "belening" in t:
            rows = []
            for cells in _rows(body):
                if len(cells) == 3 and re.match(r"\d{4}-\d{2}-\d{2}", cells[1]):
                    try:
                        rows.append([cells[0], cells[1], _nl_num(cells[2])])
                    except ValueError:
                        pass
            out["omo" if "omo" in t else "lending"] = rows
    return out


def fetch_cbvs(load, save, now_iso, cme_usd=None):
    last_err = None
    old = load("cbvs.json", {})
    for url in CBVS_URLS[:1] + CBVS_URLS:
        try:
            page, copy_at = _cbvs_get(url)
            d = parse_cbvs(page)
        except Exception as e:  # Cloudflare in front of cbvs.sr fails now and then
            last_err = e
            continue
        r = d.get("rates", {})
        usd = r.get("USD", {}).get("giraal")
        if not usd or len(r) < 5:
            last_err = ValueError("rate table not found")
            continue
        if not (10 < usd[0] < 200 and usd[0] <= usd[1]) or (cme_usd and abs(usd[1] - cme_usd) / cme_usd > 0.15):
            raise ValueError(f"implausible CBvS USD {usd} vs CME {cme_usd}")
        fetched = now_iso()
        if copy_at:  # relay copy: keep the time the copy was taken, so the site can show its age
            fetched = dt.datetime.fromisoformat(copy_at.replace("Z", "+00:00")).replace(microsecond=0).isoformat()
            if old.get("fetched_at") and fetched <= old["fetched_at"]:
                return f"relay copy of {copy_at} not newer than {old['fetched_at']}, kept"
        d.update(fetched_at=fetched, source="https://www.cbvs.sr/")
        save("cbvs.json", d)
        hist = load("cbvs_history.json", {"note": "CBvS weighted average rates, giraal buy/sell", "days": {}})
        today = dt.datetime.fromisoformat(fetched).astimezone(SR_TZ).date().isoformat()
        hist["days"][today] = {k: r[k]["giraal"] for k in ("USD", "EUR") if k in r}
        if d.get("gold", {}).get("lbma_usd_oz"):
            hist["days"][today]["gold"] = d["gold"]["lbma_usd_oz"]
        keep = sorted(hist["days"])[-800:]
        hist["days"] = {k: hist["days"][k] for k in keep}
        save("cbvs_history.json", hist)
        return f"{len(r)} rates, USD {usd} ({d.get('stamp')}){' via relay copy of ' + copy_at if copy_at else ''}"
    raise last_err or ValueError("CBvS not reachable")


# ---------------------------------------------------------------- customs rate (douanekoers)
DOUANE_BASE = "https://www.cbvs.sr/images/content/publicaties/Douanekoersen"
DOUANE_ANCHOR = dt.date(2026, 9, 21)    # a Monday starting a two-week customs period (lists of 22-09 and 06-10-2026)
DOUANE_NAMES = {
    "USD": ("Amerikaanse dollar", "US dollar"), "EUR": ("Euro", "Euro"), "GBP": ("Brits pond", "British pound"),
    "XCG": ("Caribische gulden", "Caribbean guilder"), "CHF": ("Zwitserse frank", "Swiss franc"),
    "AWG": ("Arubaanse florin", "Aruban florin"), "SEK": ("Zweedse kroon", "Swedish krona"),
    "DKK": ("Deense kroon", "Danish krone"), "NOK": ("Noorse kroon", "Norwegian krone"),
    "CAD": ("Canadese dollar", "Canadian dollar"), "AUD": ("Australische dollar", "Australian dollar"),
    "JPY": ("Japanse yen", "Japanese yen"), "HKD": ("Hongkongse dollar", "Hong Kong dollar"),
    "BBD": ("Barbadiaanse dollar", "Barbados dollar"), "BSD": ("Bahamaanse dollar", "Bahamian dollar"),
    "BZD": ("Belizaanse dollar", "Belize dollar"), "XCD": ("Oost-Caribische dollar", "East Caribbean dollar"),
    "TTD": ("Trinidad en Tobago dollar", "Trinidad and Tobago dollar"), "GYD": ("Guyaanse dollar", "Guyana dollar"),
    "INR": ("Indiase roepie", "Indian rupee"), "BRL": ("Braziliaanse real", "Brazilian real"),
    "CNY": ("Chinese yuan", "Chinese yuan"), "ANG": ("Antilliaanse gulden", "Antillean guilder"),
}


def parse_douane(path):
    import pdfplumber
    with pdfplumber.open(path) as pdf:
        text = "\n".join((p.extract_text() or "") for p in pdf.pages)
    m = re.search(r"(?:VAN KRACHT M\.?I\.?V\.?|EFFECTIVE[A-Z .]*?)\s*:?\s*(\d{2})-(\d{2})-(\d{4})", text, re.I)
    eff = dt.date(int(m.group(3)), int(m.group(2)), int(m.group(1))) if m else None
    rates = {}
    for line in text.split("\n"):
        mm = re.search(r"\(PER\s+([A-Z]{3})\s+([\d.]+)\)\s*(?:SRD|\")?\s*([\d.]+,\d+)", line)
        if mm:
            unit = int(mm.group(2).replace(".", ""))
            rates[mm.group(1)] = {"unit": unit, "sell": _nl_num(mm.group(3))}
    return eff, rates


def _douane_candidates(today):
    start = DOUANE_ANCHOR + dt.timedelta(days=14 * ((today - DOUANE_ANCHOR).days // 14))
    out = []
    for back in (0, 1, 2):
        s = start - dt.timedelta(days=14 * back)
        for off in (1, 2, 3, 0, 4):
            d = s + dt.timedelta(days=off)
            if d <= today:
                out.append((s, d))
    return out


def fetch_douane(load, save, now_iso, cme_usd=None):
    old = load("douanekoers.json", {})
    today = dt.datetime.now(SR_TZ).date()
    cands = _douane_candidates(today)
    newest_start = cands[0][0]
    if old.get("period_start") == newest_start.isoformat() and old.get("rates"):
        old["checked_at"] = now_iso()
        save("douanekoers.json", old)
        return f"current list ({old['effective']}) unchanged"
    tried = 0
    for start, d in cands:
        if old.get("period_start") and start.isoformat() <= old["period_start"]:
            break  # do not go back past what we have
        for suffix in ("", "E"):
            url = f"{DOUANE_BASE}/{d.year}/UWKOVZ-{d.strftime('%d%m%Y')}{suffix}.pdf"
            tried += 1
            try:
                data, _ = _cbvs_get(url, binary=True, follow=False)
            except Exception:
                continue
            if not data.startswith(b"%PDF"):
                continue
            with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
                tmp.write(data)
                tmp.flush()
                eff, rates = parse_douane(tmp.name)
            usd = rates.get("USD", {}).get("sell")
            if not usd or len(rates) < 10 or eff != d:
                continue
            if cme_usd and abs(usd - cme_usd) / cme_usd > 0.12:
                raise ValueError(f"implausible customs USD {usd} vs CME {cme_usd}")
            hist = old.get("history", [])
            if old.get("rates"):
                hist = [h for h in hist if h["effective"] != old["effective"]]
                hist.insert(0, {"effective": old["effective"], "usd": old["rates"]["USD"]["sell"],
                                "eur": old["rates"].get("EUR", {}).get("sell")})
            new = {"effective": eff.isoformat(), "period_start": start.isoformat(),
                   "period_end": (start + dt.timedelta(days=13)).isoformat(),
                   "next_expected": (start + dt.timedelta(days=15)).isoformat(),
                   "rates": rates, "pdf": url, "fetched_at": now_iso(), "checked_at": now_iso(),
                   "history": hist[:40]}
            save("douanekoers.json", new)
            return f"{len(rates)} rates, USD {usd}, in force {eff}"
    if old.get("rates"):
        old["checked_at"] = now_iso()
        save("douanekoers.json", old)
        return f"no newer list ({tried} probes), kept {old['effective']}"
    raise ValueError(f"no customs rate list found ({tried} probes)")


# ---------------------------------------------------------------- commercial banks
def _bank_finabank():
    t = _text(_get("https://www.finabanknv.com/service-desk/koersen-rates/"))
    u = re.search(r"USD\s+GIRAAL\s+([\d.,]+)\s+([\d.,]+)", t, re.I)
    e = re.search(r"EUR\s+GIRAAL\s+([\d.,]+)\s+([\d.,]+)", t, re.I)
    d = re.search(r"Koersen per\s+([\d-]+)", t, re.I)
    return {"usd": [float(u.group(1)), float(u.group(2))], "eur": [float(e.group(1)), float(e.group(2))], "date": d.group(1) if d else ""}


def _bank_hakrin():
    page = _get("https://www.hakrinbank.com/en/private/foreign-exchange/")
    for tb in re.findall(r"(?s)<table[^>]*>(.*?)</table>", page):
        t = _text(tb)
        u = re.search(r"USD\s+([\d.]+)\s+([\d.]+)", t)
        e = re.search(r"EUR\s+([\d.]+)\s+([\d.]+)", t)
        if u and e and "purchase" in t.lower():
            return {"usd": [float(u.group(1)), float(u.group(2))], "eur": [float(e.group(1)), float(e.group(2))], "date": ""}
    raise ValueError("Hakrinbank table not found")


def _bank_dsb():
    j = json.loads(_get("https://service.dsbtools.com/exchange/rates"))["valuta"]
    return {"usd": [float(j["USD"]["buy"]), float(j["USD"]["sell"])], "eur": [float(j["EUR"]["buy"]), float(j["EUR"]["sell"])],
            "date": j["USD"].get("updated_on", "")}


def _bank_republic():
    page = _get("https://www.republicbanksr.com/")
    m = re.search(r'(?s)<table[^>]*class="rates-tb[^"]*"[^>]*>(.*?)</table>', page)
    t = _text(m.group(1) if m else page)
    u = re.search(r"USD\s+([\d.]+)\s+[\d.]+\s+([\d.]+)", t)
    e = re.search(r"EURO?\s+([\d.]+)\s+[\d.]+\s+([\d.]+)", t)
    d = re.search(r"rates as at\s+([\d/]+)", t, re.I)
    return {"usd": [float(u.group(1)), float(u.group(2))], "eur": [float(e.group(1)), float(e.group(2))], "date": d.group(1) if d else ""}


def _bank_godo():
    t = _text(_get("https://www.godo.sr/"))
    u = re.search(r"Valuta\s+Aankoop\s+Verkoop\s+USD\s+([\d.]+)\s+([\d.]+)", t, re.I)
    e = re.search(r"EURO?\s+([\d.]+)\s+([\d.]+)", t[u.end():] if u else t)
    d = re.search(r"Wisselkoersnoteringen:\s*([A-Za-z]+\s+\d{1,2}\s+[a-z]+\s+\d{4})", t, re.I)
    return {"usd": [float(u.group(1)), float(u.group(2))], "eur": [float(e.group(1)), float(e.group(2))], "date": d.group(1) if d else ""}


BANKS = [
    ("finabank", "Finabank", "https://www.finabanknv.com/service-desk/koersen-rates/", _bank_finabank),
    ("hakrinbank", "Hakrinbank", "https://www.hakrinbank.com/en/private/foreign-exchange/", _bank_hakrin),
    ("dsb", "De Surinaamsche Bank (DSB)", "https://www.dsb.sr/", _bank_dsb),
    ("republic", "Republic Bank", "https://www.republicbanksr.com/", _bank_republic),
    ("godo", "Godo", "https://www.godo.sr/", _bank_godo),
]


def fetch_banks(load, save, now_iso, cme_usd=None):
    old = {b["key"]: b for b in load("banks.json", {}).get("banks", [])}
    out, ok = [], 0
    for key, name, url, fn in BANKS:
        try:
            r = fn()
            for cur, lo, hi in (("usd", 10, 200), ("eur", 10, 250)):
                b, s = r[cur]
                if not (lo < b < hi and lo < s < hi and b <= s):
                    raise ValueError(f"implausible {cur} {b}/{s}")
            if cme_usd and abs(r["usd"][1] - cme_usd) / cme_usd > 0.12:
                raise ValueError(f"USD {r['usd']} far from CME {cme_usd}")
            out.append({"key": key, "name": name, "url": url, "usd": r["usd"], "eur": r["eur"], "date": r.get("date", ""),
                        "fetched_at": now_iso(), "live": True})
            ok += 1
        except Exception as e:
            print(f"  bank {key} failed: {e}")
            if key in old:
                o = dict(old[key])
                o["live"] = False
                out.append(o)
    if not out:
        raise ValueError("no bank rates")
    save("banks.json", {"banks": out, "fetched_at": now_iso()})
    return f"{ok}/{len(BANKS)} banks live"


# ---------------------------------------------------------------- gold, silver, oil
def _yahoo(symbol):
    j = json.loads(_get(f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=3mo&interval=1d"))
    res = j["chart"]["result"][0]
    closes = res["indicators"]["quote"][0]["close"]
    days = [dt.datetime.fromtimestamp(t, dt.timezone.utc).date().isoformat() for t in res["timestamp"]]
    series = [[d, round(c, 2)] for d, c in zip(days, closes) if c]
    price = res["meta"].get("regularMarketPrice") or series[-1][1]
    return {"price": float(price), "series": series[-60:],
            "time": dt.datetime.fromtimestamp(res["meta"].get("regularMarketTime", 0), dt.timezone.utc).isoformat()}


def fetch_commodities(load, save, now_iso, cme_usd=None):
    old = load("commodities.json", {})
    out, ok = {}, []
    for key, fn, lo, hi in (
            ("gold", lambda: {"price": float(json.loads(_get("https://api.gold-api.com/price/XAU"))["price"])}, 500, 20000),
            ("silver", lambda: {"price": float(json.loads(_get("https://api.gold-api.com/price/XAG"))["price"])}, 5, 500),
            ("brent", lambda: _yahoo("BZ%3DF"), 10, 400),
            ("wti", lambda: _yahoo("CL%3DF"), 10, 400)):
        try:
            v = fn()
            if not (lo < v["price"] < hi):
                raise ValueError(f"implausible {key} {v['price']}")
            v["fetched_at"] = now_iso()
            out[key] = v
            ok.append(key)
        except Exception as e:
            print(f"  {key} failed: {e}")
            if key in old:
                out[key] = old[key]
    # keep our own daily history of gold and silver
    hist = old.get("history", {})
    today = dt.datetime.now(SR_TZ).date().isoformat()
    if "gold" in ok:
        hist.setdefault(today, {})["gold"] = out["gold"]["price"]
    if "silver" in ok:
        hist.setdefault(today, {})["silver"] = out["silver"]["price"]
    out["history"] = {k: hist[k] for k in sorted(hist)[-400:]}
    if not ok and not old:
        raise ValueError("no commodity prices")
    save("commodities.json", out)
    return ", ".join(ok) or "kept last known"


# ---------------------------------------------------------------- pump prices (fuel)
GOW2_URL = "https://gow2.com/en/fuels/"


def parse_gow2(page):
    """GOw2 shows its pump price per product on every page: <span class="prijsProduct">… Gasoline</span>
    <span class="prijs">48.32</span> … <span class="prijsDate">26/10/2026</span>."""
    out = {}
    for m in re.finditer(r'prijsProduct">(?:<img[^>]*>)?\s*([A-Za-z ]+?)\s*</span>\s*<span class="prijs">\s*([\d.,]+)\s*</span>'
                         r'.*?prijsDate">\s*(\d{1,2})/(\d{1,2})/(\d{4})', page, re.S):
        name = m.group(1).strip().lower()
        key = "unleaded" if name.startswith(("gasoline", "benzine", "unleaded")) else ("diesel" if name.startswith("diesel") else None)
        if not key or key in out:
            continue
        out[key] = float(m.group(2).replace(",", "."))
        out["date"] = f"{m.group(5)}-{int(m.group(4)):02d}-{int(m.group(3)):02d}"
    if "unleaded" not in out or "diesel" not in out:
        raise ValueError("GOw2 prices not found")
    return out


def fetch_fuel(load, save, now_iso, cme_usd=None):
    old = load("fuel.json", {})
    hist = old.get("history", {})
    p = parse_gow2(_get(GOW2_URL))
    for k in ("unleaded", "diesel"):
        if not (10 < p[k] < 400):
            raise ValueError(f"implausible {k} {p[k]}")
    prev = old.get("gow2") or {}
    # a jump of more than 40% in one go is more likely a parsing error than a price change
    for k in ("unleaded", "diesel"):
        if prev.get(k) and abs(p[k] / prev[k] - 1) > 0.4:
            raise ValueError(f"{k} jumped from {prev[k]} to {p[k]}")
    p["fetched_at"] = now_iso()
    hist[p["date"]] = {"unleaded": p["unleaded"], "diesel": p["diesel"]}
    save("fuel.json", {"gow2": p, "history": {k: hist[k] for k in sorted(hist)[-730:]}, "source": GOW2_URL})
    return f"GOw2 unleaded {p['unleaded']} diesel {p['diesel']} ({p['date']})"
