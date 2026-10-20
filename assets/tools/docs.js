/* Price list / menu, gift vouchers, date calculator and business letters. */
(function () {
  var S = window.SBT, T = S.T, E = S.esc;

  // ---------------------------------------------------------------- price list / menu
  var pl = document.getElementById('pl');
  if (pl) {
    var f = pl.elements, logo = null;
    var EX = S.nl ? '# Broodjes\nBroodje kip ; 85 ; met sla en saus\nBroodje bakkeljauw ; 75\nBroodje pom ; 90\n# Warm eten\nNasi met kip ; 150\nBami met saoto ; 140\nRoti kip ; 175 ; met aardappel en kousenband\n# Drinken\nFrisdrank ; 35\nDawet ; 40\nWater ; 20'
      : '# Sandwiches\nChicken sandwich ; 85 ; with lettuce and sauce\nSaltfish sandwich ; 75\nPom sandwich ; 90\n# Hot meals\nFried rice with chicken ; 150\nNoodles with soup ; 140\nRoti chicken ; 175 ; with potato and long beans\n# Drinks\nSoft drink ; 35\nDawet ; 40\nWater ; 20';
    var saved = S.store.get('pl', null);
    if (saved) Object.keys(saved).forEach(function (k) { if (f[k]) f[k].value = saved[k]; });
    if (!f.items.value) f.items.value = EX;
    var render = function () {
      var cur = f.cur.value, c1 = f.c1.value, cats = [], cur_ = null;
      f.items.value.split('\n').forEach(function (ln) {
        ln = ln.trim(); if (!ln) return;
        if (ln[0] === '#') { cur_ = { name: ln.replace(/^#+\s*/, ''), items: [] }; cats.push(cur_); return; }
        var p = ln.split(';').map(function (x) { return x.trim(); });
        if (!cur_) { cur_ = { name: '', items: [] }; cats.push(cur_); }
        cur_.items.push({ n: p[0], p: p[1] || '', d: p[2] || '' });
      });
      var price = function (p) { var n = S.num(p); return p === '' ? '' : (n ? cur + ' ' + S.fmt(n, n % 1 ? 2 : 0) : E(p)); };
      var h = '<div style="text-align:center;margin-bottom:18px">' + (logo ? '<img src="' + logo + '" alt="" style="max-height:80px;margin:0 auto 8px;display:block">' : '') +
        '<div class="dh" style="font-size:2rem">' + E(f.title.value) + '</div><div style="letter-spacing:.2em;text-transform:uppercase;color:' + E(c1) + ';font-weight:700;font-size:.8rem;margin-top:4px">' + E(f.sub.value) + '</div></div>' +
        '<div style="column-count:' + (+f.cols.value) + ';column-gap:32px">';
      cats.forEach(function (c) {
        h += '<div style="break-inside:avoid;margin-bottom:16px">' + (c.name ? '<div style="font-family:var(--serif);font-size:1.25rem;font-weight:650;color:' + E(c1) + ';border-bottom:2px solid ' + E(c1) + ';padding-bottom:3px;margin-bottom:6px">' + E(c.name) + '</div>' : '');
        c.items.forEach(function (it) {
          h += '<div style="display:flex;gap:8px;align-items:baseline;padding:4px 0"><span style="font-weight:600">' + E(it.n) + '</span><span style="flex:1;border-bottom:1px dotted #b9bccb;transform:translateY(-4px)"></span><span style="font-weight:700;white-space:nowrap" class="tnum">' + price(it.p) + '</span></div>' +
            (it.d ? '<div style="color:#5b6078;font-size:.82rem;margin:-3px 0 3px">' + E(it.d) + '</div>' : '');
        });
        h += '</div>';
      });
      h += '</div>';
      var q = f.qrl.value.trim(), qhtml = '';
      if (q && window.SBQR) {
        var link = /^https?:|^www\./i.test(q) ? (/^www\./i.test(q) ? 'https://' + q : q) : S.waUrl('', q);
        try { qhtml = '<div style="width:92px;flex:none">' + SBQR.svg(SBQR.matrix(link, 'M'), '#16182f', '#ffffff', 2) + '</div>'; } catch (e) { qhtml = ''; }
      }
      h += '<div style="display:flex;gap:14px;align-items:center;justify-content:center;margin-top:18px;border-top:1px solid #eceaf2;padding-top:12px">' + qhtml + '<div class="pm" style="text-align:' + (qhtml ? 'left' : 'center') + '">' + E(f.foot.value) + '</div></div>';
      var out = document.getElementById('pl-out');
      out.innerHTML = h;
      var svg = out.querySelector('svg'); if (svg) { svg.style.width = '92px'; svg.style.height = '92px'; }
      var o = {}; ['title', 'sub', 'items', 'cols', 'c1', 'cur', 'qrl', 'foot'].forEach(function (k) { o[k] = f[k].value; }); S.store.set('pl', o);
    };
    pl.addEventListener('input', render); pl.addEventListener('change', render);
    document.getElementById('logo').addEventListener('change', function (e) { var file = e.target.files[0]; if (file) S.imageToDataUrl(file, 500, function (u) { logo = u; render(); }); });
    window.addEventListener('load', render);
    render();
  }

  // ---------------------------------------------------------------- gift vouchers
  var vo = document.getElementById('vo');
  if (vo) {
    var v = vo.elements, codes = [];
    var mk = function () {
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '', r = new Uint32Array(8);
      (window.crypto || window.msCrypto).getRandomValues(r);
      for (var i = 0; i < 8; i++) s += A[r[i] % A.length] + (i === 3 ? '-' : '');
      return s;
    };
    var newCodes = function () { codes = [mk(), mk(), mk(), mk()]; v.code.value = codes[0]; };
    v.exp.value = S.addDays(S.today(), 365);
    newCodes();
    var vr = function () {
      codes[0] = v.code.value || codes[0];
      var n = +v.n.value, c1 = E(v.c1.value), c2 = E(v.c2.value), h = '';
      for (var i = 0; i < n; i++) {
        h += '<div style="position:relative;background:' + c1 + ';color:#fff;border-radius:14px;padding:22px 24px;margin-bottom:12px;overflow:hidden;min-height:190px;break-inside:avoid">' +
          '<div style="position:absolute;right:-40px;top:-40px;width:170px;height:170px;border-radius:50%;background:' + c2 + ';opacity:.25"></div>' +
          '<div style="font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;opacity:.8">' + T('Cadeaubon', 'Gift voucher') + '</div>' +
          '<div style="font-family:var(--serif);font-size:1.5rem;font-weight:650;margin:2px 0 10px">' + E(v.biz.value) + '</div>' +
          '<div style="font-size:2.1rem;font-weight:800;color:' + c2 + ';line-height:1.1">' + E(v.val.value) + '</div>' +
          (v.to.value ? '<div style="margin-top:6px">' + T('Voor', 'For') + ': <b>' + E(v.to.value) + '</b></div>' : '') +
          '<div style="margin-top:6px;opacity:.9">' + E(v.msg.value) + '</div>' +
          '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:14px;font-size:.82rem"><span>' + T('Code', 'Code') + ': <b style="letter-spacing:.08em">' + E(codes[i]) + '</b></span><span>' + T('Geldig tot', 'Valid until') + ' ' + E(S.dateLong(v.exp.value)) + '</span></div>' +
          '<div style="font-size:.7rem;opacity:.7;margin-top:6px">' + E(v.small.value) + '</div></div>';
      }
      document.getElementById('vo-out').innerHTML = h;
    };
    vo.addEventListener('input', vr); vo.addEventListener('change', vr);
    document.getElementById('newcode').onclick = function () { newCodes(); vr(); };
    document.getElementById('vo-codes').onclick = function (e) { S.copy(codes.slice(0, +v.n.value).join('\n'), e.target); };
    vr();
  }

  // ---------------------------------------------------------------- date calculator
  var d1 = document.getElementById('dc1');
  if (d1) {
    var d2 = document.getElementById('dc2');
    d1.elements.d.value = S.today(); d2.elements.a.value = S.today(); d2.elements.b.value = S.today().slice(0, 4) + '-12-31';
    var long = function (s) { return new Date(s + 'T12:00:00').toLocaleDateString(S.nl ? 'nl-NL' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
    var r1 = function () {
      var s = d1.elements.d.value; if (!s) return;
      var n = Math.round(S.num(d1.elements.n.value)) * +d1.elements.op.value, u = d1.elements.u.value, res;
      if (u === 'd') res = S.addDays(s, n);
      else if (u === 'k') res = S.addDays(s, n * 7);
      else if (u === 'm') { var d = new Date(s + 'T12:00:00'), day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); res = S.iso(d); }
      else { res = s; var k = Math.abs(n), step = n < 0 ? -1 : 1, guard = 0; while (k > 0 && guard++ < 5000) { res = S.addDays(res, step); if (S.isWorkday(res)) k--; } }
      document.getElementById('dc1-out').innerHTML = '<div class="sub">' + T('Uitkomst', 'Result') + '</div><div class="big" style="font-size:1.5rem">' + E(long(res)) + '</div>' +
        (S.isWorkday(res) ? '' : '<div class="sub" style="margin-top:6px">' + T('Let op: dit is geen werkdag.', 'Note: this is not a working day.') + '</div>');
    };
    var r2 = function () {
      var a = d2.elements.a.value, b = d2.elements.b.value; if (!a || !b) return;
      if (b < a) { var t = a; a = b; b = t; }
      var days = Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5), wd = 0, cur = a, g = 0;
      while (cur < b && g++ < 40000) { cur = S.addDays(cur, 1); if (S.isWorkday(cur)) wd++; }
      var A = new Date(a + 'T12:00:00'), B = new Date(b + 'T12:00:00'), months = (B.getFullYear() - A.getFullYear()) * 12 + B.getMonth() - A.getMonth() - (B.getDate() < A.getDate() ? 1 : 0);
      document.getElementById('dc2-out').innerHTML = '<div class="sub">' + T('Verschil', 'Difference') + '</div><div class="big tnum">' + days + ' ' + T('dagen', 'days') + '</div><table>' +
        '<tr><td>' + T('Werkdagen', 'Working days') + '</td><td class="r">' + wd + '</td></tr><tr><td>' + T('Weken', 'Weeks') + '</td><td class="r">' + S.fmt(days / 7, 1) + '</td></tr><tr><td>' + T('Volle maanden', 'Full months') + '</td><td class="r">' + months + '</td></tr></table>';
    };
    d1.addEventListener('input', r1); d1.addEventListener('change', r1); d2.addEventListener('input', r2); d2.addEventListener('change', r2);
    r1(); r2();
  }

  // ---------------------------------------------------------------- business letter
  var lt = document.getElementById('lt');
  if (lt) {
    var L = lt.elements, biz = S.store.get('biz', {}), edited = false;
    ['s_name', 's_addr', 's_phone', 's_email', 'color'].forEach(function (k) { if (biz[k]) L[k].value = biz[k]; });
    var ls = S.store.get('letter', {});
    ['sig', 'fn', 'place'].forEach(function (k) { if (ls[k]) L[k].value = ls[k]; });
    L.date.value = S.today();
    var TPL = S.nl ? {
      free: ['', ''],
      rfq: ['Aanvraag offerte', 'Graag ontvangen wij van u een offerte voor de levering van:\n\n- [product of dienst, aantal]\n- [product of dienst, aantal]\n\nWij ontvangen de offerte graag uiterlijk [datum], met prijzen exclusief en inclusief BTW, de levertijd en de betalingsvoorwaarden.\n\nVoor vragen kunt u ons bereiken op het nummer hierboven.'],
      cancel: ['Opzegging overeenkomst', 'Hierbij zeggen wij de overeenkomst voor [omschrijving, contract- of klantnummer] op, met inachtneming van de opzegtermijn van [termijn].\n\nWij verzoeken u de overeenkomst te beëindigen per [datum] en ons de beëindiging schriftelijk te bevestigen.\n\nEventuele openstaande bedragen of borg vernemen wij graag van u.'],
      complaint: ['Klacht over [onderwerp]', 'Op [datum] hebben wij bij u [product of dienst] afgenomen (factuur/order [nummer]). Tot onze spijt moeten wij u melden dat [omschrijving van het probleem].\n\nWij verzoeken u dit binnen [aantal] werkdagen op te lossen door [herstel, vervanging of terugbetaling].\n\nWij vertrouwen op een spoedige oplossing en zien uw reactie graag tegemoet.'],
      confirm: ['Bevestiging afspraak', 'Hierbij bevestigen wij de afspraken die wij op [datum] met u hebben gemaakt:\n\n- [afspraak 1]\n- [afspraak 2]\n- Prijs: [bedrag], te betalen [termijn]\n- Levering of uitvoering: [datum]\n\nKloppen deze afspraken niet, laat het ons dan binnen 5 werkdagen weten.'],
      ref: ['Werkgeversverklaring', 'Hierbij verklaren wij dat [naam], geboren op [datum], sinds [datum] bij ons in dienst is als [functie], voor [aantal] uur per week.\n\nHet bruto maandsalaris bedraagt [bedrag]. Het dienstverband is voor [onbepaalde tijd / bepaalde tijd tot datum].\n\nDeze verklaring is afgegeven op verzoek van betrokkene, ten behoeve van [doel].'],
      price: ['Aanpassing van onze prijzen', 'Door gestegen inkoop- en transportkosten passen wij per [datum] onze prijzen aan. De nieuwe prijzen vindt u in de bijlage.\n\nBestellingen die vóór deze datum zijn geplaatst, leveren wij nog tegen de oude prijs.\n\nWij danken u voor uw begrip en blijven u graag van dienst.']
    } : {
      free: ['', ''],
      rfq: ['Request for quotation', 'We would like to receive your quotation for the supply of:\n\n- [product or service, quantity]\n- [product or service, quantity]\n\nPlease send the quotation by [date], with prices excluding and including VAT, delivery time and payment terms.\n\nYou can reach us on the number above with any questions.'],
      cancel: ['Notice of cancellation', 'We hereby give notice to cancel the agreement for [description, contract or customer number], observing the notice period of [period].\n\nPlease terminate the agreement as of [date] and confirm the termination in writing.\n\nPlease let us know of any outstanding amounts or deposit.'],
      complaint: ['Complaint about [subject]', 'On [date] we purchased [product or service] from you (invoice/order [number]). We regret to inform you that [description of the problem].\n\nWe ask you to resolve this within [number] working days by [repair, replacement or refund].\n\nWe trust you will resolve this promptly and look forward to your reply.'],
      confirm: ['Confirmation of agreement', 'We hereby confirm the agreements made with you on [date]:\n\n- [agreement 1]\n- [agreement 2]\n- Price: [amount], payable [terms]\n- Delivery or execution: [date]\n\nIf these agreements are not correct, please let us know within 5 working days.'],
      ref: ['Employment reference', 'We hereby declare that [name], born on [date], has been employed by us since [date] as [job title], for [number] hours a week.\n\nThe gross monthly salary is [amount]. The employment is [permanent / fixed-term until date].\n\nThis statement is issued at the request of the employee, for [purpose].'],
      price: ['Change in our prices', 'Due to higher purchasing and transport costs we are adjusting our prices as of [date]. The new prices are attached.\n\nOrders placed before this date will still be delivered at the old price.\n\nThank you for your understanding; we look forward to continuing to serve you.']
    };
    var applyTpl = function () { var t = TPL[L.tpl.value]; if (t && L.tpl.value !== 'free') { L.subj.value = t[0]; L.body.value = t[1]; } };
    L.tpl.addEventListener('change', function () { applyTpl(); render(); });
    var render = function () {
      var c = L.color.value || '#1f2251', v = function (k) { return E(L[k].value.trim()); };
      var h = '<div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:3px solid ' + E(c) + ';padding-bottom:12px;margin-bottom:28px">' +
        '<div>' + (biz.logo ? '<img src="' + biz.logo + '" alt="" style="max-height:60px;display:block;margin-bottom:6px">' : '') + '<div style="font-family:var(--serif);font-size:1.4rem;font-weight:650;color:' + E(c) + '">' + (v('s_name') || T('Je bedrijfsnaam', 'Your business name')) + '</div></div>' +
        '<div class="pm" style="text-align:right">' + [v('s_addr'), v('s_phone'), v('s_email')].filter(Boolean).join('<br>') + '</div></div>' +
        '<div style="white-space:pre-wrap;margin-bottom:24px">' + v('to') + '</div>' +
        '<div style="margin-bottom:6px">' + v('place') + (v('place') ? ', ' : '') + E(S.dateLong(L.date.value)) + '</div>' +
        (v('ref') ? '<div class="pm" style="margin-bottom:6px">' + T('Kenmerk', 'Reference') + ': ' + v('ref') + '</div>' : '') +
        '<div style="font-weight:700;margin:14px 0 18px">' + T('Betreft', 'Subject') + ': ' + v('subj') + '</div>' +
        '<div>' + T('Geachte heer, mevrouw,', 'Dear Sir or Madam,') + '</div><div style="white-space:pre-wrap;margin:12px 0 22px">' + v('body') + '</div>' +
        '<div>' + T('Met vriendelijke groet,', 'Kind regards,') + '</div><div style="height:56px"></div><div style="font-weight:700">' + v('sig') + '</div><div class="pm">' + v('fn') + (v('fn') && v('s_name') ? ', ' : '') + v('s_name') + '</div>';
      document.getElementById('lt-out').innerHTML = h;
      S.store.set('letter', { sig: L.sig.value, fn: L.fn.value, place: L.place.value });
    };
    lt.addEventListener('input', render);
    render();
  }
})();
