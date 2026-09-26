# snischayprasad.github.io

Personal portfolio — Sadhanala Nischay Prasad.

Live at **https://snischayprasad.github.io**

Static site, no framework and no build step. Open `index.html` in a browser to
work on it locally.

```
index.html        markup and copy
styles.css        tokens, browser frame, layout
script.js         scroll reveal, optional resume link
assets/shots/     screenshots of the live deployments
assets/           put the resume PDF here
```

## The design

Dark editorial. The page is deliberately near-monochrome so the six product
screenshots carry all the colour. Green is used in exactly one meaning:
*deployed*.

Type is Instrument Serif for editorial headlines, Inter Tight for text, and
JetBrains Mono for data and labels.

### The browser frame

Each screenshot sits in a frame whose address bar shows the project's real
deployment URL and links to it. The chrome is the evidence, not decoration — a
reader can check any claim by clicking the address.

Frames are only for projects with a live deployment. Source-only work — the
cloud series, ScamShield, Tally — goes in a text `.slab` instead, so a frame
never implies a URL that does not exist. Green is likewise reserved for
*deployed*; unfinished work gets the neutral dashed `.chip-wip`.

To add one:

```html
<figure class="frame">
  <div class="chrome">
    <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <a class="addr" href="URL" target="_blank" rel="noopener">host/path</a>
    <span class="badge">live</span>
  </div>
  <a class="shot" href="URL" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
    <img src="assets/shots/NAME.webp" width="1600" height="900"
         loading="lazy" decoding="async" alt="...">
  </a>
</figure>
```

The `width` and `height` attributes are required — they reserve the box so the
page does not shift as images arrive.

### Greenve

The Smart Dustbin is a Greenve project. Greenve is a startup idea shared with
Reddi Malli Nandini and Rohit Singh, so the Dustbin card and the About section
credit all three. The Dustbin repository itself never mentions Greenve, so keep
the attribution when you rewrite that card from the repo.

## Refreshing the screenshots

The shots are captured from the running deployments with headless Chrome, then
cropped to 16:9 and converted to WebP. All six together are about 310 KB.

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

Note: capturing the whole portfolio page in one very tall headless window will
render the screenshots blank. That is a raster-area limit in headless Chrome,
not a fault in the page — check the deployed site instead.

## Adding your resume

The resume button is built by JavaScript and is only created when a path is
set, so an unconfigured link never reaches the page. Drop the PDF into
`assets/` and edit the `PROFILE` block at the top of `script.js`:

```js
var PROFILE = {
  resume: "assets/Nischay-Prasad-Resume.pdf"
};
```

## Cache busting

`index.html` links the stylesheet and script with a version query —
`styles.css?v=8`, `script.js?v=8`. Bump both when you change either file, or
returning visitors keep the cached copy.

## Deploying

Pushing to `main` publishes through GitHub Pages. A build takes about a minute.

## Previous designs

- White ground with liquid glass panels — `11a5b10`
- Dark PCB homepage with a CSS 3D board — `b5054b9`
