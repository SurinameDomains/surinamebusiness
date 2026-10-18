"""Page registry and site-wide settings for surinamebusiness.com.

Every page exists in Dutch (root) and English (/en/). A page is a template in
templates/pages/<key>.html that renders both languages via the `lang` variable.
URLs are clean: the file is written as <slug>.html and linked as /<slug>
(GitHub Pages serves x.html at /x).
"""

SITE_URL = "https://surinamebusiness.com"
SITE_NAME = "Suriname Business"
PUBLISHER = "Explore group"
EXPLORE_URL = "https://exploresuriname.com"
CONTACT_EMAIL = "info@surinamebusiness.com"

# Vacancy board backend (Cloudflare Worker "sb-jobs" on the Suriname Business account, see worker/)
JOBS_API = "https://api.surinamebusiness.com"
TURNSTILE_SITEKEY = "0x4AAAAAAFZ5xMtNbyuItKi_"
POSTED_SOURCE = "Suriname Business"   # source name of vacancies posted directly on this site

# key: (nl_slug, en_slug, section)
PAGES = {
    "home": ("", "en/", "home"),
    "salary": ("netto-salaris-berekenen", "en/net-salary-calculator", "pay"),
    "tax": ("loonbelasting-2026", "en/suriname-income-tax-2026", "pay"),
    "overtime": ("overuren-berekenen", "en/overtime-calculator", "pay"),
    "minwage": ("minimumloon", "en/minimum-wage", "pay"),
    "vatcalc": ("btw-berekenen", "en/vat-calculator", "pay"),
    "rates": ("wisselkoers", "en/exchange-rates", "money"),
    "holidays": ("feestdagen", "en/public-holidays", "money"),
    "workdays": ("werkdagen-berekenen", "en/working-days-calculator", "money"),
    "tenders": ("aanbestedingen", "en/tenders", "tenders"),
    "jobs": ("vacatures", "en/jobs", "jobs"),
    "postjob": ("vacature-plaatsen", "en/post-a-job", "jobs"),
    "news": ("zakennieuws", "en/business-news", "news"),
    "oilgas": ("olie-en-gas", "en/oil-and-gas", "oilgas"),
    "supplier": ("leverancier-olie-en-gas", "en/oil-and-gas-supplier-guide", "oilgas"),
    "start": ("bedrijf-starten", "en/start-a-business", "guides"),
    "vatguide": ("btw-suriname", "en/vat-in-suriname", "guides"),
    "labour": ("arbeidsrecht", "en/labour-law-basics", "guides"),
    "guides": ("gidsen", "en/guides", "guides"),
    "workpermit": ("werkvergunning-suriname", "en/work-permit-suriname", "guides"),
    "import": ("importeren-suriname", "en/importing-into-suriname", "guides"),
    "incometax": ("inkomstenbelasting-suriname", "en/income-tax-return-suriname", "guides"),
    "land": ("grond-kopen-suriname", "en/buying-land-suriname", "guides"),
    "about": ("over-ons", "en/about", "trust"),
    "sources": ("bronnen", "en/sources", "trust"),
    "contact": ("contact", "en/contact", "trust"),
    "privacy": ("privacy", "en/privacy", "trust"),
    "companies": ("bedrijven/", "en/companies/", "companies"),
    "search": ("zoeken", "en/search", "trust"),  # rendered by build_company_pages
    "tools": ("tools", "en/tools", "tools"),
}

# free business tools (see tools_meta.py), one page per tool in both languages
from tools_meta import TOOLS as _TOOLS  # noqa: E402
for _t in _TOOLS:
    PAGES[_t["key"]] = (_t["nl"], _t["en"], "tools")
DYNAMIC = {"companies"}

NAV = [
    # (label_nl, label_en, page_key)
    ("Tools", "Tools", "tools"),
    ("Salaris", "Salary", "salary"),
    ("Aanbestedingen", "Tenders", "tenders"),
    ("Vacatures", "Jobs", "jobs"),
    ("Bedrijven", "Companies", "companies"),
    ("Koers", "Rates", "rates"),
    ("Olie & gas", "Oil & gas", "oilgas"),
    ("Gidsen", "Guides", "guides"),
]

FOOTER_GROUPS = [
    ("Geld & salaris", "Pay & money", ["salary", "tax", "overtime", "minwage", "vatcalc", "rates", "payslip", "hourly"]),
    ("Gratis tools", "Free tools", ["tools", "invoice", "quote", "receipt", "pricing", "importcost", "loan", "qrcode", "pdftools"]),
    ("Werk & handel", "Work & trade", ["tenders", "jobs", "postjob", "companies", "news", "holidays", "workdays"]),
    ("Gidsen", "Guides", ["start", "incometax", "vatguide", "import", "labour", "workpermit", "land", "supplier"]),
    ("Over", "About", ["about", "sources", "contact", "privacy"]),
]


def url_for(key: str, lang: str) -> str:
    nl, en, _ = PAGES[key]
    slug = nl if lang == "nl" else en
    return "/" + slug


def file_for(key: str, lang: str) -> str:
    nl, en, _ = PAGES[key]
    slug = nl if lang == "nl" else en
    if slug == "":
        return "index.html"
    if slug.endswith("/"):
        return slug + "index.html"
    return slug + ".html"
