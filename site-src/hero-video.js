/* esotico homepage hero: a silent loop inside the arch (16 Oct 2026, owner: "an introductory video ... inside the arch").
   The photograph stays the first paint and the poster; the film is fetched only after the page has loaded, and never for
   visitors who ask for reduced motion or save data. It fades in once it is actually playing, so a slow network shows the
   photograph, never a black box. Films: films/hero-arch-v2-desktop.mp4 (720x900, 1.1 MB) and -mobile.mp4 (480x600, 718 KB), 19.3 s, the whole range, built by marketing/hero_loop.py). */
(function () {
  var BLOCK = '.fe-block-57f564f120d8876331d2 .fluid-image-container';
  // two sizes (16 Oct, owner worried about weight): phones get 480x600 (718 KB) - the arch is ~330 px wide there - and
  // larger screens 720x900 (1.1 MB); both side by side with the 1.6 MB master showed no visible difference
  var small = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  var SRC = 'https://esoticolifestyle.github.io/esotico/films/hero-arch-v2-' + (small ? 'mobile' : 'desktop') + '.mp4';
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var conn = navigator.connection || {};
  if ((mq && mq.matches) || conn.saveData || /2g/.test(conn.effectiveType || '')) return;

  function mount() {
    var box = document.querySelector(BLOCK);
    if (!box || box.querySelector('video.eso-hero-film')) return;
    var img = box.querySelector('img');
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    var v = document.createElement('video');
    v.className = 'eso-hero-film';
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.preload = 'auto';
    if (img) v.poster = img.currentSrc || img.src;
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:999px 999px 0 0;' +
      'opacity:0;transition:opacity 1.2s ease;pointer-events:none;z-index:1;';
    v.addEventListener('playing', function () { v.style.opacity = '1'; }, { once: true });
    v.src = SRC;
    box.appendChild(v);
    var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay refused: the photograph stays */ });
    // pause while off screen, resume when back (saves battery on phones)
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else v.pause(); });
    }).observe(box);
  }
  function later() { setTimeout(mount, 300); }
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
})();
