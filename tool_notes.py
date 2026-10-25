"""Extra text for tool pages that had little more than the tool itself (25 Oct 2026).

Each entry: a topical heading, a short body (HTML, Dutch and English) with the practical things people ask about
in Suriname, and FAQ pairs that are added to the page's FAQ list (and its FAQPage schema).
Write like the rest of the site: plain sentences, "je", no stock phrases, no em dashes. Facts come from facts.py
where a figure is involved; keep anything that changes by law out of here.
"""
import facts

_V = facts.VAT
_VAT_STD = int(_V["standard"] * 100)
_VAT_LOW = int(_V["low"] * 100)
_VAT_LUX = int(_V["luxury"] * 100)
_MW = facts.MIN_WAGE["hour"]


def _nl_num(x):
    return f"{x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


NOTES = {
    "workdays": (
        ("Wat telt als werkdag in Suriname",
         "<p>De calculator telt maandag tot en met vrijdag en slaat de officiële vrije dagen over, zoals die op de pagina met "
         "feestdagen staan. Wijst de regering voor een jaar een extra vrije dag aan, dan nemen we die over zodra hij "
         "bekend is. Werk je ook op zaterdag, zoals veel winkels, vink dat dan aan.</p>"
         "<ul><li><b>Levertijden en offertes:</b> \"levering binnen 15 werkdagen\" is met feestdagen ertussen soms een week "
         "later dan je denkt.</li><li><b>Loonadministratie:</b> het aantal werkdagen in een maand bepaalt het loon van "
         "dag- en uurloners.</li><li><b>Wettelijke termijnen</b> tellen vaak in kalenderdagen, niet in werkdagen. Lees "
         "goed welke van de twee bedoeld is.</li></ul>"
         "<p>Islamitische en hindoeïstische feestdagen hangen van de maan af. Zolang de overheid de datum niet heeft "
         "bekendgemaakt, rekenen we met de verwachte datum.</p>"),
        ("What counts as a working day in Suriname",
         "<p>The calculator counts Monday to Friday and skips the official days off listed on the public holidays page. "
         "When the government adds an extra day off for a year, we add it as soon as it is announced. If you also work on "
         "Saturdays, as many shops do, tick the box.</p>"
         "<ul><li><b>Lead times and quotes:</b> \"delivery within 15 working days\" can end a week later than you expect "
         "when holidays fall in between.</li><li><b>Payroll:</b> the number of working days in a month sets the pay of "
         "day and hourly workers.</li><li><b>Legal time limits</b> often count calendar days, not working days. Check which "
         "one is meant.</li></ul>"
         "<p>Islamic and Hindu holidays follow the moon. Until the government announces the date, we use the expected "
         "date.</p>"),
        [(("Hoeveel werkdagen heeft een jaar in Suriname?",
           "Ongeveer 250: 260 of 261 weekdagen min de feestdagen die op een doordeweekse dag vallen. Vul 1 januari tot "
           "en met 31 december in voor het exacte aantal van dit jaar."),
          ("How many working days does a year have in Suriname?",
           "About 250: 260 or 261 weekdays minus the holidays that fall on a weekday. Enter 1 January to 31 December for "
           "this year's exact number."))]),

    "breakeven": (
        ("Zo lees je de uitkomst",
         "<p>Het break-evenpunt is de omzet waarbij je precies je vaste kosten terugverdient. Daaronder lijd je verlies, "
         "daarboven houd je over. De rekensom: vaste kosten gedeeld door de marge per stuk (verkoopprijs min variabele "
         "kosten per stuk).</p>"
         "<ul><li><b>Vaste kosten</b> zijn er ook als je niets verkoopt: huur, vaste lonen, abonnementen, aflossing, "
         "verzekering.</li><li><b>Variabele kosten</b> stijgen met elke verkoop: inkoop, verpakking, bezorging, "
         "commissie.</li><li>Reken met prijzen <b>zonder BTW</b>. De BTW die je int, draag je af aan de Belastingdienst; "
         "die is geen omzet.</li><li>Koop je in dollars, reken dan met de koers waartegen je echt inkoopt. Een koersstijging "
         "verlaagt je marge en schuift het break-evenpunt op.</li></ul>"),
        ("How to read the result",
         "<p>The break-even point is the turnover at which you earn back exactly your fixed costs. Below it you make a "
         "loss, above it you make money. The sum: fixed costs divided by the margin per unit (selling price minus variable "
         "cost per unit).</p>"
         "<ul><li><b>Fixed costs</b> exist even when you sell nothing: rent, fixed wages, subscriptions, loan repayments, "
         "insurance.</li><li><b>Variable costs</b> rise with every sale: purchasing, packaging, delivery, commission.</li>"
         "<li>Use prices <b>without VAT</b>. The VAT you charge goes to the tax office; it is not turnover.</li>"
         "<li>If you buy in dollars, use the rate you actually pay. A higher rate lowers your margin and moves the "
         "break-even point up.</li></ul>"),
        [(("Wat als mijn marge per stuk nul of negatief is?",
           "Dan haal je het break-evenpunt nooit, hoeveel je ook verkoopt. Verhoog de prijs, verlaag de inkoop of de "
           "variabele kosten, of stop met dat product."),
          ("What if my margin per unit is zero or negative?",
           "Then you never reach break-even, however much you sell. Raise the price, lower purchasing or variable costs, "
           "or drop that product."))]),

    "letter": (
        ("Een zakelijke brief die goed overkomt",
         "<p>Zet bovenaan je bedrijfsnaam, adres, telefoon en e-mail, en als je die hebt je KKF-nummer en FIN. Daaronder "
         "de naam en het adres van de ontvanger, de plaats en datum (\"Paramaribo, 25 oktober 2026\") en een korte regel "
         "\"Betreft\" die zegt waar de brief over gaat.</p>"
         "<ul><li>Begin met \"Geachte heer Pinas,\" of \"Geachte mevrouw Lie,\" als je de naam weet, anders \"Geachte heer, "
         "mevrouw,\".</li><li>Zet de vraag of het besluit in de eerste alinea, de uitleg daarna.</li><li>Sluit af met "
         "\"Met vriendelijke groet,\" en je naam en functie. Bij een overheidsinstantie onderteken je met de hand of met je "
         "handtekening als afbeelding.</li><li>Bewaar de brief als PDF. Dan blijft de opmaak gelijk, ook als de ontvanger "
         "hem op een telefoon opent.</li></ul>"),
        ("A business letter that comes across well",
         "<p>Put your business name, address, phone and email at the top, plus your KKF (Chamber of Commerce) number and "
         "tax number (FIN) if you have them. Below that the recipient's name and address, place and date (\"Paramaribo, "
         "25 October 2026\") and a short subject line.</p>"
         "<ul><li>Open with \"Dear Mr Pinas,\" or \"Dear Ms Lie,\" when you know the name, otherwise \"Dear Sir or Madam,\".</li>"
         "<li>State the request or decision in the first paragraph and the explanation after it.</li><li>Close with "
         "\"Kind regards,\" and your name and title. For a government office, sign by hand or add your signature as an "
         "image.</li><li>Save the letter as a PDF so the layout stays the same, also on a phone.</li></ul>"),
        [(("Moet een brief aan de overheid in het Nederlands?",
           "Nederlands is de officiële taal in Suriname en de gewone taal voor brieven aan ministeries, de Belastingdienst "
           "en de KKF. Engels wordt meestal ook gelezen, maar een Nederlandse brief gaat sneller door de molen."),
          ("Must a letter to the government be in Dutch?",
           "Dutch is Suriname's official language and the normal language for letters to ministries, the tax office and "
           "the KKF. English is usually read too, but a Dutch letter tends to move faster."))]),

    "amountwords": (
        ("Bedragen voluit schrijven zonder fouten",
         "<p>Op kwitanties, cheques en contracten zet je het bedrag in cijfers en in letters. Bij een verschil tussen de "
         "twee geldt bij een cheque het bedrag in letters, en ook bij andere stukken is dat de gewone uitleg. Een fout "
         "in de letters kost dus geld.</p>"
         "<ul><li>Nederlands schrijf je tot duizend aan elkaar: <i>driehonderdvijfenveertig</i>. Na duizend komt een "
         "spatie: <i>vierduizend driehonderdvijfenveertig</i>.</li><li>Centen schrijf je als \"en 50 cent\" of als "
         "breuk \"50/100\". Zet de munt erbij: Surinaamse dollar (SRD), US dollar of euro.</li><li>Trek een streep achter "
         "het bedrag in letters, zodat niemand er iets achter kan zetten.</li><li>In het Engels: <i>four thousand three "
         "hundred and forty-five</i>, met een koppelteken tussen tientallen en eenheden.</li></ul>"),
        ("Writing amounts out without mistakes",
         "<p>On receipts, cheques and contracts you write the amount in figures and in words. When the two differ, the "
         "words count on a cheque, and that is the usual reading for other documents too. A mistake in the words can "
         "cost money.</p>"
         "<ul><li>In English: <i>four thousand three hundred and forty-five</i>, with a hyphen between tens and units.</li>"
         "<li>Write cents as \"and 50 cents\" or as the fraction \"50/100\". Add the currency: Surinamese dollar (SRD), "
         "US dollar or euro.</li><li>Draw a line after the amount in words so nobody can add to it.</li><li>In Dutch, "
         "numbers up to a thousand are one word (<i>driehonderdvijfenveertig</i>); after duizend comes a space "
         "(<i>vierduizend driehonderdvijfenveertig</i>).</li></ul>"),
        [(("Wat geldt als cijfers en letters verschillen?",
           "Bij een cheque geldt het bedrag in letters. Bij andere stukken wordt meestal ook van de letters uitgegaan. "
           "Controleer daarom altijd beide voor je tekent."),
          ("Which counts when figures and words differ?",
           "On a cheque the amount in words counts. For other documents the words are usually taken as well. Always check "
           "both before you sign."))]),

    "walink": (
        ("Zo gebruik je je WhatsApp-link",
         "<p>Een WhatsApp-link heeft de vorm wa.me/597xxxxxxx: landcode 597 en je nummer, zonder plusteken of spaties. Wie "
         "erop tikt, krijgt meteen een gesprek met jou, met je voorbeeldbericht al ingevuld.</p>"
         "<ul><li><b>Instagram en Facebook:</b> zet de link in je bio of op je pagina, zodat klanten niet eerst je nummer "
         "hoeven over te typen.</li><li><b>Flyers, menukaart en toonbank:</b> print de QR-code. Mensen scannen hem met "
         "hun camera.</li><li><b>Voorbeeldbericht:</b> \"Hallo, ik wil graag bestellen\" of \"Ik heb een vraag over\" "
         "vertelt je meteen waar het over gaat.</li><li>Gebruik je WhatsApp Business, dan werkt de link hetzelfde. "
         "Zet daar ook je openingstijden en een automatisch antwoord buiten werktijd in.</li></ul>"),
        ("How to use your WhatsApp link",
         "<p>A WhatsApp link looks like wa.me/597xxxxxxx: country code 597 and your number, without "
         "plus sign or spaces. Anyone who taps it gets a chat with you, with your sample message already typed.</p>"
         "<ul><li><b>Instagram and Facebook:</b> put the link in your bio or page so customers do not have to type your "
         "number.</li><li><b>Flyers, menus and the counter:</b> print the QR code. People scan it with their camera.</li>"
         "<li><b>Sample message:</b> \"Hello, I would like to order\" or \"I have a question about\" tells you right "
         "away what it is about.</li><li>With WhatsApp Business the link works the same. Set your opening hours and an "
         "away message there too.</li></ul>"),
        [(("Werkt de link ook met een vast nummer?",
           "Alleen als dat nummer een WhatsApp-account heeft. Met WhatsApp Business kun je een vast nummer registreren; je "
           "krijgt de bevestigingscode dan via een gesprek."),
          ("Does the link work with a landline number?",
           "Only if that number has a WhatsApp account. WhatsApp Business can register a landline; the confirmation code "
           "then arrives by phone call."))]),

    "voucher": (
        ("Cadeaubonnen zonder gedoe bij het inleveren",
         "<p>Een cadeaubon is geld dat je al hebt ontvangen voor iets wat je later levert. Houd daarom een lijst bij met "
         "de code, het bedrag, de verkoopdatum en of de bon is ingeleverd.</p>"
         "<ul><li>Zet een <b>vervaldatum</b> op de bon en houd je eraan, ook in je administratie.</li><li>Een <b>unieke "
         "code</b> maakt namaak lastig: bij inleveren zoek je hem op en streep je hem af.</li><li>Zet op de bon of hij "
         "in delen te besteden is en of er geld terug wordt gegeven. Zo voorkom je discussie aan de kassa.</li>"
         "<li>Ben je BTW-plichtig, vraag dan je boekhouder wanneer je BTW afdraagt: bij verkoop van de bon of bij het "
         "inleveren. Dat hangt af van of al vaststaat wat de klant ervoor krijgt.</li></ul>"),
        ("Gift vouchers without trouble at redemption",
         "<p>A gift voucher is money you have already received for something you deliver later. Keep a list with the "
         "code, amount, sale date and whether it has been redeemed.</p>"
         "<ul><li>Put an <b>expiry date</b> on the voucher and stick to it, also in your books.</li><li>A <b>unique "
         "code</b> makes copies hard: look it up at redemption and cross it off.</li><li>State whether the voucher can "
         "be spent in parts and whether change is given. That avoids arguments at the till.</li><li>If you are VAT "
         "registered, ask your bookkeeper when the VAT is due: when the voucher is sold or when it is redeemed. That "
         "depends on whether it is already clear what the customer gets for it.</li></ul>"),
        []),

    "unitprice": (
        ("Slimmer inkopen voor je zaak en thuis",
         "<p>De grootste verpakking is niet altijd het goedkoopst per kilo. Aanbiedingen, andere merken en losse "
         "verkoop maken het verschil. Deze vergelijking rekent alles om naar dezelfde eenheid, zodat je eerlijk "
         "vergelijkt.</p>"
         "<ul><li>Let op de eenheid: gram en kilo, milliliter en liter, en per stuk. Een pak van 900 gram is geen kilo.</li>"
         "<li>Voor maximumprijzen van basisgoederen zoals rijst, bloem en olie publiceert het ministerie een lijst. Die "
         "staat op onze pagina met maximumprijzen.</li><li>Koop je in voor je winkel, reken dan ook met de "
         "houdbaarheid. Goedkoop per kilo is duur als een deel bederft.</li></ul>"),
        ("Buy smarter, for your business and at home",
         "<p>The biggest pack is not always the cheapest per kilo. Offers, other brands and loose sale make the "
         "difference. This comparison converts everything to the same unit so you compare fairly.</p>"
         "<ul><li>Watch the unit: grams and kilos, millilitres and litres, and per piece. A 900 gram pack is not a "
         "kilo.</li><li>The ministry publishes maximum prices for basic goods such as rice, flour and oil. They are on our "
         "maximum prices page.</li><li>Buying stock for your shop? Count shelf life too. Cheap per kilo is expensive "
         "when part of it spoils.</li></ul>"),
        []),

    "percentage": (
        ("Procenten die ondernemers vaak nodig hebben",
         f"<ul><li><b>BTW:</b> het algemene tarief is {_VAT_STD}%, het lage tarief {_VAT_LOW}% en het tarief voor "
         f"luxegoederen {_VAT_LUX}%. Voor BTW erbij of eraf is er een aparte BTW-calculator.</li>"
         "<li><b>Korting en marge zijn niet hetzelfde.</b> 25% opslag op de inkoopprijs geeft 20% marge op de "
         "verkoopprijs. Wie dat door elkaar haalt, verkoopt te goedkoop.</li><li><b>Prijsstijging:</b> ging een product "
         "van SRD 80 naar SRD 100, dan is dat 25% duurder. Gaat het daarna 25% omlaag, dan kost het SRD 75, niet "
         "SRD 80.</li><li><b>Koersverschil:</b> met de procentuele verandering zie je hoeveel de dollar of euro is "
         "gestegen sinds je laatste inkoop.</li></ul>"),
        ("Percentages businesses often need",
         f"<ul><li><b>VAT:</b> the standard rate is {_VAT_STD}%, the low rate {_VAT_LOW}% and the luxury goods rate "
         f"{_VAT_LUX}%. For adding or removing VAT there is a separate VAT calculator.</li>"
         "<li><b>Markup and margin are not the same.</b> A 25% markup on cost gives a 20% margin on the selling price. "
         "Mixing them up means selling too cheap.</li><li><b>Price increase:</b> a product that went from SRD 80 to "
         "SRD 100 became 25% more expensive. If it then drops 25%, it costs SRD 75, not SRD 80.</li><li><b>Exchange "
         "rate change:</b> the percentage change shows how much the dollar or euro has risen since your last "
         "purchase.</li></ul>"),
        [(("Wat is het verschil tussen opslag en marge?",
           "Opslag reken je over de inkoopprijs, marge over de verkoopprijs. Inkoop SRD 100 en verkoop SRD 125 is 25% "
           "opslag en 20% marge."),
          ("What is the difference between markup and margin?",
           "Markup is calculated on the cost price, margin on the selling price. Cost SRD 100 and price SRD 125 is a 25% "
           "markup and a 20% margin."))]),

    "stock": (
        ("Voorraad bijhouden zonder kassasysteem",
         "<p>Je hebt geen duur kassasysteem nodig om te weten wat er ligt. Zet elk artikel er één keer in met inkoop- en "
         "verkoopprijs, boek wat binnenkomt en wat de deur uitgaat, en zet een minimum per artikel. De bestellijst laat "
         "zien wat bijna op is.</p>"
         "<ul><li>Tel eens per maand alles na en corrigeer verschillen. Zo zie je diefstal, breuk en telfouten op tijd.</li>"
         "<li>De voorraadwaarde tegen inkoopprijs heb je nodig voor je jaarcijfers en de aangifte.</li><li>Geef artikelen "
         "een eigen code en print barcodes met de barcode-tool; dan scan je bij het tellen.</li><li>Je lijst blijft op dit "
         "toestel. Met een gratis account heb je hem ook op je telefoon en computer.</li></ul>"),
        ("Keeping stock without a till system",
         "<p>You do not need an expensive till system to know what you have. Enter each item once with cost and selling "
         "price, record what comes in and goes out, and set a minimum per item. The order list shows what is running "
         "low.</p>"
         "<ul><li>Count everything once a month and correct the differences. You spot theft, breakage and counting errors "
         "in time.</li><li>You need the stock value at cost for your annual figures and tax return.</li><li>Give items "
         "your own code and print barcodes with the barcode tool, so you can scan when counting.</li><li>Your list stays "
         "on this device. With a free account you also have it on your phone and computer.</li></ul>"),
        []),

    "tripcost": (
        ("Wat er in een eerlijk bezorgtarief zit",
         "<p>Brandstof is maar een deel van wat een rit kost. Voor een bezorgtarief of een ritprijs tel je ook slijtage, "
         "banden, onderhoud, verzekering en je eigen tijd mee.</p>"
         "<ul><li>Reken met wat je auto of brommer echt verbruikt in de stad, met files en korte ritten. Dat is meer dan "
         "het verbruik op de weg.</li><li>De brandstofprijs verandert elke week. Vul de prijs in die je aan de pomp "
         "betaalt.</li><li>Reken de terugrit mee als je leeg terugkomt.</li><li>Bezorg je naar Wanica, Commewijne of "
         "Para, werk dan met tarieven per zone in plaats van één vast bedrag.</li></ul>"),
        ("What goes into a fair delivery fee",
         "<p>Fuel is only part of what a trip costs. For a delivery fee or trip price, also count wear, tyres, "
         "maintenance, insurance and your own time.</p>"
         "<ul><li>Use what your car or scooter really uses in town, with traffic and short trips. That is more than the "
         "highway figure.</li><li>The fuel price changes every week. Enter the price you pay at the pump.</li><li>Count the "
         "return trip when you come back empty.</li><li>Delivering to Wanica, Commewijne or Para? Use prices per zone "
         "instead of one fixed amount.</li></ul>"),
        []),

    "signature": (
        ("Een handtekening die overal goed staat",
         "<p>Houd hem kort: naam, functie, bedrijf, één telefoonnummer, je website en eventueel een WhatsApp-link. Meer "
         "regels en grote afbeeldingen maken mails zwaar en komen bij sommige ontvangers als bijlage binnen.</p>"
         "<ul><li><b>Gmail:</b> Instellingen, Alle instellingen bekijken, Handtekening; plak en bewaar onderaan de "
         "pagina.</li><li><b>Outlook:</b> Instellingen, Account, Handtekeningen.</li><li><b>Telefoon:</b> de meeste "
         "mail-apps nemen alleen platte tekst. Gebruik daar de tekstversie.</li><li>Zet je logo niet groter dan "
         "ongeveer 200 pixels breed. Lange disclaimers kun je beter weglaten.</li></ul>"),
        ("A signature that looks right everywhere",
         "<p>Keep it short: name, title, company, one phone number, your website and maybe a WhatsApp link. More lines "
         "and large images make mails heavy and arrive as attachments for some recipients.</p>"
         "<ul><li><b>Gmail:</b> Settings, See all settings, Signature; paste and save at the bottom of the page.</li>"
         "<li><b>Outlook:</b> Settings, Account, Signatures.</li><li><b>Phone:</b> most mail apps take plain text only. "
         "Use the text version there.</li><li>Keep your logo at about 200 pixels wide or less. Long disclaimers are "
         "better left out.</li></ul>"),
        []),

    "imagetools": (
        ("De juiste maat voor elk doel",
         "<ul><li><b>WhatsApp en e-mail:</b> 1600 pixels breed is ruim genoeg om scherp te zijn op elke telefoon.</li>"
         "<li><b>Uploadformulieren</b> van de overheid, banken en vacaturesites hebben vaak een maximum, zoals 500 KB of "
         "1 MB. Vul dat maximum in, dan zoekt de tool de beste kwaliteit die erbinnen past.</li><li><b>Instagram:</b> "
         "vierkant 1:1 of staand 4:5 voor berichten, 9:16 voor stories en je status.</li><li><b>Facebook-omslag</b> en "
         "<b>websitebanners</b> zijn breed: kies 16:9 of breder.</li><li>Foto's van documenten worden het best "
         "leesbaar als JPEG met kwaliteit rond 80%. Voor logo's en schermafbeeldingen is PNG beter.</li></ul>"
         "<p>Je foto's blijven op je toestel. De tool werkt in je browser, ook met een trage verbinding.</p>"),
        ("The right size for every purpose",
         "<ul><li><b>WhatsApp and email:</b> 1600 pixels wide is plenty to look sharp on any phone.</li><li><b>Upload "
         "forms</b> of government offices, banks and job sites often have a limit such as 500 KB or 1 MB. Enter that "
         "limit and the tool finds the best quality that fits.</li><li><b>Instagram:</b> square 1:1 or portrait 4:5 for "
         "posts, 9:16 for stories and your status.</li><li><b>Facebook covers</b> and <b>website banners</b> are wide: "
         "choose 16:9 or wider.</li><li>Photos of documents read best as JPEG at about 80% quality. Logos and screenshots "
         "are better as PNG.</li></ul>"
         "<p>Your photos stay on your device. The tool works in your browser, also on a slow connection.</p>"),
        []),

    "cashcount": (
        ("Een kasopmaak die klopt",
         "<p>Tel aan het eind van de dag alles wat in de la ligt, haal het wisselgeld voor morgen eraf en vergelijk de "
         "rest met wat je kassa of bonnenboek aan contante verkoop laat zien. Het verschil is je kasverschil.</p>"
         "<ul><li>De biljetten in omloop zijn SRD 5, 10, 20, 50, 100, 200 en 500; de munten 1, 5, 10, 25, 100 en 250 "
         "cent.</li><li>Tel vreemde valuta apart en reken om tegen de koers die je de klant gaf, niet tegen de koers "
         "van vandaag.</li><li>Pin, Uni5Pay en andere digitale betalingen horen niet in de kasopmaak. Die zie je op je "
         "bankafschrift.</li><li>Schrijf elk verschil op, ook kleine. Een patroon van tekorten valt alleen op als je het "
         "bijhoudt.</li></ul>"),
        ("A cash count that adds up",
         "<p>At the end of the day count everything in the drawer, take out tomorrow's float and compare the rest with "
         "the cash sales on your till or receipt book. The difference is your cash variance.</p>"
         "<ul><li>Notes in circulation are SRD 5, 10, 20, 50, 100, 200 and 500; coins are 1, 5, 10, 25, 100 and 250 "
         "cents.</li><li>Count foreign currency separately and convert at the rate you gave the customer, not today's "
         "rate.</li><li>Card, Uni5Pay and other digital payments do not belong in the cash count. You see them on your "
         "bank statement.</li><li>Write down every difference, also small ones. A pattern of shortfalls only shows when "
         "you keep track.</li></ul>"),
        [(("Wat is een normaal kasverschil?",
           "Elke dag een paar SRD verschil door wisselgeld is normaal. Komt het tekort vaker voor of wordt het groter, "
           "laat dan bij elke dienst apart tellen en tekenen."),
          ("What is a normal cash variance?",
           "A few SRD a day from change is normal. If shortfalls keep coming or grow, have each shift count and sign "
           "separately."))]),

    "businesscard": (
        ("Wat op een goed visitekaartje staat",
         "<p>Naam, functie, bedrijf, één telefoonnummer en een e-mailadres of website. Meer past niet leesbaar op 85 bij "
         "55 millimeter. Een QR-code naar je WhatsApp of website vervangt een rij met social-media-namen.</p>"
         "<ul><li>Zet je telefoonnummer in de vorm +597 xxx xxxx, dan werkt het ook voor klanten in het buitenland.</li>"
         "<li>Bij de drukker: lever de PNG aan en vraag om 300 of 350 grams karton. Zelf printen kan op een vel A4 met "
         "10 kaartjes; snij met een liniaal en een scherp mes.</li><li>Kies een kleur die bij je logo past en houd de "
         "tekst donker op licht. Lichte tekst op een foto is na het drukken vaak niet te lezen.</li></ul>"),
        ("What a good business card shows",
         "<p>Name, title, company, one phone number and an email address or website. More does not fit legibly on 85 by "
         "55 millimetres. A QR code to your WhatsApp or website replaces a row of social media handles.</p>"
         "<ul><li>Write your phone number as +597 xxx xxxx so it also works for customers abroad.</li><li>At the printer: "
         "supply the PNG and ask for 300 or 350 gsm card. To print yourself, use the A4 sheet with 10 cards and cut with "
         "a ruler and a sharp knife.</li><li>Choose a colour that matches your logo and keep the text dark on light. Light "
         "text on a photo is often unreadable once printed.</li></ul>"),
        []),

    "datecalc": (
        ("Betaaltermijnen en deadlines berekenen",
         "<ul><li><b>Factuur met 30 dagen:</b> de termijn loopt vanaf de factuurdatum, tenzij je iets anders afspreekt. "
         "Zet de vervaldatum op de factuur zelf, dan is er geen discussie.</li><li><b>Werkdagen of kalenderdagen:</b> "
         "een offerte \"geldig 14 dagen\" bedoelt kalenderdagen. Levertijden spreek je beter af in werkdagen.</li>"
         "<li><b>Aanbestedingen:</b> een sluitingsdatum op een zaterdag of feestdag schuift niet vanzelf op. Lever een "
         "dag eerder in.</li><li><b>Belasting:</b> de vaste data voor BTW, loonbelasting en inkomstenbelasting staan op "
         "de pagina met belastingdeadlines.</li></ul>"),
        ("Working out payment terms and deadlines",
         "<ul><li><b>Invoice at 30 days:</b> the term runs from the invoice date unless agreed otherwise. Put the due date "
         "on the invoice itself to avoid discussion.</li><li><b>Working days or calendar days:</b> a quote \"valid for 14 "
         "days\" means calendar days. Lead times are better agreed in working days.</li><li><b>Tenders:</b> a closing date "
         "on a Saturday or holiday does not move by itself. Submit a day early.</li><li><b>Tax:</b> the fixed dates for "
         "VAT, wage tax and income tax are on the tax deadlines page.</li></ul>"),
        []),

    "pricelist": (
        ("Een prijslijst die verkoopt",
         "<ul><li>Zet de prijs rechts en lijn hem uit, zodat mensen snel kunnen vergelijken. Zonder \"SRD\" achter elk "
         "bedrag leest het rustiger; zet de munt één keer in de kop.</li><li>Groepeer per soort: ontbijt, lunch, "
         "dranken, of diensten per categorie.</li><li>Ben je BTW-plichtig, dan horen de prijzen voor gewone klanten "
         "inclusief BTW te zijn. Zet \"prijzen incl. BTW\" onderaan.</li><li>Deel de PDF in je WhatsApp-status en zet de "
         "QR-code op tafel of de toonbank. Pas je een prijs aan, maak dan een nieuwe PDF met de datum erop.</li></ul>"),
        ("A price list that sells",
         "<ul><li>Put the price on the right and align it so people can compare quickly. Leaving \"SRD\" off every amount "
         "reads calmer; put the currency once in the heading.</li><li>Group by kind: breakfast, lunch, drinks, or services "
         "by category.</li><li>If you are VAT registered, prices for ordinary customers should include VAT. Add \"prices "
         "incl. VAT\" at the bottom.</li><li>Share the PDF in your WhatsApp status and put the QR code on the table or "
         "counter. When a price changes, make a new PDF with the date on it.</li></ul>"),
        []),
}


def note(key, lang):
    n = NOTES.get(key)
    if not n:
        return None
    h, body = n[0] if lang == "nl" else n[1]
    return {"h": h, "body": body}


def faqs(key, lang):
    n = NOTES.get(key)
    if not n:
        return []
    return [q[0] if lang == "nl" else q[1] for q in n[2]]
