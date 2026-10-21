"""Guides: labels, titles, descriptions and FAQs for the long-form guides (Oct 2026 deep dive).

A guide is templates/pages/<key>.html (prose, both languages). New guides are registered in
site_config.PAGES from NEW below; existing guides keep their slug and only take label/meta/FAQ
from here when an entry exists. FAQ items render under the page and as FAQPage schema.
Each entry: label (nl, en), meta ((title, description) nl, (title, description) en), faq list.
"""

# key: (nl_slug, en_slug) for guides added on 21 Oct 2026
NEW = {
    "resources": ("instanties-en-links", "en/business-resources"),
    "licences": ("vergunningen-suriname", "en/business-licences-suriname"),
    "biztax": ("belastingen-bedrijven", "en/business-taxes-suriname"),
    "employer": ("werkgeverslasten", "en/employer-costs-suriname"),
    "dismissal": ("ontslag-opzegtermijn", "en/dismissal-and-notice-suriname"),
    "export": ("exporteren-suriname", "en/exporting-from-suriname"),
    "invest": ("investeren-in-suriname", "en/investing-in-suriname"),
    "trademark": ("merk-registreren-suriname", "en/trademark-registration-suriname"),
    "finance": ("financiering-ondernemers", "en/business-financing-suriname"),
    "bookkeeping": ("administratie-en-facturen", "en/bookkeeping-and-invoices"),
}

GUIDES = {}

from guides_content import ENTRIES as _E  # noqa: E402
GUIDES.update(_E)


def faqs(key, lang):
    items = GUIDES.get(key, {}).get("faq", [])
    return [q[0] if lang == "nl" else q[1] for q in items]
