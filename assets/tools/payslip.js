(function () {
  var S = window.SBT, T = S.T, f = document.getElementById('ps');
  if (!f) return;
  var out = document.getElementById('doc'), tax = S.SB.tax;
  var biz = S.store.get('biz', {});
  f.elements.er.value = S.store.get('ps:er', biz.s_name || '');
  f.elements.period.value = S.today().slice(0, 7);
  function render() {
    var v = function (n) { return S.esc(f.elements[n].value.trim()); }, n = function (k) { return S.num(f.elements[k].value); };
    var base = n('base'), allow = n('allow'), ot = n('ot'), free = n('free'), ded = n('ded'), aov = f.elements.aov.checked;
    var r = S.salary(base + allow, n('pen'), aov);
    var otTax = S.bands(ot, tax.overtime_brackets_month), otAov = aov ? ot * tax.aov_pct : 0;
    var gross = base + allow + ot;
    var net = gross - r.pension - r.tax - r.aov - otTax - otAov + free - ded;
    var m = function (x) { return S.fmt(x); };
    var per = f.elements.period.value ? new Date(f.elements.period.value + '-15T12:00:00').toLocaleDateString(S.nl ? 'nl-NL' : 'en-GB', { month: 'long', year: 'numeric' }) : '';
    var row = function (a, b, c) { return '<tr><td>' + a + '</td><td class="r">' + (b === '' ? '' : m(b)) + '</td><td class="r">' + (c === '' ? '' : m(c)) + '</td></tr>'; };
    var h = '<div class="ph"><div>' + (biz.logo ? '<img src="' + biz.logo + '" alt=""><br>' : '') + '<b>' + (v('er') || T('Werkgever', 'Employer')) + '</b></div><div style="text-align:right"><h3>' + T('Loonstrook', 'Payslip') + '</h3><div class="pm">' + S.esc(per) + '</div></div></div>' +
      '<div class="pp"><div><div class="lbl">' + T('Werknemer', 'Employee') + '</div><b>' + (v('ee') || '&nbsp;') + '</b><br>' + v('fn') + '</div><div><div class="lbl">' + T('Personeelsnummer', 'Staff number') + '</div>' + (v('pid') || '-') + '</div></div>' +
      '<table><thead><tr><th>' + T('Omschrijving', 'Description') + '</th><th class="r">' + T('Bij', 'Earnings') + '</th><th class="r">' + T('Af', 'Deductions') + '</th></tr></thead><tbody>' +
      row(T('Basisloon', 'Basic wage'), base, '') + (allow ? row(T('Belaste toelagen', 'Taxable allowances'), allow, '') : '') + (ot ? row(T('Overwerk', 'Overtime'), ot, '') : '') +
      (r.pension ? row(T('Pensioenpremie', 'Pension premium') + ' ' + S.fmt(n('pen'), 1) + '%', '', r.pension) : '') +
      row(T('Loonbelasting', 'Wage tax'), '', r.tax) + (ot ? row(T('Loonbelasting overwerk', 'Wage tax on overtime'), '', otTax) : '') +
      (aov ? row('AOV 4%', '', r.aov + otAov) : '') + (free ? row(T('Onbelaste vergoedingen', 'Tax-free reimbursements'), free, '') : '') +
      (ded ? row(T('Overige inhoudingen', 'Other deductions'), '', ded) : '') +
      '</tbody></table><table class="tots"><tbody><tr><td>' + T('Bruto loon', 'Gross pay') + '</td><td class="r">' + S.money(gross) + '</td></tr>' +
      '<tr class="g"><td>' + T('Netto uit te betalen', 'Net pay') + '</td><td class="r">' + S.money(net) + '</td></tr></tbody></table>' +
      '<div class="pn" style="font-size:.78rem">' + T('Zuiver loon', 'Net taxable wage') + ': ' + S.money(r.zuiver) + ' &middot; ' + T('Belastbaar na belastingvrije som', 'Taxable after tax-free amount') + ': ' + S.money(r.taxable) + '</div>' +
      (v('pay') ? '<div class="pn">' + T('Uitbetaald op', 'Paid to') + ': ' + v('pay') + '</div>' : '') +
      '<div class="pf">' + T('Berekend met de loonbelasting tarieven 2026', 'Calculated with the 2026 wage tax rates') + '</div>';
    out.innerHTML = h;
    S.store.set('ps:er', f.elements.er.value);
  }
  f.addEventListener('input', render); f.addEventListener('change', render);
  render();
})();
