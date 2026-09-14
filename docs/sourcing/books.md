# Books — Sourcing Documentation

Category: **Books** (Saleor category ID `Q2F0ZWdvcnk6MTg=`). 12 products created.

## Sourcing model (different from general-goods categories)

Unlike other departments, Books products are **real, currently in-print, bestselling titles** — not invented products. For each:
- Title, author, and ISBN were verified via web search against real bookseller/retailer listings (eBay, AbeBooks, Biblio, publisher/indie-bookstore pages, Books-A-Million, Amazon listings) — never invented.
- Cover images are the books' real official jacket art, reused from a prior (interrupted) sourcing pass already saved at `/tmp/product-images-books/*.jpg`, matched to each ISBN and visually spot-checked against known cover art before reuse (e.g. confirmed `cover_9780063327528.jpg` is *Tom Lake*'s actual floral jacket, `cover_housemaid.jpg` is *The Housemaid*'s actual keyhole-eye jacket).
- Descriptions below are original 1–2 sentence factual summaries written for this catalog, not copied jacket/publisher copy.
- Prices are realistic real-world retail prices for the format (hardcover $26–30, paperback $16.99).

## Products

| Title | Author | ISBN-13 | SKU | Price | Format |
|---|---|---|---|---|---|
| Tom Lake | Ann Patchett | 9780063327528 | BOOK-TOMLAKE-01 | $28.00 | Hardcover |
| Lessons in Chemistry | Bonnie Garmus | 9780385547345 | BOOK-LESSONSCHEM-01 | $28.00 | Hardcover |
| James | Percival Everett | 9780385550369 | BOOK-JAMES-01 | $28.00 | Hardcover |
| Outlive: The Science and Art of Longevity | Peter Attia, MD (with Bill Gifford) | 9780593236598 | BOOK-OUTLIVE-01 | $30.00 | Hardcover |
| The Anxious Generation | Jonathan Haidt | 9780593655030 | BOOK-ANXIOUSGEN-01 | $30.00 | Hardcover |
| Dungeon Crawler Carl | Matt Dinniman | 9780593820247 | BOOK-DUNGEONCRAWLER-01 | $26.00 | Hardcover |
| Atomic Habits | James Clear | 9780735211292 | BOOK-ATOMICHABITS-01 | $27.00 | Hardcover |
| The Women | Kristin Hannah | 9781250178633 | BOOK-THEWOMEN-01 | $30.00 | Hardcover |
| The Let Them Theory | Mel Robbins (with Sawyer Robbins) | 9781401971366 | BOOK-LETTHEM-01 | $29.00 | Hardcover |
| Fourth Wing | Rebecca Yarros | 9781649374042 | BOOK-FOURTHWING-01 | $27.99 | Hardcover |
| Iron Flame | Rebecca Yarros | 9781649374172 | BOOK-IRONFLAME-01 | $27.99 | Hardcover |
| The Housemaid | Freida McFadden | 9781538742570 | BOOK-HOUSEMAID-01 | $16.99 | Paperback |

Each product's Saleor description text ends with `ISBN: <isbn>.` per the sourcing spec, so the real ISBN is recorded on every listing.

## Descriptions (original text, not jacket copy) and sources

- **Tom Lake** — A mother recounts to her three adult daughters the story of her youthful summer romance with a now-famous actor, while the family works together harvesting cherries on their Michigan orchard during the early days of the pandemic. Source: [eBay listing](https://www.ebay.com/itm/226421915904), [Biblio](https://www.biblio.com/9780063327528).
- **Lessons in Chemistry** — Set in 1960s California, a brilliant research chemist is pushed out of serious science because of gender discrimination and unexpectedly becomes the star of a television cooking show, which she uses to teach her audience real chemistry and self-determination. Source: [Biblio](https://www.biblio.com/9780385547345).
- **James** — A retelling of Mark Twain's *Adventures of Huckleberry Finn* from the perspective of Jim, the enslaved man fleeing down the Mississippi River, giving him an inner life, wit, and agency largely absent from the original novel. Source: [Penguin Bookshop](https://penguinbookshop.com/book/9780385550369).
- **Outlive** — A physician lays out a data-driven framework for extending both lifespan and healthspan, covering exercise, nutrition, sleep, and prevention strategies aimed at heart disease, cancer, neurodegenerative disease, and metabolic dysfunction. Source: [Amazon listing](https://www.amazon.com/Outlive-Longevity-Peter-Attia-MD/dp/0593236599).
- **The Anxious Generation** — A social psychologist argues that the shift from play-based to phone-based childhood, driven by smartphones and social media, is a major cause of the sharp rise in anxiety, depression, and other mental health problems among adolescents. Source: [Parnassus Books](https://parnassusbooks.net/book/9780593655030).
- **Dungeon Crawler Carl** — When Earth's buildings are demolished overnight and replaced by a monster-filled dungeon broadcast across the galaxy as entertainment, an ordinary man and his ex-girlfriend's cat must fight their way through its levels to survive. Source: [Harvard Book Store](https://www.harvard.com/book/9780593820247).
- **Atomic Habits** — A guide to behavior change built around the idea that small, consistent adjustments to daily routines compound over time into significant differences in health, productivity, and personal growth. Source: [BookPeople](https://bookpeople.com/book/9780735211292).
- **The Women** — A young nurse volunteers to serve in Vietnam and returns home to an America that refuses to acknowledge the service and sacrifice of its female veterans, forcing her to fight for recognition and her own recovery. Source: [AbeBooks](https://www.abebooks.com/9781250178633/Women-Novel-Hannah-Kristin-1250178630/plp).
- **The Let Them Theory** — The authors present a two-word mental tool, "Let Them," for releasing the urge to control other people's choices and opinions, aimed at reducing anxiety and improving relationships and personal boundaries. Source: [AbeBooks](https://www.abebooks.com/9781401971366/Theory-Life-Changing-Tool-Millions-People-1401971369/plp).
- **Fourth Wing** — A physically fragile young woman is forced into a brutal training program to become a dragon rider at a war college, where she must survive lethal rivals and political intrigue to earn a dragon bond. Source: [Rizzoli Bookstore](https://www.rizzolibookstore.com/product/fourth-wing).
- **Iron Flame** — The sequel to *Fourth Wing* follows the newly bonded dragon rider through an even deadlier second year at the war college, as she uncovers government lies about the enemy threatening her world's border wards. Source: [AbeBooks](https://www.abebooks.com/9781649374172/Iron-Flame-Empyrean-2-Yarros-1649374178/plp).
- **The Housemaid** — A live-in housekeeper takes a job with a wealthy family only to discover that both her glamorous employer and the household itself are hiding dangerous secrets, upending her plan for a fresh start. Source: [Hachette Book Group](https://www.hachettebookgroup.com/titles/freida-mcfadden/the-housemaid/9781538768549/).

## Cover image sourcing

All 12 cover images were carried over from a prior, interrupted sourcing pass for this same category, saved at `/tmp/product-images-books/cover_<isbn>.jpg` (and `cover_housemaid.jpg`). They depict each book's real official publisher jacket art — standard, expected promotional material for any bookseller listing a real in-print title for resale (not from Alibaba/Made-in-China, which do not carry licensed books). Two covers (*Tom Lake*, *The Housemaid*) were visually re-verified against their known jacket designs during this session before reuse; the remainder were reused as-is since filenames were keyed to verified ISBNs from the same original sourcing effort.

## Saleor setup applied to every product

1. `productCreate` (name = "Title by Author", slug, EditorJS description ending in the real ISBN, category `Q2F0ZWdvcnk6MTg=`, product type `UHJvZHVjdFR5cGU6MQ==`)
2. `productVariantCreate` (SKU `BOOK-<SHORTTITLE>-01`, `attributes: []`, `trackInventory: true`)
3. `productChannelListingUpdate` on `default-channel` with `isPublished`, `visibleInListings`, `isAvailableForPurchase` all `true` and `availableForPurchaseAt: 2026-01-01T00:00:00Z`
4. `productVariantChannelListingUpdate` (realistic USD retail price)
5. `productVariantStocksCreate` (40 units at the default warehouse)
6. `productMediaCreate` (multipart real-cover-image upload)

**Verification:** an anonymous (no auth token) query against `{ category(id: "Q2F0ZWdvcnk6MTg=") { products(first:20, channel: "default-channel") { totalCount } } }` returned `totalCount: 12`.

`python3 manage.py update_search_indexes` was run after creation and completed successfully (products, orders, users indexes updated).

## Known gap — wholesale distributor account

**This store does not yet have a wholesale book-distributor account** (e.g. Ingram Content Group, Baker & Taylor). These are real, copyrighted, actively-in-print titles from major trade publishers (Harper, Doubleday, Harmony, Penguin Press, Ace, Avery, St. Martin's Press, Hay House, Entangled/Red Tower, Grand Central) — actually fulfilling customer orders for any of these 12 SKUs requires signing up with a real book wholesaler/distributor to source physical inventory and legally resell copies. Until that account exists, these listings are catalog/display only and cannot be fulfilled from real stock.
