/* PDF tools, all in the browser with pdf-lib (MIT, vendored). */
(function () {
  var S = window.SBT, T = S.T;
  var inp = document.getElementById('pdf-in'), drop = document.getElementById('pdf-drop'), listEl = document.getElementById('pdf-files');
  var go = document.getElementById('pdf-go'), msg = document.getElementById('pdf-msg');
  if (!inp) return;
  var mode = 'merge', files = [];
  var single = { pages: 1, rotate: 1, num: 1 };

  function status(t, ok) { msg.textContent = t; msg.className = 'form-status ' + (t ? (ok ? 'ok' : 'err') : ''); }
  function setMode(m) {
    mode = m; files = []; status('');
    S.$$('#pdf-modes .chip').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-m') === m); });
    ['pages', 'rotate', 'img', 'num'].forEach(function (k) { document.getElementById('opt-' + k).hidden = k !== m; });
    inp.accept = m === 'img' ? 'image/*' : 'application/pdf';
    inp.multiple = !single[m];
    document.getElementById('drop-t').textContent = m === 'img' ? T('Kies foto\'s of sleep ze hierheen', 'Choose photos or drag them here') :
      single[m] ? T('Kies een PDF of sleep hem hierheen', 'Choose a PDF or drag it here') : T('Kies PDF bestanden of sleep ze hierheen', 'Choose PDF files or drag them here');
    document.getElementById('drop-s').textContent = single[m] ? T('Eén bestand', 'One file') : T('Meerdere bestanden mogelijk, de volgorde kun je aanpassen', 'Several files, you can change the order');
    renderList();
  }
  function renderList() {
    listEl.innerHTML = files.map(function (f, i) {
      return '<li><span>' + (i + 1) + '. ' + S.esc(f.name) + ' <small class="sub">(' + Math.round(f.size / 1024) + ' KB)</small></span>' +
        (files.length > 1 ? '<button type="button" data-up="' + i + '" aria-label="' + T('Omhoog', 'Up') + '">&uarr;</button><button type="button" data-down="' + i + '" aria-label="' + T('Omlaag', 'Down') + '">&darr;</button>' : '') +
        '<button type="button" data-rm="' + i + '" aria-label="' + T('Verwijderen', 'Remove') + '">&times;</button></li>';
    }).join('');
    var need = mode === 'merge' ? 2 : 1;
    go.disabled = files.length < need;
    if (mode === 'merge' && files.length === 1) status(T('Voeg nog minstens één PDF toe.', 'Add at least one more PDF.'), false);
    else if (msg.className.indexOf('err') >= 0) status('');
  }
  function add(list) {
    var ok = Array.prototype.filter.call(list, function (f) { return mode === 'img' ? /^image\//.test(f.type) : (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)); });
    if (single[mode]) files = ok.slice(0, 1); else files = files.concat(ok);
    renderList();
  }
  S.$$('#pdf-modes .chip').forEach(function (c) { c.addEventListener('click', function () { setMode(c.getAttribute('data-m')); }); });
  inp.addEventListener('change', function () { add(inp.files); inp.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('on'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('on'); }); });
  drop.addEventListener('drop', function (e) { add(e.dataTransfer.files); });
  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var i;
    if (b.hasAttribute('data-rm')) files.splice(+b.getAttribute('data-rm'), 1);
    if (b.hasAttribute('data-up') && (i = +b.getAttribute('data-up')) > 0) files.splice(i - 1, 0, files.splice(i, 1)[0]);
    if (b.hasAttribute('data-down') && (i = +b.getAttribute('data-down')) < files.length - 1) files.splice(i + 1, 0, files.splice(i, 1)[0]);
    renderList();
  });

  function buf(f) { return f.arrayBuffer ? f.arrayBuffer() : new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.readAsArrayBuffer(f); }); }
  function parseRange(s, max) {
    var out = {};
    String(s || '').split(/[,;\s]+/).forEach(function (p) {
      if (!p) return;
      var m = p.match(/^(\d+)(?:-(\d+)?)?$/);
      if (!m) throw new Error(T('Ongeldige paginakeuze: ', 'Invalid page selection: ') + p);
      var a = +m[1], b = m[2] ? +m[2] : (p.indexOf('-') > 0 ? max : a);
      for (var i = Math.min(a, b); i <= Math.max(a, b); i++) if (i >= 1 && i <= max) out[i - 1] = 1;
    });
    return Object.keys(out).map(Number).sort(function (a, b) { return a - b; });
  }
  function load(ab) { return PDFLib.PDFDocument.load(ab, { ignoreEncryption: false }); }
  function save(doc, name) {
    return doc.save().then(function (bytes) {
      S.download(new Blob([bytes], { type: 'application/pdf' }), name);
      status(T('Klaar. Je download is gestart.', 'Done. Your download has started.'), true);
    });
  }
  function base(f) { return f.name.replace(/\.pdf$/i, ''); }
  function toJpeg(file) {
    // images other than JPG/PNG (WebP, HEIC where supported) are drawn to a canvas first
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0);
        c.toBlob(function (b) { URL.revokeObjectURL(url); b.arrayBuffer().then(res); }, 'image/jpeg', 0.9);
      };
      img.onerror = function () { rej(new Error(T('Deze foto kan de browser niet lezen: ', 'The browser cannot read this photo: ') + file.name)); };
      img.src = url;
    });
  }

  go.addEventListener('click', function () {
    if (!window.PDFLib) { status(T('Even geduld, de PDF-module laadt nog.', 'One moment, the PDF module is still loading.'), false); return; }
    go.disabled = true; status(T('Bezig...', 'Working...'), true);
    var L = PDFLib, job;
    if (mode === 'merge') {
      job = L.PDFDocument.create().then(function (out) {
        return files.reduce(function (p, f) {
          return p.then(function () { return buf(f).then(load).then(function (src) { return out.copyPages(src, src.getPageIndices()).then(function (pg) { pg.forEach(function (x) { out.addPage(x); }); }); }); });
        }, Promise.resolve()).then(function () { return save(out, T('samengevoegd.pdf', 'merged.pdf')); });
      });
    } else if (mode === 'pages') {
      job = buf(files[0]).then(load).then(function (src) {
        var n = src.getPageCount(), sel = parseRange(document.getElementById('range').value, n);
        if (!sel.length) throw new Error(T('Kies minstens één pagina (dit document heeft ', 'Choose at least one page (this document has ') + n + T(' pagina\'s).', ' pages).'));
        var keep = document.getElementById('keep').value === 'keep' ? sel : src.getPageIndices().filter(function (i) { return sel.indexOf(i) < 0; });
        if (!keep.length) throw new Error(T('Dan blijft er geen pagina over.', 'No pages would be left.'));
        return L.PDFDocument.create().then(function (out) { return out.copyPages(src, keep).then(function (pg) { pg.forEach(function (x) { out.addPage(x); }); return save(out, base(files[0]) + T('-paginas.pdf', '-pages.pdf')); }); });
      });
    } else if (mode === 'rotate') {
      job = buf(files[0]).then(load).then(function (doc) {
        var n = doc.getPageCount(), r = document.getElementById('rrange').value.trim(), deg = +document.getElementById('deg').value;
        var sel = r ? parseRange(r, n) : doc.getPageIndices();
        sel.forEach(function (i) { var p = doc.getPage(i); p.setRotation(L.degrees((p.getRotation().angle + deg) % 360)); });
        return save(doc, base(files[0]) + T('-gedraaid.pdf', '-rotated.pdf'));
      });
    } else if (mode === 'img') {
      job = L.PDFDocument.create().then(function (doc) {
        var size = document.getElementById('psize').value, margin = document.getElementById('margin').checked ? 28 : 0;
        return files.reduce(function (p, f) {
          return p.then(function () {
            var isJ = /jpe?g$/i.test(f.type), isP = /png$/i.test(f.type);
            return (isJ || isP ? buf(f) : toJpeg(f)).then(function (ab) {
              return (isP ? doc.embedPng(ab) : doc.embedJpg(ab)).then(function (img) {
                var W, H;
                if (size === 'fit') { W = img.width + margin * 2; H = img.height + margin * 2; }
                else { var s = size === 'a4' ? [595.28, 841.89] : [612, 792]; var land = img.width > img.height; W = land ? s[1] : s[0]; H = land ? s[0] : s[1]; }
                var page = doc.addPage([W, H]);
                var sc = Math.min((W - margin * 2) / img.width, (H - margin * 2) / img.height, size === 'fit' ? 1 : Infinity);
                var w = img.width * sc, h = img.height * sc;
                page.drawImage(img, { x: (W - w) / 2, y: (H - h) / 2, width: w, height: h });
              });
            });
          });
        }, Promise.resolve()).then(function () { return save(doc, T('fotos.pdf', 'photos.pdf')); });
      });
    } else if (mode === 'num') {
      job = buf(files[0]).then(load).then(function (doc) {
        return doc.embedFont(L.StandardFonts.Helvetica).then(function (font) {
          var pages = doc.getPages(), n = pages.length, pos = document.getElementById('npos').value, fmt = document.getElementById('nfmt').value;
          var start = Math.round(S.num(document.getElementById('nstart').value)) || 1;
          pages.forEach(function (p, i) {
            var t = fmt === 'nn' ? T('Pagina ', 'Page ') + (i + start) + T(' van ', ' of ') + (n + start - 1) : String(i + start);
            var sz = 10, w = font.widthOfTextAtSize(t, sz), ps = p.getSize(), m = 24;
            var x = pos === 'bc' ? (ps.width - w) / 2 : ps.width - w - m, y = pos === 'tr' ? ps.height - m - sz : m;
            p.drawText(t, { x: x, y: y, size: sz, font: font, color: L.rgb(0.2, 0.2, 0.25) });
          });
          return save(doc, base(files[0]) + T('-genummerd.pdf', '-numbered.pdf'));
        });
      });
    }
    job.catch(function (err) {
      var t = String(err && err.message || err);
      if (/encrypt/i.test(t)) t = T('Deze PDF is beveiligd met een wachtwoord en kan niet worden bewerkt.', 'This PDF is password protected and cannot be edited.');
      status(t, false);
    }).then(function () { go.disabled = false; renderList(); });
  });
  setMode('merge');
})();
