/* Invoice, quote, proforma, credit note, purchase order and delivery note.
   Business details and number series are kept on this device only. */
(function () {
  var S = window.SBT, T = S.T, f = document.getElementById('inv');
  if (!f) return;
  var doc = f.getAttribute('data-doc');
  var CFG = {
    invoice: { t: T('Factuur', 'Invoice'), pre: '', days: 14, due: T('Vervaldatum', 'Due date'), to: T('Factuur aan', 'Bill to'), bank: true },
    quote: { t: T('Offerte', 'Quote'), pre: 'OFF-', days: 30, due: T('Geldig tot', 'Valid until'), to: T('Offerte voor', 'Quote for') },
    proforma: { t: T('Proforma factuur', 'Proforma invoice'), pre: 'PRO-', days: 30, due: T('Geldig tot', 'Valid until'), to: T('Aan', 'To'), bank: true },
    creditnote: { t: T('Creditnota', 'Credit note'), pre: 'CN-', to: T('Aan', 'To'), credit: true, ref: T('Op factuur', 'For invoice') },
    purchaseorder: { t: T('Inkooporder', 'Purchase order'), pre: 'PO-', days: 14, due: T('Leverdatum', 'Delivery date'), to: T('Leverancier', 'Supplier'), ref: T('Referentie', 'Reference'), po: true },
    deliverynote: { t: T('Pakbon', 'Delivery note'), pre: 'PB-', to: T('Afleveren aan', 'Deliver to'), ref: T('Order / factuur', 'Order / invoice'), noprice: true }
  }[doc] || {};
  var tbody = document.getElementById('lines'), out = document.getElementById('doc');
  var E = f.elements, val = function (n) { return E[n] ? E[n].value : ''; };
  var BIZ = ['s_name', 's_addr', 's_phone', 's_email', 's_fin', 's_kkf', 's_bank', 'color'];
  var biz = S.store.get('biz', {}), logo = biz.logo || null;
  BIZ.forEach(function (n) { if (biz[n]) E[n].value = biz[n]; });
  var VATS = [['10', '10%'], ['5', '5%'], ['25', '25%'], ['0', '0%'], ['x', T('vrijgesteld', 'exempt')]];

  function nextNo() { return S.store.get('no:' + doc, null) || CFG.pre + new Date().getFullYear() + '-001'; }
  function bump(no) {
    var m = String(no).match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return no + '-2';
    var d = String(parseInt(m[2], 10) + 1);
    while (d.length < m[2].length) d = '0' + d;
    return m[1] + d + m[3];
  }
  function addLine(l) {
    l = l || { d: '', q: 1, p: '', v: '10' };
    var tr = document.createElement('tr');
    tr.innerHTML = '<td class="c-desc"><input name="ld" aria-label="' + T('Omschrijving', 'Description') + '" placeholder="' + T('Omschrijving', 'Description') + '"></td>' +
      '<td class="c-qty"><span class="mini">' + T('Aantal', 'Qty') + '</span><input name="lq" inputmode="decimal" aria-label="' + T('Aantal', 'Quantity') + '"></td>' +
      (CFG.noprice ? '<td class="c-price"><span class="mini">' + T('Eenheid', 'Unit') + '</span><input name="lu" aria-label="' + T('Eenheid', 'Unit') + '" placeholder="' + T('stuks', 'pcs') + '"></td><td class="c-vat"></td>' :
        '<td class="c-price"><span class="mini">' + T('Prijs per stuk', 'Unit price') + '</span><input name="lp" inputmode="decimal" aria-label="' + T('Prijs', 'Price') + '" placeholder="0,00"></td>' +
        '<td class="c-vat"><span class="mini">' + T('BTW', 'VAT') + '</span><select name="lv" aria-label="' + T('BTW', 'VAT') + '">' + VATS.map(function (v) { return '<option value="' + v[0] + '">' + v[1] + '</option>'; }).join('') + '</select></td>') +
      '<td class="c-tot r tnum"></td>' +
      '<td class="c-x"><button type="button" class="x" aria-label="' + T('Regel verwijderen', 'Remove line') + '">&times;</button></td>';
    tr.querySelector('[name=ld]').value = l.d || ''; tr.querySelector('[name=lq]').value = l.q;
    if (CFG.noprice) tr.querySelector('[name=lu]').value = l.u || '';
    else { tr.querySelector('[name=lp]').value = l.p || ''; tr.querySelector('[name=lv]').value = l.v || '10'; }
    tr.querySelector('.x').onclick = function () { tr.remove(); if (!tbody.children.length) addLine(); render(); };
    tbody.appendChild(tr);
  }
  function lines() {
    return S.$$('tr', tbody).map(function (tr) {
      var g = function (n) { var el = tr.querySelector('[name=' + n + ']'); return el ? el.value : ''; };
      return { d: g('ld'), q: g('lq'), p: g('lp'), v: g('lv') || '10', u: g('lu'), tr: tr };
    });
  }

  // fill: carry-over from another document, else defaults
  var carry = S.store.get('carry', null);
  E.date.value = S.today();
  if (E.due) E.due.value = S.addDays(S.today(), CFG.days || 14);
  E.no.value = nextNo();
  if (carry && carry.to === doc) {
    ['c_name', 'c_addr', 'c_fin', 'cur', 'pricemode', 'ref'].forEach(function (n) { if (carry[n] && E[n]) E[n].value = carry[n]; });
    (carry.lines || []).forEach(addLine);
    S.store.del('carry');
  }
  if (!tbody.children.length) addLine();

  function calc() {
    var incl = val('pricemode') === 'incl', per = {}, sub = 0, vat = 0;
    var rows = lines().map(function (l) {
      var q = S.num(l.q), p = S.num(l.p), rate = l.v === 'x' ? 0 : S.num(l.v) / 100;
      var gross = q * p, ex = incl ? gross / (1 + rate) : gross, v = ex * rate;
      sub += ex; vat += v;
      per[l.v] = per[l.v] || { ex: 0, v: 0 };
      per[l.v].ex += ex; per[l.v].v += v;
      return { l: l, q: q, p: p, ex: ex, v: v, line: incl ? gross : ex };
    });
    return { rows: rows, per: per, sub: sub, vat: vat, total: sub + vat, incl: incl };
  }
  function saveBiz() {
    var o = { logo: logo };
    BIZ.forEach(function (n) { o[n] = E[n].value; });
    S.store.set('biz', o);
  }

  function render() {
    var c = calc(), cur = val('cur') || 'SRD', Es = S.esc, sign = CFG.credit ? -1 : 1;
    var m = function (x) { return S.money(sign * x, cur); };
    var v = function (n) { return Es(val(n).trim()); };
    var sellerBits = [v('s_addr'), v('s_phone'), v('s_email')].filter(Boolean).join('<br>');
    var ids = [];
    if (v('s_fin')) ids.push(T('FIN/BTW', 'FIN/VAT') + ': ' + v('s_fin'));
    if (v('s_kkf')) ids.push('KKF: ' + v('s_kkf'));
    var h = '<div class="ph"><div>' + (logo ? '<img src="' + logo + '" alt="">' : '<h3>' + (v('s_name') || T('Je bedrijfsnaam', 'Your business name')) + '</h3>') +
      (logo && v('s_name') ? '<div style="font-weight:700;margin-top:6px">' + v('s_name') + '</div>' : '') +
      '<div class="pm" style="margin-top:4px">' + sellerBits + (ids.length ? '<br>' + ids.join(' &middot; ') : '') + '</div></div>' +
      '<div style="text-align:right"><h3>' + CFG.t + '</h3><div class="pm">' + T('Nummer', 'Number') + ': <b>' + v('no') + '</b><br>' +
      T('Datum', 'Date') + ': ' + Es(S.dateLong(val('date'))) +
      (E.due && val('due') ? '<br>' + CFG.due + ': ' + Es(S.dateLong(val('due'))) : '') +
      (CFG.ref && v('ref') ? '<br>' + CFG.ref + ': ' + v('ref') : '') + '</div></div></div>';
    var right = '<div></div>';
    if (CFG.bank && v('s_bank')) right = '<div><div class="lbl">' + T('Betalen aan', 'Pay to') + '</div>' + v('s_bank') + '</div>';
    if (CFG.po) right = '<div><div class="lbl">' + T('Afleveradres', 'Deliver to') + '</div>' + (v('ship') || v('s_addr') || '&nbsp;') + '</div>';
    h += '<div class="pp"><div><div class="lbl">' + CFG.to + '</div><b>' + (v('c_name') || '&nbsp;') + '</b><br>' + v('c_addr') +
      (v('c_fin') ? '<br>' + T('FIN/BTW', 'FIN/VAT') + ': ' + v('c_fin') : '') + '</div>' + right + '</div>';
    if (CFG.noprice) {
      h += '<table><thead><tr><th>' + T('Omschrijving', 'Description') + '</th><th class="r">' + T('Aantal', 'Qty') + '</th><th>' + T('Eenheid', 'Unit') + '</th><th class="r">' + T('Ontvangen', 'Received') + '</th></tr></thead><tbody>';
      c.rows.forEach(function (r) { if (r.l.d.trim()) h += '<tr><td>' + Es(r.l.d) + '</td><td class="r">' + S.fmt(r.q, r.q % 1 ? 2 : 0) + '</td><td>' + Es(r.l.u) + '</td><td class="r">&#9744;</td></tr>'; });
      h += '</tbody></table>';
    } else {
      h += '<table><thead><tr><th>' + T('Omschrijving', 'Description') + '</th><th class="r">' + T('Aantal', 'Qty') + '</th><th class="r">' + T('Prijs', 'Price') +
        '</th><th class="r">' + T('BTW', 'VAT') + '</th><th class="r">' + (c.incl ? T('Bedrag incl.', 'Amount incl.') : T('Bedrag', 'Amount')) + '</th></tr></thead><tbody>';
      c.rows.forEach(function (r) {
        if (!r.l.d.trim() && !r.p) return;
        h += '<tr><td>' + Es(r.l.d) + '</td><td class="r">' + S.fmt(r.q, r.q % 1 ? 2 : 0) + '</td><td class="r">' + S.fmt(r.p) + '</td><td class="r">' +
          (r.l.v === 'x' ? T('vrij', 'exempt') : r.l.v + '%') + '</td><td class="r">' + S.fmt(sign * r.line) + '</td></tr>';
      });
      h += '</tbody></table><table class="tots"><tbody><tr><td>' + T('Subtotaal excl. BTW', 'Subtotal excl. VAT') + '</td><td class="r">' + m(c.sub) + '</td></tr>';
      Object.keys(c.per).sort(function (a, b) { return (S.num(b) || -1) - (S.num(a) || -1); }).forEach(function (k) {
        var p = c.per[k];
        if (!p.ex) return;
        if (k === 'x') { h += '<tr><td>' + T('Vrijgesteld van BTW', 'VAT exempt') + '</td><td class="r">' + m(p.ex) + '</td></tr>'; return; }
        h += '<tr><td>' + T('BTW', 'VAT') + ' ' + k + '% ' + T('over', 'on') + ' ' + S.fmt(sign * p.ex) + '</td><td class="r">' + m(p.v) + '</td></tr>';
      });
      h += '<tr class="g"><td>' + (CFG.credit ? T('Te crediteren', 'Total credit') : T('Totaal', 'Total')) + '</td><td class="r">' + m(c.total) + '</td></tr></tbody></table>';
      if (E.words && E.words.checked && c.total > 0) h += '<div class="words">' + T('Zegge', 'In words') + ': ' + (CFG.credit ? T('min ', 'minus ') : '') + Es(S.words(c.total, cur)) + '</div>';
    }
    if (v('notes')) h += '<div class="pn">' + v('notes') + '</div>';
    if (CFG.noprice) h += '<div class="sigs"><div>' + T('Afgeleverd door', 'Delivered by') + '</div><div>' + T('Ontvangen in goede orde: naam, datum en handtekening', 'Received in good order: name, date and signature') + '</div></div>';
    if (CFG.po) h += '<div class="sigs"><div>' + T('Besteld door', 'Ordered by') + '</div><div>' + T('Akkoord leverancier', 'Accepted by supplier') + '</div></div>';
    var foot = [v('s_name'), ids.join(' · ')].filter(Boolean).join(' · ');
    if (foot) h += '<div class="pf">' + foot + '</div>';
    out.style.setProperty('--pc', val('color') || '#1f2251');
    out.innerHTML = h;
    c.rows.forEach(function (r) { r.l.tr.querySelector('.c-tot').textContent = CFG.noprice ? '' : S.fmt(sign * r.line); });
    saveBiz();
  }

  f.addEventListener('input', render);
  f.addEventListener('change', render);
  document.getElementById('add-line').onclick = function () { addLine(); render(); tbody.lastChild.querySelector('input').focus(); };
  document.getElementById('s_logo').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (file) S.imageToDataUrl(file, 400, function (url) { logo = url; render(); });
  });
  document.getElementById('logo-clear').onclick = function (e) { e.preventDefault(); logo = null; document.getElementById('s_logo').value = ''; render(); };
  document.getElementById('next').onclick = function () {
    S.store.set('no:' + doc, bump(E.no.value));
    E.no.value = S.store.get('no:' + doc);
    ['c_name', 'c_addr', 'c_fin', 'ref', 'ship'].forEach(function (n) { if (E[n]) E[n].value = ''; });
    tbody.innerHTML = ''; addLine();
    E.date.value = S.today();
    if (E.due) E.due.value = S.addDays(S.today(), CFG.days || 14);
    render();
    window.scrollTo({ top: f.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };
  // printing counts as issuing: the next document gets the next number
  window.addEventListener('afterprint', function () {
    var cur = E.no.value, st = S.store.get('no:' + doc, null);
    if (!st || st === cur) S.store.set('no:' + doc, bump(cur));
  });
  document.getElementById('wa').onclick = function () {
    var c = calc(), cur = val('cur') || 'SRD';
    var t = CFG.t + ' ' + E.no.value + (E.s_name.value ? ' ' + T('van', 'from') + ' ' + E.s_name.value : '') + '\n';
    c.rows.forEach(function (r) { if (r.l.d.trim() || r.p) t += '- ' + r.l.d + ' (' + S.fmt(r.q, r.q % 1 ? 2 : 0) + (CFG.noprice ? ' ' + r.l.u : ' x ' + S.fmt(r.p)) + ')\n'; });
    if (!CFG.noprice) t += (CFG.credit ? T('Te crediteren', 'Total credit') : T('Totaal', 'Total')) + ': ' + S.money(c.total, cur) + (c.vat ? ' (' + T('incl.', 'incl.') + ' ' + S.money(c.vat, cur) + ' ' + T('BTW', 'VAT') + ')' : '') + '\n';
    if (E.due && val('due')) t += CFG.due + ': ' + S.dateLong(val('due')) + '\n';
    if (CFG.bank && E.s_bank.value) t += T('Betalen aan', 'Pay to') + ': ' + E.s_bank.value + '\n';
    window.open(S.waUrl(t, ''), '_blank', 'noopener');
  };
  S.$$('[data-carry]').forEach(function (a) {
    a.addEventListener('click', function () {
      var to = /pakbon|delivery/.test(a.getAttribute('href')) ? 'deliverynote' : 'invoice';
      S.store.set('carry', { to: to, c_name: E.c_name.value, c_addr: E.c_addr.value, c_fin: E.c_fin.value,
        cur: val('cur'), pricemode: val('pricemode'), ref: to === 'deliverynote' ? E.no.value : '',
        lines: lines().map(function (l) { return { d: l.d, q: l.q, p: l.p, v: l.v, u: l.u }; }) });
    });
  });
  render();
})();
