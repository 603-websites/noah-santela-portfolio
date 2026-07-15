# Changes Summary — polish-images-copy-2026-07-14 (SCRUM-292)

## 1. Unified "fade into the background" image treatment

Every product/collection/hero image now dissolves into the near-black page
instead of sitting in a hard rectangle.

- **`.piece-image`** (styles.css): a radial-gradient CSS mask
  (`ellipse closest-side, #000 50%, rgba(0,0,0,.38) 74%, transparent 92%`,
  with `-webkit-` prefix) feathers the image edges into the background.
  `closest-side` keeps the ellipse hugging the image box at any aspect
  ratio — the default `farthest-corner` geometry left side midpoints nearly
  solid, so photos still read as rectangles.
- **`.piece-halo`**: one shared radial glow pooled behind each piece
  (faint on resting slides, full on the active one), replacing three
  slightly-different bespoke glows (slider stage, repairs, modal).
- The modal media pane's lighter radial background was flattened to the
  page ink so the blend is seamless; no borders/cards remain around images.
- Carousel frames now shrink-to-fit and center on the rendered image
  (instead of stretching `inset:0` + `object-fit`), so the edge fade always
  lines up with the photo's real edges at every breakpoint.
- Applied everywhere via `pictureMarkup()` in script.js (slider, crossfade
  carousels, modal) plus the repairs image and the new About-page figure.

## 2. Image fixes

- **Prairie Fire rendered sideways**: the polychrome JPEGs carry EXIF
  orientation 6, but their WebP renditions had been generated without
  applying it — Chrome serves the WebP, so the pendant lay on its side.
  Regenerated all 10 polychrome WebPs (full + `-sm`) upright with sharp,
  and corrected their DIMS entries to 600×800.
- **Wrong photos on Nightfall**: `uploads/IMG_3253/3251/3250` are the
  labradorite Moon's Tear piece, not the azurite Nightfall. Nightfall now
  carousels its two real photos (IMG_3088, IMG_3087); Moon's Tear gained a
  carousel (float PNG + its three photos).
- **Oversized fallbacks**: five full-resolution camera JPEGs (up to 5.2 MB,
  3024×4032) downscaled to the 1200 px long edge they were declared at —
  ~13 MB → ~1.7 MB total.
- **Lazy-load deadlock**: with shrink-to-fit sizing, carousel frames have
  no box until their image loads, so the native lazy loader never fetched
  them (empty slides on cold cache). The slider now eager-loads its track
  via IntersectionObserver (600 px rootMargin); the modal eager-loads on
  open. Static images keep `loading="lazy"` + `decoding="async"`.
- The slide shimmer band parked at `translateX(±150%)` was visibly bleeding
  over neighbouring slides ~82% of its loop; its opacity now lives in the
  keyframes so it only shows mid-sweep.
- Per-piece descriptive `alt` text (with "(alternate view)" suffixes on
  carousel frames) replaced the bare piece names.

## 3. Copy de-repetition (index.html + script.js strings)

Stock phrases capped at roughly once per page; the ideas stay, the wording
varies. Worst offenders before → after:

- "One-of-a-kind" appeared 6× (meta, JSON-LD, collection sub, contact,
  modal eyebrow, slide cue) → kept once as the slide cue "One of a kind ·
  Inquire". Collection now opens "No two alike…", contact says "Every
  design is made once, then retired", modal eyebrow is "Inquire · Made
  Once".
- "Handcrafted / by hand / forged by hand" 5× → hero eyebrow keeps
  "Handcrafted…"; tagline is now "Forged at the bench and set with stones
  that catch the light."; footer is "Made at the bench in New Hampshire.";
  repair list items reworded.
- Fixed the awkward double-spaced hyphens (`word  -  word`) left by the
  earlier em-dash sweep, and the stale About form success message that
  still said "your email is opening now" (the form posts to the webhook).

## 4. About page (about.html)

- The Story rewritten with a distinct four-beat arc: origin (light in a cut
  stone) → bench training → the New Hampshire studio practice today (raw
  .999 silver, one setting per stone) → restoration work. No longer echoes
  the homepage phrasing.
- Craft grid cards de-duplicated ("unique and unrepeatable" etc.); tagline
  and contact intro reworded; testimonial got an attribution line
  ("A returning client · Heirloom ring restoration") and a centered
  **Commission a Piece** CTA under it.
- Added a maker/workshop figure in the Story aside with the same
  piece-image/halo treatment — currently a collection photo placeholder,
  marked `TODO(SCRUM-292)` for a real portrait/bench photo.

## 5. SEO / AI-search

- index: JSON-LD upgraded `LocalBusiness` → `JewelryStore` (founder Person,
  `areaServed` NH, `knowsAbout`), plus an `ItemList` of the four signature
  pieces as `Product` (name, description, material, image, brand). Title,
  meta/OG/Twitter descriptions rewritten (New Hampshire in title).
- about: new `Person` JSON-LD for Noah (linked to the store via `@id`),
  `BreadcrumbList`, `og:type=profile`, and previously-missing
  twitter:title/description; distinct, non-duplicate meta description.
- robots.txt: explicit allow groups for GPTBot, OAI-SearchBot,
  PerplexityBot, ClaudeBot, Claude-Web, Google-Extended.
- New **llms.txt** describing the studio, maker, services, signature
  pieces, pages, and contact.
- sitemap.xml lastmod bumped to 2026-07-14.
- No FAQPage schema: the site has no visible FAQ content, and invisible
  FAQ markup is against Google's guidelines.

## Verified

Rendered locally in Chrome (desktop): slider autoplay/arrows/dots, piece
crossfades, modal open/close for photo + carousel pieces, repairs section,
About page, cold-cache hard reload; console clean. Mobile/responsive CSS
untouched (all treatment sizing is percentage-based); worth a quick
phone-width spot check after deploy.

## Known follow-ups

- Replace the About placeholder figure with a real portrait/workshop photo.
- `images/float/smoked-whiskey*.png`, `azurite-*.png`, `labradorite-rope.png`
  and the two legacy `Noah Santela - Jewelry*.html` files appear unused;
  deletion is Louis-only per policy (see SCRUM-217).
