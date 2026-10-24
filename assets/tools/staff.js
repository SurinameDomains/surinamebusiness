/* Staff tools: annual leave, timesheet, hourly wage. */
(function () {
  var S = window.SBT, T = S.T, Lb = S.SB.labour || {};

  // ---------------------------------------------------------------- annual leave (Vakantiewet)
  var vc = document.getElementById('vc');
  if (vc) {
    var vout = document.getElementById('vc-out');
    var vr = function () {
      var years = +vc.elements.years.value, wage = S.num(vc.elements.wage.value), dpw = +vc.elements.dpw.value;
      document.getElementById('months-wrap').hidden = years !== 0;
      var leaving = vc.elements.leaving.checked;
      document.getElementById('leave-wrap').hidden = !leaving;
      var days = years === 0 ? Math.min(12, Math.max(0, Math.floor(S.num(vc.elements.months.value)))) * Lb.per_month_first_year
        : Math.min(Lb.max_days, Lb.first_year_days + Lb.extra_per_year * (years - 1));
      var daily = wage * 12 / 52 / dpw;
      var allowance = daily * Lb.allowance_pct * days;
      var h = '<div class="sub">' + T('Vakantiedagen per jaar', 'Leave days per year') + '</div><div class="big tnum">' + days + ' ' + T('dagen', 'days') + '</div>' +
        '<table><tr><td>' + T('Dagloon', 'Daily wage') + ' (' + T('maandloon', 'monthly wage') + ' &times; 12 / 52 / ' + dpw + ')</td><td class="r">' + S.money(daily) + '</td></tr>' +
        '<tr><td>' + T('Loon tijdens vakantie', 'Wage during leave') + '</td><td class="r">' + S.money(daily * days) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Vakantietoelage (50%)', 'Leave allowance (50%)') + '</td><td class="r">' + S.money(allowance) + '</td></tr></table>';
      if (leaving) {
        var m = Math.min(12, Math.max(0, Math.floor(S.num(vc.elements.mthis.value))));
        var full = years === 0 ? days : Math.min(Lb.max_days, Lb.first_year_days + Lb.extra_per_year * years);
        var earned = years === 0 ? days : full * m / 12;
        var open = Math.max(0, earned - S.num(vc.elements.taken.value)) + S.num(vc.elements.old.value);
        var pay = open * daily * (1 + Lb.allowance_pct);
        h += '<div class="sub" style="margin-top:18px">' + T('Uit te betalen bij uit dienst gaan', 'To pay out on leaving') + '</div><div class="big tnum">' + S.money(pay) + '</div>' +
          '<table><tr><td>' + T('Opgebouwd dit jaar', 'Earned this year') + ' (' + S.fmt(full, 0) + ' &times; ' + m + '/12)</td><td class="r">' + S.fmt(earned, 1) + ' ' + T('dagen', 'days') + '</td></tr>' +
          '<tr><td>' + T('Nog open (incl. vorig jaar)', 'Still open (incl. last year)') + '</td><td class="r">' + S.fmt(open, 1) + ' ' + T('dagen', 'days') + '</td></tr>' +
          '<tr><td>' + T('Loon', 'Wage') + '</td><td class="r">' + S.money(open * daily) + '</td></tr>' +
          '<tr><td>' + T('Vakantietoelage', 'Leave allowance') + '</td><td class="r">' + S.money(open * daily * Lb.allowance_pct) + '</td></tr></table>' +
          '<p class="sub" style="margin-top:10px">' + T('Uitgaande van het dagenrecht van het lopende jaar op basis van de jaren in dienst.', 'Based on this year\'s entitlement given the years of service.') + '</p>';
      }
      vout.innerHTML = h;
    };
    vc.addEventListener('input', vr); vc.addEventListener('change', vr); vr();
  }

  // ---------------------------------------------------------------- timesheet
  var ts = document.getElementById('ts');
  if (ts) {
    var DAYS = S.nl ? ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var saved = S.store.get('ts', null);
    var box = document.getElementById('days');
    box.innerHTML = DAYS.map(function (d, i) {
      var def = saved ? saved[i] : (i < 5 ? ['07:00', '15:30', '30'] : ['', '', '']);
      return '<div class="ts-row" data-i="' + i + '"><span>' + d + '</span><input type="time" aria-label="' + d + ' ' + T('begin', 'start') + '" value="' + def[0] + '"><input type="time" aria-label="' + d + ' ' + T('eind', 'end') + '" value="' + def[1] + '"><input inputmode="numeric" aria-label="' + d + ' ' + T('pauze', 'break') + '" value="' + def[2] + '"><span class="r">-</span></div>';
    }).join('');
    var mins = function (t) { if (!t) return null; var p = t.split(':'); return +p[0] * 60 + +p[1]; };
    var tr = function () {
      var rate = S.num(ts.elements.rate.value), norm = S.num(ts.elements.norm.value) || 8, sunRest = ts.elements.sun.value === '2';
      var tot = 0, h100 = 0, h150 = 0, h200 = 0, warn = [], store = [];
      S.$$('.ts-row[data-i]', box).forEach(function (row) {
        var i = +row.getAttribute('data-i'), inp = row.querySelectorAll('input');
        var a = mins(inp[0].value), b = mins(inp[1].value), br = S.num(inp[2].value);
        store.push([inp[0].value, inp[1].value, inp[2].value]);
        var out = row.querySelector('.r');
        if (a === null || b === null) { out.textContent = '-'; row.classList.remove('warn'); return; }
        var d = b - a; if (d <= 0) d += 1440;
        var h = Math.max(0, d - br) / 60;
        tot += h;
        out.textContent = S.fmt(h, 2);
        var over = h > Lb.max_day + 1e-9;
        row.classList.toggle('warn', over);
        if (over) warn.push(DAYS[i]);
        if (i === 6 && sunRest) h200 += h;
        else { h100 += Math.min(h, norm); h150 += Math.max(0, h - norm); }
      });
      S.store.set('ts', store);
      var pay = rate * (h100 + 1.5 * h150 + 2 * h200);
      var hh = function (x) { return S.fmt(x, 2) + ' ' + T('uur', 'h'); };
      var h = '<div class="sub">' + T('Gewerkt deze week', 'Worked this week') + '</div><div class="big tnum">' + hh(tot) + '</div>' +
        '<table><tr><td>' + T('Normale uren', 'Normal hours') + '</td><td class="r">' + hh(h100) + '</td></tr>' +
        '<tr><td>' + T('Overuren 150%', 'Overtime 150%') + '</td><td class="r">' + hh(h150) + '</td></tr>' +
        '<tr><td>' + T('Rustdag 200%', 'Rest day 200%') + '</td><td class="r">' + hh(h200) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Bruto weekloon', 'Gross weekly pay') + '</td><td class="r">' + S.money(pay) + '</td></tr></table>';
      if (warn.length) h += '<p class="sub" style="margin-top:12px;color:#b2341b">' + T('Meer dan 8,5 uur op: ', 'More than 8.5 hours on: ') + warn.join(', ') + '. ' + T('Daarvoor is een overwerkvergunning nodig.', 'This requires an overtime permit.') + '</p>';
      if (tot > Lb.max_week) h += '<p class="sub" style="margin-top:8px;color:#b2341b">' + T('Meer dan 48 uur deze week.', 'More than 48 hours this week.') + '</p>';
      if (rate && rate < Lb.min_hour) h += '<p class="sub" style="margin-top:8px;color:#b2341b">' + T('Uurloon onder het minimumloon van ', 'Hourly wage below the minimum wage of ') + S.money(Lb.min_hour) + '.</p>';
      document.getElementById('ts-out').innerHTML = h;
    };
    ts.addEventListener('input', tr); ts.addEventListener('change', tr);
    document.getElementById('clear').onclick = function () { S.$$('input', box).forEach(function (i) { i.value = ''; }); tr(); };
    tr();
  }

  // ---------------------------------------------------------------- hourly wage
  var hw = document.getElementById('hw');
  if (hw) {
    var mode = 'h';
    var hr = function () {
      var a = S.num(hw.elements.amount.value), hpw = S.num(hw.elements.hpw.value) || 40, dpw = +hw.elements.dpw.value;
      var hour = mode === 'h' ? a : a * 12 / 52 / hpw;
      var week = hour * hpw, month = week * 52 / 12;
      var h = '<div class="sub">' + (mode === 'h' ? T('Maandloon', 'Monthly wage') : T('Uurloon', 'Hourly wage')) + '</div><div class="big tnum">' + S.money(mode === 'h' ? month : hour) + '</div><table>' +
        '<tr><td>' + T('Per uur', 'Per hour') + '</td><td class="r">' + S.money(hour) + '</td></tr>' +
        '<tr><td>' + T('Per dag', 'Per day') + ' (' + S.fmt(hpw / dpw, 1) + ' ' + T('uur', 'h') + ')</td><td class="r">' + S.money(week / dpw) + '</td></tr>' +
        '<tr><td>' + T('Per week', 'Per week') + '</td><td class="r">' + S.money(week) + '</td></tr>' +
        '<tr><td>' + T('Per 2 weken', 'Per fortnight') + '</td><td class="r">' + S.money(week * 2) + '</td></tr>' +
        '<tr><td>' + T('Per maand', 'Per month') + '</td><td class="r">' + S.money(month) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Per jaar', 'Per year') + '</td><td class="r">' + S.money(month * 12) + '</td></tr></table>';
      var diff = hour - Lb.min_hour;
      h += '<p class="sub" style="margin-top:12px">' + (diff >= 0 ? T('Dat is ', 'That is ') + S.fmt(hour / Lb.min_hour * 100 - 100, 0) + T('% boven het minimumuurloon (', '% above the minimum hourly wage (') + S.money(Lb.min_hour) + ').' :
        '<span style="color:#b2341b">' + T('Dat is onder het minimumuurloon van ', 'That is below the minimum hourly wage of ') + S.money(Lb.min_hour) + '.</span>') + '</p>';
      document.getElementById('hw-out').innerHTML = h;
    };
    S.$$('[data-mode]', hw).forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-mode');
        S.$$('[data-mode]', hw).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        document.getElementById('amount-l').textContent = mode === 'h' ? T('Uurloon (SRD)', 'Hourly wage (SRD)') : T('Maandloon (SRD)', 'Monthly wage (SRD)');
        hw.elements.amount.value = mode === 'h' ? '75' : '13000';
        hr();
      });
    });
    hw.addEventListener('input', hr); hw.addEventListener('change', hr); hr();
  }
})();
