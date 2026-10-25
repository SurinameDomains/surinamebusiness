"""Editorial filters applied at build time (fetch.py stores everything, the site shows what belongs here).

- News: a headline only counts as Suriname business news when it is about Suriname. The RSS feeds of local papers
  also carry world news (China's GDP, a mine collapse in Colombia) and crime reports that merely mention a
  "bedrijfspand" or "goud". Foreign headlines stay out unless they also name Suriname; crime reports stay out.
- Tenders: buyers re-post a notice when they amend it or fix a typo in the title. Those copies are folded into one
  item (the newest), marked `amended`.
"""
import difflib
import re

LOCAL_RE = re.compile(
    r"\b(surinam\w*|paramaribo|nickerie|wanica|commewijne|marowijne|saramacca|coronie|para|brokopondo|sipaliwini|"
    r"albina|moengo|lelydorp|srd|cbvs|centrale bank van suriname|staatsolie|granmorgu|blok 58|vsb|kkf|asfa|dsb|"
    r"hakrinbank|finabank|southern commercial|scom|republic bank|ebs|telesur|swm|nvb|regering|president\w*|"
    r"simons|geerlings|minist\w*|dna|assembl\w*|ecd|lvv|ezoti|belastingdienst|fiscus|begroting\w*|staatsschuld|"
    r"binnenland|district\w*|surinaamse)\b", re.I)

FOREIGN_RE = re.compile(
    r"\b(china|chinese|colombia\w*|qatar|iran\w*|irak|venezuela\w*|argentini\w*|trinidad|lagarde|ecb|fed|"
    r"verenigde staten|amerika\w*|vs|trump|eu|europese|europa|brazili\w*|india\w*|rusland|russisch\w*|oekra\w*|"
    r"isra\w*|gaza|nederland\w*|frankrijk|frans\w*|duits\w*|japan\w*|mexic\w*|cuba\w*|ha[iï]ti\w*|jamaica\w*|"
    r"barbados|canad\w*|guyan\w*|saoedi\w*|opec\w*|wereldeconomie|wall street|dow jones|navo|vn-\w+)\b", re.I)

# Guyana shares the basin; its oil news belongs on the oil and gas page
FOREIGN_OIL_OK = re.compile(r"\bguyan\w*\b", re.I)

CRIME_RE = re.compile(
    r"\b(gestolen|diefstal|beroofd|overval\w*|aangehouden|arrestat\w*|verdachte\w*|revolver|vuurwapen\w*|"
    r"schietpartij|neergeschoten|doodgeschoten|gedood|doden|dode|lijk|vermoord|moord\w*|steekpartij|gewond\w*|"
    r"ongeval\w*|verkeersongeluk|inbraak|ingebroken|politie|schotwond|steekwond|lichaam|ruzie|mishandel\w*|"
    r"verkracht\w*|ontvoer\w*|vechtpartij|hete olie|kapmes|gevangenis|rechter|vonnis|veroordeeld)\b", re.I)

# sport and celebrity items that the papers' general feeds carry
SPORT_RE = re.compile(
    r"\b(voetbal\w*|ballon d.or|messi|ronaldo|seedorf|corinthians|natio|svb|wk|ek|olympi\w*|doelpunt\w*|"
    r"kampioen\w*|competitie|wielren\w*|atletiek|sporter\w*|elftal)\b", re.I)


def local_business(title, oil=False):
    t = title or ""
    if CRIME_RE.search(t) or SPORT_RE.search(t):
        return False
    if LOCAL_RE.search(t):
        return True
    m = FOREIGN_RE.search(t)
    if not m:
        return True
    if oil and FOREIGN_OIL_OK.search(t) and not FOREIGN_RE.search(FOREIGN_OIL_OK.sub("", t)):
        return True
    return False


PREFIX_RE = re.compile(r"^\s*(amendment|amended|addendum|corrigendum|correction|update[d]?|revised|herzien\w*|"
                       r"gewijzigd\w*|wijziging|rectificatie|aanvulling)\s*(no\.?\s*\d+\s*)?[-:–—]\s*", re.I)


def _clean_title(title):
    t, amended = title or "", False
    while True:
        n = PREFIX_RE.sub("", t, count=1)
        if n == t:
            break
        t, amended = n, True
    return t.strip(), amended


def _key(title):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", title.lower())).strip()


def _typo_apart(a, b):
    """True when two titles differ only by a typo or two: at most 4 changed characters, never a changed word list.
    ("eeb houten" vs "een houten" folds; "Directoraat Civieltechnische Werken" vs "Directoraat Bouw" does not.)"""
    if abs(len(a) - len(b)) > 4:
        return False
    changed = 0
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op != "equal":
            changed += max(i2 - i1, j2 - j1)
            if changed > 4:
                return False
    return True


def dedupe_tenders(items):
    """Fold re-posted tenders (amendments, corrected titles) of the same buyer into the newest one.
    Returns the survivors newest first, which is the order fetch.py saves them in."""
    groups = []          # [kept_item, key, buyer]
    for it in sorted(items, key=lambda x: (x.get("published") or ""), reverse=True):
        title, amended = _clean_title(it.get("title", ""))
        key, buyer = _key(title), (it.get("buyer") or "").strip().lower()
        match = None
        for g in groups:
            if g[2] != buyer or not key or not g[1]:
                continue
            if g[1] == key or _typo_apart(g[1], key):
                match = g
                break
        if match:
            kept = match[0]
            kept["amended"] = True
            if not kept.get("deadline") and it.get("deadline"):
                kept["deadline"] = it["deadline"]
            continue
        it = dict(it)
        it["title"] = title or it.get("title", "")
        if amended:
            it["amended"] = True
        groups.append([it, key, buyer])
    return [g[0] for g in groups]
