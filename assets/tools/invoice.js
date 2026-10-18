/* Invoice and quote generator. Business details are kept on this device only. */
(function () {
  var S = window.SBT, T = S.T, f = document.getElementById('inv');
  if (!f) return;
  var doc = f.getAttribute('data-doc'), isQ = doc === 'quote';
  var tbody = document.getElementById('lines'), out = document.getElementById('doc');
  var BIZ = ['s_name', 's_addr', 's_phone', 's_email', 's_fin', 's_kkf', 's_bank', 'color'];
  var biz = S.store.get('biz', {}), logo = biz.logo || null;
  BIZ.forEach(function (n) { if (biz[n]) f.elements[n].value = biz[n]; });
  var VATS = [['10', '10%'], ['5', '5%'], ['25', '25%'], ['0', '0%'], ['x', T('vrijgesteld', 'exempt')]];

  function year() { return new Date().getFullYear(); }
  function nextNo() {
    var n = S.store.get('no:' + doc, null);
    return n || (isQ ? 'OFF-' : '') + year() + '-001';
  }
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
      '<td class="c-price"><span class="mini">' + T('Prijs per stuk', 'Unit price') + '</span><input name="lp" inputmode="decimal" aria-label="' + T('Prijs', 'Price') + '" placeholder="0,00"></td>' +
      '<td class="c-vat"><span class="mini">' + T('BTW', 'VAT') + '</span><select name="lv" aria-label="' + T('BTW', 'VAT') + '">' + VATS.map(function (v) { return '<option value="' + v[0] + '">' + v[1] + '</option>'; }).join('') + '</select></td>' +
      '<td class="c-tot r tnum"></td>' +
      '<td class="c-x"><button type="button" class="x" aria-label="' + T('Regel verwijderen', 'Remove line') + '">&times;</button></td>';
    tr.querySelector('[name=ld]').value = l.d; tr.querySelector('[name=lq]').value = l.q;
    tr.querySelector('[name=lp]').value = l.p; tr.querySelector('[name=lv]').value = l.v;
    tr.querySelector('.x').onclick = function () { tr.remove(); if (!tbody.children.length) addLine(); render(); };
    tbody.appendChild(tr);
  }
  function lines() {
    return S.$$('tr', tbody).map(function (tr) {
      return { d: tr.querySelector('[name=ld]').value, q: tr.querySelector('[name=lq]').value,
        p: tr.querySelector('[name=lp]').value, v: tr.querySelector('[name=lv]').value, tr: tr };
    });
  }

  // fill: carry-over from a quote, else defaults
  var carry = !isQ ? S.store.get('carry', null) : null;
  f.elements.date.value = S.today();
  f.elements.due.value = S.addDays(S.today(), isQ ? 30 : 14);
  f.elements.no.value = nextNo();
  if (carry) {
    ['c_name', 'c_addr', 'c_fin', 'cur', 'pricemode'].forEach(function (n) { if (carry[n]) f.elements[n].value = carry[n]; });
    (carry.lines || []).forEach(addLine);
    S.store.del('carry');
  }
  if (!tbody.children.length) addLine();

  function calc() {
    var incl = f.elements.pricemode.value === 'incl', per = {}, sub = 0, vat = 0;
    var rows = lines().map(function (l) {
      var q = S.num(l.q), p = S.num(l.p), rate = l.v === 'x' ? 0 : S.num(l.v) / 100;
      var gross = q * p, ex = incl ? gross / (1 + rate) : gross, v = ex * rate;
      sub += ex; vat += v;
      var k = l.v;
      per[k] = per[k] || { ex: 0, v: 0 };
      per[k].ex += ex; per[k].v += v;
      return { l: l, q: q, p: p, ex: ex, v: v, line: incl ? gross : ex };
    });
    return { rows: rows, per: per, sub: sub, vat: vat, total: sub + vat, incl: incl };
  }

  function render() {
    var c = calc(), cur = f.elements.cur.value, E = S.esc, m = function (x) { return S.money(x, cur); };
    var v = function (n) { return E(f.elements[n].value.trim()); };
    var color = f.elements.color.value || '#1f2251';
    rowsTot(c, m);
    var title = isQ ? T('Offerte', 'Quote') : T('Factuur', 'Invoice');
    var sellerBits = [v('s_addr'), v('s_phone'), v('s_email')].filter(Boolean).join('<br>');
    var ids = [];
    if (v('s_fin')) ids.push(T('FIN/BTW', 'FIN/VAT') + ': ' + v('s_fin'));
    if (v('s_kkf')) ids.push('KKF: ' + v('s_kkf'));
    var h = '<div class="ph"><div>' + (logo ? '<img src="' + logo + '" alt="">' : '<h3>' + (v('s_name') || T('Je bedrijfsnaam', 'Your business name')) + '</h3>') +
      (logo && v('s_name') ? '<div style="font-weight:700;margin-top:6px">' + v('s_name') + '</div>' : '') +
      '<div class="pm" style="margin-top:4px">' + sellerBits + (ids.length ? '<br>' + ids.join(' &middot; ') : '') + '</div></div>' +
      '<div style="text-align:right"><h3>' + title + '</h3><div class="pm">' + T('Nummer', 'Number') + ': <b>' + v('no') + '</b><br>' +
      T('Datum', 'Date') + ': ' + E(S.dateLong(f.elements.date.value)) +
      (f.elements.due.value ? '<br>' + (isQ ? T('Geldig tot', 'Valid until') : T('Vervaldatum', 'Due date')) + ': ' + E(S.dateLong(f.elements.due.value)) : '') + '</div></div></div>';
    h += '<div class="pp"><div><div class="lbl">' + (isQ ? T('Offerte voor', 'Quote for') : T('Factuur aan', 'Bill to')) + '</div><b>' + (v('c_name') || '&nbsp;') + '</b><br>' + v('c_addr') +
      (v('c_fin') ? '<br>' + T('FIN/BTW', 'FIN/VAT') + ': ' + v('c_fin') : '') + '</div>' +
      (v('s_bank') && !isQ ? '<div><div class="lbl">' + T('Betalen aan', 'Pay to') + '</div>' + v('s_bank') + '</div>' : '<div></div>') + '</div>';
    h += '<table><thead><tr><th>' + T('Omschrijving', 'Description') + '</th><th class="r">' + T('Aantal', 'Qty') + '</th><th class="r">' + T('Prijs', 'Price') +
      '</th><th class="r">' + T('BTW', 'VAT') + '</th><th class="r">' + (c.incl ? T('Bedrag incl.', 'Amount incl.') : T('Bedrag', 'Amount')) + '</th></tr></thead><tbody>';
    c.rows.forEach(function (r) {
      if (!r.l.d.trim() && !r.p) return;
      h += '<tr><td>' + E(r.l.d) + '</td><td class="r">' + S.fmt(r.q, r.q % 1 ? 2 : 0) + '</td><td class="r">' + S.fmt(r.p) + '</td><td class="r">' +
        (r.l.v === 'x' ? T('vrij', 'exempt') : r.l.v + '%') + '</td><td class="r">' + S.fmt(r.line) + '</td></tr>';
    });
    h += '</tbody></table><table class="tots"><tbody><tr><td>' + T('Subtotaal excl. BTW', 'Subtotal excl. VAT') + '</td><td class="r">' + m(c.sub) + '</td></tr>';
    Object.keys(c.per).sort(function (a, b) { return (S.num(b) || -1) - (S.num(a) || -1); }).forEach(function (k) {
      var p = c.per[k];
      if (k === 'x') { if (p.ex) h += '<tr><td>' + T('Vrijgesteld van BTW', 'VAT exempt') + '</td><td class="r">' + m(p.ex) + '</td></tr>'; return; }
      if (!p.ex) return;
      h += '<tr><td>' + T('BTW', 'VAT') + ' ' + k + '% ' + T('over', 'on') + ' ' + S.fmt(p.ex) + '</td><td class="r">' + m(p.v) + '</td></tr>';
    });
    h += '<tr class="g"><td>' + T('Totaal', 'Total') + '</td><td class="r">' + m(c.total) + '</td></tr></tbody></table>';
    if (f.elements.words.checked && c.total > 0) h += '<div class="words">' + T('Zegge', 'In words') + ': ' + E(S.words(c.total, cur)) + '</div>';
    if (v('notes')) h += '<div class="pn">' + v('notes') + '</div>';
    var foot = [v('s_name'), ids.join(' · ')].filter(Boolean).join(' · ');
    if (foot) h += '<div class="pf">' + foot + '</div>';
    out.style.setProperty('--pc', color);
    out.innerHTML = h;
    saveBiz();
  }
  function rowsTot(c, m) { c.rows.forEach(function (r) { r.l.tr.querySelector('.c-tot').textContent = S.fmt(r.line); }); }
  function saveBiz() {
    var o = { logo: logo };
    BIZ.forEach(function (n) { o[n] = f.elements[n].value; });
    S.store.set('biz', o);
  }

  f.addEventListener('input', render);
  f.addEventListener('change', render);
  document.getElementById('add-line').onclick = function () { addLine(); render(); tbody.lastChild.querySelector('input').focus(); };
  document.getElementById('s_logo').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    S.imageToDataUrl(file, 400, function (url) { logo = url; render(); });
  });
  document.getElementById('logo-clear').onclick = function (e) { e.preventDefault(); logo = null; document.getElementById('s_logo').value = ''; render(); };
  document.getElementById('next').onclick = function () {
    S.store.set('no:' + doc, bump(f.elements.no.value));
    f.elements.no.value = S.store.get('no:' + doc);
    ['c_name', 'c_addr', 'c_fin'].forEach(function (n) { f.elements[n].value = ''; });
    tbody.innerHTML = ''; addLine();
    f.elements.date.value = S.today();
    f.elements.due.value = S.addDays(S.today(), isQ ? 30 : 14);
    render();
    window.scrollTo({ top: f.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };
  // printing counts as issuing: the next document gets the next number
  window.addEventListener('afterprint', function () {
    var cur = f.elements.no.value;
    if (S.store.get('no:' + doc, null) === cur || !S.store.get('no:' + doc, null)) S.store.set('no:' + doc, bump(cur));
  });
  document.getElementById('wa').onclick = function () {
    var c = calc(), cur = f.elements.cur.value;
    var t = (isQ ? T('Offerte', 'Quote') : T('Factuur', 'Invoice')) + ' ' + f.elements.no.value + (f.elements.s_name.value ? ' ' + T('van', 'from') + ' ' + f.elements.s_name.value : '') + '\n';
    c.rows.forEach(function (r) { if (r.l.d.trim() || r.p) t += '- ' + r.l.d + ' (' + S.fmt(r.q, r.q % 1 ? 2 : 0) + ' x ' + S.fmt(r.p) + ')\n'; });
    t += T('Totaal', 'Total') + ': ' + S.money(c.total, cur) + (c.vat ? ' (' + T('incl.', 'incl.') + ' ' + S.money(c.vat, cur) + ' ' + T('BTW', 'VAT') + ')' : '') + '\n';
    if (!isQ && f.elements.due.value) t += T('Graag betalen voor', 'Please pay by') + ' ' + S.dateLong(f.elements.due.value) + '\n';
    if (!isQ && f.elements.s_bank.value) t += T('Betalen aan', 'Pay to') + ': ' + f.elements.s_bank.value + '\n';
    if (isQ && f.elements.due.value) t += T('Geldig tot', 'Valid until') + ' ' + S.dateLong(f.elements.due.value) + '\n';
    window.open(S.waUrl(t, ''), '_blank', 'noopener');
  };
  var toInv = document.getElementById('to-invoice');
  if (toInv) toInv.addEventListener('click', function () {
    S.store.set('carry', { c_name: f.elements.c_name.value, c_addr: f.elements.c_addr.value, c_fin: f.elements.c_fin.value,
      cur: f.elements.cur.value, pricemode: f.elements.pricemode.value,
      lines: lines().map(function (l) { return { d: l.d, q: l.q, p: l.p, v: l.v }; }) });
  });
  render();
})();
