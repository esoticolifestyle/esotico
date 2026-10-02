"""Pinterest catalog feed for esotico.ca, rebuilt from the live shop.

One row per variant (Pinterest groups them by item_group_id). Price and stock come from the shop's own public data at
the moment the script runs, so a daily run keeps Pinterest's prices and availability true. Output: site-src/pinterest-feed.tsv,
served by GitHub Pages at https://esoticolifestyle.github.io/esotico/site-src/pinterest-feed.tsv
Columns follow Pinterest's catalog spec (the same names as Google's product feed)."""
import csv, html, json, os, re, sys, time, urllib.request

SHOP = 'https://www.esotico.ca'
UA = {'User-Agent': 'esotico-feed/1.0 (+https://www.esotico.ca)'}
MAISONS = ['Baobab Collection', 'Ethnicraft', 'Evelyne Prélonge', 'Hypsoé', 'Apotheca']
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site-src', 'pinterest-feed.tsv')


def get(url):
    for attempt in range(4):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())
        except Exception:
            time.sleep(5 * (attempt + 1))
    raise SystemExit('could not read ' + url)


def text(s, n):
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))
    s = re.sub(r'\s+', ' ', s).strip()
    return s[:n].rsplit(' ', 1)[0] if len(s) > n else s


HG = 'Home & Garden > '
# first matching rule wins: (words in the product title, Google product category)
GPC = [
    (('snuffer', 'trimmer', 'matches'), HG + 'Decor > Home Fragrance Accessories'),
    (('candlestick', 'candle holder'), HG + 'Decor > Candle Holders'),
    (('diffuser', 'refill', 'sticks'), HG + 'Decor > Home Fragrances'),
    (('candle',), HG + 'Decor > Home Fragrances > Candles'),
    (('hand soap', 'liquid soap'), 'Health & Beauty > Personal Care > Cosmetics > Bath & Body > Liquid Hand Soap'),
    (('soap',), 'Health & Beauty > Personal Care > Cosmetics > Bath & Body > Bar Soap'),
    (('tray table', 'side table', 'coffee table', 'nesting'), 'Furniture > Tables > Accent Tables'),
    (('tray',), HG + 'Decor > Decorative Trays'),
    (('mirror',), HG + 'Decor > Mirrors'),
    (('cushion',), HG + 'Decor > Throw Pillows'),
    (('throw', 'plaid'), HG + 'Linens & Bedding > Bedding > Blankets'),
    (('rug', 'kilim'), HG + 'Decor > Rugs'),
    (('tissue box',), HG + 'Bathroom Accessories > Facial Tissue Holders'),
    (('scarf', 'collar', 'stole'), 'Apparel & Accessories > Clothing Accessories > Scarves & Shawls'),
    (('glove', 'mitten', 'wristband'), 'Apparel & Accessories > Clothing Accessories > Gloves & Mittens'),
    (('key chain', 'keychain', 'pompom'), 'Apparel & Accessories > Clothing Accessories > Keychains'),
    (('bag', 'pouch'), 'Apparel & Accessories > Handbags, Wallets & Cases > Handbags'),
    (('dog',), 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Apparel'),
    (('desk', 'organizer', 'organiser'), 'Office Supplies > Office Organization > Desk Organizers'),
]


def gpc(title):
    t = title.lower()
    return next((c for words, c in GPC if any(w in t for w in words)), HG + 'Decor')


def main():
    items, off = [], None
    while True:
        j = get(SHOP + '/shop?format=json' + (f'&offset={off}' if off else ''))
        items += j.get('items', [])
        pg = j.get('pagination') or {}
        if not pg.get('nextPage'):
            break
        off = pg['nextPageOffset']
    rows = []
    for it in items:
        title = it['title']
        if 'gift card' in title.lower() or it.get('productType') in (3, 'GIFT_CARD'):
            continue    # a gift card is not a product Pinterest shopping can show
        brand = next((m for m in MAISONS if title.startswith(m + ' – ')), 'esotico')
        name = title[len(brand) + 3:] if brand != 'esotico' else title
        desc = text((it.get('seoData') or {}).get('seoDescription') or it.get('excerpt') or it.get('body'), 500)
        images = [i.get('assetUrl') for i in (it.get('items') or []) if i.get('assetUrl')]
        if not images:
            continue
        link = SHOP + it['fullUrl']
        variants = it.get('variants') or []
        for v in variants:
            opts = ', '.join(o['value'] for o in v.get('optionValues') or [])
            stock = v.get('unlimited') or (v.get('qtyInStock') or 0) > 0
            price = v.get('priceMoney') or {}
            sale = v.get('salePriceMoney') or {}
            row = {
                'id': v.get('sku') or v['id'],
                'item_group_id': it['id'],
                'title': (f'{brand} {name}' + (f', {opts}' if opts and len(variants) > 1 else ''))[:150],
                'description': desc or name,
                'link': link,
                'image_link': images[0] + '?format=1500w',
                'additional_image_link': ','.join(u + '?format=1500w' for u in images[1:6]),
                'price': f"{price.get('value', '0')} {price.get('currency', 'CAD')}",
                'sale_price': f"{sale.get('value')} {sale.get('currency', 'CAD')}" if v.get('onSale') and sale.get('value') not in (None, '0.00') else '',
                'availability': 'in stock' if stock else 'out of stock',
                'condition': 'new',
                'brand': brand,
                'product_type': 'Home > ' + ('Home Fragrance' if brand in ('Baobab Collection', 'Hypsoé', 'Apotheca') else 'Home Décor'),
                'google_product_category': gpc(name),
            }
            rows.append(row)
    cols = ['id', 'item_group_id', 'title', 'description', 'link', 'image_link', 'additional_image_link', 'price', 'sale_price',
            'availability', 'condition', 'brand', 'product_type', 'google_product_category']
    with open(OUT, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=cols, delimiter='\t', quoting=csv.QUOTE_MINIMAL, lineterminator='\n')
        w.writeheader()
        for r in rows:
            w.writerow({k: str(r[k]).replace('\t', ' ').replace('\n', ' ') for k in cols})
    print(f'{len(items)} products, {len(rows)} variants, in stock {sum(r["availability"] == "in stock" for r in rows)}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
