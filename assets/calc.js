/* Calculators for surinamebusiness.com. Parameters come from window.SB (set by the page from facts.py). */
(function () {
  var SB = window.SB || {};
  var lang = document.documentElement.lang.slice(0, 2);
  var nf = new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(x) { return 'SRD ' + nf.format(Math.round(x * 100) / 100); }
  function num(v) {
    if (typeof v === 'number') return v;
    v = String(v || '').trim().replace(/\s/g, '');
    if (!v) return 0;
    // accept 15.000,50 (nl) and 15,000.50 (en) and plain 15000.5
    if (/,\d{1,2}$/.test(v)) v = v.replace(/\./g, '').replace(',', '.');
    else v = v.replace(/,/g, '');
    var n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }
  function bands(amount, brackets) {
    // brackets: [[upper|null, rate], ...] with uppers as band widths cumulative
    var tax = 0, lower = 0, rows = [];
    for (var i = 0; i < brackets.length; i++) {
      var upper = brackets[i][0], rate = brackets[i][1];
      var top = upper === null ? Infinity : upper;
      var part = Math.max(0, Math.min(amount, top) - lower);
      if (part > 0) { tax += part * rate; rows.push([rate, part, part * rate]); }
      lower = top;
      if (amount <= top) break;
    }
    return { tax: tax, rows: rows };
  }
  function salary(gross, pensionPct, aov, allowances) {
    var T = SB.tax;
    var forfait = Math.min(gross * T.forfait_pct, T.forfait_max_month);
    var pension = gross * (pensionPct / 100);
    var zuiver = Math.max(0, gross - forfait - pension);
    var taxable = Math.max(0, zuiver - T.free_month);
    var b = bands(taxable, T.brackets_month);
    var aovAmt = aov ? zuiver * T.aov_pct : 0;
    var net = gross - pension - b.tax - aovAmt + (allowances || 0);
    return { gross: gross, forfait: forfait, pension: pension, zuiver: zuiver, taxable: taxable,
             tax: b.tax, rows: b.rows, aov: aovAmt, allowances: allowances || 0, net: net };
  }
  function grossFromNet(target, pensionPct, aov, allowances) {
    var lo = 0, hi = Math.max(1000, target * 3);
    for (var i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2;
      if (salary(mid, pensionPct, aov, allowances).net < target) lo = mid; else hi = mid;
    }
    return hi;
  }
  window.SBcalc = { money: money, num: num, bands: bands, salary: salary, grossFromNet: grossFromNet, nf: nf };

  // ---- salary page
  var sf = document.getElementById('salary-form');
  if (sf) {
    var mode = 'g2n';
    var out = document.getElementById('salary-out');
    var t = SB.t || {};
    function pct(r) { return Math.round(r * 100) + '%'; }
    function render() {
      var amount = num(sf.amount.value), pen = num(sf.pension.value), alw = num(sf.allow.value);
      var aov = sf.aov.checked;
      var r = mode === 'g2n' ? salary(amount, pen, aov, alw) : salary(grossFromNet(amount, pen, aov, alw), pen, aov, alw);
      var rows = '';
      rows += '<tr><td>' + t.gross + '</td><td class="r">' + money(r.gross) + '</td></tr>';
      if (r.pension) rows += '<tr><td>' + t.pension + '</td><td class="r">- ' + money(r.pension) + '</td></tr>';
      rows += '<tr><td>' + t.tax + '</td><td class="r">- ' + money(r.tax) + '</td></tr>';
      if (aov) rows += '<tr><td>AOV 4%</td><td class="r">- ' + money(r.aov) + '</td></tr>';
      if (r.allowances) rows += '<tr><td>' + t.allow + '</td><td class="r">+ ' + money(r.allowances) + '</td></tr>';
      rows += '<tr class="tot"><td>' + t.net + '</td><td class="r">' + money(r.net) + '</td></tr>';
      var steps = '<tr><td>' + t.forfait + '</td><td class="r">' + money(r.forfait) + '</td></tr>' +
        '<tr><td>' + t.zuiver + '</td><td class="r">' + money(r.zuiver) + '</td></tr>' +
        '<tr><td>' + t.free + '</td><td class="r">' + money(SB.tax.free_month) + '</td></tr>' +
        '<tr><td>' + t.taxable + '</td><td class="r">' + money(r.taxable) + '</td></tr>';
      r.rows.forEach(function (b) { steps += '<tr><td>' + pct(b[0]) + ' ' + t.over + ' ' + money(b[1]) + '</td><td class="r">' + money(b[2]) + '</td></tr>'; });
      var eff = r.gross > 0 ? ((r.tax + r.aov) / r.gross * 100) : 0;
      out.innerHTML = '<div class="sub">' + (mode === 'g2n' ? t.netLabel : t.grossLabel) + '</div>' +
        '<div class="big tnum">' + money(mode === 'g2n' ? r.net : r.gross) + '</div>' +
        '<div class="sub">' + t.perMonth + ' &middot; ' + t.eff + ' ' + nf.format(eff) + '%</div>' +
        '<table>' + rows + '</table>' +
        '<details style="margin-top:12px"><summary>' + t.how + '</summary><table>' + steps + '</table></details>';
    }
    sf.addEventListener('input', render);
    sf.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        mode = b.getAttribute('data-mode');
        sf.querySelectorAll('[data-mode]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        document.getElementById('amount-label').textContent = mode === 'g2n' ? t.inGross : t.inNet;
        render();
      });
    });
    var q = new URLSearchParams(location.search).get('bruto') || new URLSearchParams(location.search).get('gross');
    if (q) sf.amount.value = q;
    render();
  }

  // ---- overtime page
  var of = document.getElementById('ot-form');
  if (of) {
    var ot = SB.t || {};
    function renderOT() {
      var hourly = num(of.hourly.value), h150 = num(of.h150.value), h200 = num(of.h200.value), h300 = num(of.h300.value);
      var pay150 = hourly * 1.5 * h150, pay200 = hourly * 2 * h200, pay300 = hourly * 3 * h300;
      var total = pay150 + pay200 + pay300;
      var b = bands(total, SB.tax.overtime_brackets_month);
      var aov = of.aov.checked ? total * SB.tax.aov_pct : 0;
      var net = total - b.tax - aov;
      var rows = '';
      if (h150) rows += '<tr><td>' + h150 + ' ' + ot.hours + ' &times; 150%</td><td class="r">' + money(pay150) + '</td></tr>';
      if (h200) rows += '<tr><td>' + h200 + ' ' + ot.hours + ' &times; 200%</td><td class="r">' + money(pay200) + '</td></tr>';
      if (h300) rows += '<tr><td>' + h300 + ' ' + ot.hours + ' &times; 300%</td><td class="r">' + money(pay300) + '</td></tr>';
      rows += '<tr><td>' + ot.gross + '</td><td class="r">' + money(total) + '</td></tr>';
      b.rows.forEach(function (x) { rows += '<tr><td>' + ot.tax + ' ' + Math.round(x[0] * 100) + '% ' + ot.over + ' ' + money(x[1]) + '</td><td class="r">- ' + money(x[2]) + '</td></tr>'; });
      if (aov) rows += '<tr><td>AOV 4%</td><td class="r">- ' + money(aov) + '</td></tr>';
      rows += '<tr class="tot"><td>' + ot.net + '</td><td class="r">' + money(net) + '</td></tr>';
      document.getElementById('ot-out').innerHTML = '<div class="sub">' + ot.netLabel + '</div><div class="big tnum">' + money(net) + '</div><table>' + rows + '</table>';
    }
    of.addEventListener('input', renderOT);
    renderOT();
  }

  // ---- VAT page
  var vf = document.getElementById('vat-form');
  if (vf) {
    var vt = SB.t || {};
    function renderVAT() {
      var a = num(vf.amount.value), rate = num(vf.rate.value) / 100, incl = vf.dir.value === 'incl';
      var ex = incl ? a / (1 + rate) : a, vat = ex * rate, inc = ex + vat;
      document.getElementById('vat-out').innerHTML = '<div class="sub">' + (incl ? vt.exLabel : vt.incLabel) + '</div><div class="big tnum">' + money(incl ? ex : inc) + '</div>' +
        '<table><tr><td>' + vt.ex + '</td><td class="r">' + money(ex) + '</td></tr><tr><td>' + vt.vat + ' ' + Math.round(rate * 100) + '%</td><td class="r">' + money(vat) + '</td></tr><tr class="tot"><td>' + vt.inc + '</td><td class="r">' + money(inc) + '</td></tr></table>';
    }
    vf.addEventListener('input', renderVAT);
    vf.addEventListener('change', renderVAT);
    renderVAT();
  }

  // ---- working days page
  var wf = document.getElementById('wd-form');
  if (wf) {
    var wt = SB.t || {};
    var hol = {};
    (SB.holidays || []).forEach(function (d) { hol[d] = 1; });
    function iso(d) { return d.toISOString().slice(0, 10); }
    function renderWD() {
      var a = wf.from.value, b = wf.to.value;
      var out = document.getElementById('wd-out');
      if (!a || !b) { out.innerHTML = ''; return; }
      var d = new Date(a + 'T12:00:00Z'), end = new Date(b + 'T12:00:00Z');
      if (end < d) { var tmp = d; d = end; end = tmp; }
      var work = 0, weekend = 0, holi = 0, sat = wf.sat.checked, n = 0;
      while (d <= end && n < 4000) {
        var w = d.getUTCDay(), k = iso(d);
        var isWeekend = w === 0 || (w === 6 && !sat);
        if (isWeekend) weekend++; else if (hol[k]) holi++; else work++;
        d.setUTCDate(d.getUTCDate() + 1); n++;
      }
      out.innerHTML = '<div class="sub">' + wt.result + '</div><div class="big tnum">' + work + '</div>' +
        '<table><tr><td>' + wt.total + '</td><td class="r">' + n + '</td></tr><tr><td>' + wt.weekend + '</td><td class="r">' + weekend + '</td></tr><tr><td>' + wt.hol + '</td><td class="r">' + holi + '</td></tr></table>';
    }
    wf.addEventListener('input', renderWD);
    renderWD();
  }

  // ---- list filters (tenders, jobs, news)
  document.querySelectorAll('[data-filter-list]').forEach(function (box) {
    var list = document.getElementById(box.getAttribute('data-filter-list'));
    var input = box.querySelector('input'), chips = box.querySelectorAll('.chip');
    var src = 'all';
    var countEl = document.getElementById(box.getAttribute('data-count'));
    function apply() {
      var q = (input && input.value || '').toLowerCase().trim(), shown = 0;
      list.querySelectorAll('li[data-src]').forEach(function (li) {
        var ok = (src === 'all' || li.getAttribute('data-src') === src) && (!q || li.textContent.toLowerCase().indexOf(q) >= 0);
        li.hidden = !ok; if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
    }
    if (input) input.addEventListener('input', apply);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        src = c.getAttribute('data-v');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
        apply();
      });
    });
    apply();
  });
})();
