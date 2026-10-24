/* Pricing, import, loan, break-even, unit price, percentage, savings and depreciation tools. */
(function () {
  var S = window.SBT, T = S.T, R = S.SB.rates;
  var on = function (f, fn) { f.addEventListener('input', fn); f.addEventListener('change', fn); fn(); };
  var tbl = function (head, rows, right) {
    return '<table class="tbl stack"><thead><tr>' + head.map(function (h, i) { return '<th' + (i && right ? ' class="r"' : '') + '>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i && right ? ' class="r"' : '') + ' data-l="' + head[i] + '">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  };
  // fill an exchange-rate field from today's CME rate when the currency changes
  function fxField(f) {
    var hint = document.getElementById('fx-hint'), last = null;
    function fill() {
      var c = f.elements.cur.value;
      var wrap = f.elements.fx.closest('div');
      if (c === 'SRD') { f.elements.fx.value = '1'; wrap.style.opacity = .5; hint.textContent = ''; last = c; return; }
      wrap.style.opacity = 1;
      if (c === last) return;
      last = c;
      var r = R && R[c.toLowerCase()];
      if (r) { f.elements.fx.value = S.fmt(r.sell); hint.textContent = T('CME verkoopkoers ', 'CME selling rate ') + S.dateLong(R.date); }
      else hint.textContent = T('Vul de koers in', 'Enter the rate');
    }
    f.elements.cur.addEventListener('change', fill);
    fill();
  }

  // ---------------------------------------------------------------- price and markup
  var pr = document.getElementById('pr');
  if (pr) {
    var q = new URLSearchParams(location.search);
    if (q.get('cost')) { pr.elements.cost.value = q.get('cost'); pr.elements.cur.value = q.get('cur') || 'SRD'; }
    fxField(pr);
    on(pr, function () {
      var e = pr.elements, fx = S.num(e.fx.value) * (1 + S.num(e.buf.value) / 100);
      var cost = S.num(e.cost.value) * (e.cur.value === 'SRD' ? 1 : fx) + S.num(e.extra.value);
      var pct = S.num(e.pct.value) / 100, vat = S.num(e.vat.value) / 100, rnd = S.num(e.round.value);
      var ex = e.mode.value === 'markup' ? cost * (1 + pct) : (pct < 1 ? cost / (1 - pct) : 0);
      var inc = ex * (1 + vat);
      if (rnd) { inc = Math.ceil(inc / rnd - 1e-9) * rnd; ex = inc / (1 + vat); }
      var profit = ex - cost;
      var h = '<div class="sub">' + T('Verkoopprijs incl. BTW', 'Selling price incl. VAT') + '</div><div class="big tnum">' + S.money(inc) + '</div><table>' +
        '<tr><td>' + T('Kostprijs in SRD', 'Cost in SRD') + '</td><td class="r">' + S.money(cost) + '</td></tr>' +
        '<tr><td>' + T('Verkoopprijs excl. BTW', 'Price excl. VAT') + '</td><td class="r">' + S.money(ex) + '</td></tr>' +
        '<tr><td>' + T('BTW', 'VAT') + ' ' + e.vat.value + '%</td><td class="r">' + S.money(inc - ex) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Winst per stuk', 'Profit per item') + '</td><td class="r">' + S.money(profit) + '</td></tr></table>' +
        '<p class="sub" style="margin-top:10px">' + T('Opslag', 'Markup') + ' ' + S.fmt(cost ? profit / cost * 100 : 0, 1) + '% &middot; ' + T('marge', 'margin') + ' ' + S.fmt(ex ? profit / ex * 100 : 0, 1) + '%</p>';
      h += '<table style="margin-top:6px"><tr><td colspan="2" class="sub">' + T('Als de koers stijgt', 'If the rate rises') + '</td></tr>';
      if (e.cur.value !== 'SRD') [2, 5, 10].forEach(function (p) {
        var c2 = S.num(e.cost.value) * fx * (1 + p / 100) + S.num(e.extra.value);
        h += '<tr><td>+' + p + '%: ' + T('winst', 'profit') + '</td><td class="r">' + S.money(ex - c2) + '</td></tr>';
      });
      h += '</table>';
      document.getElementById('pr-out').innerHTML = h;
    });
  }

  // ---------------------------------------------------------------- import cost
  var ic = document.getElementById('ic');
  if (ic) {
    fxField(ic);
    on(ic, function () {
      var e = ic.elements, fx = e.cur.value === 'SRD' ? 1 : S.num(e.fx.value);
      var cif = (S.num(e.val.value) + S.num(e.frt.value) + S.num(e.ins.value)) * fx;
      var duty = cif * S.num(e.duty.value) / 100, lev = cif * S.num(e.lev.value) / 100, exc = S.num(e.exc.value);
      var vat = (cif + duty + lev + exc) * S.num(e.vat.value) / 100, local = S.num(e.local.value);
      var total = cif + duty + lev + exc + vat + local, units = Math.max(1, S.num(e.units.value));
      var cost = e.reg.checked ? total - vat : total;
      var h = '<div class="sub">' + T('Kostprijs per stuk', 'Landed cost per item') + (e.reg.checked ? T(' (excl. BTW)', ' (excl. VAT)') : '') + '</div><div class="big tnum">' + S.money(cost / units) + '</div><table>' +
        '<tr><td>' + T('Douanewaarde (CIF)', 'Customs value (CIF)') + '</td><td class="r">' + S.money(cif) + '</td></tr>' +
        '<tr><td>' + T('Invoerrecht', 'Import duty') + ' ' + S.fmt(S.num(e.duty.value), 1) + '%</td><td class="r">' + S.money(duty) + '</td></tr>' +
        (lev ? '<tr><td>' + T('Overige heffingen', 'Other levies') + '</td><td class="r">' + S.money(lev) + '</td></tr>' : '') +
        (exc ? '<tr><td>' + T('Accijns', 'Excise') + '</td><td class="r">' + S.money(exc) + '</td></tr>' : '') +
        '<tr><td>' + T('BTW bij invoer', 'Import VAT') + '</td><td class="r">' + S.money(vat) + '</td></tr>' +
        '<tr><td>' + T('Lokale kosten', 'Local costs') + '</td><td class="r">' + S.money(local) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Totaal te betalen', 'Total to pay') + '</td><td class="r">' + S.money(total) + '</td></tr></table>' +
        '<p class="sub" style="margin-top:10px">' + T('Opslag op de factuurwaarde', 'On top of invoice value') + ': ' + S.fmt(cif ? (cost / (S.num(e.val.value) * fx) - 1) * 100 : 0, 1) + '%' +
        (e.reg.checked ? '. ' + T('De BTW bij invoer trek je af in je BTW aangifte.', 'You deduct the import VAT in your VAT return.') : '') + '</p>' +
        '<div class="btns"><a class="btn ghost sm" href="' + (S.nl ? '/verkoopprijs-berekenen' : '/en/price-markup-calculator') + '?cost=' + (cost / units).toFixed(2) + '&cur=SRD">' + T('Bereken de verkoopprijs', 'Work out the selling price') + ' &rarr;</a></div>';
      document.getElementById('ic-out').innerHTML = h;
    });
  }

  // ---------------------------------------------------------------- loan
  var ln = document.getElementById('ln'), lnRows = [];
  if (ln) {
    ln.elements.start.value = S.addDays(S.today(), 31).slice(0, 7);
    on(ln, function () {
      var e = ln.elements, P = S.num(e.amt.value), n = Math.max(1, Math.round(S.num(e.months.value))), r = S.num(e.rate.value) / 100 / 12, cur = e.cur.value;
      document.getElementById('yrs').textContent = S.fmt(n / 12, 1) + ' ' + T('jaar', 'years');
      var bal = P, totI = 0, first = 0, last = 0, ann = r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
      var y = +e.start.value.slice(0, 4) || new Date().getFullYear(), m = (+e.start.value.slice(5, 7) || 1) - 1;
      lnRows = [];
      for (var i = 0; i < n; i++) {
        var int = bal * r, pay = e.type.value === 'ann' ? ann : P / n + int, prin = pay - int;
        if (i === n - 1) { prin = bal; pay = prin + int; }
        bal = Math.max(0, bal - prin); totI += int;
        if (!i) first = pay; last = pay;
        var mm = (m + i) % 12, yy = y + Math.floor((m + i) / 12);
        lnRows.push([yy + '-' + ('0' + (mm + 1)).slice(-2), pay, int, prin, bal]);
      }
      var fee = S.num(e.fee.value), mo = function (x) { return S.money(x, cur); };
      var h = '<div class="sub">' + (e.type.value === 'ann' ? T('Maandlast', 'Monthly payment') : T('Eerste maandlast', 'First monthly payment')) + '</div><div class="big tnum">' + mo(first) + '</div><table>' +
        (e.type.value === 'lin' ? '<tr><td>' + T('Laatste maandlast', 'Last monthly payment') + '</td><td class="r">' + mo(last) + '</td></tr>' : '') +
        '<tr><td>' + T('Totale rente', 'Total interest') + '</td><td class="r">' + mo(totI) + '</td></tr>' +
        (fee ? '<tr><td>' + T('Afsluitkosten', 'Arrangement fee') + '</td><td class="r">' + mo(fee) + '</td></tr>' : '') +
        '<tr class="tot"><td>' + T('Totaal terug te betalen', 'Total to repay') + '</td><td class="r">' + mo(P + totI + fee) + '</td></tr></table>';
      document.getElementById('ln-out').innerHTML = h;
      // schedule: yearly summary, monthly detail on demand
      var years = {};
      lnRows.forEach(function (rw) { var k = rw[0].slice(0, 4); years[k] = years[k] || [0, 0, 0, 0]; years[k][0] += rw[1]; years[k][1] += rw[2]; years[k][2] += rw[3]; years[k][3] = rw[4]; });
      var head = [T('Jaar', 'Year'), T('Betaald', 'Paid'), T('Rente', 'Interest'), T('Aflossing', 'Principal'), T('Restschuld', 'Balance')];
      var f2 = function (x) { return S.fmt(x); };
      document.getElementById('ln-sched').innerHTML = tbl(head, Object.keys(years).map(function (k) { var v = years[k]; return [k, f2(v[0]), f2(v[1]), f2(v[2]), f2(v[3])]; }), true) +
        '<details style="margin-top:12px"><summary>' + T('Per maand', 'Month by month') + '</summary>' + tbl([T('Maand', 'Month')].concat(head.slice(1)), lnRows.map(function (rw) { return [rw[0], f2(rw[1]), f2(rw[2]), f2(rw[3]), f2(rw[4])]; }), true) + '</details>';
    });
    document.getElementById('ln-csv').onclick = function () {
      S.download(S.csv([[T('Maand', 'Month'), T('Betaald', 'Paid'), T('Rente', 'Interest'), T('Aflossing', 'Principal'), T('Restschuld', 'Balance')]].concat(lnRows.map(function (r) { return [r[0], S.fmt(r[1]), S.fmt(r[2]), S.fmt(r[3]), S.fmt(r[4])]; }))), 'aflossingsschema.csv', 'text/csv;charset=utf-8');
    };
  }

  // ---------------------------------------------------------------- break-even
  var be = document.getElementById('be');
  if (be) on(be, function () {
    var e = be.elements, F = S.num(e.fixed.value), p = S.num(e.price.value), v = S.num(e['var'].value), tg = S.num(e.target.value);
    var cm = p - v, out = document.getElementById('be-out');
    if (cm <= 0) { out.innerHTML = '<div class="big">' + T('Geen winst mogelijk', 'No profit possible') + '</div><p class="sub">' + T('De prijs moet hoger zijn dan de variabele kosten per stuk.', 'The price must be higher than the variable cost per item.') + '</p>'; document.getElementById('be-table').innerHTML = ''; return; }
    var bu = Math.ceil(F / cm - 1e-9), tu = Math.ceil((F + tg) / cm - 1e-9);
    out.innerHTML = '<div class="sub">' + T('Break-even per maand', 'Break-even per month') + '</div><div class="big tnum">' + S.fmt(bu, 0) + ' ' + T('stuks', 'items') + '</div><table>' +
      '<tr><td>' + T('Omzet nodig', 'Revenue needed') + '</td><td class="r">' + S.money(bu * p) + '</td></tr>' +
      '<tr><td>' + T('Per werkdag (ca. 26 per maand)', 'Per working day (about 26 a month)') + '</td><td class="r">' + S.fmt(bu / 26, 1) + '</td></tr>' +
      '<tr><td>' + T('Dekkingsbijdrage per stuk', 'Contribution per item') + '</td><td class="r">' + S.money(cm) + ' (' + S.fmt(cm / p * 100, 0) + '%)</td></tr>' +
      '<tr class="tot"><td>' + T('Voor je gewenste winst', 'For your target profit') + '</td><td class="r">' + S.fmt(tu, 0) + ' ' + T('stuks', 'items') + '</td></tr></table>';
    var rows = [0.5, 0.75, 1, 1.25, 1.5, 2].map(function (k) { var u = Math.round(bu * k); return [S.fmt(u, 0), S.fmt(u * p), S.fmt(u * cm - F)]; });
    document.getElementById('be-table').innerHTML = tbl([T('Stuks', 'Items'), T('Omzet', 'Revenue'), T('Winst', 'Profit')], rows, true);
  });

  // ---------------------------------------------------------------- unit price
  var up = document.getElementById('up');
  if (up) {
    var box = document.getElementById('up-rows'), n = 0;
    var UNITS = [['g', 'gram', 1000, 'kg'], ['kg', 'kg', 1, 'kg'], ['ml', 'ml', 1000, 'l'], ['l', T('liter', 'litre'), 1, 'l'], ['oz', 'oz', 35.274, 'kg'], ['lb', 'lb', 2.20462, 'kg'], ['st', T('stuks', 'pieces'), 1, T('stuk', 'piece')]];
    var add = function (d) {
      n++; d = d || ['', '', '', 'g'];
      var div = document.createElement('div');
      div.className = 'three'; div.style.borderBottom = '1px solid var(--line-2)'; div.style.paddingBottom = '10px';
      div.innerHTML = '<div style="grid-column:1/-1"><label>' + T('Product', 'Product') + ' ' + n + '</label><input name="nm" placeholder="' + T('Bijv. rijst 5 kg', 'E.g. rice 5 kg') + '" value="' + S.esc(d[0]) + '"></div>' +
        '<div><label>' + T('Prijs (SRD)', 'Price (SRD)') + '</label><input name="pr" inputmode="decimal" value="' + d[1] + '"></div><div><label>' + T('Inhoud', 'Size') + '</label><input name="sz" inputmode="decimal" value="' + d[2] + '"></div>' +
        '<div><label>' + T('Eenheid', 'Unit') + '</label><select name="un">' + UNITS.map(function (u) { return '<option value="' + u[0] + '"' + (u[0] === d[3] ? ' selected' : '') + '>' + u[1] + '</option>'; }).join('') + '</select></div>';
      box.appendChild(div);
    };
    add([T('Klein pak', 'Small pack'), '89,95', '900', 'g']); add([T('Groot pak', 'Big pack'), '415', '5', 'kg']);
    document.getElementById('up-add').onclick = function () { if (n < 8) add(); upr(); };
    var upr = function () {
      var items = S.$$('.three', box).map(function (d, i) {
        var pr = S.num(d.querySelector('[name=pr]').value), sz = S.num(d.querySelector('[name=sz]').value), u = d.querySelector('[name=un]').value;
        var U = UNITS.filter(function (x) { return x[0] === u; })[0];
        return { nm: d.querySelector('[name=nm]').value || T('Product', 'Product') + ' ' + (i + 1), per: pr && sz ? pr / (sz / U[2]) : null, base: U[3] };
      }).filter(function (x) { return x.per; });
      var out = document.getElementById('up-out');
      if (!items.length) { out.innerHTML = '<div class="sub">' + T('Vul prijs en inhoud in', 'Enter price and size') + '</div>'; return; }
      var groups = {};
      items.forEach(function (x) { (groups[x.base] = groups[x.base] || []).push(x); });
      var h = '';
      Object.keys(groups).forEach(function (b) {
        var g = groups[b].sort(function (a, c) { return a.per - c.per; }), best = g[0];
        h += '<div class="sub">' + T('Goedkoopst per ', 'Cheapest per ') + b + '</div><div class="big" style="font-size:1.6rem">' + S.esc(best.nm) + '</div><table>';
        g.forEach(function (x) { h += '<tr><td>' + S.esc(x.nm) + '</td><td class="r">' + S.money(x.per) + ' / ' + b + (x !== best ? ' <span style="color:#b2341b">+' + S.fmt((x.per / best.per - 1) * 100, 0) + '%</span>' : '') + '</td></tr>'; });
        h += '</table><div style="height:14px"></div>';
      });
      out.innerHTML = h;
    };
    up.addEventListener('input', upr); up.addEventListener('change', upr); upr();
  }

  // ---------------------------------------------------------------- percentages
  S.$$('#pc form').forEach(function (f) {
    var p = f.getAttribute('data-p'), o = f.querySelector('[data-out]'), sub = f.querySelector('[data-sub]');
    on(f, function () {
      var a = S.num(f.elements.a.value), b = S.num(f.elements.b.value);
      if (p === 'of') o.textContent = S.fmt(a / 100 * b);
      if (p === 'disc') { o.textContent = S.fmt(a * (1 - b / 100)); sub.textContent = T('Je bespaart ', 'You save ') + S.fmt(a * b / 100); }
      if (p === 'chg') { var c = a ? (b - a) / Math.abs(a) * 100 : 0; o.textContent = (c > 0 ? '+' : '') + S.fmt(c, 2) + '%'; sub.textContent = (c >= 0 ? T('Stijging van ', 'Increase of ') : T('Daling van ', 'Decrease of ')) + S.fmt(Math.abs(b - a)); }
      if (p === 'ratio') o.textContent = (b ? S.fmt(a / b * 100, 2) : '0') + '%';
    });
  });

  // ---------------------------------------------------------------- savings
  var sv = document.getElementById('sv');
  if (sv) on(sv, function () {
    var e = sv.elements, bal = S.num(e.start.value), dep = S.num(e.dep.value), yrs = Math.min(60, Math.max(1, Math.round(S.num(e.years.value)))), comp = +e.comp.value, cur = e.cur.value;
    var r = S.num(e.rate.value) / 100, paid = bal, rows = [], intAcc = 0, pend = 0;
    for (var m = 1; m <= yrs * 12; m++) {
      pend += bal * r / 12;            // interest accrues monthly, is added per period
      if (m % (12 / comp) === 0) { bal += pend; intAcc += pend; pend = 0; }
      bal += dep; paid += dep;
      if (m % 12 === 0) rows.push([String(m / 12), S.fmt(paid), S.fmt(intAcc), S.fmt(bal)]);
    }
    document.getElementById('sv-out').innerHTML = '<div class="sub">' + T('Na ', 'After ') + yrs + T(' jaar', ' years') + '</div><div class="big tnum">' + S.money(bal, cur) + '</div><table>' +
      '<tr><td>' + T('Zelf ingelegd', 'Paid in') + '</td><td class="r">' + S.money(paid, cur) + '</td></tr><tr class="tot"><td>' + T('Rente verdiend', 'Interest earned') + '</td><td class="r">' + S.money(intAcc, cur) + '</td></tr></table>';
    document.getElementById('sv-table').innerHTML = tbl([T('Jaar', 'Year'), T('Ingelegd', 'Paid in'), T('Rente totaal', 'Total interest'), T('Saldo', 'Balance')], rows, true);
  });

  // ---------------------------------------------------------------- depreciation
  var dp = document.getElementById('dp');
  if (dp) on(dp, function () {
    var e = dp.elements, cost = S.num(e.cost.value), res = Math.min(S.num(e.res.value), cost), life = Math.max(1, Math.round(S.num(e.life.value)));
    var y0 = Math.round(S.num(e.y0.value)) || new Date().getFullYear(), m1 = Math.min(12, Math.max(1, Math.round(S.num(e.m1.value)) || 12));
    var base = cost - res, book = cost, rows = [], lin = base / life, rate = 2 / life, y = 0, guard = 0;
    while (book - res > 0.005 && guard++ < 60) {
      var frac = y === 0 ? m1 / 12 : 1, d;
      if (e.method.value === 'lin') d = lin * frac;
      else {
        var remYears = life - (y === 0 ? 0 : (y - 1) + m1 / 12);
        var sl = remYears > 0 ? (book - res) / remYears : book - res;
        d = Math.max(book * rate, sl) * frac;
      }
      d = Math.min(d, book - res);
      book -= d;
      rows.push([String(y0 + y), S.fmt(d), S.fmt(book)]);
      y++;
    }
    document.getElementById('dp-out').innerHTML = '<div class="sub">' + T('Afschrijving eerste volle jaar', 'Depreciation first full year') + '</div><div class="big tnum">' + S.money(e.method.value === 'lin' ? lin : Math.max(cost * rate, lin)) + '</div><table>' +
      '<tr><td>' + T('Af te schrijven', 'Depreciable amount') + '</td><td class="r">' + S.money(base) + '</td></tr><tr><td>' + (e.method.value === 'lin' ? T('Percentage per jaar', 'Rate per year') : T('Degressief percentage', 'Declining rate')) + '</td><td class="r">' + S.fmt((e.method.value === 'lin' ? 1 / life : rate) * 100, 1) + '%</td></tr>' +
      '<tr class="tot"><td>' + T('Volledig afgeschreven in', 'Fully depreciated in') + '</td><td class="r">' + (y0 + rows.length - 1) + '</td></tr></table>';
    document.getElementById('dp-table').innerHTML = tbl([T('Jaar', 'Year'), T('Afschrijving', 'Depreciation'), T('Boekwaarde', 'Book value')], rows, true);
  });
})();

/* ROI / payback and trip cost */
(function () {
  var S = window.SBT, T = S.T;
  var on = function (f, fn) { f.addEventListener('input', fn); f.addEventListener('change', fn); fn(); };
  var ro = document.getElementById('ro');
  if (ro) on(ro, function () {
    var e = ro.elements, cur = e.cur.value, inv = S.num(e.inv.value), net = S.num(e.gain.value) - S.num(e.cost.value);
    var life = Math.max(0.1, S.num(e.life.value)), rest = S.num(e.rest.value), out = document.getElementById('ro-out');
    if (net <= 0) { out.innerHTML = '<div class="big">' + T('Verdient zich niet terug', 'Does not pay back') + '</div><p class="sub">' + T('De maandelijkse opbrengst moet hoger zijn dan de extra kosten.', 'The monthly gain must exceed the extra costs.') + '</p>'; return; }
    var months = inv / net, total = net * 12 * life + rest - inv, roi = total / inv / life * 100;
    out.innerHTML = '<div class="sub">' + T('Terugverdiend na', 'Paid back after') + '</div><div class="big tnum">' + S.fmt(months, 1) + ' ' + T('maanden', 'months') + '</div><table>' +
      '<tr><td>' + T('Netto per maand', 'Net per month') + '</td><td class="r">' + S.money(net, cur) + '</td></tr>' +
      '<tr><td>' + T('Netto per jaar', 'Net per year') + '</td><td class="r">' + S.money(net * 12, cur) + '</td></tr>' +
      '<tr><td>' + T('Totale winst over de levensduur', 'Total profit over its life') + '</td><td class="r">' + S.money(total, cur) + '</td></tr>' +
      '<tr class="tot"><td>' + T('Rendement per jaar', 'Return per year') + '</td><td class="r">' + S.fmt(roi, 1) + '%</td></tr></table>' +
      (months > life * 12 ? '<p class="sub" style="margin-top:10px;color:#b2341b">' + T('Langer dan de levensduur: dit verdient zich niet terug.', 'Longer than its useful life: this does not pay back.') + '</p>' : '');
  });
  var tc = document.getElementById('tc');
  if (tc) {
    tc.elements.fuel.value = S.store.get('tc:fuel', '');
    on(tc, function () {
      var e = tc.elements, km = S.num(e.km.value) * +e.ret.value, use = Math.max(0.1, S.num(e.use.value)), fuelP = S.num(e.fuel.value);
      S.store.set('tc:fuel', e.fuel.value);
      var fuel = km / use * fuelP, wear = km * S.num(e.wear.value), labour = S.num(e.time.value) / 60 * S.num(e.wage.value);
      var tot = fuel + wear + labour, trips = S.num(e.trips.value);
      document.getElementById('tc-out').innerHTML = '<div class="sub">' + T('Kosten per rit', 'Cost per trip') + '</div><div class="big tnum">' + S.money(tot) + '</div><table>' +
        '<tr><td>' + T('Brandstof', 'Fuel') + ' (' + S.fmt(km / use, 1) + ' l)</td><td class="r">' + S.money(fuel) + '</td></tr>' +
        '<tr><td>' + T('Slijtage en onderhoud', 'Wear and maintenance') + '</td><td class="r">' + S.money(wear) + '</td></tr>' +
        '<tr><td>' + T('Arbeidstijd', 'Labour') + '</td><td class="r">' + S.money(labour) + '</td></tr>' +
        '<tr><td>' + T('Per kilometer', 'Per kilometre') + '</td><td class="r">' + S.money(km ? tot / km : 0) + '</td></tr>' +
        '<tr><td>' + T('Per maand', 'Per month') + ' (' + S.fmt(trips, 0) + ' ' + T('ritten', 'trips') + ')</td><td class="r">' + S.money(tot * trips) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Bezorgtarief met 25% marge', 'Delivery fee with 25% margin') + '</td><td class="r">' + S.money(Math.ceil(tot / 0.75 / 5) * 5) + '</td></tr></table>' +
        (fuelP ? '' : '<p class="sub" style="margin-top:10px">' + T('Vul de brandstofprijs in voor een volledige berekening.', 'Enter the fuel price for a complete calculation.') + '</p>');
    });
  }
})();
