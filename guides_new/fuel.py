"""Fuel prices page (data page in the trade section, registered in site_config.PAGES, not in KEYS).
Label, meta and FAQ only; the page is templates/pages/fuel.html and reads data/live/fuel.json."""

SLUGS = ("brandstofprijzen", "en/fuel-prices-suriname")

ENTRY = {
    "label": ("Brandstofprijzen vandaag", "Fuel prices today"),
    "meta": (("Brandstofprijzen Suriname vandaag: benzine en diesel per liter",
              "De pompprijs van benzine (unleaded) en diesel in SRD per liter, elke 30 minuten gecontroleerd. Met de price cap, de prijs zonder cap en een brandstofrekentool."),
             ("Fuel prices in Suriname today: petrol and diesel per litre",
              "The pump price of petrol (unleaded) and diesel in SRD per litre, checked every 30 minutes. With the price cap, the price without the cap and a fuel cost calculator.")),
    "faq": [
        (("Wat kost benzine in Suriname vandaag?",
          "Bovenaan deze pagina staat de pompprijs van GOw2 van vandaag, in SRD per liter, voor unleaded en diesel. We controleren de prijs elke 30 minuten. Andere maatschappijen kunnen iets afwijken."),
         ("What does petrol cost in Suriname today?",
          "The top of this page shows today's GOw2 pump price in SRD per litre for unleaded and diesel. We check it every 30 minutes. Other companies can differ slightly.")),
        (("Wat is de price cap op brandstof?",
          "Sinds 17 maart 2026 houdt de regering de pompprijzen onder het niveau dat bij de wereldmarktprijs hoort. Het verschil betaalt de staat via een overheidscomponent in de prijs. De president noemde de regeling in oktober 2026 niet houdbaar op lange termijn; een einddatum is niet bekend."),
         ("What is the fuel price cap?",
          "Since 17 March 2026 the government has kept pump prices below the level that matches the world market price. The state covers the difference through a government component in the price. In October 2026 the president said the arrangement cannot last in the long run; no end date has been announced.")),
        (("Hoeveel zou brandstof kosten zonder price cap?",
          "Op 13 oktober 2026 noemde president Simons de prijzen zonder cap: diesel SRD 69,00 tot 74,76 en unleaded SRD 58,99 tot 64,66 per liter, afhankelijk van de maatschappij. Dat is SRD 11 tot 21 per liter meer dan aan de pomp."),
         ("How much would fuel cost without the cap?",
          "On 13 October 2026 President Simons gave the prices without the cap: diesel SRD 69.00 to 74.76 and unleaded SRD 58.99 to 64.66 per litre, depending on the company. That is SRD 11 to 21 a litre more than at the pump.")),
        (("Hoeveel BTW zit er op brandstof?",
          "Brandstof valt onder het algemene BTW-tarief van 10%. Een BTW-geregistreerd bedrijf kan de BTW op zakelijk getankte brandstof aftrekken als het een correcte factuur heeft."),
         ("How much VAT is there on fuel?",
          "Fuel falls under the standard VAT rate of 10%. A VAT-registered business can deduct the VAT on fuel bought for the business if it holds a proper invoice.")),
        (("Waarom stijgt de pompprijs als de olieprijs stijgt?",
          "Brandstof wordt deels ingevoerd en deels door Staatsolie geraffineerd, maar wordt in dollars geprijsd. De pompprijs volgt dus de wereldprijs van geraffineerde producten, de dollarkoers en de overheidscomponent. Zolang de cap geldt, vangt de staat een deel van stijgingen op."),
         ("Why does the pump price rise when the oil price rises?",
          "Fuel is partly imported and partly refined by Staatsolie, but it is priced in dollars. The pump price therefore follows the world price of refined products, the dollar rate and the government component. While the cap applies, the state absorbs part of any increase.")),
        (("Hoe bereken ik de brandstofkosten van mijn bedrijf?",
          "Vul in de rekentool op deze pagina in hoeveel liter benzine en diesel je per maand tankt. Je ziet je kosten nu, en wat ze worden als de cap verdwijnt. Voor één rit gebruik je de ritkostentool."),
         ("How do I work out my business fuel costs?",
          "Enter in the calculator on this page how many litres of petrol and diesel you buy each month. You see your costs now and what they become if the cap ends. For a single trip, use the trip cost calculator.")),
    ],
}
