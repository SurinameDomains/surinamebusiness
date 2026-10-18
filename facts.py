"""Hand-checked facts. Every value carries its source and the date it was checked.

Review every January (new tax year) and whenever a decree changes a value.
The calculators read these values from the generated page, so updating this
file and rebuilding updates every tool.
"""

CHECKED = "2026-10-17"

TAX = {
    "year": 2026,
    "free_month": 9000,            # belastingvrije som per month (SRD 108,000/yr)
    "forfait_pct": 0.04,           # forfaitaire aftrek beroepskosten
    "forfait_max_month": 400,      # max SRD 4,800/yr
    # monthly brackets on taxable wage AFTER the tax-free amount: (upper bound, rate)
    "brackets_month": [(3500, 0.08), (7000, 0.18), (10500, 0.28), (None, 0.38)],
    # bijzondere beloningen (art. 17a), same bands
    "special_rates": [0.05, 0.15, 0.25, 0.35],
    # overtime table (art. 17c), monthly overtime pay
    "overtime_brackets_month": [(2500, 0.05), (7500, 0.15), (None, 0.25)],
    "holiday_allowance_exempt_year": 19500,
    "bonus_exempt_year": 19500,
    "aov_pct": 0.04,
    "sources": [
        ("S.B. 2024 no. 2, Staatsbesluit uitvoering artikel 18a Wet Loonbelasting",
         "https://www.sris.sr/wp-content/uploads/2024/01/S.B.-2024-no.-2-STAATSBESLUIT-11-januari-2024-uitvoeringartikel-18a-Wet-Loonbelasting-S.B.-1981-no.-181-laatstelijk-gewijzigd-S.B.pdf"),
        ("S.B. 2025 no. 129, overwerktabel en vrijstelling vakantietoelage/gratificatie",
         "https://www.sris.sr/wp-content/uploads/2025/11/S.B.-2025-no.-129-STAATSBESLUIT-ter-uitvoering-van-artikel-18a-van-de-Wet-Loonbelasting.pdf"),
        ("Wet AOV, artikel 19 en 20 (premie 4% van zuiver loon)",
         "https://belastingdienst.sr/wp-content/uploads/2024/10/Wet-AOV.pdf"),
    ],
}

MIN_WAGE = {
    "hour": 61.25,
    "previous_hour": 52.47,
    "effective": "2026-07-01",
    "previous_effective": "2025-04-01",
    "sources": [
        ("WageIndicator: minimum wage increased in Suriname from 1 July 2026",
         "https://wageindicator.org/ai/work/minimum-wage/updates/2026/minimum-wage-increased-in-suriname-from-01-july-2026-july-26-2026/"),
        ("Dagblad Suriname: nieuw minimumuurloon stijgt naar SRD 61,25",
         "https://www.dbsuriname.com/2026/06/29/nieuw-minimumuurloon-stijgt-naar-srd-6125/"),
    ],
}

VAT = {
    "since": "2023-01-01",
    "standard": 0.10,
    "fuel": 0.05,
    "luxury": 0.25,
    "threshold_srd": 1000000,
    "sources": [
        ("Belastingdienst Suriname: BTW algemeen", "https://belastingdienst.sr/btw/algemeen/"),
        ("Wet BTW bijlage 1, nultarief", "https://belastingdienst.sr/wp-content/uploads/2023/01/Wet-BTW-Bijlage-1-nultarief-na-wijziging.pdf"),
        ("Wet BTW bijlage 3, tarief 25%", "https://belastingdienst.sr/wp-content/uploads/2023/01/Wet-BTW-Bijlage-3-Tarief-25-na-wijziging.pdf"),
        ("Wet BTW bijlage 4, tarief 5%", "https://belastingdienst.sr/wp-content/uploads/2023/01/Wet-BTW-Bijlage-4-tarief-5-na-wijziging.pdf"),
    ],
}

LABOUR = {
    "max_day": 8.5,
    "max_week": 48,
    "ot_normal": 1.5,
    "ot_rest": 2.0,
    "holiday_work": 2.0,
    "holiday_work_no_rest": 3.0,
    "vacation_days_first": 12,
    "vacation_days_max": 18,
    "sources": [
        ("Arbeidswet (De Nationale Assemblee)", "https://www.dna.sr/media/cwabf0np/arbeidswet.pdf"),
        ("Doing Business Dutch Caribbean: annual leave Suriname", "https://www.doingbusinessdutchcaribbean.com/suriname/employment-sur/annual-leave-sur/"),
    ],
}

# Official days off (Besluit Rustdagen 1971, as amended S.B. 2021 no. 26).
# "status": official = in the list published by the government for that year;
# expected = date follows from the calendar or religious bodies, not yet confirmed.
HOLIDAYS = [
    ("2026-01-01", "Nieuwjaarsdag", "New Year's Day", "official"),
    ("2026-02-17", "Chinees Nieuwjaar", "Chinese New Year", "official"),
    ("2026-03-04", "Holi Phagwa", "Holi Phagwa", "official"),
    ("2026-03-20", "Ied ul Fitr", "Eid al-Fitr", "official"),
    ("2026-04-03", "Goede Vrijdag", "Good Friday", "official"),
    ("2026-04-06", "Tweede Paasdag", "Easter Monday", "official"),
    ("2026-05-01", "Dag van de Arbeid", "Labour Day", "official"),
    ("2026-05-27", "Ied ul Adha", "Eid al-Adha", "official"),
    ("2026-07-01", "Keti Koti, Dag der Vrijheden", "Keti Koti, Emancipation Day", "official"),
    ("2026-08-09", "Dag der Inheemsen", "Indigenous Peoples Day", "official"),
    ("2026-10-10", "Dag der Marrons", "Maroons Day", "official"),
    ("2026-11-08", "Divali", "Divali", "expected"),
    ("2026-11-25", "Onafhankelijkheidsdag", "Independence Day", "official"),
    ("2026-12-25", "Eerste Kerstdag", "Christmas Day", "official"),
    ("2026-12-26", "Tweede Kerstdag", "Boxing Day", "official"),
    ("2027-01-01", "Nieuwjaarsdag", "New Year's Day", "official"),
    ("2027-02-06", "Chinees Nieuwjaar", "Chinese New Year", "expected"),
    ("2027-03-26", "Goede Vrijdag", "Good Friday", "official"),
    ("2027-03-29", "Tweede Paasdag", "Easter Monday", "official"),
    ("2027-05-01", "Dag van de Arbeid", "Labour Day", "official"),
    ("2027-07-01", "Keti Koti, Dag der Vrijheden", "Keti Koti, Emancipation Day", "official"),
    ("2027-08-09", "Dag der Inheemsen", "Indigenous Peoples Day", "official"),
    ("2027-10-10", "Dag der Marrons", "Maroons Day", "official"),
    ("2027-11-25", "Onafhankelijkheidsdag", "Independence Day", "official"),
    ("2027-12-25", "Eerste Kerstdag", "Christmas Day", "official"),
    ("2027-12-26", "Tweede Kerstdag", "Boxing Day", "official"),
]
HOLIDAY_SOURCES = [
    ("S.B. 2021 no. 26, wijziging Besluit Rustdagen 1971",
     "https://gov.sr/wp-content/uploads/2022/05/sb-2021-no-26_-staatsbesluit-van-19-februari-2021-houdende-nadere-wijziging-van-het-besluit-rustdagen-1971-gb-1971-no-77-zoals.pdf"),
    ("MinOWC: vakanties en vrije dagen schooljaar 2025-2026",
     "https://gov.sr/bekendmaking/herziene-vakantieregeling-25-26/vakantie-en-vrijedagen-schooljaar-2025-2026/"),
]

GRANMORGU = {
    "fid": "2024-10-01",
    "investment_bn_usd": 10.5,
    "capacity_bpd": 220000,
    "reserves_mbbl": 750,
    "first_oil": 2028,
    "shares": [("TotalEnergies (operator)", 40), ("APA Corporation", 40), ("Staatsolie", 20)],
    "fields": "Sapakara South, Krabdagu",
    "block": "Block 58",
    "distance_km": 150,
    "local_content_usd_bn": 1,
    "jobs": 6000,
    "staatsolie_local_2025_musd": 107,
    "partners_local_2025_musd": 260,
    "new_suppliers_2025": 731,
    "progress_end_2025": 28,
    "sources": [
        ("TotalEnergies: final investment decision GranMorgu",
         "https://corporate.totalenergies.no/news-overview/suriname-totalenergies-announces-final-investment-decision-granmorgu-development-block"),
        ("Staatsolie: 2025 financial statements approved",
         "https://www.staatsolie.com/en/news/staatsolie-2025-financial-statements-approved-strong-results-and-us-400-million-contribution-to-the-state-treasury/"),
        ("Staatsolie Sustainability Report 2025",
         "https://www.staatsolie.com/media/ayshb3ga/staatsolie-sustainability-report-2025.pdf"),
        ("Staatsolie: opportunities for local suppliers", "https://www.staatsolie.com/en/local-content"),
    ],
}

PORTALS = {
    "ssrp": "https://staatsolie.dai-data.com/login",
    "ariba": "https://staatsolie.sourcing-eu.ariba.com/ad/selfRegistration",
    "staatsolie_tenders": "https://www.staatsolie.com/en/procurement-opportunities/",
    "gov_tenders": "https://gov.sr/aanbestedingen/",
    "gov_jobs": "https://gov.sr/vacatures/",
    "kkf": "https://www.surinamechamber.com/",
    "belastingdienst": "https://belastingdienst.sr/",
    "rvo_start": "https://www.rvo.nl/onderwerpen/landen-en-gebieden/suriname/zo-start-u-een-bedrijf-suriname",
    "handelsregisterbesluit": "https://www.sris.sr/wp-content/uploads/2025/05/S.B.-2025-no.-46-Handelsregisterbesluit.pdf",
    "frielink_bw": "https://www.curacao-law.com/wp-content/uploads/2026/07/Frielink-Nieuw-Boek-2-BW-Suriname-MvO-april-2026.pdf",
    "license": "https://www.doingbusinessdutchcaribbean.com/suriname/structures-for-doing-business-sur/business-license/",
}


# Vacantiewet 1975 (annual leave and leave allowance), checked 2026-10-18
LEAVE = {
    "first_year_days": 12,      # art. 7(1): after one full calendar year
    "extra_per_year": 2,        # art. 7(1): each further uninterrupted year
    "max_days": 18,             # art. 7(1)
    "per_month_first_year": 1,  # art. 7(3): incomplete first year, 1 day per full month
    "allowance_pct": 0.5,       # art. 10(1): half the wage during leave
    "sources": [("Vacantiewet 1975 (De Nationale Assemblee)", "https://www.dna.sr/media/egnb5dhm/vakantiewet.pdf")],
}

# Suriname cash in circulation (CBvS): notes incl. SRD 200 and 500 since March 2024, coins in cents
CASH = {
    "notes": [500, 200, 100, 50, 20, 10, 5],
    "coins": [2.5, 1, 0.25, 0.10, 0.05, 0.01],
    "sources": [("CBvS introduceert coupures van SRD 200 en SRD 500 (Keynews)", "https://keynews.sr/cbvs-introduceert-nieuwe-coupures-van-srd-200-en-srd-500")],
}

LABOUR_JS = {"max_day": LABOUR["max_day"], "max_week": LABOUR["max_week"], "ot_normal": LABOUR["ot_normal"],
             "ot_rest": LABOUR["ot_rest"], "min_hour": MIN_WAGE["hour"], **{k: LEAVE[k] for k in (
                 "first_year_days", "extra_per_year", "max_days", "per_month_first_year", "allowance_pct")}}

# subset handed to the browser calculators
TAX_JS = {k: TAX[k] for k in ("free_month", "forfait_pct", "forfait_max_month", "brackets_month",
                              "overtime_brackets_month", "aov_pct")}
