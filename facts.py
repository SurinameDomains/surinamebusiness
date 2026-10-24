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
    "low": 0.05,                # water, electricity, cooking gas, domestic freight (bijlage 4 since 1 Nov 2023; fuel moved to 10%)
    "luxury": 0.25,
    "threshold_srd": 1000000,
    "sources": [
        ("Belastingdienst Suriname: BTW algemeen", "https://belastingdienst.sr/btw/algemeen/"),
        ("Wet BTW 2022 (S.B. 2022 no. 121)", "https://belastingdienst.sr/wp-content/uploads/2026/01/BTWS.B.-2022-no.-121-WET-BTW-2022.pdf"),
        ("Wijziging Wet BTW, nieuwe bijlagen 1, 2 en 4 (S.B. 2023 no. 126)", "https://belastingdienst.sr/wp-content/uploads/2026/01/BTWS.B.-2023-no.-126-nadere-wijziging-WET-BTW-5-September-2023.pdf"),
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
    ("2026-03-03", "Holi Phagwa", "Holi Phagwa", "official"),
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
    ("2027-03-09", "Ied ul Fitr", "Eid al-Fitr", "expected"),
    ("2027-03-22", "Holi Phagwa", "Holi Phagwa", "expected"),
    ("2027-03-26", "Goede Vrijdag", "Good Friday", "official"),
    ("2027-03-29", "Tweede Paasdag", "Easter Monday", "official"),
    ("2027-05-01", "Dag van de Arbeid", "Labour Day", "official"),
    ("2027-05-16", "Ied ul Adha", "Eid al-Adha", "expected"),
    ("2027-07-01", "Keti Koti, Dag der Vrijheden", "Keti Koti, Emancipation Day", "official"),
    ("2027-08-09", "Dag der Inheemsen", "Indigenous Peoples Day", "official"),
    ("2027-10-10", "Dag der Marrons", "Maroons Day", "official"),
    ("2027-10-28", "Divali", "Divali", "expected"),
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

# Contact details for businesses, checked at the official pages on CONTACTS_CHECKED.
CONTACTS_CHECKED = "2026-10-21"
CONTACTS = [
    {"group": "tax", "name": ("Belastingdienst: hoofdkantoor Directoraat Belastingen", "Tax office: head office Directorate of Taxes"),
     "addr": "Kerkplein 12, Paramaribo", "phone": "1960 toestel 231 / 232", "web": "https://belastingdienst.sr/"},
    {"group": "tax", "name": ("Inspectie der Directe Belastingen (loonbelasting, inkomstenbelasting)", "Direct Taxes Inspectorate (wage tax, income tax)"),
     "addr": "Van Sommelsdijckstraat 27, Paramaribo", "phone": "1960 toestel 312 / 313"},
    {"group": "tax", "name": ("Inspectie Omzetbelasting (BTW)", "VAT Inspectorate"),
     "addr": "Van Sommelsdijckstraat 27, Paramaribo", "phone": "1960 toestel 345"},
    {"group": "tax", "name": ("Ontvangkantoor der Directe Belastingen (betalen)", "Direct Taxes Receiving Office (payments)"),
     "addr": "Van Sommelsdijckstraat 27, Paramaribo", "phone": "1960 toestel 305"},
    {"group": "tax", "name": ("Belastingkantoor Commewijne", "Tax office Commewijne"), "addr": "Oost-westverbinding 16", "phone": "1960 toestel 298 / 299"},
    {"group": "tax", "name": ("Belastingkantoor Nickerie", "Tax office Nickerie"), "addr": "Landingstraat 1, Nieuw-Nickerie", "phone": "212184 / 212175 / 321703 / 231452"},
    {"group": "customs", "name": ("Douane: Inspectie der Invoerrechten en Accijnzen", "Customs: Import Duties and Excise Inspectorate"),
     "addr": "Havenlaan 1, Paramaribo", "phone": "1960 toestel 161 / 162, direct 402626"},
    {"group": "customs", "name": ("Ontvangkantoor der Invoerrechten en Accijnzen", "Import Duties Receiving Office"), "addr": "Havenlaan 1, Paramaribo", "phone": "1960 toestel 151"},
    {"group": "customs", "name": ("Visitatiepost Nieuwe Haven", "Customs post Nieuwe Haven"), "addr": "Nieuwe Haven, Paramaribo", "phone": "403711 / 402541"},
    {"group": "customs", "name": ("Visitatiepost Albina", "Customs post Albina"), "addr": "Albina", "phone": "342022"},
    {"group": "customs", "name": ("Visitatiepost Nieuw-Nickerie", "Customs post Nieuw-Nickerie"), "addr": "Nieuw-Nickerie", "phone": "231710 / 231435"},
    {"group": "business", "name": ("Kamer van Koophandel en Fabrieken (KKF)", "Chamber of Commerce and Industry (KKF)"),
     "addr": "Gravenberchstraat 33, Paramaribo", "phone": "530311", "web": "https://www.surinamechamber.com/"},
    {"group": "business", "name": ("Ministerie van Economische Zaken, Ondernemerschap en Technologische Innovatie (EZOTI)", "Ministry of Economic Affairs, Entrepreneurship and Technological Innovation (EZOTI)"),
     "addr": "Havenlaan 1, Paramaribo", "phone": "402080",
     "web": "https://gov.sr/ministeries/ministerie-van-economische-zaken-ondernemerschap-technologische-innovatie/"},
    {"group": "business", "name": ("KMO Unit (kleine en middelgrote ondernemingen)", "SME Unit (small and medium-sized enterprises)"),
     "addr": "Kantongebouw, Frederik Derbystraat, Paramaribo", "phone": "420029, WhatsApp 8951447"},
    {"group": "business", "name": ("Surinaams Standaarden Bureau (SSB)", "Suriname Standards Bureau (SSB)"),
     "addr": "Frederik Derbystraat 81, Paramaribo", "phone": "499928 / 499929", "web": "https://www.ssb.sr/"},
    {"group": "business", "name": ("Suriname Business Forum (SBF)", "Suriname Business Forum (SBF)"),
     "addr": "Anton Drachtenweg 68 (RCR Medical Centre, 1e etage), Paramaribo", "phone": "852 0258 / 818 4065", "web": "https://www.surinamebusinessforum.com/"},
]
CONTACT_SOURCES = [
    ("Belastingdienst Suriname: contact", "https://belastingdienst.sr/contact/"),
    ("Ministerie van EZOTI: contact", "https://gov.sr/ministeries/ministerie-van-economische-zaken-ondernemerschap-technologische-innovatie/contact/"),
]
TAX_OFFICE_HOURS = (("maandag tot en met donderdag 07:30 tot 14:00, vrijdag 07:30 tot 13:00, weekend gesloten",
                     "Monday to Thursday 07:30 to 14:00, Friday 07:30 to 13:00, closed at weekends"))
