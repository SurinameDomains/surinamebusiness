/* Oil and gas tools: supplier readiness check (#sr) and EOI letter (#eo). Own code, no dependencies.
   Answers and drafts stay on the visitor's device (sbt:oilready, sbt:eoi); signed-in visitors also keep them in their account. */
(function () {
  var S = window.SBT, T = S.T, E = S.esc;

  // ---------------------------------------------------------------- supplier readiness check
  var sr = document.getElementById('sr');
  if (sr) {
    var LK = window.SBL || {};
    // [id, critical, question nl, question en, action nl, action en, link key]
    var Q = [
      ['reg', 'Bedrijf en registratie', 'Company and registration', [
        ['a1', 1, 'Je bedrijf staat ingeschreven bij de KKF en je hebt een recent uittreksel (niet ouder dan zes maanden).', 'Your business is registered with the KKF and you have a recent extract (no older than six months).', 'Vraag een recent KKF-uittreksel op; operators vragen het bij elke EOI.', 'Get a recent KKF extract; operators ask for it with every EOI.', 'start'],
        ['a2', 1, 'Je belastingen en premies zijn betaald en je hebt geen achterstanden.', 'Your taxes and contributions are paid and you have no arrears.', 'Los belastingachterstanden op en houd de bewijzen van betaling bij de hand.', 'Clear any tax arrears and keep proof of payment at hand.', 'biztax'],
        ['a3', 0, 'Je bent BTW-geregistreerd (verplicht boven SRD 1 miljoen omzet).', 'You are VAT-registered (required above SRD 1 million turnover).', 'Registreer voor BTW als je boven de drempel zit; grote klanten verwachten BTW-facturen.', 'Register for VAT if you are above the threshold; large clients expect VAT invoices.', 'vatguide'],
        ['a4', 1, 'Je staat in het Suriname Supplier Registration Portal (SSRP) met een profiel dat 100% compleet is.', 'You are in the Suriname Supplier Registration Portal (SSRP) with a 100% complete profile.', 'Registreer gratis in het SSRP en vul je profiel volledig in, met documenten en precies omschreven diensten.', 'Register free in the SSRP and complete your profile, with documents and precisely described services.', 'supplier'],
        ['a5', 0, 'Je staat in SAP Ariba (nodig om aan Staatsolie zelf te leveren).', 'You are registered in SAP Ariba (needed to supply Staatsolie itself).', 'Registreer in Ariba als je aan Staatsolie wilt leveren.', 'Register in Ariba if you want to supply Staatsolie.', 'supplier']
      ]],
      ['hse', 'Veiligheid, gezondheid en milieu (HSSE)', 'Health, safety, security and environment (HSSE)', [
        ['b1', 1, 'Je hebt een schriftelijk HSSE-beleid, getekend door de directie.', 'You have a written HSSE policy, signed by management.', 'Schrijf een HSSE-beleid van één tot twee pagina\'s en laat de directie tekenen.', 'Write a one to two page HSSE policy and have management sign it.', 'safety'],
        ['b2', 1, 'Je maakt voor elke klus een risico-inventarisatie (bijvoorbeeld een taakrisicoanalyse).', 'You do a risk assessment for every job (for example a job safety analysis).', 'Voer een vaste risicoanalyse per klus in en bewaar de formulieren.', 'Introduce a standard risk assessment per job and keep the forms.', 'safety'],
        ['b3', 1, 'Je registreert ongevallen en bijna-ongevallen en kunt je veiligheidscijfers laten zien.', 'You record incidents and near misses and can show your safety figures.', 'Begin een register van ongevallen en bijna-ongevallen; operators vragen je cijfers in de EOI.', 'Start a register of incidents and near misses; operators ask for your figures in the EOI.', 'safety'],
        ['b4', 1, 'Je medewerkers zijn getraind en gecertificeerd voor hun taken (zoals EHBO, werken op hoogte, BOSIET voor offshore).', 'Your staff are trained and certified for their tasks (such as first aid, working at height, BOSIET for offshore).', 'Maak een opleidingsmatrix per medewerker en plan de ontbrekende certificaten.', 'Make a training matrix per employee and schedule the missing certificates.', 'oiljobs'],
        ['b5', 0, 'Je verstrekt persoonlijke beschermingsmiddelen en controleert het gebruik.', 'You provide personal protective equipment and check that it is used.', 'Leg vast welke beschermingsmiddelen per taak nodig zijn en wie ze controleert.', 'Record which protective equipment each task needs and who checks it.', 'safety'],
        ['b6', 0, 'Je hebt een noodplan en oefent het.', 'You have an emergency plan and practise it.', 'Schrijf een noodplan (brand, letsel, evacuatie) en houd minstens één oefening per jaar.', 'Write an emergency plan (fire, injury, evacuation) and hold at least one drill a year.', 'safety'],
        ['b7', 0, 'Je hebt regels voor veilig rijden en vervoer (snelheid, rusttijden, gordels, telefoon).', 'You have rules for safe driving and transport (speed, rest, seat belts, phones).', 'Stel rijregels op; vervoer is een van de grootste risico\'s die operators controleren.', 'Set driving rules; transport is one of the biggest risks operators check.', 'safety']
      ]],
      ['qa', 'Kwaliteit', 'Quality', [
        ['c1', 0, 'Je werkt met vaste, schriftelijke werkprocedures en controles.', 'You work with fixed, written procedures and checks.', 'Leg je belangrijkste werkprocessen vast in korte procedures met een controlepunt.', 'Write down your main work processes as short procedures with a checkpoint.', 'standards'],
        ['c2', 0, 'Je registreert klachten en afwijkingen en lost ze aantoonbaar op.', 'You record complaints and non-conformities and show how you fix them.', 'Houd een klachten- en afwijkingenlijst bij met de oplossing per punt.', 'Keep a complaints and non-conformity log with the fix for each item.', 'standards'],
        ['c3', 0, 'Je bent ISO-gecertificeerd (zoals ISO 9001, 14001, 45001 of 22000) of bent ermee bezig.', 'You are ISO certified (such as ISO 9001, 14001, 45001 or 22000) or working towards it.', 'Kijk welke norm in jouw EOI\'s gevraagd wordt en start een traject.', 'Check which standard your EOIs ask for and start the process.', 'standards'],
        ['c4', 0, 'Je gereedschap en meetapparatuur worden gekalibreerd en dat is vastgelegd.', 'Your tools and measuring equipment are calibrated and this is recorded.', 'Maak een lijst van keurings- en kalibratiedata per apparaat.', 'Make a list of inspection and calibration dates per item.', 'standards']
      ]],
      ['fin', 'Financiën en administratie', 'Finance and administration', [
        ['d1', 1, 'Je boekhouding is bij en je hebt een jaarrekening (met accountantsverklaring als die gevraagd wordt).', 'Your books are up to date and you have annual accounts (audited where required).', 'Laat je administratie bijwerken en een jaarrekening opstellen.', 'Bring your books up to date and have annual accounts prepared.', 'bookkeeping'],
        ['d2', 0, 'Je kunt minstens 60 dagen werk voorfinancieren (betaling volgt vaak 30 tot 60 dagen na factuur).', 'You can pre-finance at least 60 days of work (payment often follows 30 to 60 days after invoice).', 'Regel een kredietlijn of werkkapitaal voordat je een contract tekent.', 'Arrange a credit line or working capital before you sign a contract.', 'finance'],
        ['d3', 0, 'Je hebt de nodige verzekeringen (aansprakelijkheid, ongevallen, materieel).', 'You have the necessary insurance (liability, accident, equipment).', 'Vraag je verzekeraar welke dekking bij olie- en gasopdrachten past.', 'Ask your insurer which cover suits oil and gas assignments.', 'insurance'],
        ['d4', 0, 'Je facturen voldoen aan de eisen en vermelden het inkoopordernummer (PO) van de klant.', 'Your invoices meet the requirements and show the client\'s purchase order (PO) number.', 'Zet het PO-nummer op elke factuur; zonder PO wordt vaak niet betaald.', 'Put the PO number on every invoice; without a PO invoices are often not paid.', 'invoice']
      ]],
      ['pol', 'Beleid en naleving', 'Policies and compliance', [
        ['e1', 0, 'Je hebt een gedragscode met regels tegen omkoping en belangenverstrengeling.', 'You have a code of conduct with rules against bribery and conflicts of interest.', 'Schrijf een korte gedragscode en laat medewerkers tekenen.', 'Write a short code of conduct and have staff sign it.', 'civilcode'],
        ['e2', 1, 'Je personeel heeft schriftelijke contracten, je betaalt volgens de wet en draagt pensioen en ziektekosten af.', 'Your staff have written contracts, you pay according to the law and you pay pension and health contributions.', 'Zorg voor schriftelijke contracten en controleer APF, FVO en zorgverzekering.', 'Put written contracts in place and check pension, FVO and health insurance.', 'employer'],
        ['e3', 0, 'Je weet of de anti-witwasregels (WMTF) op je bedrijf van toepassing zijn en handelt ernaar.', 'You know whether the anti-money laundering rules (WMTF) apply to your business and act on it.', 'Ga na of je onder de WMTF valt en regel cliëntenonderzoek en meldingen.', 'Check whether you fall under the WMTF and set up client checks and reporting.', 'aml'],
        ['e4', 0, 'Je controleert je eigen onderaannemers op veiligheid en betrouwbaarheid.', 'You check your own subcontractors for safety and reliability.', 'Stel minimumeisen voor onderaannemers op en leg je controle vast.', 'Set minimum requirements for subcontractors and record your checks.', 'supplier']
      ]],
      ['cyb', 'Cyberveiligheid', 'Cybersecurity', [
        ['f1', 0, 'E-mail en belangrijke accounts zijn beveiligd met tweestapsverificatie.', 'Email and key accounts are protected with two-step verification.', 'Zet tweestapsverificatie aan op e-mail, bank en cloudaccounts.', 'Turn on two-step verification for email, banking and cloud accounts.', ''],
        ['f2', 0, 'Je maakt back-ups, test ze en gaat zorgvuldig om met gegevens van klanten.', 'You make backups, test them and handle client data carefully.', 'Regel automatische back-ups en spreek af wie toegang heeft tot klantgegevens.', 'Set up automatic backups and agree who can access client data.', ''],
        ['f3', 0, 'Je medewerkers herkennen phishing en weten wat ze moeten melden.', 'Your staff recognise phishing and know what to report.', 'Geef een korte uitleg over phishing en een vast meldpunt.', 'Give a short briefing on phishing and a fixed reporting point.', '']
      ]],
      ['tec', 'Technische capaciteit', 'Technical capability', [
        ['g1', 1, 'Je hebt een duidelijke lijst van diensten met de mensen en het materieel die je ervoor hebt.', 'You have a clear list of services with the people and equipment you have for them.', 'Kies de diensten waarin je sterk bent en noem per dienst je capaciteit; "alles" overtuigt niet.', 'Choose the services you are strong in and state your capacity for each; "everything" does not convince.', 'supplier'],
        ['g2', 1, 'Je hebt minstens drie referenties van vergelijkbaar werk uit de laatste drie jaar, met contactpersoon.', 'You have at least three references from comparable work in the last three years, with a contact person.', 'Verzamel referenties met klant, jaar, omvang en contactpersoon.', 'Collect references with client, year, size and contact person.', 'eoiletter'],
        ['g3', 0, 'Je hebt een actueel bedrijfsprofiel van twee tot vier pagina\'s.', 'You have a current company profile of two to four pages.', 'Maak een kort bedrijfsprofiel: KKF-nummer, eigenaren, medewerkers, kernactiviteiten, contactpersoon.', 'Make a short company profile: KKF number, owners, staff, core activities, contact person.', 'businesscard']
      ]],
      ['lc', 'Local content en ESG', 'Local content and ESG', [
        ['h1', 1, 'Je kunt aantonen dat je bedrijf Surinaams is: eigendom, bestuur en waar de waarde ontstaat.', 'You can show your business is Surinamese: ownership, management and where the value is added.', 'Leg eigendom, bestuur en lokale activiteiten vast; de Local Content-wet komt eraan.', 'Document ownership, management and local activities; the Local Content law is coming.', 'supplier'],
        ['h2', 0, 'Je weet welk deel van je personeel Surinaams is en je hebt een opleidingsplan.', 'You know what share of your staff is Surinamese and you have a training plan.', 'Houd het aandeel Surinaams personeel bij en maak een opleidingsplan.', 'Track the share of Surinamese staff and make a training plan.', 'training'],
        ['h3', 0, 'Je verwerkt afval volgens de regels en hebt de vergunningen die je activiteit vraagt.', 'You handle waste by the rules and hold the permits your activity requires.', 'Ga na welke milieuvergunningen je nodig hebt en hoe je afval wordt afgevoerd.', 'Check which environmental permits you need and how your waste is removed.', 'environment'],
        ['h4', 0, 'Je hebt een eenvoudig duurzaamheidsbeleid (milieu, mensen, bestuur).', 'You have a simple sustainability policy (environment, people, governance).', 'Schrijf een duurzaamheidsbeleid van één pagina; grote kopers sturen vragenlijsten.', 'Write a one-page sustainability policy; large buyers send questionnaires.', 'sustainability']
      ]]
    ];
    var OPT = [['y', T('Ja', 'Yes'), 2], ['p', T('Deels', 'Partly'), 1], ['n', T('Nee', 'No'), 0], ['x', T('N.v.t.', 'N/A'), null]];
    var ans = S.store.get('oilready', {}) || {};
    var h = '';
    Q.forEach(function (g) {
      h += '<section class="sr-group"><h3>' + E(T(g[1], g[2])) + '</h3>';
      g[3].forEach(function (q) {
        h += '<fieldset class="srq"><legend>' + E(T(q[2], q[3])) + '</legend><div class="opts">';
        OPT.forEach(function (o) {
          h += '<label><input type="radio" name="' + q[0] + '" value="' + o[0] + '"' + (ans[q[0]] === o[0] ? ' checked' : '') + '>' + E(o[1]) + '</label>';
        });
        h += '</div></fieldset>';
      });
      h += '</section>';
    });
    document.getElementById('sr-q').innerHTML = h;

    var render = function () {
      var tot = 0, max = 0, done = 0, all = 0, acts = [], rows = '';
      Q.forEach(function (g) {
        var gs = 0, gm = 0;
        g[3].forEach(function (q) {
          all++;
          var a = ans[q[0]];
          if (!a) return;
          done++;
          if (a === 'x') return;
          var v = a === 'y' ? 2 : (a === 'p' ? 1 : 0);
          gs += v; gm += 2;
          if (v < 2) acts.push({ crit: q[1] && v === 0, half: v === 1, t: T(q[4], q[5]), k: q[6] });
        });
        tot += gs; max += gm;
        var pct = gm ? Math.round(gs / gm * 100) : null;
        rows += '<li><span>' + E(T(g[1], g[2])) + '</span><b class="r tnum">' + (pct === null ? '-' : pct + '%') + '</b><span class="tr"><i' + (pct !== null && pct < 50 ? ' class="lo"' : '') + ' style="width:' + (pct || 0) + '%"></i></span></li>';
      });
      var score = max ? Math.round(tot / max * 100) : 0;
      var level = !done ? T('Begin met de vragen links.', 'Start with the questions on the left.') :
        score >= 80 ? T('Klaar om op EOI\'s te reageren. Werk de laatste punten af.', 'Ready to respond to EOIs. Finish the last points.') :
        score >= 50 ? T('Op weg. Regel eerst de punten in rood, dan de rest.', 'On the way. Fix the points in red first, then the rest.') :
        T('Nog niet klaar. Begin met registratie, HSSE en je administratie.', 'Not ready yet. Start with registration, HSSE and your books.');
      acts.sort(function (a, b) { return (b.crit - a.crit) || (a.half - b.half); });
      var out = '<div class="dh" style="font-size:1.3rem">' + T('Leverancier-check olie en gas', 'Oil and gas supplier check') + '</div>' +
        '<div class="sub" style="margin:2px 0 14px">' + E(S.dateLong(S.today())) + ' &middot; ' + done + ' / ' + all + ' ' + T('vragen beantwoord', 'questions answered') + '</div>' +
        '<div class="big tnum" style="font-size:2.4rem;line-height:1">' + (done ? score + '%' : '-') + '</div><p style="margin:6px 0 12px">' + E(level) + '</p>' +
        '<ul class="sr-bars">' + rows + '</ul>';
      if (acts.length) {
        out += '<h3 style="font-size:1.05rem;margin:18px 0 4px">' + T('Actielijst', 'Action list') + '</h3><ol class="sr-acts">' +
          acts.map(function (a) {
            return '<li>' + (a.crit ? '<span class="crit">' + T('Eerst: ', 'First: ') + '</span>' : '') + E(a.t) +
              (a.k && LK[a.k] ? ' <a href="' + E(LK[a.k]) + '">' + T('Hoe', 'How') + ' &rarr;</a>' : '') + '</li>';
          }).join('') + '</ol>';
      }
      out += '<p class="pm" style="margin-top:16px">' + T('Een hulpmiddel om prioriteiten te stellen, geen officiële beoordeling. Elke EOI noemt zelf de eisen.', 'A tool for setting priorities, not an official assessment. Each EOI states its own requirements.') + '</p>';
      document.getElementById('sr-out').innerHTML = out;
    };
    sr.addEventListener('change', function (e) {
      if (e.target && e.target.type === 'radio') { ans[e.target.name] = e.target.value; S.store.set('oilready', ans); render(); }
    });
    document.getElementById('sr-reset').addEventListener('click', function () {
      ans = {}; S.store.del('oilready');
      S.$$('input[type=radio]', sr).forEach(function (r) { r.checked = false; });
      render();
    });
    render();
  }

  // ---------------------------------------------------------------- EOI letter
  var eo = document.getElementById('eo');
  if (eo) {
    var F = eo.elements, biz = S.store.get('biz', {}) || {};
    var KEYS = ['s_name', 's_addr', 's_phone', 's_email', 'kkf', 'ssrp', 'color', 'since', 'staff', 'core', 'lang', 'to', 'job', 'title', 'scope',
      'r1c', 'r1y', 'r1d', 'r2c', 'r2y', 'r2d', 'r3c', 'r3y', 'r3d', 'res', 'hse', 'cert', 'own', 'loc', 'sig', 'fn', 'att'];
    var saved = S.store.get('eoi', null);
    if (saved) KEYS.forEach(function (k) { if (saved[k] != null && F[k]) F[k].value = saved[k]; });
    ['s_name', 's_addr', 's_phone', 's_email', 'color'].forEach(function (k) { if (!F[k].value && biz[k]) F[k].value = biz[k]; });
    if (!F.color.value) F.color.value = '#1f2251';
    F.date.value = S.today();
    var lastLang = F.lang.value;
    var ATT = {
      en: 'Company profile\nKKF registration extract\nCertificates (as listed above)\nHSE policy\nReference letters',
      nl: 'Bedrijfsprofiel\nUittreksel KKF\nCertificaten (zoals hierboven genoemd)\nHSE-beleid\nReferentiebrieven'
    };
    if (!F.att.value) F.att.value = ATT[F.lang.value];
    var MONTHS = {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
    };
    var dl = function (iso, lg) { if (!iso) return ''; var p = iso.split('-'); return (+p[2]) + ' ' + MONTHS[lg][+p[1] - 1] + ' ' + p[0]; };
    var plain = '';
    var render = function () {
      var lg = F.lang.value === 'nl' ? 'nl' : 'en', W = function (a, b) { return lg === 'nl' ? b : a; };
      var v = function (k) { return (F[k].value || '').trim(); };
      var c = v('color') || '#1f2251', name = v('s_name') || W('Your company', 'Uw bedrijf');
      var job = v('job'), title = v('title');
      var subj = W('Expression of Interest', 'Expression of Interest') + (job ? ' ' + W('for job', 'voor job') + ' ' + job : '') + (title ? ': ' + title : '');
      var refs = [1, 2, 3].map(function (i) { return [v('r' + i + 'c'), v('r' + i + 'y'), v('r' + i + 'd')]; }).filter(function (r) { return r[0] || r[2]; });
      var P = [];
      P.push(W('With this letter ' + name + ' expresses its interest in ' + (title ? '"' + title + '"' : 'the above request') + (job ? ' (job number ' + job + ')' : '') + ' and asks to be considered for the shortlist.',
        'Met deze brief toont ' + name + ' belangstelling voor ' + (title ? '"' + title + '"' : 'de bovengenoemde uitvraag') + (job ? ' (jobnummer ' + job + ')' : '') + ' en vraagt in aanmerking te komen voor de shortlist.'));
      var intro = name + W(' is a Surinamese company', ' is een Surinaams bedrijf') +
        (v('since') ? W(', in business since ' + v('since'), ', actief sinds ' + v('since')) : '') +
        (v('staff') ? W(', with ' + v('staff') + ' employees', ', met ' + v('staff') + ' medewerkers') : '') +
        (v('kkf') ? W(', registered with the Chamber of Commerce and Industry (KKF) under number ' + v('kkf'), ', ingeschreven bij de Kamer van Koophandel en Fabrieken (KKF) onder nummer ' + v('kkf')) : '') + '.' +
        (v('core') ? ' ' + W('Our core activities: ', 'Onze kernactiviteiten: ') + v('core').replace(/\.$/, '') + '.' : '') +
        (v('ssrp') ? ' ' + W('Our supplier ID is ' + v('ssrp') + '.', 'Ons leveranciersnummer is ' + v('ssrp') + '.') : '');
      P.push(intro);
      if (v('scope')) P.push(W('Within the scope of this request we offer: ', 'Binnen de scope van deze uitvraag bieden wij: ') + v('scope'));
      var html = '', txt = [];
      var para = function (s) { html += '<p style="margin:0 0 12px;white-space:pre-wrap">' + E(s) + '</p>'; txt.push(s); };
      var head = function (s) { html += '<div style="font-weight:700;margin:16px 0 6px;color:' + E(c) + '">' + E(s) + '</div>'; txt.push('', s.toUpperCase()); };
      P.forEach(para);
      if (refs.length) {
        head(W('Comparable assignments', 'Vergelijkbare opdrachten'));
        html += '<ol style="margin:0 0 12px;padding-left:1.2em">';
        refs.forEach(function (r, i) {
          var line = [r[0], r[1]].filter(Boolean).join(', ') + (r[2] ? ': ' + r[2] : '');
          html += '<li>' + E(line) + '</li>'; txt.push((i + 1) + '. ' + line);
        });
        html += '</ol>';
      }
      if (v('res')) { head(W('People and equipment', 'Mensen en materieel')); para(v('res')); }
      if (v('hse') || v('cert')) {
        head(W('Health, safety and quality', 'Veiligheid, gezondheid en kwaliteit'));
        if (v('hse')) para(v('hse'));
        if (v('cert')) para(W('Certificates: ', 'Certificaten: ') + v('cert') + '.');
      }
      if (v('own') || v('loc')) {
        head(W('Local content', 'Local content'));
        para((v('own') ? W(v('own') + '% of the company is Surinamese-owned', 'Het bedrijf is voor ' + v('own') + '% in Surinaamse handen') : '') +
          (v('own') && v('loc') ? W(' and ', ' en ') : '') +
          (v('loc') ? W((v('own') ? '' : '') + v('loc') + '% of our staff are Surinamese', v('loc') + '% van ons personeel is Surinaams') : '') + '.');
      }
      para(W('We would welcome the opportunity to present our capabilities in more detail and to receive the Request for Proposal. Please contact us at the details above with any questions.',
        'Wij lichten onze mogelijkheden graag verder toe en ontvangen graag de Request for Proposal. Voor vragen zijn wij bereikbaar via de gegevens hierboven.'));
      var att = v('att').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      var top = '<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:3px solid ' + E(c) + ';padding-bottom:12px;margin-bottom:24px">' +
        '<div>' + (biz.logo ? '<img src="' + biz.logo + '" alt="" style="max-height:60px;display:block;margin-bottom:6px">' : '') + '<div style="font-size:1.4rem;font-weight:650;color:' + E(c) + '">' + E(name) + '</div></div>' +
        '<div class="pm" style="text-align:right">' + [v('s_addr'), v('s_phone'), v('s_email'), v('kkf') ? 'KKF ' + v('kkf') : ''].filter(Boolean).map(E).join('<br>') + '</div></div>' +
        '<div style="white-space:pre-wrap;margin-bottom:20px">' + E(v('to')) + '</div>' +
        '<div style="margin-bottom:6px">Paramaribo, ' + E(dl(F.date.value, lg)) + '</div>' +
        '<div style="font-weight:700;margin:14px 0 18px">' + W('Subject', 'Betreft') + ': ' + E(subj) + '</div>' +
        '<div style="margin-bottom:12px">' + W('Dear Sir or Madam,', 'Geachte heer, mevrouw,') + '</div>';
      var bottom = '<div style="margin-top:6px">' + W('Yours faithfully,', 'Met vriendelijke groet,') + '</div><div style="height:52px"></div><div style="font-weight:700">' + E(v('sig')) + '</div><div class="pm">' + E([v('fn'), name].filter(Boolean).join(', ')) + '</div>' +
        (att.length ? '<div style="margin-top:20px"><b>' + W('Attachments', 'Bijlagen') + '</b><ul style="margin:4px 0 0;padding-left:1.2em">' + att.map(function (a) { return '<li>' + E(a) + '</li>'; }).join('') + '</ul></div>' : '');
      document.getElementById('eo-out').innerHTML = top + html + bottom;
      plain = [W('Subject', 'Betreft') + ': ' + subj, '', W('Dear Sir or Madam,', 'Geachte heer, mevrouw,'), ''].concat(txt).concat(['', W('Yours faithfully,', 'Met vriendelijke groet,'), '', v('sig'), [v('fn'), name].filter(Boolean).join(', ')])
        .concat(att.length ? ['', W('Attachments', 'Bijlagen') + ':'].concat(att.map(function (a) { return '- ' + a; })) : []).join('\n');
      var o = {}; KEYS.forEach(function (k) { o[k] = F[k].value; }); S.store.set('eoi', o);
    };
    F.lang.addEventListener('change', function () {
      if (F.att.value.trim() === ATT[lastLang]) F.att.value = ATT[F.lang.value];
      lastLang = F.lang.value; render();
    });
    eo.addEventListener('input', render);
    document.getElementById('eo-copy').addEventListener('click', function (e) { S.copy(plain, e.currentTarget); });
    render();
  }
})();
