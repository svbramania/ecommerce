# Musical Instruments — Sourcing Documentation

Category: **Musical Instruments** (Saleor category ID `Q2F0ZWdvcnk6MjU=`). 12 products created.

## Trend research (why these products)

- [Amazon Best Sellers: Best Musical Instrument Accessories](https://www.amazon.com/Best-Sellers-Musical-Instrument-Accessories/zgbs/musical-instruments/11965871) and [Amazon Best Sellers: Best General Musical Instrument Accessories](https://www.amazon.com/Best-Sellers-General-Musical-Instrument-Accessories/zgbs/musical-instruments/11965881) — guitar stands/straps, tuners, capos, and mic accessories dominate accessory sales.
- [Best Selling Guitar Accessories: Top 10 Ranked by Real Sales 2026 — Asinsight](https://www.asinsight.com/report/US/guitar-accessories) and [Best Selling Capo For Acoustic Guitar: Top 10 Ranked by Real Sales 2026 — Asinsight](https://www.asinsight.com/report/US/capo-for-acoustic-guitar) — trigger-style capos and pick variety packs are consistent top sellers.
- [10 Best Musical Instruments for Adult Beginners | 2026 Guide — Wiingy](https://wiingy.com/blog/easiest-instruments-to-learn-for-adults/) and [Best ukuleles 2026 — Guitar World](https://www.guitarworld.com/features/best-ukuleles) — ukulele and harmonica repeatedly cited as the fastest instruments for a true beginner to play a full song on.
- Kalimba/thumb piano and hand percussion (tambourine, egg shakers) were included based on widely reported TikTok-driven growth in small portable instrument sales cited across the above sources.

Products were chosen to favor small, easily-shippable instruments and accessories (per assignment scope) rather than large instruments needing freight shipping: ukulele, harmonica, hand percussion, guitar accessories (capo/picks/strap/tuner), keyboard/piano accessory, and microphone accessories.

## Products

| Product | SKU | Price | Image source (supplier marketplace) |
|---|---|---|---|
| Soprano Ukulele Starter Kit | MUSIC-UKULELE-01 | $34.99 | Made-in-China.com search results — "Soprano 21 Inch China Factory Hot Selling Ukulele", Nantong Emuse Musical Instrument Co. (wholesale US$14.60–14.90/pc, MOQ 10) |
| 10-Hole Diatonic Harmonica (Key of C) | MUSIC-HARMONICA-01 | $12.99 | Made-in-China.com search results — "Custom Metal Musical Instrument Mouth Organ 10 Holes Harmonica for Beginners" |
| Trigger-Style Guitar Capo | MUSIC-CAPO-01 | $9.99 | Made-in-China.com search results — "General Quick Change Tune Clamp Key Trigger Capo Acoustic Electric Guitar" |
| Celluloid Guitar Picks Variety Pack (24-Pack) | MUSIC-PICKS-01 | $7.99 | Made-in-China.com search results — "No Logo Printing Pearl Light Blue Color Celluloid Guitar Pick Plectrum Mediator Reed 0.71mm" (generic/unbranded listing) |
| Adjustable Padded Guitar Strap | MUSIC-STRAP-01 | $14.99 | Made-in-China.com search results — "Adjustable Polyester Guitar Strap Customizable with Logo for Guitars, Ukuleles" |
| 17-Key Kalimba Thumb Piano | MUSIC-KALIMBA-01 | $24.99 | Made-in-China.com search results — "Wholesale Price Portable Solid Koa 17 Key Kalimba Finger Thumb Piano for Sale" |
| 10-Inch Hand Tambourine | MUSIC-TAMBOURINE-01 | $11.99 | Made-in-China.com search results — "Hand Percussion Musical Instrument Colour Plastic Tambourine" |
| Wooden Egg Shaker Set (12-Piece) | MUSIC-SHAKER-01 | $13.99 | Made-in-China.com search results — "Hard Wood Egg Shaker for Kids Class Teaching Musical Instruments" |
| Clip-On Chromatic Digital Tuner | MUSIC-TUNER-01 | $10.99 | Made-in-China.com search results — "Tyq-L01 High Quality Digital Bass Tuner Clip-on Guitar Tuner for Stringed Instrument" |
| Studio Microphone Pop Filter | MUSIC-POPFILTER-01 | $8.99 | Made-in-China.com search results — "Wholesaler High Quality Professional Studio Microphone Pop Filter for Mic" |
| Adjustable Microphone Stand Tripod | MUSIC-MICSTAND-01 | $16.99 | Made-in-China.com search results — "Professional Audio Tripod Adjustable Aluminum Speaker Microphone Stand" |
| Digital Piano Sustain Pedal | MUSIC-PEDAL-01 | $12.99 | Made-in-China.com search results — "Sp-H5 Factory Piano Accessories High Quality Digital Organ Piano Sustain Pedal" |

All 12 images were captured from Made-in-China.com **search/listing result pages** (never an individual supplier detail page), saved to `/tmp/product-images-music/`, and re-encoded as standard JPEG before upload. Alibaba.com was attempted first (`alibaba.com/trade/search?SearchText=soprano+ukulele`) but presented a slider CAPTCHA immediately; per policy we did not attempt to solve it and fell back to Made-in-China.com for all 12 sourcing lookups, so there are no image-sourcing gaps. Only generic/unbranded listings were selected (no Fender/Gibson/Yamaha or other brand logos visible in any chosen image).

All product descriptions above are original writing, not copied from any supplier or competitor listing, and no trademarked instrument-brand names are used anywhere in names, slugs, or descriptions.

## Saleor setup applied to every product

1. `productCreate` (name, slug, EditorJS description, category `Q2F0ZWdvcnk6MjU=`, product type `UHJvZHVjdFR5cGU6MQ==`)
2. `productVariantCreate` (SKU `MUSIC-<SHORTNAME>-01`, `attributes: []`, `trackInventory: true`)
3. `productChannelListingUpdate` on `default-channel` with `isPublished`, `visibleInListings`, `isAvailableForPurchase` all `true` and `availableForPurchaseAt: 2026-01-01T00:00:00Z`
4. `productVariantChannelListingUpdate` (retail USD price)
5. `productVariantStocksCreate` (40 units at the default warehouse)
6. `productMediaCreate` (multipart image upload from `/tmp/product-images-music/`)

Verified via anonymous (unauthenticated) query against `{ category(id: "Q2F0ZWdvcnk6MjU=") { products(first:20, channel: "default-channel") { totalCount } } }` → **`totalCount: 12`**.

`python3 manage.py update_search_indexes` was run after creation and completed successfully (products, orders, users indexes updated).
