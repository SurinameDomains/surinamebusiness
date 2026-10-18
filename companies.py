"""Company directory built from OpenStreetMap (© OpenStreetMap contributors, ODbL 1.0).

fetch_companies() downloads businesses in Suriname via the Overpass API at most once
a week (data changes slowly) and writes data/live/companies.json.
normalise() turns raw OSM elements into directory records used by build.py.
"""
import datetime as dt
import json
import os
import re
import unicodedata
import urllib.parse
import urllib.request

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
QUERY = ('[out:json][timeout:120];area["ISO3166-1"="SR"][admin_level=2]->.a;('
         'nwr(area.a)["name"]["shop"];nwr(area.a)["name"]["office"];nwr(area.a)["name"]["craft"];'
         'nwr(area.a)["name"]["amenity"~"^(bank|bureau_de_change|fuel|pharmacy|clinic|hospital|dentist|doctors|'
         'car_rental|marketplace|post_office|veterinary|driving_school|car_wash)$"];'
         'nwr(area.a)["name"]["tourism"~"^(hotel|guest_house|apartment)$"];'
         ');out center tags;')

# (osm tag value) -> (group key). Group keys map to labels below.
CAT = {
    "shop:supermarket": "supermarkets", "shop:convenience": "supermarkets", "shop:greengrocer": "supermarkets",
    "shop:wholesale": "wholesale", "shop:department_store": "department",
    "shop:clothes": "clothing", "shop:shoes": "clothing", "shop:fabric": "clothing", "shop:boutique": "clothing",
    "shop:car_parts": "auto", "shop:car_repair": "auto", "shop:car": "auto", "shop:tyres": "auto",
    "shop:motorcycle": "auto", "amenity:car_rental": "auto", "amenity:car_wash": "auto",
    "amenity:fuel": "fuel",
    "shop:hardware": "building", "shop:doityourself": "building", "shop:trade": "building", "shop:paint": "building",
    "shop:electrical": "building", "shop:furniture": "home", "shop:houseware": "home", "shop:interior_decoration": "home",
    "shop:electronics": "electronics", "shop:mobile_phone": "electronics", "shop:computer": "electronics",
    "shop:appliance": "electronics",
    "shop:hairdresser": "beauty", "shop:beauty": "beauty", "shop:cosmetics": "beauty", "shop:perfumery": "beauty",
    "amenity:pharmacy": "health", "amenity:clinic": "health", "amenity:hospital": "health", "amenity:dentist": "health",
    "amenity:doctors": "health", "shop:optician": "health", "shop:medical_supply": "health",
    "amenity:veterinary": "health",
    "amenity:bank": "finance", "amenity:bureau_de_change": "finance", "office:insurance": "finance",
    "office:financial": "finance", "office:accountant": "finance", "shop:money_lender": "finance",
    "shop:bakery": "food", "shop:butcher": "food", "shop:alcohol": "food", "shop:beverages": "food",
    "shop:seafood": "food", "shop:deli": "food", "shop:confectionery": "food",
    "shop:jewelry": "jewelry", "shop:gift": "jewelry",
    "office:company": "offices", "office:yes": "offices", "office:it": "offices", "office:consulting": "offices",
    "office:lawyer": "offices", "office:notary": "offices", "office:estate_agent": "offices",
    "office:telecommunication": "offices", "office:logistics": "offices", "office:advertising_agency": "offices",
    "office:employment_agency": "offices", "office:architect": "offices", "office:engineer": "offices",
    "office:ngo": "ngo", "office:association": "ngo", "office:foundation": "ngo",
    "office:government": "government", "office:diplomatic": "government", "amenity:post_office": "government",
    "shop:travel_agency": "travel", "tourism:hotel": "travel", "tourism:guest_house": "travel",
    "tourism:apartment": "travel",
    "shop:copyshop": "services", "shop:laundry": "services", "shop:dry_cleaning": "services",
    "amenity:driving_school": "services", "shop:tailor": "services",
    "amenity:marketplace": "markets",
}
GROUPS = {
    # key: (nl slug, nl label, en slug, en label)
    "supermarkets": ("supermarkten", "Supermarkten en winkels", "supermarkets", "Supermarkets and grocery"),
    "wholesale": ("groothandel", "Groothandel", "wholesale", "Wholesale"),
    "department": ("warenhuizen", "Warenhuizen", "department-stores", "Department stores"),
    "clothing": ("kleding-en-schoenen", "Kleding en schoenen", "clothing-and-shoes", "Clothing and shoes"),
    "auto": ("auto-en-onderdelen", "Auto, onderdelen en reparatie", "cars-and-parts", "Cars, parts and repair"),
    "fuel": ("benzinestations", "Benzinestations", "fuel-stations", "Fuel stations"),
    "building": ("bouwmaterialen", "Bouwmaterialen en ijzerwaren", "building-materials", "Building materials and hardware"),
    "home": ("meubels-en-wonen", "Meubels en wonen", "furniture-and-home", "Furniture and home"),
    "electronics": ("elektronica", "Elektronica, telefoons en computers", "electronics", "Electronics, phones and computers"),
    "beauty": ("kappers-en-schoonheid", "Kappers en schoonheid", "hair-and-beauty", "Hair and beauty"),
    "health": ("zorg-en-apotheken", "Zorg, apotheken en klinieken", "health-and-pharmacies", "Health, pharmacies and clinics"),
    "finance": ("banken-en-financieel", "Banken, cambio's en verzekeraars", "banks-and-finance", "Banks, cambios and insurers"),
    "food": ("bakkers-slagers-dranken", "Bakkers, slagers en dranken", "food-shops", "Bakeries, butchers and drinks"),
    "jewelry": ("juweliers-en-cadeaus", "Juweliers en cadeaus", "jewellery-and-gifts", "Jewellery and gifts"),
    "offices": ("kantoren-en-dienstverlening", "Kantoren en zakelijke diensten", "offices-and-business-services", "Offices and business services"),
    "ngo": ("stichtingen-en-verenigingen", "Stichtingen en verenigingen", "ngos-and-associations", "NGOs and associations"),
    "government": ("overheid-en-ambassades", "Overheid en ambassades", "government-and-embassies", "Government and embassies"),
    "travel": ("reizen-en-verblijf", "Reisbureaus en accommodatie", "travel-and-stay", "Travel agencies and accommodation"),
    "services": ("diensten", "Overige diensten", "services", "Other services"),
    "markets": ("markten", "Markten", "markets", "Markets"),
    "other": ("overige-winkels", "Overige winkels en bedrijven", "other-businesses", "Other shops and businesses"),
}


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:70] or "bedrijf"


def fetch_companies(live_dir, ua, now_iso, force=False):
    path = os.path.join(live_dir, "companies_raw.json")
    try:
        meta = json.load(open(path, encoding="utf-8"))
        age_days = (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(meta["fetched_at"])).days
        if age_days < 7 and not force:
            return f"fresh ({age_days} d old, {len(meta['elements'])} records)"
    except Exception:
        meta = None
    data = urllib.parse.urlencode({"data": QUERY}).encode()
    last = None
    for ep in ENDPOINTS:
        try:
            req = urllib.request.Request(ep, data=data, headers={"User-Agent": ua})
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.loads(r.read().decode("utf-8"))
            els = d.get("elements") or []
            if len(els) < 500:
                raise ValueError(f"only {len(els)} elements")
            slim = []
            for e in els:
                c = e.get("center") or {}
                slim.append({"type": e["type"], "id": e["id"], "lat": e.get("lat") or c.get("lat"),
                             "lon": e.get("lon") or c.get("lon"), "tags": e.get("tags", {})})
            out = {"source": "OpenStreetMap via Overpass", "license": "ODbL 1.0", "endpoint": ep,
                   "fetched_at": now_iso(), "elements": slim}
            tmp = path + ".tmp"
            json.dump(out, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            os.replace(tmp, path)
            return f"{len(slim)} records from {ep}"
        except Exception as e:
            last = e
    raise RuntimeError(f"all Overpass endpoints failed: {last}")


def _group(t):
    for k in ("shop", "amenity", "office", "tourism", "craft"):
        if k in t:
            g = CAT.get(f"{k}:{t[k]}")
            if g:
                return g
    if "craft" in t:
        return "services"
    return "other"


def _phone(t):
    p = t.get("phone") or t.get("contact:phone") or t.get("contact:mobile") or t.get("mobile")
    return p.split(";")[0].strip() if p else None


def _web(t):
    w = t.get("website") or t.get("contact:website") or t.get("url")
    if not w:
        return None
    w = w.split(";")[0].strip()
    if not w.startswith("http"):
        w = "https://" + w
    if re.search(r"facebook\.com|instagram\.com", w):
        return None
    return w


REDIRECTS = {}  # duplicate OSM entries: slug -> slug of the record we keep


def _same_place(a, b):
    if a["lat"] and b["lat"]:
        return abs(a["lat"] - b["lat"]) < 0.003 and abs(a["lon"] - b["lon"]) < 0.003
    return True


def normalise(raw):
    recs, used, kept = [], set(), {}
    REDIRECTS.clear()
    for e in raw.get("elements", []):
        t = e["tags"]
        name = (t.get("name") or "").strip()
        if len(name) < 2:
            continue
        street = " ".join(x for x in [t.get("addr:street"), t.get("addr:housenumber")] if x)
        place = t.get("addr:city") or t.get("addr:place") or t.get("addr:district") or ""
        district = t.get("addr:district") or ""
        r = {
            "name": name, "group": _group(t),
            "kind": next((t[k] for k in ("shop", "amenity", "office", "tourism", "craft") if k in t), ""),
            "street": street, "place": place, "district": district,
            "phone": _phone(t), "website": _web(t),
            "email": (t.get("email") or t.get("contact:email") or "").split(";")[0].strip() or None,
            "hours": t.get("opening_hours"), "brand": t.get("brand"), "operator": t.get("operator"),
            "lat": e.get("lat"), "lon": e.get("lon"),
            "osm": f"https://www.openstreetmap.org/{e['type']}/{e['id']}",
        }
        contact = bool(r["phone"] or r["website"] or r["email"] or r["hours"])
        located = bool(r["street"] or r["place"] or r["lat"])
        r["page"] = contact and located
        if r["page"]:
            base = slugify(name + (" " + place if place else ""))
            slug, i = base, 2
            while slug in used:
                slug, i = f"{base}-{i}", i + 1
            used.add(slug)
            r["slug"] = slug
            # OSM often has the same shop twice (a node and a building). Keep the first one; the
            # slug of the duplicate stays reserved so later slugs never shift, and gets a redirect.
            dup = next((k for k in kept.get(name.lower(), []) if _same_place(k, r) and (
                (r["phone"] and k["phone"] and r["phone"].replace(" ", "") == k["phone"].replace(" ", ""))
                or (r["street"] and r["street"] == k["street"]))), None)
            if dup:
                REDIRECTS[slug] = dup["slug"]
                continue
            kept.setdefault(name.lower(), []).append(r)
        recs.append(r)
    recs.sort(key=lambda x: x["name"].lower())
    return recs
