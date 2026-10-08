"""Search index for the esotico.ca header search (site-src/search.js), rebuilt from the live shop.

One small record per product: name, maison, link, first photo, lowest price, sold out or not, and the words a shopper
might type (categories and tags, without the internal pair-* and price-band tags). Squarespace 7.1 has no header search
of its own and its search API returns no prices, so the overlay searches this file in the browser. Output:
site-src/search-index.json (~40 KB), refreshed every morning by the Pinterest feed workflow."""
import json, os, sys, time, urllib.request

SHOP = 'https://www.esotico.ca'
UA = {'User-Agent': 'esotico-feed/1.0 (+https://www.esotico.ca)'}
MAISONS = ['Baobab Collection', 'Ethnicraft', 'Evelyne Prélonge', 'Hypsoé', 'Apotheca']
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site-src', 'search-index.json')
SKIP = ('Brands', '$', 'pair-')


def get(url):
    for attempt in range(4):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())
        except Exception:
            time.sleep(5 * (attempt + 1))
    raise SystemExit('could not read ' + url)


def main():
    items, off, cats = [], None, {}

    def walk(nodes):    # category ids -> names ("Candles", "Floral", "Gifts"...), from the shop's own category tree
        for c in nodes or []:
            cats[c['id']] = c['displayName']
            walk(c.get('children'))
    while True:
        j = get(SHOP + '/shop?format=json' + (f'&offset={off}' if off else ''))
        walk((j.get('nestedCategories') or {}).get('categories'))
        items += j.get('items', [])
        pg = j.get('pagination') or {}
        if not pg.get('nextPage'):
            break
        off = pg['nextPageOffset']
    out = []
    for it in items:
        title = it['title']
        brand = next((m for m in MAISONS if title.startswith(m + ' – ')), '')
        name = title[len(brand) + 3:] if brand else title
        images = [i.get('assetUrl') for i in (it.get('items') or []) if i.get('assetUrl')]
        variants = it.get('variants') or []
        prices = [float((v.get('salePriceMoney') if v.get('onSale') else v.get('priceMoney') or {}).get('value') or 0) for v in variants]
        prices = [p for p in prices if p > 0]
        stock = any(v.get('unlimited') or (v.get('qtyInStock') or 0) > 0 for v in variants)
        names = [cats[c] for c in it.get('categoryIds') or [] if c in cats]
        words = [w for w in names + (it.get('tags') or []) if not w.startswith(SKIP)]
        out.append({
            'n': name, 'b': brand, 'u': it['fullUrl'],
            'i': (images[0] + '?format=300w') if images else '',
            'p': round(min(prices), 2) if prices else None, 'f': len(set(prices)) > 1,
            's': not stock, 'k': ' '.join(dict.fromkeys(words)),
        })
    out.sort(key=lambda r: (r['s'], r['b'] == '', r['b'], r['n']))
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{len(out)} products in the search index, {sum(not r["s"] for r in out)} in stock, {os.path.getsize(OUT)} bytes')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
