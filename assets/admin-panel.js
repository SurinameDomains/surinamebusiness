/* Admin panel for surinamebusiness.com. All data comes from sb-api (/admin/*); only admins get answers. */
(function () {
  function boot() {
    var A = window.SBA, $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var dt = function (s) { if (!s) return '-'; var d = new Date(s); return isNaN(d) ? esc(s) : d.toLocaleString('nl-NL', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }); };
    var day = function (s) { if (!s) return '-'; var d = new Date(String(s).length === 10 ? s + 'T12:00:00' : s); return isNaN(d) ? esc(s) : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }); };
    var kb = function (n) { n = n || 0; return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB'; };
    var ST = { live: 'Online', pending: 'Wacht op goedkeuring', unverified: 'Niet bevestigd', rejected: 'Afgewezen', closed: 'Gesloten', expired: 'Verlopen' };
    var KIND = { banner: 'Banner', notice: 'Mededeling', news: 'Nieuws', tender: 'Aanbesteding', link: 'Uitgelichte link', company: 'Bedrijf' };
    var loaded = {};

    function gate() {
      var u = A.user();
      $('adm-out').hidden = !!u; $('adm-in').hidden = true; $('adm-deny').hidden = true;
      if (!u) return;
      if (u.role !== 'admin') { $('adm-deny').hidden = false; return; }
      $('adm-in').hidden = false;
      tab((location.hash || '#home').slice(1));
    }
    $('adm-login').onclick = function () { A.login('Log in met je beheerdersaccount.'); };

    function tab(name) {
      var ok = false;
      Array.prototype.forEach.call(document.querySelectorAll('#adm-tabs [data-tab]'), function (b) { var on = b.getAttribute('data-tab') === name; ok = ok || on; b.setAttribute('aria-selected', on); });
      if (!ok) name = 'home';
      Array.prototype.forEach.call(document.querySelectorAll('#adm .tab[data-pane]'), function (p) { p.hidden = p.getAttribute('data-pane') !== name; });
      if (history.replaceState) history.replaceState(null, '', '#' + name);
      ({ home: loadHome, jobs: loadJobs, users: loadUsers, content: loadContent, messages: loadMessages, settings: loadSettings, log: loadLog })[name]();
    }
    $('adm-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) tab(b.getAttribute('data-tab')); });
    function fail(j) { A.toast('Mislukt: ' + (j && (j.error + (j.field ? ' (' + j.field + ')' : '')) || 'onbekend')); }

    // ---------------------------------------------------------------- overview
    function bars(el, series, days) {
      var map = {}; (series || []).forEach(function (r) { map[r.day] = r.n; });
      var out = [], max = 1, d = new Date();
      for (var i = days - 1; i >= 0; i--) { var x = new Date(d.getTime() - i * 864e5).toISOString().slice(0, 10); out.push([x, map[x] || 0]); max = Math.max(max, map[x] || 0); }
      el.innerHTML = out.map(function (p) { return '<span title="' + p[0] + ': ' + p[1] + '" style="height:' + Math.max(3, Math.round(p[1] / max * 100)) + '%"></span>'; }).join('');
    }
    function loadHome() {
      A.api('/admin/stats').then(function (j) {
        if (!j.ok) return fail(j);
        var jb = j.jobs || {};
        $('cnt-jobs').textContent = jb.pending ? jb.pending : '';
        $('cnt-msg').textContent = j.messages_new ? j.messages_new : '';
        var k = [['Accounts', j.users.total, '+' + j.users.new7 + ' deze week'], ['Actief (7 dagen)', j.users.active7, j.users.employers + ' werkgevers'],
          ['Vacatures online', jb.live || 0, (jb.pending || 0) + ' wachten op goedkeuring'], ['Nieuwe berichten', j.messages_new, ''],
          ['Opgeslagen gegevens', kb(j.data.bytes), j.data.n + ' onderdelen'], ['Beheerders', j.users.admins, j.users.blocked + ' geblokkeerd']];
        $('adm-kpis').innerHTML = k.map(function (x) { return '<div class="kpi"><div class="sub">' + x[0] + '</div><b>' + esc(x[1]) + '</b><div class="sub">' + esc(x[2]) + '</div></div>'; }).join('');
        bars($('adm-signups'), j.signups, 30); bars($('adm-jobseries'), j.job_series, 30);
      });
      fetch('/status.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (s) {
        $('adm-built').textContent = 'Laatste build ' + dt(s.built_at) + ', ' + s.pages + " pagina's";
        var rows = [];
        Object.keys(s.feeds).forEach(function (k) {
          var f = s.feeds[k], age = f.age_h, bad = age === null || age > 48, warn = !bad && age > 6;
          var srcBad = Object.keys(f.sources || {}).filter(function (x) { return f.sources[x].ok === false; });
          rows.push('<tr><td><b>' + esc(k) + '</b>' + (srcBad.length ? '<div class="sub err">Faalt: ' + esc(srcBad.join(', ')) + '</div>' : '') + '</td><td>' + (f.fetched_at ? dt(f.fetched_at) : '-') +
            '</td><td><span class="pill ' + (bad ? 'st-rejected' : warn ? 'gold' : 'st-live') + '">' + (age === null ? 'onbekend' : age < 1 ? 'vers' : Math.round(age) + ' uur oud') + '</span></td></tr>');
        });
        $('adm-feeds').innerHTML = rows.join('');
      }).catch(function () { $('adm-feeds').innerHTML = '<tr><td colspan="3" class="sub">status.json niet beschikbaar</td></tr>'; });
    }

    // ---------------------------------------------------------------- vacancies
    var jobs = [], jtoday = '';
    function loadJobs() {
      var q = '?status=' + encodeURIComponent($('j-status').value) + '&q=' + encodeURIComponent($('j-q').value.trim());
      $('adm-jobs').innerHTML = '<p class="sub">Laden...</p>';
      A.api('/admin/jobs' + q).then(function (j) {
        if (!j.ok) return fail(j);
        jobs = j.jobs; jtoday = j.today; renderJobs();
      });
    }
    function renderJobs() {
      if (!jobs.length) { $('adm-jobs').innerHTML = '<div class="card sub">Geen vacatures in deze selectie.</div>'; return; }
      $('adm-jobs').innerHTML = jobs.map(function (j) {
        var a = [];
        if (['pending', 'unverified', 'rejected', 'closed'].indexOf(j.status) >= 0) a.push('<button class="btn sm" data-ja="approve" data-id="' + j.id + '">Goedkeuren</button>');
        if (['pending', 'unverified', 'live'].indexOf(j.status) >= 0) a.push('<button class="btn alt sm" data-ja="reject" data-id="' + j.id + '">Afwijzen</button>');
        if (j.status === 'live') a.push('<button class="btn alt sm" data-ja="takedown" data-id="' + j.id + '">Offline halen</button>');
        a.push('<button class="btn alt sm" data-ja="edit" data-id="' + j.id + '">Bewerken</button>');
        a.push('<span class="ext"><input type="date" data-dl="' + j.id + '" value="' + esc(j.deadline) + '"><button class="btn alt sm" data-ja="extend" data-id="' + j.id + '">Datum</button></span>');
        a.push('<button class="x" data-ja="delete" data-id="' + j.id + '" title="Verwijderen">&times;</button>');
        var sal = (j.salary_min || j.salary_max) ? esc(j.salary_currency + ' ' + (j.salary_min || '') + (j.salary_max ? '-' + j.salary_max : '') + ' / ' + j.salary_period) : '';
        return '<details class="card job-adm"' + (j.status === 'pending' ? ' open' : '') + '><summary><b>' + esc(j.title) + '</b> <span class="pill st-' + j.status + '">' + ST[j.status] + '</span>' +
          '<div class="sub">' + esc(j.employer) + ' &middot; ' + esc(j.location) + ' &middot; sluit ' + day(j.deadline) + ' &middot; ingediend ' + dt(j.created_at) + (j.owner ? ' &middot; via account' : '') + '</div></summary>' +
          '<div class="grid g2"><div><p class="pre">' + esc(j.description) + '</p></div><div><table class="tbl"><tbody>' +
          '<tr><td>Contact (privé)</td><td>' + esc(j.contact_name) + '<br><a href="mailto:' + esc(j.contact_email) + '">' + esc(j.contact_email) + '</a>' + (j.contact_phone ? '<br>' + esc(j.contact_phone) : '') + '</td></tr>' +
          '<tr><td>Solliciteren</td><td>' + esc([j.apply_email, j.apply_url].filter(Boolean).join(' / ')) + '</td></tr>' +
          (j.employer_url ? '<tr><td>Website</td><td><a href="' + esc(j.employer_url) + '" target="_blank" rel="noopener nofollow">' + esc(j.employer_url) + '</a></td></tr>' : '') +
          (sal ? '<tr><td>Salaris</td><td>' + sal + '</td></tr>' : '') +
          '<tr><td>Type / taal</td><td>' + esc(j.employment_type) + ' / ' + esc(j.lang) + '</td></tr>' +
          (j.has_pdf ? '<tr><td>PDF</td><td><a href="' + A.apiBase + '/admin/jobs/' + j.id + '/pdf" target="_blank" rel="noopener">Bekijken</a></td></tr>' : '') +
          (j.status === 'live' ? '<tr><td>Op de site</td><td><a href="' + esc(j.url) + '" target="_blank" rel="noopener">Openen</a></td></tr>' : '') +
          (j.reject_reason ? '<tr><td>Reden afwijzing</td><td>' + esc(j.reject_reason) + '</td></tr>' : '') +
          '</tbody></table></div></div><div class="acts">' + a.join(' ') + '</div></details>';
      }).join('');
    }
    $('j-status').onchange = loadJobs;
    var jqT; $('j-q').oninput = function () { clearTimeout(jqT); jqT = setTimeout(loadJobs, 350); };
    $('adm-jobs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ja]'); if (!b) return;
      var act = b.getAttribute('data-ja'), id = b.getAttribute('data-id'), body = { action: act };
      if (act === 'edit') return editJob(id);
      if (act === 'reject') { var r = prompt('Reden (zichtbaar voor de werkgever in zijn account):', ''); if (r === null) return; body.reason = r; }
      if (act === 'delete' && !confirm('Vacature definitief verwijderen?')) return;
      if (act === 'takedown' && !confirm('Vacature offline halen?')) return;
      if (act === 'extend') body.deadline = document.querySelector('[data-dl="' + id + '"]').value;
      b.disabled = true;
      A.api('/admin/jobs/' + id, { method: 'POST', body: body }).then(function (j) {
        b.disabled = false;
        if (!j.ok) return fail(j);
        A.toast({ approve: 'Goedgekeurd: staat binnen een half uur online', reject: 'Afgewezen', takedown: 'Offline gehaald', extend: 'Datum aangepast', delete: 'Verwijderd' }[act]);
        loadJobs(); loadHome();
      });
    });
    var editing = null, dlg = $('j-edit');
    dlg.querySelector('.x').onclick = function () { dlg.close(); };
    function editJob(id) {
      editing = jobs.filter(function (j) { return j.id === id; })[0]; if (!editing) return;
      var F = $('je-form').elements;
      ['title', 'employer', 'location', 'employment_type', 'lang', 'description', 'salary_min', 'salary_max', 'salary_currency', 'salary_period', 'deadline', 'apply_email', 'apply_url', 'employer_url', 'contact_name', 'contact_phone']
        .forEach(function (n) { F[n].value = editing[n] == null ? '' : editing[n]; });
      $('je-msg').textContent = '';
      dlg.showModal();
    }
    $('je-save').onclick = function () {
      var F = $('je-form').elements, body = { action: 'update' };
      Array.prototype.forEach.call(F, function (el) { if (el.name) body[el.name] = el.value; });
      A.api('/admin/jobs/' + editing.id, { method: 'POST', body: body }).then(function (j) {
        if (!j.ok) { $('je-msg').className = 'form-status err'; $('je-msg').textContent = 'Niet opgeslagen: ' + j.error + (j.field ? ' (' + j.field + ')' : ''); return; }
        dlg.close(); A.toast('Vacature opgeslagen'); loadJobs();
      });
    };

    // ---------------------------------------------------------------- users
    function loadUsers() {
      A.api('/admin/users?q=' + encodeURIComponent($('u-q').value.trim())).then(function (j) {
        if (!j.ok) return fail(j);
        $('adm-users').innerHTML = j.users.map(function (u) {
          return '<tr class="click" data-uid="' + u.id + '"><td><b>' + esc(u.name || '-') + '</b>' + (u.role === 'admin' ? ' <span class="pill brand">beheerder</span>' : '') + (u.status === 'blocked' ? ' <span class="pill st-rejected">geblokkeerd</span>' : '') +
            '<div class="sub">' + esc(u.email) + (u.company ? ' &middot; ' + esc(u.company) : '') + '</div></td><td>' + dt(u.last_login_at) + '<div class="sub">sinds ' + day(u.created_at) + ', ' + u.login_count + 'x</div></td>' +
            '<td class="r">' + u.items + '<div class="sub">' + kb(u.bytes) + '</div></td><td class="r">' + u.jobs + '</td></tr>';
        }).join('') || '<tr><td colspan="4" class="sub">Geen gebruikers.</td></tr>';
      });
    }
    var uqT; $('u-q').oninput = function () { clearTimeout(uqT); uqT = setTimeout(loadUsers, 350); };
    $('adm-users').addEventListener('click', function (e) { var r = e.target.closest('[data-uid]'); if (r) showUser(r.getAttribute('data-uid')); });
    function showUser(id) {
      A.api('/admin/users/' + id).then(function (j) {
        if (!j.ok) return fail(j);
        var u = j.user, box = $('adm-user'); box.hidden = false;
        box.innerHTML = '<div class="row-between"><h3 style="margin:0">' + esc(u.name || u.email) + '</h3><button class="x" data-uclose>&times;</button></div>' +
          '<p class="sub">' + esc(u.email) + ' &middot; ' + esc(u.role) + ' &middot; ' + esc(u.status) + ' &middot; account sinds ' + day(u.created_at) + (u.phone ? ' &middot; ' + esc(u.phone) : '') + '</p>' +
          '<div class="acts">' +
          (u.status === 'blocked' ? '<button class="btn sm" data-ua="unblock">Deblokkeren</button>' : '<button class="btn alt sm" data-ua="block">Blokkeren</button>') +
          (u.role === 'admin' ? '<button class="btn alt sm" data-ua="remove_admin">Geen beheerder meer</button>' : '<button class="btn alt sm" data-ua="make_admin">Beheerder maken</button>') +
          '<button class="btn alt sm" data-ua="logout">Overal uitloggen</button><a class="btn alt sm" href="mailto:' + esc(u.email) + '">Mailen</a><button class="x" data-ua="delete" title="Account verwijderen">&times;</button></div>' +
          '<label style="margin-top:12px">Notitie (alleen voor beheer)</label><div class="two"><input id="u-note" value="' + esc(u.note || '') + '" maxlength="500"><button class="btn alt sm" data-ua="note">Opslaan</button></div>' +
          '<h4>Gegevens (' + j.data.length + ')</h4><p class="sub">' + (j.data.map(function (d) { return esc(d.k) + ' (' + kb(d.size) + ')'; }).join(', ') || 'Geen') + '</p>' +
          '<h4>Vacatures (' + j.jobs.length + ')</h4><p class="sub">' + (j.jobs.map(function (x) { return esc(x.title) + ' [' + ST[x.status] + ']'; }).join(', ') || 'Geen') + '</p>' +
          '<h4>Recente acties</h4><p class="sub">' + (j.log.map(function (l) { return dt(l.at) + ' ' + esc(l.action); }).join('<br>') || 'Geen') + '</p>';
        box.onclick = function (e) {
          if (e.target.hasAttribute('data-uclose')) { box.hidden = true; return; }
          var a = e.target.getAttribute('data-ua'); if (!a) return;
          if (a === 'delete' && !confirm('Account van ' + u.email + ' en alle gegevens verwijderen?')) return;
          if (a === 'block' && !confirm(u.email + ' blokkeren en uitloggen?')) return;
          A.api('/admin/users/' + id, { method: 'POST', body: { action: a, note: a === 'note' ? $('u-note').value : undefined } }).then(function (r) {
            if (!r.ok) return fail(r);
            A.toast('Gedaan'); loadUsers(); if (a === 'delete') box.hidden = true; else showUser(id);
          });
        };
        box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // ---------------------------------------------------------------- content
    var content = [], cform = $('c-form');
    function loadContent() {
      A.api('/admin/content').then(function (j) {
        if (!j.ok) return fail(j);
        content = j.items;
        var today = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
        $('adm-content').innerHTML = content.length ? '<div class="tbl-wrap card"><table class="tbl"><tbody>' + content.map(function (c) {
          var active = c.status === 'live' && (!c.starts || c.starts <= today) && (!c.ends || c.ends >= today);
          var pend = c.kind === 'company' && c.status === 'draft' && c.data && c.data.pending;
          return '<tr><td><span class="pill">' + KIND[c.kind] + '</span> <b>' + esc(c.title) + '</b>' + (c.url ? '<div class="sub">' + esc(c.url) + '</div>' : '') +
            (c.kind === 'company' && c.data ? '<div class="sub">' + esc([c.data.street, c.data.place, c.data.phone].filter(Boolean).join(' \u00b7 ')) + '</div>' : '') + '</td><td>' +
            (pend ? '<span class="pill st-pending">wacht op controle</span>' : active ? '<span class="pill st-live">zichtbaar</span>' : '<span class="pill">' + (c.status === 'draft' ? 'concept' : 'buiten periode') + '</span>') +
            '<div class="sub">' + (c.starts ? day(c.starts) : '') + (c.ends ? ' t/m ' + day(c.ends) : '') + '</div></td><td class="r nowrap"><button class="btn alt sm" data-ce="' + c.id + '">Bewerken</button> <button class="x" data-cd="' + c.id + '" title="Verwijderen">&times;</button></td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="card sub">Nog geen eigen inhoud.</div>';
      });
    }
    var cur = null;
    var CO_FIELDS = ['group', 'kind', 'street', 'place', 'phone', 'whatsapp', 'email', 'hours', 'replaces'];
    function openForm(c) {
      var F = cform.elements; cform.reset(); cform.hidden = false; cur = c;
      F.kind.value = c.kind; F.id.value = c.id || '';
      ['title', 'title_en', 'body', 'body_en', 'url', 'source', 'lang', 'starts', 'ends', 'sort', 'status'].forEach(function (n) { if (c[n] != null) F[n].value = c[n]; });
      var d = c.data || {}; F.d_level.value = d.level || 'info'; F.d_page.value = d.page || 'all'; F.d_deadline.value = d.deadline || '';
      CO_FIELDS.forEach(function (n) { if (d[n] != null && F['d_' + n]) F['d_' + n].value = d[n]; });
      $('c-by').textContent = d.by_email ? 'Aangemeld door ' + (d.by_name || '') + ' <' + d.by_email + '>' + (d.by_role ? ', ' + d.by_role : '') + (d.pending ? '. Nog niet gecontroleerd: zet de status op Live als het klopt.' : '') : '';
      $('c-title').textContent = (c.id ? 'Bewerken: ' : 'Nieuw: ') + KIND[c.kind];
      Array.prototype.forEach.call(cform.querySelectorAll('[data-k]'), function (el) { el.hidden = el.getAttribute('data-k').split(',').indexOf(c.kind) < 0; });
      cform.querySelector('[data-for="body"]').textContent = c.kind === 'banner' ? 'Linktekst (NL)' : 'Tekst (NL)';
      cform.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelector('[data-pane="content"]').addEventListener('click', function (e) {
      var n = e.target.getAttribute('data-new'), ed = e.target.getAttribute('data-ce'), del = e.target.getAttribute('data-cd');
      if (n) openForm({ kind: n, lang: 'all', status: 'live', sort: 0 });
      if (ed) openForm(content.filter(function (c) { return c.id === ed; })[0]);
      if (del && confirm('Verwijderen?')) A.api('/admin/content/' + del, { method: 'DELETE' }).then(function (j) { if (!j.ok) return fail(j); loadContent(); });
    });
    $('c-cancel').onclick = function () { cform.hidden = true; };
    $('c-save').onclick = function () {
      var F = cform.elements, b = {};
      ['id', 'kind', 'title', 'title_en', 'body', 'body_en', 'url', 'source', 'lang', 'starts', 'ends', 'sort', 'status'].forEach(function (n) { b[n] = F[n].value; });
      // keep what the form does not show (e.g. who submitted a business listing)
      b.data = {}; var old = (cur && cur.id && cur.data) || {}; Object.keys(old).forEach(function (k) { b.data[k] = old[k]; });
      if (b.kind === 'company') { CO_FIELDS.forEach(function (n) { b.data[n] = F['d_' + n].value.trim(); }); if (b.status === 'live') delete b.data.pending; }
      if (b.kind === 'banner') b.data.level = F.d_level.value;
      if (b.kind === 'notice') b.data.page = F.d_page.value;
      if (b.kind === 'tender') { b.data.deadline = F.d_deadline.value || null; b.data.buyer = F.source.value; }
      A.api('/admin/content', { method: 'POST', body: b }).then(function (j) {
        if (!j.ok) return fail(j);
        cform.hidden = true; A.toast('Opgeslagen. Staat binnen een half uur op de site.'); loadContent();
      });
    };

    // ---------------------------------------------------------------- messages
    function loadMessages() {
      A.api('/admin/messages?status=' + encodeURIComponent($('m-status').value)).then(function (j) {
        if (!j.ok) return fail(j);
        $('adm-messages').innerHTML = j.messages.map(function (m) {
          return '<div class="card msg-adm"><div class="row-between"><div><b>' + esc(m.subject || '(geen onderwerp)') + '</b><div class="sub">' + esc(m.name || '') + ' &lt;' + esc(m.email) + '&gt; &middot; ' + dt(m.created_at) + (m.user_id ? ' &middot; ingelogd' : '') + (m.page ? ' &middot; ' + esc(m.page) : '') + '</div></div>' +
            '<span class="pill st-' + (m.status === 'new' ? 'pending' : m.status === 'spam' ? 'rejected' : 'live') + '">' + esc(m.status) + '</span></div><p class="pre">' + esc(m.body) + '</p><div class="acts">' +
            '<a class="btn sm" href="mailto:' + esc(m.email) + '?subject=' + encodeURIComponent('Re: ' + (m.subject || 'je bericht aan Suriname Business')) + '">Beantwoorden</a>' +
            (m.status !== 'done' ? '<button class="btn alt sm" data-ma="done" data-id="' + m.id + '">Afgehandeld</button>' : '<button class="btn alt sm" data-ma="new" data-id="' + m.id + '">Terug naar nieuw</button>') +
            (m.status !== 'spam' ? '<button class="btn alt sm" data-ma="spam" data-id="' + m.id + '">Spam</button>' : '') +
            '<button class="x" data-ma="delete" data-id="' + m.id + '" title="Verwijderen">&times;</button></div></div>';
        }).join('') || '<div class="card sub">Geen berichten.</div>';
      });
    }
    $('m-status').onchange = loadMessages;
    $('adm-messages').addEventListener('click', function (e) {
      var a = e.target.getAttribute('data-ma'), id = e.target.getAttribute('data-id'); if (!a) return;
      if (a === 'delete' && !confirm('Bericht verwijderen?')) return;
      A.api('/admin/messages/' + id, { method: 'POST', body: { action: a } }).then(function (j) { if (!j.ok) return fail(j); loadMessages(); loadHome(); });
    });

    // ---------------------------------------------------------------- settings
    function loadSettings() {
      A.api('/admin/settings').then(function (j) {
        if (!j.ok) return fail(j);
        var F = $('s-form').elements;
        Object.keys(j.settings).forEach(function (k) { if (!F[k]) return; if (F[k].type === 'checkbox') F[k].checked = !!j.settings[k]; else F[k].value = j.settings[k]; });
      });
    }
    $('s-save').onclick = function () {
      var F = $('s-form').elements, s = {};
      Array.prototype.forEach.call(F, function (el) { if (el.name) s[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
      A.api('/admin/settings', { method: 'PUT', body: { settings: s } }).then(function (j) { if (!j.ok) return fail(j); A.toast('Instellingen opgeslagen'); });
    };

    // ---------------------------------------------------------------- log
    function loadLog() {
      A.api('/admin/audit').then(function (j) {
        if (!j.ok) return fail(j);
        $('adm-log').innerHTML = j.log.map(function (l) {
          return '<tr><td class="nowrap">' + dt(l.at) + '</td><td>' + esc(l.email || '-') + '</td><td>' + esc(l.action) + '</td><td class="sub">' + esc([l.target, l.detail].filter(Boolean).join(' · ')).slice(0, 300) + '</td></tr>';
        }).join('');
      });
    }

    window.addEventListener('sba:user', gate);
    gate();
    if (A.user()) A.api('/admin/stats').then(function (j) { if (j.ok) { $('cnt-jobs').textContent = j.jobs.pending || ''; $('cnt-msg').textContent = j.messages_new || ''; } });
  }
  if (window.SBA) boot(); else window.addEventListener('sba:ready', boot);
})();
