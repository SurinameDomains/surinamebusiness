"""Extra page types and files for surinamebusiness.com: FAQ blocks, tender pages per buyer,
company pages per town, RSS feeds and the holiday calendar (.ics)."""
import datetime as dt
import html
import os
import re

import facts


def _srd(x, lang, dec=0):
    s = f"{x:,.{dec}f}"
    if lang == "nl":
        s = s.replace(",", "X").replace(".", ",").replace("X", ".")
    return "SRD " + s


# ---------------------------------------------------------------- FAQ (visible + FAQPage schema)
def faqs(key, lang, salary_py):
    nl = lang == "nl"
    T, M = facts.TAX, facts.MIN_WAGE
    r15 = salary_py(15000)
    mw = M['hour'] * 40 * 52 / 12
    rmw = salary_py(mw)
    data = {
        "salary": [
            (("Hoeveel is de belastingvrije som in 2026?", f"De belastingvrije som is {_srd(T['free_month'], lang)} per maand, {_srd(T['free_month']*12, lang)} per jaar. Over loon daaronder betaal je geen loonbelasting."),
             ("What is the tax-free amount in 2026?", f"The tax-free amount is {_srd(T['free_month'], lang)} per month, {_srd(T['free_month']*12, lang)} per year. No wage tax is due on pay below it.")),
            (("Wat is netto bij SRD 15.000 bruto?", f"Bij {_srd(15000, lang)} bruto per maand is je netto loon ongeveer {_srd(r15['net'], lang, 2)}: {_srd(r15['tax'], lang, 2)} loonbelasting en {_srd(r15['aov'], lang, 2)} AOV."),
             ("What is the net pay on SRD 15,000 gross?", f"On {_srd(15000, lang)} gross per month your net pay is about {_srd(r15['net'], lang, 2)}: {_srd(r15['tax'], lang, 2)} wage tax and {_srd(r15['aov'], lang, 2)} AOV.")),
            (("Hoeveel AOV-premie betaal ik?", "De AOV-premie is 4% van het zuiver loon (bruto min forfaitaire aftrek en eigen pensioenpremie), voor ingezetenen jonger dan 60 jaar."),
             ("How much AOV premium do I pay?", "The AOV premium is 4% of the net taxable wage (gross minus the flat deduction and your own pension premium), for residents under 60.")),
        ],
        "minwage": [
            (("Wat is het minimumloon in Suriname?", f"Het minimumuurloon is {_srd(M['hour'], lang, 2)} sinds 1 juli 2026. Bij 40 uur per week is dat ongeveer {_srd(M['hour']*40*52/12, lang)} per maand."),
             ("What is the minimum wage in Suriname?", f"The minimum hourly wage is {_srd(M['hour'], lang, 2)} since 1 July 2026. At 40 hours a week that is about {_srd(M['hour']*40*52/12, lang)} per month.")),
            (("Betaal je belasting over het minimumloon?", (f"Ja, een klein bedrag. Een volle werkweek tegen het minimumloon ({_srd(mw, lang)} per maand) komt na de forfaitaire aftrek net boven de belastingvrije som. Je betaalt ongeveer {_srd(rmw['tax'], lang)} loonbelasting en {_srd(rmw['aov'], lang)} AOV."
                                                        if rmw['tax'] > 0 else "Nee, een volle werkweek tegen het minimumloon blijft onder de belastingvrije som. Je betaalt alleen 4% AOV.")),
             ("Is the minimum wage taxed?", (f"Yes, a little. A full working week at the minimum wage ({_srd(mw, lang)} a month) ends up just above the tax-free amount after the flat deduction. Wage tax is about {_srd(rmw['tax'], lang)} plus {_srd(rmw['aov'], lang)} AOV."
                                             if rmw['tax'] > 0 else "No, a full working week at the minimum wage stays below the tax-free amount. Only the 4% AOV premium applies."))),
        ],
        "vatcalc": [
            (("Hoe hoog is de BTW in Suriname?", "Het algemene tarief is 10%. Water, elektriciteit, kookgas en binnenlands goederenvervoer vallen onder 5%, luxe goederen zoals grote auto's onder 25%. Export is 0%; onder meer het basispakket voeding, zorg, onderwijs en financiële diensten zijn vrijgesteld (sinds oktober 2023)."),
             ("What is the VAT rate in Suriname?", "The standard rate is 10%. Water, electricity, cooking gas and domestic freight are 5%, luxury goods such as large cars 25%. Exports are 0%; among others the basic food basket, healthcare, education and financial services are exempt (since October 2023).")),
            (("Wanneer moet ik me registreren voor BTW?", "Bij een belastbare omzet boven SRD 1.000.000 per kalenderjaar. Aangifte doe je maandelijks."),
             ("When do I have to register for VAT?", "Above SRD 1,000,000 taxable turnover per calendar year. Returns are filed monthly.")),
        ],
        "tax": [
            (("Wat zijn de loonbelasting tarieven in 2026?", "8% tot SRD 3.500, 18% tot SRD 7.000, 28% tot SRD 10.500 en 38% daarboven, per maand over het loon na de belastingvrije som van SRD 9.000."),
             ("What are the wage tax rates in 2026?", "8% up to SRD 3,500, 18% up to SRD 7,000, 28% up to SRD 10,500 and 38% above, per month on pay after the SRD 9,000 tax-free amount.")),
            (("Is vakantietoelage belast?", "Vakantietoelage en gratificatie zijn elk vrijgesteld tot één maandloon, met een maximum van SRD 19.500 per jaar."),
             ("Is holiday allowance taxed?", "Holiday allowance and bonus are each exempt up to one month's wage, capped at SRD 19,500 per year.")),
        ],
        "rates": [
            (("Wat is het verschil tussen aankoop en verkoop?", "De aankoopkoers krijg je als je dollars of euro's inlevert bij een cambio. De verkoopkoers betaal je als je ze koopt."),
             ("What is the difference between buy and sell?", "The buy rate is what you get when you hand in dollars or euros at a cambio. The sell rate is what you pay to buy them.")),
        ],
        "holidays": [
            (("Hoeveel officiële vrije dagen heeft Suriname?", "Suriname heeft 15 officiële vrije dagen volgens het Besluit Rustdagen. De islamitische, Hindoestaanse en Chinese feestdagen volgen de maan."),
             ("How many official public holidays does Suriname have?", "Suriname has 15 official days off under the Besluit Rustdagen. Islamic, Hindu and Chinese holidays follow the lunar calendar.")),
        ],
    }
    items = data.get(key, [])
    return [q[0] if nl else q[1] for q in items]


def faq_schema(qa):
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}


# ---------------------------------------------------------------- tender buyers
def buyer_slug(t):
    s = t["source"]
    if s == "gov.sr":
        b = t["buyer"].replace("Ministerie van ", "")
        return "ministerie-" + re.sub(r"[^a-z0-9]+", "-", b.lower().replace("&", "en")).strip("-")[:50], t["buyer"]
    return {"Staatsolie": ("staatsolie", "Staatsolie"), "IDB": ("idb", "IDB (Inter-American Development Bank)"),
            "World Bank": ("wereldbank", "World Bank")}.get(s, (re.sub(r"\W+", "-", s.lower()), s))


def tender_buyers(tenders):
    groups = {}
    for t in tenders["items"]:
        slug, name = buyer_slug(t)
        groups.setdefault(slug, {"slug": slug, "name": name, "items": []})["items"].append(t)
    return sorted(groups.values(), key=lambda g: -len(g["items"]))


# ---------------------------------------------------------------- feeds and calendar
def _rss(title, link, desc, items, path):
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<rss version="2.0"><channel>',
           f"<title>{html.escape(title)}</title><link>{link}</link><description>{html.escape(desc)}</description>"]
    for it in items[:80]:
        d = it.get("published") or it.get("deadline")
        pub = ""
        if d:
            try:
                pub = dt.datetime.fromisoformat(d[:10]).strftime("%a, %d %b %Y 12:00:00 -0300")
            except Exception:
                pass
        extra = []
        if it.get("buyer") or it.get("employer"):
            extra.append(it.get("buyer") or it.get("employer"))
        if it.get("deadline"):
            extra.append("Sluit / closes " + it["deadline"])
        link = it["url"] if not it["url"].startswith("/") else _SITE + it["url"]
        out.append(f"<item><title>{html.escape(it['title'])}</title><link>{html.escape(link)}</link>"
                   f"<guid isPermaLink=\"false\">{html.escape(it['id'])}</guid>"
                   + (f"<pubDate>{pub}</pubDate>" if pub else "")
                   + f"<description>{html.escape(' · '.join(extra))}</description></item>")
    out.append("</channel></rss>")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))


_SITE = "https://surinamebusiness.com"


def write_feeds(out_dir, site, tenders, jobs):
    global _SITE
    _SITE = site
    _rss("Aanbestedingen Suriname | Suriname Business", site + "/aanbestedingen",
         "Alle open aanbestedingen in Suriname: overheid, Staatsolie, IDB en Wereldbank.",
         tenders["items"], os.path.join(out_dir, "feeds", "aanbestedingen.xml"))
    _rss("Vacatures Suriname | Suriname Business", site + "/vacatures",
         "Vacatures bij de overheid, grote werkgevers en internationale organisaties in Suriname.",
         jobs["items"], os.path.join(out_dir, "feeds", "vacatures.xml"))


def write_ics(out_dir):
    now = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Suriname Business//Feestdagen//NL",
             "CALSCALE:GREGORIAN", "X-WR-CALNAME:Feestdagen Suriname", "X-WR-TIMEZONE:America/Paramaribo"]
    for d, nl, en, status in facts.HOLIDAYS:
        day = dt.date.fromisoformat(d)
        nxt = day + dt.timedelta(days=1)
        lines += ["BEGIN:VEVENT", f"UID:{d}-{re.sub(r'[^a-z0-9]', '', nl.lower())}@surinamebusiness.com",
                  f"DTSTAMP:{now}", f"DTSTART;VALUE=DATE:{day:%Y%m%d}", f"DTEND;VALUE=DATE:{nxt:%Y%m%d}",
                  f"SUMMARY:{nl}{' (verwacht)' if status == 'expected' else ''}", "TRANSP:TRANSPARENT", "END:VEVENT"]
    lines.append("END:VCALENDAR")
    with open(os.path.join(out_dir, "assets", "feestdagen-suriname.ics"), "w", encoding="utf-8", newline="") as f:
        f.write("\r\n".join(lines) + "\r\n")
