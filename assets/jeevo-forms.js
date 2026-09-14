/* ============================================================
   JEEVO — CONTACT DETAILS + FORM HANDLING (site-wide)

   ▼▼▼  EDIT THESE FOUR LINES. NOTHING ELSE.  ▼▼▼
   Every phone number, WhatsApp link and form on every page
   reads from here.
   ============================================================ */
window.JEEVO_CONFIG = {
  // 1. Free, 2 min, no account: https://web3forms.com
  //    Enter the inbox that should receive enquiries, they email you a key.
  //    Leave blank and forms fall back to opening the visitor's email app.
  web3formsKey : "5c467136-9c4a-4188-a56c-2d16c0e29c35",

  // 2. Where enquiries land (also the fallback address)
  contactEmail : "jazzdtrainer@gmail.com",

  // 3. WhatsApp — digits only. No +, no spaces. e.g. "61412345678"
  whatsapp     : "919876543210",

  // 4. Phone as you want it DISPLAYED on the page
  phoneDisplay : "+91 98765 43210"
};
/* ▲▲▲  STOP EDITING  ▲▲▲ */

(function (win, doc) {
  'use strict';
  var CFG = win.JEEVO_CONFIG;

  var PLACEHOLDERS = ['919876543210', '+91 98765 43210', '+91 11 2345 6789'];

  function digits(s) { return (s || '').replace(/[^\d]/g, ''); }

  /* ---------- point every contact link at the real details ---------- */
  function applyContactDetails() {
    doc.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
      a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + digits(CFG.whatsapp));
    });
    doc.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.href = 'tel:+' + digits(CFG.whatsapp);
    });
    doc.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      a.href = a.href.replace(/mailto:[^?]*/, 'mailto:' + CFG.contactEmail);
    });

    /* visible placeholder numbers in copy */
    var walk = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walk.nextNode())) {
      PLACEHOLDERS.forEach(function (ph) {
        if (n.nodeValue.indexOf(ph) !== -1) {
          n.nodeValue = n.nodeValue.split(ph).join(CFG.phoneDisplay);
        }
      });
    }
  }

  /* ---------- success panel ---------- */
  function successPanel(firstName, waText) {
    var wa = 'https://wa.me/' + digits(CFG.whatsapp) +
             '?text=' + encodeURIComponent(waText || 'Hi Jeevo Tours, I just sent an enquiry.');
    return '<div class="form-success">' +
             '<i class="fas fa-circle-check"></i>' +
             '<h3>Thanks' + (firstName ? ', ' + firstName : '') + '</h3>' +
             '<p>Your enquiry is in. We reply within one business day — ' +
               'usually a lot sooner.</p>' +
             '<p style="margin-top:18px">' +
               '<a class="btn btn-whatsapp" target="_blank" rel="noopener" href="' + wa + '">' +
                 '<i class="fab fa-whatsapp"></i> Or message us now on WhatsApp</a>' +
             '</p>' +
           '</div>';
  }

  /* ---------- generic submit ---------- */
  function wire(form, kind) {
    if (form.dataset.jeevoWired) return;
    form.dataset.jeevoWired = '1';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var btn  = form.querySelector('[type="submit"]');
      var keep = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
      if (win.JeevoLoader) JeevoLoader.attach(form);

      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = v; });

      var subject = kind === 'booking'
        ? 'Jeevo booking enquiry — ' + (d.tour || 'Tour') + ' — ' + (d.name || '')
        : kind === 'newsletter'
          ? 'Jeevo newsletter signup — ' + (d.email || '')
          : 'Jeevo enquiry — ' + (d.name || '');

      function done() {
        if (win.JeevoLoader) JeevoLoader.detach(form);
        if (kind === 'newsletter') {
          var p = doc.createElement('p');
          p.className = 'form-note';
          p.setAttribute('role', 'status');
          p.textContent = 'Thanks — you are on the list.';
          form.parentNode.replaceChild(p, form);
        } else {
          form.outerHTML = successPanel(
            (d.name || '').trim().split(' ')[0],
            d.tour ? 'Hi Jeevo Tours, I just enquired about the ' + d.tour + '.' : ''
          );
        }
      }

      function fallbackMailto() {
        if (win.JeevoLoader) JeevoLoader.detach(form);
        if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = keep; }
        var lines = Object.keys(d).map(function (k) { return k + ': ' + d[k]; }).join('\n');
        win.location.href = 'mailto:' + CFG.contactEmail +
          '?subject=' + encodeURIComponent(subject) +
          '&body='    + encodeURIComponent(lines);
      }

      if (!CFG.web3formsKey) { fallbackMailto(); return; }

      fetch('https://api.web3forms.com/submit', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body   : JSON.stringify(Object.assign({
          access_key: CFG.web3formsKey,
          subject   : subject,
          from_name : 'Jeevo website',
          replyto   : d.email || ''
        }, d))
      })
      .then(function (r) { r.ok ? done() : fallbackMailto(); })
      .catch(fallbackMailto);
    });
  }

  function init() {
    applyContactDetails();
    doc.querySelectorAll('form.booking-form, form[data-jeevo-form="booking"]')
       .forEach(function (f) { wire(f, 'booking'); });
    doc.querySelectorAll('form.newsletter-form')
       .forEach(function (f) { wire(f, 'newsletter'); });
    /* #contactForm is handled in script.js — left alone on purpose */
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();

  win.JeevoForms = { apply: applyContactDetails };

})(window, document);
