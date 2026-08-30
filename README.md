# snischayprasad.github.io

Personal portfolio — Sadhanala Nischay Prasad, embedded systems and IoT.

Live at **https://snischayprasad.github.io**

Static site, no framework and no build step. Open `index.html` in a browser to
work on it locally.

```
index.html    markup and copy
styles.css    tokens, 3D board, layout
script.js     board interaction, scroll reveal, profile links
assets/       put the resume PDF here
```

## The hero

The hero is a PCB rendered with CSS 3D transforms, carrying the parts these
projects actually run on. It tilts toward the pointer, each component lifts in Z
and lights the copper traces feeding it, and the readout underneath names the
build that part belongs to. Clicking a component scrolls to its project.

Wiring lives in the markup, not the script:

- a component is a `.comp` button with `id="c-<key>"`
- its traces are `<path class="trace" data-for="<key>">` on the board SVG
- `data-target` points at the project card to scroll to

Adding a component means adding the button, at least one matching trace, and a
placement rule in `styles.css`. Nothing in `script.js` needs to change.

## Adding your resume

The resume button is built by JavaScript and is only created when a path is
set, so an unconfigured link never reaches the page. Edit the `PROFILE` block at
the top of `script.js`:

```js
var PROFILE = {
  linkedin: "https://www.linkedin.com/in/sadhanala-nischay-prasad-0b0978389/",
  resume:   "assets/Nischay-Prasad-Resume.pdf"
};
```

Drop the PDF into `assets/` with a matching filename, then commit and push.

## Cache busting

`styles.css` and `script.js` are referenced with a `?v=N` query in
`index.html`. Bump that number whenever you change either file, or returning
visitors keep the old copy.

## Deploying

Pushing to `main` publishes automatically through GitHub Pages. A build takes
about a minute.
