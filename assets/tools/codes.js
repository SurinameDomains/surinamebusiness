/* QR codes, barcodes, business cards and WhatsApp links. QR encoding by qrcode-generator (MIT, vendored). */
(function () {
  var S = window.SBT, T = S.T;
  if (window.qrcode && qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

  function qrMatrix(text, ec) {
    var q = qrcode(0, ec || 'M');
    q.addData(text || ' ', 'Byte');
    q.make();
    var n = q.getModuleCount(), m = [];
    for (var r = 0; r < n; r++) { m.push([]); for (var c = 0; c < n; c++) m[r].push(q.isDark(r, c)); }
    return m;
  }
  function qrSvg(m, fg, bg, quiet) {
    quiet = quiet === undefined ? 4 : quiet;
    var n = m.length, size = n + quiet * 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) d += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="' + bg + '"/><path d="' + d + '" fill="' + fg + '"/></svg>';
  }
  function qrCanvas(m, fg, bg, px, caption) {
    var quiet = 4, n = m.length, scale = Math.max(2, Math.floor(px / (n + quiet * 2)));
    var w = (n + quiet * 2) * scale, capH = caption ? Math.round(w * 0.14) : 0;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = w + capH;
    var x = cv.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = fg;
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) x.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
    if (caption) {
      x.font = '600 ' + Math.round(capH * 0.5) + 'px Inter, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(caption, w / 2, w + capH * 0.35, w * 0.92);
    }
    return cv;
  }
  function pngDownload(cv, name) { cv.toBlob(function (b) { S.download(b, name); }, 'image/png'); }
  window.SBQR = { matrix: qrMatrix, svg: qrSvg, canvas: qrCanvas };

  // ---------------------------------------------------------------- QR page
  var qf = document.getElementById('qr');
  if (qf) {
    var e = qf.elements, last = '';
    var wifiEsc = function (s) { return String(s).replace(/([\\;,:"])/g, '\\$1'); };
    var payload = function () {
      switch (e.type.value) {
        case 'wa': return S.waUrl(e.watext.value, e.waphone.value);
        case 'wifi': return 'WIFI:T:' + e.wsec.value + ';S:' + wifiEsc(e.ssid.value) + ';P:' + (e.wsec.value === 'nopass' ? '' : wifiEsc(e.wpass.value)) + ';;';
        case 'tel': return 'tel:' + e.tel.value.replace(/[^\d+]/g, '');
        case 'mail': return 'mailto:' + e.mto.value + (e.msub.value ? '?subject=' + encodeURIComponent(e.msub.value) : '');
        case 'text': return e.txt.value;
        default: var u = e.url.value.trim(); return u && !/^[a-z]+:/i.test(u) ? 'https://' + u : u;
      }
    };
    var qr = function () {
      S.$$('[data-t]', qf).forEach(function (d) { d.hidden = d.getAttribute('data-t') !== e.type.value; });
      var p = payload(), out = document.getElementById('qr-out');
      try {
        var m = qrMatrix(p, e.ec.value);
        out.innerHTML = qrSvg(m, e.fg.value, e.bg.value) + (e.cap.value ? '<div style="font-weight:700;margin-top:6px">' + S.esc(e.cap.value) + '</div>' : '');
        out.querySelector('svg').style.width = '260px';
        document.getElementById('qr-info').textContent = T('Inhoud: ', 'Contents: ') + (p.length > 90 ? p.slice(0, 90) + '…' : p);
        last = p;
      } catch (err) { out.textContent = T('Te veel tekst voor een QR code.', 'Too much text for a QR code.'); }
    };
    qf.addEventListener('input', qr); qf.addEventListener('change', qr); qr();
    document.getElementById('qr-png').onclick = function () { pngDownload(qrCanvas(qrMatrix(last, e.ec.value), e.fg.value, e.bg.value, 1200, e.cap.value), 'qr-code.png'); };
    document.getElementById('qr-svg').onclick = function () { S.download(qrSvg(qrMatrix(last, e.ec.value), e.fg.value, e.bg.value), 'qr-code.svg', 'image/svg+xml'); };
  }

  // ---------------------------------------------------------------- WhatsApp link page
  var wl = document.getElementById('wl');
  if (wl) {
    var wlr = function () {
      var url = S.waUrl(wl.elements.msg.value.trim(), wl.elements.phone.value);
      document.getElementById('wl-link').textContent = url;
      document.getElementById('wl-test').href = url;
      document.getElementById('wl-qr').innerHTML = qrSvg(qrMatrix(url, 'M'), '#1f2251', '#ffffff');
      document.getElementById('wl-qr').querySelector('svg').style.width = '200px';
    };
    wl.elements.phone.value = S.store.get('wl:phone', '');
    wl.addEventListener('input', function () { S.store.set('wl:phone', wl.elements.phone.value); wlr(); });
    document.getElementById('wl-png').onclick = function () { pngDownload(qrCanvas(qrMatrix(document.getElementById('wl-link').textContent, 'M'), '#1f2251', '#ffffff', 1000, 'WhatsApp'), 'whatsapp-qr.png'); };
    wlr();
  }

  // ---------------------------------------------------------------- barcodes
  var C128 = '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'.split(' ');
  function code128(s) {
    // returns module widths (bar, space, bar ...) or null when a character is not encodable
    var codes = [], i;
    if (/^\d+$/.test(s) && s.length >= 4 && s.length % 2 === 0) {
      codes.push(105);
      for (i = 0; i < s.length; i += 2) codes.push(+s.substr(i, 2));
    } else {
      codes.push(104);
      for (i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c < 32 || c > 126) return null;
        codes.push(c - 32);
      }
    }
    var sum = codes[0];
    for (i = 1; i < codes.length; i++) sum += codes[i] * i;
    codes.push(sum % 103); codes.push(106);
    return codes.map(function (k) { return C128[k]; }).join('').split('').map(Number);
  }
  var EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  var EAN_P = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
  function eanCheck(d12) { var s = 0; for (var i = 0; i < 12; i++) s += (+d12[i]) * (i % 2 ? 3 : 1); return (10 - s % 10) % 10; }
  function ean13(s) {
    s = s.replace(/\s/g, '');
    if (!/^\d{12,13}$/.test(s)) return { err: T('EAN-13 heeft 12 of 13 cijfers nodig', 'EAN-13 needs 12 or 13 digits') };
    var ck = eanCheck(s);
    if (s.length === 13 && +s[12] !== ck) return { err: T('Controlecijfer klopt niet, moet ', 'Check digit is wrong, should be ') + ck };
    s = s.slice(0, 12) + ck;
    var R = EAN_L.map(function (p) { return p.replace(/./g, function (b) { return b === '1' ? '0' : '1'; }); });
    var G = R.map(function (p) { return p.split('').reverse().join(''); });
    var bits = '101', par = EAN_P[+s[0]];
    for (var i = 1; i <= 6; i++) bits += (par[i - 1] === 'L' ? EAN_L : G)[+s[i]];
    bits += '01010';
    for (i = 7; i <= 12; i++) bits += R[+s[i]];
    bits += '101';
    return { bits: bits, text: s };
  }
  function widthsToBits(w) { var b = '', dark = true; w.forEach(function (n) { b += (dark ? '1' : '0').repeat(n); dark = !dark; }); return b; }
  function barSvg(bits, h, text, label) {
    var q = 10, w = bits.length + q * 2, th = text || label ? 14 : 0, lh = label ? 14 : 0, d = '', i = 0;
    while (i < bits.length) { if (bits[i] === '1') { var j = i; while (bits[j] === '1') j++; d += 'M' + (i + q) + ' 0h' + (j - i) + 'v' + h + 'h-' + (j - i) + 'z'; i = j; } else i++; }
    var t = '';
    if (text) t += '<text x="' + (w / 2) + '" y="' + (h + 12) + '" font-family="Arial,sans-serif" font-size="11" text-anchor="middle">' + S.esc(text) + '</text>';
    if (label) t += '<text x="' + (w / 2) + '" y="' + (h + th + 12) + '" font-family="Arial,sans-serif" font-size="11" font-weight="700" text-anchor="middle">' + S.esc(label) + '</text>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + (h + th + lh + 2) + '" width="' + (w * 2) + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/>' + t + '</svg>';
  }
  var bc = document.getElementById('bc'), firstSvg = '';
  if (bc) {
    var bcr = function () {
      var e = bc.elements, vals = e.val.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 60);
      var copies = Math.min(40, Math.max(1, Math.round(S.num(e.copies.value)) || 1)), h = Math.min(200, Math.max(30, S.num(e.h.value) || 70));
      var out = [], errs = [];
      document.getElementById('bc-hint').textContent = e.sym.value === 'ean' ? T('12 cijfers: het controlecijfer wordt berekend.', '12 digits: the check digit is calculated.') : T('Letters, cijfers en leestekens (geen accenten).', 'Letters, digits and punctuation (no accents).');
      firstSvg = '';
      vals.forEach(function (v) {
        var svg;
        if (e.sym.value === 'ean') { var r = ean13(v); if (r.err) { errs.push(v + ': ' + r.err); return; } svg = barSvg(r.bits, h, e.txt.checked ? r.text : '', e.lbl.value); }
        else { var w = code128(v); if (!w) { errs.push(v + ': ' + T('bevat tekens die niet kunnen', 'contains unsupported characters')); return; } svg = barSvg(widthsToBits(w), h, e.txt.checked ? v : '', e.lbl.value); }
        if (!firstSvg) firstSvg = svg;
        for (var k = 0; k < copies; k++) out.push('<div style="text-align:center;padding:6px;border:1px dashed #ddd">' + svg + '</div>');
      });
      document.getElementById('bc-out').innerHTML = (errs.length ? '<p class="note" style="grid-column:1/-1">' + errs.map(S.esc).join('<br>') + '</p>' : '') + out.join('');
      S.$$('#bc-out svg').forEach(function (s) { s.style.maxWidth = '100%'; s.style.height = 'auto'; });
    };
    bc.addEventListener('input', bcr); bc.addEventListener('change', bcr); bcr();
    document.getElementById('bc-svg').onclick = function () { if (firstSvg) S.download(firstSvg, 'barcode.svg', 'image/svg+xml'); };
    document.getElementById('bc-png').onclick = function () {
      if (!firstSvg) return;
      var img = new Image();
      img.onload = function () { var cv = document.createElement('canvas'); cv.width = img.width * 2; cv.height = img.height * 2; var x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, cv.width, cv.height); pngDownload(cv, 'barcode.png'); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(firstSvg);
    };
    window.SBBC = { code128: code128, ean13: ean13, widthsToBits: widthsToBits };
  }

  // ---------------------------------------------------------------- business card
  var bk = document.getElementById('bk');
  if (bk) {
    var cv = document.getElementById('bk-c'), cx = cv.getContext('2d'), logoImg = null;
    var saved = S.store.get('bk', null);
    if (saved) Object.keys(saved).forEach(function (k) { if (bk.elements[k]) bk.elements[k].value = saved[k]; });
    var fit = function (text, max, size, weight) {
      cx.font = weight + ' ' + size + 'px Inter, Arial, sans-serif';
      while (cx.measureText(text).width > max && size > 14) { size -= 1; cx.font = weight + ' ' + size + 'px Inter, Arial, sans-serif'; }
    };
    var draw = function () {
      var e = bk.elements, W = cv.width, H = cv.height, c1 = e.c1.value, c2 = e.c2.value, st = e.style.value;
      var dark = st === 'dark', ink = dark ? '#ffffff' : '#16182f', soft = dark ? 'rgba(255,255,255,.75)' : '#4a4f68';
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = dark ? c1 : '#ffffff'; cx.fillRect(0, 0, W, H);
      if (st === 'band') { cx.fillStyle = c1; cx.fillRect(0, 0, 34, H); cx.fillStyle = c2; cx.fillRect(34, 0, 10, H); }
      if (st === 'clean') { cx.fillStyle = c2; cx.fillRect(70, 300, 90, 6); }
      if (dark) { cx.fillStyle = c2; cx.fillRect(0, H - 14, W, 14); }
      var x0 = 90, qrSize = 0, qrText = '';
      if (e.qrto.value === 'wa' && e.phone.value) qrText = S.waUrl('', e.phone.value);
      if (e.qrto.value === 'web' && e.web.value) qrText = /^https?:/.test(e.web.value) ? e.web.value : 'https://' + e.web.value;
      if (e.qrto.value === 'vcard') qrText = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + e.name.value + '\nORG:' + e.biz.value + '\nTITLE:' + e.title.value + '\nTEL:' + e.phone.value + '\nEMAIL:' + e.email.value + (e.web.value ? '\nURL:' + e.web.value : '') + '\nEND:VCARD';
      var maxText = W - x0 - 60;
      if (qrText) {
        qrSize = 230;
        var m = qrMatrix(qrText, 'M'), n = m.length, s = qrSize / (n + 2), qx = W - qrSize - 50, qy = H - qrSize - 50;
        cx.fillStyle = '#ffffff'; cx.fillRect(qx, qy, qrSize, qrSize);
        cx.fillStyle = dark ? c1 : '#16182f';
        for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) cx.fillRect(qx + (c + 1) * s, qy + (r + 1) * s, Math.ceil(s), Math.ceil(s));
        maxText = qx - x0 - 30;
      }
      if (logoImg) {
        var lh = 110, lw = Math.min(300, logoImg.width * lh / logoImg.height);
        cx.drawImage(logoImg, W - lw - 50, 50, lw, lh);
      }
      cx.textBaseline = 'alphabetic'; cx.textAlign = 'left';
      cx.fillStyle = dark ? '#ffffff' : c1; fit(e.biz.value, logoImg ? W - x0 - 380 : W - x0 - 60, 40, '700'); cx.fillText(e.biz.value, x0, 110);
      cx.fillStyle = ink; fit(e.name.value, maxText, 72, '800'); cx.fillText(e.name.value, x0, 270);
      cx.fillStyle = dark ? c2 : c2; fit(e.title.value, maxText, 36, '600'); cx.fillText(e.title.value, x0, 318);
      var lines = [e.phone.value, e.email.value, e.web.value, e.addr.value].filter(Boolean), y = 420;
      cx.fillStyle = soft;
      lines.forEach(function (l) { fit(l, maxText, 32, '500'); cx.fillText(l, x0, y); y += 44; });
      var o = {}; ['name', 'title', 'biz', 'phone', 'email', 'web', 'addr', 'style', 'c1', 'c2', 'qrto'].forEach(function (k) { o[k] = e[k].value; });
      S.store.set('bk', o);
    };
    var go = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(draw); };
    bk.addEventListener('input', go); bk.addEventListener('change', go);
    document.getElementById('logo').addEventListener('change', function (ev) {
      var file = ev.target.files[0]; if (!file) return;
      S.imageToDataUrl(file, 600, function (url) { var im = new Image(); im.onload = function () { logoImg = im; go(); }; im.src = url; });
    });
    document.getElementById('bk-png').onclick = function () { pngDownload(cv, 'visitekaartje.png'); };
    document.getElementById('bk-sheet').onclick = function () {
      var url = cv.toDataURL('image/png'), p = document.getElementById('bk-print');
      p.hidden = false;
      p.innerHTML = '<div style="display:grid;grid-template-columns:85mm 85mm;gap:0;justify-content:center;padding-top:10mm">' + new Array(11).join('<img src="' + url + '" style="width:85mm;height:55mm;outline:0.2mm dashed #bbb;display:block">') + '</div>';
      setTimeout(function () { S.printDoc(); }, 150);
      window.addEventListener('afterprint', function h() { p.hidden = true; window.removeEventListener('afterprint', h); });
    };
    go();
  }
})();
