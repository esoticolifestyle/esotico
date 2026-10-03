/* esotico Styling: the "Style my space" block for esotico.ca.
   Placed on a Squarespace page with a Code Block:
     <div id="esotico-styling"></div>
     <script src="https://esoticolifestyle.github.io/esotico/styling/style.js" defer></script>
   The shopper's photo is shrunk in the browser (1024 px JPEG), sent once to the esotico-styling Worker with the ids of
   the pieces in stock right now (read from this site's own /shop?format=json), and the three suggestions come back as
   cards linking to the product pages. Nothing is stored. */
(function () {
  var WORKER = 'https://esotico-styling.blue-lab-ffe8.workers.dev/style';
  var root = document.getElementById('esotico-styling');
  if (!root) {
    // On /style-my-space the block makes its own place: a new page section after the page's first one.
    var first = document.querySelector('#sections > .page-section, article .page-section');
    if (!first) return;
    var sec = document.createElement('section');
    sec.className = 'esotico-styling-section';
    sec.style.cssText = 'padding:24px 16px 80px';
    root = document.createElement('div');
    root.id = 'esotico-styling';
    sec.appendChild(root);
    first.parentNode.insertBefore(sec, first.nextSibling);
  }
  if (root.dataset.ready) return;
  root.dataset.ready = '1';

  var css = '' +
    '#esotico-styling{--ink:#101820;--gilt:#84754E;--ivory:#F4EFE7;--line:#d9cfbd;max-width:960px;margin:0 auto;color:var(--ink)}' +
    '#esotico-styling .es-card{background:var(--ink);color:var(--ivory);padding:44px 28px;text-align:center}' +
    '#esotico-styling .es-eyebrow{font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#B6A274;margin:0 0 14px}' +
    '#esotico-styling .es-lede{max-width:52ch;margin:0 auto 26px;line-height:1.7;color:#EAE3D7}' +
    '#esotico-styling form{display:grid;gap:14px;max-width:460px;margin:0 auto}' +
    '#esotico-styling .es-drop{display:block;border:1px dashed #B6A274;padding:26px 16px;cursor:pointer;color:var(--ivory)}' +
    '#esotico-styling .es-drop:focus-within{outline:2px solid #B6A274;outline-offset:3px}' +
    '#esotico-styling .es-drop input{position:absolute;opacity:0;width:1px;height:1px}' +
    '#esotico-styling .es-preview{display:block;max-width:100%;max-height:260px;margin:0 auto 10px;object-fit:contain}' +
    '#esotico-styling .es-ask{width:100%;box-sizing:border-box;background:transparent;border:0;border-bottom:1px solid #B6A274;color:var(--ivory);padding:10px 2px;font:inherit}' +
    '#esotico-styling .es-ask::placeholder{color:#A8A396}' +
    '#esotico-styling .es-go{background:#B6A274;color:var(--ink);border:0;padding:15px 22px;font:inherit;font-size:12px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;cursor:pointer}' +
    '#esotico-styling .es-go[disabled]{opacity:.55;cursor:wait}' +
    '#esotico-styling .es-fine{font-size:12px;color:#A8A396;margin:4px 0 0;line-height:1.6}' +
    '#esotico-styling .es-status{min-height:1.6em;margin:22px 0 0;color:var(--ink);text-align:center}' +
    '#esotico-styling .es-room{text-align:center;font-style:italic;margin:26px auto 8px;max-width:60ch}' +
    '#esotico-styling .es-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-top:18px}' +
    '#esotico-styling .es-pick{display:flex;flex-direction:column;gap:8px;text-decoration:none;color:var(--ink)}' +
    '#esotico-styling .es-pick img{width:100%;aspect-ratio:1/1;object-fit:cover;background:#efe9df}' +
    '#esotico-styling .es-maison{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--gilt)}' +
    '#esotico-styling .es-name{font-size:15px;font-weight:600;line-height:1.35}' +
    '#esotico-styling .es-why{font-size:14px;line-height:1.6}' +
    '#esotico-styling .es-price{font-size:14px}' +
    '#esotico-styling .es-more{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--gilt);text-decoration:underline;text-underline-offset:4px}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  root.innerHTML =
    '<div class="es-card">' +
      '<p class="es-eyebrow">esotico Styling</p>' +
      '<form novalidate>' +
        '<p class="es-lede">A coffee table, a console, a sofa, a bedside or a bathroom counter: ' +
        'photograph the spot you want to dress, in daylight if you can.</p>' +
        '<label class="es-drop" for="es-photo"><img class="es-preview" alt="" hidden>' +
          '<span class="es-drop-text">Choose a photo of your space</span>' +
          '<input id="es-photo" type="file" accept="image/*"></label>' +
        '<label for="es-ask" class="es-fine" style="text-align:left">What is the space for? (optional)</label>' +
        '<input id="es-ask" class="es-ask" type="text" maxlength="160" placeholder="A gift for my sister, an entry table, our guest room">' +
        '<button class="es-go" type="submit">Suggest three pieces</button>' +
        '<p class="es-fine">The suggestions are made by AI from what it sees in your photo. We use your photo only to make them and do not keep it.</p>' +
      '</form>' +
    '</div>' +
    '<p class="es-status" role="status" aria-live="polite"></p>' +
    '<div class="es-results"></div>';

  var form = root.querySelector('form');
  var fileInput = root.querySelector('#es-photo');
  var preview = root.querySelector('.es-preview');
  var dropText = root.querySelector('.es-drop-text');
  var askInput = root.querySelector('#es-ask');
  var button = root.querySelector('.es-go');
  var status = root.querySelector('.es-status');
  var results = root.querySelector('.es-results');

  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) return;
    preview.src = URL.createObjectURL(f);
    preview.hidden = false;
    dropText.textContent = 'Choose a different photo';
  });

  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, 1024 / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { reject(new Error('photo')); };
      img.src = URL.createObjectURL(file);
    });
  }

  function catalogue() {
    return fetch('/shop?format=json', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (d) {
      var byId = {};
      (d.items || []).forEach(function (it) {
        var vs = it.variants || [];
        var stocked = vs.filter(function (v) { return v.unlimited || v.qtyInStock > 0; });
        if (!stocked.length) return;
        var prices = stocked.map(function (v) { return Number((v.onSale ? v.salePriceMoney : v.priceMoney).value); });
        var min = Math.min.apply(null, prices), max = Math.max.apply(null, prices);
        var parts = String(it.title).split(/\s+[–-]\s+/);
        byId[it.id] = {
          maison: parts.length > 1 ? parts[0] : '',
          name: parts.length > 1 ? parts.slice(1).join(' – ') : it.title,
          price: (min < max ? 'from ' : '') + '$' + min.toFixed(2),
          url: it.fullUrl,
          // The item's own assetUrl is a folder address; its first gallery image is the product photo.
          img: (it.items && it.items[0] && it.items[0].assetUrl) ? it.items[0].assetUrl + '?format=500w' : ''
        };
      });
      return byId;
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = fileInput.files && fileInput.files[0];
    if (!f) { status.textContent = 'Choose a photo of your space first.'; return; }
    button.disabled = true;
    results.innerHTML = '';
    status.textContent = 'Looking at your space. This takes a few seconds.';
    var shop;
    Promise.all([shrink(f), catalogue()]).then(function (r) {
      shop = r[1];
      return fetch(WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: r[0], ids: Object.keys(shop), ask: askInput.value.trim() })
      });
    }).then(function (res) {
      return res.json().then(function (j) { return { ok: res.ok, status: res.status, body: j }; });
    }).then(function (r) {
      if (!r.ok) {
        status.textContent = r.status === 413 ? 'That photo is too large. Try a smaller one.'
          : 'Styling is resting for now. Write to hello@esotico.ca with your photo and we will reply with three pieces.';
        return;
      }
      var picks = (r.body.picks || []).filter(function (p) { return shop[p.id]; });
      if (!picks.length) {
        status.textContent = 'We could not see a room in that photo. Try one of a table, a sofa or a shelf in good light.';
        return;
      }
      status.textContent = '';
      if (r.body.room) results.appendChild(el('p', 'es-room', r.body.room));
      var grid = el('div', 'es-grid');
      picks.forEach(function (p) {
        var s = shop[p.id];
        var a = el('a', 'es-pick');
        a.href = s.url;
        if (s.img) { var im = el('img'); im.src = s.img; im.alt = s.name; im.loading = 'lazy'; a.appendChild(im); }
        if (s.maison) a.appendChild(el('span', 'es-maison', s.maison));
        a.appendChild(el('span', 'es-name', s.name));
        var why = String(p.why || '').trim();
        if (why && !/[.!?]$/.test(why)) why += '.';
        a.appendChild(el('span', 'es-why', why));
        a.appendChild(el('span', 'es-price', s.price));
        a.appendChild(el('span', 'es-more', 'View the piece'));
        grid.appendChild(a);
      });
      results.appendChild(grid);
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function () {
      status.textContent = 'Something interrupted the request. Check your connection and try again.';
    }).then(function () { button.disabled = false; });
  });
})();
