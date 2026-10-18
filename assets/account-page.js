/* My account page: documents, customers, business details, vacancies, saved jobs, data and devices. */
(function () {
  function boot() {
    var A = window.SBA, T = A.T, NL = A.NL, P = window.SBA_PAGE || {}, st = A.store;
    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var loc = NL ? 'nl-NL' : 'en-GB';
    var money = function (x, cur) { return (cur || 'SRD') + ' ' + Number(x || 0).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    var dshort = function (s) { if (!s) return ''; var d = new Date(String(s).length === 10 ? s + 'T12:00:00' : s); return isNaN(d) ? s : d.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' }); };
    var kb = function (n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; };

    function show() {
      var u = A.user();
      $('ap-out').hidden = !!u; $('ap-in').hidden = !u;
      if (!u) return;
      $('ap-name').textContent = u.name || u.email; $('ap-email').textContent = u.email;
      $('ap-av').innerHTML = u.picture ? '<img src="' + esc(u.picture) + '" alt="" referrerpolicy="no-referrer">' : esc((u.name || u.email)[0].toUpperCase());
      $('ap-admin').hidden = u.role !== 'admin';
      renderDocs(); renderClients(); renderBiz(); renderSaved();
      var pane = (location.hash || '').replace('#', '');
      if (pane) tab(pane);
    }
    $('ap-login').onclick = function () { A.login(); };
    $('ap-logout').onclick = function () { A.logout(false, false).then(function () { location.href = NL ? '/' : '/en/'; }); };
    $('ap-logout-all').onclick = function () { if (confirm(T('Op al je apparaten uitloggen?', 'Sign out on all your devices?'))) A.logout(true, false).then(show); };
    $('ap-logout-wipe').onclick = function () {
      if (confirm(T('Uitloggen en alle tool-gegevens van dit apparaat wissen? Ze blijven in je account.', 'Sign out and clear all tool data from this device? It stays in your account.')))
        A.push(st.keys('')).then(function () { return A.logout(false, true); }).then(function () { location.href = NL ? '/' : '/en/'; });
    };

    // tabs
    function tab(name) {
      var ok = false;
      Array.prototype.forEach.call(document.querySelectorAll('#ap-tabs [data-tab]'), function (b) { var on = b.getAttribute('data-tab') === name; ok = ok || on; b.setAttribute('aria-selected', on); });
      if (!ok) return;
      Array.prototype.forEach.call(document.querySelectorAll('.tab[data-pane]'), function (p) { p.hidden = p.getAttribute('data-pane') !== name; });
      if (history.replaceState) history.replaceState(null, '', '#' + name);
      if (name === 'jobs') loadJobs();
      if (name === 'data') loadData();
    }
    $('ap-tabs').addEventListener('click', function (e) { var t = e.target.getAttribute('data-tab'); if (t) tab(t); });

    // documents
    var names = P.names || {}, urls = P.docs || {};
    Object.keys(names).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = names[k]; $('ap-docfilter').appendChild(o); });
    function allDocs() {
      return st.keys('doc:').map(function (k) { return st.get(k, null); }).filter(Boolean)
        .sort(function (a, b) { return a.saved < b.saved ? 1 : -1; });
    }
    function renderDocs() {
      var f = $('ap-docfilter').value, q = $('ap-docq').value.trim().toLowerCase();
      var list = allDocs().filter(function (d) {
        return (!f || d.doc === f) && (!q || (d.no + ' ' + (d.c_name || '')).toLowerCase().indexOf(q) >= 0);
      });
      $('ap-docs-empty').hidden = allDocs().length > 0;
      $('ap-docs').innerHTML = list.slice(0, 300).map(function (d) {
        return '<tr><td><b>' + esc(d.no) + '</b><div class="sub">' + esc(names[d.doc] || d.doc) + ' &middot; ' + esc(dshort(d.date)) + '</div></td><td>' + esc(d.c_name || '-') +
          '</td><td class="r tnum">' + (d.total == null ? '' : esc(money(d.total, d.cur))) + '</td><td class="r nowrap"><a class="btn alt sm" href="' + esc((urls[d.doc] || '#') + '?open=' + encodeURIComponent(d.id)) + '">' +
          T('Openen', 'Open') + '</a> <button type="button" class="x" data-deldoc="' + esc(d.id) + '" aria-label="' + T('Verwijderen', 'Delete') + '">&times;</button></td></tr>';
      }).join('');
    }
    $('ap-docfilter').onchange = renderDocs; $('ap-docq').oninput = renderDocs;
    $('ap-docs').addEventListener('click', function (e) {
      var id = e.target.getAttribute('data-deldoc');
      if (id && confirm(T('Dit document verwijderen?', 'Delete this document?'))) { st.del('doc:' + id); renderDocs(); }
    });
    function renderClients() {
      var cl = st.get('clients', []);
      $('ap-clients-empty').hidden = cl.length > 0;
      $('ap-clients').innerHTML = cl.map(function (c, i) {
        return '<tr><td><b>' + esc(c.name) + '</b><div class="sub">' + esc([c.addr, c.fin].filter(Boolean).join(' · ')) + '</div></td><td class="r"><button type="button" class="x" data-delcl="' + i + '" aria-label="' + T('Verwijderen', 'Delete') + '">&times;</button></td></tr>';
      }).join('');
    }
    $('ap-clients').addEventListener('click', function (e) {
      var i = e.target.getAttribute('data-delcl');
      if (i !== null && i !== undefined && i !== '') { var cl = st.get('clients', []); cl.splice(+i, 1); st.set('clients', cl); renderClients(); }
    });

    // business details (same key the document tools use)
    var BIZ = ['s_name', 's_addr', 's_phone', 's_email', 's_fin', 's_kkf', 's_bank', 'color'], logo = null;
    function renderBiz() {
      var b = st.get('biz', {}), F = $('ap-biz').elements; logo = b.logo || null;
      BIZ.forEach(function (n) { if (F[n] && b[n] !== undefined) F[n].value = b[n]; });
      $('b-logo-prev').innerHTML = logo ? '<img src="' + logo + '" alt="Logo">' : '';
      var u = A.user();
      $('p-name').value = u.name || ''; $('p-co').value = u.company || ''; $('p-ph').value = u.phone || ''; $('p-lang').value = u.lang || (NL ? 'nl' : 'en');
    }
    $('b-logo').onchange = function (e) {
      var file = e.target.files[0]; if (!file) return;
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var s = Math.min(1, 400 / Math.max(img.width, img.height)), c = document.createElement('canvas');
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          logo = c.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
          $('b-logo-prev').innerHTML = '<img src="' + logo + '" alt="Logo">';
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    };
    $('b-logo-clear').onclick = function (e) { e.preventDefault(); logo = null; $('b-logo').value = ''; $('b-logo-prev').innerHTML = ''; };
    $('b-save').onclick = function () {
      var F = $('ap-biz').elements, o = { logo: logo };
      BIZ.forEach(function (n) { o[n] = F[n].value; });
      st.set('biz', o); A.toast(T('Bedrijfsgegevens opgeslagen', 'Business details saved'));
    };
    $('p-save').onclick = function () {
      var b = this;
      A.api('/me/profile', { method: 'POST', body: { name: $('p-name').value, company: $('p-co').value, phone: $('p-ph').value, lang: $('p-lang').value } })
        .then(function (j) { if (j.ok) { A.setUser(j.user); A.toast(T('Profiel opgeslagen', 'Profile saved')); show(); } });
    };

    // vacancies
    var STATUS = { live: T('Online', 'Live'), pending: T('Wordt gecontroleerd', 'Under review'), unverified: T('Wacht op bevestiging', 'Awaiting confirmation'),
      rejected: T('Niet geplaatst', 'Not published'), closed: T('Gesloten', 'Closed'), expired: T('Verlopen', 'Expired') };
    var jobsCache = [], jobsMeta = {};
    function loadJobs() {
      $('ap-jobs').innerHTML = '<p class="sub">' + T('Laden...', 'Loading...') + '</p>';
      A.api('/me/jobs').then(function (j) {
        if (!j.ok) { $('ap-jobs').innerHTML = '<p class="err">' + T('Kon vacatures niet laden.', 'Could not load vacancies.') + '</p>'; return; }
        jobsCache = j.jobs; jobsMeta = { today: j.today, max: j.max_days }; renderJobs();
      });
    }
    function addDays(d, n) { var x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
    function renderJobs() {
      if (!jobsCache.length) { $('ap-jobs').innerHTML = '<p class="sub">' + T('Nog geen vacatures.', 'No vacancies yet.') + '</p>'; return; }
      var base = NL ? '/vacatures/' : '/en/jobs/';
      $('ap-jobs').innerHTML = jobsCache.map(function (j) {
        var acts = [];
        if (j.status === 'live') acts.push('<a class="btn alt sm" href="' + (j.lang === 'en' ? '/en/jobs/' : '/vacatures/') + esc(j.slug) + '" target="_blank" rel="noopener">' + T('Bekijken', 'View') + '</a>');
        if (['live', 'pending', 'rejected', 'unverified'].indexOf(j.status) >= 0) acts.push('<a class="btn alt sm" href="' + esc(P.postjob) + '?edit=' + j.id + '">' + T('Wijzigen', 'Edit') + '</a>');
        if (['live', 'pending'].indexOf(j.status) >= 0) acts.push('<span class="ext"><input type="date" min="' + addDays(jobsMeta.today, 1) + '" max="' + addDays(jobsMeta.today, jobsMeta.max) + '" value="' + esc(j.deadline) + '" data-dl="' + j.id + '" aria-label="' + T('Nieuwe sluitingsdatum', 'New closing date') + '"><button type="button" class="btn alt sm" data-act="extend" data-id="' + j.id + '">' + T('Verlengen', 'Extend') + '</button></span>');
        if (['live', 'pending', 'unverified'].indexOf(j.status) >= 0) acts.push('<button type="button" class="btn alt sm" data-act="close" data-id="' + j.id + '">' + T('Sluiten', 'Close') + '</button>');
        if (['closed', 'expired', 'rejected'].indexOf(j.status) >= 0) acts.push('<button type="button" class="btn alt sm" data-act="repost" data-id="' + j.id + '">' + T('Opnieuw plaatsen', 'Post again') + '</button>');
        if (j.status !== 'live') acts.push('<button type="button" class="x" data-act="delete" data-id="' + j.id + '" aria-label="' + T('Verwijderen', 'Delete') + '">&times;</button>');
        return '<div class="job-row"><div><b>' + esc(j.title) + '</b> <span class="pill st-' + esc(j.status) + '">' + esc(STATUS[j.status] || j.status) + '</span>' +
          '<div class="sub">' + esc(j.employer) + ' &middot; ' + T('sluit', 'closes') + ' ' + esc(dshort(j.deadline)) + ' &middot; ' + T('ingediend', 'submitted') + ' ' + esc(dshort(j.created_at)) + '</div>' +
          (j.status === 'rejected' && j.reject_reason ? '<div class="sub err">' + T('Reden', 'Reason') + ': ' + esc(j.reject_reason) + '</div>' : '') +
          '</div><div class="acts">' + acts.join(' ') + '</div></div>';
      }).join('');
    }
    $('ap-jobs').addEventListener('click', function (e) {
      var act = e.target.getAttribute('data-act'), id = e.target.getAttribute('data-id');
      if (!act) return;
      var body = { action: act };
      if (act === 'extend') body.deadline = document.querySelector('[data-dl="' + id + '"]').value;
      if (act === 'close' && !confirm(T('Vacature sluiten? Hij verdwijnt binnen een half uur van de site.', 'Close this vacancy? It disappears from the site within half an hour.'))) return;
      if (act === 'delete' && !confirm(T('Vacature definitief verwijderen?', 'Delete this vacancy permanently?'))) return;
      e.target.disabled = true;
      A.api('/me/jobs/' + id, { method: 'POST', body: body }).then(function (j) {
        e.target.disabled = false;
        if (!j.ok) { A.toast(j.error === 'invalid' ? T('Ongeldige datum (maximaal 60 dagen vooruit).', 'Invalid date (at most 60 days ahead).') : T('Dat lukte niet.', 'That did not work.')); return; }
        A.toast({ extend: T('Sluitingsdatum aangepast', 'Closing date changed'), close: T('Vacature gesloten', 'Vacancy closed'),
          repost: T('Opnieuw ingediend ter controle', 'Submitted again for review'), delete: T('Verwijderd', 'Deleted') }[act]);
        loadJobs();
      });
    });

    // saved jobs
    function renderSaved() {
      var s = st.get('savedjobs', []);
      $('ap-saved-empty').hidden = s.length > 0;
      $('ap-saved').innerHTML = s.map(function (j, i) {
        return '<li><a href="' + esc(j.url) + '"' + (/^https?:/.test(j.url) ? ' target="_blank" rel="noopener nofollow"' : '') + '>' + esc(j.title) + '</a><div class="meta"><span>' + esc(j.employer || '') + '</span>' +
          (j.deadline ? '<span class="pill gold">' + T('Sluit', 'Closes') + ' ' + esc(dshort(j.deadline)) + '</span>' : '') +
          '<button type="button" class="x" data-unsave="' + i + '" aria-label="' + T('Verwijderen', 'Remove') + '">&times;</button></div></li>';
      }).join('');
    }
    $('ap-saved').addEventListener('click', function (e) {
      var i = e.target.getAttribute('data-unsave');
      if (i !== null) { var s = st.get('savedjobs', []); s.splice(+i, 1); st.set('savedjobs', s); renderSaved(); }
    });

    // data and devices
    var KEYNAMES = { biz: T('Bedrijfsgegevens', 'Business details'), clients: T('Klanten', 'Customers'), savedjobs: T('Bewaarde vacatures', 'Saved jobs'),
      bk: T('BTW-register', 'VAT register'), ts: T('Urenregistratie', 'Timesheet'), pl: T('Prijslijst', 'Price list'), letter: T('Brief', 'Letter'),
      'cc:hist': T('Kas tellen (historie)', 'Cash count (history)'), 'cc:set': T('Kas tellen', 'Cash count'), sg: T('Spaardoel', 'Savings goal'),
      'rm:me': T('Herinnering: je gegevens', 'Reminder: your details'), 'rm:pay': T('Herinnering: betaalgegevens', 'Reminder: payment details'),
      'rc:by': T('Kwitantie: ontvanger', 'Receipt: received by'), 'ps:er': T('Loonstrook: werkgever', 'Payslip: employer'), 'tc:fuel': T('Ritkosten', 'Trip cost'),
      'wl:phone': T('WhatsApp-nummer', 'WhatsApp number') };
    function keyName(k) {
      if (k.indexOf('doc:') === 0) { var d = st.get(k, {}); return (names[d.doc] || T('Document', 'Document')) + ' ' + (d.no || ''); }
      if (k.indexOf('no:') === 0) return T('Volgend nummer', 'Next number') + ' (' + (names[k.slice(3)] || k.slice(3)) + ')';
      return KEYNAMES[k] || k;
    }
    function loadData() {
      A.api('/me/data?meta=1').then(function (j) {
        if (!j.ok) return;
        var live = j.items.filter(function (i) { return !i.deleted; }), tot = 0;
        live.forEach(function (i) { tot += i.size; });
        $('ap-quota').textContent = T(live.length + ' onderdelen, ' + kb(tot) + ' van 15 MB gebruikt.', live.length + ' items, ' + kb(tot) + ' of 15 MB used.');
        live.sort(function (a, b) { return b.u - a.u; });
        $('ap-keys').innerHTML = live.map(function (i) {
          return '<tr><td>' + esc(keyName(i.k)) + '<div class="sub">' + esc(dshort(new Date(i.u).toISOString())) + '</div></td><td class="r tnum">' + kb(i.size) + '</td></tr>';
        }).join('') || '<tr><td class="sub">' + T('Nog niets.', 'Nothing yet.') + '</td></tr>';
      });
      A.api('/me/sessions').then(function (j) {
        if (!j.ok) return;
        $('ap-sessions').innerHTML = j.sessions.map(function (s) {
          var ua = s.ua || '', dev = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Mac OS/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : T('Onbekend', 'Unknown');
          var br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
          return '<li>' + esc(dev + (br ? ' · ' + br : '')) + (s.current ? ' <span class="pill brand">' + T('dit apparaat', 'this device') + '</span>' : '') +
            '<div class="meta"><span>' + T('laatst actief', 'last active') + ' ' + esc(dshort(s.last_seen_at)) + '</span></div></li>';
        }).join('');
      });
    }
    $('ap-sync').onclick = function () { var b = this; b.disabled = true; A.push(st.keys('')).then(function () { return A.sync(false); }).then(function () { b.disabled = false; A.toast(T('Gesynchroniseerd', 'Synced')); loadData(); show(); }); };
    $('ap-export').onclick = function () {
      A.api('/me/export').then(function (j) {
        if (!j.ok) return;
        delete j._status;
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(j, null, 2)], { type: 'application/json' }));
        a.download = 'surinamebusiness-account.json'; document.body.appendChild(a); a.click(); a.remove();
      });
    };
    $('ap-delete').onclick = function () {
      var w = T('VERWIJDEREN', 'DELETE');
      var ans = prompt(T('Typ ' + w + ' om je account en alle gegevens erin te verwijderen.', 'Type ' + w + ' to delete your account and all data in it.'));
      if (ans !== w) return;
      A.api('/me', { method: 'DELETE' }).then(function (j) {
        if (j.ok) { A.setUser(null); alert(T('Je account is verwijderd.', 'Your account has been deleted.')); location.href = NL ? '/' : '/en/'; }
      });
    };

    window.addEventListener('sba:user', show);
    window.addEventListener('sba:synced', function () { if (A.user()) { renderDocs(); renderClients(); renderBiz(); renderSaved(); } });
    show();
  }
  if (window.SBA) boot(); else window.addEventListener('sba:ready', boot);
})();
