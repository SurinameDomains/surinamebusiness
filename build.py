#!/usr/bin/env python3
"""Build surinamebusiness.com into _site/.

Reads facts.py (hand-checked values) and data/live/*.json (written by fetch.py),
renders templates/pages/<key>.html in Dutch (root) and English (/en/).
Self-contained: no data or files from any other site are used.
"""
from markupsafe import Markup
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import sys

from jinja2 import Environment, FileSystemLoader, select_autoescape

import facts
import extras
import tools_meta as TM
import guides_meta as GM
import resources_data as RES
import quality
import tool_notes as TN
from site_config import (INDEXNOW_KEY, DYNAMIC, ACCOUNT_API, GOOGLE_CLIENT_ID, PRIVATE_PAGES, CONTACT_EMAIL, JOBS_API, POSTED_SOURCE, TURNSTILE_SITEKEY, EXPLORE_URL, FOOTER_GROUPS, MENU, PAGES, SITE_URL,
                         file_for, url_for)

ROOT = os.path.dirname(os.path.abspath(__file__))
# local testing only: point the post form at a local worker
JOBS_API = os.environ.get("JOBS_API") or JOBS_API
TURNSTILE_SITEKEY = os.environ.get("TURNSTILE_SITEKEY") or TURNSTILE_SITEKEY
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
    "rates": ("Wisselkoers vandaag", "Exchange rates today"),
    "holidays": ("Feestdagen 2026 en 2027", "Public holidays 2026 and 2027"),
    "workdays": ("Werkdagen berekenen", "Working days calculator"),
    "tenders": ("Aanbestedingen", "Tenders"),
    "jobs": ("Vacatures", "Jobs"),
    "postjob": ("Vacature plaatsen", "Post a job"),
    "news": ("Zakennieuws", "Business news"),
    "oilgas": ("Olie en gas: GranMorgu", "Oil and gas: GranMorgu"),
    "supplier": ("Leverancier worden in olie en gas", "Become an oil and gas supplier"),
    "start": ("Een bedrijf starten", "Start a business"),
    "vatguide": ("BTW in Suriname", "VAT in Suriname"),
    "labour": ("Arbeidsrecht: de basis", "Labour law basics"),
    "guides": ("Alle gidsen", "All guides"),
    "workpermit": ("Werkvergunning en verblijf", "Work and residence permits"),
    "import": ("Goederen importeren", "Importing goods"),
    "incometax": ("Inkomstenbelasting en aangifte", "Income tax and returns"),
    "land": ("Grond en huis kopen", "Buying land and property"),
    "about": ("Over ons", "About us"),
    "sources": ("Bronnen en methode", "Sources and method"),
    "contact": ("Contact", "Contact"),
    "privacy": ("Privacy", "Privacy"),
    "terms": ("Voorwaarden", "Terms"),
    "account": ("Mijn account", "My account"),
    "admin": ("Beheer", "Admin"),
    "companies": ("Bedrijvengids", "Business directory"),
    "search": ("Zoeken", "Search"),
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
    "rates": (("Wisselkoers Suriname vandaag: dollarkoers bij CME, CBvS en alle banken",
               "De koers van de dollar en de euro in SRD vandaag: cambio (CME), Centrale Bank (CBvS), Finabank, Hakrinbank, DSB, Republic Bank en Godo naast elkaar, plus douanekoers en omrekenen."),
              ("Suriname exchange rate today: USD to SRD at CME, CBvS and every bank",
               "Today's US dollar and euro rate in SRD: exchange office (CME), Central Bank (CBvS), Finabank, Hakrinbank, DSB, Republic Bank and Godo side by side, plus customs rate and converter.")),
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
    "postjob": (("Gratis vacature plaatsen in Suriname",
                 "Plaats gratis een vacature op Suriname Business. Kandidaten solliciteren direct bij jou, je vacature verschijnt ook in Google."),
                ("Post a job in Suriname for free",
                 "Post a vacancy for free on Suriname Business. Candidates apply directly with you, and your vacancy also shows in Google.")),
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
    "guides": (("Gidsen voor ondernemers en werkgevers in Suriname: 26 onderwerpen",
                "Gidsen met bronnen over een bedrijf starten, vergunningen, BTW en belastingen, personeel, ontslag, import, export, investeren, financiering en grond in Suriname."),
               ("Guides for doing business in Suriname: 26 topics",
                "Sourced guides on starting a business, licences, VAT and taxes, hiring, dismissal, importing, exporting, investing, financing and land in Suriname.")),
    "workpermit": (("Werkvergunning Suriname: aanvragen, kosten en vrijstellingen",
                    "Zo vraag je een werkvergunning en verblijfsvergunning aan in Suriname: wie aanvraagt, documenten, USD 100 leges, 30 dagen beslistermijn en wie is vrijgesteld (PSA, CARICOM)."),
                   ("Suriname work permit: how to apply, fees and exemptions",
                    "How to get a work permit and residence permit in Suriname: who applies, documents, USD 100 fee, 30-day decision and who is exempt (PSA, CARICOM).")),
    "import": (("Importeren in Suriname: douane, invoerrechten en BTW",
                "Goederen importeren in Suriname: ASYCUDA, FIN nummer, douane-expediteur, CARICOM invoerrechten, 10% BTW, vergunningen en de regels voor gebruikte auto's."),
               ("Importing into Suriname: customs, duties and VAT",
                "Importing goods into Suriname: ASYCUDA, FIN number, customs broker, CARICOM duties, 10% VAT, licences and the rules for used cars.")),
    "incometax": (("Inkomstenbelasting Suriname: aangifte, termijnen en tarieven",
                   "Voorlopige aangifte voor 15 april, definitieve aangifte binnen 4 maanden, tarieven 8% tot 38%, 36% voor NV's en 25% dividendbelasting. Online via de Belastingdienst."),
                  ("Suriname income tax: returns, deadlines and rates",
                   "Provisional return by 15 April, final return within 4 months, rates 8% to 38%, 36% for companies and 25% dividend tax. Filed online with the tax office.")),
    "land": (("Grond kopen in Suriname: grondhuur, eigendom en overdrachtsbelasting",
              "Domeingrond, grondhuur of eigendom, conversie van grondhuur naar eigendom, 4% overdrachtsbelasting, notaris en kadaster. Ook voor wie uit het buitenland koopt."),
             ("Buying land in Suriname: lease, ownership and transfer tax",
              "State land, land lease or freehold, converting lease to ownership, 4% transfer tax, notary and land registry. Also for buyers from abroad.")),
    "search": (("Zoeken op Suriname Business", "Zoek in alle rekentools, gidsen, aanbestedingen, vacatures en bedrijven."),
               ("Search Suriname Business", "Search all calculators, guides, tenders, jobs and companies.")),
    "about": (("Over Suriname Business", "Wie achter Suriname Business zit, hoe we onze cijfers controleren en waarom alle tools gratis zijn voor ondernemers in Suriname."),
              ("About Suriname Business", "Who is behind Suriname Business, how we check our numbers and why all tools are free for businesses in Suriname.")),
    "sources": (("Bronnen en methode", "Waar onze cijfers vandaan komen: CBvS, CME, Belastingdienst, gov.sr en meer, met hoe vaak we elke bron bijwerken en controleren."),
                ("Sources and method", "Where our numbers come from: CBvS, CME, the tax office, gov.sr and more, with how often we update and check each source.")),
    "contact": (("Contact Suriname Business", "Neem contact op met Suriname Business voor vragen, correcties, bedrijfsgegevens, vacatures of samenwerking. We reageren per e-mail."),
                ("Contact Suriname Business", "Get in touch with Suriname Business for questions, corrections, business listings, vacancies or partnerships. We reply by email.")),
    "privacy": (("Privacyverklaring Suriname Business", "Hoe Suriname Business met gegevens omgaat: tools werken in je browser, wat een account opslaat en welke cookies en statistieken we gebruiken."),
                ("Privacy policy Suriname Business", "How Suriname Business handles data: tools run in your browser, what an account stores and which cookies and statistics we use.")),
    "terms": (("Gebruiksvoorwaarden Suriname Business", "De voorwaarden voor de tools, een account, vacatures en bedrijfsvermeldingen, en hoe je een nepvacature of foute vermelding meldt."),
              ("Terms of use Suriname Business", "The terms for the tools, an account, vacancies and business listings, and how to report a fake vacancy or a wrong listing.")),
    "account": (("Mijn account", "Je documenten, klanten, bedrijfsgegevens en vacatures op Suriname Business."),
                ("My account", "Your documents, customers, business details and vacancies on Suriname Business.")),
    "admin": (("Beheer", "Beheer van Suriname Business."), ("Admin", "Suriname Business admin.")),
}


LABELS["tools"] = ("Gratis zakelijke tools", "Free business tools")
LABELS["douane"] = ("Douanekoers", "Customs exchange rate")
LABELS["outages"] = ("Stroomonderbrekingen EBS", "EBS power outages")
META["outages"] = (("Stroomonderbreking EBS vandaag en morgen: gepland onderhoud per wijk",
                    "Waar en wanneer EBS de stroom onderbreekt voor gepland onderhoud: datum, tijd, district en straten. Elke 30 minuten gecontroleerd."),
                   ("EBS power outage Suriname today and tomorrow: planned maintenance by area",
                    "Where and when EBS cuts power for planned maintenance: date, time, district and streets. Checked every 30 minutes."))
LABELS["gold"] = ("Goudprijs en olieprijs", "Gold and oil price")
LABELS["addbiz"] = ("Bedrijf aanmelden", "Add your business")
META["addbiz"] = (("Bedrijf aanmelden in de bedrijvengids van Suriname, gratis",
                   "Zet je bedrijf gratis in de bedrijvengids van Suriname Business, of werk je adres, telefoon en openingstijden bij. We controleren elke aanmelding."),
                  ("Add your business to the Suriname business directory, free",
                   "List your business for free in the Suriname Business directory, or update your address, phone and opening hours. We check every listing."))
META["douane"] = (("Douanekoers Suriname vandaag: dollar, euro en 20 andere valuta",
                   "De actuele douanekoers van de Centrale Bank (CBvS) voor invoeraangiftes: USD, EUR en 20 andere valuta, geldigheid, volgende lijst en verloop."),
                  ("Suriname customs exchange rate today: USD, EUR and 20 more",
                   "The current customs exchange rate (douanekoers) set by the Central Bank for import declarations: USD, EUR and 20 more currencies, validity and next list."))
META["gold"] = (("Goudprijs vandaag in SRD en USD, goudcertificaten en olieprijs",
                 "De goudprijs per gram en per ounce in USD en SRD, de CBvS goudcertificaten, zilver en de olieprijs (Brent en WTI). Met een rekentool voor de waarde van je goud."),
                ("Gold price today in SRD and USD, gold certificates and oil price",
                 "The gold price per gram and per ounce in USD and SRD, CBvS gold certificates, silver and the oil price (Brent and WTI). With a calculator for the value of your gold."))
LABELS["maxprices"] = ("Maximumprijzen basisgoederen", "Maximum prices of basic goods")
LABELS["contacts"] = ("Overheidsinstanties en contact", "Government offices and contacts")
LABELS["bankaccount"] = ("Zakelijke bankrekening openen", "Opening a business bank account")
LABELS["hiring"] = ("Personeel aannemen", "Hiring staff")
META["maxprices"] = (("Maximumprijzen basisgoederen Suriname: actuele prijslijst EZOTI",
                      "De officiële maximumprijzen van basisgoederen zoals suiker, rijst, aardappelen, uien, babyvoeding en luiers, per importeur. Doorzoekbaar en elke dag gecontroleerd."),
                     ("Maximum prices of basic goods in Suriname: current EZOTI list",
                      "The official maximum prices of basic goods such as sugar, potatoes, onions, baby food and diapers, per importer. Searchable and checked daily."))
META["contacts"] = (("Belastingdienst, douane, KKF en ministeries: adressen en telefoon",
                     "Adressen, telefoonnummers, openingstijden en online portalen van de Belastingdienst, douane, KKF en het ministerie van Economische Zaken, voor ondernemers in Suriname."),
                    ("Tax office, customs, KKF and ministries in Suriname: addresses and phone",
                     "Addresses, phone numbers, opening hours and online portals of the tax office, customs, the chamber of commerce (KKF) and the Ministry of Economic Affairs."))
META["bankaccount"] = (("Zakelijke bankrekening openen in Suriname: documenten en stappen",
                        "Welke documenten je nodig hebt voor een zakelijke rekening bij een Surinaamse bank: KKF uittreksel, ID, UBO verklaring, statuten en vergunning."),
                       ("Opening a business bank account in Suriname: documents and steps",
                        "Which documents you need for a business account at a Surinamese bank: KKF extract, ID, UBO declaration, articles and licence."))
META["hiring"] = (("Personeel aannemen in Suriname: wat moet je regelen als werkgever?",
                   "Inschrijven als werkgever, loonbelasting en AOV inhouden, minimumloon, werktijden, vakantiedagen, loonstrook en de maandelijkse aangifte. Met rekentools."),
                  ("Hiring staff in Suriname: what an employer has to arrange",
                   "Registering as an employer, withholding wage tax and AOV, minimum wage, working hours, annual leave, payslips and the monthly return. With calculators."))
META["tools"] = (("Gratis zakelijke tools voor Suriname: factuur, offerte, loonstrook en meer",
                  "Meer dan 45 gratis tools voor ondernemers in Suriname: factuur en offerte maken, loonstrook, BTW-register, invoerkosten, lening, QR-code, PDF samenvoegen. Zonder account."),
                 ("Free business tools for Suriname: invoice, quote, payslip and more",
                  "Over 45 free tools for doing business in Suriname: invoice and quote generator, payslip, VAT register, import cost, loan, QR code, PDF merge. No account needed."))
for _k, _g in GM.GUIDES.items():
    LABELS[_k] = _g["label"]
    META[_k] = _g["meta"]
for _t in TM.TOOLS:
    LABELS[_t["key"]] = _t["label"]
    META[_t["key"]] = (_t["meta_nl"], _t["meta_en"])
TOOL_KEYS = {t["key"] for t in TM.TOOLS}


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


def upcoming_deadlines(lang, n=3):
    """The next tax dates, same rules as the deadlines tool (assets/tools/office.js): VAT by the 15th and wage tax/AOV
    by the 10th of the following month; income tax on fixed days. Built every 30 minutes, so always current."""
    nl = lang == "nl"
    mn = MONTHS[lang]
    items = []
    y, m = TODAY.year, TODAY.month - 1
    for i in range(-1, 4):
        py, pm = y + (m + i) // 12, (m + i) % 12
        ny, nm = (py + 1, 0) if pm == 11 else (py, pm + 1)
        per = mn[pm] if py == TODAY.year else f"{mn[pm]} {py}"
        items.append((dt.date(ny, nm + 1, 10), "Loonbelasting en AOV" if nl else "Wage tax and AOV", per, "wage"))
        items.append((dt.date(ny, nm + 1, 15), "BTW-aangifte en betaling" if nl else "VAT return and payment", per, "vat"))
    for yy in (y, y + 1):
        for md, tnl, ten in (((2, 15), "Verlaging voorlopige aanslag vragen", "Request a lower provisional assessment"),
                             ((4, 15), "Voorlopige aangifte IB, 1e termijn", "Provisional income tax, 1st instalment"),
                             ((4, 30), "Definitieve aangifte IB (personen)", "Final income tax return (individuals)"),
                             ((6, 30), "Definitieve aangifte bedrijven", "Final return for companies"),
                             ((7, 15), "Inkomstenbelasting, 2e termijn", "Income tax, 2nd instalment"),
                             ((10, 15), "Inkomstenbelasting, 3e termijn", "Income tax, 3rd instalment"),
                             ((12, 31), "Inkomstenbelasting, 4e termijn", "Income tax, 4th instalment")):
            items.append((dt.date(yy, *md), tnl if nl else ten, str(yy), "ib"))
    items = sorted(x for x in items if x[0] >= TODAY)[:n]
    return [{"date": d.isoformat(), "day": d.day, "mon": mn[d.month - 1][:3], "title": t, "period": p, "kind": k,
             "days": (d - TODAY).days} for d, t, p, k in items]


def spark_points(series, w=300, h=56):
    vals = [v for _, v in series]
    if len(vals) < 3:
        return ""
    lo, hi = min(vals), max(vals)
    if hi - lo < 0.01:
        return ""  # a flat line tells nothing
    rng = hi - lo
    pts = []
    for i, v in enumerate(vals):
        x = i * (w / (len(vals) - 1))
        y = h - 4 - (v - lo) / rng * (h - 8)
        pts.append(f"{x:.1f},{y:.1f}")
    return " ".join(pts)


def tenders_view():
    t = load("tenders.json", {"items": [], "sources": {}})
    items = t.get("items", [])
    own = []
    for c in SBC["items"]:
        if c["kind"] != "tender":
            continue
        d = c.get("data") or {}
        own.append({"id": "sb-" + c["id"], "title": c["title"], "buyer": d.get("buyer") or c.get("source") or "Suriname Business",
                     "deadline": d.get("deadline") or c.get("ends"), "published": (c.get("created_at") or "")[:10],
                     "url": c.get("url") or SITE_URL, "source": "Suriname Business", "lang": "nl"})
    items = own + quality.dedupe_tenders(items)
    for it in items:
        it["days_left"] = days_until(it.get("deadline"))
    return {"items": items, "sources": t.get("sources", {}), "fetched_at": t.get("fetched_at"),
            "count": len(items), "stale": hours_old(t.get("fetched_at")) > 48}


def jobs_view():
    j = load("jobs.json", {"items": []})
    items = [it for it in j.get("items", []) if not (it.get("deadline") and days_until(it["deadline"]) < 0)]
    for it in items:
        it["days_left"] = days_until(it.get("deadline"))
        it["posted"] = it.get("source") == POSTED_SOURCE
        it["ext"] = not it["posted"]
    return {"items": items, "fetched_at": j.get("fetched_at"), "stale": hours_old(j.get("fetched_at")) > 48}


def news_view():
    n = load("news.json", {"business": [], "oil": []})
    fresh = hours_old(n.get("fetched_at")) < 48
    business = [it for it in n.get("business", []) if quality.local_business(it.get("title"))] if fresh else []
    oil = [it for it in n.get("oil", []) if quality.local_business(it.get("title"), oil=True)] if fresh else []
    # own news items from the admin panel go first
    own = [{"title": c["title"], "url": c.get("url") or SITE_URL, "source": c.get("source") or "Suriname Business",
            "published": c.get("created_at"), "econ": True, "own": True} for c in SBC["items"] if c["kind"] == "news"]
    return {"business": own + business, "oil": oil,
            "fetched_at": n.get("fetched_at"), "sources": n.get("sources", {})}


def sbcontent_view():
    """Banners, news, tenders, notices and settings managed in the admin panel (sb-api /public/content)."""
    c = load("sbcontent.json", {"items": [], "settings": {}})
    items = [it for it in c.get("items", []) if it.get("kind") in ("banner", "news", "tender", "notice", "link", "company")]
    return {"items": items, "settings": c.get("settings") or {}, "fetched_at": c.get("fetched_at")}


SBC = {"items": [], "settings": {}}


def _cgroups():
    import companies as C
    return [(k, v[1], v[3]) for k, v in C.GROUPS.items()]


CGROUPS = _cgroups()


NL_MON = {"jan": 1, "feb": 2, "maa": 3, "mrt": 3, "mar": 3, "apr": 4, "mei": 5, "may": 5, "jun": 6, "jul": 7,
          "aug": 8, "sep": 9, "okt": 10, "oct": 10, "nov": 11, "dec": 12}


def period_dates(text):
    """'05 september 2026 - 18 September 2026' -> (date, date) or (None, None)."""
    found = []
    for d, m, y in re.findall(r"(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})", text or ""):
        mo = NL_MON.get(m[:3].lower())
        if mo:
            try:
                found.append(dt.date(int(y), mo, int(d)))
            except ValueError:
                pass
    return (found[0], found[-1]) if len(found) >= 2 else (None, None)


def maxprices_view():
    m = load("maxprices.json", None)
    if not m or not m.get("rows"):
        return None
    start, end = period_dates(m.get("period"))
    groups = {}
    for r in m["rows"]:
        base = r["product"].split(":")[0].strip()
        groups.setdefault(base, []).append(r)
    cats = sorted(groups.items(), key=lambda x: x[0].lower())
    return {**m, "start": start.isoformat() if start else None, "end": end.isoformat() if end else None,
            "current": bool(end and end >= TODAY), "groups": cats, "count": len(m["rows"]),
            "json": json.dumps([[r["product"], r["importer"], r["r_pack"], r["r_price"], r["w_pack"], r["w_price"]] for r in m["rows"]],
                               ensure_ascii=False).replace("</", "<\\/")}


CUR_NAMES = {
    "USD": ("Amerikaanse dollar", "US dollar"), "EUR": ("Euro", "Euro"), "GBP": ("Brits pond", "British pound"),
    "XCG": ("Caribische gulden", "Caribbean guilder"), "AWG": ("Arubaanse florin", "Aruban florin"),
    "BRL": ("Braziliaanse real", "Brazilian real"), "TTD": ("Trinidad en Tobago dollar", "Trinidad and Tobago dollar"),
    "BBD": ("Barbadiaanse dollar", "Barbados dollar"), "XCD": ("Oost-Caribische dollar", "East Caribbean dollar"),
    "GYD": ("Guyaanse dollar", "Guyana dollar"), "CNY": ("Chinese yuan", "Chinese yuan"),
}


def market_view(rates):
    import markets
    cb = load("cbvs.json", None)
    dk = load("douanekoers.json", None)
    bk = load("banks.json", None)
    co = load("commodities.json", None)
    out = {"cbvs": None, "douane": None, "banks": [], "comm": None}
    if cb and cb.get("rates"):
        order = ["USD", "EUR", "GBP", "XCG", "AWG", "BRL", "TTD", "BBD", "XCD", "GYD", "CNY"]
        ordered = {k: cb["rates"][k] for k in order if k in cb["rates"]}
        ordered.update({k: v for k, v in cb["rates"].items() if k not in ordered})
        out["cbvs"] = dict(cb, rates=ordered, stale=hours_old(cb.get("fetched_at")) > 72, age_h=hours_old(cb.get("fetched_at")))
    if dk and dk.get("rates"):
        eff = dt.date.fromisoformat(dk["effective"])
        prev = dk["history"][0] if dk.get("history") else None
        rows = []
        for code, v in dk["rates"].items():
            per1 = v["sell"] / v["unit"]
            rows.append({"code": code, "unit": v["unit"], "sell": v["sell"], "per1": per1,
                         "name": markets.DOUANE_NAMES.get(code, (code, code))})
        first = ["USD", "EUR", "GBP", "XCG", "AWG", "CNY", "BRL"]
        rows.sort(key=lambda r: (first.index(r["code"]) if r["code"] in first else 99, r["code"]))
        out["douane"] = dict(dk, rows=rows, prev=prev, current=dt.date.fromisoformat(dk["period_end"]) >= TODAY,
                             usd=dk["rates"]["USD"]["sell"], eur=dk["rates"].get("EUR", {}).get("sell"))
    if bk and bk.get("banks"):
        banks = bk["banks"]
        best = {}
        for cur in ("usd", "eur"):
            best[cur] = (max(b[cur][0] for b in banks), min(b[cur][1] for b in banks))
        out["banks"] = banks
        out["best"] = best
    if co:
        out["comm"] = co
    # converter sources: {key: [label, {CUR: [buy, sell]}]}
    src = {}
    if rates:
        src["cme"] = ["CME (cash)", {"USD": [rates["usd"]["buy"], rates["usd"]["sell"]], "EUR": [rates["eur"]["buy"], rates["eur"]["sell"]]}]
    if out["cbvs"]:
        src["cbvs"] = ["CBvS (giraal)", {k: v["giraal"] for k, v in cb["rates"].items()}]
        src["cbvsc"] = ["CBvS (bankpapier)", {k: v["cash"] for k, v in cb["rates"].items()}]
    for b in out["banks"]:
        src[b["key"]] = [b["name"], {"USD": b["usd"], "EUR": b["eur"]}]
    if out["douane"]:
        src["douane"] = ["Douanekoers", {r["code"]: [round(r["per1"], 6), round(r["per1"], 6)] for r in out["douane"]["rows"]}]
    out["src_json"] = json.dumps(src, ensure_ascii=False)
    out["cur_names"] = CUR_NAMES
    return out


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


# ---------------------------------------------------------------- "Op deze pagina" for long guides
_H2 = re.compile(r"<h2(\s[^>]*)?>(.*?)</h2>", re.S)
_TAG = re.compile(r"<[^>]+>")


NL_MONTHS = {"januari": "January", "februari": "February", "maart": "March", "april": "April", "mei": "May",
             "juni": "June", "juli": "July", "augustus": "August", "september": "September", "oktober": "October",
             "november": "November", "december": "December"}
_NL_DATE = re.compile(r"\((\d{1,2} )?(" + "|".join(NL_MONTHS) + r")( \d{4})\)")


def en_dates(html):
    """Source lists are shared by both languages and carry dates like "(9 mei 2026)"; on English pages
    the date in brackets is written in English."""
    return _NL_DATE.sub(lambda m: "(" + (m.group(1) or "") + NL_MONTHS[m.group(2)] + m.group(3) + ")", html)


def add_toc(html, lang):
    """Long prose pages (4+ h2, no calculator or form) get a compact list of their sections after the lead.
    Done at build time so the list is in the first paint (no layout shift)."""
    if 'class="prose"' not in html or 'class="card calc' in html or 'class="result' in html or 'id="tool-list"' in html or 'data-filter-list' in html:
        return html
    lead_end = html.find("</p>", html.find('<p class="lead">')) if '<p class="lead">' in html else -1
    if lead_end < 0:
        return html
    foot = html.find('<footer class="site-foot">')
    tail = html[foot:] if foot > lead_end else ""
    body = html[lead_end:foot] if foot > lead_end else html[lead_end:]
    heads = [m for m in _H2.finditer(body)]
    if len(heads) < 4:
        return html
    items, out, pos, n = [], [], 0, 0
    for m in heads:
        n += 1
        attrs = m.group(1) or ""
        text = _TAG.sub("", m.group(2)).strip()
        if not text:
            continue
        if 'id="' in attrs:
            hid = re.search(r'id="([^"]+)"', attrs).group(1)
            new = m.group(0)
        else:
            hid = f"s-{n}"
            new = f'<h2 id="{hid}"{attrs}>{m.group(2)}</h2>'
        items.append((hid, text))
        out.append(body[pos:m.start()]); out.append(new); pos = m.end()
    out.append(body[pos:])
    label = "Op deze pagina" if lang == "nl" else "On this page"
    links = "".join(f'<li><a href="#{h}">{t}</a></li>' for h, t in items)
    # wide screens: a list in the right margin that follows the reader; narrow screens: a closed list that opens on tap
    nav = (f'<nav class="toc" aria-label="{label}"><div class="toc-in"><div class="eyebrow">{label}</div><ul>'
           + links + "</ul></div></nav>"
           + f'<details class="toc-m"><summary>{label} <span class="sub">({len(items)})</span></summary><ul>' + links + "</ul></details>")
    rest = "".join(out)[4:]
    # key figures right after the lead stay first; the list goes after them
    m = re.match(r'\s*<div class="(today[^"]*|grid[^"]*|tldr[^"]*)"', rest)
    if m:
        start, depth, end = m.end(0) - len(m.group(0).lstrip()), 0, -1
        for t in re.finditer(r"<div\b|</div>", rest[start:]):
            depth += -1 if t.group(0) == "</div>" else 1
            if depth == 0:
                end = start + t.end()
                break
        if end > 0 and ('class="big' in rest[start:end] or m.group(1).startswith(("today", "tldr"))):
            return html[:lead_end + 4] + rest[:end] + nav + rest[end:] + tail
    return html[:lead_end + 4] + nav + rest + tail


# ---------------------------------------------------------------- schema
def schema_for(key, lang, meta_title, desc, canonical):
    org = {"@type": "Organization", "@id": SITE_URL + "/#org", "name": "Suriname Business",
           "url": SITE_URL + "/", "logo": SITE_URL + "/assets/icon-512.png",
           "email": CONTACT_EMAIL_SCHEMA,
           "parentOrganization": {"@type": "Organization", "name": "Explore group"}}
    page = {"@type": "WebPage", "@id": canonical + "#page", "url": canonical, "name": meta_title,
            "description": desc, "inLanguage": "nl" if lang == "nl" else "en",
            "isPartOf": {"@id": SITE_URL + "/#site"}, "dateModified": LASTMOD_TOKEN}
    graph = [org, {"@type": "WebSite", "@id": SITE_URL + "/#site", "url": SITE_URL + "/",
                   "name": "Suriname Business", "publisher": {"@id": SITE_URL + "/#org"}}, page]
    if key in ("salary", "overtime", "vatcalc", "workdays") or key in TOOL_KEYS:
        graph.append({"@type": "WebApplication", "name": LABELS[key][0 if lang == "nl" else 1],
                      "applicationCategory": "BusinessApplication" if key in TOOL_KEYS else "FinanceApplication", "operatingSystem": "Any",
                      "url": canonical, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}})
    # BreadcrumbList is added in render(), from the same crumbs the visitor sees
    return graph


PAGE_VOLATILE_PATTERNS = [r"\?v=\d{8,}", r"<span class=\"tnum\">[^<]*</span> SRT"]
LASTMOD_TOKEN = "@@LASTMOD@@"
PAGE_DATES_FILE = os.path.join(LIVE, "page_dates.json")
try:
    PAGE_DATES = json.load(open(PAGE_DATES_FILE, encoding="utf-8"))
except Exception:
    PAGE_DATES = {}
PAGE_DATES_NEW = {}
VOLATILE = [re.compile(p) for p in PAGE_VOLATILE_PATTERNS]


def page_lastmod(url, html_out):
    """lastmod = the day the page content last changed, not the build day. Google ignores lastmod
    on sites where it changes on every build, so it has to be honest to be useful."""
    norm = html_out
    for rx in VOLATILE:
        norm = rx.sub("", norm)
    h = hashlib.sha1(norm.encode("utf-8")).hexdigest()[:16]
    old = PAGE_DATES.get(url)
    day = old[1] if old and old[0] == h else TODAY.isoformat()
    PAGE_DATES_NEW[url] = [h, day]
    return day
CONTACT_EMAIL_SCHEMA = CONTACT_EMAIL


def breadcrumb_schema(crumbs, canonical):
    """BreadcrumbList built from the visible breadcrumb, so the two never disagree."""
    items = []
    for i, c in enumerate(crumbs):
        items.append({"@type": "ListItem", "position": i + 1,
                      "name": "Suriname Business" if i == 0 else c["label"],
                      "item": (SITE_URL + c["url"]) if c.get("url") and i < len(crumbs) - 1 else canonical})
    return {"@type": "BreadcrumbList", "itemListElement": items}


def complete_graph(graph, lang, title, desc, canonical):
    """Every page gets the site Organization and WebSite, a full WebPage node and one BreadcrumbList."""
    base = schema_for("_", lang, title, desc, canonical)  # org, website, webpage
    types = [g.get("@type") for g in graph]
    out = [g for g in graph if g.get("@type") != "BreadcrumbList"]
    if "Organization" not in types:
        out.insert(0, base[0])
    if "WebSite" not in types:
        out.insert(1, base[1])
    for g in out:
        if g.get("@type") == "WebPage":
            for k, v in base[2].items():
                g.setdefault(k, v)
    return out



# ---------------------------------------------------------------- programmatic pages
CF_BEACON = "14f5303c07304c89bef2bbe3a980e6fe"
GA_ID = "G-PWMQ9KJ81H"  # Google Analytics 4, property "Suriname Business"
SALARY_AMOUNTS = (list(range(6000, 20001, 1000)) + list(range(22500, 50001, 2500))
                  + [60000, 75000, 100000, 125000, 150000])

TOWNS = [("Paramaribo", 5.852, -55.203), ("Lelydorp", 5.700, -55.233), ("Nieuw Nickerie", 5.927, -56.973),
         ("Moengo", 5.617, -54.400), ("Albina", 5.497, -54.054), ("Wageningen", 5.766, -56.689),
         ("Totness", 5.883, -56.317), ("Groningen", 5.797, -55.484), ("Onverwacht", 5.590, -55.193),
         ("Brokopondo", 5.057, -54.981), ("Domburg", 5.703, -55.083), ("Meerzorg", 5.812, -55.150),
         ("Zanderij", 5.453, -55.187), ("Paranam", 5.613, -55.100), ("Nieuw Amsterdam", 5.884, -55.087),
         ("Apoera", 5.188, -57.183), ("Brownsweg", 5.012, -55.170)]


def nearest_town(lat, lon):
    if lat is None or lon is None:
        return ""
    best, bd = "", 1e9
    for n, a, b in TOWNS:
        d = (lat - a) ** 2 + ((lon - b) * 0.995) ** 2
        if d < bd:
            best, bd = n, d
    return best if bd ** 0.5 * 111 < 18 else ""


def merge_listings(recs, C):
    """Businesses that added or corrected their own listing (admin-checked, sb-api kind "company").
    A listing with `replaces` updates that OpenStreetMap entry; otherwise it is a new entry with its own page."""
    by_slug = {r["slug"]: r for r in recs if r.get("slug")}
    used = set(by_slug) | set(C.REDIRECTS)
    for c in SBC["items"]:
        if c.get("kind") != "company":
            continue
        d = c.get("data") or {}
        fields = {"name": c.get("title") or "", "group": d.get("group") if d.get("group") in C.GROUPS else "",
                  "kind": d.get("kind") or "", "street": d.get("street") or "", "place": d.get("place") or "",
                  "phone": d.get("phone") or "", "website": c.get("url") or None, "email": d.get("email") or None,
                  "hours": d.get("hours") or None, "whatsapp": re.sub(r"[^0-9]", "", d.get("whatsapp") or "") or None,
                  "about": c.get("body") or ""}
        if fields["whatsapp"] and len(fields["whatsapp"]) == 7:
            fields["whatsapp"] = "597" + fields["whatsapp"]     # local Suriname number
        target = by_slug.get(d.get("replaces") or "")
        if target:
            for k, v in fields.items():
                if v:
                    target[k] = v
            target["own"] = True
            target["page"] = True
            continue
        if len(fields["name"]) < 2 or not fields["group"]:
            continue
        r = dict(fields, brand=None, operator=None, lat=None, lon=None, osm=None, district="", own=True, page=True)
        base = C.slugify(r["name"] + (" " + r["place"] if r["place"] else ""))
        slug = base if base not in used else base + "-sb"
        used.add(slug)
        r["slug"] = slug
        recs.append(r)
    recs.sort(key=lambda x: x["name"].lower())


def companies_view():
    import companies as C
    try:
        raw = json.load(open(os.path.join(LIVE, "companies_raw.json"), encoding="utf-8"))
    except Exception:
        return {"recs": [], "groups": [], "fetched_at": None}
    recs = C.normalise(raw)
    for r in recs:
        if not r["place"]:
            r["place"] = nearest_town(r["lat"], r["lon"])
    merge_listings(recs, C)
    groups = []
    for g, (nls, nll, ens, enl) in C.GROUPS.items():
        items = [r for r in recs if r["group"] == g]
        if items:
            groups.append({"key": g, "nl_slug": nls, "nl": nll, "en_slug": ens, "en": enl, "items": items,
                           "count": len(items), "pages": sum(1 for r in items if r["page"])})
    groups.sort(key=lambda x: (x["key"] in ("other", "services"), -x["count"]))  # catch-alls last
    return {"recs": recs, "groups": groups, "fetched_at": raw.get("fetched_at"),
            "count": len(recs), "pages": sum(1 for r in recs if r["page"])}


def _town_pages(render, lang, U, co):
    import companies as C
    nl = lang == "nl"
    for gr in co["groups"]:
        if gr["key"] == "other":
            continue
        by = {}
        for r in gr["items"]:
            if r["place"]:
                by.setdefault(r["place"], []).append(r)
        towns = []
        for town, items in sorted(by.items(), key=lambda x: -len(x[1])):
            if len(items) < 8:
                continue
            ts = C.slugify(town)
            towns.append((town, ts, len(items)))
            label = gr["nl"] if nl else gr["en"]
            t = f"{label} in {town} ({len(items)})"
            d = (f"{len(items)} adressen voor {label.lower()} in {town}, met adres, telefoon en openingstijden waar bekend."
                 if nl else f"{len(items)} listings for {label.lower()} in {town}, with address, phone and opening hours where known.")
            crumbs = [{"label": "Home", "url": U("home")},
                      {"label": "Bedrijven" if nl else "Companies", "url": "/bedrijven/" if nl else "/en/companies/"},
                      {"label": label, "url": f"/bedrijven/{gr['nl_slug']}" if nl else f"/en/companies/{gr['en_slug']}"},
                      {"label": town}]
            sub = dict(gr, items=items, count=len(items))
            render("company_cat.html", "companies", t, d, f"/bedrijven/{gr['nl_slug']}-{ts}",
                   f"/en/companies/{gr['en_slug']}-{ts}", crumbs, extra={"gr": sub, "town": town, "parent": gr})
        gr["towns"] = towns


def build_salary_pages(render, lang, U, L):
    for i, g in enumerate(SALARY_AMOUNTS):
        r = py_salary(g)
        r5 = py_salary(g, 5)
        nl_path, en_path = f"/netto-salaris/{g}", f"/en/net-salary/{g}"
        if lang == "nl":
            title = f"Netto salaris bij SRD {fmt_num(g, 'nl', 0)} bruto per maand (2026)"
            desc = (f"SRD {fmt_num(g, 'nl', 0)} bruto is netto SRD {fmt_num(r['net'], 'nl', 2)} per maand in 2026: "
                    f"loonbelasting SRD {fmt_num(r['tax'], 'nl', 2)} en AOV SRD {fmt_num(r['aov'], 'nl', 2)}.")
        else:
            title = f"Net salary for SRD {fmt_num(g, 'en', 0)} gross per month in Suriname (2026)"
            desc = (f"SRD {fmt_num(g, 'en', 0)} gross is SRD {fmt_num(r['net'], 'en', 2)} net per month in 2026: "
                    f"wage tax SRD {fmt_num(r['tax'], 'en', 2)} and AOV SRD {fmt_num(r['aov'], 'en', 2)}.")
        prev_g = SALARY_AMOUNTS[i - 1] if i else None
        next_g = SALARY_AMOUNTS[i + 1] if i + 1 < len(SALARY_AMOUNTS) else None
        crumbs = [{"label": "Home", "url": U("home")}, {"label": L("salary"), "url": U("salary")},
                  {"label": f"SRD {fmt_num(g, lang, 0)}"}]
        render("salary_amount.html", "salary", title, desc, nl_path, en_path, crumbs,
               extra={"g": g, "r": r, "r5": r5, "prev_g": prev_g, "next_g": next_g})


def _nearby(pool, r, lab, n=6):
    """Up to n businesses in the same town from other categories, one per category first, stable per page."""
    others = [o for o in pool if o["group"] != r["group"] and o["slug"] != r["slug"]]
    if not others:
        return []
    h = int(hashlib.md5(r["slug"].encode()).hexdigest()[:6], 16)
    others = others[h % len(others):] + others[:h % len(others)]
    seen, pick = set(), []
    for o in others:
        if o["group"] not in seen:
            seen.add(o["group"]); pick.append(o)
        if len(pick) == n:
            break
    return [{"slug": o["slug"], "name": o["name"], "cat": lab[o["group"]], "street": o["street"]} for o in pick]


def build_company_pages(render, lang, U, L, co):
    if not co["recs"]:
        return
    _town_pages(render, lang, U, co)
    nl = lang == "nl"
    title = ("Bedrijvengids Suriname: " if nl else "Suriname business directory: ") + \
            (f"{co['count']} bedrijven per categorie" if nl else f"{co['count']} businesses by category")
    desc = ("Zoek bedrijven in Suriname op categorie: supermarkten, autoonderdelen, banken, apotheken, "
            "bouwmaterialen en meer, met adres, telefoon en openingstijden." if nl else
            "Find businesses in Suriname by category: supermarkets, car parts, banks, pharmacies, building "
            "materials and more, with address, phone and opening hours.")
    crumbs = [{"label": "Home", "url": U("home")}, {"label": "Bedrijven" if nl else "Companies"}]
    lab = {g["key"]: (g["nl"] if nl else g["en"]) for g in co["groups"]}
    cat_url = {g["key"]: ("/bedrijven/" + g["nl_slug"] if nl else "/en/companies/" + g["en_slug"]) for g in co["groups"]}
    search = []
    for r in co["recs"]:
        url = (("/bedrijf/" if nl else "/en/company/") + r["slug"]) if r["page"] else cat_url[r["group"]]
        meta = " · ".join(x for x in [lab[r["group"]], r["street"], r["place"]] if x)
        search.append([r["name"], meta, url])
    for g in co["groups"]:
        search.append([lab[g["key"]], f'{g["count"]}', cat_url[g["key"]]])
    # the directory search list (about 2,500 rows) is a separate file, fetched on first use: the page itself stays small
    with open(os.path.join(OUT, "assets", f"companies-{lang}.json"), "w", encoding="utf-8") as f:
        json.dump(search, f, ensure_ascii=False, separators=(",", ":"))
    render("companies.html", "companies", title, desc, "/bedrijven/", "/en/companies/", crumbs,
           extra={"co": dict(co, search_json="")})
    # "Ook in <plaats>": other businesses with their own page in the same town, from other categories
    by_place = {}
    for r in co["recs"]:
        if r["page"] and r["place"]:
            by_place.setdefault(r["place"], []).append(r)
    for gr in co["groups"]:
        label = gr["nl"] if nl else gr["en"]
        t = f"{label} in Suriname ({gr['count']})"
        d = (f"{gr['count']} adressen in de categorie {label.lower()} in Suriname, met telefoon, adres en "
             "openingstijden waar bekend." if nl else
             f"{gr['count']} listings for {label.lower()} in Suriname, with phone, address and opening hours where known.")
        crumbs = [{"label": "Home", "url": U("home")}, {"label": "Bedrijven" if nl else "Companies",
                   "url": "/bedrijven/" if nl else "/en/companies/"}, {"label": label}]
        namecount = {}
        for r in gr["items"]:
            if r["page"]:
                namecount[(r["name"].lower(), r["place"])] = namecount.get((r["name"].lower(), r["place"]), 0) + 1
        # a category with one or two businesses is a thin page: it stays for visitors, out of search engines
        render("company_cat.html", "companies", t, d, f"/bedrijven/{gr['nl_slug']}", f"/en/companies/{gr['en_slug']}",
               crumbs, extra={"gr": gr}, robots="noindex,follow" if gr["count"] < 3 else None)
        for r in gr["items"]:
            if not r["page"]:
                continue
            place = f", {r['place']}" if r["place"] else ""
            where = (f", {r['street']}" if r["street"] and namecount[(r["name"].lower(), r["place"])] > 1 else "") + place
            t = f"{r['name']}{where}: " + ("adres, telefoon en openingstijden" if nl else "address, phone and opening hours")
            if len(t) > 62:
                t = f"{r['name']}{where}: " + ("adres en telefoon" if nl else "address and phone")
            bits = [x for x in [r["street"], r["place"], r["phone"]] if x]
            d = f"{r['name']} ({label.lower()}){place}. " + " · ".join(bits)
            crumbs = [{"label": "Home", "url": U("home")},
                      {"label": "Bedrijven" if nl else "Companies", "url": "/bedrijven/" if nl else "/en/companies/"},
                      {"label": label, "url": f"/bedrijven/{gr['nl_slug']}" if nl else f"/en/companies/{gr['en_slug']}"},
                      {"label": r["name"]}]
            canonical = SITE_URL + (f"/bedrijf/{r['slug']}" if nl else f"/en/company/{r['slug']}")
            lb = {"@type": "LocalBusiness", "@id": canonical + "#business", "name": r["name"], "url": canonical}
            if r["phone"]:
                lb["telephone"] = r["phone"]
            if r["street"] or r["place"]:
                lb["address"] = {k: v for k, v in {"@type": "PostalAddress", "streetAddress": r["street"],
                                 "addressLocality": r["place"], "addressCountry": "SR"}.items() if v}
            if r["lat"]:
                lb["geo"] = {"@type": "GeoCoordinates", "latitude": r["lat"], "longitude": r["lon"]}
            if r["website"]:
                lb["sameAs"] = [r["website"]]
            if r["hours"]:
                lb["openingHours"] = r["hours"]
            graph = [{"@type": "WebPage", "url": canonical, "name": t, "inLanguage": lang,
                      "mainEntity": {"@id": canonical + "#business"}}, lb]
            # a listing with only opening hours is too thin for search engines: the page stays for
            # visitors and site search, but is kept out of Google and the sitemap
            thin = not (r["phone"] or r["website"] or r["email"])
            render("company.html", "companies", t, d, f"/bedrijf/{r['slug']}", f"/en/company/{r['slug']}", crumbs,
                   extra={"r": r, "gr": gr, "nearby": _nearby(by_place.get(r["place"], []), r, lab)},
                   graph=graph, robots="noindex,follow" if thin else None)

# ---------------------------------------------------------------- posted vacancies
JOB_TYPES = {"FULL_TIME": ("Fulltime", "Full-time"), "PART_TIME": ("Parttime", "Part-time"),
             "TEMPORARY": ("Tijdelijk", "Temporary"), "CONTRACTOR": ("Freelance / opdracht", "Freelance / contract"),
             "INTERN": ("Stage", "Internship")}
LOCATION_EN = {"Remote": "Remote"}
LOCATION_NL = {"Remote": "Op afstand"}


def desc_html(text):
    """Plain text from the posting form to safe HTML: blank lines split paragraphs, '- ' lines become lists."""
    from markupsafe import escape
    out = []
    for block in [b for b in (text or "").split("\n\n") if b.strip()]:
        lines = [ln.rstrip() for ln in block.split("\n") if ln.strip()]
        para, items = [], []

        def flush_para():
            if para:
                out.append("<p>" + "<br>".join(str(escape(x)) for x in para) + "</p>")
                para.clear()

        def flush_items():
            if items:
                out.append("<ul>" + "".join(f"<li>{escape(x)}</li>" for x in items) + "</ul>")
                items.clear()
        for ln in lines:
            st = ln.strip()
            if st[:2] in ("- ", "* ", "• ") or st[:1] == "•":
                flush_para()
                items.append(st.lstrip("-*• ").strip())
            else:
                flush_items()
                para.append(st)
        flush_para()
        flush_items()
    return "\n".join(out)


def job_schema(j, canonical):
    loc = j.get("location") or "Paramaribo"
    js = {"@type": "JobPosting", "title": j["title"], "description": desc_html(j["description"]),
          "identifier": {"@type": "PropertyValue", "name": "Suriname Business", "value": j["id"]},
          "datePosted": j["published"], "validThrough": j["deadline"] + "T23:59:59-03:00",
          "employmentType": j["employment_type"], "url": canonical, "directApply": False,
          "hiringOrganization": {"@type": "Organization", "name": j["employer"]}}
    if j.get("employer_url"):
        js["hiringOrganization"]["sameAs"] = j["employer_url"]
    if loc == "Remote":
        js["jobLocationType"] = "TELECOMMUTE"
        js["applicantLocationRequirements"] = {"@type": "Country", "name": "Suriname"}
    else:
        js["jobLocation"] = {"@type": "Place", "address": {"@type": "PostalAddress", "addressRegion": loc,
                                                           "addressLocality": loc, "addressCountry": "SR"}}
    if j.get("salary_min") or j.get("salary_max"):
        v = {"@type": "QuantitativeValue", "unitText": j.get("salary_period") or "MONTH"}
        if j.get("salary_min") and j.get("salary_max"):
            v.update(minValue=j["salary_min"], maxValue=j["salary_max"])
        else:
            v["value"] = j.get("salary_min") or j.get("salary_max")
        js["baseSalary"] = {"@type": "MonetaryAmount", "currency": j.get("salary_currency") or "SRD", "value": v}
    return js


def build_job_pages(render, lang, U, L, jobs):
    nl = lang == "nl"
    for j in jobs["items"]:
        if not j.get("posted") or (j.get("lang") or "nl") != lang:
            continue
        path = j["url"]
        canonical = SITE_URL + path
        loc = (LOCATION_NL if nl else LOCATION_EN).get(j["location"], j["location"])
        title = f"{j['title']} bij {j['employer']} ({loc})" if nl else f"{j['title']} at {j['employer']} ({loc})"
        first = " ".join(j["description"].split())[:150]
        where = ("op afstand" if nl else "remote") if j["location"] == "Remote" else ("in " + loc)
        desc = (f"Vacature {j['title']} bij {j['employer']}, {where}. Solliciteer voor {fmt_date(j['deadline'], 'nl')}. "
                if nl else f"Job: {j['title']} at {j['employer']}, {where}. Apply by {fmt_date(j['deadline'], 'en')}. ") + first
        desc = desc[:300]
        crumbs = [{"label": "Home", "url": U("home")}, {"label": L("jobs"), "url": U("jobs")}, {"label": j["title"]}]
        graph = [{"@type": "WebPage", "url": canonical, "name": title, "inLanguage": lang},
                 {"@type": "BreadcrumbList", "itemListElement": [
                     {"@type": "ListItem", "position": 1, "name": "Suriname Business", "item": SITE_URL + U("home")},
                     {"@type": "ListItem", "position": 2, "name": L("jobs"), "item": SITE_URL + U("jobs")},
                     {"@type": "ListItem", "position": 3, "name": j["title"], "item": canonical}]},
                 job_schema(j, canonical)]
        other = url_for("jobs", "en" if nl else "nl")
        similar = [o for o in jobs["items"] if o is not j][:6]
        render("job.html", "jobs", title, desc, path if nl else other, other if nl else path, crumbs,
               extra={"j": j, "loc": loc, "body": desc_html(j["description"]), "similar": similar,
                      "lang_switch": other}, graph=graph, single=True)


# ---------------------------------------------------------------- header menu
def build_menu(lang, cur):
    li = 0 if lang == "nl" else 1
    out, found = [], False
    for key, lnl, len_, cols in MENU:
        item = {"key": key, "label": lnl if li == 0 else len_, "cols": []}
        if key == "tools":
            keys = {"tools"} | TOOL_KEYS
            for g, gnl, gen in TM.GROUPS:
                links = [k for k in [t["key"] for t in TM.TOOLS if t["group"] == g] + TM.EXISTING.get(g, [])]
                item["cols"].append({"label": gnl if li == 0 else gen,
                                     "links": [{"label": LABELS[k][li], "url": url_for(k, lang), "current": k == cur} for k in links]})
            item["all"] = {"label": ("Alle %d gratis tools" if li == 0 else "All %d free tools") % TM.TOTAL,
                           "url": url_for("tools", lang)}
        else:
            keys = set()
            for cnl, cen, ks in cols:
                keys |= set(ks)
                item["cols"].append({"label": cnl if li == 0 else cen,
                                     "links": [{"label": LABELS[k][li], "url": url_for(k, lang), "current": k == cur} for k in ks]})
            if key == "guides":
                item["all"] = {"label": "Alle gidsen" if li == 0 else "All guides", "url": url_for("guides", lang)}
                keys.add("guides")
            if key == "trade":
                keys |= {"companies"}
        item["current"] = (not found) and (cur in keys)
        found = found or item["current"]
        out.append(item)
    return out


# ---------------------------------------------------------------- render
def main():
    build_id = NOW.strftime("%Y%m%d%H%M")
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(OUT, "assets"))

    env = Environment(loader=FileSystemLoader(os.path.join(ROOT, "templates")),
                      autoescape=select_autoescape(["html"]), trim_blocks=True, lstrip_blocks=True)

    SBC.update(sbcontent_view())
    rates = rates_view()
    tenders = tenders_view()
    jobs = jobs_view()
    news = news_view()
    co = companies_view()
    maxp = maxprices_view()
    mkt = market_view(rates)
    outages = load("ebs_outages.json", None)
    buyers = extras.tender_buyers(tenders)
    sitemap = []
    search_index = {"nl": [], "en": []}

    for lang in ("nl", "en"):
        li = 0 if lang == "nl" else 1
        hol = holidays_view(lang)
        nl_lang = lang == "nl"
        U = lambda k, _l=lang: url_for(k, _l)
        L = lambda k, _li=li: LABELS[k][_li]
        env.globals.update({})
        ticker = []
        if rates and not rates["stale"]:
            ticker.append({"label": "USD", "value": fmt_num(rates["usd"]["sell"], lang), "url": U("rates")})
            ticker.append({"label": "EUR", "value": fmt_num(rates["eur"]["sell"], lang), "url": U("rates")})
        ticker.append({"label": "Vacatures" if lang == "nl" else "Jobs", "value": str(len(jobs["items"])),
                       "url": U("jobs")})
        ticker.append({"label": "Belastingvrij" if lang == "nl" else "Tax-free",
                       "value": fmt_srd(facts.TAX["free_month"], lang) + ("/mnd" if lang == "nl" else "/mo"),
                       "url": U("tax")})
        ticker.append({"label": "Open tenders", "value": str(tenders["count"]), "url": U("tenders")})
        if hol["next"]:
            ticker.append({"label": "Volgende vrije dag" if lang == "nl" else "Next holiday",
                           "value": f'{hol["next"]["name"]}, {fmt_date(hol["next"]["date"], lang, year=False)}'
                                    + ((" (verwacht)" if lang == "nl" else " (expected)") if hol["next"]["status"] == "expected" else ""),
                           "url": U("holidays")})

        footer = [{"label": (a if lang == "nl" else b), "links": [{"label": L(k), "url": U(k)} for k in keys]}
                  for a, b, keys in FOOTER_GROUPS]
        common = dict(
            lang=lang, site_url=SITE_URL, home_url=U("home"), footer=footer, ticker=ticker, year=TODAY.year,
            build_id=build_id, built_sr=NOW_SR.strftime("%d-%m-%Y %H:%M"),
            U=U, L=L, num=lambda x, d=2, _l=lang: fmt_num(x, _l, d), srd=lambda x, d=0, _l=lang: fmt_srd(x, _l, d),
            date=lambda s, weekday=False, year=True, _l=lang: fmt_date(s, _l, weekday, year),
            ago=lambda s, _l=lang: fmt_ago(s, _l),
            F=facts, rates=rates, tenders=tenders, jobs=jobs, news=news, hol=hol, co=co,
            spark=spark_points, deadlines=upcoming_deadlines(lang), today=TODAY.isoformat(), contact_email=CONTACT_EMAIL,
            explore_url=EXPLORE_URL, holidays_json=json.dumps([h[0] for h in facts.HOLIDAYS]),
            tax_params=json.dumps(facts.TAX_JS), salary_py=py_salary, salary_amounts=SALARY_AMOUNTS,
            META_SUB={k: META[k][li][1] for k in META}, cf_beacon=CF_BEACON, ga_id=GA_ID,
            jobs_api=JOBS_API, turnstile_sitekey=TURNSTILE_SITEKEY, max_deadline=(TODAY + dt.timedelta(days=60)).isoformat(),
            min_deadline=(TODAY + dt.timedelta(days=1)).isoformat(), default_deadline=(TODAY + dt.timedelta(days=30)).isoformat(),
            recent=(TODAY - dt.timedelta(days=2)).isoformat(),
            etype=lambda k, _l=lang: JOB_TYPES.get(k, (k, k))[0 if _l == "nl" else 1],
            TM=TM, RES=RES, tool_icon=TM.icon, kicon=lambda k, size=20: Markup(TM.kicon(k, size)), gicon=lambda g: Markup(TM.icon(TM.GROUP_ICON.get(g, "calc"), 20)), maxp=maxp, mkt=mkt, outages=outages, labour_json=json.dumps(facts.LABOUR_JS),
            rates_json=json.dumps({"usd": rates["usd"], "eur": rates["eur"], "date": rates["business_date"]} if rates else None),
            account_api=ACCOUNT_API, google_client_id=GOOGLE_CLIENT_ID, dev_login=bool(os.environ.get("SB_DEV_LOGIN")),
            sbc=SBC, settings=SBC["settings"], cgroups=CGROUPS,
            page_keys=[k for k in PAGES if k not in DYNAMIC and k not in PRIVATE_PAGES],
            tool_keys=sorted({t["key"] for t in TM.TOOLS} | {k for v in TM.EXISTING.values() for k in v}),
            guide_keys=sorted(k for k, v in PAGES.items() if v[2] == "guides"),
            banners=[b for b in SBC["items"] if b["kind"] == "banner" and b.get("lang") in ("all", lang, None)],
            notices=[b for b in SBC["items"] if b["kind"] == "notice" and b.get("lang") in ("all", lang, None)],
            own_links=[b for b in SBC["items"] if b["kind"] == "link" and b.get("lang") in ("all", lang, None)],
            ctext=lambda c, f="title", _l=lang: (c.get(f + "_en") or c.get(f)) if _l == "en" else c.get(f),
        )

        def render(tpl_name, nav_key, title, desc, path_nl, path_en, crumbs=None, extra=None, graph=None,
                   robots=None, in_sitemap=True, single=False, _lang=lang, _common=common):
            canonical = SITE_URL + (path_nl if _lang == "nl" else path_en)
            if len(title) > 62 and title.endswith(" | Suriname Business"):
                title = title[:-len(" | Suriname Business")]   # the brand suffix only where it fits in a result
            nav = build_menu(_lang, nav_key)
            ctx = dict(_common)
            ctx.update(key=nav_key, title=title, description=desc, canonical=canonical,
                       alt_nl=SITE_URL + path_nl, alt_en=SITE_URL + path_en,
                       lang_switch=path_en if _lang == "nl" else path_nl, nav=nav, crumbs=crumbs, robots=robots)
            g = complete_graph(graph or schema_for(nav_key, _lang, title, desc, canonical), _lang, title, desc, canonical)
            if crumbs:
                g.append(breadcrumb_schema(crumbs, canonical))
            ctx["schema"] = json.dumps({"@context": "https://schema.org", "@graph": g},
                                       ensure_ascii=False).replace("<", "\\u003c")
            if single:
                ctx.update(alt_nl=None, alt_en=None)
            if extra:
                ctx.update(extra)
            html_out = add_toc(env.get_template(tpl_name).render(**ctx), _lang)
            if _lang == "en":
                html_out = en_dates(html_out)
            lastmod = page_lastmod(canonical, html_out)
            html_out = html_out.replace(LASTMOD_TOKEN, lastmod)
            rel = (path_nl if _lang == "nl" else path_en).lstrip("/")
            rel = "index.html" if rel == "" else (rel + "index.html" if rel.endswith("/") else rel + ".html")
            path = os.path.join(OUT, rel)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(html_out)
            if in_sitemap and not robots:
                sitemap.append((canonical, None, None, lastmod) if single else
                               (canonical, SITE_URL + path_nl, SITE_URL + path_en, lastmod))
            kind = tpl_name.split("/")[-1][:-5]
            if nav_key in PRIVATE_PAGES or (robots and "noindex" in robots and kind != "company"):
                return
            search_index[_lang].append([title.split(":")[0] if kind == "company" else title,
                                        (path_nl if _lang == "nl" else path_en), kind])

        if lang == "nl":
            render_nl = render
        for key in PAGES:
            if key in DYNAMIC:
                continue
            title, desc = META[key][li]
            crumbs = None if key == "home" else [{"label": "Home", "url": U("home")}, {"label": L(key)}]
            faq = (extras.faqs(key, lang, py_salary) or TM.faqs(key, lang) or GM.faqs(key, lang) or []) + TN.faqs(key, lang)
            graph = schema_for(key, lang, title, desc, SITE_URL + U(key))
            if faq:
                graph.append(extras.faq_schema(faq))
            render(f"pages/{key}.html", key, title, desc, url_for(key, "nl"), url_for(key, "en"), crumbs,
                   extra={"faq": faq, "buyers": buyers, "tool": TM.BY_KEY.get(key), "note": TN.note(key, lang)}, graph=graph,
                   robots="noindex,follow" if key == "search" else ("noindex,nofollow" if key in PRIVATE_PAGES else None))

        for b in buyers:
            if len(b["items"]) < 2:
                continue
            t = (f"Aanbestedingen {b['name']}: {len(b['items'])} open" if nl_lang else
                 f"{b['name']} tenders: {len(b['items'])} open")
            d = (f"Alle open aanbestedingen van {b['name']} in Suriname, met publicatie- en sluitingsdatum. Dagelijks bijgewerkt."
                 if nl_lang else f"All open tenders from {b['name']} in Suriname, with publication and closing dates. Updated daily.")
            crumbs = [{"label": "Home", "url": U("home")}, {"label": L("tenders"), "url": U("tenders")}, {"label": b["name"]}]
            render("tender_buyer.html", "tenders", t, d, f"/aanbesteder/{b['slug']}", f"/en/tender-buyer/{b['slug']}",
                   crumbs, extra={"b": b})

        build_salary_pages(render, lang, U, L)
        build_job_pages(render, lang, U, L, jobs)
        build_company_pages(render, lang, U, L, co)
        # merged duplicate listings: old URL forwards to the listing we kept (GitHub Pages has no 301)
        import companies as C
        for dup, keep in C.REDIRECTS.items():
            pre = "/bedrijf/" if lang == "nl" else "/en/company/"
            target = SITE_URL + pre + keep
            os.makedirs(os.path.join(OUT, pre.strip("/")), exist_ok=True)
            with open(os.path.join(OUT, pre.strip("/"), dup + ".html"), "w", encoding="utf-8") as f:
                f.write(f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>Redirect</title>'
                        f'<link rel="canonical" href="{target}">'
                        f'<meta http-equiv="refresh" content="0; url={target}"></head>'
                        f'<body><a href="{target}">{target}</a></body></html>')

    # 404: a real page with the full header, drawer, tab bar and search (GitHub Pages serves /404.html)
    render_nl("404.html", "home", "Pagina niet gevonden | Suriname Business", "Deze pagina bestaat niet.",
              "/404", "/404", robots="noindex", in_sitemap=False, single=True)

    kind_rank = {"salary_amount": 3, "company": 4, "company_cat": 2, "tender_buyer": 2}
    for lg, rows in search_index.items():
        rows.sort(key=lambda r: kind_rank.get(r[2], 0))
        for t in tenders["items"]:
            rows.append([t["title"], t["url"], "tender"])
        for j in jobs["items"]:
            rows.append([j["title"] + " (" + (j.get("employer") or "") + ")", j["url"], "job"])
        with open(os.path.join(OUT, "assets", f"search-{lg}.json"), "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, separators=(",", ":"))
    extras.write_feeds(OUT, SITE_URL, tenders, jobs)
    extras.write_ics(OUT)

    # rate history CSV
    if rates:
        with open(os.path.join(OUT, "assets", "koers-historie.csv"), "w", encoding="utf-8") as f:
            f.write("date,usd_buy,usd_sell,eur_buy,eur_sell,source\n")
            for d, v in sorted(rates["history"]):
                f.write(f'{d},{v["usd"][0] or ""},{v["usd"][1] or ""},{v["eur"][0] or ""},{v["eur"][1] or ""},CME\n')

    # sitemap
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for loc, nl, en, lm in sitemap:
        if nl is None:
            lines.append(f"<url><loc>{loc}</loc><lastmod>{lm}</lastmod></url>")
            continue
        lines.append(f"<url><loc>{loc}</loc><lastmod>{lm}</lastmod>"
                     f'<xhtml:link rel="alternate" hreflang="nl" href="{nl}"/>'
                     f'<xhtml:link rel="alternate" hreflang="en" href="{en}"/></url>')
    lines.append("</urlset>")
    with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    # IndexNow: pages whose content changed into today (each URL at most once a day). The first
    # build without page_dates.json queues every page. indexnow.py posts the list after deploy.
    queue = [loc for loc, _nl, _en, lm in sitemap
             if lm == TODAY.isoformat() and (PAGE_DATES.get(loc) or [None, None])[1] != lm]
    with open(os.path.join(LIVE, "indexnow_queue.json"), "w", encoding="utf-8") as f:
        json.dump({"built_at": NOW.replace(microsecond=0).isoformat(), "urls": queue}, f, indent=0)
    with open(os.path.join(OUT, INDEXNOW_KEY + ".txt"), "w") as f:
        f.write(INDEXNOW_KEY)
    with open(PAGE_DATES_FILE + ".tmp", "w", encoding="utf-8") as f:
        json.dump(PAGE_DATES_NEW, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    os.replace(PAGE_DATES_FILE + ".tmp", PAGE_DATES_FILE)
    with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    if os.path.exists(os.path.join(ROOT, "assets", "favicon.ico")):
        shutil.copyfile(os.path.join(ROOT, "assets", "favicon.ico"), os.path.join(OUT, "favicon.ico"))
    with open(os.path.join(OUT, "CNAME"), "w") as f:
        f.write("surinamebusiness.com\n")
    with open(os.path.join(OUT, ".nojekyll"), "w") as f:
        f.write("")
    with open(os.path.join(OUT, "build.json"), "w") as f:
        json.dump({"built_at": NOW.replace(microsecond=0).isoformat(), "pages": len(sitemap)}, f)
    # data freshness for the admin panel
    status = {"built_at": NOW.replace(microsecond=0).isoformat(), "pages": len(sitemap), "feeds": {}}
    for fn in sorted(os.listdir(os.path.join(ROOT, "data", "live"))):
        if not fn.endswith(".json") or fn.endswith("_history.json"):
            continue
        d = load(fn, {})
        if not isinstance(d, dict):
            continue
        fa = d.get("fetched_at") or max([v.get("fetched_at") for v in d.values()
                                         if isinstance(v, dict) and isinstance(v.get("fetched_at"), str)] or [None])
        status["feeds"][fn[:-5]] = {"fetched_at": fa, "checked_at": d.get("checked_at"),
                                    "age_h": round(hours_old(fa), 1) if fa else None,
                                    "sources": {k: {"ok": v.get("ok"), "count": v.get("count"), "error": v.get("error")}
                                                for k, v in (d.get("sources") or {}).items() if isinstance(v, dict)}}
    with open(os.path.join(OUT, "status.json"), "w") as f:
        json.dump(status, f)
    print(f"built {len(sitemap)} pages into _site/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
