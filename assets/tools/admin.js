/* Unpaid invoices, stock and cash flow. Data stays in this browser (localStorage). */
(function () {
  var S = window.SBT, T = S.T;
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function backup(key, name, data) { S.download(JSON.stringify({ app: 'surinamebusiness-' + key, v: 1, data: data }), name + '-' + S.today() + '.json', 'application/json'); }
  function restore(input, cb) {
    input.addEventListener('change', function (e) {
      var file = e.target.files[0]; if (!file) return;
      var fr = new FileReader();
      fr.onload = function () {
        try { var j = JSON.parse(fr.result); if (!j || !Array.isArray(j.data)) throw 0; cb(j.data); }
        catch (err) { window.alert(T('Dit is geen geldige back-up.', 'This is not a valid backup.')); }
        input.value = '';
      };
      fr.readAsText(file);
    });
  }
  function merge(list, add) {
    var ids = {}; list.forEach(function (x) { ids[x.id] = 1; });
    var n = 0; add.forEach(function (x) { if (x && x.id && !ids[x.id]) { list.push(x); n++; } });
    window.alert(T(n + ' regels teruggezet.', n + ' rows restored.'));
  }
  function days(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5); }

  // ---------------------------------------------------------------- unpaid invoices
  var rv = document.getElementById('rv');
  if (rv) {
    var KEY = 'receivables', data = S.store.get(KEY, []), filter = 'open', E = rv.elements;
    E.date.value = S.today(); E.due.value = S.addDays(S.today(), 14);
    var save = function () { S.store.set(KEY, data); };
    var state = function (x) { return x.paid ? 'paid' : (x.due && x.due < S.today() ? 'late' : 'open'); };
    var render = function () {
      var today = S.today(), list = data.filter(function (x) { var st = state(x); return filter === 'all' || st === filter || (filter === 'open' && st === 'late'); })
        .sort(function (a, b) { return (a.due || '') < (b.due || '') ? -1 : 1; });
      document.getElementById('rv-list').innerHTML = list.length ? list.map(function (x) {
        var st = state(x), d = x.due ? days(x.due, today) : 0;
        return '<li><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>' + S.esc(x.cust) + '</b><b class="tnum">' + S.money(x.amount, x.cur) + '</b></div>' +
          '<div class="meta"><span>' + S.esc(x.no || '') + '</span><span>' + T('vervalt ', 'due ') + S.esc(S.dateLong(x.due)) + '</span>' +
          (st === 'late' ? '<span class="pill red">' + d + T(' dagen te laat', ' days overdue') + '</span>' : st === 'paid' ? '<span class="pill green">' + T('betaald ', 'paid ') + S.esc(S.dateLong(x.paid)) + '</span>' : '<span class="pill">' + T('open', 'open') + '</span>') + '</div>' +
          '<div class="btns" style="margin-top:6px">' + (x.paid ? '<button class="btn alt sm" data-a="unpay" data-id="' + x.id + '">' + T('Toch niet betaald', 'Mark unpaid') + '</button>' :
            '<button class="btn alt sm" data-a="pay" data-id="' + x.id + '">' + T('Betaald', 'Paid') + '</button><button class="btn alt sm" data-a="wa" data-id="' + x.id + '">' + T('Herinnering via WhatsApp', 'WhatsApp reminder') + '</button>') +
          '<button class="btn alt sm" data-a="del" data-id="' + x.id + '" aria-label="' + T('Verwijderen', 'Delete') + '">&times;</button></div></li>';
      }).join('') : '<li class="empty">' + T('Niets in deze lijst.', 'Nothing in this list.') + '</li>';
      var tot = {}, late = {}, n = 0, ages = [0, 0, 0, 0];
      data.forEach(function (x) {
        if (x.paid) return;
        n++; tot[x.cur] = (tot[x.cur] || 0) + x.amount;
        var d = x.due ? days(x.due, today) : 0;
        if (d > 0) late[x.cur] = (late[x.cur] || 0) + x.amount;
        if (x.cur === 'SRD') ages[d <= 0 ? 0 : d <= 30 ? 1 : d <= 60 ? 2 : 3] += x.amount;
      });
      var curs = Object.keys(tot);
      var h = '<div class="sub">' + T('Nog te ontvangen', 'Still to receive') + ' (' + n + ')</div><div class="big tnum">' + (curs.length ? S.money(tot[curs[0]], curs[0]) : S.money(0)) + '</div><table>';
      curs.slice(1).forEach(function (c) { h += '<tr><td>' + c + '</td><td class="r">' + S.money(tot[c], c) + '</td></tr>'; });
      Object.keys(late).forEach(function (c) { h += '<tr><td>' + T('Waarvan te laat', 'Of which overdue') + ' (' + c + ')</td><td class="r">' + S.money(late[c], c) + '</td></tr>'; });
      h += '<tr><td colspan="2" class="sub" style="padding-top:12px">SRD ' + T('naar ouderdom', 'by age') + '</td></tr>' +
        [[T('Nog niet vervallen', 'Not yet due'), 0], ['1-30 ' + T('dagen', 'days'), 1], ['31-60 ' + T('dagen', 'days'), 2], [T('Meer dan 60 dagen', 'Over 60 days'), 3]].map(function (r) { return '<tr><td>' + r[0] + '</td><td class="r">' + S.money(ages[r[1]]) + '</td></tr>'; }).join('') + '</table>';
      document.getElementById('rv-sum').innerHTML = h;
    };
    rv.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!E.cust.value.trim() || !S.num(E.amount.value)) { E.cust.focus(); return; }
      data.push({ id: uid(), cust: E.cust.value.trim(), phone: E.phone.value.trim(), no: E.no.value.trim(), amount: S.num(E.amount.value), cur: E.cur.value, date: E.date.value, due: E.due.value || E.date.value, paid: '' });
      save(); ['cust', 'phone', 'no', 'amount'].forEach(function (n) { E[n].value = ''; }); E.cust.focus(); render();
    });
    document.getElementById('rv-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var x = data.filter(function (y) { return y.id === b.getAttribute('data-id'); })[0]; if (!x) return;
      var a = b.getAttribute('data-a');
      if (a === 'pay') x.paid = S.today();
      if (a === 'unpay') x.paid = '';
      if (a === 'del') { if (!window.confirm(T('Verwijderen?', 'Delete?'))) return; data = data.filter(function (y) { return y !== x; }); }
      if (a === 'wa') {
        var t = T('Beste ', 'Dear ') + x.cust + ',\n\n' + T('Een vriendelijke herinnering: factuur ', 'A friendly reminder: invoice ') + (x.no || '') + T(' van ', ' for ') + S.money(x.amount, x.cur) +
          T(' stond open tot ', ' was due on ') + S.dateLong(x.due) + '. ' + T('Wilt u het bedrag deze week overmaken? Heeft u al betaald, dan dank ik u hartelijk.', 'Could you please pay this week? If you have already paid, thank you very much.');
        window.open(S.waUrl(t, x.phone), '_blank', 'noopener'); return;
      }
      save(); render();
    });
    S.$$('#rv-f .chip').forEach(function (c) { c.addEventListener('click', function () { filter = c.getAttribute('data-v'); S.$$('#rv-f .chip').forEach(function (y) { y.setAttribute('aria-pressed', y === c); }); render(); }); });
    document.getElementById('rv-csv').onclick = function () {
      S.download(S.csv([[T('Klant', 'Customer'), T('Factuur', 'Invoice'), T('Valuta', 'Currency'), T('Bedrag', 'Amount'), T('Datum', 'Date'), T('Vervaldatum', 'Due date'), T('Betaald op', 'Paid on')]]
        .concat(data.map(function (x) { return [x.cust, x.no, x.cur, S.fmt(x.amount), x.date, x.due, x.paid]; }))), 'openstaande-facturen.csv', 'text/csv;charset=utf-8');
    };
    document.getElementById('rv-backup').onclick = function () { backup('receivables', 'openstaande-facturen', data); };
    restore(document.getElementById('rv-restore'), function (d) { merge(data, d); save(); render(); });
    render();
  }

  // ---------------------------------------------------------------- stock
  var sk = document.getElementById('sk');
  if (sk) {
    var SK = 'stock', items = S.store.get(SK, []), low = false, F = sk.elements;
    var ssave = function () { S.store.set(SK, items); };
    var isLow = function (x) { return x.qty <= x.min; };
    var srender = function () {
      var q = document.getElementById('sk-q').value.toLowerCase().trim();
      var list = items.filter(function (x) { return (!low || isLow(x)) && (!q || (x.name + ' ' + x.code).toLowerCase().indexOf(q) >= 0); })
        .sort(function (a, b) { return a.name.localeCompare(b.name); });
      document.getElementById('sk-list').innerHTML = list.length ? list.map(function (x) {
        return '<li><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>' + S.esc(x.name) + (x.code ? ' <span class="sub">' + S.esc(x.code) + '</span>' : '') + '</b>' +
          '<b class="tnum"' + (isLow(x) ? ' style="color:var(--down)"' : '') + '>' + S.fmt(x.qty, x.qty % 1 ? 2 : 0) + ' ' + S.esc(x.unit || '') + '</b></div>' +
          '<div class="meta"><span>min ' + S.fmt(x.min, 0) + '</span>' + (x.cost ? '<span>' + T('inkoop ', 'cost ') + S.money(x.cost) + '</span>' : '') + (x.price ? '<span>' + T('verkoop ', 'price ') + S.money(x.price) + '</span>' : '') +
          (x.cost && x.price ? '<span>' + T('marge ', 'margin ') + S.fmt((x.price / 1.1 - x.cost) / (x.price / 1.1) * 100, 0) + '%*</span>' : '') + (isLow(x) ? '<span class="pill red">' + T('bijbestellen', 'reorder') + '</span>' : '') + '</div>' +
          '<div class="btns" style="margin-top:6px;align-items:center"><input inputmode="decimal" placeholder="' + T('aantal', 'qty') + '" data-n="' + x.id + '" style="width:90px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;font:inherit" aria-label="' + T('Aantal', 'Quantity') + '">' +
          '<button class="btn alt sm" data-a="in" data-id="' + x.id + '">+ ' + T('In', 'In') + '</button><button class="btn alt sm" data-a="out" data-id="' + x.id + '">- ' + T('Uit', 'Out') + '</button><button class="btn alt sm" data-a="set" data-id="' + x.id + '">' + T('Telling', 'Count') + '</button><button class="btn alt sm" data-a="del" data-id="' + x.id + '" aria-label="' + T('Verwijderen', 'Delete') + '">&times;</button></div></li>';
      }).join('') : '<li class="empty">' + T('Nog geen artikelen.', 'No items yet.') + '</li>';
      var val = 0, sval = 0, nLow = 0;
      items.forEach(function (x) { val += x.qty * (x.cost || 0); sval += x.qty * (x.price || 0); if (isLow(x)) nLow++; });
      document.getElementById('sk-sum').innerHTML = '<div class="sub">' + T('Voorraadwaarde (inkoop)', 'Stock value (cost)') + '</div><div class="big tnum">' + S.money(val) + '</div><table>' +
        '<tr><td>' + T('Artikelen', 'Items') + '</td><td class="r">' + items.length + '</td></tr><tr><td>' + T('Verkoopwaarde', 'Sales value') + '</td><td class="r">' + S.money(sval) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Bijbestellen', 'To reorder') + '</td><td class="r">' + nLow + '</td></tr></table><p class="sub" style="margin-top:10px">* ' + T('marge uitgaande van 10% BTW in de verkoopprijs', 'margin assuming 10% VAT in the selling price') + '</p>';
    };
    sk.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!F.name.value.trim()) { F.name.focus(); return; }
      items.push({ id: uid(), name: F.name.value.trim(), code: F.code.value.trim(), qty: S.num(F.qty.value), min: S.num(F.min.value), unit: F.unit.value.trim(), cost: S.num(F.cost.value), price: S.num(F.price.value), log: [] });
      ssave(); ['name', 'code', 'cost', 'price'].forEach(function (n) { F[n].value = ''; }); F.qty.value = '0'; F.name.focus(); srender();
    });
    document.getElementById('sk-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var id = b.getAttribute('data-id'), x = items.filter(function (y) { return y.id === id; })[0]; if (!x) return;
      var a = b.getAttribute('data-a'), inp = document.querySelector('[data-n="' + id + '"]'), n = S.num(inp && inp.value);
      if (a === 'del') { if (!window.confirm(T('Artikel verwijderen?', 'Delete item?'))) return; items = items.filter(function (y) { return y !== x; }); }
      else {
        if (!n && a !== 'set') { inp.focus(); return; }
        if (a === 'in') x.qty += n; if (a === 'out') x.qty -= n; if (a === 'set') x.qty = n;
        (x.log = x.log || []).push([S.today(), a, n]); x.log = x.log.slice(-50);
      }
      ssave(); srender();
    });
    document.getElementById('sk-q').addEventListener('input', srender);
    document.getElementById('sk-low').onclick = function () { low = !low; this.setAttribute('aria-pressed', low); srender(); };
    document.getElementById('sk-csv').onclick = function () {
      S.download(S.csv([[T('Artikel', 'Item'), 'Code', T('Voorraad', 'Stock'), T('Eenheid', 'Unit'), 'Minimum', T('Inkoopprijs', 'Cost'), T('Verkoopprijs', 'Price'), T('Waarde', 'Value')]]
        .concat(items.map(function (x) { return [x.name, x.code, S.fmt(x.qty, 2), x.unit, S.fmt(x.min, 0), S.fmt(x.cost), S.fmt(x.price), S.fmt(x.qty * x.cost)]; }))), 'voorraad.csv', 'text/csv;charset=utf-8');
    };
    document.getElementById('sk-order').onclick = function () {
      var lowItems = items.filter(isLow);
      if (!lowItems.length) { window.alert(T('Er is niets bijna op.', 'Nothing is running low.')); return; }
      S.store.set('carry', { to: 'purchaseorder', lines: lowItems.map(function (x) { return { d: x.name + (x.code ? ' (' + x.code + ')' : ''), q: Math.max(1, x.min * 2 - x.qty), p: x.cost ? String(x.cost) : '', v: '10' }; }) });
      location.href = S.nl ? '/inkooporder-maken' : '/en/purchase-order';
    };
    document.getElementById('sk-backup').onclick = function () { backup('stock', 'voorraad', items); };
    restore(document.getElementById('sk-restore'), function (d) { merge(items, d); ssave(); srender(); });
    srender();
  }

  // ---------------------------------------------------------------- cash flow
  var cf = document.getElementById('cf');
  if (cf) {
    var CK = 'cashflow', rowsBox = document.getElementById('cf-rows');
    var EX = [[T('Omzet', 'Sales'), 'in', 75000, 'm', 1], [T('Huur', 'Rent'), 'out', 12000, 'm', 1], [T('Lonen', 'Wages'), 'out', 30000, 'm', 1],
      [T('Inkoop', 'Purchases'), 'out', 15000, 'm', 1], [T('Stroom, water, internet', 'Power, water, internet'), 'out', 4000, 'm', 1], [T('Nieuwe koelkast', 'New fridge'), 'out', 25000, 'o', 3], [T('Verzekering', 'Insurance'), 'out', 9000, 'y', 6]];
    var st = S.store.get(CK, null);
    cf.querySelector('[name=m0]').value = (st && st.m0) || S.today().slice(0, 7);
    if (st && st.start !== undefined) cf.querySelector('[name=start]').value = st.start;
    var FREQ = [['m', T('elke maand', 'monthly')], ['q', T('elk kwartaal', 'quarterly')], ['y', T('per jaar', 'yearly')], ['o', T('eenmalig', 'once')]];
    var addRow = function (r) {
      var d = document.createElement('div');
      d.className = 'cf-row';
      d.innerHTML = '<input name="n" aria-label="' + T('Omschrijving', 'Description') + '" placeholder="' + T('Omschrijving', 'Description') + '">' +
        '<select name="t" aria-label="' + T('Soort', 'Type') + '"><option value="in">' + T('Inkomst', 'Income') + '</option><option value="out">' + T('Uitgave', 'Expense') + '</option></select>' +
        '<input name="a" inputmode="decimal" aria-label="' + T('Bedrag', 'Amount') + '" placeholder="SRD">' +
        '<select name="f" aria-label="' + T('Hoe vaak', 'How often') + '">' + FREQ.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('') + '</select>' +
        '<select name="s" aria-label="' + T('Vanaf maand', 'From month') + '">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (i) { return '<option value="' + i + '">' + T('vanaf mnd ', 'from mo ') + i + '</option>'; }).join('') + '</select>' +
        '<button type="button" class="x" aria-label="' + T('Verwijderen', 'Remove') + '">&times;</button>';
      d.querySelector('[name=n]').value = r[0]; d.querySelector('[name=t]').value = r[1]; d.querySelector('[name=a]').value = r[2] === '' ? '' : S.fmt(r[2], 0);
      d.querySelector('[name=f]').value = r[3]; d.querySelector('[name=s]').value = r[4];
      d.querySelector('.x').onclick = function () { d.remove(); calc(); };
      rowsBox.appendChild(d);
    };
    ((st && st.rows) || EX).forEach(addRow);
    var months = function () {
      var m0 = cf.querySelector('[name=m0]').value || S.today().slice(0, 7), y = +m0.slice(0, 4), m = +m0.slice(5, 7) - 1;
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { return new Date(y, m + i, 15).toLocaleDateString(S.nl ? 'nl-NL' : 'en-GB', { month: 'short', year: '2-digit' }); });
    };
    var res = [];
    var calc = function () {
      var rows = S.$$('.cf-row', rowsBox).map(function (d) { return [d.querySelector('[name=n]').value, d.querySelector('[name=t]').value, S.num(d.querySelector('[name=a]').value), d.querySelector('[name=f]').value, +d.querySelector('[name=s]').value]; });
      var bal = S.num(cf.querySelector('[name=start]').value), M = months(), low = null, lowI = -1;
      res = M.map(function (lab, i) {
        var inn = 0, out = 0;
        rows.forEach(function (r) {
          var k = i + 1 - r[4];
          var hit = k >= 0 && (r[3] === 'm' || (r[3] === 'q' && k % 3 === 0) || (r[3] === 'y' && k % 12 === 0) || (r[3] === 'o' && k === 0));
          if (hit) { if (r[1] === 'in') inn += r[2]; else out += r[2]; }
        });
        bal += inn - out;
        if (low === null || bal < low) { low = bal; lowI = i; }
        return [lab, inn, out, inn - out, bal];
      });
      document.getElementById('cf-table').innerHTML = '<table class="tbl stack"><thead><tr><th>' + T('Maand', 'Month') + '</th><th class="r">' + T('In', 'In') + '</th><th class="r">' + T('Uit', 'Out') + '</th><th class="r">' + T('Saldo', 'Balance') + '</th></tr></thead><tbody>' +
        res.map(function (r) { return '<tr><td data-l="">' + r[0] + '</td><td class="r" data-l="' + T('In', 'In') + '">' + S.fmt(r[1], 0) + '</td><td class="r" data-l="' + T('Uit', 'Out') + '">' + S.fmt(r[2], 0) + '</td><td class="r" data-l="' + T('Saldo', 'Balance') + '"' + (r[4] < 0 ? ' style="color:var(--down);font-weight:700"' : '') + '>' + S.fmt(r[4], 0) + '</td></tr>'; }).join('') + '</tbody></table>';
      var end = res[11][4], neg = res.filter(function (r) { return r[4] < 0; });
      document.getElementById('cf-out').innerHTML = '<div class="sub">' + T('Saldo na 12 maanden', 'Balance after 12 months') + '</div><div class="big tnum">' + S.money(end) + '</div><table>' +
        '<tr><td>' + T('Laagste saldo', 'Lowest balance') + ' (' + (res[lowI] ? res[lowI][0] : '') + ')</td><td class="r">' + S.money(low) + '</td></tr>' +
        '<tr><td>' + T('Gemiddeld per maand', 'Average per month') + '</td><td class="r">' + S.money(res.reduce(function (s, r) { return s + r[3]; }, 0) / 12) + '</td></tr></table>' +
        (neg.length ? '<p class="sub" style="margin-top:12px;color:#b2341b">' + T('Je saldo komt onder nul in ', 'Your balance goes below zero in ') + neg[0][0] + '. ' + T('Plan uitgaven anders, vraag aanbetalingen of regel op tijd een krediet.', 'Move expenses, ask for deposits or arrange credit in time.') + '</p>' : '<p class="sub" style="margin-top:12px">' + T('Je saldo blijft het hele jaar boven nul.', 'Your balance stays above zero all year.') + '</p>');
      S.store.set(CK, { start: cf.querySelector('[name=start]').value, m0: cf.querySelector('[name=m0]').value, rows: rows });
    };
    cf.addEventListener('input', calc); cf.addEventListener('change', calc);
    document.getElementById('cf-add').onclick = function () { addRow(['', 'out', '', 'm', 1]); calc(); };
    document.getElementById('cf-reset').onclick = function () { rowsBox.innerHTML = ''; EX.forEach(addRow); calc(); };
    document.getElementById('cf-csv').onclick = function () {
      S.download(S.csv([[T('Maand', 'Month'), T('In', 'In'), T('Uit', 'Out'), T('Netto', 'Net'), T('Saldo', 'Balance')]].concat(res.map(function (r) { return [r[0], S.fmt(r[1]), S.fmt(r[2]), S.fmt(r[3]), S.fmt(r[4])]; }))), 'kasstroom.csv', 'text/csv;charset=utf-8');
    };
    calc();
  }
})();
