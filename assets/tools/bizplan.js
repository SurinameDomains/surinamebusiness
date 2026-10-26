/* Business plan template: chapters with hints, a small financial plan (investment, financing, annuity loan payment,
   monthly result, break-even revenue), autosave on this device, print to PDF and copy as plain text.
   Own code, no libraries. Nothing is sent anywhere by this script. */
(function () {
  var S = window.SBT, T = S.T, E = S.esc;
  var form = document.getElementById('bp');
  if (!form) return;
  var KEY = 'bizplan', f = form.elements;
  var out = document.getElementById('bp-out'), sum = document.getElementById('bp-sum');
  var FIELDS = ['b_name', 'b_owner', 'b_date', 'b_contact', 'b_for', 'cur', 'own', 'loan', 'rate', 'term', 'varpct'];
  var CH = S.$$('textarea[data-ch]', form);
  var KINDS = ['inv', 'fin', 'rev', 'cost'];
  var DEF = {
    inv: [T('Inventaris en machines', 'Equipment and machinery'), T('Verbouwing en inrichting', 'Renovation and fit-out'),
      T('Vervoermiddel', 'Vehicle'), T('Eerste voorraad', 'Opening stock'),
      T('Startkosten (KKF, notaris, vergunningen)', 'Start-up costs (KKF, notary, licences)'), T('Werkkapitaal (eerste maanden)', 'Working capital (first months)')],
    fin: [T('Familie of partner', 'Family or partner'), T('Leverancierskrediet', 'Supplier credit'), T('Subsidie of grant', 'Grant')],
    rev: [T('Omzet product of dienst 1', 'Sales of product or service 1'), T('Omzet product of dienst 2', 'Sales of product or service 2')],
    cost: [T('Huur', 'Rent'), T('Lonen inclusief werkgeverslasten', 'Wages including employer costs'), T('Eigen loon ondernemer', 'Owner\'s own wage'),
      T('Stroom, water, internet, telefoon', 'Power, water, internet, phone'), T('Verzekeringen', 'Insurance'), T('Boekhouding', 'Bookkeeping'),
      T('Marketing', 'Marketing'), T('Onderhoud en overige kosten', 'Maintenance and other costs')]
  };
  var NAME = {
    inv: T('Omschrijving investering', 'Investment item'), fin: T('Omschrijving financiering', 'Financing source'),
    rev: T('Omschrijving omzet', 'Revenue item'), cost: T('Omschrijving vaste kost', 'Fixed cost item')
  };
  var FOR = {
    bank: T('Kredietaanvraag bij een bank', 'Loan application at a bank'), nob: T('Aanvraag bij de NOB', 'Application to the NOB'),
    investor: T('Voor investeerders en partners', 'For investors and partners'), grant: T('Aanvraag subsidie of programma', 'Grant or programme application'),
    permit: T('Aanvraag vergunning of faciliteit', 'Permit or incentive application')
  };

  // ---------------------------------------------------------------- line rows (description + amount)
  var seq = 0;
  function addRow(kind, desc, amt) {
    var box = document.getElementById(kind + '-rows');
    var i = ++seq, n = box.children.length + 1;
    var d = document.createElement('div');
    d.setAttribute('data-row', kind);
    d.style.cssText = 'display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:8px;margin-top:8px';
    d.innerHTML = '<input name="d' + i + '" data-k="d" aria-label="' + E(NAME[kind] + ' ' + n) + '">' +
      '<input name="a' + i + '" data-k="a" inputmode="decimal" aria-label="' + E(T('Bedrag', 'Amount') + ' ' + n) + '" placeholder="0">';
    d.querySelector('[data-k=d]').value = desc || '';
    d.querySelector('[data-k=a]').value = amt || '';
    box.appendChild(d);
    return d;
  }
  function rows(kind) {
    return S.$$('[data-row=' + kind + ']', form).map(function (d) {
      return { d: d.querySelector('[data-k=d]').value, a: d.querySelector('[data-k=a]').value };
    });
  }
  function filled(kind) {
    return rows(kind).map(function (r) { return { d: r.d.trim(), v: S.num(r.a) }; }).filter(function (r) { return r.v !== 0; });
  }
  function total(list) { return list.reduce(function (s, r) { return s + r.v; }, 0); }

  // ---------------------------------------------------------------- state
  function state() {
    var o = { ch: {}, rows: {} };
    FIELDS.forEach(function (k) { o[k] = f[k].value; });
    CH.forEach(function (t) { o.ch[t.id] = t.value; });
    KINDS.forEach(function (k) { o.rows[k] = rows(k).filter(function (r) { return r.d.trim() || r.a.trim(); }); });
    return o;
  }
  function load(st) {
    st = st || {};
    FIELDS.forEach(function (k) { f[k].value = st[k] !== undefined ? st[k] : ''; });
    if (!f.cur.value) f.cur.value = 'SRD';
    if (!f.b_date.value) f.b_date.value = S.today();
    CH.forEach(function (t) { t.value = (st.ch && st.ch[t.id]) || ''; });
    KINDS.forEach(function (k) {
      document.getElementById(k + '-rows').innerHTML = '';
      var saved = st.rows && st.rows[k];
      if (saved && saved.length) {
        saved.forEach(function (r) { addRow(k, r.d, r.a); });
        for (var i = saved.length; i < 2; i++) addRow(k, '', '');
      } else DEF[k].forEach(function (d) { addRow(k, d, ''); });
    });
  }

  // ---------------------------------------------------------------- calculations
  function calc() {
    var cur = f.cur.value || 'SRD';
    var inv = filled('inv'), fin = filled('fin'), rev = filled('rev'), cost = filled('cost');
    var own = S.num(f.own.value), loan = Math.max(0, S.num(f.loan.value)), ratePct = S.num(f.rate.value);
    var n = Math.max(0, Math.round(S.num(f.term.value))), r = ratePct / 100 / 12;
    var pay = 0;
    if (loan > 0 && n > 0) pay = r > 0 ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
    var invT = total(inv), finO = total(fin), finT = own + loan + finO;
    var revT = total(rev), varPct = S.num(f.varpct.value), varC = revT * varPct / 100, gross = revT - varC;
    var fixT = total(cost), result = gross - fixT - pay;
    var be = varPct < 100 ? (fixT + pay) / (1 - varPct / 100) : null;
    return {
      cur: cur, inv: inv, fin: fin, rev: rev, cost: cost, own: own, loan: loan, rate: ratePct, n: n, pay: pay,
      interest: pay * n - loan, invT: invT, finO: finO, finT: finT, gap: finT - invT, ownPct: invT > 0 ? own / invT * 100 : null,
      revT: revT, varPct: varPct, varC: varC, gross: gross, fixT: fixT, result: result, be: be
    };
  }
  function M(x, c) { return S.money(x, c); }
  function N(x) { return S.fmt(x, 0); }
  function pct(x) { return S.fmt(x, x % 1 ? 1 : 0) + '%'; }
  function warnings(c) {
    var w = [];
    if (c.invT > 0 && c.gap < -0.005) w.push(T('Je financiering dekt de investering niet: er ontbreekt ', 'Your financing does not cover the investment: you are short ') + M(-c.gap, c.cur) + '.');
    if (c.invT > 0 && c.gap > 0.005) w.push(T('Je financiering is ' + M(c.gap, c.cur) + ' hoger dan de investering. Zet dat als werkkapitaal in je investeringsbegroting.', 'Your financing is ' + M(c.gap, c.cur) + ' more than the investment. Put it in your investment budget as working capital.'));
    if (c.loan > 0 && !(c.n > 0)) w.push(T('Vul de looptijd van de lening in maanden in.', 'Enter the loan term in months.'));
    if (c.varPct >= 100) w.push(T('Je variabele kosten zijn 100% van de omzet of meer: elke verkoop kost je geld. Verhoog je prijs of verlaag je inkoop.', 'Your variable costs are 100% of revenue or more: every sale loses money. Raise your price or cut your purchase cost.'));
    if (c.revT > 0 && c.result < 0) w.push(T('Met deze cijfers maak je elke maand ' + M(-c.result, c.cur) + ' verlies.', 'With these figures you lose ' + M(-c.result, c.cur) + ' every month.'));
    return w;
  }

  // ---------------------------------------------------------------- summary next to the form
  var lastSum = '';
  function renderSum(c) {
    var done = CH.filter(function (t) { return t.value.trim(); }).length;
    var tr = function (a, b, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + a + '</td><td class="r">' + b + '</td></tr>'; };
    var h = '<div class="eyebrow">' + T('Over per maand, vóór belasting', 'Left per month, before tax') + '</div>' +
      '<div class="big tnum">' + M(c.result, c.cur) + '</div>' +
      '<div class="sub">' + T('na inkoop, vaste kosten en maandlast lening', 'after purchases, fixed costs and loan payment') + '</div>' +
      '<table>' +
      tr(T('Investering', 'Investment'), M(c.invT, c.cur)) +
      tr(T('Financiering', 'Financing'), M(c.finT, c.cur)) +
      (c.ownPct !== null ? tr(T('Eigen inbreng', 'Own contribution'), pct(c.ownPct)) : '') +
      tr(T('Maandlast lening', 'Loan payment per month'), M(c.pay, c.cur)) +
      tr(T('Omzet per maand', 'Revenue per month'), M(c.revT, c.cur)) +
      tr(T('Break-even omzet per maand', 'Break-even revenue per month'), c.be === null ? '–' : M(c.be, c.cur), 'tot') +
      '</table>' +
      warnings(c).map(function (x) { return '<p class="sub">' + E(x) + '</p>'; }).join('') +
      '<p class="sub">' + T('Hoofdstukken ingevuld: ', 'Chapters written: ') + done + ' / ' + CH.length + '</p>';
    if (h !== lastSum) { sum.innerHTML = h; lastSum = h; }
  }

  // ---------------------------------------------------------------- the plan as a document
  function label(t) { var l = form.querySelector('label[for=' + t.id + ']'); return l ? l.textContent.trim() : ''; }
  function chap(t) {
    var v = t.value.trim();
    return v ? '<h4 style="margin:20px 0 4px;font-size:1.08rem;color:var(--pc,#1f2251)">' + E(label(t)) + '</h4><p style="margin:0;white-space:pre-wrap">' + E(v) + '</p>' : '';
  }
  function H(t) { return '<h4 style="margin:20px 0 6px;font-size:1.08rem;color:var(--pc,#1f2251)">' + E(t) + '</h4>'; }
  function table(head, list, totLabel, tot) {
    return '<table><thead><tr><th>' + head + '</th><th class="r">' + T('Bedrag', 'Amount') + '</th></tr></thead><tbody>' +
      list.map(function (r) { return '<tr><td>' + E(r[0]) + '</td><td class="r">' + E(r[1]) + '</td></tr>'; }).join('') +
      '</tbody></table>' + (totLabel ? '<table class="tots"><tr class="g"><td>' + totLabel + '</td><td class="r">' + tot + '</td></tr></table>' : '');
  }
  function renderDoc(c) {
    var byId = {}; CH.forEach(function (t) { byId[t.id] = t; });
    var name = f.b_name.value.trim(), meta = [];
    if (f.b_owner.value.trim()) meta.push(E(f.b_owner.value.trim()));
    if (f.b_contact.value.trim()) meta.push(E(f.b_contact.value.trim()));
    if (f.b_date.value) meta.push(E(S.dateLong(f.b_date.value)));
    var h = '<div class="ph"><div><div class="dh">' + T('Ondernemingsplan', 'Business plan') + '</div>' +
      (name ? '<div style="font-size:1.15rem;font-weight:650;margin-top:4px">' + E(name) + '</div>' : '') +
      (FOR[f.b_for.value] ? '<div class="pm">' + E(FOR[f.b_for.value]) + '</div>' : '') + '</div>' +
      '<div class="pm">' + meta.join('<br>') + '</div></div>';
    ['c_sum', 'c_owner', 'c_idea', 'c_market', 'c_comp', 'c_mkt', 'c_org', 'c_staff', 'c_ops'].forEach(function (id) { if (byId[id]) h += chap(byId[id]); });

    var cur = c.cur, any = c.invT || c.finT || c.revT || c.fixT;
    if (any) {
      h += '<div style="margin-top:26px;padding-top:6px;border-top:2px solid var(--pc,#1f2251)"><div class="dh" style="font-size:1.3rem;margin-top:8px">' + T('Financieel plan', 'Financial plan') + '</div>' +
        '<div class="pm">' + T('Alle bedragen in ', 'All amounts in ') + E(cur) + T(', zonder BTW.', ', excluding VAT.') + '</div></div>';
      if (c.inv.length) h += H(T('Investeringsbegroting', 'Investment budget')) +
        table(T('Investering', 'Item'), c.inv.map(function (r) { return [r.d || '–', N(r.v)]; }), T('Totaal investering', 'Total investment'), M(c.invT, cur));
      var fl = [];
      if (c.own) fl.push([T('Eigen inbreng', 'Own contribution'), N(c.own)]);
      if (c.loan) fl.push([T('Lening', 'Loan') + (c.rate || c.n ? ' (' + [c.rate ? pct(c.rate) + T(' rente', ' interest') : '', c.n ? c.n + T(' maanden', ' months') : ''].filter(Boolean).join(', ') + ')' : ''), N(c.loan)]);
      c.fin.forEach(function (r) { fl.push([r.d || '–', N(r.v)]); });
      if (fl.length) {
        h += H(T('Financieringsplan', 'Financing plan')) + table(T('Bron', 'Source'), fl, T('Totaal financiering', 'Total financing'), M(c.finT, cur));
        if (c.invT) h += '<p class="pm" style="margin-top:6px">' + (Math.abs(c.gap) < 0.005 ? T('De financiering dekt de investering precies.', 'The financing covers the investment exactly.') :
          c.gap < 0 ? T('Nog te financieren: ', 'Still to be financed: ') + M(-c.gap, cur) : T('Overschot (werkkapitaal): ', 'Surplus (working capital): ') + M(c.gap, cur)) +
          (c.ownPct !== null ? ' &middot; ' + T('Eigen inbreng: ', 'Own contribution: ') + pct(c.ownPct) + T(' van de investering', ' of the investment') : '') + '</p>';
      }
      if (c.pay) h += H(T('Lening', 'Loan')) + '<table class="tots" style="margin:0;width:100%"><tbody>' +
        '<tr><td>' + T('Maandlast (rente en aflossing, annuïteit)', 'Monthly payment (interest and principal, annuity)') + '</td><td class="r">' + M(c.pay, cur) + '</td></tr>' +
        '<tr><td>' + T('Rente in de eerste maand', 'Interest in the first month') + '</td><td class="r">' + M(c.loan * c.rate / 1200, cur) + '</td></tr>' +
        '<tr><td>' + T('Totale rente over de looptijd', 'Total interest over the term') + '</td><td class="r">' + M(c.interest, cur) + '</td></tr></tbody></table>';
      if (c.revT || c.fixT) {
        h += H(T('Exploitatiebegroting', 'Operating budget')) +
          '<table><thead><tr><th>' + T('Post', 'Item') + '</th><th class="r">' + T('Per maand', 'Per month') + '</th><th class="r">' + T('Per jaar', 'Per year') + '</th></tr></thead><tbody>';
        var line = function (a, v, b) { return '<tr><td>' + (b ? '<b>' + a + '</b>' : a) + '</td><td class="r">' + (b ? '<b>' + N(v) + '</b>' : N(v)) + '</td><td class="r">' + (b ? '<b>' + N(v * 12) + '</b>' : N(v * 12)) + '</td></tr>'; };
        c.rev.forEach(function (r) { h += line(E(r.d || T('Omzet', 'Revenue')), r.v); });
        h += line(T('Totale omzet', 'Total revenue'), c.revT, 1);
        if (c.varPct) h += line(T('Inkoop en variabele kosten', 'Purchases and variable costs') + ' (' + pct(c.varPct) + ')', -c.varC);
        h += line(T('Brutomarge', 'Gross margin'), c.gross, 1);
        c.cost.forEach(function (r) { h += line(E(r.d || T('Vaste kost', 'Fixed cost')), -r.v); });
        if (c.pay) h += line(T('Maandlast lening', 'Loan payment'), -c.pay);
        h += line(T('Over vóór belasting', 'Left before tax'), c.result, 1) + '</tbody></table>';
        h += '<p class="pm" style="margin-top:6px">' + T('Break-even omzet: ', 'Break-even revenue: ') + (c.be === null ? T('niet te bereiken met deze inkoopkosten', 'not reachable with these purchase costs') : M(c.be, cur) + T(' per maand', ' per month')) +
          T('. Daarbij zijn inkoop, vaste kosten en de volledige maandlast van de lening gedekt.', '. At that level purchases, fixed costs and the full loan payment are covered.') + '</p>';
      }
    }
    if (byId.c_risk) h += chap(byId.c_risk);
    if (!CH.some(function (t) { return t.value.trim(); }) && !any && !name) {
      h += '<p class="pm" style="margin-top:18px">' + T('Je plan verschijnt hier zodra je begint met invullen.', 'Your plan appears here as soon as you start filling it in.') + '</p>';
    }
    h += '<div class="pf">' + T('Ondernemingsplan', 'Business plan') + (name ? ' ' + E(name) : '') + '</div>';
    out.innerHTML = h;
  }

  // ---------------------------------------------------------------- plain text
  function text(c) {
    var L = [], cur = c.cur, byId = {};
    CH.forEach(function (t) { byId[t.id] = t; });
    var line = function (a, b) { L.push(a + ': ' + b); };
    L.push(T('ONDERNEMINGSPLAN', 'BUSINESS PLAN') + (f.b_name.value.trim() ? ' ' + f.b_name.value.trim() : ''));
    [f.b_owner.value.trim(), f.b_contact.value.trim(), f.b_date.value ? S.dateLong(f.b_date.value) : '', FOR[f.b_for.value] || ''].forEach(function (x) { if (x) L.push(x); });
    var ch = function (id) { var t = byId[id]; if (t && t.value.trim()) { L.push('', label(t).toUpperCase(), t.value.trim()); } };
    ['c_sum', 'c_owner', 'c_idea', 'c_market', 'c_comp', 'c_mkt', 'c_org', 'c_staff', 'c_ops'].forEach(ch);
    if (c.invT || c.finT || c.revT || c.fixT) {
      L.push('', T('FINANCIEEL PLAN', 'FINANCIAL PLAN') + ' (' + cur + T(', zonder BTW)', ', excluding VAT)'));
      if (c.inv.length) { L.push('', T('Investeringsbegroting', 'Investment budget')); c.inv.forEach(function (r) { line('- ' + (r.d || '-'), M(r.v, cur)); }); line(T('Totaal investering', 'Total investment'), M(c.invT, cur)); }
      if (c.finT) {
        L.push('', T('Financieringsplan', 'Financing plan'));
        if (c.own) line('- ' + T('Eigen inbreng', 'Own contribution'), M(c.own, cur));
        if (c.loan) line('- ' + T('Lening', 'Loan') + (c.rate ? ', ' + pct(c.rate) : '') + (c.n ? ', ' + c.n + T(' maanden', ' months') : ''), M(c.loan, cur));
        c.fin.forEach(function (r) { line('- ' + (r.d || '-'), M(r.v, cur)); });
        line(T('Totaal financiering', 'Total financing'), M(c.finT, cur));
        if (c.invT && Math.abs(c.gap) >= 0.005) line(c.gap < 0 ? T('Nog te financieren', 'Still to be financed') : T('Overschot', 'Surplus'), M(Math.abs(c.gap), cur));
      }
      if (c.pay) { L.push(''); line(T('Maandlast lening (annuïteit)', 'Monthly loan payment (annuity)'), M(c.pay, cur)); line(T('Totale rente', 'Total interest'), M(c.interest, cur)); }
      if (c.revT || c.fixT) {
        L.push('', T('Exploitatiebegroting per maand', 'Operating budget per month'));
        c.rev.forEach(function (r) { line('- ' + (r.d || T('Omzet', 'Revenue')), M(r.v, cur)); });
        line(T('Totale omzet', 'Total revenue'), M(c.revT, cur));
        if (c.varPct) line(T('Inkoop en variabele kosten', 'Purchases and variable costs') + ' (' + pct(c.varPct) + ')', M(-c.varC, cur));
        c.cost.forEach(function (r) { line('- ' + (r.d || T('Vaste kost', 'Fixed cost')), M(-r.v, cur)); });
        if (c.pay) line('- ' + T('Maandlast lening', 'Loan payment'), M(-c.pay, cur));
        line(T('Over vóór belasting per maand', 'Left before tax per month'), M(c.result, cur));
        line(T('Over vóór belasting per jaar', 'Left before tax per year'), M(c.result * 12, cur));
        line(T('Break-even omzet per maand', 'Break-even revenue per month'), c.be === null ? '-' : M(c.be, cur));
      }
    }
    ch('c_risk');
    return L.join('\n');
  }

  // ---------------------------------------------------------------- wiring
  function update() {
    var c = calc();
    renderSum(c); renderDoc(c);
    S.store.set(KEY, state());
  }
  load(S.store.get(KEY, null));
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-add]');
    if (!b) return;
    var k = b.getAttribute('data-add'), d = addRow(k, '', '');
    d.querySelector('input').focus();
    update();
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-bp]');
    if (!b) return;
    var act = b.getAttribute('data-bp');
    if (act === 'copy') S.copy(text(calc()), b);
    if (act === 'reset') {
      if (!window.confirm(T('Alles wissen en een nieuw plan beginnen? Dit kun je niet ongedaan maken.', 'Clear everything and start a new plan? This cannot be undone.'))) return;
      S.store.del(KEY);
      load(null);
      var c = calc(); renderSum(c); renderDoc(c);
      f.b_name.focus();
    }
  });
  var c0 = calc(); renderSum(c0); renderDoc(c0);
})();
