/* Suriname Business accounts: Sign in with Google, header button, and sync of tool data.
   Anonymous visitors: nothing is loaded from Google and no request goes to the account API.
   Signed in: everything the tools keep on this device (keys "sbt:*") is also kept in the account
   and synced across devices (last change wins per item). */
(function () {
  var C = window.SBA_CFG || {};
  var NL = (document.documentElement.lang || 'nl').indexOf('en') !== 0;
  var T = function (nl, en) { return NL ? nl : en; };
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = local ? location.protocol + '//' + location.hostname + ':8787' : (C.api || 'https://id.surinamebusiness.com');
  var PREFIX = 'sbt:', META = 'sbt:__m', NOSYNC = { carry: 1, __m: 1 };
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  function meta() { try { return JSON.parse(LS.get(META) || '{}') || {}; } catch (e) { return {}; } }
  function saveMeta(m) { LS.set(META, JSON.stringify(m)); }

  // ---------------------------------------------------------------- user state
  var user = null;
  try { user = JSON.parse(LS.get('sb_user') || 'null'); } catch (e) { user = null; }
  function setUser(u) {
    user = u || null;
    if (user) LS.set('sb_user', JSON.stringify({ id: user.id, name: user.name, email: user.email, picture: user.picture, role: user.role }));
    else LS.del('sb_user');
    renderButton();
    try { window.dispatchEvent(new CustomEvent('sba:user', { detail: user })); } catch (e) { /* old browser */ }
  }

  function api(path, opt) {
    opt = opt || {};
    var o = { method: opt.method || 'GET', credentials: 'include', headers: {} };
    if (opt.body !== undefined) {
      if (opt.body instanceof FormData) o.body = opt.body;
      else { o.headers['content-type'] = 'application/json'; o.body = JSON.stringify(opt.body); }
    }
    if (opt.keepalive) o.keepalive = true;
    return fetch(API + path, o).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: 'server' }; }).then(function (j) {
        if (r.status === 401 && j && j.error === 'login') setUser(null);
        j._status = r.status;
        return j;
      });
    }, function () { return { ok: false, error: 'network', _status: 0 }; });
  }

  // ---------------------------------------------------------------- header button
  function initials(u) { return ((u.name || u.email || '?').trim()[0] || '?').toUpperCase(); }
  function renderButton() {
    var slot = document.getElementById('acct');
    if (!slot) return;
    if (user) {
      var first = (user.name || user.email || '').split(/[\s@]/)[0];
      slot.innerHTML = '<a class="acct-btn in" href="' + (C.accountUrl || '/mijn-account') + '" title="' + esc(user.email || '') + '">' +
        (user.picture ? '<img src="' + esc(user.picture) + '" alt="" referrerpolicy="no-referrer" width="24" height="24">' : '<span class="av">' + esc(initials(user)) + '</span>') +
        '<span class="nm">' + esc(first || T('Account', 'Account')) + '</span></a>';
    } else {
      slot.innerHTML = '<button type="button" class="acct-btn" id="acct-login">' + T('Inloggen', 'Sign in') + '</button>';
      document.getElementById('acct-login').onclick = function () { login(); };
    }
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------------------------------------------------------------- sign in with Google
  var gisLoading = null;
  function loadGis() {
    if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
    if (gisLoading) return gisLoading;
    gisLoading = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { gisLoading = null; rej(); };
      document.head.appendChild(s);
    });
    return gisLoading;
  }
  var dlg = null, pending = null;
  function login(reason) {
    return new Promise(function (resolve) {
      pending = resolve;
      if (!dlg) {
        dlg = document.createElement('dialog');
        dlg.className = 'sba-dlg';
        dlg.innerHTML = '<button type="button" class="x" aria-label="' + T('Sluiten', 'Close') + '">&times;</button>' +
          '<h2>' + T('Inloggen bij Suriname Business', 'Sign in to Suriname Business') + '</h2>' +
          '<p class="why"></p>' +
          '<ul class="sub"><li>' + T('Je facturen, offertes, klanten en bedrijfsgegevens op al je apparaten', 'Your invoices, quotes, customers and business details on all your devices') + '</li>' +
          '<li>' + T('Je vacatures zelf beheren: wijzigen, verlengen, sluiten', 'Manage your vacancies yourself: edit, extend, close') + '</li>' +
          '<li>' + T('Vacatures bewaren en alles van de tools veilig in je account', 'Save jobs and keep all tool data safe in your account') + '</li></ul>' +
          '<div id="sba-gbtn" class="gbtn"><span class="sub">' + T('Google laden...', 'Loading Google...') + '</span></div>' +
          '<p class="msg" role="status"></p>' +
          '<p class="sub small">' + T('Gratis. We krijgen alleen je naam, e-mailadres en profielfoto van Google, geen wachtwoord. Zie ', 'Free. We only get your name, email address and profile photo from Google, no password. See ') +
          '<a href="' + (NL ? '/privacy' : '/en/privacy') + '">' + T('privacy', 'privacy') + '</a> ' + T('en', 'and') + ' <a href="' + (NL ? '/voorwaarden' : '/en/terms') + '">' + T('voorwaarden', 'terms') + '</a>.</p>';
        document.body.appendChild(dlg);
        dlg.querySelector('.x').onclick = function () { dlg.close(); };
        dlg.addEventListener('close', function () { if (pending) { pending(null); pending = null; } });
        dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      }
      dlg.querySelector('.why').textContent = reason || T('Log in met je Google-account. Zo heb je je gegevens overal bij de hand.', 'Sign in with your Google account to have your data everywhere.');
      dlg.querySelector('.msg').textContent = '';
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      if (local && C.devLogin) return devButton();
      loadGis().then(function () {
        google.accounts.id.initialize({ client_id: C.clientId, callback: onCredential, auto_select: false,
          cancel_on_tap_outside: true, itp_support: true, use_fedcm_for_button: true });
        var box = document.getElementById('sba-gbtn'); box.innerHTML = '';
        google.accounts.id.renderButton(box, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
          shape: 'pill', logo_alignment: 'left', locale: NL ? 'nl' : 'en', width: 280 });
      }, function () {
        document.getElementById('sba-gbtn').innerHTML = '<span class="err">' + T('Google kon niet laden. Controleer je verbinding of adblocker.', 'Google could not load. Check your connection or ad blocker.') + '</span>';
      });
    });
  }
  // local testing without Google (only on localhost and only when the dev API allows it)
  function devButton() {
    var box = document.getElementById('sba-gbtn');
    box.innerHTML = '<input type="email" id="sba-dev-mail" placeholder="test@example.com" style="max-width:220px"> <button type="button" class="btn sm" id="sba-dev-go">Dev login</button>';
    document.getElementById('sba-dev-go').onclick = function () {
      api('/auth/dev', { method: 'POST', body: { email: document.getElementById('sba-dev-mail').value } }).then(afterLogin);
    };
  }
  function onCredential(resp) {
    var msg = dlg && dlg.querySelector('.msg');
    if (msg) msg.textContent = T('Bezig met inloggen...', 'Signing in...');
    api('/auth/google', { method: 'POST', body: { credential: resp.credential, lang: NL ? 'nl' : 'en' } }).then(afterLogin);
  }
  function afterLogin(j) {
    var msg = dlg && dlg.querySelector('.msg');
    if (!j.ok) {
      var e = { blocked: T('Dit account is geblokkeerd. Neem contact met ons op.', 'This account is blocked. Please contact us.'),
        signup_closed: T('Nieuwe accounts zijn tijdelijk gesloten.', 'New accounts are temporarily closed.'),
        network: T('Geen verbinding. Probeer het opnieuw.', 'No connection. Please try again.') }[j.error];
      if (msg) msg.textContent = e || T('Inloggen lukte niet. Probeer het opnieuw.', 'Sign-in failed. Please try again.');
      return;
    }
    setUser(j.user);
    if (j.settings) window.SBA.settings = j.settings;
    var done = pending; pending = null;
    if (dlg && dlg.open) dlg.close();
    sync(true).then(function () { if (done) done(j.user); });
  }
  function logout(all, wipe) {
    return api(all ? '/auth/logout-all' : '/auth/logout', { method: 'POST', body: {} }).then(function () {
      if (wipe) wipeLocal();
      try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) { /* ignore */ }
      setUser(null);
    });
  }
  function wipeLocal() {
    var ks = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREFIX) === 0) ks.push(k); } } catch (e) { /* ignore */ }
    ks.forEach(LS.del);
  }

  // ---------------------------------------------------------------- data store (same keys as the tools)
  function changed(k) {
    var m = meta(); m[k] = Date.now(); saveMeta(m);
    try { window.dispatchEvent(new CustomEvent('sbt:set', { detail: k })); } catch (e) { /* ignore */ }
  }
  var store = {
    get: function (k, d) { var v = LS.get(PREFIX + k); if (v === null) return d; try { return JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { var s = JSON.stringify(v); if (LS.get(PREFIX + k) === s) return true; var ok = LS.set(PREFIX + k, s); if (ok) changed(k); return ok; },
    del: function (k) { if (LS.get(PREFIX + k) === null) return; LS.del(PREFIX + k); changed(k); },
    keys: function (pre) {
      var out = [];
      try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREFIX + (pre || '')) === 0 && k !== META) out.push(k.slice(PREFIX.length)); } } catch (e) { /* ignore */ }
      return out;
    }
  };

  // ---------------------------------------------------------------- sync
  var dirty = {}, timer = null, syncing = null, lastPull = 0, warned = false;
  window.addEventListener('sbt:set', function (e) {
    if (!user || !e.detail || NOSYNC[e.detail]) return;
    dirty[e.detail] = 1;
    clearTimeout(timer); timer = setTimeout(function () { push(Object.keys(dirty)); }, 3000);
  });
  window.addEventListener('pagehide', function () { if (user && Object.keys(dirty).length) push(Object.keys(dirty), true); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && user && Date.now() - lastPull > 60000) sync(false);
  });
  window.addEventListener('storage', function (e) { if (e.key === 'sb_user') { try { user = JSON.parse(e.newValue || 'null'); } catch (x) { user = null; } renderButton(); } });

  function localKeys() { return store.keys('').filter(function (k) { return !NOSYNC[k]; }); }
  function push(keys, keepalive) {
    keys = keys.filter(function (k) { return !NOSYNC[k]; });
    keys.forEach(function (k) { delete dirty[k]; });
    if (!user || !keys.length) return Promise.resolve();
    var m = meta(), batches = [[]], size = 0;
    keys.forEach(function (k) {
      var v = LS.get(PREFIX + k);
      if (!m[k]) { m[k] = Date.now(); }
      var item = { k: k, v: v, u: m[k] };
      var s = (v ? v.length : 0) + k.length + 30;
      if (size + s > 2500000 || batches[batches.length - 1].length >= 90) { batches.push([]); size = 0; }
      batches[batches.length - 1].push(item); size += s;
    });
    saveMeta(m);
    var chain = Promise.resolve();
    batches.forEach(function (b) {
      if (!b.length) return;
      chain = chain.then(function () {
        return api('/me/data', { method: 'PUT', body: { items: b }, keepalive: keepalive && JSON.stringify(b).length < 60000 }).then(function (j) {
          if (j && j.rejected && j.rejected.some(function (r) { return r.error === 'quota' || r.error === 'too_large'; }) && !warned) {
            warned = true;
            toast(T('Niet alles past in je account (te groot). Het blijft wel op dit apparaat.', 'Not everything fits in your account (too large). It stays on this device.'));
          }
          if (j && j._status === 0) b.forEach(function (it) { dirty[it.k] = 1; });   // offline: retry later
        });
      });
    });
    return chain;
  }
  function sync(first) {
    if (!user) return Promise.resolve();
    if (syncing) return syncing;
    lastPull = Date.now();
    syncing = api('/me/data?meta=1').then(function (j) {
      if (!j.ok) return;
      var m = meta(), srv = {}, need = [], toPush = [], changedLocal = false;
      j.items.forEach(function (it) { srv[it.k] = it; });
      j.items.forEach(function (it) {
        if (NOSYNC[it.k]) return;
        var lu = m[it.k] || 0;
        if (it.u > lu) {
          if (it.deleted) { if (LS.get(PREFIX + it.k) !== null) { LS.del(PREFIX + it.k); changedLocal = true; } m[it.k] = it.u; }
          else need.push(it.k);
        }
      });
      localKeys().forEach(function (k) {
        var s = srv[k];
        if (!s || (m[k] || 0) > s.u) toPush.push(k);
      });
      Object.keys(m).forEach(function (k) {       // local deletions the server does not know yet
        if (!NOSYNC[k] && LS.get(PREFIX + k) === null && srv[k] && !srv[k].deleted && m[k] > srv[k].u) toPush.push(k);
      });
      saveMeta(m);
      var chain = Promise.resolve();
      for (var i = 0; i < need.length; i += 40) {
        (function (part) {
          chain = chain.then(function () {
            return api('/me/data?' + part.map(function (k) { return 'k=' + encodeURIComponent(k); }).join('&')).then(function (r) {
              if (!r.ok) return;
              var mm = meta();
              r.items.forEach(function (it) {
                if (LS.get(PREFIX + it.k) !== it.v) {
                  if (it.v === null) LS.del(PREFIX + it.k); else LS.set(PREFIX + it.k, it.v);
                  changedLocal = true;
                }
                mm[it.k] = it.u;
              });
              saveMeta(mm);
            });
          });
        })(need.slice(i, i + 40));
      }
      return chain.then(function () { return push(toPush); }).then(function () {
        if (changedLocal) {
          try { window.dispatchEvent(new CustomEvent('sba:synced', { detail: { changed: true } })); } catch (e) { /* ignore */ }
          // tool pages read their data on load: reload once so they show the account data
          var key = 'sba_reload:' + location.pathname;
          var already = false; try { already = sessionStorage.getItem(key) === '1'; } catch (e) { /* ignore */ }
          if (window.SBT && !already && !document.querySelector('[data-no-sync-reload]')) {
            try { sessionStorage.setItem(key, '1'); } catch (e) { /* ignore */ }
            toast(T('Je gegevens uit je account zijn geladen.', 'Your account data has been loaded.'));
            setTimeout(function () { location.reload(); }, 600);
          }
        }
      });
    }).then(function () { syncing = null; }, function () { syncing = null; });
    return syncing;
  }

  // ---------------------------------------------------------------- small UI helpers
  function toast(text) {
    var t = document.createElement('div'); t.className = 'sba-toast'; t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('on'); }, 10);
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 400); }, 4200);
  }
  // banners from the admin panel can be dismissed per visitor
  function banners() {
    var hidden = {}; try { hidden = JSON.parse(LS.get('sb_hidden_banners') || '{}'); } catch (e) { hidden = {}; }
    Array.prototype.forEach.call(document.querySelectorAll('.site-banner[data-id]'), function (b) {
      var id = b.getAttribute('data-id');
      if (hidden[id]) { b.remove(); return; }
      var x = b.querySelector('.x');
      if (x) x.onclick = function () { hidden[id] = 1; LS.set('sb_hidden_banners', JSON.stringify(hidden)); b.remove(); };
    });
  }

  // "save job" buttons on the jobs list and job pages (kept on this device, and in the account when signed in)
  function saveButtons() {
    var btns = document.querySelectorAll('[data-save-job]');
    if (!btns.length) return;
    function saved() { return store.get('savedjobs', []); }
    function paint() {
      var urls = {}; saved().forEach(function (j) { urls[j.url] = 1; });
      Array.prototype.forEach.call(btns, function (b) {
        var on = !!urls[b.getAttribute('data-url')];
        b.setAttribute('aria-pressed', on);
        if (b.classList.contains('star')) b.title = on ? T('Bewaard', 'Saved') : T('Bewaren', 'Save');
        else b.textContent = on ? T('Bewaard', 'Saved') : T('Bewaren', 'Save');
      });
    }
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var url = b.getAttribute('data-url'), list = saved(), i = -1;
        list.forEach(function (j, k) { if (j.url === url) i = k; });
        if (i >= 0) list.splice(i, 1);
        else {
          list.unshift({ url: url, title: b.getAttribute('data-title'), employer: b.getAttribute('data-employer') || '',
            deadline: b.getAttribute('data-deadline') || '', saved: new Date().toISOString() });
          if (!user) toast(T('Bewaard op dit apparaat. Log in om je bewaarde vacatures overal te zien.', 'Saved on this device. Sign in to see your saved jobs everywhere.'));
        }
        store.set('savedjobs', list.slice(0, 200)); paint();
      });
    });
    paint();
    window.addEventListener('sba:synced', paint);
  }

  window.SBA = { api: api, login: login, logout: logout, user: function () { return user; }, setUser: setUser,
    store: store, sync: sync, push: push, toast: toast, wipeLocal: wipeLocal, apiBase: API, settings: null, T: T, NL: NL };

  function start() {
    renderButton(); banners(); saveButtons();
    if (user) {
      api('/me').then(function (j) {
        if (j.ok) { setUser(j.user); window.SBA.settings = j.settings; sync(false); }
      });
    }
    try { window.dispatchEvent(new CustomEvent('sba:ready')); } catch (e) { /* ignore */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
