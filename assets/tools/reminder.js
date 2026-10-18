(function () {
  var S = window.SBT, f = document.getElementById('rm');
  if (!f) return;
  var msg = document.getElementById('msg'), edited = false;
  var biz = S.store.get('biz', {});
  f.elements.me.value = S.store.get('rm:me', biz.s_name || '');
  f.elements.pay.value = S.store.get('rm:pay', biz.s_bank || '');
  f.elements.invdate.value = S.addDays(S.today(), -30);
  f.elements.due.value = S.addDays(S.today(), -16);

  function dl(s, lng) {
    if (!s) return '';
    return new Date(s + 'T12:00:00').toLocaleDateString(lng === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function money(x, cur, lng) {
    return cur + ' ' + new Intl.NumberFormat(lng === 'nl' ? 'nl-NL' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
  }
  function build() {
    var v = function (n) { return f.elements[n].value.trim(); };
    var lng = v('ml'), tone = v('tone'), nl = lng === 'nl';
    var amt = money(S.num(v('amount')), v('cur'), lng);
    var newDate = dl(S.addDays(S.today(), Math.max(1, S.num(v('days')) || 7)), lng);
    var cust = v('cust'), inv = v('inv'), me = v('me'), pay = v('pay');
    var invd = dl(v('invdate'), lng), due = dl(v('due'), lng);
    var hi = nl ? (cust ? 'Beste ' + cust + ',' : 'Beste klant,') : (cust ? 'Dear ' + cust + ',' : 'Dear customer,');
    var body;
    if (nl) {
      if (tone === '1') body = 'Bij het nalopen van onze administratie zagen we dat factuur ' + inv + (invd ? ' van ' + invd : '') + ' van ' + amt + ' nog openstaat' + (due ? ' (vervaldatum ' + due + ')' : '') + '. Waarschijnlijk is dit aan uw aandacht ontsnapt.\n\nWilt u het bedrag voor ' + newDate + ' overmaken?' + (pay ? '\n\nBetalen kan naar: ' + pay : '') + '\n\nHeeft u inmiddels betaald? Dan kunt u dit bericht als niet verzonden beschouwen. Bedankt!';
      else if (tone === '2') body = 'Ondanks onze eerdere herinnering hebben wij de betaling van factuur ' + inv + ' van ' + amt + (due ? ', die op ' + due + ' verviel,' : '') + ' nog niet ontvangen.\n\nWij verzoeken u dringend het bedrag uiterlijk ' + newDate + ' te voldoen.' + (pay ? '\n\nBetalen kan naar: ' + pay : '') + '\n\nIs er een reden waarom de betaling uitblijft, neem dan vandaag nog contact met ons op, dan zoeken we samen naar een oplossing.';
      else body = 'Dit is onze laatste aanmaning voor factuur ' + inv + ' van ' + amt + (due ? ', vervallen op ' + due : '') + '. Eerdere herinneringen zijn helaas onbeantwoord gebleven.\n\nAls wij het volledige bedrag niet uiterlijk ' + newDate + ' hebben ontvangen, dragen wij de vordering zonder verdere aankondiging over voor incasso. De kosten daarvan komen voor uw rekening.' + (pay ? '\n\nBetalen kan naar: ' + pay : '');
      return hi + '\n\n' + body + '\n\nMet vriendelijke groet,\n' + (me || '');
    }
    if (tone === '1') body = 'Our records show that invoice ' + inv + (invd ? ' of ' + invd : '') + ' for ' + amt + ' is still outstanding' + (due ? ' (due ' + due + ')' : '') + '. It has probably slipped your attention.\n\nCould you please pay the amount by ' + newDate + '?' + (pay ? '\n\nPayment details: ' + pay : '') + '\n\nIf you have already paid, please disregard this message. Thank you!';
    else if (tone === '2') body = 'Despite our earlier reminder we have not yet received payment of invoice ' + inv + ' for ' + amt + (due ? ', which was due on ' + due : '') + '.\n\nWe kindly but urgently ask you to pay the amount by ' + newDate + ' at the latest.' + (pay ? '\n\nPayment details: ' + pay : '') + '\n\nIf there is a reason for the delay, please contact us today so we can find a solution together.';
    else body = 'This is our final notice for invoice ' + inv + ' for ' + amt + (due ? ', due on ' + due : '') + '. Our earlier reminders have unfortunately gone unanswered.\n\nIf we have not received the full amount by ' + newDate + ', we will hand the claim over for collection without further notice. The costs of collection will be charged to you.' + (pay ? '\n\nPayment details: ' + pay : '');
    return hi + '\n\n' + body + '\n\nKind regards,\n' + (me || '');
  }
  function render() {
    if (!edited) msg.value = build();
    S.store.set('rm:me', f.elements.me.value); S.store.set('rm:pay', f.elements.pay.value);
  }
  msg.addEventListener('input', function () { edited = true; });
  f.addEventListener('input', function () { edited = false; render(); });
  f.addEventListener('change', function () { edited = false; render(); });
  document.getElementById('wa').onclick = function () { window.open(S.waUrl(msg.value, f.elements.phone.value), '_blank', 'noopener'); };
  document.getElementById('mail').onclick = function () {
    var nl = f.elements.ml.value === 'nl', tone = f.elements.tone.value;
    var subj = (nl ? ['Herinnering', 'Tweede herinnering', 'Laatste aanmaning'] : ['Reminder', 'Second reminder', 'Final notice'])[tone - 1] + ' ' + (nl ? 'factuur ' : 'invoice ') + f.elements.inv.value;
    location.href = 'mailto:?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(msg.value);
  };
  render();
})();
