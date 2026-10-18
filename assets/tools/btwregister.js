(function () {
  var S = window.SBT, T = S.T, f = document.getElementById('br');
  if (!f) return;
  var KEY = 'btwreg', data = S.store.get(KEY, []);
  var month = document.getElementById('month'), rows = document.getElementById('rows'), sum = document.getElementById('sum');
  f.elements.date.value = S.today();
  month.value = S.today().slice(0, 7);

  function save() { if (!S.store.set(KEY, data)) alertFail(); }
  function alertFail() { sum.insertAdjacentHTML('afterbegin', '<p class="note" style="color:#5b4310">' + T('Opslaan op dit toestel lukt niet (privévenster?). Download een back-up.', 'Saving on this device failed (private window?). Download a backup.') + '</p>'); }
  function split(e) {
    var r = e.rate === 'x' ? 0 : S.num(e.rate) / 100, a = S.num(e.amount);
    var ex = e.incl ? a / (1 + r) : a;
    return { ex: ex, vat: ex * r };
  }
  function inMonth() { return data.filter(function (e) { return e.date.slice(0, 7) === month.value; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }
  function render() {
    var list = inMonth(), E = S.esc;
    rows.innerHTML = list.length ? list.map(function (e) {
      var s = split(e);
      return '<tr><td data-l="' + T('Datum', 'Date') + '">' + e.date.slice(8) + '-' + e.date.slice(5, 7) + '</td><td data-l="' + T('Omschrijving', 'Description') + '"><span class="pill ' + (e.type === 's' ? 'green' : 'gold') + '">' + (e.type === 's' ? T('verkoop', 'sale') : T('inkoop', 'purchase')) + '</span> ' + E(e.desc) +
        '</td><td class="r" data-l="Excl.">' + S.fmt(s.ex) + '</td><td class="r" data-l="' + T('BTW', 'VAT') + ' ' + (e.rate === 'x' ? '' : e.rate + '%') + '">' + S.fmt(s.vat) + '</td><td class="r"><button class="btn alt sm" data-del="' + e.id + '" aria-label="' + T('Verwijderen', 'Delete') + '">&times;</button></td></tr>';
    }).join('') : '<tr><td colspan="5" class="empty">' + T('Nog geen boekingen in deze maand.', 'No entries this month yet.') + '</td></tr>';
    var per = {}, sv = 0, pv = 0, sx = 0, px = 0;
    list.forEach(function (e) {
      var s = split(e);
      if (e.type === 's') { sv += s.vat; sx += s.ex; per[e.rate] = per[e.rate] || { ex: 0, v: 0 }; per[e.rate].ex += s.ex; per[e.rate].v += s.vat; }
      else { pv += s.vat; px += s.ex; }
    });
    var due = sv - pv;
    var h = '<div class="sub">' + (due >= 0 ? T('Af te dragen BTW', 'VAT to pay') : T('Terug te vragen BTW', 'VAT to reclaim')) + ' &middot; ' + monthName() + '</div><div class="big tnum">' + S.money(Math.abs(due)) + '</div><table>';
    Object.keys(per).forEach(function (k) {
      h += '<tr><td>' + (k === 'x' ? T('Vrijgestelde omzet', 'Exempt sales') : T('Omzet', 'Sales') + ' ' + k + '%') + '</td><td class="r">' + S.money(per[k].ex) + '</td></tr>';
      if (k !== 'x' && k !== '0') h += '<tr><td>' + T('BTW', 'VAT') + ' ' + k + '%</td><td class="r">' + S.money(per[k].v) + '</td></tr>';
    });
    h += '<tr><td>' + T('Totaal BTW op verkopen', 'Total VAT on sales') + '</td><td class="r">' + S.money(sv) + '</td></tr>';
    h += '<tr><td>' + T('Voorbelasting (BTW op inkopen)', 'Input tax (VAT on purchases)') + '</td><td class="r">- ' + S.money(pv) + '</td></tr>';
    h += '<tr class="tot"><td>' + (due >= 0 ? T('Te betalen', 'To pay') : T('Terug', 'Refund')) + '</td><td class="r">' + S.money(Math.abs(due)) + '</td></tr></table>';
    h += '<p class="sub" style="margin-top:12px">' + T('Aangifte en betaling voor de 16e van de volgende maand.', 'File and pay by the 16th of the following month.') + '</p>';
    sum.innerHTML = h;
  }
  function monthName() {
    return new Date(month.value + '-15T12:00:00').toLocaleDateString(S.nl ? 'nl-NL' : 'en-GB', { month: 'long', year: 'numeric' });
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!f.elements.date.value || !S.num(f.elements.amount.value)) { f.elements.amount.focus(); return; }
    data.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: f.elements.date.value, type: f.elements.type.value,
      desc: f.elements.desc.value.trim(), amount: S.num(f.elements.amount.value), incl: f.elements.incl.value === '1', rate: f.elements.rate.value });
    save();
    month.value = f.elements.date.value.slice(0, 7);
    f.elements.desc.value = ''; f.elements.amount.value = '';
    f.elements.desc.focus();
    render();
  });
  rows.addEventListener('click', function (e) {
    var b = e.target.closest('[data-del]');
    if (!b) return;
    if (!window.confirm(T('Deze boeking verwijderen?', 'Delete this entry?'))) return;
    data = data.filter(function (x) { return x.id !== b.getAttribute('data-del'); });
    save(); render();
  });
  month.addEventListener('change', render);
  document.getElementById('csv').onclick = function () {
    var out = [[T('Datum', 'Date'), T('Soort', 'Type'), T('Omschrijving', 'Description'), T('Tarief', 'Rate'), 'Excl.', T('BTW', 'VAT'), 'Incl.']];
    inMonth().forEach(function (e) {
      var s = split(e), d = function (x) { return S.fmt(x); };
      out.push([e.date, e.type === 's' ? T('verkoop', 'sale') : T('inkoop', 'purchase'), e.desc, e.rate === 'x' ? T('vrijgesteld', 'exempt') : e.rate + '%', d(s.ex), d(s.vat), d(s.ex + s.vat)]);
    });
    S.download(S.csv(out), 'btw-' + month.value + '.csv', 'text/csv;charset=utf-8');
  };
  document.getElementById('backup').onclick = function () {
    S.download(JSON.stringify({ app: 'surinamebusiness-btwregister', v: 1, data: data }), 'btw-register-backup-' + S.today() + '.json', 'application/json');
  };
  document.getElementById('restore').addEventListener('change', function (e) {
    var file = e.target.files[0]; if (!file) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var j = JSON.parse(fr.result);
        if (!j || !Array.isArray(j.data)) throw 0;
        var ids = {}; data.forEach(function (x) { ids[x.id] = 1; });
        var added = 0;
        j.data.forEach(function (x) { if (x && x.id && x.date && !ids[x.id]) { data.push(x); added++; } });
        save(); render();
        window.alert(T(added + ' boekingen teruggezet.', added + ' entries restored.'));
      } catch (err) { window.alert(T('Dit is geen geldige back-up.', 'This is not a valid backup.')); }
    };
    fr.readAsText(file);
  });
  render();
})();
