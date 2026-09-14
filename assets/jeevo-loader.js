/* ============================================================
   JEEVO — INTRO
   1. globe centre-screen, plane orbiting it
   2. globe flies to the corner
   3. it becomes the O, and "jeev" slides out of it
   ============================================================ */
(function (win, doc) {
  'use strict';

  var HOLD   = 2000;   // watch the plane go round, read the greeting
  var FLIGHT = 1650;   // must match jvFly in the css
  var reduce = win.matchMedia &&
               win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the travelling globe — same artwork as the O in the nav logo */
  function orbSVG() {
    return '<svg class="jv-orb" viewBox="0 0 200 200" aria-label="Jeevo, loading">' +
      '<g class="jv-orb__ring"><path d="M18 100 A 82 32 0 0 1 182 100" fill="none" ' +
        'stroke="#5A2D0C" stroke-width="2.6" stroke-linecap="round" opacity=".22" ' +
        'transform="rotate(-18 100 100)"/></g>' +
      '<g transform="translate(100,100)">' +
        '<circle class="jv-orb__sphere" cx="0" cy="0" r="54" fill="#F5A623"/>' +
        '<clipPath id="jvOrbClip"><circle cx="0" cy="0" r="54"/></clipPath>' +
        '<g clip-path="url(#jvOrbClip)"><g class="jv-spin">' +
          '<g fill="#D8830B">' +
            '<path d="M-30-34c8-3 15 2 16 9 1 8-5 12-4 19 1 6 8 8 8 15 0 9-9 13-10 21' +
                    ' -1 8 3 16-4 19-7 3-13-5-14-12-3-13-1-25 0-37 1-13 3-31 8-34Z"/>' +
            '<path d="M8-38c13-2 24 4 27 12 3 8-3 14 0 20 3 7 11 9 11 17 0 9-10 12-17 10' +
                    ' -7-1-13-6-19-3-6 3-6 12-5 19 1 9 5 17 0 24-6 6-15 1-17-6' +
                    ' -6-14-3-28-1-42 1-14 4-30 11-43 3-5 6-8 10-8Z"/>' +
          '</g>' +
          '<g stroke="#FFFFFF" stroke-width="2.2" fill="none" opacity=".9">' +
            '<path d="M-52-22 H52"/><path d="M-54 2 H54"/><path d="M-50 26 H50"/>' +
            '<ellipse cx="0" cy="0" rx="22" ry="54"/>' +
            '<line x1="0" y1="-54" x2="0" y2="54"/>' +
          '</g>' +
        '</g></g>' +
      '</g>' +
      '<g class="jv-orb__ring" transform="rotate(-18 100 100)">' +
        '<path d="M182 100 A 82 32 0 0 1 18 100" fill="none" stroke="#5A2D0C" ' +
          'stroke-width="3" stroke-linecap="round"/>' +
        '<g class="jv-orb__plane"><path transform="scale(0.34)" fill="#5A2D0C" ' +
          'd="M 62 0 L 30 -4 L 8 -26 L -2 -26 L 10 -5 L -18 -3 L -30 -16 L -38 -16 ' +
             'L -32 -2 L -42 0 L -32 2 L -38 16 L -30 16 L -18 3 L 10 5 ' +
             'L -2 26 L 8 26 L 30 4 Z"/></g>' +
      '</g>' +
    '</svg>';
  }

  function intro() {
    var navGlobe  = doc.querySelector('.nav-logo .jv-logo__globe');
    var navWord   = doc.querySelector('.nav-logo .jv-logo__word');
    var navSwoosh = doc.querySelector('.nav-logo .jv-logo__swoosh');
    var bar       = doc.querySelector('.navbar');
    var done      = function () { doc.documentElement.classList.add('jv-ready'); };

    var vw = win.innerWidth || doc.documentElement.clientWidth || 0;
    if (!navGlobe || reduce || vw < 320) { done(); return; }

    /* hold the three pieces of the logo back */
    navGlobe.classList.add('jv-hold');
    if (navWord)   navWord.classList.add('jv-hold');
    if (navSwoosh) navSwoosh.classList.add('jv-hold');

    var veil = doc.createElement('div');
    veil.className = 'jv-veil';
    veil.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(veil);

    /* Separate layer, ABOVE the navbar. Inside the veil the orb would be
       trapped in its stacking context and fly behind the nav bar. */
    var flight = doc.createElement('div');
    flight.className = 'jv-flight';
    flight.setAttribute('aria-hidden', 'true');
    flight.innerHTML =
      '<div class="jv-stage">' + orbSVG() +
        '<p class="jv-namaste" lang="hi">\u0928\u092E\u0938\u094D\u0924\u0947</p>' +
        '<p class="jv-namaste-en">NAMASTE</p>' +
      '</div>';
    doc.body.appendChild(flight);

    /* the navbar is a stacking context, so lift it clear of the veil */
    if (bar) bar.classList.add('jv-lift');

    var orb = flight.querySelector('.jv-orb');

    function fly() {
      /* measure sphere to sphere — never box to box */
      var from = orb.querySelector('.jv-orb__sphere').getBoundingClientRect();
      var to   = navGlobe.querySelector('circle').getBoundingClientRect();

      if (!from.width || !to.width) { finish(); return; }

      var scale = to.width / from.width;
      var dx = (to.left + to.width  / 2) - (from.left + from.width  / 2);
      var dy = (to.top  + to.height / 2) - (from.top  + from.height / 2);
      if (!isFinite(scale) || scale <= 0 || Math.abs(dx) + Math.abs(dy) < 40) { finish(); return; }

      flight.classList.add('is-greeted');   /* greeting bows out first */
      orb.style.setProperty('--dx', dx + 'px');
      orb.style.setProperty('--dy', dy + 'px');
      orb.style.setProperty('--sc', scale);
      flight.classList.add('is-flying');
      orb.classList.add('is-flying');

      /* only the flight itself may end the flight — child events bubble */
      orb.addEventListener('animationend', function onEnd(e) {
        if (e.target !== orb || e.animationName !== 'jvFly') return;
        orb.removeEventListener('animationend', onEnd);
        finish();
      });
      win.setTimeout(finish, FLIGHT + 700);
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;

      /* same frame: orb out, nav globe in */
      flight.classList.add('is-landed');

      /* the globe becomes the O, then jeev slides out of it */
      navGlobe.classList.remove('jv-hold');
      navGlobe.classList.add('jv-land');
      if (navWord)   { navWord.classList.remove('jv-hold');   navWord.classList.add('jv-slide'); }
      if (navSwoosh) { navSwoosh.classList.remove('jv-hold'); navSwoosh.classList.add('jv-slide'); }

      veil.classList.add('is-out');
      flight.classList.add('is-out');
      win.setTimeout(function () {
        if (veil.parentNode)   veil.parentNode.removeChild(veil);
        if (flight.parentNode) flight.parentNode.removeChild(flight);
        if (bar) bar.classList.remove('jv-lift');
        done();
      }, 900);
    }

    var launched = false;
    function launch() { if (launched) return; launched = true; win.setTimeout(fly, HOLD); }

    if (doc.readyState === 'complete') launch();
    else win.addEventListener('load', launch);
    win.setTimeout(launch, 4000);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', intro);
  else intro();

  /* ---------- inline busy state for forms ---------- */
  function attach(host) {
    if (!host || host.querySelector(':scope > .jv-busy')) return;
    if (win.getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var el = doc.createElement('div');
    el.className = 'jv-busy';
    el.setAttribute('role', 'status');
    el.innerHTML = '<span></span><span></span><span></span>';
    host.appendChild(el);
  }
  function detach(host) {
    var el = host && host.querySelector(':scope > .jv-busy');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }
  win.JeevoLoader = { attach: attach, detach: detach };

})(window, document);
