"""Business by district: the ten districts of Suriname (hub /districten-suriname, detail /district/<key>).

Checked 26 Oct 2026.

Population and area: ABS (Algemeen Bureau voor de Statistiek), Achtste Algemene Volkstelling (census 2012),
definitive results (Vol I, Sept 2013; district volumes I and II, March and April 2014). These are the most recent
OFFICIAL figures. The ninth census (Census 9, law adopted 4 Oct 2024, enumeration from late 2024, household listing
and follow-up rounds in 2025, PES recruitment Oct 2025) has not published results as of 26 Oct 2026, so we use 2012
and say so on the pages. Replace population/pop_year/pop_source when ABS publishes Census 9 results.

Ressorts: ABS census 2012 ressort tables; Paramacca (Sipaliwini) was split off from Tapanahony in 2019.
Wanica's three administrative ressorts (bestuursressorten): Besluit Ressortenindeling Wanica 2025, S.B. 2025 no. 111.
District administration: Wet Regionale Organen (S.B. 1989 no. 44, as amended).

Other sources are listed per district in `sources` (label, url). Text fields are tuples (nl, en);
`opportunities` is a list of (nl, en) tuples; `guides` lists extra site page keys to link from the detail page.
Field left out = not verified. Review when ABS publishes Census 9 and when the Corantijn bridge, the Albina ferry
or a big project changes.
"""

CHECKED = "2026-10-26"
POP_YEAR = 2012
POP_SOURCE = ("ABS, Achtste Algemene Volkstelling 2012 (definitieve resultaten)",
              "ABS (General Bureau of Statistics), Eighth Census 2012 (final results)")

# national totals, ABS census 2012
TOTAL_POP_2012 = 541638
TOTAL_AREA_KM2 = 163820

_ABS_VOL1 = ("ABS: Definitieve resultaten Census 8, bevolking en oppervlakte per district",
             "https://statistics-suriname.org/wp-content/uploads/2019/09/presentatie.pdf")
_ABS_PW = ("ABS: Census 8 districtsresultaten Paramaribo en Wanica (2014)",
           "https://www.statistics-suriname.org/wp-content/uploads/2019/03/presentatie-districts-resultaten-vol1-070314.pdf")
_ABS_VOL2 = ("ABS: Census 8 districtsresultaten Nickerie, Coronie, Saramacca, Commewijne en Para (2014)",
             "https://www.statistics-suriname.org/wp-content/uploads/2019/03/districtsresultaten_volii_finale.pdf")
_ABS_C9 = ("ABS: Census-pagina (status negende volkstelling)", "https://statistics-suriname.org/census/")
_RESSORTS = ("City Population: districten en ressorten met censuscijfers van het ABS",
             "https://www.citypopulation.de/en/suriname/admin/")
_EWL = ("Oost-Westverbinding: route, bruggen en veerdiensten (Wikipedia)",
        "https://en.wikipedia.org/wiki/East-West_Link_(Suriname)")
_STAATSOLIE = ("Staatsolie: onze activiteiten (olievelden, raffinaderij)", "https://www.staatsolie.com/en/our-business")
_SPCS = ("Staatsolie: SPCS (Tout Lui Faut en Afobaka)", "https://2026.staatsolie.com/en/about-staatsolie/our-subsidiaries/spcs/")
_FAI = ("FreshPlaza: Surinaamse bananenexport, FAI in Jarikaba en Nickerie (13 oktober 2025)",
        "https://www.freshplaza.com/europe/article/9772958/surinamese-banana-exports-back-in-focus-for-europe/")

DISTRICTS = [
    {
        "key": "paramaribo",
        "name": "Paramaribo",
        "capital": "Paramaribo",
        "area_km2": 182,
        "population": 240924,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": -0.8,
        "resorts": ["Beekhuizen", "Blauwgrond", "Centrum", "Flora", "Latour", "Livorno", "Munder", "Pontbuiten",
                    "Rainville", "Tammenga", "Weg naar Zee", "Welgelegen"],
        "activities": ("Handel, overheid, banken, haven, diensten, toerisme",
                       "Trade, government, banking, port, services, tourism"),
        "intro": (
            "Paramaribo is de hoofdstad en het economische centrum van Suriname. Hier zitten de ministeries, de banken, "
            "de zeehaven en de meeste bedrijven. Bij de census van 2012 woonden er 240.924 mensen, ruim 44% van het land, "
            "op maar 182 km².",
            "Paramaribo is the capital and economic centre of Suriname. It is home to the ministries, the banks, the "
            "seaport and most companies. At the 2012 census 240,924 people lived there, over 44% of the country, on just "
            "182 km²."),
        "economy": (
            "Handel, overheid, financiële dienstverlening, transport en toerisme dragen de stad. De meeste groothandels, "
            "importeurs, banken, verzekeraars en adviesbureaus hebben hier hun hoofdkantoor. De historische binnenstad staat "
            "sinds 2002 op de Werelderfgoedlijst van UNESCO en trekt toeristen. Voor de olie- en gassector wordt Paramaribo "
            "de uitvalsbasis: Kuldipsingh Port Facility tekende in november 2025 een contract van tien jaar met TotalEnergies "
            "voor een logistieke basis voor het GranMorgu-project (start in het eerste kwartaal van 2026), en Tenaris opende "
            "in juli 2026 een servicecentrum van 74.500 m² voor boorbuizen. Tussen 2004 en 2012 kromp de bevolking licht "
            "(-0,8%) terwijl Wanica, Para en Commewijne hard groeiden: veel van je klanten wonen dus net buiten de stad.",
            "Trade, government, financial services, transport and tourism carry the city. Most wholesalers, importers, "
            "banks, insurers and consultancies have their head office here. The historic inner city has been a UNESCO World "
            "Heritage site since 2002 and draws tourists. For oil and gas, Paramaribo is becoming the base: Kuldipsingh Port "
            "Facility signed a ten-year contract with TotalEnergies in November 2025 for a logistics base for the GranMorgu "
            "project (starting in the first quarter of 2026), and Tenaris opened a 74,500 m² service centre for drilling "
            "pipe in July 2026. Between 2004 and 2012 the population fell slightly (-0.8%) while Wanica, Para and Commewijne "
            "grew fast: many of your customers live just outside the city."),
        "infrastructure": (
            "De Dr. Jules Sedney Haven, met de containerterminal van DP World, is de belangrijkste zeehaven van het land. "
            "Binnenlandse en chartervluchten vertrekken van Zorg en Hoop; internationale vluchten gaan via de Johan Adolf "
            "Pengel luchthaven in Zanderij (Para). De Jules Wijdenbosch-brug (2000) verbindt de stad met Meerzorg in "
            "Commewijne en is deel van de Oost-Westverbinding van Albina naar Nieuw Nickerie.",
            "The Dr. Jules Sedney Harbour, with DP World's container terminal, is the country's main seaport. Domestic and "
            "charter flights leave from Zorg en Hoop; international flights go through Johan Adolf Pengel airport in "
            "Zanderij (Para). The Jules Wijdenbosch Bridge (2000) links the city with Meerzorg in Commewijne and is part of "
            "the East-West Link from Albina to Nieuw Nickerie."),
        "opportunities": [
            ("Diensten voor de olie- en gassector: logistiek, onderhoud, catering, beveiliging, huisvesting. Reken op strenge "
             "eisen voor veiligheid (HSE) en certificering.",
             "Services for oil and gas: logistics, maintenance, catering, security, housing. Expect strict safety (HSE) and "
             "certification requirements."),
            ("Zakelijke dienstverlening voor kleine bedrijven: boekhouding, IT, salarisadministratie, vertaling.",
             "Business services for small firms: bookkeeping, IT, payroll, translation."),
            ("Horeca en toerisme rond de historische binnenstad, met een vergunning van de districtscommissaris.",
             "Food, drink and tourism around the historic inner city, with a licence from the district commissioner."),
            ("Bezorging en online verkoop: veel klanten op een klein oppervlak.",
             "Delivery and online sales: many customers in a small area."),
        ],
        "practical": (
            "Inschrijving in het Handelsregister: KKF, Gravenberchstraat 33. Belastingen: Van Sommelsdijckstraat 27 "
            "(directe belastingen en BTW). Douane: Havenlaan 1. Paramaribo is verdeeld in meerdere bestuursressorten, elk "
            "met een eigen districtscommissaris. Vergunningen voor horeca, evenementen, standplaatsen en de Hinderwet vraag "
            "je aan bij het commissariaat van het gebied waar je zaak komt, bijvoorbeeld Paramaribo Noord-Oost aan de "
            "Van Sommelsdijckstraat.",
            "Trade register: KKF, Gravenberchstraat 33. Taxes: Van Sommelsdijckstraat 27 (direct taxes and VAT). Customs: "
            "Havenlaan 1. Paramaribo is split into several administrative areas, each with its own district commissioner. "
            "Licences for restaurants and bars, events, street stalls and the Nuisance Act are issued by the commissioner's "
            "office for the area where your business will be, for example Paramaribo North-East on Van Sommelsdijckstraat."),
        "guides": ["oilgas", "supplier", "import", "workpermit"],
        "sources": [
            _ABS_VOL1, _ABS_PW,
            ("UNESCO: Historic Inner City of Paramaribo", "https://whc.unesco.org/en/list/940/"),
            ("Kuldipsingh: contract met TotalEnergies voor een logistieke basis (november 2025)",
             "https://kuldipsingh.net/en/kuldipsingh-port-facility-signs-ten-year-contract-with-totalenergies-ep-suriname-for-integrated-logistics-base/"),
            ("Energy Now: Tenaris opent servicecentrum in Suriname (juli 2026)",
             "https://energynow.tt/blog/tenaris-inaugurates-new-service-center-in-suriname-to-support-totalenergiess-granmorgu-offshore-project"),
            ("DP World Paramaribo", "https://www.dpworld.com/nl-sr/ports-terminals/suriname/paramaribo"),
        ],
    },
    {
        "key": "wanica",
        "name": "Wanica",
        "capital": "Lelydorp",
        "area_km2": 443,
        "population": 118222,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 37.5,
        "resorts": ["De Nieuwe Grond", "Domburg", "Houttuin", "Koewarasan", "Kwatta", "Lelydorp", "Saramacca Polder"],
        "activities": ("Wonen en winkels, olieraffinaderij, stroomcentrale, tuinbouw",
                       "Suburbs and retail, oil refinery, power plant, horticulture"),
        "intro": (
            "Wanica ligt tussen Paramaribo en Para en is de snelst groeiende woonregio van het land: tussen 2004 en 2012 "
            "groeide de bevolking met 37,5% tot 118.222. Hoofdplaats is Lelydorp. Samen met Paramaribo woont hier twee "
            "derde van alle inwoners van Suriname.",
            "Wanica lies between Paramaribo and Para and is the country's fastest-growing residential area: between 2004 "
            "and 2012 its population grew 37.5% to 118,222. The capital is Lelydorp. Together with Paramaribo it is home "
            "to two thirds of Suriname's people."),
        "economy": (
            "Wanica combineert wonen, handel en industrie. In Tout Lui Faut staat de raffinaderij van Staatsolie "
            "(15.000 vaten per dag), die ruwe olie uit Saramacca krijgt via een pijpleiding van 55 km. Daar staat ook de "
            "thermische centrale van Staatsolie-dochter SPCS (96 MW), die stroom levert aan EBS. Langs de grote wegen, "
            "zoals in Kwatta en Lelydorp, groeien winkels, bouwmarkten en dienstverleners mee met de nieuwe woonwijken. "
            "In de landelijke ressorten wordt ook aan land- en tuinbouw gedaan.",
            "Wanica combines housing, trade and industry. Tout Lui Faut is home to Staatsolie's refinery (15,000 barrels a "
            "day), which receives crude from Saramacca through a 55 km pipeline. Staatsolie subsidiary SPCS runs a thermal "
            "power plant there (96 MW) that supplies EBS. Along the main roads, for example in Kwatta and Lelydorp, shops, "
            "building supply stores and service firms grow with the new housing estates. The rural ressorts also have "
            "farming and horticulture."),
        "infrastructure": (
            "De Indira Gandhiweg loopt van Paramaribo via Lelydorp naar de luchthaven in Zanderij. Tout Lui Faut ligt aan "
            "de Surinamerivier. Wanica valt binnen het stroomnet van EBS rond Groot-Paramaribo.",
            "Indira Gandhiweg runs from Paramaribo via Lelydorp to the airport at Zanderij. Tout Lui Faut lies on the "
            "Suriname River. Wanica is on the EBS power grid of Greater Paramaribo."),
        "opportunities": [
            ("Winkels en diensten in groeiwijken: supermarkt, apotheek, kinderopvang, kapper, bouwmaterialen.",
             "Shops and services in growing neighbourhoods: supermarket, pharmacy, childcare, hairdresser, building "
             "materials."),
            ("Toelevering en onderhoud voor de industrie rond Tout Lui Faut, via de leveranciersregistratie van Staatsolie.",
             "Supply and maintenance for industry around Tout Lui Faut, through Staatsolie's supplier registration."),
            ("Opslag en distributie tussen de stad, de luchthaven en het westen van het land.",
             "Storage and distribution between the city, the airport and the west of the country."),
            ("Verse groente en fruit voor de markten en supermarkten van Groot-Paramaribo.",
             "Fresh vegetables and fruit for the markets and supermarkets of Greater Paramaribo."),
            ("Bouw, installatie en onderhoud voor nieuwe woningen.",
             "Construction, installation and maintenance for new homes."),
        ],
        "practical": (
            "Sinds 29 augustus 2025 (Besluit Ressortenindeling Wanica 2025, S.B. 2025 no. 111) heeft Wanica drie "
            "bestuursressorten, elk met een eigen districtscommissaris: Centrum (Lelydorp en De Nieuwe Grond), Zuid-Oost "
            "(Houttuin en Domburg) en Noord-West (Kwatta, Koewarasan en Saramacca Polder). Lokale vergunningen vraag je aan "
            "bij het commissariaat van het bestuursressort waar je zaak ligt. Inschrijving bij de KKF en belastingzaken "
            "regel je in Paramaribo.",
            "Since 29 August 2025 (Wanica Ressort Division Decree 2025, S.B. 2025 no. 111) Wanica has three administrative "
            "areas, each with its own district commissioner: Centre (Lelydorp and De Nieuwe Grond), South-East (Houttuin and "
            "Domburg) and North-West (Kwatta, Koewarasan and Saramacca Polder). Apply for local licences at the "
            "commissioner's office of the area where your business is. KKF registration and tax matters are handled in "
            "Paramaribo."),
        "guides": ["supplier", "oilgas", "agri"],
        "sources": [
            _ABS_VOL1, _ABS_PW, _STAATSOLIE, _SPCS,
            ("Besluit Ressortenindeling Wanica 2025, S.B. 2025 no. 111",
             "https://www.sris.sr/wp-content/uploads/2025/10/Besluit-Ressortenindeling-Wanica-2025-S.B-2025-no.-111.pdf"),
        ],
    },
    {
        "key": "nickerie",
        "name": "Nickerie",
        "capital": "Nieuw Nickerie",
        "area_km2": 5353,
        "population": 34233,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": -6.6,
        "resorts": ["Groot Henar", "Nieuw Nickerie", "Oostelijke Polders", "Wageningen", "Westelijke Polders"],
        "activities": ("Rijst, bananen, mango, grenshandel met Guyana",
                       "Rice, bananas, mango, border trade with Guyana"),
        "intro": (
            "Nickerie in het uiterste westen is de rijstschuur van Suriname: meer dan 95% van de padie wordt hier geteeld. "
            "Hoofdplaats is Nieuw Nickerie, bij de monding van de Nickerierivier. Het district grenst aan Guyana; de "
            "veerboot over de Corantijn is de officiële wegverbinding met dat land.",
            "Nickerie in the far west is Suriname's rice bowl: more than 95% of the country's paddy is grown here. The "
            "capital is Nieuw Nickerie, at the mouth of the Nickerie River. The district borders Guyana; the ferry across "
            "the Corantijn (Corentyne) River is the official road link with that country."),
        "economy": (
            "Rijst domineert. In 2024 werd 290.665 ton natte padie geoogst, vrijwel alles in Nickerie, en Suriname "
            "exporteerde 45.404 ton rijst, voor ongeveer USD 27 miljoen; Jamaica is de grootste afnemer. Volgens een "
            "sectorstudie van de NOB (mei 2025) werken direct en indirect 4.000 tot 6.000 mensen in de rijstketen. In de "
            "najaarsoogst 2024 plantten 1.161 kleine boeren samen 10.356 ha. Bananenbedrijf FAI heeft 175 ha bananen in "
            "Nickerie, naast zijn plantage in Jarikaba (Saramacca). Sinds 2023 is een deel van het district door LVV erkend "
            "als vrij van de carambolavlieg en de mangozaadsnuitkever, waardoor mango weer naar Europa kan. Het "
            "rijstonderzoekscentrum ADRON staat ook in Nickerie. Tussen 2004 en 2012 daalde de bevolking met 6,6%.",
            "Rice dominates. In 2024 Suriname harvested 290,665 tonnes of wet paddy, almost all of it in Nickerie, and "
            "exported 45,404 tonnes of rice worth about USD 27 million; Jamaica is the largest buyer. According to a sector "
            "study by the national development bank NOB (May 2025), 4,000 to 6,000 people work directly and indirectly in "
            "the rice chain. In the autumn 2024 crop, 1,161 small farmers planted 10,356 ha between them. Banana company "
            "FAI has 175 ha of bananas in Nickerie, besides its plantation at Jarikaba (Saramacca). Since 2023 part of the "
            "district has been recognised by the Ministry of Agriculture (LVV) as free of the carambola fruit fly and the "
            "mango seed weevil, which lets mangoes go to Europe again. The ADRON rice research centre is also in Nickerie. "
            "Between 2004 and 2012 the population fell by 6.6%."),
        "infrastructure": (
            "De Oost-Westverbinding loopt van Nieuw Nickerie naar Paramaribo en verder naar Albina. Van Nieuw Nickerie is "
            "het 32 km naar South Drain, waar sinds 1998 de veerboot Canawaima naar Moleson Creek in Guyana vaart. In "
            "augustus 2026 lag de dienst ongeveer een week stil om veiligheids- en technische redenen: plan ruim. Over een "
            "brug over de Corantijn wordt al jaren gepraat. In 2026 wil de regering de brug zelf financieren, maar eind "
            "september 2026 hadden Suriname en Guyana nog geen nieuw akkoord; het oude MoU liep in november 2025 af. "
            "Havenbeheer Suriname beheert de haven van Nieuw Nickerie. De luchthaven Major Henk Fernandes heeft een baan "
            "van 700 m voor kleine toestellen.",
            "The East-West Link runs from Nieuw Nickerie to Paramaribo and on to Albina. From Nieuw Nickerie it is 32 km to "
            "South Drain, where the ferry Canawaima has sailed to Moleson Creek in Guyana since 1998. In August 2026 the "
            "service stopped for about a week over safety and technical issues: allow time. A bridge across the Corantijn "
            "has been discussed for years. In 2026 the government wants to finance it alone, but at the end of September "
            "2026 Suriname and Guyana still had no new agreement; the old MoU expired in November 2025. Havenbeheer "
            "Suriname manages the port of Nieuw Nickerie. Major Henk Fernandes airport has a 700 m runway for small "
            "aircraft."),
        "opportunities": [
            ("Mechanisatie, onderhoud en onderdelen voor rijstbedrijven; drogen en opslaan van padie.",
             "Machinery, maintenance and spare parts for rice farms; drying and storing paddy."),
            ("Waarde toevoegen aan rijst: verpakken onder eigen merk, breukrijst en zemelen verwerken tot meel of veevoer.",
             "Adding value to rice: packing under your own brand, processing broken rice and bran into flour or feed."),
            ("Mango en ander fruit voor export vanuit het fruitvliegvrije gebied, met registratie en traceercode bij LVV.",
             "Mangoes and other fruit for export from the fruit-fly-free area, with LVV registration and a traceability "
             "code."),
            ("Advies, inkoop en kredietbemiddeling voor de vele kleine rijstboeren (gemiddeld 8,9 ha).",
             "Advice, joint purchasing and credit brokering for the many small rice farmers (8.9 ha on average)."),
            ("Vervoer, opslag en diensten voor het grensverkeer met Guyana.",
             "Transport, storage and services for cross-border traffic with Guyana."),
        ],
        "practical": (
            "Belastingkantoor Nickerie: Landingstraat 1, Nieuw Nickerie. Douane: visitatiepost Nieuw Nickerie. Lokale "
            "vergunningen (horeca, evenementen, standplaatsen, Hinderwet): districtscommissariaat Nickerie. Inschrijving in "
            "het Handelsregister gaat via de KKF in Paramaribo; vraag de KKF of je stukken ook in het district kunt "
            "afgeven. Voor export van fruit: registratie als producent bij LVV.",
            "Tax office Nickerie: Landingstraat 1, Nieuw Nickerie. Customs: Nieuw Nickerie customs post. Local licences "
            "(food and drink, events, street stalls, Nuisance Act): district commissioner's office Nickerie. Trade register "
            "registration goes through the KKF in Paramaribo; ask the KKF whether you can also hand in documents in the "
            "district. For fruit exports: register as a producer with LVV."),
        "guides": ["agri", "export", "euexport", "tradeagreements"],
        "sources": [
            _ABS_VOL1, _ABS_VOL2,
            ("NOB: Sectorstudie Platform Rijstsector (mei 2025)",
             "https://www.nob.sr/wp-content/uploads/2025/09/Sectorstudie-Platform-Rijstsector.pdf"),
            _FAI,
            ("Keynews: Suriname herstart export manja naar Europa (18 mei 2023)",
             "https://keynews.sr/suriname-herstart-export-manja-naar-europa"),
            ("Kaieteur News: Canawaima-veerdienst (september 2026)",
             "https://kaieteurnewsonline.com/2026/09/05/canawaima-ferry-crisis-why-guyana-and-suriname-need-a-long-term-solution/"),
            ("De West: Suriname bereid Corantijnbrug te financieren (30 september 2026)",
             "https://dagbladdewest.com/2026/09/30/suriname-bereid-financiele-verantwoordelijkheid-voor-corantijnbrug-te-nemen/"),
            _EWL,
        ],
    },
    {
        "key": "coronie",
        "name": "Coronie",
        "capital": "Totness",
        "area_km2": 3902,
        "population": 3391,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 17.5,
        "resorts": ["Johanna Maria", "Totness", "Welgelegen"],
        "activities": ("Kokos, nieuwe landbouwprojecten, doorgaand verkeer",
                       "Coconut, new farming projects, through traffic"),
        "intro": (
            "Coronie ligt aan de kust tussen Saramacca en Nickerie en is met 3.391 inwoners (2012) het kleinste district "
            "naar bevolking. Hoofdplaats is Totness. Het district staat bekend om zijn kokospalmen en er lopen grote "
            "nieuwe landbouwprojecten.",
            "Coronie lies on the coast between Saramacca and Nickerie and, with 3,391 inhabitants (2012), is the smallest "
            "district by population. The capital is Totness. The district is known for its coconut palms and has large "
            "new farming projects under way."),
        "economy": (
            "Landbouw is de basis, met kokos als bekendste gewas. In september 2023 startte Pomeroon Caribbean Coconuts and "
            "Spices een kokosproject waarvoor ruim 65.000 palmen gepland zijn; de eerste fase beslaat ongeveer 1.250 ha bij "
            "de grens met Nickerie. Sinds februari 2024 maakt het ministerie van LVV ongeveer 10.000 ha klaar voor kokos, "
            "fruit, veeteelt en agrotoerisme. Drainage, dammen en het rijpen van de grond kosten volgens de minister drie "
            "tot vijf jaar. Rijst komt er niet, omdat lozing van landbouwchemicaliën bij het nabijgelegen natuurgebied "
            "verboden is.",
            "Farming is the base, with coconut as the best-known crop. In September 2023 Pomeroon Caribbean Coconuts and "
            "Spices started a coconut project with more than 65,000 palms planned; the first phase covers about 1,250 ha "
            "near the Nickerie border. Since February 2024 the Ministry of Agriculture (LVV) has been preparing about "
            "10,000 ha for coconut, fruit, livestock and agritourism. According to the minister, drainage, dams and soil "
            "ripening take three to five years. Rice will not be grown there, because discharging farm chemicals near the "
            "adjacent nature reserve is prohibited."),
        "infrastructure": (
            "De Oost-Westverbinding loopt door het district. De Coppenamebrug (1999) tussen Jenny en Boskamp verbindt "
            "Coronie met Saramacca. Goederen gaan over de weg naar Paramaribo of Nieuw Nickerie.",
            "The East-West Link runs through the district. The Coppename Bridge (1999) between Jenny and Boskamp connects "
            "Coronie with Saramacca. Goods travel by road to Paramaribo or Nieuw Nickerie."),
        "opportunities": [
            ("Verwerking van kokos: kokoswater, olie, kopra, vezel en kokosschalen, met de nieuwe aanplant als aanbod.",
             "Coconut processing: coconut water, oil, copra, fibre and shells, supplied by the new plantings."),
            ("Toelevering aan de landbouwprojecten: grondverzet, onderhoud, transport, voedsel en huisvesting voor "
             "werknemers.",
             "Supplying the farming projects: earthmoving, maintenance, transport, food and housing for workers."),
            ("Agrotoerisme, dat LVV in het nieuwe landbouwgebied voorziet.",
             "Agritourism, which LVV plans in the new farming area."),
            ("Eten, brandstof en overnachting voor doorgaand verkeer tussen Paramaribo en Nickerie.",
             "Food, fuel and overnight stays for traffic between Paramaribo and Nickerie."),
        ],
        "practical": (
            "Lokale vergunningen: districtscommissariaat Coronie in Totness. Inschrijving bij de KKF en belastingzaken regel "
            "je in Paramaribo. Grond aanvragen gaat via het ministerie dat over grondbeleid gaat, met advies van de "
            "districtscommissaris.",
            "Local licences: district commissioner's office Coronie in Totness. KKF registration and tax matters are "
            "handled in Paramaribo. Land applications go through the ministry responsible for land policy, with advice "
            "from the district commissioner."),
        "guides": ["agri", "land"],
        "sources": [
            _ABS_VOL1, _ABS_VOL2,
            ("Keynews: Coronie en Nickerie bereiden zich voor op investeringen (24 maart 2024)",
             "https://keynews.sr/coronie-en-nickerie-bereiden-zich-voor-op-investeringen-agrarische-sector"),
            ("Keynews: werknemers kokosproject moeten uit Coronie komen (1 oktober 2023)",
             "https://keynews.sr/werknemers-kokosproject-moeten-uit-coronie-komen"),
            _EWL,
        ],
    },
    {
        "key": "saramacca",
        "name": "Saramacca",
        "capital": "Groningen",
        "area_km2": 3636,
        "population": 17480,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 9.4,
        "resorts": ["Calcutta", "Groningen", "Jarikaba", "Kampong Baroe", "Tijgerkreek", "Wayamboweg"],
        "activities": ("Olie op land (Staatsolie), bananen, land- en tuinbouw",
                       "Onshore oil (Staatsolie), bananas, farming"),
        "intro": (
            "Saramacca, ten westen van Paramaribo en Wanica, is het oliedistrict op land: de drie onshore olievelden van "
            "Staatsolie liggen hier. Hoofdplaats is Groningen. In 2012 woonden er 17.480 mensen, de meesten in de "
            "ressorten Jarikaba en Tijgerkreek.",
            "Saramacca, west of Paramaribo and Wanica, is the onshore oil district: Staatsolie's three onshore oil fields "
            "are here. The capital is Groningen. In 2012 it had 17,480 inhabitants, most of them in the Jarikaba and "
            "Tijgerkreek ressorts."),
        "economy": (
            "Staatsolie wint ruwe olie in de velden Tambaredjo, Calcutta en Tambaredjo-Noordwest. Die olie, verkocht als "
            "Saramacca Crude, gaat via een pijpleiding van 55 km naar de raffinaderij in Tout Lui Faut (Wanica). In "
            "Jarikaba ligt de bananenplantage van FAI (Food and Agriculture Industries), het enige bananenbedrijf van het "
            "land: in 2025 was er 100 ha herplant en zou er nog eens 100 ha bij komen. FAI exporteert vooral naar Trinidad "
            "en Tobago, Barbados en Guyana. Verder is er land- en tuinbouw voor de markt in Paramaribo.",
            "Staatsolie produces crude oil in the Tambaredjo, Calcutta and Tambaredjo North-West fields. The oil, sold as "
            "Saramacca Crude, goes through a 55 km pipeline to the refinery at Tout Lui Faut (Wanica). Jarikaba is home to "
            "the banana plantation of FAI (Food and Agriculture Industries), the country's only banana company: by 2025 it "
            "had replanted 100 ha with another 100 ha planned. FAI exports mainly to Trinidad and Tobago, Barbados and "
            "Guyana. There is also farming for the Paramaribo market."),
        "infrastructure": (
            "De Oost-Westverbinding loopt door het district, met de brug over de Saramaccarivier tussen Hamburg en Uitkijk "
            "(2011) en de Coppenamebrug (1999) naar Coronie.",
            "The East-West Link runs through the district, with the Saramacca River bridge between Hamburg and Uitkijk "
            "(2011) and the Coppename Bridge (1999) to Coronie."),
        "opportunities": [
            ("Diensten voor de olievelden: onderhoud, transport, catering, schoonmaak, beveiliging. Schrijf je in als "
             "leverancier bij Staatsolie.",
             "Services for the oil fields: maintenance, transport, catering, cleaning, security. Register as a supplier "
             "with Staatsolie."),
            ("Toelevering aan de bananenteelt: verpakking, transport naar de haven, onderhoud van irrigatie.",
             "Supplying banana growing: packaging, transport to the port, irrigation maintenance."),
            ("Groente, fruit en verwerkte producten voor Paramaribo en Wanica.",
             "Vegetables, fruit and processed products for Paramaribo and Wanica."),
            ("Eten en diensten langs de Oost-Westverbinding.",
             "Food and services along the East-West Link."),
        ],
        "practical": (
            "Lokale vergunningen: districtscommissariaat Saramacca in Groningen. Inschrijving bij de KKF en belastingzaken "
            "regel je in Paramaribo.",
            "Local licences: district commissioner's office Saramacca in Groningen. KKF registration and tax matters are "
            "handled in Paramaribo."),
        "guides": ["oilgas", "supplier", "agri", "export"],
        "sources": [
            _ABS_VOL1, _ABS_VOL2,
            ("Staatsolie: Saramacca Crude", "https://2026.staatsolie.com/en/about-staatsolie/products/saramacca-crude/"),
            _STAATSOLIE, _FAI, _EWL,
        ],
    },
    {
        "key": "commewijne",
        "name": "Commewijne",
        "capital": "Nieuw Amsterdam",
        "area_km2": 2353,
        "population": 31420,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 27.5,
        "resorts": ["Alkmaar", "Bakkie", "Margaretha", "Meerzorg", "Nieuw Amsterdam", "Tamanredjo"],
        "activities": ("Landbouw, toerisme (plantages), wonen bij de stad",
                       "Farming, tourism (plantations), suburbs"),
        "intro": (
            "Commewijne ligt aan de overkant van de Surinamerivier en is sinds 2000 via de Jules Wijdenbosch-brug met "
            "Paramaribo verbonden. Hoofdplaats is Nieuw Amsterdam; Meerzorg is met 12.405 inwoners (2012) de grootste kern. "
            "Tussen 2004 en 2012 groeide het district met 27,5% tot 31.420 inwoners.",
            "Commewijne lies across the Suriname River and has been linked to Paramaribo by the Jules Wijdenbosch Bridge "
            "since 2000. The capital is Nieuw Amsterdam; Meerzorg, with 12,405 inhabitants (2012), is the largest town. "
            "Between 2004 and 2012 the district grew 27.5% to 31,420 inhabitants."),
        "economy": (
            "Commewijne was in de 18e eeuw het belangrijkste plantagegebied, en de economie draait nog grotendeels op "
            "landbouw. De suikerfabriek Mariënburg sloot in 1986. Nu groeien vooral wonen, handel en toerisme: dagtochten "
            "naar oude plantages, Fort Nieuw Amsterdam (1747) en het natuurgebied Braamspunt, waar zeeschildpadden nesten. "
            "Meerzorg is aangewezen als regionaal centrum, en bedrijven en banken openen er vestigingen.",
            "In the 18th century Commewijne was the main plantation area, and its economy still largely runs on farming. "
            "The Mariënburg sugar factory closed in 1986. What grows now is housing, trade and tourism: day trips to old "
            "plantations, Fort Nieuw Amsterdam (1747) and the Braamspunt nature reserve, where sea turtles nest. Meerzorg "
            "has been designated a regional centre, and companies and banks are opening branches there."),
        "infrastructure": (
            "De Oost-Westverbinding loopt van Meerzorg via Tamanredjo en Moengo naar Albina (138 km). De brug over de "
            "Commewijnerivier bij Stolkertsijver dateert van 1980.",
            "The East-West Link runs from Meerzorg via Tamanredjo and Moengo to Albina (138 km). The bridge over the "
            "Commewijne River near Stolkertsijver dates from 1980."),
        "opportunities": [
            ("Dag- en agrotoerisme: rondleidingen, fietsverhuur, eten en overnachten op plantages.",
             "Day trips and agritourism: guided tours, bike rental, food and stays on plantations."),
            ("Winkels en diensten in de groeiende kernen Meerzorg en Tamanredjo.",
             "Shops and services in the growing towns of Meerzorg and Tamanredjo."),
            ("Land- en tuinbouw voor de markt in Paramaribo, aan de overkant van de brug.",
             "Farming for the Paramaribo market, just across the bridge."),
            ("Bouw, installatie en onderhoud voor nieuwe woonwijken.",
             "Construction, installation and maintenance for new housing estates."),
        ],
        "practical": (
            "Belastingkantoor Commewijne: Oost-Westverbinding 16 (1960 toestel 298 of 299). Lokale vergunningen: "
            "districtscommissariaat Commewijne. Inschrijving bij de KKF regel je in Paramaribo.",
            "Tax office Commewijne: Oost-Westverbinding 16 (1960 extension 298 or 299). Local licences: district "
            "commissioner's office Commewijne. KKF registration is handled in Paramaribo."),
        "guides": ["agri", "land"],
        "sources": [
            _ABS_VOL1, _ABS_VOL2, _RESSORTS,
            ("Commewijne District (Wikipedia)", "https://en.wikipedia.org/wiki/Commewijne_District"),
            _EWL,
        ],
    },
    {
        "key": "marowijne",
        "name": "Marowijne",
        "capital": "Albina",
        "area_km2": 4627,
        "population": 18294,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 9.9,
        "resorts": ["Albina", "Galibi", "Moengo", "Moengotapoe", "Patamacca", "Wanhatti"],
        "activities": ("Goud (Merian), grenshandel met Frans-Guyana, voormalige bauxiet",
                       "Gold (Merian), border trade with French Guiana, former bauxite"),
        "intro": (
            "Marowijne in het noordoosten grenst aan Frans-Guyana. Hoofdplaats is Albina aan de Marowijnerivier, maar "
            "Moengo is met 10.834 inwoners (2012) de grootste kern. Het district telde 18.294 inwoners.",
            "Marowijne in the north-east borders French Guiana. The capital is Albina on the Marowijne (Maroni) River, but "
            "Moengo, with 10,834 inhabitants (2012), is the largest town. The district had 18,294 inhabitants."),
        "economy": (
            "Moengo is ontstaan als bauxietstad; Suralco stopte in 2015 met de bauxietwinning in Suriname. Een grote "
            "werkgever in de regio is nu de goudmijn Merian, van Newmont (75%) en Staatsolie (25%), ongeveer 66 km ten "
            "zuiden van Moengo en sinds oktober 2016 in productie. Albina leeft van het grensverkeer en de handel met "
            "Saint-Laurent-du-Maroni. Bij Galibi aan de kust liggen inheemse dorpen en stranden waar zeeschildpadden "
            "nesten.",
            "Moengo began as a bauxite town; Suralco stopped mining bauxite in Suriname in 2015. A major employer in the "
            "area is now the Merian gold mine, owned by Newmont (75%) and Staatsolie (25%), about 66 km south of Moengo "
            "and producing since October 2016. Albina lives off border traffic and trade with Saint-Laurent-du-Maroni. "
            "Galibi on the coast has Indigenous villages and beaches where sea turtles nest."),
        "infrastructure": (
            "De Oost-Westverbinding loopt van Meerzorg naar Albina (138 km). Vanuit Albina vaart sinds 1969 een veerpont "
            "over de Marowijne naar Saint-Laurent-du-Maroni in Frans-Guyana. In 2023 werd met EU-geld een nieuwe "
            "aanlegsteiger in Albina gebouwd voor een grotere veerboot. Er is een douanepost in Albina. Veel "
            "personenverkeer gaat per korjaal over de rivier.",
            "The East-West Link runs from Meerzorg to Albina (138 km). Since 1969 a car ferry has crossed the Marowijne "
            "from Albina to Saint-Laurent-du-Maroni in French Guiana. In 2023 a new landing at Albina was built with EU "
            "funds for a larger ferry. There is a customs post in Albina. Many passengers cross the river by dugout boat "
            "(korjaal)."),
        "opportunities": [
            ("Diensten voor reizigers en handel tussen Suriname en Frans-Guyana: vervoer, eten, overnachting, opslag.",
             "Services for travellers and trade between Suriname and French Guiana: transport, food, accommodation, "
             "storage."),
            ("Toelevering aan de mijnbouw: transport, onderhoud, catering, beveiliging, via de leveranciersprocedure van "
             "de mijn.",
             "Supplying the mine: transport, maintenance, catering, security, through the mine's supplier procedure."),
            ("Natuur- en cultuurtoerisme richting Galibi, samen met de dorpen.",
             "Nature and cultural tourism towards Galibi, together with the villages."),
            ("Technische vakopleidingen (monteur, lasser, chauffeur zwaar materieel) voor werk in de mijnbouw.",
             "Technical training (mechanic, welder, heavy equipment operator) for mining jobs."),
        ],
        "practical": (
            "Douane: visitatiepost Albina. Lokale vergunningen: districtscommissariaat Marowijne. Inschrijving bij de KKF en "
            "belastingzaken regel je in Paramaribo. Werk je ook voor klanten in Frans-Guyana, dan gelden daar Franse en "
            "Europese regels voor je dienst of product.",
            "Customs: Albina customs post. Local licences: district commissioner's office Marowijne. KKF registration and "
            "tax matters are handled in Paramaribo. If you also serve customers in French Guiana, French and EU rules apply "
            "to your service or product there."),
        "guides": ["gold", "euexport", "supplier", "import"],
        "sources": [
            _ABS_VOL1, _RESSORTS,
            ("Newmont: Merian", "https://operations.newmont.com/latin-america/merian"),
            ("Daily Herald: Merian in productie in district Marowijne (2016)",
             "https://thedailyherald.sx/regional/new-industrial-gold-mine-starts-up-in-suriname"),
            ("Pulitzer Center: Paranam en het einde van Suralco (2017)",
             "https://pulitzercenter.org/reporting/jungle-slowly-returns-paranam"),
            ("Overheid: start nieuwe steiger Albina (juni 2023)",
             "https://gov.sr/wp-content/uploads/2023/06/Communique-startsein-nieuwe-steiger-te-Albina-Fin.pdf"),
            _EWL,
        ],
    },
    {
        "key": "para",
        "name": "Para",
        "capital": "Onverwacht",
        "area_km2": 5393,
        "population": 24700,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 31.7,
        "resorts": ["Bigi Poika", "Carolina", "Noord", "Oost", "Zuid"],
        "activities": ("Internationale luchthaven, hout, landbouw, recreatie",
                       "International airport, timber, farming, recreation"),
        "intro": (
            "Para ligt ten zuiden van Paramaribo en Wanica. Hoofdplaats is Onverwacht. Hier ligt de internationale "
            "luchthaven Johan Adolf Pengel in Zanderij. De bevolking groeide tussen 2004 en 2012 met 31,7% tot 24.700.",
            "Para lies south of Paramaribo and Wanica. The capital is Onverwacht. It is home to Johan Adolf Pengel "
            "International Airport at Zanderij. The population grew 31.7% between 2004 and 2012 to 24,700."),
        "economy": (
            "Para was lang het hart van de bauxietindustrie. De aluinaarderaffinaderij van Suralco in Paranam lag vanaf "
            "november 2015 stil, en in januari 2017 maakte Alcoa bekend dat ze definitief sloot. Nu zijn bosbouw (in het "
            "zuiden), landbouw (onder meer cassave, kousenband en ananas) en recreatie langs kreken en in de savanne "
            "belangrijk. In het district liggen veel inheemse dorpen.",
            "Para was long the heart of the bauxite industry. Suralco's alumina refinery at Paranam was idled in November "
            "2015, and in January 2017 Alcoa announced its permanent closure. Today forestry (in the south), farming (among "
            "others cassava, yard-long beans and pineapple) and recreation along creeks and in the savanna matter most. The "
            "district has many Indigenous villages."),
        "infrastructure": (
            "De Indira Gandhiweg verbindt Paramaribo via Lelydorp met de luchthaven in Zanderij, de belangrijkste "
            "internationale luchthaven van het land. De weg naar Afobaka en Brokopondo loopt door Para.",
            "Indira Gandhiweg links Paramaribo via Lelydorp with the airport at Zanderij, the country's main international "
            "airport. The road to Afobaka and Brokopondo runs through Para."),
        "opportunities": [
            ("Diensten rond de luchthaven: vervoer, opslag, luchtvracht, catering, overnachting.",
             "Airport services: transport, storage, air cargo, catering, accommodation."),
            ("Recreatieoorden en dagtoerisme voor inwoners van Groot-Paramaribo.",
             "Recreation parks and day trips for people from Greater Paramaribo."),
            ("Hout en houtverwerking, met registratie en keuring door SBB.",
             "Timber and wood processing, with registration and inspection by SBB."),
            ("Ananas, cassave en verwerkte producten (cassavebrood, sappen) voor de stad.",
             "Pineapple, cassava and processed products (cassava bread, juices) for the city."),
        ],
        "practical": (
            "Lokale vergunningen: districtscommissariaat Para in Onverwacht. Inschrijving bij de KKF en belastingzaken "
            "regel je in Paramaribo. Raakt je activiteit het gebied van een inheems dorp, overleg dan eerst met het "
            "dorpsbestuur (kapitein).",
            "Local licences: district commissioner's office Para in Onverwacht. KKF registration and tax matters are "
            "handled in Paramaribo. If your activity affects the area of an Indigenous village, talk to the village "
            "leadership (kapitein) first."),
        "guides": ["agri", "land", "export"],
        "sources": [
            _ABS_VOL1, _ABS_VOL2,
            ("Pulitzer Center: Paranam en het einde van Suralco (2017)",
             "https://pulitzercenter.org/reporting/jungle-slowly-returns-paranam"),
            ("Para District (Wikipedia)", "https://en.wikipedia.org/wiki/Para_District"),
            ("Johan Adolf Pengel International Airport (Wikipedia)",
             "https://en.wikipedia.org/wiki/Johan_Adolf_Pengel_International_Airport"),
        ],
    },
    {
        "key": "brokopondo",
        "name": "Brokopondo",
        "capital": "Brokopondo",
        "area_km2": 7364,
        "population": 15909,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 11.9,
        "resorts": ["Brokopondo Centrum", "Brownsweg", "Klaaskreek", "Kwakoegron", "Marchallkreek", "Sarakreek"],
        "activities": ("Waterkracht (Afobaka), goud (Rosebel en kleinschalig), toerisme",
                       "Hydropower (Afobaka), gold (Rosebel and small-scale), tourism"),
        "intro": (
            "Brokopondo ligt in het binnenland ten zuiden van Para. Hoofdplaats is Brokopondo. Het district is bekend om "
            "het stuwmeer en de dam bij Afobaka, die een groot deel van de stroom van het land levert, en om goudwinning. "
            "In 2012 woonden er 15.909 mensen.",
            "Brokopondo lies in the interior south of Para. The capital is Brokopondo. The district is known for the "
            "reservoir and the dam at Afobaka, which supplies a large share of the country's electricity, and for gold "
            "mining. In 2012 it had 15,909 inhabitants."),
        "economy": (
            "De waterkrachtcentrale bij Afobaka (189 MW) is sinds 1 januari 2020 in handen van Staatsolie en wordt door "
            "dochter SPCS beheerd. De goudmijn Rosebel ligt ongeveer 80 km ten zuiden van Paramaribo in Brokopondo en "
            "Sipaliwini; Zijin Mining is sinds 1 februari 2023 eigenaar. Daarnaast is er veel kleinschalige goudwinning. "
            "Toerisme rond het stuwmeer en in het Brownsberg Natuurpark (12.250 ha, sinds 1969) is een tweede pijler. Grote landbouw is "
            "lastig; er wordt vooral mais, pinda en ananas geteeld.",
            "The hydroelectric plant at Afobaka (189 MW) has been owned by Staatsolie since 1 January 2020 and is run by "
            "its subsidiary SPCS. The Rosebel gold mine lies about 80 km south of Paramaribo in Brokopondo and Sipaliwini; "
            "Zijin Mining has owned it since 1 February 2023. There is also a lot of small-scale gold mining. Tourism "
            "around the reservoir and in Brownsberg Nature Park (12,250 ha, since 1969) is a second pillar. Large-scale farming is "
            "hard; mainly maize, peanuts and pineapple are grown."),
        "infrastructure": (
            "De Afobakaweg (1960) verbindt het stuwmeergebied met Paramaribo. De stroom uit Afobaka gaat naar het net van "
            "EBS.",
            "The Afobaka road (1960) links the reservoir area with Paramaribo. Power from Afobaka feeds the EBS grid."),
        "opportunities": [
            ("Toerisme rond het stuwmeer en Brownsberg: lodges, boottochten, gidsen, vervoer vanuit de stad.",
             "Tourism around the reservoir and Brownsberg: lodges, boat trips, guides, transport from the city."),
            ("Diensten voor de mijnbouw: transport, onderhoud, voedsel, huisvesting.",
             "Services for mining: transport, maintenance, food, housing."),
            ("Diensten voor kleinschalige goudwinners binnen de regels: onderdelen, brandstof, opkoop met vergunning.",
             "Services for small-scale gold miners within the rules: parts, fuel, licensed buying."),
            ("Voedsel uit de streek voor mijnkampen en toeristen.",
             "Local food for mining camps and tourists."),
        ],
        "practical": (
            "Lokale vergunningen: districtscommissariaat Brokopondo. Goudconcessies: Geologisch Mijnbouwkundige Dienst "
            "(GMD). Inschrijving bij de KKF en belastingzaken regel je in Paramaribo. Veel dorpen hebben een traditioneel "
            "gezag (granman, kapitein): maak afspraken met het dorpsbestuur voordat je in een dorpsgebied begint.",
            "Local licences: district commissioner's office Brokopondo. Gold concessions: Geological Mining Service (GMD). "
            "KKF registration and tax matters are handled in Paramaribo. Many villages have traditional authorities "
            "(granman, kapitein): make arrangements with the village leadership before you start in a village area."),
        "guides": ["gold", "land", "licences"],
        "sources": [
            _ABS_VOL1, _RESSORTS, _SPCS,
            ("Rosebel Gold Mines", "https://www.rosebelgoldmines.sr/"),
            ("Brokopondo District (Wikipedia)", "https://en.wikipedia.org/wiki/Brokopondo_District"),
        ],
    },
    {
        "key": "sipaliwini",
        "name": "Sipaliwini",
        "capital": None,
        "capital_note": ("Geen eigen hoofdplaats", "No capital of its own"),
        "area_km2": 130567,
        "population": 37065,
        "pop_year": POP_YEAR,
        "pop_source": POP_SOURCE,
        "growth_2004_2012": 8.6,
        "resorts": ["Boven Coppename", "Boven Saramacca", "Boven Suriname", "Coeroeni", "Kabalebo", "Paramacca",
                    "Tapanahony"],
        "activities": ("Kleinschalige goudwinning, hout, eco-toerisme, dorpseconomie",
                       "Small-scale gold, timber, eco-tourism, village economy"),
        "intro": (
            "Sipaliwini beslaat het hele zuiden van Suriname: 130.567 km², bijna 80% van het land, met 37.065 inwoners in "
            "2012. Het is het enige district zonder hoofdplaats; het wordt vanuit Paramaribo bestuurd. Er wonen vooral "
            "Marron- en inheemse gemeenschappen, in ruim 150 dorpen.",
            "Sipaliwini covers the whole south of Suriname: 130,567 km², almost 80% of the country, with 37,065 inhabitants "
            "in 2012. It is the only district without a capital; it is administered from Paramaribo. Most people are "
            "Maroon and Indigenous communities, living in more than 150 villages."),
        "economy": (
            "Belangrijke bronnen van inkomen zijn kleinschalige goudwinning, houtkap en toerisme, naast landbouw, jacht en "
            "visserij voor eigen gebruik. Een deel van het mijngebied van Rosebel ligt in Sipaliwini. Het Centraal "
            "Suriname Natuurreservaat staat sinds 2000 op de Werelderfgoedlijst van UNESCO; lodges in onder meer Boven "
            "Suriname trekken buitenlandse toeristen.",
            "Important sources of income are small-scale gold mining, logging and tourism, besides farming, hunting and "
            "fishing for own use. Part of the Rosebel mining area lies in Sipaliwini. The Central Suriname Nature Reserve has been a "
            "UNESCO World Heritage site since 2000; lodges in areas such as Upper Suriname (Boven Suriname) attract foreign "
            "tourists."),
        "infrastructure": (
            "Veel dorpen zijn alleen per boot of vliegtuig bereikbaar. In de jaren vijftig legde Operatie Grasshopper een "
            "reeks kleine landingsbanen aan; chartermaatschappijen vliegen vanaf Zorg en Hoop in Paramaribo. De zuidelijke "
            "Oost-Westverbinding loopt van Paramaribo via Bitagron naar Apoera.",
            "Many villages can only be reached by boat or plane. In the 1950s Operation Grasshopper built a series of small "
            "airstrips; charter airlines fly from Zorg en Hoop in Paramaribo. The southern East-West Link runs from "
            "Paramaribo via Bitagron to Apoera."),
        "opportunities": [
            ("Eco- en cultuurtoerisme samen met de dorpen: lodges, gidsen, boottransport.",
             "Eco and cultural tourism together with the villages: lodges, guides, boat transport."),
            ("Vervoer en logistiek: luchtvracht, bootvervoer, brandstof en bouwmaterialen naar het binnenland.",
             "Transport and logistics: air cargo, river transport, fuel and building materials to the interior."),
            ("Zonne-energie, waterzuivering en koeling voor dorpen zonder aansluiting op het net van EBS.",
             "Solar power, water treatment and refrigeration for villages without an EBS grid connection."),
            ("Diensten voor kleinschalige goudwinners binnen de regels.",
             "Services for small-scale gold miners within the rules."),
        ],
        "practical": (
            "Sinds 2020-2021 heeft elk ressort van Sipaliwini een eigen districtscommissaris. Volgens het ministerie van "
            "Regionale Ontwikkeling werken meerdere van hen in 2026 nog vanuit Paramaribo; vraag dus waar je terecht kunt. "
            "Paramacca is sinds 2019 een apart ressort, afgesplitst van Tapanahony. In de dorpen ligt het gezag ook bij "
            "traditionele leiders (granman, kapitein): vraag hun toestemming voor activiteiten in een dorpsgebied. "
            "Goudconcessies: GMD. Inschrijving bij de KKF en belastingzaken regel je in Paramaribo.",
            "Since 2020-2021 each Sipaliwini ressort has its own district commissioner. According to the Ministry of "
            "Regional Development several of them still worked from Paramaribo in 2026, so ask where to go. Paramacca has "
            "been a separate ressort since 2019, split off from Tapanahony. In the villages, authority also lies with "
            "traditional leaders (granman, kapitein): ask their consent for activities in a village area. Gold concessions: "
            "GMD. KKF registration and tax matters are handled in Paramaribo."),
        "guides": ["gold", "land", "licences"],
        "sources": [
            _ABS_VOL1, _RESSORTS,
            ("Resorts of Suriname, met Paramacca (Wikipedia)", "https://en.wikipedia.org/wiki/Resorts_of_Suriname"),
            ("Sipaliwini District (Wikipedia)", "https://en.wikipedia.org/wiki/Sipaliwini_District"),
            ("UNESCO: Central Suriname Nature Reserve", "https://whc.unesco.org/en/list/1017/"),
            ("Keynews: minister Huur over RO-hoofdkantoor en DC's in Sipaliwini (september 2026)",
             "https://keynews.sr/en/minister-huur-discusses-new-ro-headquarters-with-idb/"),
            _EWL,
        ],
    },
]

BY_KEY = {d["key"]: d for d in DISTRICTS}
