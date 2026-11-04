/* Cash counter, tax deadlines and e-mail signature. */
(function () {
  var S = window.SBT, T = S.T;

  // ---------------------------------------------------------------- cash counter
  // The opening balance is taken over from the last saved closing balance and locked, so it cannot
  // change unnoticed. Changing it by hand is possible, but the sheet then shows the carried value.
  // Names and ID numbers are never stored: they only go on the printed sheet.
  var cc = document.getElementById('cc');
  if (cc) {
    var E = cc.elements, rows = S.$$('.cash-row', cc), byId = function (id) { return document.getElementById(id); };
    var keep = ['usdr', 'eurr', 'float', 'loc'];
    var daily = ['usd', 'eur', 'sales', 'out', 'pin', 'pinn', 'dig', 'pb', 'pbid', 'cb', 'cbid'];
    var sv = S.store.get('cc:set', {}) || {};
    keep.forEach(function (k) { if (sv[k]) E[k].value = sv[k]; });
    var openH = byId('cc-open-h'), carried = null, edited = null, closed = false;
    var when = function (d) { return /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? S.dateLong(d) : (d || ''); };
    var dates = function () { var t = S.today(); ['date', 'pbd', 'cbd'].forEach(function (k) { E[k].value = t; }); };
    var lockHint = function () {
      openH.innerHTML = T('Vastgezet: eindsaldo van de vorige afsluiting', 'Locked: closing balance of the previous close') +
        (carried.d ? ' (' + S.esc(when(carried.d)) + ')' : '') + '. <a href="#" id="cc-unlock">' + T('Toch wijzigen', 'Change anyway') + '</a>';
    };
    var lockOpen = function () {
      var o = S.store.get('cc:open', null);
      carried = o && typeof o.v === 'number' ? o : null; edited = null;
      if (carried) { E.open.value = S.fmt(carried.v); E.open.readOnly = true; lockHint(); }
      else {
        E.open.readOnly = false;
        openH.textContent = T('Eerste telling: vul in wat er bij de start in de kas zat. Na het afsluiten wordt het eindsaldo vanzelf het beginsaldo van de volgende telling en zit het vast.',
          'First count: enter what was in the till at the start. After closing, the closing balance becomes the opening balance of the next count and is locked.');
      }
    };
    openH.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('#cc-unlock');
      if (!a || !carried) return;
      ev.preventDefault();
      if (!a.getAttribute('data-armed')) {
        a.setAttribute('data-armed', '1');
        a.textContent = T('Klik nogmaals om te wijzigen. Dit komt op de kasopmaakstaat.', 'Click again to change. This will show on the sheet.');
        setTimeout(function () { if (a.isConnected && E.open.readOnly) lockHint(); }, 6000);
        return;
      }
      edited = carried.v; E.open.readOnly = false; E.open.focus(); E.open.select();
      openH.textContent = T('Handmatig gewijzigd. Overgenomen eindsaldo was ', 'Changed by hand. The carried closing balance was ') + S.money(carried.v) + '.';
      render();
    });

    var calc = function () {
      var srd = 0, lines = [];
      rows.forEach(function (r) {
        var v = +r.getAttribute('data-v'), n = Math.max(0, Math.round(S.num(r.querySelector('input').value)));
        var line = S.r2(v * n);
        r.querySelector('.r').textContent = n ? S.fmt(line) : '-';
        lines.push({ l: r.firstElementChild.textContent, n: n, v: line });
        srd = S.sum([srd, line]);
      });
      var g = function (k) { return S.r2(S.num(E[k].value)); };
      var c = { lines: lines, srd: srd, usdA: g('usd'), eurA: g('eur'), usdR: S.num(E.usdr.value), eurR: S.num(E.eurr.value),
        open: g('open'), sales: g('sales'), out: g('out'), pin: g('pin'), pinn: Math.max(0, Math.round(S.num(E.pinn.value))), dig: g('dig') };
      c.usd = S.r2(c.usdA * c.usdR); c.eur = S.r2(c.eurA * c.eurR);
      c.total = S.sum([srd, c.usd, c.eur]);
      c.hasExp = !!(c.open || c.sales || c.out);
      c.exp = S.sum([c.open, c.sales, -c.out]);
      c.diff = S.sum([c.total, -c.exp]);
      c.close = E.float.value.trim() === '' ? c.total : g('float');
      c.dep = S.sum([c.total, -c.close]);
      c.turn = S.sum([c.sales, c.pin, c.dig]);
      return c;
    };
    var verdict = function (d) { return Math.abs(d) < 0.005 ? T('Kas klopt', 'Drawer matches') : d > 0 ? T('Kasoverschot', 'Over') : T('Kastekort', 'Short'); };
    var row = function (l, v, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + l + '</td><td class="r">' + v + '</td></tr>'; };
    var render = function () {
      var c = calc(), h = '<div class="sub">' + T('Geteld totaal', 'Total counted') + '</div><div class="big tnum">' + S.money(c.total) + '</div><table>' +
        row(T('Contant SRD', 'Cash SRD'), S.money(c.srd)) +
        (c.usd ? row('USD ' + T('omgerekend', 'converted'), S.money(c.usd)) : '') +
        (c.eur ? row('EUR ' + T('omgerekend', 'converted'), S.money(c.eur)) : '');
      if (c.hasExp) {
        h += row(T('Beginsaldo', 'Opening balance'), S.money(c.open)) +
          (c.sales ? row('+ ' + T('Contante ontvangsten', 'Cash received'), S.money(c.sales)) : '') +
          (c.out ? row('- ' + T('Contante uitgaven', 'Cash paid out'), S.money(c.out)) : '') +
          row(T('Verwacht in de kas', 'Expected in the till'), S.money(c.exp)) +
          (c.total ? row(verdict(c.diff), S.money(Math.abs(c.diff)), 'tot') : '');
      }
      if (c.total) {
        if (c.dep > 0.004) h += row(T('Af te storten / af te dragen', 'To deposit / hand over'), S.money(c.dep));
        h += row(T('Eindsaldo (beginsaldo volgende telling)', 'Closing balance (next opening)'), S.money(c.close));
        if (c.dep < -0.004) h += '<tr><td colspan="2" style="color:var(--down)">' + T('Het eindsaldo is hoger dan wat je telde.', 'The closing balance is higher than what you counted.') + '</td></tr>';
      }
      if (c.pin || c.dig || c.pinn) {
        h += row(T('Pin', 'Card') + (c.pinn ? ' (' + c.pinn + ' ' + T('transacties', 'payments') + ')' : ''), S.money(c.pin)) +
          (c.dig ? row('Uni5Pay, Mope, QR', S.money(c.dig)) : '') +
          (c.sales ? row(T('Dagomzet (contant, pin en digitaal)', 'Day turnover (cash, card and digital)'), S.money(c.turn), 'tot') : '');
      }
      byId('cc-res').innerHTML = h + '</table>';
      var o = {}; keep.forEach(function (k) { o[k] = E[k].value; }); S.store.set('cc:set', o);
    };
    var hist = function () {
      var list = S.store.get('cc:hist', []) || [], box = byId('cc-hist');
      box.innerHTML = '<div class="eyebrow">' + T('Afgesloten tellingen (op dit toestel)', 'Closed counts (on this device)') + '</div>' + (list.length ? '<ul class="list">' + list.map(function (x) {
        return '<li><b>' + S.money(x.t) + '</b><div class="meta"><span>' + S.esc(when(x.d)) + (x.loc ? ' · ' + S.esc(x.loc) : '') + '</span>' +
          (x.diff !== null && x.diff !== undefined ? '<span>' + (Math.abs(x.diff) < 0.005 ? T('klopt', 'matches') : (x.diff > 0 ? '+' : '') + S.fmt(x.diff)) + '</span>' : '') +
          (typeof x.close === 'number' ? '<span>' + T('eindsaldo ', 'closing ') + S.fmt(x.close) + '</span>' : '') +
          (x.pin ? '<span>' + T('pin ', 'card ') + S.fmt(x.pin) + '</span>' : '') +
          (x.oe !== null && x.oe !== undefined ? '<span>' + T('beginsaldo gewijzigd', 'opening changed') + '</span>' : '') + '</div></li>';
      }).join('') + '</ul>' : '<p class="sub">' + T('Nog niets afgesloten.', 'Nothing closed yet.') + '</p>');
    };
    cc.addEventListener('input', function () { render(); });

    byId('cc-save').onclick = function (ev) {
      var c = calc();
      if (!c.total && !c.open) { S.flash(ev.target, T('Nog niets geteld', 'Nothing counted yet')); return; }
      if (c.dep < -0.004) { S.flash(ev.target, T('Eindsaldo te hoog', 'Closing balance too high')); E.float.focus(); return; }
      var d = E.date.value || S.today(), list = S.store.get('cc:hist', []) || [];
      var rec = { d: d, loc: E.loc.value.trim(), t: c.total, diff: c.hasExp ? c.diff : null, open: c.open, oe: edited, sales: c.sales, out: c.out,
        close: c.close, dep: c.dep, pin: c.pin, pinn: c.pinn, dig: c.dig };
      // saving again before "New count" corrects this close instead of adding a second one
      if (closed && list.length) list[0] = rec; else list.unshift(rec);
      S.store.set('cc:hist', list.slice(0, 60));
      S.store.set('cc:open', { v: c.close, d: d });
      closed = true; hist();
      openH.textContent = T('Afgesloten. De volgende telling begint met beginsaldo ', 'Closed. The next count starts with an opening balance of ') + S.money(c.close) +
        T('. Klik op Nieuwe telling om te beginnen.', '. Click New count to start.');
      S.flash(ev.target, T('Afgesloten en bewaard', 'Closed and saved'));
    };
    byId('cc-clear').onclick = function () {
      rows.forEach(function (r) { r.querySelector('input').value = ''; });
      daily.forEach(function (k) { E[k].value = ''; });
      closed = false; dates(); lockOpen(); render();
    };

    byId('cc-print').onclick = function () {
      var c = calc(), b = S.store.get('biz', {}) || {}, X = S.esc, loc = E.loc.value.trim();
      var R3 = function (a, n, v, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + a + '</td><td class="r">' + n + '</td><td class="r">' + v + '</td></tr>'; };
      var h = '<div class="ph"><div>' + (b.logo ? '<img src="' + b.logo + '" alt=""><br>' : '') + '<b>' + X(b.s_name || '') + '</b></div><div style="text-align:right"><div class="dh">' +
        T('Kasopmaakstaat', 'Cash count sheet') + '</div><div class="pm">' + X(when(E.date.value)) + (loc ? ' · ' + X(loc) : '') + '</div></div></div>';
      // notes left, coins and foreign cash right, so the whole sheet fits on one A4
      var th = '<table><thead><tr><th>' + T('Biljet / munt', 'Note / coin') + '</th><th class="r">' + T('Aantal', 'How many') + '</th><th class="r">' + T('Waarde', 'Value') + '</th></tr></thead><tbody>';
      var part = function (coins) { var t = th; c.lines.forEach(function (l, i) { if ((+rows[i].getAttribute('data-v') < 5) === coins) t += R3(X(l.l), l.n || '', l.n ? S.fmt(l.v) : ''); }); return t; };
      h += '<div class="pp cc-two"><div>' + part(false) + '</tbody></table></div><div>' + part(true) +
        (c.usdA ? R3('USD ' + S.fmt(c.usdA) + ' × ' + S.fmt(c.usdR, 2), '', S.fmt(c.usd)) : '') +
        (c.eurA ? R3('EUR ' + S.fmt(c.eurA) + ' × ' + S.fmt(c.eurR, 2), '', S.fmt(c.eur)) : '') + '</tbody></table></div></div>';
      h += '<table class="tots"><tr class="g"><td>' + T('Geteld totaal', 'Total counted') + '</td><td class="r">' + S.money(c.total) + '</td></tr></table>';

      h += '<div class="cc-h">' + T('Kasoverzicht', 'Till summary') + '</div><table><tbody>' +
        row(T('Beginsaldo', 'Opening balance') + (edited !== null ? ' <span class="pm">(' + T('handmatig gewijzigd, overgenomen was ', 'changed by hand, carried over was ') + S.money(edited) + ')</span>' : ''), S.money(c.open)) +
        row('+ ' + T('Contante ontvangsten', 'Cash received'), S.money(c.sales)) +
        row('- ' + T('Contante uitgaven', 'Cash paid out'), S.money(c.out)) +
        row(T('Verwacht in de kas', 'Expected in the till'), S.money(c.exp)) +
        row(T('Geteld totaal', 'Total counted'), S.money(c.total)) +
        row('<b>' + verdict(c.diff) + '</b>', '<b>' + S.money(Math.abs(c.diff)) + '</b>') +
        row(T('Af te storten / af te dragen', 'To deposit / hand over'), S.money(Math.max(0, c.dep))) +
        row('<b>' + T('Eindsaldo (beginsaldo volgende telling)', 'Closing balance (next opening)') + '</b>', '<b>' + S.money(c.close) + '</b>') +
        '</tbody></table>';

      h += '<div class="cc-h">' + T('Pin en digitaal (niet in de kas)', 'Card and digital (not in the till)') + '</div><table><tbody>' +
        row(T('Pin totaal', 'Card total') + ' (' + (c.pinn || 0) + ' ' + T('transacties', 'payments') + ')', S.money(c.pin)) +
        row('Uni5Pay, Mope, QR', S.money(c.dig)) +
        row('<b>' + T('Dagomzet (contant, pin en digitaal)', 'Day turnover (cash, card and digital)') + '</b>', '<b>' + S.money(c.turn) + '</b>') +
        '</tbody></table>';

      var ln = function (l, v, sg) { return '<div class="ln' + (sg ? ' sg' : '') + '"><span>' + l + '</span><b>' + X(v || '') + '</b></div>'; };
      var who = function (t, n, id, d) {
        return '<div class="cc-p"><div class="lbl">' + t + '</div>' + ln(T('Naam voluit', 'Full name'), E[n].value.trim()) + ln(T('ID-kaartnr.', 'ID card no.'), E[id].value.trim()) +
          ln(T('Datum', 'Date'), when(E[d].value)) + ln(T('Handtekening', 'Signature'), '', 1) + '</div>';
      };
      h += '<div class="pp cc-pp">' + who(T('Opgemaakt door', 'Prepared by'), 'pb', 'pbid', 'pbd') + who(T('Geteld door', 'Counted by'), 'cb', 'cbid', 'cbd') + '</div>';
      h += '<div class="pf">' + T('Gemaakt met de gratis kasopmaak van surinamebusiness.com op ', 'Made with the free cash counter on surinamebusiness.com on ') + X(S.dateLong(S.today())) + '</div>';
      byId('cc-doc').innerHTML = h;
      S.printDoc();
    };

    dates(); lockOpen(); render(); hist();
  }

  // ---------------------------------------------------------------- tax deadlines
  var list = document.getElementById('dl-list');
  if (list) {
    var MN = S.nl ? ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var pad = function (n) { return ('0' + n).slice(-2); };
    var items = [], now = new Date(), y = now.getFullYear(), m = now.getMonth();
    for (var i = -1; i < 13; i++) {
      var py = y + Math.floor((m + i) / 12), pm = ((m + i) % 12 + 12) % 12;       // period month
      var ny = pm === 11 ? py + 1 : py, nm = (pm + 1) % 12;                         // following month
      items.push({ k: 'vat', d: ny + '-' + pad(nm + 1) + '-15', t: T('BTW-aangifte en betaling', 'VAT return and payment'), p: MN[pm] + ' ' + py });
      items.push({ k: 'wage', d: ny + '-' + pad(nm + 1) + '-10', t: T('Loonbelasting en AOV aangifte', 'Wage tax and AOV return'), p: MN[pm] + ' ' + py });
    }
    [y, y + 1].forEach(function (yy) {
      items.push({ k: 'ib', d: yy + '-04-15', t: T('Voorlopige aangifte inkomstenbelasting en eerste termijn', 'Provisional income tax return and first instalment'), p: String(yy) });
      items.push({ k: 'ib', d: yy + '-04-30', t: T('Definitieve aangifte inkomstenbelasting (personen)', 'Final income tax return (individuals)'), p: String(yy - 1) });
      items.push({ k: 'ib', d: yy + '-06-30', t: T('Definitieve aangifte bedrijven (boekjaar = kalenderjaar)', 'Final return for companies (calendar financial year)'), p: String(yy - 1) });
      items.push({ k: 'ib', d: yy + '-02-15', t: T('Laatste dag om verlaging van de voorlopige aanslag te vragen', 'Last day to request a lower provisional assessment'), p: String(yy) });
      items.push({ k: 'ib', d: yy + '-07-15', t: T('Inkomstenbelasting: tweede termijn', 'Income tax: second instalment'), p: String(yy) });
      items.push({ k: 'ib', d: yy + '-10-15', t: T('Inkomstenbelasting: derde termijn', 'Income tax: third instalment'), p: String(yy) });
      items.push({ k: 'ib', d: yy + '-12-31', t: T('Inkomstenbelasting: vierde termijn', 'Income tax: fourth instalment'), p: String(yy) });
    });
    var today = S.today(), end = S.addDays(today, 366);
    items = items.filter(function (x) { return x.d >= today && x.d <= end; }).sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
    var filter = 'all';
    var dlr = function () {
      var shown = items.filter(function (x) { return filter === 'all' || x.k === filter; });
      list.innerHTML = shown.map(function (x) {
        var days = Math.round((new Date(x.d + 'T12:00:00') - new Date(today + 'T12:00:00')) / 864e5), wk = new Date(x.d + 'T12:00:00').getDay();
        var late = !S.isWorkday(x.d);
        return '<li><b>' + S.esc(S.dateLong(x.d)) + '</b> <span class="pill ' + (days <= 7 ? 'red' : x.k === 'vat' ? 'gold' : '') + '">' + (days === 0 ? T('vandaag', 'today') : T('over ', 'in ') + days + T(' dagen', ' days')) + '</span>' +
          '<div class="meta"><span>' + S.esc(x.t) + '</span><span>' + T('periode ', 'period ') + S.esc(x.p) + '</span>' + (late ? '<span>' + (wk === 0 || wk === 6 ? T('valt in het weekend', 'falls on a weekend') : T('valt op een feestdag', 'falls on a holiday')) + '</span>' : '') + '</div></li>';
      }).join('');
      var nx = shown[0];
      document.getElementById('dl-next').textContent = nx ? S.dateLong(nx.d) : '-';
      document.getElementById('dl-next-sub').textContent = nx ? nx.t + ' (' + nx.p + ')' : '';
    };
    S.$$('#dl-f .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        filter = c.getAttribute('data-v');
        S.$$('#dl-f .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
        dlr();
      });
    });
    document.getElementById('dl-ics').onclick = function () {
      var shown = items.filter(function (x) { return filter === 'all' || x.k === filter; });
      var stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//surinamebusiness.com//tax deadlines//' + (S.nl ? 'NL' : 'EN'), 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + T('Belasting deadlines Suriname', 'Suriname tax deadlines')];
      shown.forEach(function (x, i) {
        var d = x.d.replace(/-/g, ''), d2 = S.addDays(x.d, 1).replace(/-/g, '');
        ics.push('BEGIN:VEVENT', 'UID:' + d + '-' + x.k + '-' + i + '@surinamebusiness.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + d2,
          'SUMMARY:' + x.t.replace(/[,;]/g, '\\$&') + ' (' + x.p + ')', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + x.t.replace(/[,;]/g, '\\$&'), 'TRIGGER:-P2D', 'END:VALARM', 'END:VEVENT');
      });
      ics.push('END:VCALENDAR');
      S.download(ics.join('\r\n'), T('belasting-deadlines.ics', 'tax-deadlines.ics'), 'text/calendar;charset=utf-8');
    };
    dlr();
  }

  // ---------------------------------------------------------------- e-mail signature
  var sg = document.getElementById('sg');
  if (sg) {
    var sv2 = S.store.get('sg', null);
    if (sv2) Object.keys(sv2).forEach(function (k) { if (sg.elements[k]) sg.elements[k].value = sv2[k]; });
    var html = '';
    var sgr = function () {
      var e = sg.elements, E = S.esc, c = /^#[0-9a-f]{6}$/i.test(e.c1.value) ? e.c1.value : '#1f2251';
      var web = e.web.value.trim(), webUrl = web && !/^https?:/i.test(web) ? 'https://' + web : web;
      var logo = /^https:\/\/\S+$/i.test(e.logo.value.trim()) ? e.logo.value.trim() : '';
      var lines = [];
      if (e.phone.value) lines.push('T ' + '<a href="tel:' + E(e.phone.value.replace(/[^\d+]/g, '')) + '" style="color:#333;text-decoration:none">' + E(e.phone.value) + '</a>');
      if (e.wa.value) lines.push('WhatsApp <a href="' + E(S.waUrl('', e.wa.value)) + '" style="color:' + c + ';text-decoration:none">' + E(e.wa.value) + '</a>');
      if (web) lines.push('<a href="' + E(webUrl) + '" style="color:' + c + ';text-decoration:none">' + E(web.replace(/^https?:\/\//, '')) + '</a>');
      if (e.addr.value) lines.push(E(e.addr.value));
      html = '<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:#333"><tr>' +
        (logo ? '<td style="padding-right:14px;vertical-align:top"><img src="' + E(logo) + '" alt="' + E(e.biz.value) + '" width="80" style="display:block;width:80px;height:auto;border:0"></td>' : '') +
        '<td style="border-left:3px solid ' + c + ';padding-left:12px;vertical-align:top"><div style="font-size:15px;font-weight:bold;color:' + c + '">' + E(e.name.value) + '</div>' +
        '<div style="color:#555">' + E(e.title.value) + (e.biz.value ? ', <b>' + E(e.biz.value) + '</b>' : '') + '</div>' +
        '<div style="margin-top:6px">' + lines.join('<br>') + '</div>' + (e.note.value ? '<div style="margin-top:8px;font-size:11px;color:#888">' + E(e.note.value) + '</div>' : '') + '</td></tr></table>';
      document.getElementById('sg-out').innerHTML = html;
      var o = {}; ['name', 'title', 'biz', 'phone', 'wa', 'web', 'addr', 'logo', 'c1', 'note'].forEach(function (k) { o[k] = e[k].value; }); S.store.set('sg', o);
    };
    sg.addEventListener('input', sgr); sg.addEventListener('change', sgr); sgr();
    document.getElementById('sg-copy').onclick = function (ev) {
      var btn = ev.target;
      try {
        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
          navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([document.getElementById('sg-out').innerText], { type: 'text/plain' }) })])
            .then(function () { S.flash(btn, T('Gekopieerd', 'Copied')); }, selectCopy);
        } else selectCopy();
      } catch (err) { selectCopy(); }
      function selectCopy() {
        var r = document.createRange(); r.selectNodeContents(document.getElementById('sg-out'));
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        try { document.execCommand('copy'); S.flash(btn, T('Gekopieerd', 'Copied')); } catch (e2) { /* ignore */ }
        s.removeAllRanges();
      }
    };
    document.getElementById('sg-html').onclick = function (ev) { S.copy(html, ev.target); };
  }
})();
