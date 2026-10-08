/* esotico header search (8 Oct 2026; owner: "there is no search functionality in the shop"). Squarespace 7.1 has no
   search in this header, so this adds a thin magnifier beside CART (desktop and mobile) that opens an ink overlay:
   a Bodoni input with a gilt rule, live results from site-src/search-index.json (photo, maison, name, price; sold-out
   pieces last), quick links when empty, and the Concierge when nothing matches. Esc or the close mark shuts it; Enter
   opens the first result. The index is fetched on first open only, so the page itself carries no extra weight. */
(function () {
  if (window.__esoticoSearch) return; window.__esoticoSearch = 1;
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/search\.js.*$/, '');
  var INDEX = BASE + 'search-index.json?v=' + new Date().toISOString().slice(0, 10);
  var SYN = { pillow: 'cushion', pillows: 'cushion', blanket: 'throw', blankets: 'throw', plaid: 'throw', fur: 'fur',
    perfume: 'diffuser', scent: 'scents', fragrance: 'fragrance', reed: 'diffuser', plate: 'tray', platter: 'tray',
    holder: 'candlestick', table: 'table', gift: 'gift', soap: 'soap', glove: 'glove', mitten: 'glove', dog: 'dog' };
  var ICON = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 21 21" stroke-linecap="round"/></svg>';
  var CSS = [
    '.eso-s-btn{background:none!important;border:0!important;box-shadow:none!important;padding:0 0 0 24px!important;margin:0!important;min-width:0!important;width:auto!important;height:auto!important;color:inherit;cursor:pointer;display:inline-flex!important;align-items:center;vertical-align:middle;line-height:1;opacity:.9}',
    '.eso-s-btn + .header-actions-action--cart{display:inline-block!important;vertical-align:middle}',
    '.eso-s-btn:hover{opacity:1}.eso-s-btn:focus-visible{outline:1px solid #B6A274;outline-offset:4px}',
    '.eso-s{position:fixed;inset:0;z-index:100000;background:rgba(16,24,32,.985);color:#F4EFE7;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch}',
    '.eso-s.open{display:block}html.eso-s-lock,html.eso-s-lock body{overflow:hidden!important}',
    '.eso-s-in{max-width:1080px;margin:0 auto;padding:clamp(28px,6vw,72px) clamp(16px,4vw,40px) 80px}',
    '.eso-s-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:clamp(28px,5vw,48px)}',
    '.eso-s-eyebrow{font:400 11px/1 "Josefin Sans",sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#B6A274}',
    '.eso-s-x{background:none;border:0;color:#F4EFE7;font:400 11px/1 "Josefin Sans",sans-serif;letter-spacing:.28em;text-transform:uppercase;cursor:pointer;padding:8px 0}',
    '.eso-s-field{display:flex;align-items:center;gap:16px;border-bottom:1px solid rgba(182,162,116,.6);padding-bottom:14px}',
    '.eso-s-field svg{flex:0 0 auto;color:#B6A274;width:24px;height:24px}',
    '.eso-s-input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#F4EFE7;font:400 clamp(28px,5vw,48px)/1.15 "Bodoni Moda",Didot,Georgia,serif;padding:0;-webkit-appearance:none;border-radius:0}',
    '.eso-s-input::placeholder{color:rgba(244,239,231,.38);font-style:italic}',
    '.eso-s-input::-webkit-search-cancel-button{display:none}',
    '.eso-s-note{font:300 14px/1.5 "Josefin Sans",sans-serif;color:rgba(244,239,231,.62);margin:18px 0 0;min-height:21px}',
    '.eso-s-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}',
    '.eso-s-chip{border:1px solid rgba(182,162,116,.55);color:#F4EFE7;text-decoration:none;font:400 11px/1 "Josefin Sans",sans-serif;letter-spacing:.22em;text-transform:uppercase;padding:12px 16px}',
    '.eso-s-chip:hover{border-color:#B6A274;color:#B6A274}',
    '.eso-s-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(14px,2.4vw,28px);margin-top:34px}',
    '@media (max-width:900px){.eso-s-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}',
    '@media (max-width:600px){.eso-s-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '.eso-s-card{color:#F4EFE7;text-decoration:none;display:block}',
    '.eso-s-ph{aspect-ratio:1/1;background:#F4EFE7;border:1px solid rgba(182,162,116,.35);display:flex;align-items:center;justify-content:center;overflow:hidden}',
    '.eso-s-ph img{width:100%;height:100%;object-fit:contain;transition:transform .5s ease}',
    '.eso-s-card:hover .eso-s-ph img{transform:scale(1.04)}.eso-s-card:hover .eso-s-ph{border-color:#B6A274}',
    '.eso-s-b{font:400 10px/1.3 "Josefin Sans",sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#B6A274;margin:14px 0 6px}',
    '.eso-s-n{font:400 15px/1.35 "Josefin Sans",sans-serif;margin:0 0 6px}',
    '.eso-s-p{font:300 14px/1 "Josefin Sans",sans-serif;color:rgba(244,239,231,.75)}',
    '.eso-s-card.sold{opacity:.55}',
    '.eso-s-card:focus-visible{outline:1px solid #B6A274;outline-offset:6px}',
    '@media (prefers-reduced-motion:reduce){.eso-s-ph img{transition:none}}'
  ].join('');
  var QUICK = [['Candles', '/shop/home-fragrance/candles'], ['Diffusers', '/shop/home-fragrance'], ['Refills', '/shop/home-fragrance/refills'],
    ['Faux fur', '/shop/textiles'], ['Trays and tables', '/shop/trays-and-tables'], ['Shop by scent', '/shop/scents'], ['Gift Edit', '/gift-edit']];
  var data = null, loading = null, ov, input, note, grid, chips, lastFocus;

  function norm(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function money(p) { return p == null ? '' : 'CA$' + (p % 1 ? p.toFixed(2) : p.toFixed(0)); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(INDEX).then(function (r) { return r.json(); }).then(function (j) {
      data = j.map(function (r) { r._t = norm(r.n); r._h = norm(r.b + ' ' + r.n + ' ' + r.k); return r; }); return data;
    }).catch(function () { loading = null; return []; });
    return loading;
  }

  function search(q) {
    var words = norm(q).split(/[^a-z0-9$]+/).filter(Boolean).map(function (w) { return SYN[w] || (w.length > 3 ? w.replace(/s$/, '') : w); });
    if (!words.length) return [];
    var hits = [];
    data.forEach(function (r) {
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (r._h.indexOf(w) < 0) return;
        score += r._t.indexOf(w) >= 0 ? 3 : 1;
        if (new RegExp('(^|[^a-z])' + w).test(r._t)) score += 2;
      }
      if (r.s) score -= 10;
      hits.push([score, r]);
    });
    hits.sort(function (a, b) { return b[0] - a[0]; });
    return hits.map(function (h) { return h[1]; });
  }

  function render() {
    var q = input.value.trim();
    chips.style.display = q ? 'none' : '';
    if (!q) { grid.innerHTML = ''; note.textContent = ''; return; }
    if (!data) { note.textContent = 'Gathering the collection…'; return; }
    var res = search(q);
    if (!res.length) {
      grid.innerHTML = '';
      note.innerHTML = 'Nothing by that name yet. Try a maison, a scent or a room, or ask the <a href="#" class="eso-s-ask" style="color:#B6A274">Concierge</a>.';
      var a = note.querySelector('.eso-s-ask');
      a.onclick = function (e) { e.preventDefault(); close(); var c = document.querySelector('.esotico-concierge, [class*=concierge] button, [class*=concierge]'); if (c) c.click(); };
      return;
    }
    note.textContent = res.length + (res.length === 1 ? ' piece' : ' pieces');
    grid.innerHTML = res.slice(0, 24).map(function (r) {
      return '<a class="eso-s-card' + (r.s ? ' sold' : '') + '" href="' + esc(r.u) + '"><div class="eso-s-ph">' +
        (r.i ? '<img loading="lazy" alt="" src="' + esc(r.i) + '">' : '') + '</div>' +
        (r.b ? '<div class="eso-s-b">' + esc(r.b) + '</div>' : '<div class="eso-s-b">esotico</div>') +
        '<div class="eso-s-n">' + esc(r.n) + '</div><div class="eso-s-p">' + (r.s ? 'Sold out' : (r.f ? 'from ' : '') + money(r.p)) + '</div></a>';
    }).join('');
  }

  function build() {
    ov =document.createElement('div'); ov.className = 'eso-s'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Search the collection');
    ov.innerHTML = '<div class="eso-s-in"><div class="eso-s-top"><span class="eso-s-eyebrow">◐ Search the collection</span>' +
      '<button type="button" class="eso-s-x">Close</button></div>' +
      '<form class="eso-s-field" role="search">' + ICON + '<input class="eso-s-input" type="search" name="q" autocomplete="off" ' +
      'aria-label="Search esotico" placeholder="A candle, a maison, a scent…"></form>' +
      '<p class="eso-s-note" aria-live="polite"></p><div class="eso-s-chips">' +
      QUICK.map(function (c) { return '<a class="eso-s-chip" href="' + c[1] + '">' + c[0] + '</a>'; }).join('') +
      '</div><div class="eso-s-grid"></div></div>';
    document.body.appendChild(ov);
    input = ov.querySelector('.eso-s-input'); note = ov.querySelector('.eso-s-note'); grid = ov.querySelector('.eso-s-grid'); chips = ov.querySelector('.eso-s-chips');
    var t; input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(render, 90); });
    ov.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); var a = grid.querySelector('a'); if (a) location.href = a.href; });
    ov.querySelector('.eso-s-x').addEventListener('click', close);
    ov.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {   // keep focus inside the dialog
        var f = ov.querySelectorAll('button, input, a[href]'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function open() {
    if (!ov) build();
    lastFocus = document.activeElement;
    ov.classList.add('open'); document.documentElement.classList.add('eso-s-lock');
    setTimeout(function () { input.focus(); }, 30);
    load().then(render);
  }
  function close() {
    ov.classList.remove('open'); document.documentElement.classList.remove('eso-s-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function place() {
    /* every cart slot gets its own button: Squarespace keeps separate desktop and mobile copies of the cart (wrapped in
       showOnDesktop / showOnMobile), and only one of them is visible at a size */
    document.querySelectorAll('.header-actions-action--cart').forEach(function (cart) {
      var prev = cart.previousElementSibling;
      if (prev && prev.classList.contains('eso-s-btn')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'eso-s-btn header-nav-item'; b.setAttribute('aria-label', 'Search'); b.innerHTML = ICON;
      b.addEventListener('click', open);
      cart.parentNode.insertBefore(b, cart);
    });
  }
  /* the header's link colour lives on the cart's own <a> (ivory on the ink header, ink on light pages and once the
     header turns solid on scroll), so the magnifier copies it rather than inheriting the wrapper's black */
  function tint() {
    document.querySelectorAll('.eso-s-btn').forEach(function (b) {
      var a = b.nextElementSibling && b.nextElementSibling.querySelector('a');
      if (a) b.style.color = getComputedStyle(a).color;
    });
  }
  function start() {
    var st = document.createElement('style'); st.id = 'eso-s-css'; st.textContent = CSS; document.head.appendChild(st);
    place(); tint();
    var t2; window.addEventListener('scroll', function () { clearTimeout(t2); t2 = setTimeout(tint, 60); }, { passive: true });
    setInterval(tint, 1500);
    new MutationObserver(function () { place(); tint(); }).observe(document.body, { childList: true, subtree: true });
    if (/[?&]search=1/.test(location.search)) open();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
