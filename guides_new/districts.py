"""Business by district: hub page (templates/pages/districts.html); detail pages use templates/district.html
with data from districts_data.py. Checked 26 Oct 2026."""

SLUGS = ("districten-suriname", "en/districts-of-suriname")

ENTRY = {
    "label": ("Ondernemen per district", "Business by district"),
    "meta": (("Ondernemen per district in Suriname: cijfers en kansen",
              "De 10 districten van Suriname voor ondernemers: inwoners, economie, verbindingen, kansen en wat je regelt bij "
              "de districtscommissaris, van Nickerie tot Albina."),
             ("Doing business by district in Suriname: figures and openings",
              "Suriname's 10 districts for business: population, economy, transport links, opportunities and what the "
              "district commissioner does, from Nickerie to Albina.")),
    "faq": [
        (("Hoeveel districten heeft Suriname?",
          "Tien: Paramaribo, Wanica, Nickerie, Coronie, Saramacca, Commewijne, Marowijne, Para, Brokopondo en Sipaliwini. "
          "Ze zijn verdeeld in 63 ressorten. Sipaliwini is het enige district zonder hoofdplaats."),
         ("How many districts does Suriname have?",
          "Ten: Paramaribo, Wanica, Nickerie, Coronie, Saramacca, Commewijne, Marowijne, Para, Brokopondo and Sipaliwini. "
          "They are divided into 63 ressorts. Sipaliwini is the only district without a capital.")),
        (("Wat regel je bij de districtscommissaris als ondernemer?",
          "Lokale vergunningen: voor eet- en drankgelegenheden, openbare vermakelijkheden zoals feesten, standplaatsen op de "
          "openbare weg en de Hinderwet. De districtscommissaris adviseert ook bij aanvragen voor staatsgrond."),
         ("What does the district commissioner handle for businesses?",
          "Local licences: for places serving food and drink, public entertainment such as parties, stalls on the public "
          "road and the Nuisance Act. The district commissioner also advises on applications for state land.")),
        (("Moet ik me in elk district apart bij de KKF inschrijven?",
          "Nee, inschrijving in het Handelsregister van de KKF is landelijk. Een lokale vergunning hoort wel bij een "
          "vestiging: voor een zaak in een ander district vraag je die aan bij de districtscommissaris van die plek."),
         ("Do I have to register with the KKF in each district?",
          "No, registration in the KKF trade register is national. A local licence belongs to a location, though: for a "
          "business in another district you apply to that district's commissioner.")),
        (("Hoeveel inwoners heeft Suriname per district?",
          "Volgens de census van 2012 (ABS) had Suriname 541.638 inwoners, van wie 240.924 in Paramaribo en 118.222 in "
          "Wanica. De uitkomsten van de negende volkstelling waren op 26 oktober 2026 nog niet gepubliceerd."),
         ("What is Suriname's population by district?",
          "According to the 2012 census (ABS) Suriname had 541,638 inhabitants, 240,924 of them in Paramaribo and 118,222 "
          "in Wanica. Results of the ninth census had not been published as of 26 October 2026.")),
        (("Welk district groeit het snelst?",
          "Tussen 2004 en 2012 groeide Wanica het hardst (+37,5%), gevolgd door Para (+31,7%) en Commewijne (+27,5%). "
          "Paramaribo kromp licht en Nickerie verloor 6,6% van zijn inwoners."),
         ("Which district is growing fastest?",
          "Between 2004 and 2012 Wanica grew fastest (+37.5%), followed by Para (+31.7%) and Commewijne (+27.5%). "
          "Paramaribo shrank slightly and Nickerie lost 6.6% of its population.")),
        (("Hoe kom je over land van Suriname naar Guyana of Frans-Guyana?",
          "Naar Guyana met de veerboot Canawaima van South Drain (Nickerie) naar Moleson Creek; een brug over de Corantijn "
          "is besproken maar nog niet overeengekomen. Naar Frans-Guyana met de veerpont van Albina naar Saint-Laurent-du-Maroni."),
         ("How do you cross by land from Suriname to Guyana or French Guiana?",
          "To Guyana by the Canawaima ferry from South Drain (Nickerie) to Moleson Creek; a bridge over the Corantijn has "
          "been discussed but not yet agreed. To French Guiana by the car ferry from Albina to Saint-Laurent-du-Maroni.")),
    ],
}
