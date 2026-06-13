# Noah Santela — Handcrafted Jewelry

A two-page portfolio site for jewelry artist Noah Santela.

**Live site:** https://603-websites.github.io/noah-santela-portfolio/

## Pages
- `index.html` — home (hero, Santella Originals slider, Repairs & Restoration, contact)
- `about.html` — about Noah, The Craft, clientele, contact

## Files
- `styles.css` — all styling
- `script.js` — slider, inquiry modal, site-wide atmosphere, nav, form handling
- `images/float/` — the jewelry images (background-removed PNGs)

## Run locally
Just open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```
then visit http://localhost:8000

## Publish with GitHub Pages
1. Push these files to a GitHub repository (with `index.html` at the repo root).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick your branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
5. Wait ~1 minute; your site goes live at `https://<your-username>.github.io/<repo-name>/`.

No build step is required — it is a plain static site.
