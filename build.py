#!/usr/bin/env python3
"""Build surinamebusiness.com into _site/.

Reads facts.py (hand-checked values) and data/live/*.json (written by fetch.py),
renders templates/pages/<key>.html in Dutch (root) and English (/en/).
Self-contained: no data or files from any other site are used.
"""
import datetime as dt
import json
import os
import shutil
import sys

from jinja2 import Environment, FileSystemLoader, select_autoescape

import facts
from site_config import (CONTACT_EMAIL, EXPLORE_URL, FOOTER_GROUPS, NAV, PAGES, SITE_URL,
                         file_for, url_for)

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "_site")
LIVE = os.path.join(ROOT, "data", "live")
SR_TZ = dt.timezone(dt.timedelta(hours=-3))
NOW = dt.datetime.now(dt.timezone.utc)
NOW_SR = NOW.astimezone(SR_TZ)
TODAY = NOW_SR.date()

MONTHS = {
    "nl": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september",
           "oktober", "november", "december"],
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September",
           "October", "November", "December"],
}
DAYS = {"nl": ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
        "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}

# link labels per page key
LABELS = {
    "home": ("Home", "Home"),
    "salary": ("Netto salaris berekenen", "Net salary calculator"),
    "tax": ("Loonbelasting 2026", "Income tax 2026"),
    "overtime": ("Overuren berekenen", "Overtime calculator"),
    "minwage": ("Minimumloon", "Minimum wage"),
    "vatcalc": ("BTW berekenen", "VAT calculator"),
    "rates": ("Wisselkoers USD en EUR", "Exchange rates USD and EUR"),
    "holidays": ("Feestdagen 2026 en 2027", "Public holidays 2026 and 2027"),
    "workdays": ("Werkdagen berekenen", "Working days calculator"),
    "tenders": ("Aanbestedingen", "Tenders"),
    "jobs": ("Vacatures", "Jobs"),
    "news": ("Zakennieuws", "Business news"),
    "oilgas": ("Olie en gas: GranMorgu", "Oil and gas: GranMorgu"),
    "supplier": ("Leverancier worden in olie en gas", "Become an oil and gas supplier"),
    "start": ("Een bedrijf starten", "Start a business"),
    "vatguide": ("BTW in Suriname", "VAT in Suriname"),
    "labour": ("Arbeidsrecht: de basis", "Labour law basics"),
    "guides": ("Alle gidsen", "All guides"),
    "about": ("Over ons", "About us"),
    "sources": ("Bronnen en methode", "Sources and method"),
    "contact": ("Contact", "Contact"),
    "privacy": ("Privacy", "Privacy"),
}

META = {
    "home": (("Suriname Business: salaris, aanbestedingen, vacatures en koers",
              "Netto salaris berekenen, alle open aanbestedingen, vacatures, de dollarkoers en gidsen voor ondernemers in Suriname. Actueel en gratis."),
             ("Suriname Business: salary, tenders, jobs and exchange rates",
              "Net salary calculator, every open tender, jobs, exchange rates and practical guides for doing business in Suriname. Current and free.")),
    "salary": (("Netto salaris berekenen Suriname 2026 (loonbelasting en AOV)",
                "Bereken je netto salaris in Suriname met de loonbelasting tarieven van 2026, de belastingvrije som van SRD 9.000 en 4% AOV. Ook bruto naar netto en terug."),
               ("Net salary calculator Suriname 2026 (income tax and AOV)",
                "Calculate your net salary in Suriname with the 2026 wage tax brackets, the SRD 9,000 tax-free amount and 4% AOV. Gross to net and back.")),
    "tax": (("Loonbelasting Suriname 2026: tarieven, schijven en belastingvrije som",
             "De loonbelasting tarieven voor 2026: 8%, 18%, 28% en 38%, belastingvrije som SRD 9.000 per maand, forfaitaire aftrek, overwerk en vakantietoelage."),
            ("Suriname income tax 2026: wage tax brackets and tax-free amount",
             "Suriname wage tax for 2026: 8%, 18%, 28% and 38% brackets, SRD 9,000 monthly tax-free amount, flat deduction, overtime and holiday allowance rules.")),
    "overtime": (("Overuren berekenen Suriname: overwerkloon en belasting",
                  "Bereken je overwerkloon met 150% en 200% toeslag en de aparte overwerktabel van 5%, 15% en 25% loonbelasting."),
                 ("Overtime calculator Suriname: overtime pay and tax",
                  "Calculate overtime pay at 150% and 200% and the separate overtime wage tax table of 5%, 15% and 25%.")),
    "minwage": (("Minimumloon Suriname 2026: SRD 61,25 per uur",
                 "Het minimumuurloon in Suriname is sinds 1 juli 2026 SRD 61,25. Wat dat per dag, week en maand betekent."),
                ("Minimum wage Suriname 2026: SRD 61.25 per hour",
                 "Suriname's minimum hourly wage is SRD 61.25 since 1 July 2026. What that means per day, week and month.")),
    "vatcalc": (("BTW berekenen Suriname: 10%, 5% en 25%",
                 "Reken bedragen om van exclusief naar inclusief BTW en terug, met de Surinaamse tarieven van 10%, 5% en 25%."),
                ("VAT calculator Suriname: 10%, 5% and 25%",
                 "Convert amounts between excluding and including VAT with Suriname's 10%, 5% and 25% rates.")),
    "rates": (("Wisselkoers Suriname vandaag: dollar en euro (koers SRD)",
               "De koers van de dollar en de euro in Surinaamse dollar (SRD) vandaag, met koershistorie en CSV download."),
              ("Suriname exchange rate today: USD and EUR to SRD",
               "Today's US dollar and euro rates in Surinamese dollars (SRD), with rate history and a CSV download.")),
    "holidays": (("Feestdagen Suriname 2026 en 2027: alle vrije dagen",
                  "Alle officiële vrije dagen in Suriname voor 2026 en 2027, met datum en dag, voor planning en loonadministratie."),
                 ("Suriname public holidays 2026 and 2027",
                  "All official public holidays in Suriname for 2026 and 2027, with dates and weekdays, for planning and payroll.")),
    "workdays": (("Werkdagen berekenen Suriname (met feestdagen)",
                  "Tel het aantal werkdagen tussen twee datums, rekening houdend met weekenden en Surinaamse feestdagen."),
                 ("Working days calculator Suriname (with holidays)",
                  "Count working days between two dates, excluding weekends and Suriname public holidays.")),
    "tenders": (("Aanbestedingen Suriname: alle open tenders op één plek",
                 "Alle open aanbestedingen van de overheid, Staatsolie, de IDB en de Wereldbank in Suriname. Dagelijks bijgewerkt, gratis."),
                ("Suriname tenders: every open tender in one place",
                 "Every open tender from the government, Staatsolie, the IDB and the World Bank in Suriname. Updated daily, free.")),
    "jobs": (("Vacatures Suriname: overheid en consultancy",
              "Actuele vacatures bij de overheid van Suriname en consultancy opdrachten van de IDB en de Wereldbank."),
             ("Jobs in Suriname: government and consultancy",
              "Current government vacancies in Suriname and consultancy assignments from the IDB and the World Bank.")),
    "news": (("Zakennieuws Suriname: economie, olie, banken en handel",
              "De laatste economische koppen uit Surinaamse media op één plek, met link naar het originele artikel."),
             ("Suriname business news: economy, oil, banking and trade",
              "The latest business headlines from Surinamese media in one place, linking to the original articles.")),
    "oilgas": (("Olie en gas in Suriname: GranMorgu, Staatsolie en kansen",
                "GranMorgu in feiten: USD 10,5 miljard, 220.000 vaten per dag, eerste olie in 2028. Plus open Staatsolie tenders en nieuws."),
               ("Oil and gas in Suriname: GranMorgu, Staatsolie and opportunities",
                "GranMorgu in facts: USD 10.5 billion, 220,000 barrels a day, first oil in 2028. Plus open Staatsolie tenders and news.")),
    "supplier": (("Leverancier worden in de olie en gas sector van Suriname",
                  "Stap voor stap: registreren in het Suriname Supplier Registration Portal (SSRP) en SAP Ariba, en wat operators verwachten."),
                 ("How to become a supplier to Suriname's oil and gas sector",
                  "Step by step: registering in the Suriname Supplier Registration Portal (SSRP) and SAP Ariba, and what operators expect.")),
    "start": (("Een bedrijf starten in Suriname: stappen, rechtsvormen en KKF",
               "Eenmanszaak, VOF of NV: welke rechtsvorm kies je, hoe schrijf je in bij de KKF en welke vergunningen heb je nodig."),
              ("How to start a business in Suriname: steps, legal forms and KKF",
               "Sole trader, partnership or NV: which legal form to choose, how to register at the KKF and which licences you need.")),
    "vatguide": (("BTW in Suriname: tarieven, registratie en aangifte",
                  "Alles over de Surinaamse BTW sinds 2023: 10% algemeen, 0%, 5% en 25%, de drempel van SRD 1 miljoen en maandelijkse aangifte."),
                 ("VAT in Suriname: rates, registration and filing",
                  "Suriname VAT since 2023: 10% standard, 0%, 5% and 25% rates, the SRD 1 million threshold and monthly filing.")),
    "labour": (("Arbeidsrecht Suriname: werktijden, overwerk en vakantie",
                "De basisregels: maximaal 8,5 uur per dag en 48 per week, 150% en 200% overwerk, vakantiedagen en minimumloon."),
               ("Suriname labour law basics: hours, overtime and leave",
                "The basics: max 8.5 hours a day and 48 a week, 150% and 200% overtime, annual leave and minimum wage.")),
    "guides": (("Gidsen voor ondernemers en werknemers in Suriname",
                "Praktische gidsen over een bedrijf starten, BTW, arbeidsrecht en leveren aan de olie en gas sector."),
               ("Guides for doing business in Suriname",
                "Practical guides on starting a business, VAT, labour law and supplying the oil and gas sector.")),
    "about": (("Over Suriname Business", "Wie we zijn en hoe deze site werkt."),
              ("About Suriname Business", "Who we are and how this site works.")),
    "sources": (("Bronnen en methode", "Waar onze cijfers vandaan komen en hoe vaak we ze bijwerken."),
                ("Sources and method", "Where our numbers come from and how often we update them.")),
    "contact": (("Contact", "Neem contact op met Suriname Business."),
                ("Contact", "Get in touch with Suriname Business.")),
    "privacy": (("Privacy", "Hoe Suriname Business met gegevens omgaat."),
                ("Privacy", "How Suriname Business handles data.")),
}


def load(name, default):
    try:
        with open(os.path.join(LIVE, name), encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def parse_iso(s):
    if not s:
        return None
    try:
        d = dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
        if d.tzinfo is None:
            d = d.replace(tzinfo=dt.timezone.utc)
        return d
    except Exception:
        return None


def hours_old(s):
    d = parse_iso(s)
    return (NOW - d).total_seconds() / 3600 if d else 1e9


# ---------------------------------------------------------------- formatting
def fmt_num(x, lang, dec=2):
    if x is None:
        return "-"
    s = f"{x:,.{dec}f}"
    if lang == "nl":
        s = s.replace(",", "X").replace(".", ",").replace("X", ".")
    return s


def fmt_srd(x, lang, dec=0):
    return "SRD " + fmt_num(x, lang, dec)


def fmt_date(s, lang, weekday=False, year=True):
    if not s:
        return ""
    d = dt.date.fromisoformat(s[:10])
    m = MONTHS[lang][d.month - 1]
    out = f"{d.day} {m}" if lang == "nl" else f"{d.day} {m}"
    if year:
        out += f" {d.year}"
    if weekday:
        out = f"{DAYS[lang][d.weekday()]} {out}"
    return out


def fmt_ago(s, lang):
    d = parse_iso(s)
    if not d:
        return ""
    h = (NOW - d).total_seconds() / 3600
    if h < 1:
        m = max(1, int(h * 60))
        return f"{m} min geleden" if lang == "nl" else f"{m} min ago"
    if h < 24:
        return f"{int(h)} uur geleden" if lang == "nl" else f"{int(h)} h ago"
    days = int(h // 24)
    if lang == "nl":
        return "gisteren" if days == 1 else f"{days} dagen geleden"
    return "yesterday" if days == 1 else f"{days} days ago"


def days_until(s):
    if not s:
        return None
    return (dt.date.fromisoformat(s[:10]) - TODAY).days


# ---------------------------------------------------------------- data views
def rates_view():
    r = load("rates.json", None)
    if not r:
        return None
    age = hours_old(r.get("fetched_at"))
    hist = load("rate_history.json", {"days": {}}).get("days", {})
    days = sorted(hist)
    series = [(d, hist[d]["usd"][1]) for d in days if hist[d]["usd"][1]]
    prev = None
    for d in reversed(days):
        if d < r["business_date"] and hist[d]["usd"][1]:
            prev = hist[d]["usd"][1]
            break
    change = (r["usd"]["sell"] - prev) if prev else None
    return {**r, "stale": age > 36, "age_h": age, "series": series[-60:], "change": change,
            "history": [(d, hist[d]) for d in reversed(days)]}


def spark_points(series, w=300, h=56):
    vals = [v for _, v in series]
    if len(vals) < 3:
        return ""
    lo, hi = min(vals), max(vals)
    rng = (hi - lo) or 1
    pts = []
    for i, v in enumerate(vals):
        x = i * (w / (len(vals) - 1))
        y = h - 4 - (v - lo) / rng * (h - 8)
        pts.append(f"{x:.1f},{y:.1f}")
    return " ".join(pts)


def tenders_view():
    t = load("tenders.json", {"items": [], "sources": {}})
    items = t.get("items", [])
    for it in items:
        it["days_left"] = days_until(it.get("deadline"))
    return {"items": items, "sources": t.get("sources", {}), "fetched_at": t.get("fetched_at"),
            "count": len(items), "stale": hours_old(t.get("fetched_at")) > 48}


def jobs_view():
    j = load("jobs.json", {"items": []})
    items = j.get("items", [])
    for it in items:
        it["days_left"] = days_until(it.get("deadline"))
    return {"items": items, "fetched_at": j.get("fetched_at"), "stale": hours_old(j.get("fetched_at")) > 48}


def news_view():
    n = load("news.json", {"business": [], "oil": []})
    fresh = hours_old(n.get("fetched_at")) < 48
    return {"business": n.get("business", []) if fresh else [], "oil": n.get("oil", []) if fresh else [],
            "fetched_at": n.get("fetched_at"), "sources": n.get("sources", {})}


def holidays_view(lang):
    out = []
    for d, nl, en, status in facts.HOLIDAYS:
        out.append({"date": d, "name": nl if lang == "nl" else en, "status": status,
                    "days": days_until(d), "weekend": dt.date.fromisoformat(d).weekday() >= 5})
    upcoming = [h for h in out if h["days"] is not None and h["days"] >= 0]
    return {"all": out, "next": upcoming[0] if upcoming else None, "upcoming": upcoming}


def py_bands(amount, brackets):
    tax, lower = 0.0, 0.0
    for upper, rate in brackets:
        top = float("inf") if upper is None else upper
        part = max(0.0, min(amount, top) - lower)
        tax += part * rate
        lower = top
        if amount <= top:
            break
    return tax


def py_salary(gross, pension_pct=0.0, aov=True):
    T = facts.TAX
    forfait = min(gross * T["forfait_pct"], T["forfait_max_month"])
    pension = gross * pension_pct / 100
    zuiver = max(0.0, gross - forfait - pension)
    taxable = max(0.0, zuiver - T["free_month"])
    tax = py_bands(taxable, T["brackets_month"])
    aov_amt = zuiver * T["aov_pct"] if aov else 0.0
    return {"gross": gross, "tax": tax, "aov": aov_amt, "net": gross - pension - tax - aov_amt}


# ---------------------------------------------------------------- schema
def schema_for(key, lang, meta_title, desc, canonical):
    org = {"@type": "Organization", "@id": SITE_URL + "/#org", "name": "Suriname Business",
           "url": SITE_URL + "/", "logo": SITE_URL + "/assets/apple-touch-icon.png",
           "parentOrganization": {"@type": "Organization", "name": "Explore group"}}
    page = {"@type": "WebPage", "@id": canonical + "#page", "url": canonical, "name": meta_title,
            "description": desc, "inLanguage": "nl" if lang == "nl" else "en",
            "isPartOf": {"@id": SITE_URL + "/#site"}, "dateModified": NOW.date().isoformat()}
    graph = [org, {"@type": "WebSite", "@id": SITE_URL + "/#site", "url": SITE_URL + "/",
                   "name": "Suriname Business", "publisher": {"@id": SITE_URL + "/#org"}}, page]
    if key in ("salary", "overtime", "vatcalc", "workdays"):
        graph.append({"@type": "WebApplication", "name": LABELS[key][0 if lang == "nl" else 1],
                      "applicationCategory": "FinanceApplication", "operatingSystem": "Any",
                      "url": canonical, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}})
    if key != "home":
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Suriname Business",
             "item": SITE_URL + url_for("home", lang)},
            {"@type": "ListItem", "position": 2, "name": LABELS[key][0 if lang == "nl" else 1], "item": canonical}]})
    return graph


# ---------------------------------------------------------------- render
def main():
    build_id = NOW.strftime("%Y%m%d%H%M")
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(OUT, "assets"))

    env = Environment(loader=FileSystemLoader(os.path.join(ROOT, "templates")),
                      autoescape=select_autoescape(["html"]), trim_blocks=True, lstrip_blocks=True)

    rates = rates_view()
    tenders = tenders_view()
    jobs = jobs_view()
    news = news_view()
    sitemap = []

    for lang in ("nl", "en"):
        li = 0 if lang == "nl" else 1
        hol = holidays_view(lang)
        U = lambda k, _l=lang: url_for(k, _l)
        L = lambda k, _li=li: LABELS[k][_li]
        env.globals.update({})
        ticker = []
        if rates and not rates["stale"]:
            ticker.append({"label": "USD", "value": fmt_num(rates["usd"]["sell"], lang), "url": U("rates")})
            ticker.append({"label": "EUR", "value": fmt_num(rates["eur"]["sell"], lang), "url": U("rates")})
        ticker.append({"label": "Minimumloon" if lang == "nl" else "Minimum wage",
                       "value": fmt_srd(facts.MIN_WAGE["hour"], lang, 2) + ("/uur" if lang == "nl" else "/h"),
                       "url": U("minwage")})
        ticker.append({"label": "Belastingvrij" if lang == "nl" else "Tax-free",
                       "value": fmt_srd(facts.TAX["free_month"], lang) + ("/mnd" if lang == "nl" else "/mo"),
                       "url": U("tax")})
        ticker.append({"label": "Open tenders", "value": str(tenders["count"]), "url": U("tenders")})
        if hol["next"]:
            ticker.append({"label": "Volgende vrije dag" if lang == "nl" else "Next holiday",
                           "value": f'{hol["next"]["name"]}, {fmt_date(hol["next"]["date"], lang, year=False)}'
                                    + ((" (verwacht)" if lang == "nl" else " (expected)") if hol["next"]["status"] == "expected" else ""),
                           "url": U("holidays")})

        for key, (nl_slug, en_slug, section) in PAGES.items():
            title, desc = META[key][li]
            canonical = SITE_URL + U(key)
            tpl = env.get_template(f"pages/{key}.html")
            nav = [{"label": (a if lang == "nl" else b), "url": U(k), "current": k == key} for a, b, k in NAV]
            footer = [{"label": (a if lang == "nl" else b), "links": [{"label": L(k), "url": U(k)} for k in keys]}
                      for a, b, keys in FOOTER_GROUPS]
            crumbs = None if key == "home" else [{"label": "Home", "url": U("home")}, {"label": L(key)}]
            ctx = dict(
                lang=lang, key=key, title=title, description=desc, canonical=canonical,
                alt_nl=SITE_URL + url_for(key, "nl"), alt_en=SITE_URL + url_for(key, "en"),
                lang_switch=url_for(key, "en" if lang == "nl" else "nl"),
                site_url=SITE_URL, home_url=U("home"), nav=nav, footer=footer, crumbs=crumbs,
                ticker=ticker, year=TODAY.year, build_id=build_id,
                built_sr=NOW_SR.strftime("%d-%m-%Y %H:%M"),
                schema=json.dumps({"@context": "https://schema.org", "@graph": schema_for(key, lang, title, desc, canonical)},
                                  ensure_ascii=False),
                U=U, L=L, num=lambda x, d=2: fmt_num(x, lang, d), srd=lambda x, d=0: fmt_srd(x, lang, d),
                date=lambda s, weekday=False, year=True: fmt_date(s, lang, weekday, year),
                ago=lambda s: fmt_ago(s, lang),
                F=facts, rates=rates, tenders=tenders, jobs=jobs, news=news, hol=hol,
                spark=spark_points, today=TODAY.isoformat(), contact_email=CONTACT_EMAIL,
                explore_url=EXPLORE_URL, tax_json=json.dumps(facts.TAX["brackets_month"]),
                holidays_json=json.dumps([h[0] for h in facts.HOLIDAYS]),
                tax_params=json.dumps(facts.TAX_JS), salary_py=py_salary,
                META_SUB={k: META[k][li][1] for k in META},
            )
            html_out = tpl.render(**ctx)
            path = os.path.join(OUT, file_for(key, lang))
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(html_out)
            sitemap.append((canonical, SITE_URL + url_for(key, "nl"), SITE_URL + url_for(key, "en")))

    # 404
    tpl = env.get_template("404.html")
    with open(os.path.join(OUT, "404.html"), "w", encoding="utf-8") as f:
        f.write(tpl.render(site_url=SITE_URL))

    # rate history CSV
    if rates:
        with open(os.path.join(OUT, "assets", "koers-historie.csv"), "w", encoding="utf-8") as f:
            f.write("date,usd_buy,usd_sell,eur_buy,eur_sell,source\n")
            for d, v in sorted(rates["history"]):
                f.write(f'{d},{v["usd"][0] or ""},{v["usd"][1] or ""},{v["eur"][0] or ""},{v["eur"][1] or ""},CME\n')

    # sitemap
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for loc, nl, en in sitemap:
        lines.append(f"<url><loc>{loc}</loc><lastmod>{TODAY.isoformat()}</lastmod>"
                     f'<xhtml:link rel="alternate" hreflang="nl" href="{nl}"/>'
                     f'<xhtml:link rel="alternate" hreflang="en" href="{en}"/></url>')
    lines.append("</urlset>")
    with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    with open(os.path.join(OUT, "CNAME"), "w") as f:
        f.write("surinamebusiness.com\n")
    with open(os.path.join(OUT, ".nojekyll"), "w") as f:
        f.write("")
    with open(os.path.join(OUT, "build.json"), "w") as f:
        json.dump({"built_at": NOW.replace(microsecond=0).isoformat(), "pages": len(sitemap)}, f)
    print(f"built {len(sitemap)} pages into _site/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
