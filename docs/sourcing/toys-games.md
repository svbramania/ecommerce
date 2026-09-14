# Toys & Games — Sourcing Documentation

Category: **Toys & Games** (Saleor category ID `Q2F0ZWdvcnk6MzA=`). 12 products created.

## Trend research (why these products)

- [Best STEM Toys for Kids in 2026 — Today.com](https://www.today.com/shop/best-stem-toys-for-kids-t196026) — STEM kits, screen-free coding/engineering toys.
- [Best Building Toys for 2026 — Fat Brain Toys](https://www.fatbraintoys.com/toys/collections/best_building_toys_for_2026/) and [Best Building Toys for Smart Play in 2026 — Wonder Kids Toy](https://wonderkidstoy.com/blogs/news/best-building-toys-for-smart-play-2026) — magnetic construction tiles, marble-run building systems leading 2026 sales.
- [Which Board Games are Trending in 2026? — Victory Conditions](https://victoryconditions.com/which-board-games-are-trending/) and [Board Game Top 10 Sellers: First Half of 2026 — Sentrybox](https://sentrybox.wordpress.com/2026/07/04/board-game-top-10-sellers-first-half-of-2026/) — strong demand for family strategy/logic games, party trivia and card games (generic, non-trademarked equivalents were sourced, since real bestsellers like Catan/Wingspan are trademarked franchises we cannot resell without a license).

Products were chosen from real, currently-trending toy categories (magnetic/wooden construction, STEM robotics, jigsaw puzzles, family board/card games, outdoor lawn games, sensory/fidget toys) while avoiding: choking-hazard items for very young children, and any trademarked character/franchise names.

## Products

| Product | SKU | Price | Image source (supplier marketplace) |
|---|---|---|---|
| Magnetic Building Tiles STEM Set (100-Piece) | TOYS-MAGTILES-01 | $39.99 | Made-in-China.com search results — "Magnetic Building Tiles for Kids: Creative Educational Playset", Quanzhou Lucky Star Light Ind. Co. (wholesale US$6.10–7.10/pc, MOQ 1,000) |
| Wooden Marble Run Building Set (150-Piece) | TOYS-MARBLERUN-01 | $44.99 | Made-in-China.com search results — "Kids Wooden Marble Run Race Marble Winding Track Toy Set", Ningbo Shone Med-Tech Co., Ltd. (wholesale US$7.60/pc, MOQ 200) |
| Scenic Landscape Jigsaw Puzzle (1000-Piece) | TOYS-PUZZLE1000-01 | $16.99 | Made-in-China.com search results — "Eco Friendly 1000 Piece Paper Jigsaw Puzzle", Ningbo Uwin Board Games Manufacturing Co., Ltd (wholesale US$1.40–2.30/set, MOQ 500) |
| STEM Solar & Motorized Robotics Building Kit (12-in-1) | TOYS-ROBOKIT-01 | $54.99 | Made-in-China.com search results — "Solar Building Robot Kit STEM Gift for Kids Aged 8-14, 12-in-1 DIY Science Educational Toys", Shenzhen KidsMind Manufacturing Technology Co., Ltd (wholesale US$1.00–100.00 tiered, MOQ 10) |
| Strategy Grid Logic Puzzle Board Game | TOYS-GRIDGAME-01 | $24.99 | Made-in-China.com search results — "Intellectual Brain Toy Wooden Desktop Strategy Chess Board Game", Ningbo Shone Med-Tech Co., Ltd. (wholesale US$3.90–5.40/pc, MOQ 120) |
| Family Party Trivia & Memory Card Game | TOYS-CARDGAME-01 | $14.99 | Made-in-China.com search results — "American Trivia Questions Cards/Learning Cards/Game Cards", Yiwu Kasino Playing Cards Co., Ltd. (wholesale US$0.75/pc, MOQ 10,000) |
| Outdoor Regulation Cornhole Bean Bag Toss Set | TOYS-CORNHOLE-01 | $69.99 | Made-in-China.com search results — "Large Wooden Cornhole Board Outdoor Bean Bag Toss Game Set", Tianchang Zhengmu Technology Co., Ltd. (wholesale US$52/pc, MOQ 500) |
| Giant Inflatable Yard Dice Lawn Game | TOYS-YARDDICE-01 | $29.99 | Made-in-China.com search results — "Giant Inflatable Dice Pool Toy for Lawn Game Outdoor Floor Games", Shanghai Bravo Industry & Trade Co., Ltd. (wholesale US$0.50/pc, MOQ 10,000) |
| Fidget Sensory Toy Variety Pack (24-Piece) | TOYS-FIDGETPACK-01 | $19.99 | Made-in-China.com search results — "Bulk Mini Stress Balls for Kids (25 Pack) 2-3 Inch Soft Squeezable Fidget Toy Balls", Qingdao Greatwon Industrial Co., Ltd. (wholesale US$0.40/pc) and "Fidget Toy Set, 35 PCS Sensory Toy", Shenzhen KidsMind Manufacturing Technology Co., Ltd. |
| 3D Wooden DIY Miniature Model Puzzle Kit | TOYS-WOODMODEL-01 | $34.99 | Made-in-China.com search results — "Utterfly Secret Realm DIY Book Nook Kit 3D Wooden Puzzle LED Lighted Assembly Model Desktop Bookshelf Decor", H&H Industrial Holding Limited (wholesale US$0.30–8.00/pc, MOQ 100) |
| Foldable 3-in-1 Wooden Chess, Checkers & Backgammon Set | TOYS-CHESSSET-01 | $32.99 | Made-in-China.com search results — "High Quality Chess 3 in 1 Foldable Wooden Checker Backgammon Chess Game Set", Shenzhen Lionstar Technology Co., Ltd. (wholesale US$13.50/pc, MOQ 500) |
| Kinetic Play Sand Set with Molds (2 lb) | TOYS-KINETICSAND-01 | $21.99 | Made-in-China.com search results — "Hot Sale DIY Play Kinetic Sand Colorful Educational Toys Slime Innovative Sand", Lingshou Chuangwei Mineral Products Processing Co. (wholesale US$0.70/kg, MOQ 50 kg) |

All 12 images were captured from Made-in-China.com **search/listing result pages** (never a supplier's individual product detail page), saved to `/tmp/product-images-toys/`, and re-encoded as standard JPEG before upload. Alibaba.com was attempted first but presented a slider CAPTCHA on the search page; per policy we did not attempt to solve it and fell back to Made-in-China.com for all 12 sourcing lookups, so there are no image-sourcing gaps.

All product descriptions above are original writing, not copied from any supplier or competitor listing, and no trademarked/franchise names are used anywhere in names, slugs, or descriptions (e.g., generic "Strategy Grid Logic Puzzle Board Game" and "3-in-1 Chess, Checkers & Backgammon Set" instead of any branded game names).

## Saleor setup applied to every product

1. `productCreate` (name, slug, EditorJS description, category `Q2F0ZWdvcnk6MzA=`, product type `UHJvZHVjdFR5cGU6MQ==`)
2. `productVariantCreate` (SKU `TOYS-<SHORTNAME>-01`, `trackInventory: true`)
3. `productChannelListingUpdate` on `default-channel` with `isPublished`, `visibleInListings`, `isAvailableForPurchase` all `true` and `availableForPurchaseAt: 2026-01-01T00:00:00Z`
4. `productVariantChannelListingUpdate` (retail USD price)
5. `productVariantStocksCreate` (40 units at the default warehouse)
6. `productMediaCreate` (multipart image upload)

**Verification:** an anonymous (no auth token) query against `{ category(id: "Q2F0ZWdvcnk6MzA=") { products(first:20, channel: "default-channel") { totalCount } } }` returned `totalCount: 12`, and all 12 products report `isAvailable: true`, confirming they are live on the storefront.
