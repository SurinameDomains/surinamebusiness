/* Shared helpers for the free tools on surinamebusiness.com. Own code, no dependencies. */
(function () {
  var SB = window.SB || {};
  var nl = (SB.lang || document.documentElement.lang || 'nl').slice(0, 2) === 'nl';
  var loc = nl ? 'nl-NL' : 'en-US';
  var nf2 = new Intl.NumberFormat(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function T(a, b) { return nl ? a : b; }
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    v = String(v == null ? '' : v).trim().replace(/[\s ]/g, '').replace(/^(SRD|USD|EUR|\$|€)/i, '');
    if (!v) return 0;
    var neg = /^-/.test(v); v = v.replace(/^-/, '');
    // 15.000,50 | 15,000.50 | 15000.5 | 15000,5 | 1.234.567
    if (/,\d{1,2}$/.test(v) || (/,/.test(v) && !/\./.test(v) && !/,\d{3}$/.test(v))) v = v.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, '');
    else v = v.replace(/,/g, '');
    var n = parseFloat(v);
    return isFinite(n) ? (neg ? -n : n) : 0;
  }
  function fmt(x, dec) {
    if (dec === undefined) dec = 2;
    return new Intl.NumberFormat(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round((x || 0) * Math.pow(10, dec)) / Math.pow(10, dec));
  }
  function money(x, cur) { return (cur || 'SRD') + ' ' + nf2.format(Math.round((x || 0) * 100) / 100); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // per-visitor storage on this device only; never required for the tools to work
  // kept on this device; when signed in, /assets/account.js also syncs every change to the account
  function touched(k) {
    try { var m = JSON.parse(localStorage.getItem('sbt:__m') || '{}') || {}; m[k] = Date.now(); localStorage.setItem('sbt:__m', JSON.stringify(m)); } catch (e) { /* ignore */ }
    try { window.dispatchEvent(new CustomEvent('sbt:set', { detail: k })); } catch (e) { /* ignore */ }
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('sbt:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) {
      try {
        var s = JSON.stringify(v);
        if (localStorage.getItem('sbt:' + k) === s) return true;
        localStorage.setItem('sbt:' + k, s); touched(k); return true;
      } catch (e) { return false; }
    },
    del: function (k) { try { if (localStorage.getItem('sbt:' + k) === null) return; localStorage.removeItem('sbt:' + k); touched(k); } catch (e) { /* ignore */ } },
    keys: function (pre) {
      var out = [];
      try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('sbt:' + (pre || '')) === 0 && k !== 'sbt:__m') out.push(k.slice(4)); } } catch (e) { /* ignore */ }
      return out;
    }
  };

  function flash(btn, text) {
    if (!btn) return;
    var old = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', old);
    btn.textContent = text;
    setTimeout(function () { btn.textContent = old; }, 1600);
  }
  function copy(text, btn) {
    function done() { flash(btn, T('Gekopieerd', 'Copied')); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }
  function phone597(p) {
    var d = String(p || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.indexOf('00') === 0) d = d.slice(2);
    if (d.length <= 7) d = '597' + d.replace(/^0/, '');
    return d;
  }
  function waUrl(text, phone) {
    var p = phone597(phone);
    return 'https://wa.me/' + p + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function download(data, name, type) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function csv(rows) {
    return '﻿' + rows.map(function (r) {
      return r.map(function (c) { c = String(c == null ? '' : c); return /[",;\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(nl ? ';' : ',');
    }).join('\r\n');
  }
  function iso(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function today() { return iso(new Date()); }
  function addDays(s, n) { var d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); }
  function dateLong(s) {
    if (!s) return '';
    var d = new Date(s + 'T12:00:00');
    return d.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
  }
  var holi = {};
  (SB.holidays || []).forEach(function (d) { holi[d] = 1; });
  function isWorkday(s) { var w = new Date(s + 'T12:00:00').getDay(); return w !== 0 && w !== 6 && !holi[s]; }

  // ---- amounts in words
  var NL_U = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf',
    'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
  var NL_T = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];
  function nl99(n) {
    if (n < 20) return NL_U[n];
    var t = Math.floor(n / 10), u = n % 10;
    if (!u) return NL_T[t];
    var en = /e$/.test(NL_U[u]) ? 'ën' : 'en';
    return NL_U[u] + en + NL_T[t];
  }
  function nl999(n) {
    var h = Math.floor(n / 100), r = n % 100, s = '';
    if (h) s = (h === 1 ? '' : NL_U[h]) + 'honderd';
    if (r) s += nl99(r);
    return s || NL_U[0];
  }
  function nlWords(n) {
    if (n === 0) return 'nul';
    var parts = [], scales = [[1e9, 'miljard'], [1e6, 'miljoen']];
    for (var i = 0; i < scales.length; i++) {
      var q = Math.floor(n / scales[i][0]);
      if (q) { parts.push(nlWords(q) + ' ' + scales[i][1]); n -= q * scales[i][0]; }
    }
    var th = Math.floor(n / 1000), rest = n % 1000, s = '';
    if (th) s += (th === 1 ? '' : nl999(th)) + 'duizend';
    if (rest) s += (th ? ' ' : '') + nl999(rest);
    if (s) parts.push(s);
    return parts.join(' ');
  }
  var EN_U = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var EN_T = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function en999(n) {
    var h = Math.floor(n / 100), r = n % 100, s = [];
    if (h) s.push(EN_U[h] + ' hundred');
    if (r) s.push(r < 20 ? EN_U[r] : EN_T[Math.floor(r / 10)] + (r % 10 ? '-' + EN_U[r % 10] : ''));
    return s.join(' and ');
  }
  function enWords(n) {
    if (n === 0) return 'zero';
    var parts = [], scales = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
    for (var i = 0; i < scales.length; i++) {
      var q = Math.floor(n / scales[i][0]);
      if (q) { parts.push(en999(q) + ' ' + scales[i][1]); n -= q * scales[i][0]; }
    }
    if (n) parts.push((parts.length && n < 100 ? 'and ' : '') + en999(n));
    return parts.join(' ');
  }
  var CUR = {
    SRD: { nl: ['Surinaamse dollar', 'Surinaamse dollars', 'cent', 'cent'], en: ['Surinamese dollar', 'Surinamese dollars', 'cent', 'cents'] },
    USD: { nl: ['Amerikaanse dollar', 'Amerikaanse dollars', 'cent', 'cent'], en: ['US dollar', 'US dollars', 'cent', 'cents'] },
    EUR: { nl: ['euro', 'euro', 'cent', 'cent'], en: ['euro', 'euros', 'cent', 'cents'] }
  };
  function words(amount, cur, lng) {
    lng = lng || (nl ? 'nl' : 'en');
    amount = Math.round(Math.abs(num(amount)) * 100);
    var whole = Math.floor(amount / 100), cents = amount % 100;
    var c = (CUR[cur || 'SRD'] || CUR.SRD)[lng];
    var f = lng === 'nl' ? nlWords : enWords;
    var s = f(whole) + ' ' + (whole === 1 ? c[0] : c[1]);
    if (cents) s += (lng === 'nl' ? ' en ' : ' and ') + f(cents) + ' ' + (cents === 1 ? c[2] : c[3]);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // read an <input type=file> image into a data URL, scaled down to keep storage small
  function imageToDataUrl(file, maxSide, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, maxSide / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9));
      };
      img.onerror = function () { cb(null); };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  // remember simple form fields (by name) on this device
  function persistForm(form, key, names) {
    var saved = store.get(key, {});
    names.forEach(function (n) {
      var el = form.elements[n];
      if (!el || saved[n] === undefined) return;
      if (el.type === 'checkbox') el.checked = !!saved[n]; else el.value = saved[n];
    });
    form.addEventListener('input', function () {
      var o = {};
      names.forEach(function (n) { var el = form.elements[n]; if (el) o[n] = el.type === 'checkbox' ? el.checked : el.value; });
      store.set(key, o);
    });
  }

  function bands(amount, brackets) {
    var tax = 0, lower = 0;
    for (var i = 0; i < brackets.length; i++) {
      var top = brackets[i][0] === null ? Infinity : brackets[i][0];
      tax += Math.max(0, Math.min(amount, top) - lower) * brackets[i][1];
      lower = top;
      if (amount <= top) break;
    }
    return tax;
  }
  function salary(gross, pensionPct, aov) {
    var t = SB.tax;
    var forfait = Math.min(gross * t.forfait_pct, t.forfait_max_month);
    var pension = gross * (pensionPct || 0) / 100;
    var zuiver = Math.max(0, gross - forfait - pension);
    var taxable = Math.max(0, zuiver - t.free_month);
    var tax = bands(taxable, t.brackets_month);
    var a = aov === false ? 0 : zuiver * t.aov_pct;
    return { gross: gross, forfait: forfait, pension: pension, zuiver: zuiver, taxable: taxable, tax: tax, aov: a, net: gross - pension - tax - a };
  }

  // print only the document: copy every .print-area into a bare container under <body>
  function printDoc() {
    var areas = $$('.print-area');
    if (!areas.length) { window.print(); return; }
    var root = document.getElementById('print-root');
    if (root) root.remove();
    root = document.createElement('div');
    root.id = 'print-root';
    areas.forEach(function (a) {
      var c = a.cloneNode(true);
      c.removeAttribute('hidden'); c.removeAttribute('id');
      $$('[id]', c).forEach(function (x) { x.removeAttribute('id'); });
      root.appendChild(c);
    });
    document.body.appendChild(root);
    document.body.classList.add('printing-doc');
    var off = function () { document.body.classList.remove('printing-doc'); root.remove(); window.removeEventListener('afterprint', off); };
    window.addEventListener('afterprint', off);
    window.print();
  }

  window.SBT = {
    nl: nl, T: T, num: num, fmt: fmt, money: money, esc: esc, $: $, $$: $$, store: store, copy: copy, flash: flash,
    waUrl: waUrl, phone597: phone597, download: download, csv: csv, iso: iso, today: today, addDays: addDays,
    dateLong: dateLong, isWorkday: isWorkday, words: words, imageToDataUrl: imageToDataUrl, persistForm: persistForm,
    bands: bands, salary: salary, printDoc: printDoc, SB: SB
  };

  // generic buttons: data-copy="#id" copies the text of that element, data-print prints the page
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy],[data-print]');
    if (!b) return;
    e.preventDefault();
    if (b.hasAttribute('data-print')) { printDoc(); return; }
    var el = $(b.getAttribute('data-copy'));
    if (el) copy(el.value !== undefined && el.tagName !== 'DIV' ? el.value : el.innerText, b);
  });
})();
