/* ============================================================
   JEEVO — FLOURISH
   1. a mandala that draws itself and turns as you scroll
   2. a Devanagari city ribbon running between sections
   3. headings that wipe in, line by line
   ============================================================ */
(function (win, doc) {
  'use strict';

  var reduce = win.matchMedia &&
               win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. the Ashoka Chakra ----------
     The wheel from the centre of the flag: 24 spokes, rim, hub, and the
     stud at each spoke head. A chakra is a wheel, so it turns as you
     scroll. It lives in the right-hand gutter, never behind body text. */
  function chakra() {
    if (reduce) return;

    var C = 200, RIM = 185, RIM_IN = 172, HUB = 26, HUB_IN = 13, N = 24;
    function pt(a, r) {
      return (C + Math.cos(a) * r).toFixed(2) + ',' + (C + Math.sin(a) * r).toFixed(2);
    }
    var spokes = '', studs = '';
    for (var i = 0; i < N; i++) {
      var a = (i / N) * Math.PI * 2 - Math.PI / 2;
      spokes += 'M' + pt(a - 0.030, HUB) + ' L' + pt(a - 0.016, RIM_IN) +
                ' L' + pt(a + 0.016, RIM_IN) + ' L' + pt(a + 0.030, HUB) + ' Z ';
      var s = pt(a, RIM_IN - 6).split(',');
      studs += '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="3.4"/>';
    }

    var el = doc.createElement('div');
    el.className = 'jv-chakra';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<svg viewBox="0 0 400 400">' +
        '<g class="jv-chakra__turn" fill="currentColor" stroke="currentColor">' +
          '<circle cx="200" cy="200" r="' + RIM + '" fill="none" stroke-width="5"/>' +
          '<path d="' + spokes + '" stroke="none"/>' + studs +
          '<circle cx="200" cy="200" r="' + HUB + '" fill="none" stroke-width="4"/>' +
          '<circle cx="200" cy="200" r="' + HUB_IN + '" stroke="none"/>' +
        '</g>' +
      '</svg>';
    doc.body.appendChild(el);

    var turn = el.querySelector('.jv-chakra__turn');
    var ticking = false;
    function spin() {
      if (ticking) return;
      ticking = true;
      (win.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(function () {
        ticking = false;
        var y = win.scrollY || doc.documentElement.scrollTop;
        var max = doc.documentElement.scrollHeight - win.innerHeight;
        var p = max > 0 ? Math.min(1, y / max) : 0;
        turn.style.transform = 'rotate(' + (p * 220) + 'deg)';
        el.classList.toggle('is-on', y > 120);
      });
    }
    win.addEventListener('scroll', spin, { passive: true });
    win.addEventListener('resize', spin, { passive: true });
    spin();
    win.JeevoChakra = { spin: spin };
  }

  /* ---------- 2. the city ribbon ---------- */
  var CITIES = [
    { d:'\u0926\u093F\u0932\u094D\u0932\u0940', l:'Delhi' },
    { d:'\u091C\u092F\u092A\u0941\u0930', l:'Jaipur' },
    { d:'\u0935\u093E\u0930\u093E\u0923\u0938\u0940', l:'Varanasi' },
    { d:'\u0915\u0947\u0930\u0932', l:'Kerala' },
    { d:'\u0917\u094B\u0935\u093E', l:'Goa' },
    { d:'\u0906\u0917\u0930\u093E', l:'Agra' },
    { d:'\u0909\u0926\u092F\u092A\u0941\u0930', l:'Udaipur' },
    { d:'\u090B\u0937\u093F\u0915\u0947\u0936', l:'Rishikesh' },
    { d:'\u0905\u092E\u0943\u0924\u0938\u0930', l:'Amritsar' },
    { d:'\u0932\u0926\u094D\u0926\u093E\u0916', l:'Ladakh' }
  ];

  function ribbon() {
    var anchor = doc.getElementById('packages') || doc.getElementById('destinations');
    if (!anchor || doc.querySelector('.jv-ribbon')) return;

    var run = CITIES.map(function (c) {
      return '<span class="jv-city"><b lang="hi">' + c.d + '</b>' + c.l + '</span>';
    }).join('<span class="jv-sep">\u2727</span>');

    var el = doc.createElement('div');
    el.className = 'jv-ribbon';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="jv-ribbon__track">' + run + '<span class="jv-sep">\u2727</span>' +
                   run + '<span class="jv-sep">\u2727</span></div>';
    anchor.parentNode.insertBefore(el, anchor);
  }

  /* ---------- 3. headings wipe in ---------- */
  function headings() {
    var hs = doc.querySelectorAll('.section-header h2, .section-title');
    if (!hs.length) return;

    if (reduce || !('IntersectionObserver' in win)) {
      hs.forEach(function (h) { h.classList.add('jv-wipe', 'is-in'); });
      return;
    }

    hs.forEach(function (h) { h.classList.add('jv-wipe'); });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

    hs.forEach(function (h) { io.observe(h); });

    /* nothing may stay hidden */
    win.setTimeout(function () {
      hs.forEach(function (h) { h.classList.add('is-in'); });
    }, 3000);
  }

  function init() { chakra(); ribbon(); headings(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();

})(window, document);
