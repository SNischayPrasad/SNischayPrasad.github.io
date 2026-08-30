# snischayprasad.github.io

Personal portfolio — Sadhanala Nischay Prasad, embedded systems and IoT.

Live at **https://snischayprasad.github.io**

Static site, no framework and no build step. Open `index.html` in a browser to
work on it locally.

```
index.html    markup and copy
styles.css    tokens, liquid glass material, layout
script.js     scroll reveal, optional profile links
assets/       put the resume PDF here
```

## The design

White ground, Apple-style type (SF Pro on Apple devices, Inter everywhere else),
and panels built from a liquid glass material rather than flat cards.

The page commits to a single light theme. Every colour is painted explicitly
instead of inherited, so nothing depends on the visitor's system theme.

### Liquid glass

`.glass` is the material. It combines four things, and all four matter — drop
any one and it stops reading as glass:

- `backdrop-filter: blur(32px) saturate(185%)` — the frosting
- a `::before` diagonal specular sweep across the face
- a `::after` inset rim, brightest along the top edge
- an outer cast shadow for lift

Glass is invisible over flat white, so `.ambience` sits behind everything: four
large, slowly drifting colour orbs at 12–16% opacity. They are faint enough that
the page still reads white, and strong enough that the panels have something to
refract as you scroll.

Visitors who set **reduced transparency** get solid white panels and no orbs.
Visitors who set **reduced motion** get no drift and no reveal animation.

### Adding a section

Add a `<section>` inside `.shell`, give its panel `class="glass reveal"`, and
add a `<li>` to `.nav-links` pointing at its `id`. The reveal is wired by class,
so nothing in `script.js` needs to change.

## Adding your resume

The resume button is built by JavaScript and is only created when a path is set,
so an unconfigured link never reaches the page. Drop the PDF into `assets/` and
edit the `PROFILE` block at the top of `script.js`:

```js
var PROFILE = {
  resume: "assets/Nischay-Prasad-Resume.pdf"
};
```

## Cache busting

`index.html` links the stylesheet and script with a version query —
`styles.css?v=4`, `script.js?v=4`. Bump both numbers when you change either
file, otherwise returning visitors keep the cached copy.

## Previous design

The dark PCB homepage — a CSS 3D board that tilted toward the pointer and lit
its copper traces — is in git history at `b5054b9`.
