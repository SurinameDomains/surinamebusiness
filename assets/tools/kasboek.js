/* Kasboek en bankboek: cash and bank book with projects. Data stays in this browser (localStorage,
   synced to the account when signed in). Amounts are stored as whole cents, so every total is exact. */
(function () {
  var S = window.SBT, T = S.T, E = S.esc;
  var f = document.getElementById('kb');
  if (!f) return;
  var F = f.elements, $ = function (id) { return document.getElementById(id); };

  // ---------------------------------------------------------------- categories
  // n: neutral = moves money but is not income or cost (private, loans), kept out of the result
  var CATS = {
    out: [['Inkoop en materiaal', 'Purchases and materials'], ['Huur', 'Rent'], ['Stroom, water en gas', 'Power, water and gas'],
      ['Telefoon en internet', 'Phone and internet'], ['Transport en brandstof', 'Transport and fuel'], ['Lonen en personeel', 'Wages and staff'],
      ['Ingehuurd werk', 'Subcontracted work'], ['Gereedschap en apparatuur', 'Tools and equipment'], ['Kantoor en software', 'Office and software'],
      ['Reclame en marketing', 'Advertising and marketing'], ['Onderhoud en reparatie', 'Maintenance and repair'], ['Verzekeringen', 'Insurance'],
      ['Bankkosten', 'Bank charges'], ['Belastingen en premies', 'Taxes and premiums'], ['Rente', 'Interest'], ['Overige kosten', 'Other costs']],
    in: [['Verkoop en omzet', 'Sales and revenue'], ['Betaalde factuur', 'Invoice paid'], ['Aanbetaling', 'Deposit received'], ['Overige ontvangst', 'Other income']]
  };
  var NEUTRAL = {
    out: [['Privé-opname', 'Private withdrawal'], ['Aflossing lening', 'Loan repayment']],
    in: [['Privé-inleg', 'Private deposit'], ['Lening ontvangen', 'Loan received']]
  };
  var neutralSet = {};
  ['out', 'in'].forEach(function (d) { NEUTRAL[d].forEach(function (c) { neutralSet[c[0].toLowerCase()] = 1; neutralSet[c[1].toLowerCase()] = 1; }); });
  function isNeutral(cat) { return !!neutralSet[String(cat || '').trim().toLowerCase()]; }

  // ---------------------------------------------------------------- storage
  // kb:set holds the accounts; kb:<year> holds that year's entries (keeps each synced item small)
  var set = S.store.get('kb:set', null);
  if (!set || !Array.isArray(set.acc) || !set.acc.length) {
    set = { v: 1, acc: [{ id: 'cash', name: T('Kas', 'Cash'), type: 'cash', cur: 'SRD', open: 0 }, { id: 'bank', name: T('Bank', 'Bank'), type: 'bank', cur: 'SRD', open: 0 }] };
  }
  var data = {};
  S.store.keys('kb:').forEach(function (k) { if (/^kb:\d{4}$/.test(k)) { var a = S.store.get(k, []); if (Array.isArray(a)) data[k.slice(3)] = a; } });
  var failed = false;
  function saveSet() { if (!S.store.set('kb:set', set)) failed = true; }
  function saveYear(y) {
    var list = data[y] || [];
    if (!list.length) S.store.del('kb:' + y); else if (!S.store.set('kb:' + y, list)) failed = true;
  }
  function all() { var out = []; Object.keys(data).forEach(function (y) { out = out.concat(data[y]); }); return out; }
  function sorted(list) { return list.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.t || 0) - (b.t || 0); }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function accOf(id) { for (var i = 0; i < set.acc.length; i++) if (set.acc[i].id === id) return set.acc[i]; return null; }
  function cents(v) { return Math.round(S.r2(S.num(v)) * 100); }
  function m(c, cur) { return S.money(c / 100, cur); }
  function f2(c) { return S.fmt(c / 100); }
  function monthName(ym) { return new Date(ym + '-15T12:00:00').toLocaleDateString(S.nl ? 'nl-NL' : 'en-GB', { month: 'long', year: 'numeric' }); }
  function dshort(d) { return d.slice(8) + '-' + d.slice(5, 7); }
  function bizName() { var b = S.store.get('biz', {}); return (b && b.s_name) || ''; }

  // effect of an entry on one account, in cents
  function effect(e, accId) {
    if (e.dir === 'tr') return e.acc === accId ? -e.c : e.to === accId ? (e.c2 != null ? e.c2 : e.c) : 0;
    if (e.acc !== accId) return 0;
    return e.dir === 'in' ? e.c : -e.c;
  }
  function balance(accId, uptoDate) {
    var a = accOf(accId), c = a ? a.open || 0 : 0;
    all().forEach(function (e) { if (!uptoDate || e.date <= uptoDate) c += effect(e, accId); });
    return c;
  }
  function curOf(e) { var a = accOf(e.acc); return a ? a.cur : 'SRD'; }

  // ---------------------------------------------------------------- form
  var dir = 'out', editing = null, msg = $('kb-msg');
  function opts(sel, list, keep) {
    var v = keep !== undefined ? keep : sel.value;
    sel.innerHTML = list.map(function (o) { return '<option value="' + E(o[0]) + '">' + E(o[1]) + '</option>'; }).join('');
    if (v && list.some(function (o) { return o[0] === v; })) sel.value = v;
  }
  function accOptions() { return set.acc.map(function (a) { return [a.id, a.name + (a.cur !== 'SRD' ? ' (' + a.cur + ')' : '')]; }); }
  function projects() {
    var seen = {}, out = [];
    sorted(all()).reverse().forEach(function (e) { var p = (e.proj || '').trim(); if (p && !seen[p.toLowerCase()]) { seen[p.toLowerCase()] = 1; out.push(p); } });
    return out;
  }
  function catList() {
    var seen = {}, out = [];
    CATS[dir === 'in' ? 'in' : 'out'].concat(NEUTRAL[dir === 'in' ? 'in' : 'out']).forEach(function (c) { var t = T(c[0], c[1]); seen[t.toLowerCase()] = 1; out.push(t); });
    all().forEach(function (e) { if (e.dir === dir && e.cat && !seen[e.cat.toLowerCase()]) { seen[e.cat.toLowerCase()] = 1; out.push(e.cat); } });
    return out;
  }
  function fillLists() {
    $('kb-cats').innerHTML = catList().map(function (c) { return '<option value="' + E(c) + '">'; }).join('');
    $('kb-projs').innerHTML = projects().map(function (p) { return '<option value="' + E(p) + '">'; }).join('');
    opts(F.acc, accOptions());
    opts(F.to, accOptions());
    if (F.to.value === F.acc.value && set.acc.length > 1) F.to.value = set.acc.filter(function (a) { return a.id !== F.acc.value; })[0].id;
  }
  function setDir(d) {
    dir = d;
    S.$$('#kb-dir button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-dir') === d); });
    $('kb-acc-l').textContent = d === 'in' ? T('Ontvangen op', 'Received in') : d === 'tr' ? T('Van', 'From') : T('Betaald uit', 'Paid from');
    $('kb-to-w').hidden = d !== 'tr';
    $('kb-cat-w').hidden = d === 'tr';
    $('kb-proj-w').hidden = d === 'tr';
    fillLists(); twoCur();
  }
  function twoCur() {
    var a = accOf(F.acc.value), b = accOf(F.to.value), diff = dir === 'tr' && a && b && a.cur !== b.cur;
    $('kb-amt2-w').hidden = !diff;
    if (diff) $('kb-amt2-l').textContent = T('Ontvangen op ', 'Received in ') + b.name + ' (' + b.cur + ')';
  }
  S.$$('#kb-dir button').forEach(function (b) { b.addEventListener('click', function () { setDir(b.getAttribute('data-dir')); }); });
  F.acc.addEventListener('change', twoCur); F.to.addEventListener('change', twoCur);

  function resetForm() {
    editing = null;
    F.amt.value = ''; F.amt2.value = ''; F.desc.value = ''; F.ref.value = ''; F.cat.value = '';
    $('kb-ftitle').textContent = T('Boeking toevoegen', 'Add an entry');
    $('kb-save').textContent = T('Toevoegen', 'Add');
    $('kb-cancel').hidden = true;
  }
  function say(t, bad) { msg.textContent = t; msg.style.color = bad ? '#b2341b' : ''; if (!bad) setTimeout(function () { if (msg.textContent === t) msg.textContent = ''; }, 2600); }

  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var c = cents(F.amt.value), date = F.date.value;
    if (!date) { F.date.focus(); return; }
    if (c <= 0) { say(T('Vul een bedrag in, groter dan nul.', 'Enter an amount above zero.'), true); F.amt.focus(); return; }
    var e = { id: editing ? editing.id : uid(), t: editing ? editing.t : Date.now(), date: date, dir: dir, acc: F.acc.value, c: c,
      desc: F.desc.value.trim(), ref: F.ref.value.trim() };
    if (dir === 'tr') {
      if (F.to.value === F.acc.value) { say(T('Kies twee verschillende rekeningen.', 'Pick two different accounts.'), true); return; }
      e.to = F.to.value;
      if (!$('kb-amt2-w').hidden) {
        var c2 = cents(F.amt2.value);
        if (c2 <= 0) { say(T('Vul in hoeveel er op de andere rekening binnenkwam.', 'Enter how much arrived in the other account.'), true); F.amt2.focus(); return; }
        e.c2 = c2;
      }
    } else {
      e.cat = F.cat.value.trim() || T(dir === 'in' ? 'Overige ontvangst' : 'Overige kosten', dir === 'in' ? 'Other income' : 'Other costs');
      e.proj = F.proj.value.trim();
    }
    if (editing) {
      var oy = editing.date.slice(0, 4);
      data[oy] = (data[oy] || []).filter(function (x) { return x.id !== editing.id; });
      saveYear(oy);
    }
    if (!S.store.get('kb:set', null)) saveSet();
    var y = date.slice(0, 4);
    (data[y] = data[y] || []).push(e);
    saveYear(y);
    var was = !!editing;
    resetForm();
    if (!$('kb-year').checked) $('kb-month').value = date.slice(0, 7);
    render();
    say(failed ? T('Opslaan op dit toestel lukt niet (privévenster?). Download een back-up.', 'Saving on this device failed (private window?). Download a backup.') :
      (was ? T('Wijziging opgeslagen.', 'Change saved.') : T('Geboekt.', 'Booked.')), failed);
    F.amt.focus();
  });
  $('kb-cancel').addEventListener('click', function () { resetForm(); });

  function load(e, copy) {
    editing = copy ? null : e;
    setDir(e.dir);
    F.date.value = copy ? S.today() : e.date;
    F.acc.value = e.acc; if (e.to) F.to.value = e.to; twoCur();
    F.amt.value = S.fmt(e.c / 100); F.amt2.value = e.c2 != null ? S.fmt(e.c2 / 100) : '';
    F.cat.value = e.cat || ''; F.proj.value = e.proj || ''; F.desc.value = e.desc || ''; F.ref.value = copy ? '' : (e.ref || '');
    $('kb-ftitle').textContent = copy ? T('Boeking herhalen', 'Repeat entry') : T('Boeking wijzigen', 'Edit entry');
    $('kb-save').textContent = copy ? T('Toevoegen', 'Add') : T('Wijziging opslaan', 'Save change');
    $('kb-cancel').hidden = false;
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    F.amt.focus({ preventScroll: true });
  }

  // ---------------------------------------------------------------- list and summary
  var month = $('kb-month'), facc = $('kb-facc'), fproj = $('kb-fproj'), yearBox = $('kb-year');
  F.date.value = S.today();
  month.value = S.today().slice(0, 7);
  var NOPROJ = '\u0000none';

  function filterOpts() {
    opts(facc, [['', T('Alle rekeningen', 'All accounts')]].concat(accOptions()));
    opts(fproj, [['', T('Alle projecten', 'All projects')], [NOPROJ, T('Zonder project', 'No project')]].concat(projects().map(function (p) { return [p, p]; })));
  }
  function period() {
    var ym = month.value || S.today().slice(0, 7);
    return yearBox.checked ? { from: ym.slice(0, 4) + '-01-01', to: ym.slice(0, 4) + '-12-31', label: ym.slice(0, 4) } :
      { from: ym + '-01', to: ym + '-31', label: monthName(ym) };
  }
  function matchProj(e) {
    var p = fproj.value;
    if (!p) return true;
    if (e.dir === 'tr') return false;
    return p === NOPROJ ? !(e.proj || '').trim() : (e.proj || '').trim().toLowerCase() === p.toLowerCase();
  }
  function inView() {
    var p = period(), a = facc.value;
    return sorted(all()).filter(function (e) {
      return e.date >= p.from && e.date <= p.to && (!a || e.acc === a || e.to === a) && matchProj(e);
    });
  }
  // totals per currency: in, out (result) and neutral moves, all in cents
  function totals(list) {
    var t = {};
    list.forEach(function (e) {
      if (e.dir === 'tr') return;
      var c = curOf(e), x = t[c] = t[c] || { inn: 0, out: 0, nin: 0, nout: 0, cats: {} };
      var neu = isNeutral(e.cat);
      if (e.dir === 'in') { if (neu) x.nin += e.c; else x.inn += e.c; }
      else {
        if (neu) x.nout += e.c; else x.out += e.c;
        if (!neu) x.cats[e.cat] = (x.cats[e.cat] || 0) + e.c;
      }
    });
    return t;
  }

  function render() {
    filterOpts(); fillLists();
    var list = inView(), a = facc.value, p = period();
    var showBal = !!a && !fproj.value;
    $('kb-balh').hidden = !showBal;
    var run = showBal ? balance(a, addDays(p.from, -1)) : 0;
    $('kb-rows').innerHTML = list.length ? list.map(function (e) {
      var acc = accOf(e.acc), cur = acc ? acc.cur : 'SRD', inC = 0, outC = 0, label;
      if (e.dir === 'tr') {
        var to = accOf(e.to);
        if (a) { var ef = effect(e, a); if (ef > 0) inC = ef; else outC = -ef; cur = accOf(a).cur; }
        label = '<span class="pill">' + T('overboeking', 'transfer') + '</span> ' + E((acc ? acc.name : '?') + ' → ' + (to ? to.name : '?'));
        if (!a) label += ' <span class="tnum">' + E(m(e.c, acc ? acc.cur : 'SRD') + (e.c2 != null && to ? ' → ' + m(e.c2, to.cur) : '')) + '</span>';
      } else {
        if (e.dir === 'in') inC = e.c; else outC = e.c;
        label = '<span class="pill ' + (e.dir === 'in' ? 'green' : 'gold') + '">' + E(e.cat) + '</span>' + (e.proj ? ' <span class="pill">' + E(e.proj) + '</span>' : '');
      }
      if (showBal) run += effect(e, a);
      var note = [e.desc, e.ref ? '#' + e.ref : '', !a && e.dir !== 'tr' && acc ? acc.name : ''].filter(Boolean).join(' · ');
      return '<tr><td data-l="' + T('Datum', 'Date') + '">' + dshort(e.date) + '</td><td class="kb-d" data-l="' + T('Omschrijving', 'Description') + '" style="text-align:left">' + label + (note ? '<div class="sub" style="font-size:.86rem;margin-top:2px">' + E(note) + '</div>' : '') + '</td>' +
        '<td class="r" data-l="In">' + (inC ? '<span style="color:var(--up)">' + f2(inC) + '</span>' + (cur !== 'SRD' ? ' ' + cur : '') : '') + '</td>' +
        '<td class="r" data-l="' + T('Uit', 'Out') + '">' + (outC ? f2(outC) + (cur !== 'SRD' ? ' ' + cur : '') : '') + '</td>' +
        (showBal ? '<td class="r" data-l="' + T('Saldo', 'Balance') + '"' + (run < 0 ? ' style="color:#b2341b;font-weight:700"' : '') + '>' + f2(run) + '</td>' : '') +
        '<td class="r kb-act"><button type="button" class="btn alt sm" data-a="edit" data-id="' + e.id + '" aria-label="' + T('Wijzigen', 'Edit') + '" title="' + T('Wijzigen', 'Edit') + '">&#9998;</button> ' +
        '<button type="button" class="btn alt sm" data-a="copy" data-id="' + e.id + '" aria-label="' + T('Herhalen', 'Repeat') + '" title="' + T('Herhalen met datum van vandaag', 'Repeat with today\'s date') + '">&#10227;</button> ' +
        '<button type="button" class="btn alt sm" data-a="del" data-id="' + e.id + '" aria-label="' + T('Verwijderen', 'Delete') + '" title="' + T('Verwijderen', 'Delete') + '">&times;</button></td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">' + T('Nog geen boekingen in deze periode.', 'No entries in this period yet.') + '</td></tr>';
    summary(list, p);
    renderProj(); renderAcc();
  }
  function addDays(d, n) { return S.addDays(d, n); }

  function summary(list, p) {
    var t = totals(list), curs = Object.keys(t), h = '<div class="sub">' + E(p.label) + (fproj.value ? ' · ' + E(fproj.value === NOPROJ ? T('zonder project', 'no project') : fproj.value) : '') + '</div>';
    if (!curs.length) curs = ['SRD'], t.SRD = { inn: 0, out: 0, nin: 0, nout: 0, cats: {} };
    curs.forEach(function (c, i) {
      var x = t[c], res = x.inn - x.out;
      h += (i ? '<div style="height:16px"></div>' : '') + '<div class="sub">' + T('Resultaat', 'Result') + (curs.length > 1 ? ' ' + c : '') + '</div><div class="big tnum"' + (res < 0 ? ' style="color:#b2341b"' : '') + '>' + m(res, c) + '</div><table>' +
        '<tr><td>' + T('Ontvangsten', 'Income') + '</td><td class="r">' + m(x.inn, c) + '</td></tr>' +
        '<tr><td>' + T('Uitgaven', 'Expenses') + '</td><td class="r">- ' + m(x.out, c) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Resultaat', 'Result') + '</td><td class="r">' + m(res, c) + '</td></tr>' +
        (x.nin || x.nout ? '<tr><td>' + T('Privé en leningen in', 'Private and loans in') + '</td><td class="r">' + m(x.nin, c) + '</td></tr><tr><td>' + T('Privé en leningen uit', 'Private and loans out') + '</td><td class="r">- ' + m(x.nout, c) + '</td></tr>' : '') +
        '</table>';
      var cats = Object.keys(x.cats).sort(function (a, b) { return x.cats[b] - x.cats[a]; });
      if (cats.length) h += '<details style="margin-top:12px"' + (cats.length <= 6 ? ' open' : '') + '><summary>' + T('Uitgaven per categorie', 'Expenses by category') + '</summary><table>' +
        cats.map(function (k) { return '<tr><td>' + E(k) + '</td><td class="r">' + m(x.cats[k], c) + '</td></tr>'; }).join('') + '</table></details>';
    });
    // balances at the end of the period
    var end = p.to > S.today() ? S.today() : p.to;
    h += '<div class="sub" style="margin-top:18px">' + T('Saldo op ', 'Balance on ') + E(S.dateLong(end)) + '</div><table>' +
      set.acc.map(function (a) { var b = balance(a.id, end); return '<tr><td>' + E(a.name) + '</td><td class="r"' + (b < 0 ? ' style="color:#b2341b"' : '') + '>' + m(b, a.cur) + '</td></tr>'; }).join('') + '</table>';
    $('kb-sum').innerHTML = h;
  }

  $('kb-rows').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var id = b.getAttribute('data-id'), e = all().filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    var act = b.getAttribute('data-a');
    if (act === 'edit' || act === 'copy') { load(e, act === 'copy'); return; }
    if (act === 'del') {
      if (!window.confirm(T('Deze boeking verwijderen?', 'Delete this entry?'))) return;
      var y = e.date.slice(0, 4);
      data[y] = data[y].filter(function (x) { return x.id !== id; });
      saveYear(y);
      if (editing && editing.id === id) resetForm();
      render();
    }
  });
  [month, facc, fproj, yearBox].forEach(function (el) { el.addEventListener('change', render); });

  // ---------------------------------------------------------------- per project
  var pyear = $('kb-pyear'), psel = $('kb-psel');
  function years() {
    var ys = {}; ys[S.today().slice(0, 4)] = 1;
    Object.keys(data).forEach(function (y) { if (data[y].length) ys[y] = 1; });
    return Object.keys(ys).sort().reverse();
  }
  function projRows(y) {
    // per project: totals per currency for the year, plus per month
    var res = {};
    all().forEach(function (e) {
      if (e.dir === 'tr' || e.date.slice(0, 4) !== y || isNeutral(e.cat)) return;
      var p = (e.proj || '').trim() || NOPROJ, key = p.toLowerCase();
      var r = res[key] = res[key] || { name: p, cur: {} };
      var c = curOf(e), x = r.cur[c] = r.cur[c] || { inn: 0, out: 0, months: {}, cats: {} };
      var mo = e.date.slice(0, 7), mm = x.months[mo] = x.months[mo] || { inn: 0, out: 0 };
      if (e.dir === 'in') { x.inn += e.c; mm.inn += e.c; } else { x.out += e.c; mm.out += e.c; x.cats[e.cat] = (x.cats[e.cat] || 0) + e.c; }
    });
    return res;
  }
  function pname(n) { return n === NOPROJ ? T('Zonder project', 'No project') : n; }
  var projCache = null;
  function renderProj() {
    opts(pyear, years().map(function (y) { return [y, y]; }));
    var y = pyear.value, res = projRows(y), keys = Object.keys(res).sort(function (a, b) { return a === NOPROJ.toLowerCase() ? 1 : b === NOPROJ.toLowerCase() ? -1 : a < b ? -1 : 1; });
    projCache = { y: y, res: res };
    opts(psel, [['', T('Alle projecten', 'All projects')]].concat(keys.map(function (k) { return [k, pname(res[k].name)]; })));
    var sel = psel.value, body = $('kb-pbody'), h = '';
    if (!keys.length) {
      body.innerHTML = '<p class="empty">' + T('Nog geen boekingen met een project in ' + y + '. Vul bij een uitgave of ontvangst een project in, dan verschijnt het hier.', 'No entries with a project in ' + y + ' yet. Fill in a project with an expense or income and it shows up here.') + '</p>';
      $('kb-psum').innerHTML = '<div class="sub">' + y + '</div><div class="big tnum">0</div><p class="sub">' + T('projecten', 'projects') + '</p>';
      return;
    }
    if (!sel) {
      h = '<table class="tbl stack"><thead><tr><th>' + T('Project', 'Project') + '</th><th class="r">' + T('In', 'In') + '</th><th class="r">' + T('Uit', 'Out') + '</th><th class="r">' + T('Resultaat', 'Result') + '</th></tr></thead><tbody>';
      keys.forEach(function (k) {
        var r = res[k];
        Object.keys(r.cur).forEach(function (c) {
          var x = r.cur[c], d = x.inn - x.out, cs = c !== 'SRD' ? ' ' + c : '';
          h += '<tr><td data-l="" style="text-align:left"><button type="button" class="linkish" data-p="' + E(k) + '" style="background:none;border:0;padding:0;font:inherit;font-weight:650;color:var(--brand-2);cursor:pointer;text-align:left;min-height:32px">' + E(pname(r.name)) + '</button></td>' +
            '<td class="r" data-l="In">' + f2(x.inn) + cs + '</td><td class="r" data-l="' + T('Uit', 'Out') + '">' + f2(x.out) + cs + '</td><td class="r" data-l="' + T('Resultaat', 'Result') + '" style="font-weight:700' + (d < 0 ? ';color:#b2341b' : '') + '">' + f2(d) + cs + '</td></tr>';
        });
      });
      body.innerHTML = h + '</tbody></table><p class="sub" style="margin-top:8px">' + T('Klik op een project voor de cijfers per maand. Privé en leningen tellen niet mee.', 'Click a project for the figures per month. Private and loans are left out.') + '</p>';
      var tot = {};
      keys.forEach(function (k) { Object.keys(res[k].cur).forEach(function (c) { var x = res[k].cur[c]; tot[c] = tot[c] || { inn: 0, out: 0 }; tot[c].inn += x.inn; tot[c].out += x.out; }); });
      var ph = '<div class="sub">' + T('Alle projecten', 'All projects') + ' · ' + y + '</div><div class="big tnum">' + keys.filter(function (k) { return k !== NOPROJ.toLowerCase(); }).length + '</div><p class="sub" style="margin:0">' + T('projecten met boekingen', 'projects with entries') + '</p><table>';
      Object.keys(tot).forEach(function (c) { ph += '<tr><td>' + T('Ontvangsten', 'Income') + '</td><td class="r">' + m(tot[c].inn, c) + '</td></tr><tr><td>' + T('Uitgaven', 'Expenses') + '</td><td class="r">- ' + m(tot[c].out, c) + '</td></tr><tr class="tot"><td>' + T('Resultaat', 'Result') + '</td><td class="r">' + m(tot[c].inn - tot[c].out, c) + '</td></tr>'; });
      $('kb-psum').innerHTML = ph + '</table>';
      return;
    }
    var r = res[sel];
    Object.keys(r.cur).forEach(function (c) {
      var x = r.cur[c], cs = c !== 'SRD' ? ' (' + c + ')' : '';
      h += '<h3 style="font-size:1.05rem;margin:4px 0 8px">' + E(pname(r.name)) + cs + ' · ' + T('per maand', 'per month') + '</h3><table class="tbl stack"><thead><tr><th>' + T('Maand', 'Month') + '</th><th class="r">In</th><th class="r">' + T('Uit', 'Out') + '</th><th class="r">' + T('Resultaat', 'Result') + '</th><th class="r">' + T('Cumulatief', 'Running') + '</th></tr></thead><tbody>';
      var cum = 0;
      Object.keys(x.months).sort().forEach(function (mo) {
        var v = x.months[mo], d = v.inn - v.out; cum += d;
        h += '<tr><td data-l="" style="text-align:left;font-weight:600">' + E(monthName(mo)) + '</td><td class="r" data-l="In">' + f2(v.inn) + '</td><td class="r" data-l="' + T('Uit', 'Out') + '">' + f2(v.out) + '</td><td class="r" data-l="' + T('Resultaat', 'Result') + '"' + (d < 0 ? ' style="color:#b2341b"' : '') + '>' + f2(d) + '</td><td class="r" data-l="' + T('Cumulatief', 'Running') + '" style="font-weight:700' + (cum < 0 ? ';color:#b2341b' : '') + '">' + f2(cum) + '</td></tr>';
      });
      h += '</tbody></table>';
      var cats = Object.keys(x.cats).sort(function (a, b) { return x.cats[b] - x.cats[a]; });
      if (cats.length) h += '<h3 style="font-size:1rem;margin:18px 0 6px">' + T('Uitgaven per categorie', 'Expenses by category') + '</h3><table class="tbl stack"><tbody>' + cats.map(function (k) { return '<tr><td data-l="" style="text-align:left">' + E(k) + '</td><td class="r" data-l="">' + m(x.cats[k], c) + '</td></tr>'; }).join('') + '</tbody></table>';
    });
    h += '<p style="margin-top:12px"><button type="button" class="btn alt sm" id="kb-pshow">' + T('Boekingen van dit project tonen', 'Show this project\'s entries') + '</button></p>';
    body.innerHTML = h;
    var ph2 = '<div class="sub">' + E(pname(r.name)) + ' · ' + y + '</div>';
    Object.keys(r.cur).forEach(function (c, i) {
      var x = r.cur[c], d = x.inn - x.out;
      ph2 += (i ? '<div style="height:14px"></div>' : '') + '<div class="big tnum"' + (d < 0 ? ' style="color:#b2341b"' : '') + '>' + m(d, c) + '</div><table><tr><td>' + T('Ontvangsten', 'Income') + '</td><td class="r">' + m(x.inn, c) + '</td></tr><tr><td>' + T('Uitgaven', 'Expenses') + '</td><td class="r">- ' + m(x.out, c) + '</td></tr>' +
        '<tr class="tot"><td>' + T('Resultaat', 'Result') + '</td><td class="r">' + m(d, c) + '</td></tr>' + (x.inn > 0 ? '<tr><td>' + T('Marge', 'Margin') + '</td><td class="r">' + S.fmt(d / x.inn * 100, 1) + '%</td></tr>' : '') + '</table>';
    });
    $('kb-psum').innerHTML = ph2;
  }
  $('kb-pbody').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-p]');
    if (b) { psel.value = b.getAttribute('data-p'); renderProj(); return; }
    if (ev.target.id === 'kb-pshow' && projCache && psel.value) {
      var r = projCache.res[psel.value];
      fproj.value = r.name; facc.value = ''; yearBox.checked = true; month.value = projCache.y + month.value.slice(4);
      tab('book'); render();
    }
  });
  pyear.addEventListener('change', function () { psel.value = ''; renderProj(); });
  psel.addEventListener('change', renderProj);

  // ---------------------------------------------------------------- accounts
  var af = $('kb-af'), AF = af.elements, accEdit = null;
  function renderAcc() {
    var today = S.today(), used = {};
    all().forEach(function (e) { used[e.acc] = 1; if (e.to) used[e.to] = 1; });
    $('kb-accs').innerHTML = set.acc.map(function (a) {
      var b = balance(a.id, today);
      return '<li><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>' + E(a.name) + '</b><b class="tnum"' + (b < 0 ? ' style="color:#b2341b"' : '') + '>' + m(b, a.cur) + '</b></div>' +
        '<div class="meta"><span>' + (a.type === 'cash' ? T('Kas', 'Cash') : a.type === 'mobile' ? T('Mobiel geld', 'Mobile money') : T('Bank', 'Bank')) + '</span><span>' + T('beginsaldo ', 'opening ') + m(a.open || 0, a.cur) + '</span></div>' +
        '<div class="btns" style="margin-top:6px"><button type="button" class="btn alt sm" data-ae="' + a.id + '">' + T('Wijzigen', 'Edit') + '</button>' +
        (used[a.id] || set.acc.length < 2 ? '' : '<button type="button" class="btn alt sm" data-ad="' + a.id + '">' + T('Verwijderen', 'Delete') + '</button>') + '</div></li>';
    }).join('');
    var per = {};
    set.acc.forEach(function (a) { per[a.cur] = (per[a.cur] || 0) + balance(a.id, today); });
    var cs = Object.keys(per);
    $('kb-asum').innerHTML = '<div class="sub">' + T('Totaal in kas en bank vandaag', 'Total in cash and bank today') + '</div>' +
      cs.map(function (c, i) { return '<div class="big tnum"' + (i ? ' style="font-size:1.6rem"' : '') + '>' + m(per[c], c) + '</div>'; }).join('') +
      '<p class="sub" style="margin-top:12px">' + T('Klopt een saldo niet met je bankafschrift of de kas? Zoek het verschil in de boekingen van die rekening, of pas het beginsaldo aan.', 'A balance does not match your bank statement or the cash? Look for the difference in that account\'s entries, or adjust the opening balance.') + '</p>';
  }
  function resetAcc() { accEdit = null; af.reset(); AF.open.value = '0'; $('kb-af-t').textContent = T('Rekening toevoegen', 'Add an account'); $('kb-acancel').hidden = true; AF.cur.disabled = false; }
  af.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = AF.name.value.trim();
    if (!name) { AF.name.focus(); return; }
    if (accEdit) { accEdit.name = name; accEdit.type = AF.type.value; accEdit.open = cents(AF.open.value); if (!AF.cur.disabled) accEdit.cur = AF.cur.value; }
    else set.acc.push({ id: uid(), name: name, type: AF.type.value, cur: AF.cur.value, open: cents(AF.open.value) });
    saveSet(); resetAcc(); render();
  });
  $('kb-acancel').addEventListener('click', resetAcc);
  $('kb-accs').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-ae],[data-ad]'); if (!b) return;
    if (b.hasAttribute('data-ad')) {
      if (!window.confirm(T('Deze rekening verwijderen?', 'Delete this account?'))) return;
      set.acc = set.acc.filter(function (a) { return a.id !== b.getAttribute('data-ad'); });
      saveSet(); render(); return;
    }
    var a = accOf(b.getAttribute('data-ae')); if (!a) return;
    accEdit = a; AF.name.value = a.name; AF.type.value = a.type; AF.cur.value = a.cur; AF.open.value = S.fmt((a.open || 0) / 100);
    var used = all().some(function (e) { return e.acc === a.id || e.to === a.id; });
    AF.cur.disabled = used;
    $('kb-af-t').textContent = T('Rekening wijzigen', 'Edit account') + (used ? T(' (valuta ligt vast door boekingen)', ' (currency fixed by entries)') : '');
    $('kb-acancel').hidden = false; AF.name.focus();
  });

  // ---------------------------------------------------------------- tabs
  var TABS = ['book', 'proj', 'acc'];
  function tab(k) {
    TABS.forEach(function (t) {
      var b = $('kb-t-' + t), on = t === k;
      b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
      $('kb-p-' + t).hidden = !on;
    });
    try { history.replaceState(null, '', k === 'book' ? location.pathname : '#' + k); } catch (e) { /* ignore */ }
  }
  S.$$('#kb-tabs [role=tab]').forEach(function (b, i) {
    b.addEventListener('click', function () { tab(TABS[i]); });
    b.addEventListener('keydown', function (ev) {
      var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      ev.preventDefault(); var n = TABS[(i + d + TABS.length) % TABS.length]; tab(n); $('kb-t-' + n).focus();
    });
  });

  // ---------------------------------------------------------------- report, CSV, backup
  function head(title, sub) {
    var b = S.store.get('biz', {}) || {};
    return '<div class="ph"><div>' + (b.logo ? '<img src="' + b.logo + '" alt=""><br>' : '') + '<b>' + E(b.s_name || '') + '</b></div><div style="text-align:right"><div class="dh">' + E(title) + '</div><div class="pm">' + E(sub) + '</div></div></div>';
  }
  function printHtml(h) {
    var d = $('kb-doc'); d.innerHTML = h + '<div class="pf">' + T('Gemaakt met het gratis kasboek van surinamebusiness.com op ', 'Made with the free cash book on surinamebusiness.com on ') + E(S.dateLong(S.today())) + '</div>';
    S.printDoc();
  }
  $('kb-print').addEventListener('click', function () {
    var list = inView(), p = period(), a = facc.value, t = totals(list);
    var sub = p.label + (a ? ' · ' + accOf(a).name : '') + (fproj.value ? ' · ' + (fproj.value === NOPROJ ? T('zonder project', 'no project') : fproj.value) : '');
    var h = head(T('Kasboek en bankboek', 'Cash and bank book'), sub) + '<table><thead><tr><th>' + T('Datum', 'Date') + '</th><th>' + T('Rekening', 'Account') + '</th><th>' + T('Omschrijving', 'Description') + '</th><th class="r">In</th><th class="r">' + T('Uit', 'Out') + '</th></tr></thead><tbody>';
    list.forEach(function (e) {
      var acc = accOf(e.acc), cur = acc ? acc.cur : 'SRD', inC = 0, outC = 0, txt;
      if (e.dir === 'tr') { var to = accOf(e.to); txt = T('Overboeking naar ', 'Transfer to ') + (to ? to.name : '?'); if (a) { var ef = effect(e, a); if (ef > 0) inC = ef; else outC = -ef; } else outC = 0; }
      else { txt = e.cat + (e.proj ? ' · ' + e.proj : ''); if (e.dir === 'in') inC = e.c; else outC = e.c; }
      var cs = cur !== 'SRD' ? ' ' + cur : '';
      h += '<tr><td>' + dshort(e.date) + '</td><td>' + E(acc ? acc.name : '') + '</td><td>' + E(txt) + (e.desc || e.ref ? '<div class="pm">' + E([e.desc, e.ref ? '#' + e.ref : ''].filter(Boolean).join(' · ')) + '</div>' : '') + '</td><td class="r">' + (inC ? f2(inC) + cs : '') + '</td><td class="r">' + (outC ? f2(outC) + cs : '') + '</td></tr>';
    });
    h += '</tbody></table>';
    Object.keys(t).forEach(function (c) {
      var x = t[c];
      h += '<table class="tots"><tbody><tr><td>' + T('Ontvangsten', 'Income') + '</td><td class="r">' + m(x.inn, c) + '</td></tr><tr><td>' + T('Uitgaven', 'Expenses') + '</td><td class="r">- ' + m(x.out, c) + '</td></tr>' +
        (x.nin || x.nout ? '<tr><td>' + T('Privé en leningen (saldo)', 'Private and loans (net)') + '</td><td class="r">' + m(x.nin - x.nout, c) + '</td></tr>' : '') +
        '<tr class="g"><td>' + T('Resultaat', 'Result') + '</td><td class="r">' + m(x.inn - x.out, c) + '</td></tr></tbody></table>';
    });
    var end = p.to > S.today() ? S.today() : p.to;
    h += '<div class="pn"><b>' + T('Saldo op ', 'Balance on ') + E(S.dateLong(end)) + '</b>\n' + set.acc.map(function (x) { return x.name + ': ' + m(balance(x.id, end), x.cur); }).join('\n') + '</div>';
    printHtml(h);
  });
  $('kb-pprint').addEventListener('click', function () {
    if (!projCache) return;
    var y = projCache.y, res = projCache.res, keys = psel.value ? [psel.value] : Object.keys(res);
    var h = head(T('Projectoverzicht', 'Project report'), (psel.value ? pname(res[psel.value].name) + ' · ' : '') + y);
    keys.forEach(function (k) {
      var r = res[k];
      Object.keys(r.cur).forEach(function (c) {
        var x = r.cur[c];
        h += '<div class="lbl" style="margin:16px 0 4px">' + E(pname(r.name)) + (c !== 'SRD' ? ' (' + c + ')' : '') + '</div><table><thead><tr><th>' + T('Maand', 'Month') + '</th><th class="r">In</th><th class="r">' + T('Uit', 'Out') + '</th><th class="r">' + T('Resultaat', 'Result') + '</th></tr></thead><tbody>';
        Object.keys(x.months).sort().forEach(function (mo) { var v = x.months[mo]; h += '<tr><td>' + E(monthName(mo)) + '</td><td class="r">' + f2(v.inn) + '</td><td class="r">' + f2(v.out) + '</td><td class="r">' + f2(v.inn - v.out) + '</td></tr>'; });
        h += '</tbody></table><table class="tots"><tbody><tr class="g"><td>' + T('Resultaat ', 'Result ') + y + '</td><td class="r">' + m(x.inn - x.out, c) + '</td></tr></tbody></table>';
      });
    });
    printHtml(h);
  });
  $('kb-csv').addEventListener('click', function () {
    var p = period(), out = [[T('Datum', 'Date'), T('Rekening', 'Account'), T('Soort', 'Type'), T('Categorie', 'Category'), T('Project', 'Project'), T('Omschrijving', 'Description'), T('Bonnummer', 'Receipt no.'), T('Ontvangst', 'In'), T('Uitgave', 'Out'), T('Valuta', 'Currency'), T('Naar rekening', 'To account'), T('Ontvangen op andere rekening', 'Received in other account')]];
    inView().forEach(function (e) {
      var acc = accOf(e.acc), to = e.to ? accOf(e.to) : null;
      out.push([e.date, acc ? acc.name : '', e.dir === 'in' ? T('ontvangst', 'income') : e.dir === 'out' ? T('uitgave', 'expense') : T('overboeking', 'transfer'), e.cat || '', e.proj || '', e.desc || '', e.ref || '',
        e.dir === 'in' ? f2(e.c) : '', e.dir !== 'in' ? f2(e.c) : '', acc ? acc.cur : 'SRD', to ? to.name : '', e.c2 != null ? f2(e.c2) : '']);
    });
    S.download(S.csv(out), 'kasboek-' + (yearBox.checked ? p.label : month.value) + '.csv', 'text/csv;charset=utf-8');
  });
  $('kb-pcsv').addEventListener('click', function () {
    if (!projCache) return;
    var out = [[T('Project', 'Project'), T('Maand', 'Month'), T('Valuta', 'Currency'), 'In', T('Uit', 'Out'), T('Resultaat', 'Result')]], res = projCache.res;
    (psel.value ? [psel.value] : Object.keys(res)).forEach(function (k) {
      Object.keys(res[k].cur).forEach(function (c) {
        var x = res[k].cur[c];
        Object.keys(x.months).sort().forEach(function (mo) { var v = x.months[mo]; out.push([pname(res[k].name), mo, c, f2(v.inn), f2(v.out), f2(v.inn - v.out)]); });
      });
    });
    S.download(S.csv(out), 'projecten-' + projCache.y + '.csv', 'text/csv;charset=utf-8');
  });
  $('kb-backup').addEventListener('click', function () {
    S.download(JSON.stringify({ app: 'surinamebusiness-kasboek', v: 1, set: set, data: all() }), 'kasboek-backup-' + S.today() + '.json', 'application/json');
  });
  $('kb-restore').addEventListener('change', function (ev) {
    var file = ev.target.files[0], input = ev.target; if (!file) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var j = JSON.parse(fr.result);
        if (!j || j.app !== 'surinamebusiness-kasboek' || !Array.isArray(j.data)) throw 0;
        if (j.set && Array.isArray(j.set.acc)) j.set.acc.forEach(function (a) { if (a && a.id && !accOf(a.id)) set.acc.push(a); });
        var ids = {}; all().forEach(function (x) { ids[x.id] = 1; });
        var n = 0, touched = {};
        j.data.forEach(function (x) {
          if (!x || !x.id || ids[x.id] || !/^\d{4}-\d{2}-\d{2}$/.test(x.date) || !(x.c > 0) || ['in', 'out', 'tr'].indexOf(x.dir) < 0) return;
          var y = x.date.slice(0, 4); (data[y] = data[y] || []).push(x); touched[y] = 1; n++;
        });
        saveSet(); Object.keys(touched).forEach(saveYear); render();
        window.alert(T(n + ' boekingen teruggezet.', n + ' entries restored.'));
      } catch (err) { window.alert(T('Dit is geen geldige back-up van het kasboek.', 'This is not a valid cash book backup.')); }
      input.value = '';
    };
    fr.readAsText(file);
  });

  // data arriving from the account on another device
  window.addEventListener('storage', function (ev) {
    if (!ev.key || ev.key.indexOf('sbt:kb:') !== 0) return;
    var k = ev.key.slice(4);
    if (k === 'kb:set') { var s2 = S.store.get('kb:set', null); if (s2 && Array.isArray(s2.acc) && s2.acc.length) set = s2; }
    else if (/^kb:\d{4}$/.test(k)) data[k.slice(3)] = S.store.get(k, []);
    render();
  });

  setDir('out');
  var h0 = (location.hash || '').slice(1);
  if (TABS.indexOf(h0) > 0) tab(h0);
  render();
})();
