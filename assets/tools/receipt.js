(function () {
  var S = window.SBT, T = S.T, f = document.getElementById('rc');
  if (!f) return;
  var out = document.getElementById('doc');
  var biz = S.store.get('biz', {});
  f.elements.no.value = S.store.get('no:receipt', 'K-' + new Date().getFullYear() + '-001');
  f.elements.date.value = S.today();
  f.elements.by.value = S.store.get('rc:by', biz.s_name || '');
  var M = { cash: T('contant', 'cash'), bank: T('bankoverschrijving', 'bank transfer'), cheque: 'cheque', mobile: T('mobiel betalen', 'mobile payment'), card: T('pinpas', 'debit card') };
  function bump(no) {
    var m = String(no).match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return no + '-2';
    var d = String(parseInt(m[2], 10) + 1);
    while (d.length < m[2].length) d = '0' + d;
    return m[1] + d + m[3];
  }
  function one(label) {
    var E = S.esc, v = function (n) { return E(f.elements[n].value.trim()); }, cur = f.elements.cur.value, amt = S.num(f.elements.amount.value);
    return '<div class="paper" style="--pc:' + E(biz.color || '#1f2251') + ';margin-bottom:14px">' +
      '<div class="ph"><div>' + (biz.logo ? '<img src="' + biz.logo + '" alt="">' : '') + '<div class="dh">' + T('Kwitantie', 'Receipt') + '</div>' + (label ? '<div class="pm">' + label + '</div>' : '') + '</div>' +
      '<div style="text-align:right" class="pm">' + T('Nummer', 'No.') + ': <b>' + v('no') + '</b><br>' + E(S.dateLong(f.elements.date.value)) + '</div></div>' +
      '<table><tbody>' +
      '<tr><td style="width:38%">' + T('Ontvangen van', 'Received from') + '</td><td><b>' + (v('from') || '&nbsp;') + '</b></td></tr>' +
      '<tr><td>' + T('Het bedrag van', 'The sum of') + '</td><td><b style="font-size:1.15rem">' + S.money(amt, cur) + '</b><div class="words">' + E(S.words(amt, cur)) + '</div></td></tr>' +
      '<tr><td>' + T('Wegens', 'For') + '</td><td>' + (v('for') || '&nbsp;') + '</td></tr>' +
      '<tr><td>' + T('Betaald per', 'Paid by') + '</td><td>' + M[f.elements.method.value] + '</td></tr>' +
      '</tbody></table>' +
      '<div class="sigs"><div>' + T('Handtekening ontvanger', 'Signature of recipient') + '<br><b>' + v('by') + '</b></div><div>' + T('Handtekening betaler', 'Signature of payer') + '<br><b>' + v('from') + '</b></div></div>' +
      '<div class="pf">' + v('place') + (v('place') ? ', ' : '') + E(S.dateLong(f.elements.date.value)) + '</div></div>';
  }
  function render() {
    out.innerHTML = f.elements.copy.checked ? one(T('Origineel', 'Original')) + one(T('Kopie', 'Copy')) : one('');
    S.store.set('rc:by', f.elements.by.value);
  }
  f.addEventListener('input', render); f.addEventListener('change', render);
  document.getElementById('next').onclick = function () {
    f.elements.no.value = bump(f.elements.no.value);
    S.store.set('no:receipt', f.elements.no.value);
    f.elements.from.value = ''; f.elements['for'].value = '';
    render();
  };
  window.addEventListener('afterprint', function () { S.store.set('no:receipt', bump(f.elements.no.value)); });
  document.getElementById('wa').onclick = function () {
    var cur = f.elements.cur.value, amt = S.num(f.elements.amount.value);
    var t = T('Kwitantie', 'Receipt') + ' ' + f.elements.no.value + ' (' + S.dateLong(f.elements.date.value) + ')\n' +
      T('Ontvangen van', 'Received from') + ': ' + f.elements.from.value + '\n' +
      T('Bedrag', 'Amount') + ': ' + S.money(amt, cur) + ' (' + S.words(amt, cur) + ')\n' +
      T('Wegens', 'For') + ': ' + f.elements['for'].value + '\n' + T('Ontvangen door', 'Received by') + ': ' + f.elements.by.value;
    window.open(S.waUrl(t, ''), '_blank', 'noopener');
  };
  render();
})();
