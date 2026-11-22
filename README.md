# snischayprasad.github.io

Personal portfolio — Sadhanala Nischay Prasad.

Live at **https://snischayprasad.github.io**

Static site. `index.html` is generated from the content in `redesign/data.json`
by a small Python script, so edit the data (or the template) and rebuild rather
than hand-editing `index.html`.

```
index.html              generated page (do not edit by hand)
modern.css              all styles
modern.js               all interaction and animation
redesign/data.json      the content: projects, internships, certificates, stack, about
redesign/build.py       the page template; writes index.html
redesign/head-meta.html <head> metadata: title, description, Open Graph, JSON-LD, favicons
assets/me-3d.webp       3D portrait (hero)
assets/me.webp          original photo
assets/shots/           screenshots of the live deployments (+ -800.webp copies)
404.html, robots.txt, sitemap.xml
```

## Building

```bash
python redesign/build.py site      # writes index.html at the repo root
python redesign/build.py preview   # writes redesign/modern/index.html to try changes first
```

Test locally over `http://` (`python -m http.server`), not `file://`.

## The design

Paper and ink, meant to feel made by a person rather than generated: a warm
paper ground, Boska serif headings, Satoshi for text, Caveat as a blue "pen" for
handwritten notes, a yellow highlighter for emphasis, and project cards set as
printed sheets at slight angles, some with tape. The hero is a taped polaroid.

Motion (GSAP 3.12.5 + ScrollTrigger + Flip, Lenis smooth scroll): letter-by-letter
name reveal, a pen strike-through in the hero line, pen underlines and circles
that draw themselves on scroll, highlighter sweeps, filter reshuffle, project
detail pop-ups, tabbed "more projects", a timeline that fills as you scroll,
word-by-word about text, a scroll-speed marquee, count-up stats, magnetic
buttons and a copy-email toast. Everything respects `prefers-reduced-motion`,
and the page is fully readable without JavaScript.

Every live project card carries `data-cat` (any of `web ai data security embedded`),
which drives the filter.

### Section order

Hero, live projects, more projects (AI & ML, data, security, cloud, hardware,
earlier), experience, certifications, stack, about, **Digital Marketing (the last
content section)**, and **"Let's talk" contact, always the very bottom**. Add new
engineering sections above Digital Marketing; nothing goes below Contact.

### SEO

The `<head>` keeps the fixes from the SEO audit in the `T10` repo: name and role
in the title and H1, a description under 155 characters, Person/ProfilePage
JSON-LD, real favicon files, a 1200x630 `assets/og-image.png`, `robots.txt`,
`sitemap.xml`, a `404.html`, and `srcset` with an `-800.webp` copy of every
screenshot. When you add a screenshot, make its `-800.webp` copy too, and update
`<lastmod>` in `sitemap.xml`.

### Greenve

The Smart Dustbin is a Greenve project. Greenve is a startup idea shared with
Reddi Malli Nandini and Rohit Singh, so the Dustbin card and the About section
credit all three. The Dustbin repository itself never mentions Greenve, so keep
the attribution when you rewrite that card from the repo.

### Steel Access Doors and Tally

The `SAD-Delivery-project` repo holds two separate things:

- the `gh-pages` branch is a website built for Steel Access Doors, shown as
  **client work**;
- `main` is **Tally**, the invoice-to-picking-list app on Vercel. Keep its card
  generic and do not name the company there.

The Steel Access Doors home page opens with a one-per-session announcement, and
its hero is WebGL. To capture it, use a DevTools-protocol script that clicks
"Continue to site" and launches Chrome with `--use-angle=swiftshader
--enable-unsafe-swiftshader`; plain `--screenshot` catches the pop-up instead.

## Refreshing the screenshots

The shots are captured from the running deployments with headless Chrome, then
cropped to 16:9 and converted to WebP.

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=1280,820 \
  --virtual-time-budget=12000 --screenshot="assets/shots/NAME.png" "URL"
```

Then crop and compress with Pillow:

```python
from PIL import Image
im = Image.open("assets/shots/NAME.png").convert("RGB")
w, h = im.size
im.crop((0, 0, w, min(int(w * 9 / 16), h))).resize((1600, 900), Image.LANCZOS) \
  .save("assets/shots/NAME.webp", "WEBP", quality=84, method=6)
```

## Cache busting

`build.py` links `modern.css?v=N` and `modern.js?v=N` using its `V` constant.
Bump `V` when you change either file, or returning visitors keep the cached copy.

## Deploying

Pushing to `main` publishes through GitHub Pages. A build takes about a minute.

## Previous designs

- Crimson reel-style hero with 3D project ring — `a40b214`
- White ground with liquid glass panels — `11a5b10`
- Dark PCB homepage with a CSS 3D board — `b5054b9`
