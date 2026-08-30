# snischayprasad.github.io

Personal portfolio — Sadhanala Nischay Prasad, embedded systems and IoT.

Live at **https://snischayprasad.github.io**

Static site, no framework and no build step. Open `index.html` in a browser to
work on it locally.

```
index.html    markup and copy
styles.css    tokens and layout
script.js     hero scope animation, scroll reveal, optional profile links
assets/       put the resume PDF here
```

## Adding your LinkedIn and resume

Both buttons stay hidden until you fill them in, so the live site never shows a
dead link. Edit the `PROFILE` block at the top of `script.js`:

```js
var PROFILE = {
  linkedin: "https://www.linkedin.com/in/your-handle/",
  resume:   "assets/Nischay-Prasad-Resume.pdf"
};
```

Drop the PDF into `assets/` with a matching filename, then commit and push.

## Deploying

Pushing to `main` publishes automatically through GitHub Pages.
