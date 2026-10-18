/* Image resizer: canvas based, nothing leaves the device. Metadata (EXIF/GPS) is not copied. */
(function () {
  var S = window.SBT, T = S.T, f = document.getElementById('im');
  if (!f) return;
  var inp = document.getElementById('im-in'), drop = document.getElementById('im-drop'), out = document.getElementById('im-out'), go = document.getElementById('im-go');
  var files = [], results = [];
  var PRE = { wa: [1600, ''], web: [1200, ''], form: [1600, '500'] };
  f.elements.preset.addEventListener('change', function () {
    var p = PRE[f.elements.preset.value];
    if (p) { f.elements.side.value = p[0]; f.elements.maxkb.value = p[1]; }
  });
  f.elements.q.addEventListener('input', function () { document.getElementById('qv').textContent = f.elements.q.value; });
  function add(list) {
    files = files.concat(Array.prototype.filter.call(list, function (x) { return /^image\//.test(x.type); })).slice(0, 30);
    go.disabled = !files.length;
    out.innerHTML = files.map(function (x) { return '<figure><img alt="" src="' + URL.createObjectURL(x) + '">' + S.esc(x.name) + '<br>' + kb(x.size) + '</figure>'; }).join('');
    document.getElementById('im-all').hidden = true;
  }
  function kb(n) { return S.fmt(n / 1024, 0) + ' KB'; }
  inp.addEventListener('change', function () { add(inp.files); inp.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('on'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('on'); }); });
  drop.addEventListener('drop', function (e) { add(e.dataTransfer.files); });

  function loadImg(file) {
    return new Promise(function (res, rej) {
      if (window.createImageBitmap) {
        createImageBitmap(file, { imageOrientation: 'from-image' }).then(res, function () { fallback(); });
      } else fallback();
      function fallback() { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = URL.createObjectURL(file); }
    });
  }
  function blob(c, type, q) { return new Promise(function (res) { c.toBlob(res, type, q); }); }
  function process(file) {
    var side = Math.max(64, Math.round(S.num(f.elements.side.value)) || 1600), maxkb = S.num(f.elements.maxkb.value);
    var ratio = +f.elements.shape.value, type = f.elements.fmt.value, q = +f.elements.q.value / 100;
    return loadImg(file).then(function (img) {
      var sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (ratio) { if (sw / sh > ratio) { var nw = sh * ratio; sx = (sw - nw) / 2; sw = nw; } else { var nh = sw / ratio; sy = (sh - nh) / 2; sh = nh; } }
      var draw = function (longest) {
        var s = Math.min(1, longest / Math.max(sw, sh)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sw * s)); c.height = Math.max(1, Math.round(sh * s));
        var x = c.getContext('2d');
        if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
        x.imageSmoothingQuality = 'high';
        x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        return c;
      };
      var c = draw(side);
      if (!maxkb) return blob(c, type, q).then(function (b) { return { b: b, w: c.width, h: c.height }; });
      // squeeze under the limit: lower quality first, then size
      var tries = 0, qq = type === 'image/png' ? 1 : q, cur = side;
      var step = function () {
        return blob(c, type, qq).then(function (b) {
          if (b.size <= maxkb * 1024 || tries++ > 14) return { b: b, w: c.width, h: c.height, over: b.size > maxkb * 1024 };
          if (type !== 'image/png' && qq > 0.5) qq -= 0.08; else { cur = Math.round(cur * 0.85); c = draw(cur); }
          return step();
        });
      };
      return step();
    });
  }
  go.addEventListener('click', function () {
    go.disabled = true; results = [];
    var ext = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' }[f.elements.fmt.value];
    var figs = S.$$('figure', out);
    files.reduce(function (p, file, i) {
      return p.then(function () {
        return process(file).then(function (r) {
          var name = file.name.replace(/\.[^.]+$/, '') + '-' + T('klein', 'small') + '.' + ext;
          results.push({ b: r.b, name: name });
          var url = URL.createObjectURL(r.b);
          figs[i].innerHTML = '<img alt="" src="' + url + '"><b>' + kb(r.b.size) + '</b> ' + T('was', 'was') + ' ' + kb(file.size) + '<br>' + r.w + ' &times; ' + r.h + (r.over ? '<br><span style="color:var(--down)">' + T('Lukt niet onder de limiet', 'Could not get under the limit') + '</span>' : '') +
            '<br><a href="' + url + '" download="' + S.esc(name) + '">' + T('Download', 'Download') + '</a>';
        }, function () { figs[i].innerHTML += '<br><span style="color:var(--down)">' + T('Kan deze foto niet lezen', 'Cannot read this photo') + '</span>'; });
      });
    }, Promise.resolve()).then(function () { go.disabled = false; document.getElementById('im-all').hidden = results.length < 2; });
  });
  document.getElementById('im-dl').onclick = function () {
    results.forEach(function (r, i) { setTimeout(function () { S.download(r.b, r.name); }, i * 350); });
  };
})();
