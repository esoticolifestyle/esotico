/* esotico Styling: the home-page band that introduces Style my space (3 Oct 2026; the owner found the one-line link
   "very hard to find and see"). Inserted after the home page's second section ("Our promise") by the header block
   esotico-styling-loader, in the night-salon look of the hero: ink ground, an arched room photograph in a gilt frame,
   capitals with one gilt Bodoni italic word, a gilt outline button. Squarespace refuses new sections built on the client
   (build/policy_pages.js), so the band lives here instead. */
(function band() {
  // The loader adds this script from the page head, so it can arrive before the page body exists.
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', band); return; }
  if (document.querySelector('.esotico-style-band')) return;
  // The home page keeps its sections in a region inside article#page-regions; the footer has page sections too.
  var sections = [].filter.call(document.querySelectorAll('main section.page-section'), function (s) {
    return !s.closest('footer');
  });
  if (sections.length < 2) return;

  var css = '' +
    '.esotico-style-band{background:#101820;color:#F4EFE7;padding:72px 16px}' +
    '.esotico-style-band .esb-in{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr;gap:40px;align-items:center}' +
    '@media (min-width:800px){.esotico-style-band .esb-in{grid-template-columns:5fr 6fr;gap:72px}}' +
    '.esotico-style-band .esb-photo{position:relative;max-width:420px;width:100%;margin:0 auto}' +
    '.esotico-style-band .esb-photo img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:999px 999px 0 0}' +
    '.esotico-style-band .esb-photo::after{content:"";position:absolute;inset:-10px;border:1px solid #84754E;border-bottom:0;border-radius:999px 999px 0 0;pointer-events:none}' +
    '.esotico-style-band .esb-eyebrow{margin:0 0 18px;font-family:"Josefin Sans",Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.32em;text-transform:uppercase;color:#B6A274}' +
    '.esotico-style-band h2{margin:0 0 22px;font-family:"Josefin Sans",Helvetica,Arial,sans-serif;font-weight:300;font-size:clamp(30px,4.4vw,52px);letter-spacing:.14em;line-height:1.2;text-transform:uppercase;color:#F4EFE7}' +
    '.esotico-style-band h2 em{font-family:"Bodoni Moda","Bodoni 72",Didot,Georgia,serif;font-style:italic;font-weight:400;letter-spacing:0;text-transform:none;color:#B6A274;font-size:1.2em}' +
    '.esotico-style-band .esb-text{margin:0 0 30px;max-width:46ch;font-family:"Josefin Sans",Helvetica,Arial,sans-serif;font-size:17px;line-height:1.75;font-weight:300;color:#EAE3D7}' +
    '.esotico-style-band .esb-btn{display:inline-block;border:1px solid #B6A274;color:#F4EFE7;text-decoration:none;padding:16px 34px;font-family:"Josefin Sans",Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.3em;text-transform:uppercase;transition:background-color .25s ease,color .25s ease}' +
    '.esotico-style-band .esb-btn:hover{background:#B6A274;color:#101820}' +
    '.esotico-style-band .esb-btn:focus-visible{outline:2px solid #B6A274;outline-offset:3px}' +
    '@media (prefers-reduced-motion:reduce){.esotico-style-band .esb-btn{transition:none}}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var band = document.createElement('section');
  band.className = 'esotico-style-band';
  band.setAttribute('aria-label', 'Style my space');
  band.innerHTML =
    '<div class="esb-in">' +
      '<div class="esb-photo"><img alt="A leather sofa dressed with woven Ethnicraft cushions" loading="lazy" ' +
        'src="https://images.squarespace-cdn.com/content/v1/6abad52803349b0b45a823de/1790644838828-NI5Q43OGMW8PL2SCP8XX/21037NeroChevroncushion_21039NeroChevroncushion_21044SilverNomadcushion_20083N7001sofa2seaterbeige_54b62b40-f070-4589-b91d-3afbe6fa699f.jpg?format=1000w"></div>' +
      '<div class="esb-copy">' +
        '<p class="esb-eyebrow">&#9680;&nbsp;&nbsp;New &middot; esotico Styling</p>' +
        '<h2>Style my <em>space</em></h2>' +
        '<p class="esb-text">Send us a photo of a coffee table, a sofa or a bedside. In seconds we suggest three pieces from our shelves that suit it, all in stock and ready to ship.</p>' +
        '<a class="esb-btn" href="/style-my-space">Try it with a photo</a>' +
      '</div>' +
    '</div>';
  sections[1].parentNode.insertBefore(band, sections[1].nextSibling);
})();
