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
    "news": ("zakennieuws", "en/business-news", "news"),
    "oilgas": ("olie-en-gas", "en/oil-and-gas", "oilgas"),
    "supplier": ("leverancier-olie-en-gas", "en/oil-and-gas-supplier-guide", "oilgas"),
    "start": ("bedrijf-starten", "en/start-a-business", "guides"),
    "vatguide": ("btw-suriname", "en/vat-in-suriname", "guides"),
    "labour": ("arbeidsrecht", "en/labour-law-basics", "guides"),
    "guides": ("gidsen", "en/guides", "guides"),
    "about": ("over-ons", "en/about", "trust"),
    "sources": ("bronnen", "en/sources", "trust"),
    "contact": ("contact", "en/contact", "trust"),
    "privacy": ("privacy", "en/privacy", "trust"),
}

NAV = [
    # (label_nl, label_en, page_key)
    ("Salaris", "Salary", "salary"),
    ("Aanbestedingen", "Tenders", "tenders"),
    ("Vacatures", "Jobs", "jobs"),
    ("Koers", "Rates", "rates"),
    ("Olie & gas", "Oil & gas", "oilgas"),
    ("Gidsen", "Guides", "guides"),
]

FOOTER_GROUPS = [
    ("Geld & salaris", "Pay & money", ["salary", "tax", "overtime", "minwage", "vatcalc", "rates"]),
    ("Werk & handel", "Work & trade", ["tenders", "jobs", "news", "holidays", "workdays"]),
    ("Gidsen", "Guides", ["start", "vatguide", "labour", "oilgas", "supplier"]),
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
