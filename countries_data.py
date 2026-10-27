"""Doing business by country: 13 partner countries of Suriname (hub /zakendoen-met-landen, detail /land/<key>).

Checked 26 Oct 2026.

Trade figures: UN Comtrade (public API, queried 26 Oct 2026), as reported by the PARTNER country ("mirror" data),
because Suriname's own export statistics put most exports (gold) under "areas not specified" and Suriname's
2024 and 2025 figures were not yet in Comtrade. "exp_musd" = the partner's imports from Suriname (= Suriname's
exports), "imp_musd" = the partner's exports to Suriname (= Suriname's imports), in USD million, year "trade_year".
Exceptions: United States uses the US Census Bureau (FT-900, customs basis); Curaçao and Aruba do not report to
Comtrade, so Suriname's own 2023 figures (ABS via Comtrade) are used. France includes its overseas departments
(French Guiana has reported as part of France since 1997). Imports are usually CIF and exports FOB, so the two
sides never match exactly.

Text fields are (nl, en) tuples; paragraphs inside a field are separated by a blank line ("\n\n").
`opportunities`, `watch_out` and `tldr` are lists of (nl, en). `guides` lists extra site page keys for the
detail page. `sources` is a list of (label, url). Field left out = not verified.

Review every January (new Comtrade year) and when a ferry, bridge, tariff or agreement changes. US tariffs
changed three times in 2025-2026: re-check before every update.
"""

CHECKED = "2026-10-26"

_COMTRADE = ("UN Comtrade: handelscijfers per land en product (opgevraagd 26 oktober 2026)", "https://comtradeplus.un.org/")
_EMB = ("Ministerie van Buitenlandse Zaken, Internationale Handel en Samenwerking: ambassades en consulaten van Suriname",
        "https://embassies.gov.sr/")
_PBM = ("Johan Adolf Pengel International Airport: luchtvaartmaatschappijen en bestemmingen (Wikipedia, oktober 2026)",
        "https://en.wikipedia.org/wiki/Johan_Adolf_Pengel_International_Airport")
_MISSIONS = ("Lijst van diplomatieke vertegenwoordigingen in Suriname (Wikipedia)",
             "https://en.wikipedia.org/wiki/List_of_diplomatic_missions_in_Suriname")
_EZOTI = ("EZOTI: Suriname Import-Export Gids (2024)", "https://ssb.sr/media/1455/suriname-import-export-gids-final-nl.pdf")
_CARIBEXPORT = ("Caribbean Export Development Agency", "https://carib-export.com/")
_GSPSBC = ("DPI Guyana: Guyana Suriname Private Sector Business Council (maart 2022)",
           "https://dpi.gov.gy/guyana-suriname-enhance-economic-ties-with-private-sector-business-council/")

COUNTRIES = [
    # ------------------------------------------------------------------ Netherlands
    {
        "key": "netherlands",
        "name": ("Nederland", "the Netherlands"),
        "short": ("Nederland", "Netherlands"),
        "flag": "\U0001F1F3\U0001F1F1",
        "region": "eu",
        "exp_musd": 15.6, "imp_musd": 286.2, "trade_year": 2025,
        "trade_src": ("CBS via UN Comtrade", "CBS via UN Comtrade"),
        "agree_short": ("EPA met de EU", "EU EPA"),
        "agree_sub": ("rechten- en quotavrij voor Surinaamse goederen", "duty and quota free for Surinamese goods"),
        "intro": (
            "Nederland is voor Surinaamse bedrijven vooral een leverancier: in 2025 kwam er voor USD 286 miljoen aan "
            "goederen uit Nederland, terwijl Nederland voor maar USD 16 miljoen uit Suriname kocht. De taal, de "
            "diaspora en de dagelijkse vluchten maken het de makkelijkste Europese markt om te testen.",
            "For Surinamese businesses the Netherlands is mainly a supplier: in 2025 USD 286 million worth of goods came "
            "from the Netherlands, while the Netherlands bought only USD 16 million from Suriname. The shared language, "
            "the diaspora and the daily flights make it the easiest European market to test."),
        "tldr": [
            ("Surinaamse goederen gaan rechten- en quotavrij de EU in onder de EPA, met een EUR.1 of oorsprongsverklaring.",
             "Surinamese goods enter the EU duty and quota free under the EPA, with an EUR.1 or origin declaration."),
            ("Nultarief is niet hetzelfde als vrije toegang: voedsel, planten, vis en hout moeten aan de EU-regels voldoen.",
             "A zero tariff is not free access: food, plants, fish and timber must meet EU rules."),
            ("Uit Nederland komen vooral machines, zuivel, auto's, elektrotechniek, medicijnen en dranken.",
             "Imports from the Netherlands are mainly machinery, dairy, vehicles, electrical goods, medicines and drinks."),
            ("Hulp: PUM (Nederlandse experts), CBI-marktstudies, RVO, de VSB en VNO-NCW, en de ambassades in Den Haag en Paramaribo.",
             "Help: PUM (Dutch experts), CBI market studies, RVO, VSB and VNO-NCW, and the embassies in The Hague and Paramaribo."),
        ],
        "trade": (
            "Volgens het Nederlandse statistiekbureau CBS (via UN Comtrade) exporteerde Nederland in 2025 voor USD 286,2 "
            "miljoen naar Suriname, iets meer dan in 2024 (USD 242,3 miljoen). De grootste posten waren machines (USD 55,9 "
            "miljoen), zuivel (USD 20,8 miljoen), voertuigen (USD 15,8 miljoen), elektrische apparatuur (USD 15,2 miljoen) en "
            "dranken (USD 12,8 miljoen). Een deel daarvan is wederuitvoer: goederen uit andere landen die via Rotterdam gaan.\n\n"
            "Andersom kocht Nederland in 2025 voor USD 15,6 miljoen uit Suriname: vooral vis (USD 5,8 miljoen), groente (USD 2,1 "
            "miljoen), bereide voedingsmiddelen zoals sauzen en kruiden (USD 2,0 miljoen) en hout (USD 1,8 miljoen). Dat is klein "
            "vergeleken met de Surinaamse export naar Zwitserland en de Verenigde Arabische Emiraten, waar het goud heen gaat.",
            "According to the Dutch statistics office CBS (via UN Comtrade), the Netherlands exported USD 286.2 million to "
            "Suriname in 2025, slightly more than in 2024 (USD 242.3 million). The largest items were machinery (USD 55.9 "
            "million), dairy (USD 20.8 million), vehicles (USD 15.8 million), electrical equipment (USD 15.2 million) and "
            "drinks (USD 12.8 million). Part of this is re-export: goods from other countries that pass through Rotterdam.\n\n"
            "In the other direction the Netherlands bought USD 15.6 million from Suriname in 2025: mainly fish (USD 5.8 "
            "million), vegetables (USD 2.1 million), prepared foods such as sauces and spices (USD 2.0 million) and timber "
            "(USD 1.8 million). That is small compared with Suriname's exports to Switzerland and the United Arab Emirates, "
            "where the gold goes."),
        "agreements": (
            "Nederland valt onder de Economic Partnership Agreement (EPA) tussen de EU en de CARIFORUM-landen. Goederen van "
            "Surinaamse oorsprong gaan zonder invoerrecht en zonder quotum de EU in, mits je een EUR.1-certificaat van de Douane "
            "of (tot EUR 6.000 per zending) een oorsprongsverklaring op de factuur meestuurt. Nederland en Suriname tekenden in "
            "2005 ook een investeringsbeschermingsovereenkomst. Andersom betaal je bij invoer uit Nederland gewoon het "
            "Surinaamse invoerrecht.",
            "The Netherlands falls under the Economic Partnership Agreement (EPA) between the EU and the CARIFORUM countries. "
            "Goods of Surinamese origin enter the EU without duty or quota, provided you send an EUR.1 certificate from Customs "
            "or (up to EUR 6,000 per shipment) an origin declaration on the invoice. The Netherlands and Suriname also signed an "
            "investment protection agreement in 2005. In the other direction, imports from the Netherlands pay the normal "
            "Surinamese import duty."),
        "market_access": (
            "Voor voedsel en landbouwproducten gelden de EU-regels: maximale residuen van bestrijdingsmiddelen, hygiëne (HACCP), "
            "etiketten in het Nederlands met allergenen en voedingswaarde, en een fytosanitair of gezondheidscertificaat. De "
            "Nederlandse Voedsel- en Warenautoriteit (NVWA) controleert bij binnenkomst; afgekeurde zendingen worden vernietigd of "
            "teruggestuurd. Vis kan alleen de EU in van bedrijven die op de EU-lijst staan. Hout moet voldoen aan de EU-regels "
            "tegen illegale houtkap en ontbossing.\n\n"
            "De meeste Surinaamse producten vinden hun weg via Surinaamse en Aziatische groothandels en toko's in Rotterdam, Den "
            "Haag en Amsterdam. Voor de gewone supermarkt heb je volume, een vaste kwaliteit en vaak een certificaat zoals "
            "GLOBALG.A.P. of BRC nodig. RVO publiceert per product welke eisen gelden.",
            "Food and farm products must meet EU rules: maximum pesticide residues, hygiene (HACCP), labels in Dutch with "
            "allergens and nutrition information, and a phytosanitary or health certificate. The Dutch Food and Consumer "
            "Product Safety Authority (NVWA) checks shipments on arrival; rejected shipments are destroyed or returned. Fish "
            "can only enter the EU from establishments on the EU list. Timber must meet the EU rules against illegal logging "
            "and deforestation.\n\n"
            "Most Surinamese products reach consumers through Surinamese and Asian wholesalers and shops in Rotterdam, The "
            "Hague and Amsterdam. For mainstream supermarkets you need volume, consistent quality and often a certificate such "
            "as GLOBALG.A.P. or BRC. RVO publishes the requirements per product."),
        "logistics": (
            "KLM en Surinam Airways vliegen rechtstreeks tussen Paramaribo (Zanderij) en Amsterdam. Voor kleine zendingen en "
            "verse producten is luchtvracht via die vluchten het gebruikelijke kanaal. Containers gaan per lijndienst tussen "
            "Noord-Europa (Rotterdam, Antwerpen) en Paramaribo; vaartijd, overslag en tarief vraag je bij je expediteur. Reken "
            "voor verse producten de koelketen van boer tot klant door voordat je een prijs geeft.",
            "KLM and Surinam Airways fly direct between Paramaribo (Zanderij) and Amsterdam. For small shipments and fresh "
            "produce, air freight on those flights is the usual channel. Containers go by liner service between Northern "
            "Europe (Rotterdam, Antwerp) and Paramaribo; ask your forwarder for transit time, transhipment and rates. For "
            "fresh produce, work out the cold chain from farm to customer before you quote a price."),
        "diplomatic": (
            "Suriname heeft een ambassade in Den Haag en een consulaat-generaal in Amsterdam. Nederland heeft een ambassade in "
            "Paramaribo, die ook Nederlandse bedrijven helpt die in Suriname willen ondernemen. Het koningspaar bracht van 1 tot "
            "3 december 2025 een staatsbezoek aan Suriname. Bij een bilateraal overleg op 1 december 2025 spraken beide "
            "regeringen een tweede Makandra-programma af, een samenwerkingsprogramma tussen overheden.",
            "Suriname has an embassy in The Hague and a consulate general in Amsterdam. The Netherlands has an embassy in "
            "Paramaribo, which also helps Dutch companies that want to do business in Suriname. The Dutch King and Queen made "
            "a state visit to Suriname from 1 to 3 December 2025. At bilateral talks on 1 December 2025 the two governments "
            "agreed on a second Makandra programme, a government-to-government cooperation programme."),
        "chambers": (
            "Tijdens het staatsbezoek, op 1 december 2025, tekenden de werkgeversorganisaties VSB en VNO-NCW een "
            "samenwerkingsovereenkomst (MoU) voor gezamenlijke handelsmissies, beurzen en netwerkbijeenkomsten. Verder is er de "
            "Suriname-Nederland Kamer van Koophandel, in 2018 opgericht bij de Surinaamse ambassade in Den Haag.\n\n"
            "Twee Nederlandse programma's zijn direct bruikbaar voor Surinaamse bedrijven. PUM stuurt ervaren Nederlandse "
            "vrijwilligers voor kortdurend advies en heeft vertegenwoordigers in Paramaribo; Suriname is een van de PUM-landen in "
            "Zuid-Amerika. CBI (onderdeel van RVO) publiceert gratis marktstudies over de Europese markt per productgroep, van "
            "groente en fruit tot specerijen en toerisme.",
            "During the state visit, on 1 December 2025, the employers' organisations VSB and VNO-NCW signed a memorandum of "
            "understanding (MoU) for joint trade missions, trade fairs and networking events. There is also the "
            "Suriname-Netherlands Chamber of Commerce, founded in 2018 at the Surinamese embassy in The Hague.\n\n"
            "Two Dutch programmes are directly useful for Surinamese businesses. PUM sends experienced Dutch volunteers for "
            "short advisory assignments and has representatives in Paramaribo; Suriname is one of PUM's countries in South "
            "America. CBI (part of RVO) publishes free studies of the European market per product group, from fruit and "
            "vegetables to spices and tourism."),
        "diaspora_note": (
            "In Nederland woont een grote Surinaamse gemeenschap. Dat is een markt voor Surinaamse producten (pepers, groente, "
            "sauzen, vis, snacks) en een bron van investeerders, klanten en kennis. Wat je als diaspora-ondernemer in Suriname "
            "regelt, staat in de gids over ondernemen vanuit de diaspora.",
            "A large Surinamese community lives in the Netherlands. It is a market for Surinamese products (peppers, "
            "vegetables, sauces, fish, snacks) and a source of investors, customers and know-how. What you need to arrange as "
            "a diaspora entrepreneur in Suriname is in the guide on doing business from the diaspora."),
        "opportunities": [
            ("Surinaamse specialiteiten (pepers, sauzen, kruiden, gedroogde en diepgevroren producten) voor diasporawinkels en horeca.",
             "Surinamese specialities (peppers, sauces, spices, dried and frozen products) for diaspora shops and restaurants."),
            ("Diensten op afstand in het Nederlands: klantenservice, administratie, softwareontwikkeling, ontwerp.",
             "Remote services in Dutch: customer service, administration, software development, design."),
            ("Nederlandse partners en financiers voor landbouw, water en energie, vaak via PUM, RVO of de VSB-VNO-NCW-samenwerking.",
             "Dutch partners and financiers for agriculture, water and energy, often via PUM, RVO or the VSB and VNO-NCW cooperation."),
            ("Toerisme: pakketten voor diasporabezoekers en natuurreizigers uit Nederland.",
             "Tourism: packages for diaspora visitors and nature travellers from the Netherlands."),
        ],
        "watch_out": [
            ("Een afgekeurde zending (residuen, etiket, ongedierte) kost je de lading plus de vracht; laat vooraf testen.",
             "A rejected shipment (residues, label, pests) costs you the goods plus the freight; test beforehand."),
            ("Nederlandse banken controleren betalingen van en naar Suriname streng: leg herkomst van geld en contracten vast.",
             "Dutch banks check payments to and from Suriname closely: document the source of funds and your contracts."),
            ("De EU-ontbossingsverordening (EUDR) raakt hout, cacao en koffie; zie de gids over export naar de EU voor de datums.",
             "The EU Deforestation Regulation (EUDR) affects timber, cocoa and coffee; see the EU export guide for the dates."),
        ],
        "guides": ["euexport", "diaspora", "export", "import", "payments", "aml"],
        "sources": [
            _COMTRADE,
            ("RVO: exportregels en producteisen Suriname", "https://www.rvo.nl/onderwerpen/landen-en-gebieden/suriname"),
            ("Rijksoverheid: staatsbezoek aan Suriname (1-3 december 2025)",
             "https://www.rijksoverheid.nl/actueel/weblogs/bzers-wereldwijd/2025/staatsbezoek-suriname"),
            ("Rijksoverheid: gemeenschappelijke verklaring bilateraal overleg Suriname (1 december 2025)",
             "https://www.rijksoverheid.nl/documenten/2025/12/01/gemeenschappelijke-verklaring-bilateraal-overleg-suriname"),
            ("Kamerstuk 20 361 nr. 205: verslag bezoek aan Suriname, handelsmissie en Business Dialogue (2022)",
             "https://zoek.officielebekendmakingen.nl/kst-20361-205.pdf"),
            ("Nederland Wereldwijd: Nederlandse ambassade in Suriname", "https://www.nederlandwereldwijd.nl/landen/suriname"),
            ("PUM: projecten en vertegenwoordigers in Suriname", "https://www.pum.nl/countries/suriname/"),
            ("CBI: marktinformatie over de Europese markt", "https://www.cbi.eu/market-information"),
            _EMB,
            _PBM,
        ],
    },
    # ------------------------------------------------------------------ United States
    {
        "key": "united-states",
        "name": ("de Verenigde Staten", "the United States"),
        "short": ("Verenigde Staten", "United States"),
        "flag": "\U0001F1FA\U0001F1F8",
        "region": "americas",
        "exp_musd": 74.6, "imp_musd": 486.5, "trade_year": 2025,
        "trade_src": ("US Census Bureau", "US Census Bureau"),
        "agree_short": ("Geen akkoord", "No agreement"),
        "agree_sub": ("normaal Amerikaans tarief (HTS)", "normal US tariff (HTS)"),
        "intro": (
            "De Verenigde Staten zijn de grootste leverancier van Suriname: in 2025 voor USD 486 miljoen aan machines, "
            "brandstof, elektronica en kip. Suriname verkocht er voor USD 75 miljoen, vooral vis en garnalen. Er is geen "
            "handelsakkoord, dus je betaalt het normale tarief, en de Amerikaanse tariefregels veranderden sinds 2025 al drie keer.",
            "The United States is Suriname's largest supplier: USD 486 million of machinery, fuel, electronics and poultry "
            "in 2025. Suriname sold USD 75 million there, mainly fish and shrimp. There is no trade agreement, so you pay the "
            "normal tariff, and US tariff rules have changed three times since 2025."),
        "tldr": [
            ("Geen handelsakkoord, geen Caribbean Basin-voorkeur en geen GSP: je betaalt het normale Amerikaanse tarief.",
             "No trade agreement, no Caribbean Basin preference and no GSP: you pay the normal US tariff."),
            ("Suriname stond in juli 2026 niet op de lijst van 60 landen met de nieuwe Section 301-heffingen; laat het tarief per zending bevestigen.",
             "In July 2026 Suriname was not on the list of 60 countries with the new Section 301 duties; have the rate confirmed per shipment."),
            ("Voedsel naar de VS: registratie bij de FDA en een prior notice per zending.",
             "Food to the US: FDA registration and a prior notice for each shipment."),
            ("Sinds 17 september 2025 moeten schepen die via Suriname naar de VS varen extra beveiliging toepassen.",
             "Since 17 September 2025 ships sailing to the US via Suriname must apply extra security measures."),
        ],
        "trade": (
            "Volgens het US Census Bureau exporteerden de VS in 2025 voor USD 486,5 miljoen naar Suriname en importeerden ze "
            "voor USD 74,6 miljoen uit Suriname. In de eerste acht maanden van 2026 was dat USD 379,0 miljoen en USD 58,1 "
            "miljoen. De VS zijn al jaren de grootste leverancier van Suriname.\n\n"
            "Naar Suriname gingen in 2025 vooral machines (USD 120 miljoen), brandstof en olieproducten (USD 63 miljoen), "
            "elektrische apparatuur (USD 46 miljoen) en vlees, vooral kip (USD 30 miljoen). Uit Suriname kwamen vooral vis en "
            "schaaldieren (USD 45 miljoen), ertsen (USD 12 miljoen) en hout (USD 6 miljoen) (UN Comtrade, Amerikaanse cijfers).",
            "According to the US Census Bureau, the US exported USD 486.5 million to Suriname in 2025 and imported USD 74.6 "
            "million from Suriname. In the first eight months of 2026 the figures were USD 379.0 million and USD 58.1 "
            "million. The US has been Suriname's largest supplier for years.\n\n"
            "Exports to Suriname in 2025 were mainly machinery (USD 120 million), fuel and oil products (USD 63 million), "
            "electrical equipment (USD 46 million) and meat, mostly poultry (USD 30 million). Imports from Suriname were "
            "mainly fish and shellfish (USD 45 million), ores (USD 12 million) and timber (USD 6 million) (UN Comtrade, US "
            "figures)."),
        "agreements": (
            "Suriname heeft geen handelsakkoord met de VS en hoort niet bij de begunstigden van het Caribbean Basin Initiative. "
            "Het Amerikaanse GSP is eind 2020 verlopen. Daarom betalen Surinaamse goederen het normale tarief uit de Harmonized "
            "Tariff Schedule (HTS).\n\n"
            "Daarbovenop gold sinds april 2025 een algemeen extra tarief van 10% voor bijna alle landen, ook Suriname. Het "
            "Amerikaanse Hooggerechtshof oordeelde op 20 februari 2026 dat die heffingen onder de noodwet IEEPA niet mochten. Vanaf "
            "24 februari 2026 gold daarom een tijdelijk wereldwijd tarief van 10% (Section 122), dat op 24 juli 2026 afliep. "
            "Sindsdien gelden Section 301-heffingen voor 60 landen, waaronder Guyana, Trinidad en Tobago, Brazilië, China en "
            "India. Suriname en Jamaica staan volgens het overzicht van juli 2026 niet op die lijst. Staal, aluminium en enkele "
            "andere producten hebben aparte heffingen (Section 232). Laat je koper of zijn douane-agent het actuele tarief voor "
            "jouw HS-code bevestigen voordat je een prijs afspreekt.",
            "Suriname has no trade agreement with the US and is not a beneficiary of the Caribbean Basin Initiative. The US "
            "GSP lapsed at the end of 2020. Surinamese goods therefore pay the normal rate from the Harmonized Tariff Schedule "
            "(HTS).\n\n"
            "On top of that, from April 2025 a general additional tariff of 10% applied to almost all countries, including "
            "Suriname. On 20 February 2026 the US Supreme Court ruled that those duties under the IEEPA emergency law were not "
            "allowed. From 24 February 2026 a temporary global tariff of 10% applied (Section 122), which expired on 24 July "
            "2026. Since then Section 301 duties apply to 60 countries, including Guyana, Trinidad and Tobago, Brazil, China "
            "and India. According to the July 2026 overview, Suriname and Jamaica are not on that list. Steel, aluminium and "
            "some other products have separate duties (Section 232). Have your buyer or their customs broker confirm the "
            "current rate for your HS code before you agree a price."),
        "market_access": (
            "Voor levensmiddelen moet het producerende of verpakkende bedrijf geregistreerd zijn bij de Food and Drug "
            "Administration (FDA), en de importeur meldt elke zending vooraf aan (prior notice). Voor vis en garnalen gelden "
            "de HACCP-regels van de FDA, voor planten, fruit en hout de regels van de USDA (APHIS). Etiketten moeten in het "
            "Engels, met Amerikaanse voedingswaardetabel. De FDA kan zendingen vasthouden (detention) als iets niet klopt.\n\n"
            "De meeste Surinaamse exporteurs verkopen aan een importeur of groothandel in Florida of New York, die de "
            "invoerformaliteiten regelt. De Amerikaanse ambassade publiceert met het Department of Commerce een Country "
            "Commercial Guide over Suriname, vooral bedoeld voor Amerikaanse bedrijven die in Suriname willen verkopen.",
            "For food, the producing or packing facility must be registered with the Food and Drug Administration (FDA), and "
            "the importer notifies each shipment in advance (prior notice). Fish and shrimp fall under the FDA's seafood HACCP "
            "rules, plants, fruit and timber under the USDA (APHIS). Labels must be in English with a US nutrition facts "
            "panel. The FDA can detain shipments if something is not in order.\n\n"
            "Most Surinamese exporters sell to an importer or wholesaler in Florida or New York who handles the import "
            "formalities. The US embassy and the Department of Commerce publish a Country Commercial Guide on Suriname, aimed "
            "mainly at US companies that want to sell in Suriname."),
        "logistics": (
            "Surinam Airways vliegt naar Miami, en Amerijet vliegt vracht tussen Paramaribo en Miami. Containers uit de VS komen "
            "meestal via Florida of via overslag in het Caribisch gebied.\n\n"
            "Sinds 17 september 2025 vindt de US Coast Guard dat Surinaamse havens onvoldoende antiterrorismemaatregelen "
            "hebben. Schepen die Suriname bij een van hun laatste vijf havens aandoen en daarna naar de VS varen, moeten in "
            "Suriname beveiligingsniveau 2 toepassen: bewaakte toegang, een Declaration of Security met de haven en een melding "
            "aan de Coast Guard. De Maritieme Autoriteit Suriname (MAS) heeft dat in een instructie van 30 oktober 2025 "
            "vastgelegd. Voor exporteurs kan dit extra kosten of minder aanloopplaatsen betekenen; vraag je rederij wat het "
            "voor jouw route doet.",
            "Surinam Airways flies to Miami, and Amerijet flies cargo between Paramaribo and Miami. Containers from the US "
            "usually come via Florida or via transhipment in the Caribbean.\n\n"
            "Since 17 September 2025 the US Coast Guard considers that Surinamese ports lack effective antiterrorism measures. "
            "Ships that call at Suriname as one of their last five ports and then sail to the US must apply security level 2 "
            "in Suriname: guarded access, a Declaration of Security with the port facility and a report to the Coast Guard. "
            "The Maritime Authority Suriname (MAS) set this out in an instruction of 30 October 2025. For exporters this can "
            "mean extra cost or fewer port calls; ask your shipping line what it means for your route."),
        "diplomatic": (
            "Suriname heeft een ambassade in Washington en een consulaat-generaal in Miami. De VS hebben een ambassade in "
            "Paramaribo, met een handelsafdeling die samenwerkt met de US Commercial Service. Die organiseerde in juni 2025 een "
            "Amerikaanse handelsdelegatie naar de Suriname Energy, Oil and Gas Summit (SEOGS) van Staatsolie.",
            "Suriname has an embassy in Washington and a consulate general in Miami. The US has an embassy in Paramaribo, with "
            "a commercial section that works with the US Commercial Service. In June 2025 it organised a US trade delegation "
            "to Staatsolie's Suriname Energy, Oil and Gas Summit (SEOGS)."),
        "chambers": (
            "De American Chamber of Commerce of Suriname (AmCham Suriname) brengt Surinaamse en Amerikaanse bedrijven samen. "
            "Wil je als Surinaams bedrijf in de VS investeren (een vestiging, magazijn of productie), dan is SelectUSA van het "
            "Department of Commerce het loket; de SelectUSA Investment Summit was van 3 tot 6 mei 2026 in National Harbor "
            "(Maryland). Vraag de Amerikaanse ambassade naar delegaties.",
            "The American Chamber of Commerce of Suriname (AmCham Suriname) brings Surinamese and US companies together. If "
            "you as a Surinamese company want to invest in the US (an office, warehouse or production), SelectUSA at the "
            "Department of Commerce is the entry point; the SelectUSA Investment Summit took place from 3 to 6 May 2026 in "
            "National Harbor (Maryland). Ask the US embassy about delegations."),
        "opportunities": [
            ("Vis, garnalen en zeevruchten voor importeurs in Florida en New York, met FDA-registratie en HACCP op orde.",
             "Fish, shrimp and seafood for importers in Florida and New York, with FDA registration and HACCP in order."),
            ("Toeleveren aan en samenwerken met Amerikaanse bedrijven in olie en gas (zie de gids over olie en gas).",
             "Supplying and partnering with US companies in oil and gas (see the oil and gas guide)."),
            ("Inkoop van machines, onderdelen en voedsel uit Florida, met korte lijnen via Miami.",
             "Buying machinery, parts and food from Florida, with short lines via Miami."),
            ("Diasporaproducten voor de Surinaamse en Caribische gemeenschap in de VS.",
             "Diaspora products for the Surinamese and Caribbean community in the US."),
        ],
        "watch_out": [
            ("Tarieven veranderen snel en rechtszaken lopen nog; zet in je offerte wie extra heffingen betaalt.",
             "Tariffs change fast and court cases are still running; state in your quote who pays any extra duties."),
            ("Een FDA-detentie kost weken; begin met een kleine proefzending.",
             "An FDA detention costs weeks; start with a small trial shipment."),
            ("Dollarbetalingen lopen via Amerikaanse correspondentbanken: verwacht vragen over herkomst en doel.",
             "Dollar payments go through US correspondent banks: expect questions about source and purpose."),
        ],
        "guides": ["export", "import", "oilgas", "logistics", "payments"],
        "sources": [
            ("US Census Bureau: Trade in Goods with Suriname", "https://www.census.gov/foreign-trade/balance/c3150.html"),
            _COMTRADE,
            ("USTR: Caribbean Basin Initiative, begunstigde landen",
             "https://ustr.gov/issue-areas/trade-development/preference-programs/caribbean-basin-initiative-cbi"),
            ("Honigman: Hooggerechtshof en het tijdelijke 10%-tarief (februari 2026)", "https://www.honigman.com/alert-3240"),
            ("Holland & Knight: Section 301-heffingen voor 60 landen (juli 2026)",
             "https://www.hklaw.com/en/insights/publications/2026/07/and-the-tariff-beat-goes-on"),
            ("USITC: Harmonized Tariff Schedule", "https://hts.usitc.gov/"),
            ("Federal Register: Suriname zonder effectieve antiterrorismemaatregelen in havens (3 september 2025)",
             "https://www.govinfo.gov/content/pkg/FR-2025-09-03/html/2025-16845.htm"),
            ("MAS: Maritime Security Instructions 2025/03 (rev. 1), Conditions of Entry USA",
             "https://mas.sr/wp-content/uploads/2025/11/Instruction-for-maritime-security-202503-Revision.pdf"),
            ("trade.gov: Suriname Country Commercial Guide", "https://www.trade.gov/country-commercial-guides/suriname-market-overview"),
            ("trade.gov: US-delegatie naar SEOGS 2025",
             "https://events.trade.gov/en/TradeGov/USDelegationatSurinameEnergyOilandGasSummit-SEOGS"),
            ("trade.gov: SelectUSA Investment Summit 2026",
             "https://www.trade.gov/press-release/2026-selectusa-investment-summit-concludes-catalyzing-over-56-billion-investment"),
            _EMB,
        ],
    },
    # ------------------------------------------------------------------ China
    {
        "key": "china",
        "name": ("China", "China"),
        "short": ("China", "China"),
        "flag": "\U0001F1E8\U0001F1F3",
        "region": "asia",
        "exp_musd": 39.6, "imp_musd": 541.1, "trade_year": 2025,
        "trade_src": ("Chinese douane via UN Comtrade", "Chinese customs via UN Comtrade"),
        "agree_short": ("Geen akkoord", "No agreement"),
        "agree_sub": ("normaal WTO-tarief van China", "China's normal WTO rate"),
        "intro": (
            "China leverde in 2025 voor USD 541 miljoen aan Suriname, meer dan de Verenigde Staten: machines, auto's, staal, "
            "elektronica en meubels. Suriname verkocht voor USD 40 miljoen, vooral hout en vis. Voor de meeste Surinaamse "
            "bedrijven is China dus een inkoopmarkt.",
            "China supplied USD 541 million worth of goods to Suriname in 2025, more than the United States: machinery, "
            "vehicles, steel, electronics and furniture. Suriname sold USD 40 million, mainly timber and fish. For most "
            "Surinamese businesses China is therefore a sourcing market."),
        "tldr": [
            ("Chinese cijfers: export naar Suriname steeg van USD 363 miljoen (2024) naar USD 541 miljoen (2025).",
             "Chinese figures: exports to Suriname rose from USD 363 million (2024) to USD 541 million (2025)."),
            ("Geen handelsakkoord: Surinaamse export betaalt het normale Chinese tarief, en voedselexporteurs moeten bij de Chinese douane (GACC) geregistreerd zijn.",
             "No trade agreement: Surinamese exports pay China's normal tariff, and food exporters must be registered with Chinese customs (GACC)."),
            ("Bij inkoop in China draait het om leverancierscontrole, duidelijke Incoterms en een inspectie voor verzending.",
             "When buying in China, the key is supplier checks, clear Incoterms and a pre-shipment inspection."),
            ("De bauxietovereenkomst met Chinalco (Bakhuis) was in 2025 omstreden; de status is onzeker.",
             "The bauxite agreement with Chinalco (Bakhuis) was contested in 2025; its status is uncertain."),
        ],
        "trade": (
            "Volgens de Chinese douane (via UN Comtrade) exporteerde China in 2025 voor USD 541,1 miljoen naar Suriname, tegen "
            "USD 363,3 miljoen in 2024. De grootste posten in 2025: machines (USD 116 miljoen), voertuigen (USD 74 miljoen), "
            "artikelen van staal (USD 50 miljoen), elektrische apparatuur (USD 46 miljoen) en plastic (USD 39 miljoen).\n\n"
            "China kocht in 2025 voor USD 39,6 miljoen uit Suriname: hout (USD 32,1 miljoen, vooral rondhout) en vis (USD 6,6 "
            "miljoen). In 2024 was dat nog USD 61,0 miljoen. De Surinaamse eigen cijfers over 2023 noemen USD 166,6 miljoen aan "
            "invoer uit China; het verschil komt door transport via derde landen, CIF tegen FOB en het tijdstip van boeken.",
            "According to Chinese customs (via UN Comtrade), China exported USD 541.1 million to Suriname in 2025, up from "
            "USD 363.3 million in 2024. The largest items in 2025: machinery (USD 116 million), vehicles (USD 74 million), "
            "steel articles (USD 50 million), electrical equipment (USD 46 million) and plastics (USD 39 million).\n\n"
            "China bought USD 39.6 million from Suriname in 2025: timber (USD 32.1 million, mainly logs) and fish (USD 6.6 "
            "million). In 2024 the figure was USD 61.0 million. Suriname's own figures for 2023 show USD 166.6 million of "
            "imports from China; the gap is due to shipping via third countries, CIF versus FOB and timing."),
        "agreements": (
            "Suriname heeft geen handelsakkoord met China. Surinaamse goederen betalen het normale tarief dat China aan alle "
            "WTO-leden geeft. Bij invoer uit China betaal je in Suriname het gewone invoerrecht, BTW en eventuele andere "
            "heffingen; er is geen voorkeur.",
            "Suriname has no trade agreement with China. Surinamese goods pay the normal rate China gives all WTO members. "
            "When you import from China, you pay the normal Surinamese import duty, VAT and any other charges in Suriname; "
            "there is no preference."),
        "market_access": (
            "Wie levensmiddelen (ook vis) naar China wil exporteren, moet als buitenlandse producent geregistreerd zijn bij de "
            "Chinese douane (General Administration of Customs, GACC). Voor sommige productgroepen gaat dat via de bevoegde "
            "autoriteit in Suriname. Voor hout gelden fytosanitaire eisen. Chinese kopers werken meestal met vooruitbetaling "
            "of een kredietbrief (L/C) en kopen in grote volumes.\n\n"
            "Voor inkoop: vraag een bedrijfsregistratie (business licence) van je leverancier, laat monsters komen, spreek de "
            "Incoterm en de kwaliteitseisen schriftelijk af en laat voor verzending inspecteren door een onafhankelijk bureau. "
            "Reken je landed cost uit met invoerrecht, BTW en vracht voordat je bestelt.",
            "Anyone who wants to export food (including fish) to China must be registered as a foreign producer with Chinese "
            "customs (General Administration of Customs, GACC). For some product groups this goes through the competent "
            "authority in Suriname. Timber is subject to phytosanitary requirements. Chinese buyers usually work with "
            "prepayment or a letter of credit (L/C) and buy in large volumes.\n\n"
            "For sourcing: ask your supplier for its business licence, get samples, agree the Incoterm and quality "
            "requirements in writing and have the goods inspected by an independent firm before shipment. Work out your "
            "landed cost with duty, VAT and freight before you order."),
        "logistics": (
            "Er is geen rechtstreekse lijndienst tussen China en Suriname: containers worden onderweg overgeslagen, "
            "bijvoorbeeld in het Caribisch gebied of in Noord-Europa. Vraag je expediteur naar de route, de overslaghaven en de "
            "totale doorlooptijd. Luchtvracht gaat via Amsterdam, Miami of Panama.",
            "There is no direct liner service between China and Suriname: containers are transhipped en route, for example "
            "in the Caribbean or Northern Europe. Ask your forwarder about the route, the transhipment port and the total "
            "lead time. Air freight goes via Amsterdam, Miami or Panama."),
        "diplomatic": (
            "China heeft sinds 1977 een ambassade in Paramaribo; Suriname heeft een ambassade in Beijing. De Chinese ambassade "
            "is het eerste aanspreekpunt voor handels- en investeringsvragen over China.",
            "China has had an embassy in Paramaribo since 1977; Suriname has an embassy in Beijing. The Chinese embassy is "
            "the first point of contact for trade and investment questions about China."),
        "chambers": (
            "We hebben geen officiële Surinaams-Chinese kamer van koophandel kunnen bevestigen. Veel Chinees-Surinaamse "
            "ondernemers in groothandel, supermarkten en bouw hebben eigen netwerken en verenigingen. De grote "
            "handelsbeurs in Guangzhou (Canton Fair) is twee keer per jaar een gebruikelijke plek om leveranciers te ontmoeten.\n\n"
            "Grote Chinese investeringen lopen via overheidsovereenkomsten. Eind 2024 tekende de regering een overeenkomst met "
            "de Aluminum Corporation of China (Chinalco) voor bauxietwinning in het Bakhuisgebied in West-Suriname: een "
            "investering van USD 426 miljoen, een belang van 13% voor de staat en een looptijd van 30 jaar. De overeenkomst "
            "moest door De Nationale Assemblée worden goedgekeurd. Economen en het bedrijfsleven hadden begin 2025 forse "
            "kritiek op de belastingvrijstellingen. Of het project doorgaat, hebben we op 26 oktober 2026 niet kunnen bevestigen.",
            "We could not confirm an official Suriname-China chamber of commerce. Many Chinese-Surinamese entrepreneurs in "
            "wholesale, supermarkets and construction have their own networks and associations. The large trade fair in "
            "Guangzhou (Canton Fair) is held twice a year and is a common place to meet suppliers.\n\n"
            "Large Chinese investments go through government agreements. In late 2024 the government signed an agreement "
            "with the Aluminum Corporation of China (Chinalco) for bauxite mining in the Bakhuis area in western Suriname: an "
            "investment of USD 426 million, a 13% stake for the state and a term of 30 years. The agreement required approval "
            "by the National Assembly. Economists and the business community strongly criticised its tax exemptions in early "
            "2025. As of 26 October 2026 we could not confirm whether the project is going ahead."),
        "opportunities": [
            ("Directe inkoop van bouwmaterialen, machines, zonnepanelen en verpakkingen, zonder tussenhandelaar.",
             "Direct sourcing of building materials, machinery, solar panels and packaging, without a middleman."),
            ("Export van hout met legale herkomst en eventueel verwerking in Suriname voor meer toegevoegde waarde.",
             "Export of legally sourced timber, possibly processed in Suriname for more added value."),
            ("Vis en zeevruchten voor de Chinese markt, als je bedrijf bij de GACC geregistreerd is.",
             "Fish and seafood for the Chinese market, if your establishment is registered with GACC."),
        ],
        "watch_out": [
            ("Fraude met nepleveranciers en gewijzigde bankgegevens: bel je leverancier na op een bekend nummer voordat je betaalt.",
             "Fraud with fake suppliers and changed bank details: call your supplier on a known number before you pay."),
            ("Kwaliteit en normen: elektrische apparaten en bouwmaterialen moeten aan Surinaamse en internationale normen voldoen.",
             "Quality and standards: electrical goods and building materials must meet Surinamese and international standards."),
            ("De douane toetst de aangegeven waarde; een te lage factuur leidt tot naheffing en boete.",
             "Customs checks the declared value; an under-invoiced shipment leads to extra assessment and a fine."),
        ],
        "guides": ["import", "supplier", "importcost", "standards", "douane"],
        "sources": [
            _COMTRADE,
            ("Caribbean Today: Suriname tekent overeenkomst met Chinalco (2024)",
             "https://caribbeantoday.com/sections/business-blog/suriname-signs-multi-million-dollar-agreement-with-chinese-company-for-developing-bauxite-sector"),
            ("Key News Suriname: VES wil Chinalco-overeenkomst van tafel (4 december 2024)",
             "https://keynews.sr/ves-chinalco-deal-met-de-regering-moet-van-tafel"),
            ("Mongabay: bauxietplannen in Suriname en landrechten (januari 2025)",
             "https://news.mongabay.com/2025/01/plans-for-bauxite-mine-in-suriname-reignite-indigenous-land-rights-debate/"),
            ("Ambassade van China in Suriname", "http://sr.china-embassy.gov.cn/"),
            _MISSIONS,
            _EMB,
        ],
    },
    # ------------------------------------------------------------------ Guyana
    {
        "key": "guyana",
        "name": ("Guyana", "Guyana"),
        "short": ("Guyana", "Guyana"),
        "flag": "\U0001F1EC\U0001F1FE",
        "region": "caricom",
        "exp_musd": 185.3, "imp_musd": 27.9, "trade_year": 2025,
        "trade_src": ("Guyanese cijfers via UN Comtrade", "Guyanese figures via UN Comtrade"),
        "agree_short": ("CARICOM", "CARICOM"),
        "agree_sub": ("geen invoerrecht op goederen van CARICOM-oorsprong", "no duty on goods of CARICOM origin"),
        "intro": (
            "Guyana is de buurman met de snelst groeiende economie van de regio en een CARICOM-partner zonder invoerrecht. "
            "In 2025 kocht Guyana voor USD 185 miljoen uit Suriname, vooral brandstof. De handel hangt aan één veerboot over de "
            "Corantijn, die in 2026 meermaals uitviel.",
            "Guyana is the neighbour with the fastest-growing economy in the region and a CARICOM partner without import "
            "duty. In 2025 Guyana bought USD 185 million from Suriname, mainly fuel. Trade depends on one ferry across the "
            "Corentyne, which broke down several times in 2026."),
        "tldr": [
            ("CARICOM: geen invoerrecht met certificaat van oorsprong, maar fytosanitaire en andere eisen blijven gelden.",
             "CARICOM: no duty with a certificate of origin, but phytosanitary and other requirements still apply."),
            ("De Canawaima-veerboot lag in augustus 2026 stil na inspecties van de MAS; het schip is technisch bijna op.",
             "The Canawaima ferry was suspended in August 2026 after MAS inspections; the vessel is near the end of its technical life."),
            ("Corantijnbrug: Suriname wil de brug sinds juni 2026 zelf financieren; reken voorlopig op de veerboot.",
             "Corentyne bridge: since June 2026 Suriname wants to finance the bridge itself; for now, plan on the ferry."),
            ("In maart en april 2026 protesteerden Guyana en Guyanese kamers tegen Surinaamse heffingen op de rivier.",
             "In March and April 2026 Guyana and Guyanese chambers protested against Surinamese charges on the river."),
        ],
        "trade": (
            "Volgens de Guyanese cijfers (UN Comtrade) importeerde Guyana in 2025 voor USD 185,3 miljoen uit Suriname. Daarvan "
            "was USD 148,6 miljoen brandstof en andere aardolieproducten en USD 10,9 miljoen steenslag en grind voor de bouw. "
            "Daarnaast gingen dranken, machines en voertuigen over de grens. Guyana leverde in 2025 voor USD 27,9 miljoen aan "
            "Suriname; in 2024 waren dat vooral kunstmest, papier, dranken en suiker.\n\n"
            "De cijfers schommelen sterk per jaar: voor 2023 meldt Guyana een veel hogere export naar Suriname (USD 166,6 "
            "miljoen). Een groot deel van de grenshandel (groente, fruit, vis, consumptiegoederen) loopt bovendien informeel en "
            "staat in geen enkele statistiek.",
            "According to Guyanese figures (UN Comtrade), Guyana imported USD 185.3 million from Suriname in 2025. Of this, "
            "USD 148.6 million was fuel and other petroleum products and USD 10.9 million crushed stone and gravel for "
            "construction. Drinks, machinery and vehicles also crossed the border. Guyana supplied USD 27.9 million to "
            "Suriname in 2025; in 2024 this was mainly fertiliser, paper, drinks and sugar.\n\n"
            "The figures swing a lot from year to year: for 2023 Guyana reports much higher exports to Suriname (USD 166.6 "
            "million). A large part of border trade (vegetables, fruit, fish, consumer goods) is also informal and appears in "
            "no statistics."),
        "agreements": (
            "Guyana en Suriname zijn allebei lid van CARICOM en de CSME. Goederen van CARICOM-oorsprong gaan zonder invoerrecht "
            "over de grens, mits je klant een CARICOM-certificaat van oorsprong en een CARICOM-factuur heeft. Voor verse "
            "landbouwproducten tekenden de ministers van Landbouw van beide landen een protocol: alleen commerciële zendingen "
            "met de juiste certificering zijn toegestaan, en de Guyanese plantenziektekundige dienst controleert streng op "
            "ongedierte en smokkel.",
            "Guyana and Suriname are both members of CARICOM and the CSME. Goods of CARICOM origin cross the border duty "
            "free, provided your customer has a CARICOM certificate of origin and a CARICOM invoice. For fresh farm produce, "
            "the agriculture ministers of both countries signed a protocol: only commercial shipments with the right "
            "certification are allowed, and Guyana's plant protection service checks strictly for pests and smuggling."),
        "market_access": (
            "Guyana groeit door de olieproductie snel, met veel vraag naar bouwmaterialen, voedsel, transport en diensten. "
            "Kopers zijn groothandels in Georgetown en Berbice, bouwbedrijven en toeleveranciers van de oliesector. Guyana is "
            "Engelstalig; contracten, etiketten en offertes maak je in het Engels. Prijzen worden in Guyanese of Amerikaanse "
            "dollars afgesproken.\n\n"
            "Andersom klagen Guyanese ondernemers over Surinaamse heffingen. In maart 2026 diende Guyana een formeel protest in "
            "tegen nieuwe heffingen voor het gebruik van de Corantijn, die volgens president Ali vooral de hout- en "
            "steengroevesector raken. De Upper Corentyne-kamer sprak van loodsgelden tot USD 2.500 per reis. De Georgetown "
            "Chamber of Commerce vroeg in april 2026 de brugbesprekingen op te schorten zolang de heffingen blijven. Hou er "
            "rekening mee dat zulke geschillen ook Surinaamse exporteurs kunnen raken.",
            "Guyana is growing fast on the back of oil production, with strong demand for building materials, food, "
            "transport and services. Buyers are wholesalers in Georgetown and Berbice, construction firms and oil sector "
            "suppliers. Guyana is English-speaking; contracts, labels and quotes are in English. Prices are agreed in "
            "Guyanese or US dollars.\n\n"
            "In the other direction, Guyanese businesses complain about Surinamese charges. In March 2026 Guyana lodged a "
            "formal protest against new charges for use of the Corentyne, which according to President Ali mainly affect the "
            "timber and quarry sectors. The Upper Corentyne chamber mentioned pilot fees of up to USD 2,500 per trip. In April "
            "2026 the Georgetown Chamber of Commerce asked for the bridge talks to be suspended as long as the charges remain. "
            "Bear in mind that such disputes can also affect Surinamese exporters."),
        "logistics": (
            "Over land gaat alles via de veerdienst van de Canawaima tussen South Drain (Nickerie) en Moleson Creek. Het schip "
            "is in 2026 een groot probleem. De Maritieme Autoriteit Suriname (MAS) gaf op 7 augustus 2026 een ultimatum om "
            "gebreken aan brandveiligheid, evacuatiemiddelen en techniek op te lossen. Op 22 augustus 2026 werd de dienst "
            "stilgelegd na technische problemen; op 28 augustus voer de boot weer, met een voorlopige toestemming tot 28 "
            "september en een nieuwe inspectie. Volgens een presidentieel adviseur is het schip technisch in 2027 op. Beide "
            "regeringen praten over dokken en een vervangend schip, en de Suriname-Guyana Chamber of Commerce vraagt om een "
            "tweede schip als reserve.\n\n"
            "De brug over de Corantijn is nog niet gebouwd. Eind juni 2026 zei de minister van Openbare Werken dat Suriname de "
            "brug zelf wil financieren en beheren; Guyana reageerde dat het alleen de bestaande verdragen erkent. Door de lucht: "
            "Surinam Airways en Fly All Ways vliegen naar Georgetown (Cheddi Jagan), Trans Guyana Airways naar Georgetown "
            "(Ogle). Plan bij spoedzendingen altijd een alternatief.",
            "Overland, everything goes via the Canawaima ferry between South Drain (Nickerie) and Moleson Creek. The vessel "
            "was a major problem in 2026. On 7 August 2026 the Maritime Authority Suriname (MAS) issued an ultimatum to fix "
            "shortcomings in fire safety, evacuation equipment and technical systems. On 22 August 2026 the service was "
            "suspended after technical problems; on 28 August the ferry sailed again, with a provisional authorisation to 28 "
            "September and a new inspection. According to a presidential adviser the vessel reaches its technical end in "
            "2027. Both governments are discussing dry-docking and a replacement, and the Suriname-Guyana Chamber of Commerce "
            "is calling for a second vessel as back-up.\n\n"
            "The Corentyne bridge has not been built. In late June 2026 the Public Works minister said Suriname wants to "
            "finance and manage the bridge itself; Guyana replied that it only recognises the existing treaties. By air: "
            "Surinam Airways and Fly All Ways fly to Georgetown (Cheddi Jagan), Trans Guyana Airways to Georgetown (Ogle). "
            "Always plan an alternative for urgent shipments."),
        "diplomatic": (
            "Suriname heeft een ambassade in Georgetown, die ook Trinidad en Tobago bedient. Guyana heeft een ambassade in "
            "Paramaribo en een consulaat-generaal in Nickerie.",
            "Suriname has an embassy in Georgetown, which also covers Trinidad and Tobago. Guyana has an embassy in "
            "Paramaribo and a consulate general in Nickerie."),
        "chambers": (
            "De Suriname-Guyana Chamber of Commerce (SGCC) heeft een kantoor in Paramaribo en een in Guyana, organiseert "
            "bijeenkomsten voor ondernemers uit beide landen en stelde in 2025 een publiek-private aanpak voor het beheer van de "
            "veerdienst voor. De Guyana Suriname Private Sector Business Council werd in maart 2022 opgericht door de Private "
            "Sector Commission van Guyana en de VSB. In Guyana zijn ook de Georgetown Chamber of Commerce and Industry en de "
            "Berbice Chamber of Commerce actief.",
            "The Suriname-Guyana Chamber of Commerce (SGCC) has an office in Paramaribo and one in Guyana, organises meetings "
            "for businesses from both countries and in 2025 proposed a public-private model for running the ferry service. "
            "The Guyana Suriname Private Sector Business Council was set up in March 2022 by Guyana's Private Sector "
            "Commission and the VSB. In Guyana the Georgetown Chamber of Commerce and Industry and the Berbice Chamber of "
            "Commerce are also active."),
        "opportunities": [
            ("Brandstof, bouwmaterialen (steenslag, zand, cement) en voedsel voor de groeiende Guyanese markt.",
             "Fuel, building materials (crushed stone, sand, cement) and food for the growing Guyanese market."),
            ("Diensten voor de olie- en gassector die je in Suriname al levert, zoals logistiek, catering en onderhoud.",
             "Services for the oil and gas sector that you already supply in Suriname, such as logistics, catering and maintenance."),
            ("Toerisme en transport in de westelijke corridor (Nickerie), als de veerdienst betrouwbaarder wordt.",
             "Tourism and transport in the western corridor (Nickerie), once the ferry becomes more reliable."),
        ],
        "watch_out": [
            ("De veerboot kan zonder aankondiging uitvallen: spreek in contracten af wie het risico van vertraging draagt.",
             "The ferry can stop without notice: agree in your contracts who bears the risk of delay."),
            ("Geen certificaat van oorsprong of fytosanitair certificaat betekent invoerrecht, inbeslagname of terugsturen.",
             "No certificate of origin or phytosanitary certificate means duty, seizure or return."),
            ("Politieke geschillen (rivierheffingen, brug, grens) kunnen de grenshandel plots raken.",
             "Political disputes (river charges, bridge, border) can suddenly affect border trade."),
        ],
        "guides": ["tradeagreements", "logistics", "oilgas", "districts"],
        "sources": [
            _COMTRADE,
            ("Kaieteur News: Suriname Chamber vraagt om nieuw schip (25 augustus 2026)",
             "https://kaieteurnewsonline.com/2026/08/25/suriname-chamber-calls-for-new-vessel/"),
            ("DPI Guyana: veerdienst MV Canawaima hervat (28 augustus 2026)",
             "https://dpi.gov.gy/m-v-canawaima-ferry-service-resumes-2/"),
            ("Times of Suriname: MV Canawaima technisch bijna op (2026)",
             "https://www.surinametimes.com/artikel/mv-canawaima-nears-technical-end-of-life-and-must-be-replaced"),
            ("DPI Guyana: formeel protest tegen heffingen op de Corantijn (26 maart 2026)",
             "https://dpi.gov.gy/guyana-lodges-formal-protest-with-suriname-over-corentyne-river-fees"),
            ("Kaieteur News: GCCI wil brugbesprekingen stoppen (5 april 2026)",
             "https://kaieteurnewsonline.com/2026/04/05/gcci-urges-halt-to-corentyne-bridge-project-amid-trade-and-sovereignty-disputes-with-suriname/"),
            ("Kaieteur News: Suriname trekt zich terug uit gezamenlijk brugproject (1 juli 2026)",
             "https://kaieteurnewsonline.com/2026/07/01/suriname-pulls-out-of-joint-corentyne-bridge-project/"),
            ("Key News Suriname: Guyana en controle op Surinaamse groente en fruit (april 2023)",
             "https://keynews.sr/strenge-controle-door-guyana-op-surinaamse-groenten-en-vruchten"),
            ("Suriname-Guyana Chamber of Commerce", "https://surguychamber.org/"),
            _GSPSBC,
            _PBM,
            _MISSIONS,
        ],
    },
    # ------------------------------------------------------------------ Brazil
    {
        "key": "brazil",
        "name": ("Brazilië", "Brazil"),
        "short": ("Brazilië", "Brazil"),
        "flag": "\U0001F1E7\U0001F1F7",
        "region": "americas",
        "exp_musd": 0.02, "imp_musd": 54.9, "trade_year": 2025,
        "trade_src": ("Braziliaanse cijfers via UN Comtrade", "Brazilian figures via UN Comtrade"),
        "agree_short": ("Rijstakkoord", "Rice agreement"),
        "agree_sub": ("deelakkoord voor rijst; geassocieerd lid Mercosur", "partial scope deal for rice; Mercosur associate"),
        "intro": (
            "Brazilië is de grootste buur van Suriname, maar de handel is klein en eenzijdig: in 2025 leverde Brazilië voor USD "
            "55 miljoen, vooral vlees, staal en machines, en kocht het bijna niets terug. Er is geen weg tussen de twee landen. "
            "Beide regeringen willen dat veranderen.",
            "Brazil is Suriname's largest neighbour, but trade is small and one-sided: in 2025 Brazil supplied USD 55 "
            "million, mainly meat, steel and machinery, and bought almost nothing back. There is no road between the two "
            "countries. Both governments want to change that."),
        "tldr": [
            ("Geen vrijhandel; wel een deelakkoord met tariefconcessies voor Surinaamse rijst naar Noord-Brazilië.",
             "No free trade; there is a partial scope agreement with tariff concessions for Surinamese rice to northern Brazil."),
            ("Suriname is sinds 2013 geassocieerd lid van Mercosur; dat geeft geen vrije markttoegang.",
             "Suriname has been an associate member of Mercosur since 2013; that does not give free market access."),
            ("President Geerlings-Simons bezocht Brasília op 28 mei 2026; het wegenplan Anel das Guianas stond op de agenda.",
             "President Geerlings-Simons visited Brasília on 28 May 2026; the Anel das Guianas road plan was on the agenda."),
            ("Vluchten naar Belém (Gol en Surinam Airways); geen wegverbinding.",
             "Flights to Belém (Gol and Surinam Airways); no road link."),
        ],
        "trade": (
            "Volgens de Braziliaanse cijfers (UN Comtrade) exporteerde Brazilië in 2025 voor USD 54,9 miljoen naar Suriname: "
            "vooral vlees (USD 8,4 miljoen), artikelen van staal (USD 7,9 miljoen), machines (USD 6,2 miljoen) en "
            "vleesbereidingen (USD 5,4 miljoen). Brazilië kocht in 2025 voor maar USD 0,02 miljoen uit Suriname. In 2024 was dat "
            "USD 1,9 miljoen, bijna helemaal rijst.",
            "According to Brazilian figures (UN Comtrade), Brazil exported USD 54.9 million to Suriname in 2025: mainly meat "
            "(USD 8.4 million), steel articles (USD 7.9 million), machinery (USD 6.2 million) and meat preparations (USD 5.4 "
            "million). Brazil bought only USD 0.02 million from Suriname in 2025. In 2024 the figure was USD 1.9 million, "
            "almost all rice."),
        "agreements": (
            "Er is geen algemeen vrijhandelsakkoord. Volgens EZOTI geeft een Partial Scope Agreement tariefconcessies voor "
            "Surinaamse rijst naar Noord-Brazilië. Suriname is sinds 2013 geassocieerd lid van Mercosur; volledig lidmaatschap "
            "zou eerst toetreding tot ALADI vereisen. Brazilië en Suriname tekenden in 2018 een investeringsovereenkomst.\n\n"
            "Op 28 mei 2026 ontving president Lula president Jennifer Geerlings-Simons in Brasília, in het jaar van 50 jaar "
            "diplomatieke betrekkingen. Volgens CNN Brasil zouden 12 akten worden getekend om de bescheiden handel uit te "
            "breiden, met nadruk op voedselzekerheid en een betere zeeverbinding. Tijdens het bezoek waren er ook gesprekken van "
            "SITA met het Braziliaanse exportagentschap ApexBrasil.",
            "There is no general free trade agreement. According to EZOTI, a Partial Scope Agreement gives tariff concessions "
            "for Surinamese rice to northern Brazil. Suriname has been an associate member of Mercosur since 2013; full "
            "membership would first require joining ALADI. Brazil and Suriname signed an investment agreement in 2018.\n\n"
            "On 28 May 2026 President Lula received President Jennifer Geerlings-Simons in Brasília, in the 50th year of "
            "diplomatic relations. According to CNN Brasil, 12 instruments were to be signed to expand the modest trade, with "
            "a focus on food security and a better sea link. During the visit SITA also met the Brazilian export agency "
            "ApexBrasil."),
        "market_access": (
            "Brazilië heeft het gemeenschappelijk buitentarief van Mercosur en een ingewikkeld belastingstelsel met federale "
            "en deelstaatheffingen bovenop het invoerrecht. Voedsel en landbouwproducten hebben een registratie bij het "
            "Braziliaanse ministerie van Landbouw (MAPA) of de gezondheidsdienst ANVISA nodig. Zakendoen gaat in het Portugees. "
            "De markt die voor Suriname het dichtst bij ligt, is Noord-Brazilië: Belém (Pará) en Macapá (Amapá).",
            "Brazil applies the Mercosur common external tariff and a complex tax system with federal and state taxes on "
            "top of the import duty. Food and farm products need registration with the Brazilian agriculture ministry (MAPA) "
            "or the health agency ANVISA. Business is done in Portuguese. The market closest to Suriname is northern Brazil: "
            "Belém (Pará) and Macapá (Amapá)."),
        "logistics": (
            "Er is geen wegverbinding: de grens ligt in dicht bos. Gol en Surinam Airways vliegen tussen Paramaribo en Belém. "
            "Brazilië werkt aan het plan Anel das Guianas, een wegenring van Roraima via Guyana, Suriname en Frans-Guyana naar "
            "Amapá. Volgens het Braziliaanse ministerie van Buitenlandse Zaken (mei 2026) is het Guyanese deel het eerst aan de "
            "beurt, misschien binnen twee jaar; het deel door Suriname is nog niet concreet. Brazilië wil ook de zeeroute naar "
            "het Caribisch gebied verbeteren, omdat producten uit Noord-Brazilië nu vaak via Miami worden verhandeld.",
            "There is no road link: the border lies in dense forest. Gol and Surinam Airways fly between Paramaribo and "
            "Belém. Brazil is working on the Anel das Guianas plan, a road ring from Roraima via Guyana, Suriname and French "
            "Guiana to Amapá. According to Brazil's foreign ministry (May 2026), the Guyana section comes first, perhaps "
            "within two years; the section through Suriname is not yet concrete. Brazil also wants to improve the sea route "
            "to the Caribbean, because produce from northern Brazil is now often traded via Miami."),
        "diplomatic": (
            "Brazilië heeft sinds 1976 een ambassade in Paramaribo. Suriname heeft een ambassade in Brasília en een "
            "consulaat-generaal in Belém.",
            "Brazil has had an embassy in Paramaribo since 1976. Suriname has an embassy in Brasília and a consulate general "
            "in Belém."),
        "chambers": (
            "We hebben geen bilaterale kamer van koophandel kunnen bevestigen. Voor Braziliaanse leveranciers en kopers is "
            "ApexBrasil het officiële exportagentschap; aan Surinaamse kant is dat SITA. Veel Braziliaanse ondernemers in "
            "Suriname zitten in handel, horeca en de goudsector.",
            "We could not confirm a bilateral chamber of commerce. For Brazilian suppliers and buyers, ApexBrasil is the "
            "official export agency; on the Surinamese side it is SITA. Many Brazilian entrepreneurs in Suriname work in "
            "trade, hospitality and the gold sector."),
        "opportunities": [
            ("Rijst naar Noord-Brazilië onder de tariefconcessies; vraag EZOTI welke hoeveelheden en certificaten gelden.",
             "Rice to northern Brazil under the tariff concessions; ask EZOTI which volumes and certificates apply."),
            ("Inkoop van vlees, staal, machines en bouwmaterialen uit Brazilië als alternatief voor de VS en Europa.",
             "Sourcing meat, steel, machinery and building materials from Brazil as an alternative to the US and Europe."),
            ("Landbouwkennis (tropische teelt, veeteelt) via Braziliaanse partners en programma's.",
             "Agricultural know-how (tropical crops, livestock) through Brazilian partners and programmes."),
        ],
        "watch_out": [
            ("Braziliaanse invoerregels en belastingen zijn ingewikkeld: werk met een Braziliaanse importeur.",
             "Brazilian import rules and taxes are complex: work with a Brazilian importer."),
            ("De Braziliaanse real schommelt sterk; spreek prijzen af in USD.",
             "The Brazilian real is volatile; agree prices in USD."),
            ("Infrastructuurplannen duren lang: reken voorlopig op lucht- en zeevracht.",
             "Infrastructure plans take time: for now, plan on air and sea freight."),
        ],
        "guides": ["tradeagreements", "import", "agri", "logistics"],
        "sources": [
            _COMTRADE,
            _EZOTI,
            ("CNN Brasil: Lula ontvangt president Geerlings-Simons (28 mei 2026)",
             "https://www.cnnbrasil.com.br/politica/suriname-deve-pedir-ajuda-ao-brasil-com-seguranca-alimentar-e-rota-maritima/"),
            ("Poder360: Brazilië en Suriname bespreken wegverbinding (27 mei 2026)",
             "https://www.poder360.com.br/poder-infra/brasil-e-suriname-discutem-ampliacao-de-conexao-por-rodovias/"),
            ("Wikipedia: betrekkingen Brazilië-Suriname (ambassades, consulaat Belém)",
             "https://en.wikipedia.org/wiki/Brazil%E2%80%93Suriname_relations"),
            ("ApexBrasil: Braziliaans export- en investeringsagentschap", "https://www.apexbrasil.com.br/"),
            _PBM,
        ],
    },
    # ------------------------------------------------------------------ France / French Guiana
    {
        "key": "france-french-guiana",
        "name": ("Frankrijk en Frans-Guyana", "France and French Guiana"),
        "short": ("Frankrijk en Frans-Guyana", "France and French Guiana"),
        "flag": "\U0001F1EB\U0001F1F7",
        "region": "eu",
        "exp_musd": 28.8, "imp_musd": 11.7, "trade_year": 2025,
        "trade_src": ("Franse douane via UN Comtrade", "French customs via UN Comtrade"),
        "agree_short": ("EPA met de EU", "EU EPA"),
        "agree_sub": ("plus de lokale octroi de mer", "plus the local octroi de mer"),
        "intro": (
            "Frans-Guyana ligt aan de overkant van de Marowijne, maar is Europese Unie: wat je naar Saint-Laurent-du-Maroni "
            "brengt, is export naar de EU. In 2025 kocht Frankrijk (met Frans-Guyana) voor USD 29 miljoen uit Suriname, vooral "
            "brandstof en rijst. De grens zelf is politiek nog een open dossier.",
            "French Guiana lies across the Marowijne (Maroni), but it is part of the European Union: what you take to "
            "Saint-Laurent-du-Maroni is an export to the EU. In 2025 France (including French Guiana) bought USD 29 million "
            "from Suriname, mainly fuel and rice. The border itself is still an open political file."),
        "tldr": [
            ("Frans-Guyana is EU-grondgebied: EU-douane, EU-productregels en een EUR.1 voor nultarief.",
             "French Guiana is EU territory: EU customs, EU product rules and an EUR.1 for the zero tariff."),
            ("Bovenop het EU-tarief heft Frans-Guyana de octroi de mer, vastgesteld door de Collectivité Territoriale de Guyane.",
             "On top of the EU tariff, French Guiana charges the octroi de mer, set by the Collectivité Territoriale de Guyane."),
            ("Het grensprotocol van 2021 is nog niet geratificeerd; DNA hoorde in 2025 en 2026 het traditioneel gezag.",
             "The 2021 border protocol has not been ratified; the National Assembly heard traditional authorities in 2025 and 2026."),
            ("Franse taal en Franse etiketten zijn een must.", "French language and French labels are a must."),
        ],
        "trade": (
            "Frankrijk rapporteert Frans-Guyana sinds 1997 als deel van Frankrijk. Volgens die cijfers (UN Comtrade) kocht "
            "Frankrijk in 2025 voor USD 28,8 miljoen uit Suriname: USD 19,7 miljoen brandstof en olieproducten, USD 3,3 miljoen "
            "granen (rijst) en kleinere bedragen steen, hout en vis. Het grootste deel daarvan gaat vrijwel zeker naar Frans-Guyana. "
            "In 2023 stond er ook USD 37,5 miljoen aan goud in de cijfers. Frankrijk leverde in 2025 voor USD 11,7 miljoen aan "
            "Suriname, in 2024 vooral dranken (USD 5,4 miljoen), plastic en machines.\n\n"
            "Veel handel tussen Albina en Saint-Laurent loopt informeel over de rivier en staat niet in de statistiek.",
            "France has reported French Guiana as part of France since 1997. According to those figures (UN Comtrade), France "
            "bought USD 28.8 million from Suriname in 2025: USD 19.7 million of fuel and oil products, USD 3.3 million of "
            "cereals (rice) and smaller amounts of stone, timber and fish. Most of this almost certainly goes to French "
            "Guiana. In 2023 the figures also included USD 37.5 million of gold. France supplied USD 11.7 million to "
            "Suriname in 2025, in 2024 mainly drinks (USD 5.4 million), plastics and machinery.\n\n"
            "Much trade between Albina and Saint-Laurent crosses the river informally and does not appear in the statistics."),
        "agreements": (
            "Voor Frankrijk en Frans-Guyana geldt de EPA tussen de EU en CARIFORUM: goederen van Surinaamse oorsprong gaan "
            "rechten- en quotavrij de EU in met een EUR.1 of een oorsprongsverklaring. Frans-Guyana heft daarnaast de octroi de "
            "mer, een oude Franse heffing op goederen die de overzeese gebieden binnenkomen. Het territoriale bestuur (CTG) "
            "bepaalt welke producten belast worden en hoe hoog, binnen grenzen die de EU stelt; producten die ook lokaal "
            "gemaakt worden, worden vaak zwaarder belast. Vraag je koper of de douane in Frans-Guyana het tarief voor jouw "
            "product.\n\n"
            "Over de grens loopt een politiek debat. In 2021 tekenden Suriname en Frankrijk een protocol dat de grens over de "
            "Marowijne en de Lawa vastlegt en ook gezamenlijk rivierbeheer regelt. Het goedkeuringsontwerp ligt sinds december "
            "2021 bij De Nationale Assemblée. Een DNA-commissie hield op 6 november 2025 een hoorzitting met inheemsen, eind juli "
            "2026 stelde DNA-voorzitter Adhin de behandeling uit voor krutu's met het traditioneel gezag, en begin augustus 2026 "
            "kondigde coalitiepartij ABOP aan tegen te stemmen.",
            "France and French Guiana fall under the EPA between the EU and CARIFORUM: goods of Surinamese origin enter the EU "
            "duty and quota free with an EUR.1 or an origin declaration. French Guiana also charges the octroi de mer, an old "
            "French tax on goods entering the overseas territories. The territorial government (CTG) decides which products "
            "are taxed and at what rate, within limits set by the EU; products that are also made locally are often taxed "
            "more heavily. Ask your buyer or French Guiana customs for the rate for your product.\n\n"
            "There is a political debate about the border. In 2021 Suriname and France signed a protocol that fixes the "
            "border along the Marowijne and Lawa rivers and also covers joint river management. The approval bill has been "
            "before the National Assembly since December 2021. A committee of the Assembly held a hearing with indigenous "
            "communities on 6 November 2025, in late July 2026 Speaker Adhin postponed the debate for krutu meetings with "
            "traditional authorities, and in early August 2026 coalition party ABOP announced it would vote against."),
        "market_access": (
            "In Frans-Guyana gelden alle EU-regels: voedselveiligheid, CE-markering voor apparaten, en etiketten in het Frans. "
            "Kopers zijn groothandels en supermarkten in Cayenne, Kourou en Saint-Laurent, bouwbedrijven en de overheid. "
            "Saint-Laurent-du-Maroni en het westen van Frans-Guyana groeien snel, met veel vraag naar bouwmaterialen, voedsel "
            "en diensten. Prijzen en betalingen gaan in euro.\n\n"
            "Toerisme is de andere kant: inwoners van Frans-Guyana komen voor korte reizen naar Albina en Paramaribo. In 2025 "
            "spraken Surinaamse ondernemers met de economische en sociale adviesraad van de CTG over toerisme en grensbeheer, "
            "en over de toeristenbelasting die volgens hen gezinnen afschrikt. Zie de gids over toerismebedrijven.",
            "All EU rules apply in French Guiana: food safety, CE marking for appliances, and labels in French. Buyers are "
            "wholesalers and supermarkets in Cayenne, Kourou and Saint-Laurent, construction firms and the government. "
            "Saint-Laurent-du-Maroni and western French Guiana are growing fast, with strong demand for building materials, "
            "food and services. Prices and payments are in euros.\n\n"
            "Tourism is the other side: residents of French Guiana make short trips to Albina and Paramaribo. In 2025 "
            "Surinamese businesses met the CTG's economic and social advisory council on tourism and border management, and "
            "on the tourist charge which, in their view, deters families. See the tourism business guide."),
        "logistics": (
            "Tussen Albina en Saint-Laurent-du-Maroni steek je de Marowijne over per veerpont of korjaal; daarna is er een "
            "weg naar Cayenne. Goederen passeren de Surinaamse douane in Albina en de Franse douane in Saint-Laurent. Er zijn "
            "geen rechtstreekse lijnvluchten tussen Paramaribo en Cayenne in het vertrekoverzicht van oktober 2026. Naar "
            "Frankrijk zelf reis je meestal via Amsterdam of via Cayenne.",
            "Between Albina and Saint-Laurent-du-Maroni you cross the Marowijne by ferry or dugout boat; from there a road "
            "runs to Cayenne. Goods clear Surinamese customs in Albina and French customs in Saint-Laurent. There were no "
            "direct scheduled flights between Paramaribo and Cayenne in the October 2026 departure list. To France itself "
            "you usually travel via Amsterdam or via Cayenne."),
        "diplomatic": (
            "Frankrijk heeft sinds 1991 een ambassade in Paramaribo. Suriname heeft een ambassade in Parijs en "
            "consulaten-generaal in Cayenne en Saint-Laurent-du-Maroni. Surinaamse reizigers hebben voor Frans-Guyana een "
            "visum nodig; vraag de voorwaarden bij de Franse ambassade.",
            "France has had an embassy in Paramaribo since 1991. Suriname has an embassy in Paris and consulates general in "
            "Cayenne and Saint-Laurent-du-Maroni. Surinamese travellers need a visa for French Guiana; check the conditions "
            "with the French embassy."),
        "chambers": (
            "In Frans-Guyana is de Chambre de Commerce et d'Industrie de la Guyane de kamer van koophandel. De Franse "
            "ambassade organiseert geregeld bijeenkomsten met Franse bedrijven, bijvoorbeeld in november 2024 met een "
            "delegatie van Franse energiebedrijven. TotalEnergies is operator van het offshoreblok 58 (GranMorgu).",
            "In French Guiana the Chambre de Commerce et d'Industrie de la Guyane is the chamber of commerce. The French "
            "embassy regularly organises meetings with French companies, for example in November 2024 with a delegation of "
            "French energy companies. TotalEnergies is the operator of offshore Block 58 (GranMorgu)."),
        "opportunities": [
            ("Brandstof, rijst, bouwmaterialen en verse producten voor West-Frans-Guyana, mits EU-conform en met Franse etiketten.",
             "Fuel, rice, building materials and fresh produce for western French Guiana, if EU-compliant and labelled in French."),
            ("Toerisme en dagtochten voor bezoekers uit Frans-Guyana: Albina, Galibi, Paramaribo.",
             "Tourism and day trips for visitors from French Guiana: Albina, Galibi, Paramaribo."),
            ("Toeleveren aan Franse bedrijven in de olie- en gassector.", "Supplying French companies in the oil and gas sector."),
        ],
        "watch_out": [
            ("Informeel over de rivier verkopen kan in beslag genomen worden; doe zakelijke zendingen via de douane.",
             "Selling informally across the river risks seizure; send commercial shipments through customs."),
            ("De octroi de mer kan je prijsvoordeel tenietdoen: reken hem vooraf mee.",
             "The octroi de mer can wipe out your price advantage: include it in your calculation."),
            ("Het grensdebat en criminaliteit langs de rivier kunnen tot strengere controles leiden.",
             "The border debate and crime along the river can lead to stricter controls."),
        ],
        "guides": ["euexport", "tradeagreements", "tourismbiz", "oilgas", "districts"],
        "sources": [
            _COMTRADE,
            ("Collectivité Territoriale de Guyane: octroi de mer", "https://www.ctguyane.fr/octroi-de-mer/"),
            ("Europese Commissie, Access2Markets: EPA EU-CARIFORUM",
             "https://trade.ec.europa.eu/access-to-markets/nl/content/epa-caribbean-cariforum"),
            ("DNA: verslag hoorzitting grensprotocol Suriname-Frankrijk (6 november 2025)",
             "https://www.dna.sr/media/wvplzajd/beknopt-verslag-cie-102-cvr-grensprotocol.pdf"),
            ("Starnieuws: behandeling grensprotocol uitgesteld (29 juli 2026)",
             "https://www.starnieuws.com/index.php/welcome/index/nieuwsitem/93169"),
            ("Starnieuws: ABOP stemt tegen grensprotocol (2 augustus 2026)",
             "https://www.starnieuws.com/index.php/welcome/index/nieuwsitem/93249"),
            ("Key News Suriname: Franse senatoren en DNA over grenskwesties (april 2025)",
             "https://keynews.sr/franse-senatoren-en-surinaams-parlement-bespreken-grenskwesties-en-samenwerking"),
            ("Franse ambassade in Suriname", "https://sr.ambafrance.org/"),
            _MISSIONS,
            _PBM,
        ],
    },
    # ------------------------------------------------------------------ Trinidad and Tobago
    {
        "key": "trinidad-and-tobago",
        "name": ("Trinidad en Tobago", "Trinidad and Tobago"),
        "short": ("Trinidad en Tobago", "Trinidad and Tobago"),
        "flag": "\U0001F1F9\U0001F1F9",
        "region": "caricom",
        "exp_musd": 10.1, "imp_musd": 103.5, "trade_year": 2025,
        "trade_src": ("cijfers van T&T via UN Comtrade", "T&T figures via UN Comtrade"),
        "agree_short": ("CARICOM", "CARICOM"),
        "agree_sub": ("geen invoerrecht op goederen van CARICOM-oorsprong", "no duty on goods of CARICOM origin"),
        "intro": (
            "Trinidad en Tobago is de grootste CARICOM-leverancier van Suriname: brandstof, dranken, voeding en chemicaliën, "
            "volgens de eigen cijfers van T&T voor USD 104 miljoen in 2025. Suriname verkoopt er weinig. Met tientallen jaren "
            "ervaring in olie en gas is T&T ook een bron van partners en kennis.",
            "Trinidad and Tobago is Suriname's largest CARICOM supplier: fuel, drinks, food and chemicals, worth USD 104 "
            "million in 2025 according to T&T's own figures. Suriname sells little there. With decades of oil and gas "
            "experience, T&T is also a source of partners and know-how."),
        "tldr": [
            ("CARICOM: geen invoerrecht met certificaat van oorsprong en CARICOM-factuur.",
             "CARICOM: no duty with a certificate of origin and a CARICOM invoice."),
            ("Caribbean Airlines vliegt rechtstreeks tussen Paramaribo en Port of Spain.",
             "Caribbean Airlines flies direct between Paramaribo and Port of Spain."),
            ("Geen ambassades in elkaars hoofdstad; Suriname bedient T&T vanuit Georgetown.",
             "No embassies in each other's capitals; Suriname covers T&T from Georgetown."),
            ("T&T staat sinds juli 2026 op de Amerikaanse Section 301-lijst (10%), Suriname niet.",
             "Since July 2026 T&T is on the US Section 301 list (10%), Suriname is not."),
        ],
        "trade": (
            "Volgens de cijfers van Trinidad en Tobago (UN Comtrade) exporteerde T&T in 2025 voor USD 103,5 miljoen naar "
            "Suriname: brandstof en olieproducten (USD 44,3 miljoen), dranken (USD 9,5 miljoen), bakkerij- en graanproducten "
            "(USD 6,4 miljoen) en chemische producten (USD 6,2 miljoen). Suriname meldt zelf hogere invoer uit T&T: USD 180 "
            "miljoen in 2023 en USD 250 miljoen in 2022, waarschijnlijk door brandstofladingen die anders geboekt worden.\n\n"
            "T&T kocht in 2025 voor USD 10,1 miljoen uit Suriname. In 2024 waren dat onder meer plantaardige oliën en vetten "
            "(USD 3,5 miljoen), olieproducten, rijst, bananen en vis (elk rond USD 1 miljoen).",
            "According to Trinidad and Tobago's figures (UN Comtrade), T&T exported USD 103.5 million to Suriname in 2025: "
            "fuel and oil products (USD 44.3 million), drinks (USD 9.5 million), bakery and cereal products (USD 6.4 "
            "million) and chemical products (USD 6.2 million). Suriname itself reports higher imports from T&T: USD 180 "
            "million in 2023 and USD 250 million in 2022, probably because fuel cargoes are recorded differently.\n\n"
            "T&T bought USD 10.1 million from Suriname in 2025. In 2024 this included vegetable oils and fats (USD 3.5 "
            "million), oil products, rice, bananas and fish (about USD 1 million each)."),
        "agreements": (
            "Beide landen zijn lid van CARICOM en de CSME: goederen van CARICOM-oorsprong gaan zonder invoerrecht over en weer, "
            "met een CARICOM-certificaat van oorsprong en een CARICOM-factuur. Ompakken of doorverkopen van goederen uit derde "
            "landen geeft geen recht op het nultarief.",
            "Both countries are members of CARICOM and the CSME: goods of CARICOM origin move duty free in both directions, "
            "with a CARICOM certificate of origin and a CARICOM invoice. Repacking or reselling goods from third countries "
            "does not qualify for the zero rate."),
        "market_access": (
            "T&T is Engelstalig en heeft een volwassen verwerkende industrie, vooral voeding, dranken en verpakking. Surinaamse "
            "exporteurs concurreren dus met lokale producenten. Eisen aan etiketten en voedselveiligheid komen van het Trinidad "
            "and Tobago Bureau of Standards en het ministerie van Volksgezondheid; voor planten en dieren geldt een fytosanitair "
            "of veterinair certificaat. Kopers zijn groothandels, supermarktketens en voedselverwerkers.",
            "T&T is English-speaking and has a mature manufacturing sector, especially food, drinks and packaging. Surinamese "
            "exporters therefore compete with local producers. Labelling and food safety requirements come from the Trinidad "
            "and Tobago Bureau of Standards and the Ministry of Health; plants and animals need a phytosanitary or veterinary "
            "certificate. Buyers are wholesalers, supermarket chains and food processors."),
        "logistics": (
            "Caribbean Airlines vliegt rechtstreeks tussen Paramaribo en Port of Spain. Voor zeevracht is Port of Spain een "
            "regionale haven met verbindingen naar de rest van het Caribisch gebied; vraag je expediteur naar de route en "
            "doorlooptijd.",
            "Caribbean Airlines flies direct between Paramaribo and Port of Spain. For sea freight Port of Spain is a regional "
            "port with links to the rest of the Caribbean; ask your forwarder about route and lead time."),
        "diplomatic": (
            "Suriname en Trinidad en Tobago hebben geen ambassade in elkaars hoofdstad. De Surinaamse ambassade in Georgetown is "
            "ook verantwoordelijk voor Trinidad en Tobago, en de ambassadeur van T&T voor Suriname zit in Georgetown. In 2024 "
            "bezocht de handelsattaché van T&T voor Guyana en Suriname het Surinaamse bedrijfsleven om handelscontacten te leggen.",
            "Suriname and Trinidad and Tobago have no embassies in each other's capitals. The Surinamese embassy in Georgetown "
            "also covers Trinidad and Tobago, and T&T's ambassador for Suriname is based in Georgetown. In 2024 T&T's trade "
            "attaché for Guyana and Suriname visited Surinamese business organisations to build trade contacts."),
        "chambers": (
            "In T&T zijn de Trinidad and Tobago Chamber of Industry and Commerce, de Trinidad and Tobago Manufacturers' "
            "Association (TTMA) en het exportagentschap exporTT de gebruikelijke ingangen. Voor regionale beurzen en "
            "subsidieprogramma's is de Caribbean Export Development Agency nuttig.",
            "In T&T the Trinidad and Tobago Chamber of Industry and Commerce, the Trinidad and Tobago Manufacturers' "
            "Association (TTMA) and the export agency exporTT are the usual entry points. For regional trade fairs and grant "
            "programmes the Caribbean Export Development Agency is useful."),
        "opportunities": [
            ("Kennis en partners uit de Trinidadiaanse olie- en gassector voor de Surinaamse offshore-ontwikkeling.",
             "Know-how and partners from Trinidad's oil and gas sector for Suriname's offshore development."),
            ("Rijst, bananen, vis en verwerkte landbouwproducten met CARICOM-oorsprong.",
             "Rice, bananas, fish and processed farm products of CARICOM origin."),
            ("Inkoop van dranken, voeding en verpakkingen zonder invoerrecht, als ze CARICOM-oorsprong hebben.",
             "Sourcing drinks, food and packaging duty free, if they are of CARICOM origin."),
        ],
        "watch_out": [
            ("Niet alles uit T&T is CARICOM-goed: vraag je leverancier altijd het certificaat van oorsprong.",
             "Not everything from T&T is a CARICOM good: always ask your supplier for the certificate of origin."),
            ("Concurrentie van grote Trinidadiaanse merken in de supermarktschappen.",
             "Competition from large Trinidadian brands on supermarket shelves."),
            ("Deviezen: de TT-dollar is niet vrij beschikbaar; spreek betaling in USD af.",
             "Foreign exchange: TT dollars are not always freely available; agree payment in USD."),
        ],
        "guides": ["tradeagreements", "oilgas", "export", "import"],
        "sources": [
            _COMTRADE,
            _EZOTI,
            _CARIBEXPORT,
            ("Holland & Knight: Section 301-heffingen voor 60 landen (juli 2026)",
             "https://www.hklaw.com/en/insights/publications/2026/07/and-the-tariff-beat-goes-on"),
            _PBM,
            _MISSIONS,
            _EMB,
        ],
    },
    # ------------------------------------------------------------------ Barbados
    {
        "key": "barbados",
        "name": ("Barbados", "Barbados"),
        "short": ("Barbados", "Barbados"),
        "flag": "\U0001F1E7\U0001F1E7",
        "region": "caricom",
        "exp_musd": 6.1, "imp_musd": 2.6, "trade_year": 2025,
        "trade_src": ("cijfers van Barbados via UN Comtrade", "Barbados figures via UN Comtrade"),
        "agree_short": ("CARICOM", "CARICOM"),
        "agree_sub": ("geen invoerrecht op goederen van CARICOM-oorsprong", "no duty on goods of CARICOM origin"),
        "intro": (
            "Barbados is een kleine, welvarende CARICOM-markt die bijna al zijn voedsel invoert. In 2025 kocht Barbados voor "
            "USD 6 miljoen uit Suriname, vooral vis. Surinam Airways vliegt er rechtstreeks heen.",
            "Barbados is a small, prosperous CARICOM market that imports almost all of its food. In 2025 Barbados bought USD 6 "
            "million from Suriname, mainly fish. Surinam Airways flies there direct."),
        "tldr": [
            ("CARICOM: geen invoerrecht met certificaat van oorsprong en CARICOM-factuur.",
             "CARICOM: no duty with a certificate of origin and a CARICOM invoice."),
            ("Vis is het belangrijkste Surinaamse product op Barbados.", "Fish is the main Surinamese product in Barbados."),
            ("Barbados doet sinds 1 oktober 2025 mee aan volledig vrij verkeer van personen met drie andere landen; Suriname niet.",
             "Since 1 October 2025 Barbados takes part in full free movement of people with three other countries; Suriname does not."),
        ],
        "trade": (
            "Volgens de cijfers van Barbados (UN Comtrade) kocht Barbados in 2025 voor USD 6,1 miljoen uit Suriname en leverde "
            "het voor USD 2,6 miljoen. In 2024 was USD 4,6 miljoen van de invoer uit Suriname vis; daarnaast fruit, "
            "kleurstoffen, vlees en meelproducten. In 2022 was de invoer uit Suriname hoger (USD 18,8 miljoen).",
            "According to Barbados figures (UN Comtrade), Barbados bought USD 6.1 million from Suriname in 2025 and supplied "
            "USD 2.6 million. In 2024, USD 4.6 million of the imports from Suriname was fish; the rest included fruit, dyes, "
            "meat and flour products. In 2022 imports from Suriname were higher (USD 18.8 million)."),
        "agreements": (
            "Barbados en Suriname zijn allebei lid van CARICOM en de CSME. Goederen van CARICOM-oorsprong gaan zonder "
            "invoerrecht, met certificaat van oorsprong en CARICOM-factuur. Sinds 1 oktober 2025 geldt volledig vrij verkeer van "
            "personen tussen Barbados, Belize, Dominica en St. Vincent en de Grenadines; Suriname doet daar niet aan mee. Voor "
            "Surinamers die op Barbados willen werken, blijft het CARICOM Skills Certificate of een werkvergunning nodig.",
            "Barbados and Suriname are both members of CARICOM and the CSME. Goods of CARICOM origin enter duty free with a "
            "certificate of origin and CARICOM invoice. Since 1 October 2025 full free movement of people applies between "
            "Barbados, Belize, Dominica and St Vincent and the Grenadines; Suriname does not take part. Surinamese who want to "
            "work in Barbados still need a CARICOM Skills Certificate or a work permit."),
        "market_access": (
            "Barbados heeft veel toerisme en een hoog inkomen: hotels, restaurants en supermarkten vragen vaste kwaliteit, "
            "kleine regelmatige leveringen en Engelstalige etiketten. Voor vis en vlees zijn veterinaire certificaten nodig, voor "
            "groente en fruit een fytosanitair certificaat. Invest Barbados is het investerings- en exportagentschap van "
            "Barbados.",
            "Barbados has a lot of tourism and a high income: hotels, restaurants and supermarkets want consistent quality, "
            "small regular deliveries and English labels. Fish and meat need veterinary certificates, fruit and vegetables a "
            "phytosanitary certificate. Invest Barbados is Barbados' investment and export agency."),
        "logistics": (
            "Surinam Airways vliegt rechtstreeks tussen Paramaribo en Barbados (Grantley Adams). Zeevracht gaat meestal met "
            "overslag via Trinidad of andere Caribische havens; per eenheid is dat duur voor kleine volumes.",
            "Surinam Airways flies direct between Paramaribo and Barbados (Grantley Adams). Sea freight usually goes via "
            "transhipment in Trinidad or other Caribbean ports; per unit this is expensive for small volumes."),
        "diplomatic": (
            "Suriname en Barbados hebben geen ambassade in elkaars hoofdstad. Contact loopt via de ministeries van Buitenlandse "
            "Zaken en via CARICOM.",
            "Suriname and Barbados have no embassies in each other's capitals. Contact runs through the foreign ministries "
            "and through CARICOM."),
        "chambers": (
            "Op Barbados zijn de Barbados Chamber of Commerce and Industry en Invest Barbados de gebruikelijke ingangen. "
            "Regionale beurzen en trainingen lopen via de Caribbean Export Development Agency, die in Barbados gevestigd is.",
            "In Barbados the Barbados Chamber of Commerce and Industry and Invest Barbados are the usual entry points. "
            "Regional trade fairs and training run through the Caribbean Export Development Agency, which is based in "
            "Barbados."),
        "opportunities": [
            ("Vis en zeevruchten voor hotels en restaurants.", "Fish and seafood for hotels and restaurants."),
            ("Rijst, fruit en verwerkte landbouwproducten met CARICOM-oorsprong.",
             "Rice, fruit and processed farm products of CARICOM origin."),
            ("Samenwerking met Barbadiaanse dienstverleners (financiën, toerisme, opleiding).",
             "Partnering with Barbadian service providers (finance, tourism, training)."),
        ],
        "watch_out": [
            ("Kleine markt: vracht per kilo is hoog; combineer zendingen of werk met een vaste afnemer.",
             "Small market: freight per kilo is high; combine shipments or work with a regular buyer."),
            ("Strenge controle op voedselveiligheid in de toeristische sector.", "Strict food safety checks in the tourism sector."),
        ],
        "guides": ["tradeagreements", "export", "tourismbiz"],
        "sources": [
            _COMTRADE,
            ("CARICOM: nieuws over vrij verkeer (oktober 2026)", "https://caricom.org/category/free-movement/"),
            _CARIBEXPORT,
            ("Invest Barbados", "https://www.investbarbados.org/"),
            _PBM,
            _MISSIONS,
        ],
    },
    # ------------------------------------------------------------------ Jamaica
    {
        "key": "jamaica",
        "name": ("Jamaica", "Jamaica"),
        "short": ("Jamaica", "Jamaica"),
        "flag": "\U0001F1EF\U0001F1F2",
        "region": "caricom",
        "exp_musd": 62.8, "imp_musd": 5.9, "trade_year": 2025,
        "trade_src": ("Jamaicaanse cijfers via UN Comtrade", "Jamaican figures via UN Comtrade"),
        "agree_short": ("CARICOM", "CARICOM"),
        "agree_sub": ("geen invoerrecht op goederen van CARICOM-oorsprong", "no duty on goods of CARICOM origin"),
        "intro": (
            "Jamaica is een van de weinige landen waar Suriname meer verkoopt dan het koopt: in 2025 voor USD 63 miljoen, "
            "vooral vis en rijst. Jamaica is binnen CARICOM een belangrijke afnemer van Surinaamse rijst. Een handelsmissie in "
            "mei 2024 bracht bedrijven uit beide landen bij elkaar.",
            "Jamaica is one of the few countries where Suriname sells more than it buys: USD 63 million in 2025, mainly fish "
            "and rice. Within CARICOM, Jamaica is an important buyer of Surinamese rice. A trade mission in May 2024 brought "
            "companies from both countries together."),
        "tldr": [
            ("Jamaica kocht in 2024 voor USD 24,2 miljoen aan Surinaamse rijst en in 2025 voor USD 44,7 miljoen aan vis.",
             "Jamaica bought USD 24.2 million of Surinamese rice in 2024 and USD 44.7 million of fish in 2025."),
            ("CARICOM: geen invoerrecht met certificaat van oorsprong en CARICOM-factuur.",
             "CARICOM: no duty with a certificate of origin and a CARICOM invoice."),
            ("Geen rechtstreekse vlucht; reizen via Miami, Panama of Port of Spain.",
             "No direct flight; travel via Miami, Panama or Port of Spain."),
            ("Exportagentschap JAMPRO organiseerde in mei 2024 een handelsmissie naar Guyana en Suriname.",
             "Export agency JAMPRO organised a trade mission to Guyana and Suriname in May 2024."),
        ],
        "trade": (
            "Volgens de Jamaicaanse cijfers (UN Comtrade) kocht Jamaica in 2025 voor USD 62,8 miljoen uit Suriname: vis en "
            "schaaldieren (USD 44,7 miljoen) en granen (USD 15,9 miljoen). In 2024 was de rijstinvoer uit Suriname USD 24,2 "
            "miljoen en de visinvoer ruim USD 33 miljoen. Jamaica leverde in 2025 voor USD 5,9 miljoen aan Suriname. Bij de "
            "handelsmissie van 2024 noemde de Surinaamse minister van Economische Zaken het handelsvolume bescheiden, met ruimte "
            "voor groei.",
            "According to Jamaican figures (UN Comtrade), Jamaica bought USD 62.8 million from Suriname in 2025: fish and "
            "shellfish (USD 44.7 million) and cereals (USD 15.9 million). In 2024 rice imports from Suriname were USD 24.2 "
            "million and fish imports over USD 33 million. Jamaica supplied USD 5.9 million to Suriname in 2025. During the "
            "2024 trade mission, Suriname's Minister of Economic Affairs called the trade volume modest, with room to grow."),
        "agreements": (
            "Beide landen zijn lid van CARICOM en de CSME. Surinaamse rijst en vis van CARICOM-oorsprong gaan zonder "
            "invoerrecht Jamaica in, met CARICOM-certificaat van oorsprong en CARICOM-factuur. Daardoor concurreert Surinaamse "
            "rijst gunstig met rijst van buiten de regio, waarop het gemeenschappelijk buitentarief (CET) van CARICOM geldt.",
            "Both countries are members of CARICOM and the CSME. Surinamese rice and fish of CARICOM origin enter Jamaica duty "
            "free, with a CARICOM certificate of origin and CARICOM invoice. This gives Surinamese rice an edge over rice from "
            "outside the region, which pays CARICOM's Common External Tariff (CET)."),
        "market_access": (
            "Jamaica (ongeveer 2,8 miljoen inwoners) is Engelstalig en importeert veel basisvoedsel. Kopers zijn grote "
            "importeurs en groothandels in Kingston. Voor sommige landbouwproducten vraagt Jamaica een invoervergunning; laat je "
            "koper die regelen voordat je verscheept. Vis en vlees hebben een veterinair certificaat nodig, planten en granen "
            "een fytosanitair certificaat.",
            "Jamaica (about 2.8 million people) is English-speaking and imports a lot of staple food. Buyers are large "
            "importers and wholesalers in Kingston. For some farm products Jamaica requires an import permit; have your buyer "
            "arrange it before you ship. Fish and meat need a veterinary certificate, plants and grains a phytosanitary "
            "certificate."),
        "logistics": (
            "Er is geen rechtstreekse vlucht tussen Paramaribo en Kingston in het vertrekoverzicht van oktober 2026; reizigers "
            "gaan via Miami, Panama of Port of Spain. Rijst en bevroren vis gaan per container, meestal met overslag. Vraag je "
            "expediteur naar koelcontainers en doorlooptijd.",
            "There was no direct flight between Paramaribo and Kingston in the October 2026 departure list; travellers go via "
            "Miami, Panama or Port of Spain. Rice and frozen fish go by container, usually with transhipment. Ask your "
            "forwarder about reefer containers and lead time."),
        "diplomatic": (
            "Suriname en Jamaica hebben geen ambassade in elkaars hoofdstad. Bij de handelsmissie van 2024 stelde Suriname een "
            "MoU voor om handelsbarrières te verminderen en douaneprocedures te vereenvoudigen.",
            "Suriname and Jamaica have no embassies in each other's capitals. During the 2024 trade mission Suriname proposed "
            "an MoU to reduce trade barriers and simplify customs procedures."),
        "chambers": (
            "JAMPRO (Jamaica Promotions Corporation) is het Jamaicaanse investerings- en exportagentschap. De missie van 12 tot "
            "18 mei 2024 onder leiding van minister Aubyn Hill bezocht Guyana en Suriname; 38 Jamaicaanse bedrijven hadden "
            "belangstelling voor Suriname, in technologie, industrie, agribusiness, zakelijke diensten, logistiek en mijnbouw. "
            "In Paramaribo waren er meer dan honderd B2B-gesprekken.",
            "JAMPRO (Jamaica Promotions Corporation) is Jamaica's investment and export agency. The mission of 12 to 18 May "
            "2024, led by Minister Aubyn Hill, visited Guyana and Suriname; 38 Jamaican companies were interested in "
            "Suriname, in technology, manufacturing, agribusiness, business services, logistics and mining. In Paramaribo "
            "there were more than a hundred B2B meetings."),
        "opportunities": [
            ("Rijst: vaste contracten met Jamaicaanse importeurs, met constante kwaliteit en leverzekerheid.",
             "Rice: regular contracts with Jamaican importers, with consistent quality and reliable supply."),
            ("Vis en zeevruchten, vers of bevroren.", "Fish and seafood, fresh or frozen."),
            ("Jamaicaanse voedingsmiddelen, sauzen en dranken importeren voor de Surinaamse markt.",
             "Importing Jamaican foods, sauces and drinks for the Surinamese market."),
            ("Samenwerking in BPO en creatieve industrie; Jamaica heeft een grote outsourcingsector.",
             "Cooperation in BPO and creative industries; Jamaica has a large outsourcing sector."),
        ],
        "watch_out": [
            ("Rijstprijzen schommelen met de wereldmarkt: spreek prijsformules en leveringstermijnen duidelijk af.",
             "Rice prices follow the world market: agree price formulas and delivery terms clearly."),
            ("Geen rechtstreekse verbinding: houd rekening met overslag en langere doorlooptijden.",
             "No direct link: allow for transhipment and longer lead times."),
        ],
        "guides": ["tradeagreements", "agri", "export"],
        "sources": [
            _COMTRADE,
            ("Ministerie van Industrie, Investeringen en Handel Jamaica: missie naar Guyana en Suriname (16 mei 2024)",
             "https://www.miic.gov.jm/hill-lead-jcan-business-mission-guyana-suriname"),
            _CARIBEXPORT,
            _EZOTI,
            _PBM,
            _MISSIONS,
        ],
    },
    # ------------------------------------------------------------------ Dutch Caribbean
    {
        "key": "dutch-caribbean",
        "name": ("Curaçao en Aruba", "Curaçao and Aruba"),
        "short": ("Curaçao en Aruba", "Curaçao and Aruba"),
        "flag": "\U0001F1E8\U0001F1FC \U0001F1E6\U0001F1FC",
        "region": "americas",
        "exp_musd": 2.1, "imp_musd": 2.5, "trade_year": 2023,
        "trade_src": ("Surinaamse cijfers (ABS) via UN Comtrade", "Surinamese figures (ABS) via UN Comtrade"),
        "agree_short": ("Geen akkoord", "No agreement"),
        "agree_sub": ("eigen douane per eiland", "each island has its own customs"),
        "intro": (
            "Curaçao en Aruba liggen dichtbij in taal en cultuur, maar zijn kleine markten met eigen douane en munt. De "
            "geregistreerde handel is klein: een paar miljoen dollar per jaar. Er zijn wel nieuwe contacten: een Arubaanse "
            "handelsmissie in 2024 en een samenwerking tussen SITA en het Curaçaose investeringsbureau CINEX in 2025.",
            "Curaçao and Aruba are close in language and culture, but they are small markets with their own customs and "
            "currency. Recorded trade is small: a few million dollars a year. There are new contacts: an Aruban trade mission "
            "in 2024 and a cooperation between SITA and Curaçao's investment agency CINEX in 2025."),
        "tldr": [
            ("Curaçao en Aruba zijn geen EU en geen volwaardig CARICOM-lid: geen voorkeurstarief voor Surinaamse goederen.",
             "Curaçao and Aruba are not in the EU and not full CARICOM members: no preferential rate for Surinamese goods."),
            ("Surinam Airways vliegt rechtstreeks naar Curaçao en Aruba.", "Surinam Airways flies direct to Curaçao and Aruba."),
            ("Munt: Caribische gulden (XCG) op Curaçao, Arubaanse florin (AWG) op Aruba.",
             "Currency: Caribbean guilder (XCG) in Curaçao, Aruban florin (AWG) in Aruba."),
            ("Suriname heeft een consulaat-generaal in Willemstad.", "Suriname has a consulate general in Willemstad."),
        ],
        "trade": (
            "Curaçao en Aruba leveren geen recente cijfers aan UN Comtrade. Volgens de Surinaamse cijfers over 2023 exporteerde "
            "Suriname voor USD 1,6 miljoen naar Aruba (tabak en dranken) en USD 0,5 miljoen naar Curaçao, en importeerde het voor "
            "USD 2,3 miljoen uit Curaçao en USD 0,2 miljoen uit Aruba. Diensten (toerisme, luchtvaart, financiële diensten) en "
            "informele handel via reizigers zijn niet meegeteld.",
            "Curaçao and Aruba do not report recent figures to UN Comtrade. According to Surinamese figures for 2023, "
            "Suriname exported USD 1.6 million to Aruba (tobacco and drinks) and USD 0.5 million to Curaçao, and imported USD "
            "2.3 million from Curaçao and USD 0.2 million from Aruba. Services (tourism, aviation, financial services) and "
            "informal trade by travellers are not included."),
        "agreements": (
            "Curaçao en Aruba zijn landen binnen het Koninkrijk der Nederlanden, maar geen deel van de EU: ze hebben de status "
            "van Landen en Gebieden Overzee (LGO). De EPA met de EU geldt daar dus niet. Ze zijn ook geen volwaardig lid van "
            "CARICOM. Voor zover wij weten is er geen handelsakkoord dat Surinaamse goederen een voorkeurstarief geeft: je "
            "betaalt het gewone invoerrecht van het eiland.",
            "Curaçao and Aruba are countries within the Kingdom of the Netherlands, but not part of the EU: they have Overseas "
            "Countries and Territories (OCT) status. The EU EPA therefore does not apply there. They are also not full members "
            "of CARICOM. As far as we know there is no trade agreement giving Surinamese goods a preferential rate: you pay "
            "the island's normal import duty."),
        "market_access": (
            "Beide eilanden importeren bijna al hun voedsel, veel uit de VS en Nederland. Nederlands wordt begrepen, maar de "
            "voertaal in winkels en horeca is vaak Papiamento of Papiamentu, Engels of Spaans. Elk eiland heeft eigen regels "
            "voor etiketten, voedselveiligheid en invoervergunningen; vraag je koper of de douane van het eiland. Kopers zijn "
            "supermarkten, groothandels, hotels en restaurants.",
            "Both islands import almost all their food, much of it from the US and the Netherlands. Dutch is understood, but "
            "shops and restaurants often work in Papiamentu, English or Spanish. Each island has its own rules on labels, food "
            "safety and import permits; ask your buyer or the island's customs. Buyers are supermarkets, wholesalers, hotels "
            "and restaurants."),
        "logistics": (
            "Surinam Airways vliegt rechtstreeks van Paramaribo naar Curaçao (Hato) en Aruba (Queen Beatrix). Zeevracht gaat "
            "meestal met overslag. Tijdens de Arubaanse handelsmissie van juni 2024 werd gesproken over een vrachtvlucht tussen "
            "Aruba en Suriname.",
            "Surinam Airways flies direct from Paramaribo to Curaçao (Hato) and Aruba (Queen Beatrix). Sea freight usually "
            "involves transhipment. During the Aruban trade mission of June 2024 a cargo flight between Aruba and Suriname was "
            "discussed."),
        "diplomatic": (
            "Suriname heeft een consulaat-generaal in Willemstad (Curaçao). Curaçao en Aruba hebben geen eigen ambassade in "
            "Paramaribo; buitenlandse zaken zijn een taak van het Koninkrijk.",
            "Suriname has a consulate general in Willemstad (Curaçao). Curaçao and Aruba have no embassy of their own in "
            "Paramaribo; foreign affairs are a Kingdom matter."),
        "chambers": (
            "Op 6 februari 2025 tekenden SITA en CINEX, het handels- en investeringsbureau van Curaçao, een MoU voor "
            "samenwerking in handel en investeringen; ook de Suriname Energy Chamber tekende met CINEX. Van 24 tot 28 juni 2024 "
            "bracht de Kamer van Koophandel van Aruba een handelsmissie van 13 Arubaanse bedrijven naar Suriname (techniek, "
            "voeding, sigaren, landbouwimport, medische hulpmiddelen en ICT), met bijna honderd gesprekken met Surinaamse "
            "bedrijven.",
            "On 6 February 2025 SITA and CINEX, Curaçao's trade and investment agency, signed an MoU on trade and investment "
            "cooperation; the Suriname Energy Chamber also signed with CINEX. From 24 to 28 June 2024 the Aruba Chamber of "
            "Commerce brought a trade mission of 13 Aruban companies to Suriname (engineering, food, cigars, agricultural "
            "imports, medical devices and ICT), with nearly a hundred meetings with Surinamese companies."),
        "opportunities": [
            ("Verse groente, fruit en vis voor eilanden die bijna alles invoeren, als je de koelketen en certificaten op orde hebt.",
             "Fresh vegetables, fruit and fish for islands that import almost everything, if your cold chain and certificates are in order."),
            ("Toerisme: combinatiereizen en de cruisesector; Curaçao heeft veel ervaring met cruisetoerisme.",
             "Tourism: combined trips and the cruise sector; Curaçao has a lot of experience with cruise tourism."),
            ("Financiële en juridische dienstverleners op Curaçao als partner voor regionale structuren.",
             "Financial and legal service providers in Curaçao as partners for regional structures."),
        ],
        "watch_out": [
            ("Elk eiland is een aparte markt met eigen douane, munt en regels.", "Each island is a separate market with its own customs, currency and rules."),
            ("Kleine volumes en dure vracht: test met luchtvracht of een gedeelde container.",
             "Small volumes and expensive freight: test with air freight or a shared container."),
        ],
        "guides": ["export", "tourismbiz", "logistics"],
        "sources": [
            _COMTRADE,
            ("Key News Suriname: SITA tekent MoU met CINEX (9 februari 2025)",
             "https://keynews.sr/strategische-samenwerkingsovereenkomsten-ondertekend-om-investeringen-in-suriname-te-stimuleren"),
            ("Aruba Chamber of Commerce: handelsmissie Aruba-Suriname (juni 2024)",
             "https://www.arubachamber.com/succesful-aruba-suriname-trade-mission"),
            ("Key News Suriname: werkbezoek Arubaanse vicepremier (juli 2023)",
             "https://keynews.sr/minister-sewdien-krijgt-werkbezoek-van-arubaanse-vicepremier"),
            _PBM,
            _EMB,
        ],
    },
    # ------------------------------------------------------------------ Belgium
    {
        "key": "belgium",
        "name": ("België", "Belgium"),
        "short": ("België", "Belgium"),
        "flag": "\U0001F1E7\U0001F1EA",
        "region": "eu",
        "exp_musd": 2.4, "imp_musd": 21.8, "trade_year": 2025,
        "trade_src": ("Belgische cijfers via UN Comtrade", "Belgian figures via UN Comtrade"),
        "agree_short": ("EPA met de EU", "EU EPA"),
        "agree_sub": ("rechten- en quotavrij voor Surinaamse goederen", "duty and quota free for Surinamese goods"),
        "intro": (
            "België is een deels Nederlandstalige EU-markt met Antwerpen als een van de grootste havens van Europa. De handel met "
            "Suriname is bescheiden: in 2025 leverde België voor USD 22 miljoen en kocht het voor USD 2 miljoen, vooral hout. "
            "De Surinaamse ambassade in Brussel is ook de vertegenwoordiging bij de EU.",
            "Belgium is a Dutch-speaking EU market (in Flanders) with Antwerp as one of Europe's largest ports. Trade with "
            "Suriname is modest: in 2025 Belgium supplied USD 22 million and bought USD 2 million, mainly timber. The "
            "Surinamese embassy in Brussels is also the mission to the EU."),
        "tldr": [
            ("Zelfde regels als de rest van de EU: rechten- en quotavrij onder de EPA, maar EU-productregels.",
             "Same rules as the rest of the EU: duty and quota free under the EPA, but EU product rules."),
            ("Antwerpen is een mogelijke binnenkomsthaven voor de hele EU.", "Antwerp is a possible port of entry for the whole EU."),
            ("Suriname heeft een ambassade in Brussel; België heeft geen ambassade in Paramaribo.",
             "Suriname has an embassy in Brussels; Belgium has no embassy in Paramaribo."),
        ],
        "trade": (
            "Volgens de Belgische cijfers (UN Comtrade) leverde België in 2025 voor USD 21,8 miljoen aan Suriname en kocht het "
            "voor USD 2,4 miljoen, bijna helemaal hout. Naar Suriname gingen in 2024 vooral machines, groente- en fruitconserven, "
            "veevoer, dranken, kunstmest en meel. In 2022 meldde België een veel hogere invoer uit Suriname (USD 182,5 miljoen); "
            "zulke sprongen komen meestal door enkele grote ladingen grondstoffen of edelmetaal.",
            "According to Belgian figures (UN Comtrade), Belgium supplied USD 21.8 million to Suriname in 2025 and bought USD "
            "2.4 million, almost all timber. Exports to Suriname in 2024 were mainly machinery, preserved fruit and "
            "vegetables, animal feed, drinks, fertiliser and flour. In 2022 Belgium reported much higher imports from Suriname "
            "(USD 182.5 million); such jumps usually come from a few large cargoes of raw materials or precious metal."),
        "agreements": (
            "Voor België geldt de EPA tussen de EU en CARIFORUM: Surinaamse goederen gaan rechten- en quotavrij binnen met een "
            "EUR.1 of oorsprongsverklaring. Goederen die je in Antwerpen invoert, kunnen daarna vrij door de hele EU.",
            "Belgium falls under the EPA between the EU and CARIFORUM: Surinamese goods enter duty and quota free with an "
            "EUR.1 or origin declaration. Goods you import in Antwerp can then move freely throughout the EU."),
        "market_access": (
            "Dezelfde EU-eisen als in Nederland: voedselveiligheid, residuen, etiketten (in Vlaanderen in het Nederlands, in "
            "Wallonië in het Frans), fytosanitaire certificaten en de EU-regels voor hout en ontbossing. In België controleert "
            "het Federaal Agentschap voor de Veiligheid van de Voedselketen (FAVV) bij binnenkomst. Vlaanderen heeft een "
            "Surinaamse gemeenschap, maar die is veel kleiner dan in Nederland.",
            "The same EU requirements as in the Netherlands: food safety, residues, labels (in Dutch in Flanders, in French in "
            "Wallonia), phytosanitary certificates and the EU rules on timber and deforestation. In Belgium the Federal Agency "
            "for the Safety of the Food Chain (FASFC) checks on arrival. Flanders has a Surinamese community, but it is much "
            "smaller than in the Netherlands."),
        "logistics": (
            "Er zijn geen rechtstreekse vluchten naar België; reizigers gaan via Amsterdam. Containerlijnen tussen Noord-Europa "
            "en Paramaribo doen vaak zowel Rotterdam als Antwerpen aan; vraag je expediteur welke haven voor jouw route en "
            "eindklant het goedkoopst is.",
            "There are no direct flights to Belgium; travellers go via Amsterdam. Container services between Northern Europe "
            "and Paramaribo often call at both Rotterdam and Antwerp; ask your forwarder which port is cheapest for your route "
            "and end customer."),
        "diplomatic": (
            "Suriname heeft een ambassade in Brussel, die ook Suriname vertegenwoordigt bij de Europese Unie en de Organisatie "
            "van Afrikaanse, Caribische en Pacifische Staten. België heeft geen ambassade in Paramaribo. In maart 2022 tekenden "
            "beide landen een MoU over consulaire en migratiesamenwerking.",
            "Suriname has an embassy in Brussels, which also represents Suriname at the European Union and the Organisation "
            "of African, Caribbean and Pacific States. Belgium has no embassy in Paramaribo. In March 2022 the two countries "
            "signed an MoU on consular and migration cooperation."),
        "chambers": (
            "We hebben geen Surinaams-Belgische kamer van koophandel kunnen vinden. Voor contacten met Vlaamse bedrijven zijn "
            "Voka (het Vlaams netwerk van ondernemingen) en de Surinaamse ambassade in Brussel de eerste ingang.",
            "We could not find a Suriname-Belgium chamber of commerce. For contacts with Flemish companies, Voka (the Flemish "
            "business network) and the Surinamese embassy in Brussels are the first points of contact."),
        "opportunities": [
            ("Hout met legale herkomst en EUDR-bewijs voor Belgische importeurs.",
             "Legally sourced timber with EUDR evidence for Belgian importers."),
            ("Antwerpen als distributiepunt voor Surinaamse producten naar de rest van Europa.",
             "Antwerp as a distribution point for Surinamese products to the rest of Europe."),
            ("Contacten in Brussel met EU-programma's voor de Caribische regio, via de ambassade.",
             "Contacts in Brussels with EU programmes for the Caribbean, through the embassy."),
        ],
        "watch_out": [
            ("Zelfde EU-controles als in Nederland: een afgekeurde zending is duur.",
             "Same EU checks as in the Netherlands: a rejected shipment is expensive."),
            ("Kleine Surinaamse gemeenschap: de nichemarkt is kleiner dan in Nederland.",
             "Small Surinamese community: the niche market is smaller than in the Netherlands."),
        ],
        "guides": ["euexport", "export", "logistics"],
        "sources": [
            _COMTRADE,
            ("Europese Commissie, Access2Markets: EPA EU-CARIFORUM",
             "https://trade.ec.europa.eu/access-to-markets/nl/content/epa-caribbean-cariforum"),
            ("Key News Suriname: Suriname verbreedt samenwerking met België (maart 2022)",
             "https://keynews.sr/suriname-verbreed-samenwerking-met-belgie/2022"),
            _MISSIONS,
            _EMB,
        ],
    },
    # ------------------------------------------------------------------ UAE
    {
        "key": "uae",
        "name": ("de Verenigde Arabische Emiraten", "the United Arab Emirates"),
        "short": ("Verenigde Arabische Emiraten", "United Arab Emirates"),
        "flag": "\U0001F1E6\U0001F1EA",
        "region": "asia",
        "exp_musd": 651.2, "imp_musd": 50.3, "trade_year": 2023,
        "trade_src": ("cijfers van de VAE via UN Comtrade", "UAE figures via UN Comtrade"),
        "agree_short": ("Geen akkoord", "No agreement"),
        "agree_sub": ("handel draait om goud", "trade is about gold"),
        "intro": (
            "De Verenigde Arabische Emiraten zijn na Zwitserland de grootste koper van Surinaams goud. In 2023 importeerden de "
            "Emiraten voor USD 651 miljoen uit Suriname, en dat was vrijwel allemaal goud. Voor andere producten is de markt "
            "klein, maar Dubai is wel een handelsknooppunt voor inkoop.",
            "The United Arab Emirates is, after Switzerland, the largest buyer of Surinamese gold. In 2023 the Emirates "
            "imported USD 651 million from Suriname, almost all of it gold. For other products the market is small, but "
            "Dubai is a trading hub for sourcing."),
        "tldr": [
            ("Goud is 99,9% van de export: USD 650,6 miljoen van USD 651,2 miljoen in 2023 (meest recente cijfers van de VAE).",
             "Gold is 99.9% of exports: USD 650.6 million of USD 651.2 million in 2023 (latest UAE figures)."),
            ("Goudexport vraagt een vergunning en strenge controle op herkomst (anti-witwassen).",
             "Gold exports need a licence and strict checks on origin (anti-money laundering)."),
            ("De ambassadeur van de VAE voor Suriname zit in Brazilië; hij overhandigde zijn geloofsbrieven op 21 augustus 2026.",
             "The UAE ambassador to Suriname is based in Brazil; he presented his credentials on 21 August 2026."),
        ],
        "trade": (
            "Volgens de cijfers van de VAE (UN Comtrade) importeerden de Emiraten in 2023 voor USD 651,2 miljoen uit Suriname, "
            "waarvan USD 650,6 miljoen goud en edelmetaal; in 2022 was dat USD 618,0 miljoen. De VAE exporteerden in 2023 voor "
            "USD 50,3 miljoen naar Suriname. Cijfers over 2024 en 2025 had de VAE op 26 oktober 2026 nog niet in Comtrade "
            "gezet.\n\n"
            "Ter vergelijking: Zwitserland kocht in 2025 voor USD 1.221 miljoen aan goud uit Suriname. Samen nemen deze twee "
            "landen bijna alle Surinaamse goudexport af.",
            "According to UAE figures (UN Comtrade), the Emirates imported USD 651.2 million from Suriname in 2023, of which "
            "USD 650.6 million was gold and precious metal; in 2022 the figure was USD 618.0 million. The UAE exported USD 50.3 "
            "million to Suriname in 2023. As of 26 October 2026 the UAE had not yet published 2024 and 2025 figures in "
            "Comtrade.\n\n"
            "For comparison: Switzerland bought USD 1,221 million of gold from Suriname in 2025. Together these two countries "
            "take almost all of Suriname's gold exports."),
        "agreements": (
            "Suriname heeft geen handelsakkoord met de VAE. Goud is in de VAE belastingtechnisch een apart product; welke "
            "heffingen gelden, hangt af van het soort goud (ruw, gezuiverd, sieraden) en de koper. Laat dat door je koper of "
            "raffinaderij bevestigen.",
            "Suriname has no trade agreement with the UAE. Gold is a special category for tax purposes in the UAE; which "
            "charges apply depends on the type of gold (raw, refined, jewellery) and the buyer. Have your buyer or refinery "
            "confirm this."),
        "market_access": (
            "Wie goud uit Suriname wil exporteren, heeft een exportvergunning nodig en moet aan de Surinaamse regels voor "
            "goudaankoop en -export voldoen (zie de gids over goud). Raffinaderijen en handelaren in de VAE moeten volgens de "
            "regels van het Emiraatse ministerie van Economie de herkomst van goud controleren (due diligence volgens de "
            "OESO-richtlijnen). Reken op vragen over de mijn, de verkoper, kwik en betalingen.\n\n"
            "Voor inkoop is Dubai (Jebel Ali) een groot knooppunt voor elektronica, auto-onderdelen, bouwmaterialen en "
            "consumptiegoederen uit Azië en het Midden-Oosten.",
            "Anyone who wants to export gold from Suriname needs an export licence and must comply with the Surinamese rules "
            "on gold buying and export (see the gold guide). Under the rules of the UAE Ministry of Economy, refineries and "
            "traders in the UAE must check the origin of gold (due diligence in line with the OECD guidance). Expect questions "
            "about the mine, the seller, mercury and payments.\n\n"
            "For sourcing, Dubai (Jebel Ali) is a major hub for electronics, car parts, building materials and consumer goods "
            "from Asia and the Middle East."),
        "logistics": (
            "Er zijn geen rechtstreekse vluchten tussen Suriname en de VAE; verbindingen lopen via Amsterdam of andere "
            "Europese knooppunten. Goud gaat met gespecialiseerde, verzekerde transporteurs. Containers uit Jebel Ali komen met "
            "overslag naar Paramaribo.",
            "There are no direct flights between Suriname and the UAE; connections go via Amsterdam or other European hubs. "
            "Gold is shipped by specialised, insured carriers. Containers from Jebel Ali reach Paramaribo with transhipment."),
        "diplomatic": (
            "De VAE hebben geen ambassade in Paramaribo. Op 21 augustus 2026 overhandigde Sharif Essa Al Suwaidi, ambassadeur "
            "van de VAE in Brazilië, zijn geloofsbrieven als niet-residerend ambassadeur aan de president van Suriname. Suriname "
            "heeft voor zover wij weten geen ambassade in de VAE.",
            "The UAE has no embassy in Paramaribo. On 21 August 2026 Sharif Essa Al Suwaidi, the UAE ambassador to Brazil, "
            "presented his credentials as non-resident ambassador to the President of Suriname. As far as we know, Suriname "
            "has no embassy in the UAE."),
        "chambers": (
            "We hebben geen Surinaams-Emiraatse kamer van koophandel of business council kunnen bevestigen. In Dubai is de "
            "Dubai Chamber of Commerce de gebruikelijke ingang voor buitenlandse bedrijven.",
            "We could not confirm a Suriname-UAE chamber of commerce or business council. In Dubai, the Dubai Chamber of "
            "Commerce is the usual entry point for foreign companies."),
        "opportunities": [
            ("Goud verkopen via erkende kanalen met volledige herkomstpapieren.",
             "Selling gold through recognised channels with full origin documents."),
            ("Inkoop via Dubai van goederen die je anders via meerdere tussenhandelaren koopt.",
             "Sourcing through Dubai of goods you would otherwise buy through several middlemen."),
        ],
        "watch_out": [
            ("Goudhandel staat internationaal onder verscherpt toezicht op witwassen: houd je administratie sluitend.",
             "The gold trade is under close international anti-money laundering scrutiny: keep your records complete."),
            ("Contante betalingen en tussenpersonen zonder vergunning zijn een groot risico.",
             "Cash payments and unlicensed intermediaries are a major risk."),
        ],
        "guides": ["gold", "mining", "aml", "export"],
        "sources": [
            _COMTRADE,
            ("Ministerie van Buitenlandse Zaken VAE: ambassadeur overhandigt geloofsbrieven aan president van Suriname (21 augustus 2026)",
             "https://www.mofa.gov.ae/en/mediahub/news/2026/8/21/uae-suriname"),
            ("OESO: Due Diligence Guidance for Responsible Supply Chains of Minerals",
             "https://www.oecd.org/en/publications/oecd-due-diligence-guidance-for-responsible-supply-chains-of-minerals-from-conflict-affected-and-high-risk-areas_9789264252479-en.html"),
            _EMB,
        ],
    },
    # ------------------------------------------------------------------ India
    {
        "key": "india",
        "name": ("India", "India"),
        "short": ("India", "India"),
        "flag": "\U0001F1EE\U0001F1F3",
        "region": "asia",
        "exp_musd": 26.5, "imp_musd": 30.1, "trade_year": 2025,
        "trade_src": ("Indiase cijfers via UN Comtrade", "Indian figures via UN Comtrade"),
        "agree_short": ("Geen akkoord", "No agreement"),
        "agree_sub": ("normaal WTO-tarief van India", "India's normal WTO rate"),
        "intro": (
            "India en Suriname hebben sterke culturele banden, maar de handel is klein en vrijwel in evenwicht: in 2025 "
            "kocht India voor USD 26 miljoen uit Suriname, vooral hout, en leverde het voor USD 30 miljoen. In maart 2025 "
            "bezocht een Indiase ondernemersmissie Suriname.",
            "India and Suriname have strong cultural ties, but trade is small and roughly balanced: in 2025 India bought USD "
            "26 million from Suriname, mainly timber, and supplied USD 30 million. In March 2025 an Indian business mission "
            "visited Suriname."),
        "tldr": [
            ("Geen handelsakkoord: India's tarieven zijn hoog voor veel producten.",
             "No trade agreement: India's tariffs are high for many products."),
            ("Suriname levert vooral rondhout aan India; India levert elektronica, staal, machines en medicijnen.",
             "Suriname mainly supplies logs to India; India supplies electronics, steel, machinery and medicines."),
            ("India heeft sinds 1977 een ambassade in Paramaribo, Suriname een ambassade in New Delhi.",
             "India has had an embassy in Paramaribo since 1977, Suriname has an embassy in New Delhi."),
        ],
        "trade": (
            "Volgens de Indiase cijfers (UN Comtrade) kocht India in 2025 voor USD 26,5 miljoen uit Suriname: hout (USD 19,4 "
            "miljoen), ijzer en staal (USD 5,2 miljoen) en aluminium (USD 1,1 miljoen). India leverde voor USD 30,1 miljoen aan "
            "Suriname; in 2024 waren dat vooral elektrische apparatuur, artikelen van staal, machines en medicijnen.",
            "According to Indian figures (UN Comtrade), India bought USD 26.5 million from Suriname in 2025: timber (USD 19.4 "
            "million), iron and steel (USD 5.2 million) and aluminium (USD 1.1 million). India supplied USD 30.1 million to "
            "Suriname; in 2024 this was mainly electrical equipment, steel articles, machinery and medicines."),
        "agreements": (
            "Suriname heeft geen handelsakkoord met India. Surinaamse goederen betalen het normale Indiase tarief, dat voor "
            "veel landbouw- en voedingsproducten hoog is. Bij invoer uit India betaal je het gewone Surinaamse invoerrecht.",
            "Suriname has no trade agreement with India. Surinamese goods pay India's normal tariff, which is high for many "
            "farm and food products. Imports from India pay the normal Surinamese import duty."),
        "market_access": (
            "Rondhout naar India vraagt een fytosanitair certificaat en een behandeling tegen ongedierte volgens de Indiase "
            "quarantaineregels; laat de koper de actuele eisen bevestigen. Voor voedsel geldt registratie bij de Indiase "
            "voedselautoriteit (FSSAI) via de importeur. Voor inkoop is India sterk in generieke medicijnen, machines, "
            "textiel, IT-diensten en landbouwmachines.",
            "Logs to India need a phytosanitary certificate and a pest treatment under India's quarantine rules; have the "
            "buyer confirm the current requirements. Food requires registration with India's food authority (FSSAI) through "
            "the importer. For sourcing, India is strong in generic medicines, machinery, textiles, IT services and farm "
            "machinery."),
        "logistics": (
            "Er zijn geen rechtstreekse vluchten of lijndiensten. Reizigers gaan via Amsterdam of andere Europese knooppunten. "
            "Containers worden overgeslagen, vaak in Europa of het Caribisch gebied.",
            "There are no direct flights or liner services. Travellers go via Amsterdam or other European hubs. Containers "
            "are transhipped, often in Europe or the Caribbean."),
        "diplomatic": (
            "India heeft sinds 1977 een ambassade in Paramaribo. Suriname heeft een ambassade in New Delhi. De Indiase ambassade "
            "ondersteunt handelsmissies en informeert over Indiase opleidingsprogramma's.",
            "India has had an embassy in Paramaribo since 1977. Suriname has an embassy in New Delhi. The Indian embassy "
            "supports trade missions and provides information on Indian training programmes."),
        "chambers": (
            "Van 5 tot 12 maart 2025 bezocht een Indiase fact-finding missie van ondernemers Suriname, op zoek naar joint "
            "ventures in onder meer landbouw, zware machines, bankwezen, goudwinning, e-health, onderwijs, hout, farmacie, olie "
            "en gas, infrastructuur en voedselverwerking. Tijdens het bezoek tekende de associatie van kleine en middelgrote "
            "ondernemingen AKMOS een MoU met de World Association of Small and Medium Enterprises (WASME). Een Surinaams-Indiase "
            "kamer van koophandel hebben we niet kunnen bevestigen.",
            "From 5 to 12 March 2025 an Indian fact-finding business mission visited Suriname, looking for joint ventures in "
            "areas including agriculture, heavy machinery, banking, gold mining, e-health, education, timber, pharmaceuticals, "
            "oil and gas, infrastructure and food processing. During the visit the SME association AKMOS signed an MoU with "
            "the World Association of Small and Medium Enterprises (WASME). We could not confirm a Suriname-India chamber of "
            "commerce."),
        "diaspora_note": (
            "Een groot deel van de Surinamers heeft Indiase (Hindoestaanse) voorouders. Dat geeft netwerken en vertrouwen, "
            "maar de Indiase markt zelf is groot, competitief en prijsgevoelig.",
            "A large share of Surinamese have Indian (Hindustani) ancestry. That brings networks and trust, but the Indian "
            "market itself is large, competitive and price-sensitive."),
        "opportunities": [
            ("Generieke medicijnen, landbouwmachines en IT-diensten uit India inkopen.",
             "Sourcing generic medicines, farm machinery and IT services from India."),
            ("Joint ventures met Indiase bedrijven in voedselverwerking en houtverwerking in Suriname.",
             "Joint ventures with Indian companies in food and timber processing in Suriname."),
            ("Hout met legale herkomst, liefst bewerkt in plaats van rondhout.",
             "Legally sourced timber, preferably processed rather than logs."),
        ],
        "watch_out": [
            ("Hoge Indiase tarieven en strenge quarantaineregels: reken het voordeel per product door.",
             "High Indian tariffs and strict quarantine rules: work out the benefit per product."),
            ("Kwaliteitsverschillen tussen leveranciers zijn groot; vraag referenties en monsters.",
             "Quality differs widely between suppliers; ask for references and samples."),
        ],
        "guides": ["import", "supplier", "export", "diaspora"],
        "sources": [
            _COMTRADE,
            ("Key News Suriname: Indiase ondernemersmissie bezoekt Suriname (5 maart 2025)",
             "https://keynews.sr/indiase-ondernemersmissie-bezoekt-suriname-voor-zakenkansen"),
            ("Ambassade van India in Suriname", "https://www.indembassysuriname.gov.in/"),
            ("Ministerie van Buitenlandse Zaken India: bilaterale relatie India-Suriname",
             "https://www.mea.gov.in/Portal/ForeignRelation/Suriname_2024.pdf"),
            _MISSIONS,
            _EMB,
        ],
    },
]

BY_KEY = {c["key"]: c for c in COUNTRIES}

# Short notes for the hub: countries without their own page (name nl, name en, text nl, text en).
# build.py does not pass OTHER to templates, so the same text is written out in templates/pages/countries.html
# (section 'Andere landen'). Change both together.
OTHER = [
    ("Zwitserland", "Switzerland",
     "De grootste koper van Surinaams goud: in 2025 voor USD 1.221 miljoen (Zwitserse cijfers via UN Comtrade). Geen "
     "handelsakkoord; voor goud gelden strenge herkomstcontroles bij de raffinaderijen.",
     "The largest buyer of Surinamese gold: USD 1,221 million in 2025 (Swiss figures via UN Comtrade). No trade "
     "agreement; refineries apply strict origin checks to gold."),
    ("Dominicaanse Republiek", "Dominican Republic",
     "CARICOM heeft sinds 1998 een vrijhandelsakkoord met de Dominicaanse Republiek. In oktober 2023 tekenden de "
     "regeringen MoU's over landbouw, luchtvaart, sanitaire en fytosanitaire zaken en koolwaterstoffen. Van 31 mei tot 2 "
     "juni 2026 ging een Surinaamse handels- en investeringsmissie naar Santo Domingo, met bezoeken aan het exportagentschap "
     "ProDominicana en de raad voor vrije zones. Sky High vliegt tussen Paramaribo en Santo Domingo.",
     "CARICOM has had a free trade agreement with the Dominican Republic since 1998. In October 2023 the governments signed "
     "MoUs on agriculture, air services, sanitary and phytosanitary matters and hydrocarbons. From 31 May to 2 June 2026 a "
     "Surinamese trade and investment mission went to Santo Domingo, visiting the export agency ProDominicana and the free "
     "zone council. Sky High flies between Paramaribo and Santo Domingo."),
    ("Duitsland", "Germany",
     "Leverde in 2024 voor USD 51,8 miljoen aan Suriname, vooral machines en voertuigen. EU-regels en de EPA gelden.",
     "Supplied USD 51.8 million to Suriname in 2024, mainly machinery and vehicles. EU rules and the EPA apply."),
    ("Japan", "Japan",
     "Suriname importeerde in 2023 voor USD 60,7 miljoen uit Japan (Surinaamse cijfers). Japan heeft geen ambassade in "
     "Paramaribo; de ambassade in Port of Spain is bevoegd.",
     "Suriname imported USD 60.7 million from Japan in 2023 (Surinamese figures). Japan has no embassy in Paramaribo; its "
     "embassy in Port of Spain covers Suriname."),
    ("Indonesië", "Indonesia",
     "Ambassades over en weer en een handelsovereenkomst voor goederen voor beurzen en tentoonstellingen. De Javaans-Surinaamse "
     "gemeenschap geeft culturele banden; de handel zelf is klein.",
     "Embassies in both capitals and a trade agreement for goods for trade fairs and exhibitions. The Javanese-Surinamese "
     "community provides cultural ties; trade itself is small."),
    ("Cuba", "Cuba",
     "CARICOM-akkoord over handel en economische samenwerking (2000) en ambassades over en weer. Fly All Ways vliegt naar "
     "Havana, Camagüey en Santiago de Cuba.",
     "CARICOM agreement on trade and economic cooperation (2000) and embassies in both capitals. Fly All Ways flies to "
     "Havana, Camagüey and Santiago de Cuba."),
]
