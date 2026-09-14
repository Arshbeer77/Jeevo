/* ============================================================
   JEEVO — "COLOURS OF INDIA" SCROLL
   Each section carries a real pigment. As you scroll, the
   ambient wash lerps between them and names the colour.
   ============================================================ */
(function (win, doc) {
  'use strict';

  /* Real pigments, not invented ones. a = dominant, b = companion. */
  var PIGMENTS = [
    { id:'home',         name:'Marigold',  a:'#F5A623', b:'#E8862E', ra:'245,166,35',  rb:'232,134,46' },
    { id:'about',        name:'Sandstone', a:'#C98A5B', b:'#E0A96D', ra:'201,138,91',  rb:'224,169,109' },
    { id:'destinations', name:'Indigo',    a:'#33497E', b:'#5A6FA8', ra:'51,73,126',   rb:'90,111,168' },
    { id:'packages',     name:'Saffron',   a:'#E8862E', b:'#F5A623', ra:'232,134,46',  rb:'245,166,35' },
    { id:'gallery',      name:'Peacock',   a:'#0F6B5C', b:'#1F8E77', ra:'15,107,92',   rb:'31,142,119' },
    { id:'testimonials', name:'Kumkum',    a:'#A8322A', b:'#C2503F', ra:'168,50,42',   rb:'194,80,63' },
    { id:'contact',      name:'Henna',     a:'#7A4418', b:'#A2622B', ra:'122,68,24',   rb:'162,98,43' }
  ];

  var reduce = win.matchMedia &&
               win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- build the furniture ---------- */
  var wash = doc.createElement('div');  wash.className = 'jv-wash';
  var bar  = doc.createElement('div');  bar.className  = 'jv-progress';
  var tag  = doc.createElement('div');  tag.className  = 'jv-pigment';
  tag.innerHTML = '<i></i><span>Marigold</span>';
  tag.setAttribute('aria-hidden', 'true');

  doc.addEventListener('DOMContentLoaded', function () {
    doc.body.appendChild(wash);
    doc.body.appendChild(bar);
    if (!reduce) doc.body.appendChild(tag);
    wire();
  });

  function setHue(p) {
    var r = doc.documentElement;
    r.style.setProperty('--jv-hue-a', p.a);
    r.style.setProperty('--jv-hue-b', p.b);
    r.style.setProperty('--jv-rgb-a', p.ra);
    r.style.setProperty('--jv-rgb-b', p.rb);
    var label = tag.querySelector('span');
    if (label && label.textContent !== p.name) {
      label.textContent = p.name;
      tag.classList.add('is-on');
    }
  }

  function wire() {
    /* map each pigment to a real section on this page */
    var stops = PIGMENTS
      .map(function (p) { return { p: p, el: doc.getElementById(p.id) }; })
      .filter(function (s) { return s.el; });

    /* tour pages have no #ids — fall back to marigold + reveals only */
    if (!stops.length) { setHue(PIGMENTS[0]); revealAll(); return; }

    var current = null;
    var ticking = false;

    /* rAF is suspended in background tabs — fall back to a timer so the
       page is never left mid-state if it was scrolled while hidden. */
    var schedule = (win.requestAnimationFrame || function (fn) { return win.setTimeout(fn, 16); })
                     .bind(win);

    function onScroll() {
      if (ticking) return;
      ticking = true;
      schedule(function () { ticking = false; update(); });
    }

    function update() {
        var y   = win.scrollY || doc.documentElement.scrollTop;
        var max = doc.documentElement.scrollHeight - win.innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

        /* whichever section owns the middle of the viewport wins */
        var mid  = y + win.innerHeight * 0.45;
        var pick = stops[0];
        for (var i = 0; i < stops.length; i++) {
          if (stops[i].el.offsetTop <= mid) pick = stops[i];
        }
        if (pick.p !== current) { current = pick.p; setHue(pick.p); }

        if (y < 40) tag.classList.remove('is-on');
        else        tag.classList.add('is-on');
    }

    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', onScroll, { passive: true });
    /* catch up whenever the tab comes back to the foreground */
    doc.addEventListener('visibilitychange', function () { if (!doc.hidden) update(); });
    onScroll();
    win.JeevoScroll = { update: update, pigments: PIGMENTS };

    revealAll();
  }

  /* ---------- staggered reveal ----------
     Rule: content must never stay hidden. Anything already on screen
     shows at once, and a failsafe reveals the rest no matter what. */
  function revealAll() {
    var targets = [].slice.call(doc.querySelectorAll(
      '.package-card, .dest-card, .testimonial-card, .gallery-item, ' +
      '.section-header, .highlight-card, .itinerary-day'
    ));
    if (!targets.length) return;

    function showNow(el) {
      el.classList.add('is-in');
    }

    if (reduce || !('IntersectionObserver' in win)) {
      targets.forEach(function (t) { t.classList.add('jv-rise'); showNow(t); });
      return;
    }

    targets.forEach(function (t) {
      /* clear inline styles the old script.js may have set */
      t.style.opacity = '';
      t.style.transform = '';
      t.style.transition = '';
      t.classList.add('jv-rise');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = [].slice.call(e.target.parentNode.children);
        var idx  = Math.max(0, sibs.indexOf(e.target));
        e.target.style.transitionDelay = Math.min(idx, 5) * 65 + 'ms';
        showNow(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '200px 0px 200px 0px' });

    targets.forEach(function (t) { io.observe(t); });

    /* 1. anything at or above the fold right now: no waiting */
    function sweepVisible() {
      targets.forEach(function (t) {
        if (t.classList.contains('is-in')) return;
        var r = t.getBoundingClientRect();
        if (r.top < win.innerHeight + 200) { showNow(t); io.unobserve(t); }
      });
    }
    sweepVisible();
    win.addEventListener('scroll', sweepVisible, { passive: true });

    /* 2. failsafe: whatever happens, nothing stays invisible */
    win.setTimeout(function () {
      targets.forEach(function (t) {
        if (!t.classList.contains('is-in')) { t.style.transitionDelay = '0ms'; showNow(t); }
      });
    }, 2500);
  }

})(window, document);
