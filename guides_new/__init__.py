"""Guides added on 26 Oct 2026 (gap analysis against comparable Suriname business sites).

One module per guide: guides_new/<key>.py defines SLUGS = (nl_slug, en_slug) and ENTRY = {label, meta, faq}
in the same shape as guides_content.ENTRIES. Registered in guides_meta.NEW and GUIDES.
"""
import importlib

KEYS = ["districts", "sectors", "agri", "tradeagreements", "euexport", "associations", "newlaws", "economy", "bizplan",
        "subsidies", "events", "diaspora", "businesstravel", "expat", "tourismbiz", "environment", "safety", "sustainability", "payments", "aml", "disputes", "civilcode", "standards", "pricerules", "training", "marketresearch", "insurance", "mining", "logistics", "utilities", "countries"]

SLUGS = {}
ENTRIES = {}
for _k in KEYS:
    try:
        _m = importlib.import_module(f"guides_new.{_k}")
    except ModuleNotFoundError:
        continue
    SLUGS[_k] = _m.SLUGS
    ENTRIES[_k] = _m.ENTRY
