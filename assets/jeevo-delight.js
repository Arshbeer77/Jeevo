/* ============================================================
   JEEVO — SMALL DELIGHTS
   1. a plane rides the scroll bar
   2. a passport stamp lands on a tour card when you hover it
   3. the nav globe turns when you hover the logo   (css only)
   4. type "kite" for Uttarayan
   5. Shubh Yatra on a completed booking
   ============================================================ */
(function (win, doc) {
  'use strict';

  var reduce = win.matchMedia &&
               win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PLANE = 'M 62 0 L 30 -4 L 8 -26 L -2 -26 L 10 -5 L -18 -3 L -30 -16 L -38 -16 ' +
              'L -32 -2 L -42 0 L -32 2 L -38 16 L -30 16 L -18 3 L 10 5 ' +
              'L -2 26 L 8 26 L 30 4 Z';

  /* ---------- 1. the plane rides the scroll bar ---------- */
  function flyer() {
    var bar = doc.querySelector('.jv-progress');
    if (!bar || reduce) return;

    var el = doc.createElement('div');
    el.className = 'jv-flyer';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<svg viewBox="-46 -30 112 60"><path d="' + PLANE +
                   '" fill="currentColor"/></svg>';
    doc.body.appendChild(el);

    var ticking = false;
    function place() {
      if (ticking) return;
      ticking = true;
      (win.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(function () {
        ticking = false;
        var y   = win.scrollY || doc.documentElement.scrollTop;
        var max = doc.documentElement.scrollHeight - win.innerHeight;
        var p   = max > 0 ? Math.min(1, y / max) : 0;
        el.style.left = (p * win.innerWidth) + 'px';
        el.classList.toggle('is-on', y > 60);
      });
    }
    win.addEventListener('scroll', place, { passive: true });
    win.addEventListener('resize', place, { passive: true });
    place();
  }

  /* ---------- 2. passport stamps ---------- */
  function stamps() {
    var cards = doc.querySelectorAll('.package-card, .dest-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      if (card.querySelector('.jv-stamp')) return;

      /* stamp reads the destination off the card itself */
      var t = card.querySelector('h3, .package-title, .dest-title');
      var place = (t ? t.textContent : 'India').trim().toUpperCase().slice(0, 16);

      card.classList.add('jv-stampable');
      var s = doc.createElement('div');
      s.className = 'jv-stamp';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML =
        '<svg viewBox="0 0 100 100">' +
          '<defs><path id="jvArc" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0" fill="none"/></defs>' +
          '<circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
          '<circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" stroke-width="1"' +
                 ' stroke-dasharray="3 3"/>' +
          '<text font-family="Mukta, system-ui, sans-serif" font-size="8.5" font-weight="600"' +
               ' letter-spacing="1.6" fill="currentColor">' +
            '<textPath href="#jvArc" startOffset="50%" text-anchor="middle">JEEVO TOURS</textPath>' +
          '</text>' +
          '<text x="50" y="54" text-anchor="middle" font-family="Mukta, system-ui, sans-serif"' +
               ' font-size="9" font-weight="700" letter-spacing=".6" fill="currentColor">' +
            place.slice(0, 12) + '</text>' +
          '<text x="50" y="68" text-anchor="middle" font-family="Mukta, system-ui, sans-serif"' +
               ' font-size="6.5" letter-spacing="1.2" fill="currentColor">ARRIVED</text>' +
        '</svg>';
      card.appendChild(s);
    });
  }

  /* ---------- 4. type "kite" for Uttarayan ---------- */
  function kite() {
    if (reduce) return;
    var typed = '';
    var flying = false;

    doc.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (!/^[a-z]$/i.test(e.key)) return;

      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed === 'kite' && !flying) launch();
    });

    function launch() {
      flying = true;
      var k = doc.createElement('div');
      k.className = 'jv-kite';
      k.setAttribute('aria-hidden', 'true');
      k.innerHTML =
        '<svg viewBox="0 0 60 130">' +
          '<g>' +
            '<path d="M30 2 L56 34 L30 74 L4 34 Z" fill="#E8862E"/>' +
            '<path d="M30 2 L56 34 L30 74 Z" fill="#F5A623"/>' +
            '<path d="M30 2 L30 74 M4 34 L56 34" stroke="#5A2D0C" stroke-width="1.4" opacity=".55"/>' +
          '</g>' +
          '<g class="jv-kite__tail">' +
            '<path d="M30 74 q 9 16 0 30 q -9 16 0 26" stroke="#5A2D0C" stroke-width="1.8"' +
                  ' fill="none" stroke-linecap="round"/>' +
            '<circle cx="30" cy="92"  r="3.4" fill="#A8322A"/>' +
            '<circle cx="30" cy="110" r="3.4" fill="#0F6B5C"/>' +
            '<circle cx="30" cy="128" r="3.4" fill="#F5A623"/>' +
          '</g>' +
        '</svg>';
      doc.body.appendChild(k);

      var w = win.innerWidth, h = win.innerHeight;
      var start = -90, end = w + 90;
      var baseY = h * 0.18 + Math.random() * h * 0.25;
      var t0 = null, DUR = 5200;

      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / DUR);
        var x = start + (end - start) * p;
        /* drifts and bobs, the way a kite actually flies */
        var y = baseY + Math.sin(p * Math.PI * 3) * 46 - p * 60;
        var rot = Math.sin(p * Math.PI * 3) * 14 - 6;
        k.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg)';
        if (p < 1) win.requestAnimationFrame(step);
        else { if (k.parentNode) k.parentNode.removeChild(k); flying = false; }
      }
      win.requestAnimationFrame(step);
    }
  }

  /* ---------- 5. Shubh Yatra on a completed booking ---------- */
  function yatra() {
    var seen = new WeakSet();
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        [].forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          var box = n.classList && n.classList.contains('form-success')
                  ? n : n.querySelector && n.querySelector('.form-success');
          if (!box || seen.has(box)) return;
          seen.add(box);
          var p = doc.createElement('span');
          p.className = 'jv-yatra';
          /* शुभ यात्रा  = shubh yatra */
          p.innerHTML = '<i>\u0936\u0941\u092D \u092F\u093E\u0924\u094D\u0930\u093E</i>Safe travels';
          box.appendChild(p);
        });
      });
    }).observe(doc.body, { childList: true, subtree: true });
  }

  function init() { flyer(); stamps(); kite(); yatra(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();

})(window, document);
