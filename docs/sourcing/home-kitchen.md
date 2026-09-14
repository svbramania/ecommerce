# Home & Kitchen — Sourcing Notes

Category: **Home & Kitchen** (Saleor `Q2F0ZWdvcnk6OQ==`)

At the start of this pass the category already held 5 products (LED Strip Lights, Wireless
Motion Sensor Light, Countertop Ice Maker, Silicone Air Fryer Liners, and a Smart Plug — the
last of these was not mentioned in the original task brief and appears to have been added by a
concurrent session). To reach the target of 12 total, **7** new products were added below
(not 8, since 5 already existed).

Note: `/tmp/product-images` is shared across concurrent sourcing sessions working other
categories in parallel. Before creating any product, the Home & Kitchen category was
re-queried live via GraphQL to confirm no name collisions, and 3 originally-planned items
(electric kettle, multi-cooker, weighted blanket) were swapped out for distinct alternatives
because another session's cached image files suggested it was already sourcing those same
items for this or an adjacent category.

## Products added

### 1. Robot Vacuum Cleaner (Wi-Fi App Control, Wet/Dry Mop)
- SKU: `HOMEKIT-ROBOVAC-01`
- Price: $249.99
- Research: Amazon's best-selling robot vacuums include eufy, Roborock, Shark, and iRobot
  wet/dry mop-combo models — [amzscout.net best-selling products roundup](https://amzscout.net/blog/best-selling-products-on-amazon/),
  [TechRadar — Amazon's best-selling robot vacuum](https://www.techradar.com/deals/amazons-best-selling-robot-vacuum-is-now-40-off-ahead-of-prime-day)
- Image/price source: Made-in-China.com search listing for "Robot Vacuum Cleaner" — "New Smart
  Robotic Vacuum Cleaner Best-Selling Robot Wet and Dry..." listed at US$101.00–101.60/unit
  (100-piece MOQ), supplier Huizhou Simba Technology Co.

### 2. Cordless Handheld Vacuum Cleaner
- SKU: `HOMEKIT-HANDVAC-01`
- Price: $59.99
- Research: Budget cordless handhelds (BLACK+DECKER, NEXPOW-style) dominate actual sales volume
  in the $20–50 wholesale-adjacent tier — [RTINGS best cordless vacuums](https://www.rtings.com/vacuum/reviews/best/cordless),
  [Consumer Reports best handheld vacuums](https://www.consumerreports.org/appliances/vacuum-cleaners/best-handheld-vacuums-of-the-year-a3334493968/)
- Image/price source: Made-in-China.com search listing for "Cordless Handheld Vacuum Cleaner" —
  "Cordless Intelligent Dust Sensor with Powerful Suction Handheld Stick Vacuum Cleaner",
  comparable listings on the same results page ranged US$4.80–33.00 depending on spec tier.

### 3. Vacuum Sealer Machine for Food Storage
- SKU: `HOMEKIT-VACSEAL-01`
- Price: $79.99
- Research: Vacuum sealers called out as a 2026 kitchen-gadget trend for extending food shelf
  life — [London Drugs — 6 best kitchen gadgets to save time in 2026](https://blog.londondrugs.com/best-kitchen-gadgets-2026)
- Image/price source: Made-in-China.com search listing for "Vacuum Sealer Machine" —
  "Commercial Suction Food Vacuum Sealer Vacuum Packing Machine with Roll Storage", US$80.00–100.00/unit
  (300-piece MOQ), supplier Guangzhou Argion Electric Appliance.

### 4. Bamboo Cutting Board Set (4-Piece, Juice Groove)
- SKU: `HOMEKIT-BAMBOO-01`
- Price: $39.99
- Research: Bamboo cutting board sets are consistently among Amazon's best-selling cutting
  boards — [Amazon Best Sellers: Cutting Boards](https://www.amazon.com/Best-Sellers-Cutting-Boards/zgbs/kitchen/289863),
  [asinsight — best-selling Totally Bamboo cutting board](https://www.asinsight.com/report/US/totally-bamboo-cutting-board)
- Image/price source: Made-in-China.com search listing for "Bamboo Cutting Board Set" —
  "Four Piece Bamboo Cutting Board Set Eco-Friendly Kitchen Food Prep", US$68.00/set (10-set MOQ),
  supplier Shuifu Huiyang Agricultural Tech.

### 5. Sous Vide Precision Cooker (Wi-Fi Immersion Circulator)
- SKU: `HOMEKIT-SOUSVIDE-01`
- Price: $129.99
- Research: Immersion-circulator sous vide cookers remain a recurring "best kitchen gadgets"
  pick for 2026 — [Food Network — 3 best sous vide cookers of 2026](https://www.foodnetwork.com/how-to/packages/shopping/product-reviews/best-sous-vide),
  [sousvideguy.com — best sous vide machines for 2026](https://sousvideguy.com/best-sous-vide-machines/)
- Image/price source: Made-in-China.com search listing for "Sous Vide Immersion Circulator Home" —
  "Kitchen Equipment Commercial Immersion Circulator Slow Sous Vide Cooker with WiFi Control",
  US$99.00–199.00/unit (500-piece MOQ), supplier Guangzhou Argion Electric Appliance.

### 6. Digital Kitchen Scale (Rechargeable, 11 lb Capacity)
- SKU: `HOMEKIT-KSCALE-01`
- Price: $16.99
- Research: Digital kitchen scales are a top Amazon kitchen best-seller category —
  [Amazon Best Sellers: Digital Kitchen Scales](https://www.amazon.com/Best-Sellers-Digital-Kitchen-Scales/zgbs/kitchen/678508011),
  [asinsight — best-selling kitchen scales](https://www.asinsight.com/report/US/kitchen-scales)
- Image/price source: Made-in-China.com search listing for "Digital Kitchen Scale" — "High
  Quality with Perfect Accuracy Unique Design Electronic Kitchen Scale", US$3.29/unit
  (3,000-piece MOQ), supplier Ningbo OK Homeware Co.

### 7. Stainless Steel Knife Block Set (6-Piece)
- SKU: `HOMEKIT-KNIFESET-01`
- Price: $49.99
- Research: Knife block sets are a perennial Amazon kitchen best-seller, with sets from
  Astercook, HENCKELS, and McCook cited among current top sellers —
  [Amazon Best Sellers: Block Knife Sets](https://www.amazon.com/Best-Sellers-Block-Knife-Sets/zgbs/kitchen/409670),
  [Food Network — 6 best kitchen knife sets of 2026](https://www.foodnetwork.com/how-to/packages/shopping/product-reviews/best-knife-block-sets)
- Image/price source: Made-in-China.com search listing for "Kitchen Knife Block Set" — "Premium
  6-Piece Professional Kitchen Knife Set with Block", US$9.75–9.85/set (1,000-set MOQ), supplier
  Yangjiang Zhiyuan Hardware & Plastic.

## Sourcing method notes / gaps

- Alibaba.com blocked the search-listing page itself with a slider CAPTCHA on this pass (not
  just product-detail pages), so per the no-CAPTCHA rule it was abandoned entirely in favor of
  Made-in-China.com.
- Made-in-China.com's listing pages worked reliably once each browser action explicitly pinned
  a single tab id — without that, the pane intermittently rendered a different cached "hot
  product" listing than the one just requested. All 7 images/prices above were verified by
  reading back both the page URL and the extracted image `alt` text in the same step to confirm
  they matched the intended search term before downloading.
- All 7 images are search-result thumbnails (150–300px), consistent with the listing-page-only
  constraint — no product-detail pages were opened and no CAPTCHA was solved anywhere.
