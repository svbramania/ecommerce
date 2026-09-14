# Video Games — Sourcing Documentation

Category: **Video Games** (Saleor category ID `Q2F0ZWdvcnk6MzE=`). 12 products created (accessories only — no game titles or console/controller devices, since those are licensed IP from Nintendo/Sony/Microsoft/publishers).

## Trend research (why these products)

- [Gaming Accessories Market Tops $13.2B as Console Gear Powers the Competitive Play Economy — Console Creatures](https://www.consolecreatures.com/gaming-accessories-market-tops-13-2b-as-console-gear-powers-the-competitive-play-economy/) — charging docks, carrying cases, controller grips/skins, and cable/storage accessories called out as steady-growth categories; "comfort and ergonomic aids" (grips) and "power and charging solutions" (docks, battery packs) named as key segments.
- [Accessory market for Nintendo Switch 2 stabilises with focus on storage, controllers, and ergonomic design in 2026 — Quest Review Center](https://questreviewcenter.com/tech-accessories/accessory-market-for-nintendo-switch-2-stabilises-with-focus-on-storage-controllers-and-ergonomic-design-in-2026/) — portable protective cases, screen protectors, and ergonomic grips highlighted as the leading handheld-console accessory categories.
- [Console Game Peripherals Market: Trends, Competitor Dynamics, and Opportunities 2026-2035 — Business Research Insights](https://www.businessresearchinsights.com/market-reports/console-game-peripherals-market-103702) and [Game Console Peripherals and Accessories Market Outlook 2026-2032 — Stats Market Research](https://www.statsmarketresearch.com/game-console-peripherals-accessories-market-8067858) — cite input-enhancement accessories (trigger stops, thumbstick caps), storage/cable management, and cleaning kits as consistently trending sub-categories across console generations.

Only generic, unbranded accessories were sourced (grips, cases, docks, cables, storage, cleaning, screen protection). No real game titles, no console or controller devices, and no PlayStation/Xbox/Nintendo logos or trademarked shapes appear in any product name, description, or image.

## Products

| Product | SKU | Price | Image source (supplier marketplace) |
|---|---|---|---|
| Camo Silicone Controller Grip Sleeve | GAME-GRIPSLV-01 | $7.99 | Made-in-China.com search results — "Wholesale Camouflage Camo Silicone Gel Guards Soft Sleeve Skin Grip Cover Case", Guangzhou Sundi Electronics Co., Ltd. (FOB US$0.98/pc, MOQ 100) |
| Hard Shell Controller Carrying Case | GAME-HARDCASE-01 | $14.99 | Made-in-China.com search results — generic EVA hard-shell zippered storage case listing (image.made-in-china.com/3f2j00tlLBkNuhgcqQ) |
| Interchangeable Thumbstick Cap Set | GAME-THUMBCAP-01 | $8.99 | Made-in-China.com search results — "Wholesale Cheap Black Multi-Color 3D Analog Joystick Rocker Cap Thumb Stick Grips Cover" |
| Dual Controller Charging Dock | GAME-CHGDOCK-01 | $19.99 | Made-in-China.com search results — "Ipega Pg-P5003 Charging Stand ... Fast Charging Base" listing, shown as an empty dual-bay dock with no controller/logo visible (image.made-in-china.com/2f1j00VSWlOFotMkce) |
| Gaming Headset Stand | GAME-HSTAND-01 | $16.99 | Made-in-China.com search results — "Acrylic Headphone Stand Clear Gaming Headset Holder for Desk" |
| Console & Controller Cleaning Kit | GAME-CLEANKIT-01 | $9.99 | Made-in-China.com search results — "4 In1 Multifunction Smartphone Laptop Computer Keyboard Cleaner ... Spray Mist Brush Tool Kit Set" |
| Braided USB-C Charging Cable 2-Pack | GAME-USBC2PK-01 | $10.99 | Made-in-China.com search results — "High Quality Nylon Braided Type C USB Charging ... Fast Charger USB-C Cable" |
| Game Disc Storage Case (24-Disc Capacity) | GAME-DISCCASE-01 | $12.99 | Made-in-China.com search results — "Custom Neoprene Shockproof DVD Bags CD Album Disc Storage Case" |
| Trigger Stop Button Cap Set | GAME-TRIGCAP-01 | $7.49 | Made-in-China.com search results — "OEM Small Button Cover Custom Waterproof Silicone Rubber Buttons Caps" |
| Handheld Console Screen Protector 2-Pack | GAME-SCRNPROT-01 | $8.49 | Made-in-China.com search results — "Startrc 2-Pack Tempered Glass Screen Protector ... with Alignment Frame" (generic glass film, no console branding visible in image) |
| Gaming Cable Management Clip Organizer | GAME-CABLECLIP-01 | $6.99 | Made-in-China.com search results — "Cable Holder Clips Adhesive Desk Cable Organizer Silicone Wire Holder" |
| Anti-Slip Grip Tape Roll Set | GAME-GRIPTAPE-01 | $8.99 | Made-in-China.com search results — "Luminous Anti-Slip Tape Non-Skid Tape Adhesive Stickers High Grip", supplier JERRYTAPE |

All 12 images were captured from Made-in-China.com **search/listing result pages** (never a supplier's individual product detail page). Alibaba.com search pages were tried first but several relevant categories returned CAPTCHA-gated results; per policy we did not attempt to solve any CAPTCHA and fell back to Made-in-China.com for every sourcing lookup, so there are no unresolved image-sourcing gaps.

### Image quality-control pass

A prior attempt in this session had left 6 of the 12 saved images mismatched with their product name or showing console branding. Before creating any products, each of the 12 images was visually re-inspected and the following were re-sourced and replaced:

- **Dual Controller Charging Dock** — original image clearly showed PlayStation DualSense-shaped controllers docked; replaced with an empty, unbranded dual-bay charging stand.
- **Handheld Console Screen Protector 2-Pack** — original image was a mobile camera lens protector (wrong product entirely); replaced with an actual rectangular tempered-glass screen film.
- **Hard Shell Controller Carrying Case** — original image showed a headphone/earbud storage case, not a controller case; replaced with a generic hard-shell zippered case.
- **Gaming Cable Management Clip Organizer** — original image showed raw electrical wire, not clips; replaced with an actual cable-clip product photo.
- **Console & Controller Cleaning Kit** — original image resembled a cosmetics/skincare display, not a cleaning kit; replaced with a multi-tool electronics cleaning kit photo.
- **Camo Silicone Controller Grip Sleeve** — original image was a red silicone cover shaped exactly like a PlayStation DualSense controller (too close to a branded silhouette); replaced with a generic multi-color camo silicone skin image with no console-specific outline.

All product descriptions are original writing, not copied from any supplier or competitor listing. No trademarked console, controller, or game-title names appear anywhere in names, slugs, descriptions, or the final images.

## Saleor setup applied to every product

1. `productCreate` (name, slug, EditorJS description, category `Q2F0ZWdvcnk6MzE=`, product type `UHJvZHVjdFR5cGU6MQ==`)
2. `productVariantCreate` (SKU `GAME-<SHORTNAME>-01`, `attributes: []`, `trackInventory: true`)
3. `productChannelListingUpdate` on `default-channel` with `isPublished`, `visibleInListings`, `isAvailableForPurchase` all `true` and `availableForPurchaseAt: 2026-01-01T00:00:00Z`
4. `productVariantChannelListingUpdate` (retail USD price)
5. `productVariantStocksCreate` (40 units at the default warehouse)
6. `productMediaCreate` (multipart image upload)

**Verification:** an anonymous (no auth token) query against `{ category(id: "Q2F0ZWdvcnk6MzE=") { products(first:20, channel: "default-channel") { totalCount } } }` returned `totalCount: 12`, and all 12 products report media attached and correct channel pricing, confirming they are live on the storefront.

`python3 manage.py update_search_indexes` was run successfully after creation (products, orders, and users indexes updated).
