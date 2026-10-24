/* Cash counter, tax deadlines and e-mail signature. */
(function () {
  var S = window.SBT, T = S.T;

  // ---------------------------------------------------------------- cash counter
  var cc = document.getElementById('cc');
  if (cc) {
    var rows = S.$$('.cash-row', cc);
    var keep = ['usdr', 'eurr', 'float'];
    var sv = S.store.get('cc:set', {});
    keep.forEach(function (k) { if (sv[k]) cc.elements[k].value = sv[k]; });
    var calc = function () {
      var srd = 0;
      rows.forEach(function (r) {
        var v = +r.getAttribute('data-v'), n = Math.max(0, Math.round(S.num(r.querySelector('input').value)));
        r.querySelector('.r').textContent = n ? S.fmt(v * n) : '-';
        srd += v * n;
      });
      var usd = S.num(cc.elements.usd.value) * S.num(cc.elements.usdr.value), eur = S.num(cc.elements.eur.value) * S.num(cc.elements.eurr.value);
      return { srd: srd, usd: usd, eur: eur, total: srd + usd + eur, exp: S.num(cc.elements.exp.value), flt: S.num(cc.elements.float.value) };
    };
    var render = function () {
      var c = calc(), h = '<div class="sub">' + T('Geteld totaal', 'Total counted') + '</div><div class="big tnum">' + S.money(c.total) + '</div><table>' +
        '<tr><td>' + T('Contant SRD', 'Cash SRD') + '</td><td class="r">' + S.money(c.srd) + '</td></tr>' +
        (c.usd ? '<tr><td>USD ' + T('omgerekend', 'converted') + '</td><td class="r">' + S.money(c.usd) + '</td></tr>' : '') +
        (c.eur ? '<tr><td>EUR ' + T('omgerekend', 'converted') + '</td><td class="r">' + S.money(c.eur) + '</td></tr>' : '');
      if (c.exp) {
        var d = c.total - c.exp;
        h += '<tr><td>' + T('Verwacht', 'Expected') + '</td><td class="r">' + S.money(c.exp) + '</td></tr><tr class="tot"><td>' +
          (Math.abs(d) < 0.005 ? T('Kas klopt', 'Drawer matches') : d > 0 ? T('Kasoverschot', 'Over') : T('Kastekort', 'Short')) + '</td><td class="r">' + S.money(Math.abs(d)) + '</td></tr>';
      }
      if (c.flt) h += '<tr><td>' + T('Af te storten (na wisselgeld)', 'To deposit (after float)') + '</td><td class="r">' + S.money(Math.max(0, c.srd - c.flt)) + '</td></tr>';
      document.getElementById('cc-out').innerHTML = h + '</table>';
      var o = {}; keep.forEach(function (k) { o[k] = cc.elements[k].value; }); S.store.set('cc:set', o);
    };
    var hist = function () {
      var list = S.store.get('cc:hist', []), box = document.getElementById('cc-hist');
      box.innerHTML = '<div class="eyebrow">' + T('Bewaarde tellingen (op dit toestel)', 'Saved counts (on this device)') + '</div>' + (list.length ? '<ul class="list">' + list.map(function (x) {
        return '<li><b>' + S.money(x.t) + '</b><div class="meta"><span>' + S.esc(x.d) + '</span>' + (x.diff !== null ? '<span>' + (x.diff >= 0 ? '+' : '') + S.fmt(x.diff) + '</span>' : '') + '</div></li>';
      }).join('') + '</ul>' : '<p class="sub">' + T('Nog niets bewaard.', 'Nothing saved yet.') + '</p>');
    };
    cc.addEventListener('input', render);
    document.getElementById('cc-save').onclick = function (ev) {
      var c = calc(), list = S.store.get('cc:hist', []);
      list.unshift({ d: new Date().toLocaleString(S.nl ? 'nl-NL' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }), t: c.total, diff: c.exp ? c.total - c.exp : null });
      S.store.set('cc:hist', list.slice(0, 20)); hist(); S.flash(ev.target, T('Bewaard', 'Saved'));
    };
    document.getElementById('cc-clear').onclick = function () { rows.forEach(function (r) { r.querySelector('input').value = ''; }); ['usd', 'eur', 'exp'].forEach(function (k) { cc.elements[k].value = ''; }); render(); };
    render(); hist();
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
