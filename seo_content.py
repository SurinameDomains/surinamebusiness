"""Page content for the directory and salary pages that Google reported as "Discovered/Crawled - currently
not indexed" (Oct 2026). Those pages were mostly a name, an address and a list. This module turns the data we
already hold into text a visitor can use: a readable opening-hours table, a sentence that places the business,
the nearest businesses with walking distance, what the category is for and which of our tools help, and for
category pages who is open on Sunday or around the clock.

Nothing here is invented: every sentence is built from OpenStreetMap fields, the business's own listing,
districts_data.py or our own page list. Group texts are general and link to the pages that hold the facts.
"""
import math
import re

# ---------------------------------------------------------------- what kind of place it is (OSM tag value)
KIND = {
    "supermarket": ("supermarkt", "supermarket"), "convenience": ("buurtwinkel", "convenience store"),
    "greengrocer": ("groentewinkel", "greengrocer"), "wholesale": ("groothandel", "wholesaler"),
    "department_store": ("warenhuis", "department store"), "clothes": ("kledingwinkel", "clothing shop"),
    "shoes": ("schoenenwinkel", "shoe shop"), "fabric": ("stoffenwinkel", "fabric shop"),
    "boutique": ("boetiek", "boutique"), "car_parts": ("auto-onderdelenzaak", "car parts shop"),
    "car_repair": ("autogarage", "car repair garage"), "car": ("autodealer", "car dealer"),
    "tyres": ("bandenzaak", "tyre shop"), "motorcycle": ("motorzaak", "motorcycle shop"),
    "car_rental": ("autoverhuurbedrijf", "car rental company"), "car_wash": ("autowasstraat", "car wash"),
    "fuel": ("tankstation", "fuel station"), "hardware": ("ijzerwarenzaak", "hardware store"),
    "doityourself": ("bouwmarkt", "DIY store"), "trade": ("bouwmaterialenhandel", "building supplies trader"),
    "paint": ("verfwinkel", "paint shop"), "electrical": ("elektrazaak", "electrical supplies shop"),
    "furniture": ("meubelzaak", "furniture shop"), "houseware": ("huishoudwinkel", "houseware shop"),
    "interior_decoration": ("woonwinkel", "interior shop"), "electronics": ("elektronicazaak", "electronics shop"),
    "mobile_phone": ("telefoonwinkel", "mobile phone shop"), "computer": ("computerzaak", "computer shop"),
    "appliance": ("witgoedzaak", "appliance shop"), "hairdresser": ("kapsalon", "hairdresser"),
    "beauty": ("schoonheidssalon", "beauty salon"), "cosmetics": ("cosmeticawinkel", "cosmetics shop"),
    "perfumery": ("parfumerie", "perfumery"), "pharmacy": ("apotheek", "pharmacy"),
    "clinic": ("kliniek of poli", "clinic"), "hospital": ("ziekenhuis", "hospital"),
    "dentist": ("tandarts", "dentist"), "doctors": ("huisartsenpraktijk", "doctor's practice"),
    "optician": ("opticien", "optician"), "medical_supply": ("medische speciaalzaak", "medical supply shop"),
    "veterinary": ("dierenarts", "veterinarian"), "bank": ("bank", "bank"),
    "bureau_de_change": ("cambio", "currency exchange (cambio)"), "insurance": ("verzekeraar", "insurer"),
    "financial": ("financieel kantoor", "financial services office"), "accountant": ("accountantskantoor", "accountancy"),
    "money_lender": ("geldverstrekker", "money lender"), "bakery": ("bakkerij", "bakery"),
    "butcher": ("slagerij", "butcher"), "alcohol": ("drankenzaak", "liquor store"),
    "beverages": ("drankenhandel", "drinks shop"), "seafood": ("viswinkel", "fish shop"),
    "deli": ("delicatessenzaak", "deli"), "confectionery": ("snoepwinkel", "confectionery shop"),
    "jewelry": ("juwelier", "jeweller"), "gift": ("cadeauwinkel", "gift shop"),
    "company": ("bedrijf", "company"), "it": ("IT-bedrijf", "IT company"), "consulting": ("adviesbureau", "consultancy"),
    "lawyer": ("advocatenkantoor", "law firm"), "notary": ("notariskantoor", "notary"),
    "estate_agent": ("makelaar", "estate agent"), "telecommunication": ("telecombedrijf", "telecom company"),
    "logistics": ("logistiek bedrijf", "logistics company"), "advertising_agency": ("reclamebureau", "advertising agency"),
    "employment_agency": ("uitzendbureau", "employment agency"), "architect": ("architectenbureau", "architect"),
    "engineer": ("ingenieursbureau", "engineering firm"), "ngo": ("ngo", "NGO"),
    "association": ("vereniging", "association"), "foundation": ("stichting", "foundation"),
    "government": ("overheidsinstantie", "government office"), "diplomatic": ("ambassade of consulaat", "embassy or consulate"),
    "post_office": ("postkantoor", "post office"), "travel_agency": ("reisbureau", "travel agency"),
    "travel_agent": ("reisbureau", "travel agency"), "hotel": ("hotel", "hotel"),
    "guest_house": ("guesthouse", "guest house"), "apartment": ("vakantieappartement", "holiday apartment"),
    "copyshop": ("copyshop", "copy shop"), "laundry": ("wasserij", "laundry"),
    "dry_cleaning": ("stomerij", "dry cleaner"), "driving_school": ("rijschool", "driving school"),
    "tailor": ("kleermaker", "tailor"), "marketplace": ("markt", "market"), "caterer": ("cateraar", "caterer"),
    "photographer": ("fotograaf", "photographer"), "printing": ("drukkerij", "printer"),
    "stationery": ("kantoorboekhandel", "stationery shop"), "toys": ("speelgoedwinkel", "toy shop"),
    "funeral_directors": ("uitvaartonderneming", "funeral director"), "variety_store": ("bazaar", "variety store"),
    "mall": ("winkelcentrum", "shopping centre"), "casino": ("casino", "casino"),
    "graphic_design": ("grafisch ontwerpbureau", "graphic design studio"), "outdoor": ("outdoorwinkel", "outdoor shop"),
    "energy_supplier": ("energieleverancier", "energy supplier"), "photo": ("fotowinkel", "photo shop"),
    "coffee": ("koffiezaak", "coffee shop"), "bookmaker": ("wedkantoor", "betting shop"),
    "tattoo": ("tattooshop", "tattoo studio"), "video_games": ("gamewinkel", "video game shop"),
    "repair": ("reparatiezaak", "repair shop"), "motorcycle_repair": ("motorgarage", "motorcycle repair shop"),
    "building_materials": ("bouwmaterialenhandel", "building materials store"),
    "metal_construction": ("metaalbedrijf", "metalworks"), "gas": ("gasleverancier", "gas supplier"),
}


def kind_label(r, lang):
    k = (r.get("kind") or "").split(";")[0]
    if r.get("own") and r.get("kind") and k not in KIND:
        return r["kind"]
    return KIND.get(k, (None, None))[0 if lang == "nl" else 1]


# ---------------------------------------------------------------- category texts and related pages
# (nl, en) intro per directory group, plus site page keys that help someone in or dealing with that trade
GROUP_TEXT = {
    "supermarkets": (
        "Supermarkten, buurtwinkels en groentezaken in Suriname, met adres, telefoon en openingstijden waar bekend. "
        "Voor een aantal basisgoederen geldt een maximumprijs die het ministerie van EZOTI vaststelt; de actuele lijst "
        "staat op onze pagina over maximumprijzen.",
        "Supermarkets, convenience stores and greengrocers in Suriname, with address, phone and opening hours where "
        "known. A number of basic goods have a maximum price set by the Ministry of EZOTI; the current list is on our "
        "maximum prices page."),
    "wholesale": (
        "Groothandels in Suriname voor winkeliers, horeca en bedrijven. Wie zelf importeert, rekent met invoerrechten, "
        "btw en de douanekoers; onze rekentool voor invoerkosten en de importgids helpen bij die vergelijking.",
        "Wholesalers in Suriname that supply shops, restaurants and companies. If you import yourself you pay import "
        "duty, VAT and the customs exchange rate; our import cost calculator and import guide help you compare."),
    "department": (
        "Warenhuizen in Suriname: grote winkels met kleding, huishoudartikelen, elektronica en meer onder een dak. "
        "Prijzen volgen vaak de wisselkoers, omdat het meeste wordt ingevoerd.",
        "Department stores in Suriname: large shops with clothing, household goods, electronics and more under one "
        "roof. Prices often follow the exchange rate, because most goods are imported."),
    "clothing": (
        "Kleding-, schoenen- en stoffenwinkels in Suriname. Begin je zelf een kledingzaak, lees dan ook onze gidsen "
        "over importeren en prijzen berekenen.",
        "Clothing, shoe and fabric shops in Suriname. If you are starting a clothing shop yourself, see our guides on "
        "importing and setting prices."),
    "auto": (
        "Autodealers, garages, onderdelenzaken, bandenzaken, autoverhuur en wasstraten in Suriname. Bij een "
        "ingevoerde auto bepalen invoerrechten en de douanekoers een groot deel van de prijs.",
        "Car dealers, garages, parts shops, tyre shops, car rental and car washes in Suriname. For an imported car, "
        "import duty and the customs exchange rate make up a large part of the price."),
    "fuel": (
        "Tankstations in Suriname, met adres en waar bekend telefoon en openingstijden. De actuele pompprijs per liter "
        "staat op onze pagina met brandstofprijzen, met uitleg over het prijsplafond.",
        "Fuel stations in Suriname, with address and, where known, phone and opening hours. The current pump price per "
        "litre is on our fuel prices page, with an explanation of the price cap."),
    "building": (
        "Bouwmaterialen, ijzerwaren, verf en elektra in Suriname. Ga je bouwen, lees dan ook onze gids over grond "
        "kopen en reken een lening door met de leningcalculator.",
        "Building materials, hardware, paint and electrical supplies in Suriname. If you are building, also read our "
        "guide on buying land and work out a loan with the loan calculator."),
    "home": (
        "Meubelzaken, huishoudwinkels en woonwinkels in Suriname, met adres en telefoon.",
        "Furniture, houseware and interior shops in Suriname, with address and phone."),
    "electronics": (
        "Elektronica-, telefoon-, computer- en witgoedzaken in Suriname. Prijzen volgen meestal de dollarkoers; "
        "de actuele koers staat op onze wisselkoerspagina.",
        "Electronics, mobile phone, computer and appliance shops in Suriname. Prices usually follow the US dollar "
        "rate; the current rate is on our exchange rate page."),
    "beauty": (
        "Kapsalons, schoonheidssalons en cosmeticawinkels in Suriname. Wil je zelf een salon beginnen, dan helpen "
        "onze gidsen over een bedrijf starten en vergunningen.",
        "Hairdressers, beauty salons and cosmetics shops in Suriname. If you want to open a salon yourself, our "
        "guides on starting a business and licences help."),
    "health": (
        "Apotheken, klinieken, poli's, ziekenhuizen, tandartsen, opticiens en dierenartsen in Suriname. Bel bij "
        "twijfel even voor je gaat: openingstijden van poli's en apotheken wisselen in het weekend en op feestdagen.",
        "Pharmacies, clinics, GP practices, hospitals, dentists, opticians and vets in Suriname. When in doubt, call "
        "before you go: opening hours of clinics and pharmacies change at weekends and on public holidays."),
    "finance": (
        "Banken, cambio's, verzekeraars en financiële kantoren in Suriname. Wisselkoersen verschillen per bank en "
        "cambio; onze wisselkoerspagina toont de actuele koers.",
        "Banks, cambios (currency exchanges), insurers and financial offices in Suriname. Exchange rates differ per "
        "bank and cambio; our exchange rate page shows the current rate."),
    "food": (
        "Bakkerijen, slagerijen, drankenzaken en viswinkels in Suriname. Voor een eigen voedingszaak gelden regels "
        "voor hygiëne en vergunningen; zie onze gidsen.",
        "Bakeries, butchers, liquor and drinks shops and fish shops in Suriname. Running your own food business "
        "comes with hygiene rules and licences; see our guides."),
    "jewelry": (
        "Juweliers en cadeauwinkels in Suriname. De prijs van gouden sieraden volgt de goudprijs; die staat "
        "op onze goudprijspagina.",
        "Jewellers and gift shops in Suriname. The price of gold jewellery follows the gold price, which is on our "
        "gold price page."),
    "offices": (
        "Kantoren en zakelijke dienstverleners in Suriname: advocaten, notarissen, makelaars, IT, logistiek en "
        "advies. Voor je eigen administratie zijn er gratis tools voor facturen, offertes en btw.",
        "Offices and business services in Suriname: lawyers, notaries, estate agents, IT, logistics and consulting. "
        "For your own paperwork there are free tools for invoices, quotes and VAT."),
    "ngo": (
        "Stichtingen, verenigingen en ngo's in Suriname. Ondernemersorganisaties en subsidieregelingen staan in "
        "aparte gidsen.",
        "Foundations, associations and NGOs in Suriname. Business associations and grant schemes have their own "
        "guides."),
    "government": (
        "Overheidskantoren, ambassades, consulaten en postkantoren in Suriname. Contactgegevens van de belangrijkste "
        "instanties voor ondernemers staan op onze pagina met instanties.",
        "Government offices, embassies, consulates and post offices in Suriname. Contact details of the main "
        "agencies for businesses are on our government agencies page."),
    "travel": (
        "Reisbureaus, hotels, guesthouses en vakantieappartementen in Suriname. Op zakenreis naar Suriname? Onze "
        "gids voor zakenreizen helpt bij de voorbereiding.",
        "Travel agencies, hotels, guest houses and holiday apartments in Suriname. Travelling to Suriname on "
        "business? Our business travel guide helps you prepare."),
    "services": (
        "Copyshops, wasserijen, stomerijen, rijscholen, kleermakers, fotografen en andere diensten in Suriname.",
        "Copy shops, laundries, dry cleaners, driving schools, tailors, photographers and other services in "
        "Suriname."),
    "markets": (
        "Markten in Suriname, in Paramaribo en in de districten. Voor "
        "marktkramers zijn de tools voor kas tellen en kwitanties handig.",
        "Markets in Suriname, in Paramaribo and in the districts. For "
        "market traders the cash count and receipt tools are handy."),
    "other": (
        "Overige winkels en bedrijven in Suriname die niet in een andere categorie passen.",
        "Other shops and businesses in Suriname that do not fit another category."),
}

GROUP_LINKS = {
    "supermarkets": ["maxprices", "pricerules", "rates"], "wholesale": ["import", "importcost", "douane"],
    "department": ["maxprices", "rates", "pricerules"], "clothing": ["import", "pricing", "start"],
    "auto": ["importcost", "douane", "fuel"], "fuel": ["fuel", "oilgas", "rates"],
    "building": ["land", "loan", "importcost"], "home": ["importcost", "loan", "rates"],
    "electronics": ["rates", "importcost", "douane"], "beauty": ["start", "licences", "bizplan"],
    "health": ["holidays", "insurance", "licences"], "finance": ["rates", "loan", "bankaccount"],
    "food": ["licences", "safety", "maxprices"], "jewelry": ["gold", "mining", "rates"],
    "offices": ["invoice", "quote", "biztax"], "ngo": ["associations", "subsidies", "finance"],
    "government": ["contacts", "licences", "tenders"], "travel": ["businesstravel", "tourismbiz", "expat"],
    "services": ["invoice", "receipt", "pricing"], "markets": ["cashcount", "receipt", "agri"],
    "other": ["start", "invoice", "addbiz"],
}

# town -> district key (districts_data.py); only places we are sure of
TOWN_DISTRICT = {
    "Paramaribo": "paramaribo", "Latour": "paramaribo", "Lelydorp": "wanica", "Domburg": "wanica",
    "Wanica": "wanica", "Houttuin": "wanica", "Saramaccapolder": "wanica", "Nieuw Nickerie": "nickerie",
    "Wageningen": "nickerie", "Totness": "coronie", "Groningen": "saramacca", "Jarikaba": "saramacca",
    "Meerzorg": "commewijne", "Nieuw Amsterdam": "commewijne", "Moengo": "marowijne", "Albina": "marowijne",
    "Onverwacht": "para", "Zanderij": "para", "Paranam": "para", "Brokopondo": "brokopondo",
    "Brownsweg": "brokopondo", "Apoera": "sipaliwini",
}
PLACE_FIX = {"Parimaribo": "Paramaribo", "paramaribo": "Paramaribo"}


# ---------------------------------------------------------------- opening hours (OpenStreetMap syntax, common subset)
DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
DAY_NAME = {"nl": ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
            "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
SCHEMA_DAY = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _dayset(spec):
    out = set()
    for part in spec.split(","):
        a, _, b = part.partition("-")
        if a not in DAYS or (b and b not in DAYS):
            raise ValueError(spec)
        i, j = DAYS.index(a), DAYS.index(b or a)
        while True:
            out.add(i)
            if i == j:
                break
            i = (i + 1) % 7
    return out


def parse_hours(s):
    """Return a list of 7 lists of (open, close) 'HH:MM' strings, Monday first; [] means closed.
    None when the string uses syntax we do not handle (then the page shows the raw text)."""
    if not s:
        return None
    s = s.strip()
    if s in ("24/7", "Mo-Su 00:00-24:00"):
        return [[("00:00", "24:00")] for _ in range(7)]
    week = [[] for _ in range(7)]
    # rules are separated by ";" and sometimes by ", " before a day token
    rules = re.split(r";\s*|,\s*(?=(?:Mo|Tu|We|Th|Fr|Sa|Su)\b)", s)
    seen = False
    for rule in rules:
        rule = rule.strip()
        if not rule:
            continue
        m = re.match(r"^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:[-,](?:Mo|Tu|We|Th|Fr|Sa|Su))*)\s+(.+)$", rule)
        if m:
            days, times = _dayset(m.group(1)), m.group(2).strip()
        elif re.match(r"^\d", rule):
            days, times = set(range(7)), rule
        else:
            return None
        if times in ("off", "closed"):
            for d in days:
                week[d] = []
            seen = True
            continue
        spans = []
        for t in times.split(","):
            mm = re.match(r"^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$", t)
            if not mm:
                return None
            spans.append((f"{int(mm.group(1)):02d}:{mm.group(2)}", f"{int(mm.group(3)):02d}:{mm.group(4)}"))
        for d in days:
            week[d] = list(spans)
        seen = True
    return week if seen else None


def hours_rows(week, lang):
    """[(day name, text)] with consecutive equal days merged: 'maandag t/m vrijdag', '07:30 - 16:00'."""
    nl = lang == "nl"
    names = DAY_NAME[lang]
    def txt(sp):
        if not sp:
            return "gesloten" if nl else "closed"
        if sp == [("00:00", "24:00")]:
            return "24 uur open" if nl else "open 24 hours"
        return ", ".join(f"{a} - {b}" for a, b in sp)
    rows, i = [], 0
    while i < 7:
        j = i
        while j + 1 < 7 and week[j + 1] == week[i]:
            j += 1
        if i == j:
            label = names[i]
        elif j == i + 1:
            label = f"{names[i]} en {names[j]}" if nl else f"{names[i]} and {names[j]}"
        else:
            label = f"{names[i]} t/m {names[j]}" if nl else f"{names[i]} to {names[j]}"
        rows.append((label, txt(week[i])))
        i = j + 1
    return rows


def hours_schema(week):
    out = []
    for d, spans in enumerate(week):
        for a, b in spans:
            out.append({"@type": "OpeningHoursSpecification", "dayOfWeek": SCHEMA_DAY[d],
                        "opens": a, "closes": "23:59" if b == "24:00" else b})
    return out


def open_sunday(week):
    return bool(week and week[6])


def open_247(week):
    return bool(week) and all(w == [("00:00", "24:00")] for w in week)


def hours_summary(week, lang):
    nl = lang == "nl"
    if open_247(week):
        return "dag en nacht open, ook in het weekend" if nl else "open day and night, weekends included"
    open_days = [i for i in range(7) if week[i]]
    if not open_days:
        return None
    sat, sun = bool(week[5]), bool(week[6])
    if not any(week[:5]):
        return "alleen in het weekend open" if nl else "open at weekends only"
    if sat and sun:
        w = "ook op zaterdag en zondag open" if nl else "also open on Saturday and Sunday"
    elif sat:
        w = "op zaterdag open en op zondag gesloten" if nl else "open on Saturday and closed on Sunday"
    elif sun:
        w = "op zondag open en op zaterdag gesloten" if nl else "open on Sunday and closed on Saturday"
    else:
        w = "in het weekend gesloten" if nl else "closed at weekends"
    return w


# ---------------------------------------------------------------- distance
def km(a, b):
    if not (a.get("lat") and b.get("lat")):
        return None
    p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    dp, dl = p2 - p1, math.radians(b["lon"] - a["lon"])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(h))


def fmt_dist(d, lang):
    if d < 1:
        return f"{int(round(d * 1000, -1))} m"
    s = f"{d:.1f}".replace(".", "," if lang == "nl" else ".")
    return f"{s} km"


def nearest(r, pool, lab, lang, n=6, max_km=5.0):
    out = []
    for o in pool:
        if o is r or o.get("slug") == r.get("slug") or not o.get("page"):
            continue
        d = km(r, o)
        if d is not None and d <= max_km:
            out.append((d, o))
    out.sort(key=lambda x: (x[0], x[1]["name"]))
    return [{"slug": o["slug"], "name": o["name"], "cat": lab[o["group"]], "street": o["street"],
             "dist": fmt_dist(d, lang)} for d, o in out[:n]]


# ---------------------------------------------------------------- the sentence that places a business
def company_intro(r, lang, label, same_count, district_name, week):
    nl = lang == "nl"
    kind = kind_label(r, lang) or label.lower()
    art = ("een " if nl else ("an " if kind[:1].lower() in "aeiou" else "a "))
    where = ""
    if r.get("street"):
        street = r["street"]
        where += (f" aan de {street}" if nl else f" on {street}")
    if r.get("place"):
        where += f" in {r['place']}"
    if district_name and district_name != r.get("place"):
        where += (f" (district {district_name})" if nl else f" ({district_name} district)")
    parts = [f"{r['name']} is {art}{kind}{where}."]
    if same_count > 1 and r.get("place"):
        parts.append((f"In onze gids staan {same_count} adressen in de categorie {label.lower()} in {r['place']}."
                      if nl else f"Our directory lists {same_count} {label.lower()} in {r['place']}."))
    if week:
        s = hours_summary(week, lang)
        if s:
            parts.append((f"Volgens de bekende openingstijden is het {s}." if nl else f"According to the known opening hours it is {s}."))
    else:
        parts.append(("De openingstijden zijn niet bekend; bel of app even voor je gaat." if nl else
                      "Opening hours are not known; call or message before you go.") if (r.get("phone") or r.get("whatsapp")) else
                     ("De openingstijden zijn niet bekend." if nl else "Opening hours are not known."))
    contact = []
    if r.get("phone"):
        contact.append(("telefonisch op " if nl else "by phone on ") + r["phone"])
    if r.get("whatsapp"):
        contact.append("via WhatsApp")
    if r.get("email"):
        contact.append("per e-mail" if nl else "by email")
    if r.get("website"):
        contact.append("via de eigen website" if nl else "through its own website")
    if contact:
        joined = contact[0] if len(contact) == 1 else ", ".join(contact[:-1]) + (" of " if nl else " or ") + contact[-1]
        parts.append((f"Je bereikt {r['name']} {joined}." if nl else f"You can reach {r['name']} {joined}."))
    return " ".join(parts)


def company_desc(r, lang, label, week):
    """Meta description: what, where, how to reach it; 150 characters or less."""
    nl = lang == "nl"
    kind = kind_label(r, lang) or label.lower()
    bits = [f"{r['name']}: {kind}" + (f" in {r['place']}" if r.get("place") else "") + "."]
    if r.get("street"):
        bits.append(("Adres " if nl else "Address ") + r["street"] + ".")
    if r.get("phone"):
        bits.append(("Tel. " if nl else "Phone ") + r["phone"] + ".")
    if week:
        s = hours_summary(week, lang)
        if s:
            bits.append(("Openingstijden: " if nl else "Hours: ") + s + ".")
    bits.append(("Categorie " + label.lower() + "." ) if nl else ("Category: " + label.lower() + "."))
    bits.append("Ligging op de kaart, route en bedrijven in de buurt." if nl else "Map location, directions and nearby businesses.")
    out = ""
    for b in bits:
        if len(out) + len(b) + 1 > 158:
            break
        out = (out + " " + b).strip()
    return out


# Pages that existed and were seen by Google but are no longer built. Each gets a stub that forwards to the
# closest live page (GitHub Pages has no server redirects; Google treats an instant meta refresh as a 301).
# The Meerzorg town pages were built from a wrong town guess (nearest town centre put southern Paramaribo in
# Meerzorg); the listings are now placed correctly and those pages fold into the category page.
RETIRED = {
    "/bedrijven/bakkers-slagers-dranken-meerzorg": "/bedrijven/bakkers-slagers-dranken",
    "/bedrijven/banken-en-financieel-meerzorg": "/bedrijven/banken-en-financieel",
    "/bedrijven/benzinestations-meerzorg": "/bedrijven/benzinestations",
    "/bedrijven/diensten-meerzorg": "/bedrijven/diensten",
    "/bedrijven/elektronica-meerzorg": "/bedrijven/elektronica",
    "/bedrijven/juweliers-en-cadeaus-meerzorg": "/bedrijven/juweliers-en-cadeaus",
    "/bedrijven/kappers-en-schoonheid-meerzorg": "/bedrijven/kappers-en-schoonheid",
    "/bedrijven/kleding-en-schoenen-meerzorg": "/bedrijven/kleding-en-schoenen",
    "/bedrijven/overheid-en-ambassades-meerzorg": "/bedrijven/overheid-en-ambassades",
    "/bedrijven/reizen-en-verblijf-meerzorg": "/bedrijven/reizen-en-verblijf",
    "/bedrijven/supermarkten-nieuw-amsterdam": "/bedrijven/supermarkten",
    "/bedrijven/warenhuizen-meerzorg": "/bedrijven/warenhuizen",
    "/bedrijven/zorg-en-apotheken-meerzorg": "/bedrijven/zorg-en-apotheken",
    "/en/companies/banks-and-finance-meerzorg": "/en/companies/banks-and-finance",
    "/en/companies/clothing-and-shoes-meerzorg": "/en/companies/clothing-and-shoes",
    "/en/companies/department-stores-meerzorg": "/en/companies/department-stores",
    "/en/companies/electronics-meerzorg": "/en/companies/electronics",
    "/en/companies/food-shops-meerzorg": "/en/companies/food-shops",
    "/en/companies/fuel-stations-meerzorg": "/en/companies/fuel-stations",
    "/en/companies/government-and-embassies-meerzorg": "/en/companies/government-and-embassies",
    "/en/companies/hair-and-beauty-meerzorg": "/en/companies/hair-and-beauty",
    "/en/companies/health-and-pharmacies-meerzorg": "/en/companies/health-and-pharmacies",
    "/en/companies/jewellery-and-gifts-meerzorg": "/en/companies/jewellery-and-gifts",
    "/en/companies/services-meerzorg": "/en/companies/services",
    "/en/companies/supermarkets-nieuw-amsterdam": "/en/companies/supermarkets",
    "/en/companies/travel-and-stay-meerzorg": "/en/companies/travel-and-stay",
    "/netto-salaris/17500": "/netto-salaris/17000",
    "/en/net-salary/17500": "/en/net-salary/17000",
}

# schema.org type per OSM kind (all LocalBusiness subtypes); anything else stays LocalBusiness
SCHEMA_TYPE = {
    "supermarket": "GroceryStore", "greengrocer": "GroceryStore", "convenience": "ConvenienceStore",
    "wholesale": "WholesaleStore", "department_store": "DepartmentStore", "clothes": "ClothingStore",
    "boutique": "ClothingStore", "shoes": "ShoeStore", "car_parts": "AutoPartsStore", "car_repair": "AutoRepair",
    "car": "AutoDealer", "tyres": "TireShop", "motorcycle": "MotorcycleDealer", "car_rental": "AutoRental",
    "car_wash": "AutoWash", "fuel": "GasStation", "hardware": "HardwareStore", "doityourself": "HomeGoodsStore",
    "paint": "HardwareStore", "trade": "HardwareStore", "building_materials": "HardwareStore",
    "furniture": "FurnitureStore", "houseware": "HomeGoodsStore", "interior_decoration": "HomeGoodsStore",
    "electronics": "ElectronicsStore", "appliance": "ElectronicsStore", "mobile_phone": "MobilePhoneStore",
    "computer": "ComputerStore", "hairdresser": "HairSalon", "beauty": "BeautySalon", "cosmetics": "HealthAndBeautyBusiness",
    "perfumery": "HealthAndBeautyBusiness", "pharmacy": "Pharmacy", "clinic": "MedicalClinic", "hospital": "Hospital",
    "dentist": "Dentist", "doctors": "Physician", "optician": "Optician", "veterinary": "VeterinaryCare",
    "bank": "BankOrCreditUnion", "bureau_de_change": "FinancialService", "insurance": "InsuranceAgency",
    "financial": "FinancialService", "accountant": "AccountingService", "money_lender": "FinancialService",
    "bakery": "Bakery", "alcohol": "LiquorStore", "beverages": "LiquorStore", "jewelry": "JewelryStore",
    "gift": "Store", "toys": "ToyStore", "lawyer": "LegalService", "notary": "Notary",
    "estate_agent": "RealEstateAgent", "employment_agency": "EmploymentAgency", "government": "GovernmentOffice",
    "diplomatic": "GovernmentOffice", "post_office": "PostOffice", "travel_agency": "TravelAgency",
    "travel_agent": "TravelAgency", "hotel": "Hotel", "guest_house": "BedAndBreakfast", "apartment": "LodgingBusiness",
    "laundry": "DryCleaningOrLaundry", "dry_cleaning": "DryCleaningOrLaundry", "casino": "Casino",
    "stationery": "OfficeEquipmentStore", "outdoor": "SportingGoodsStore", "video_games": "Store",
    "variety_store": "Store", "mall": "ShoppingCenter", "photo": "Store", "printing": "ProfessionalService",
    "graphic_design": "ProfessionalService", "consulting": "ProfessionalService", "it": "ProfessionalService",
    "photographer": "ProfessionalService", "funeral_directors": "LocalBusiness", "tattoo": "HealthAndBeautyBusiness",
    "motorcycle_repair": "AutoRepair", "repair": "LocalBusiness",
}


def schema_type(r):
    return SCHEMA_TYPE.get((r.get("kind") or "").split(";")[0], "LocalBusiness")
