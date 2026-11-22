"""Builds the modern portfolio page from redesign/data.json.

python redesign/build.py preview   -> redesign/modern/index.html (assets via ../../)
python redesign/build.py site      -> index.html at the repo root
"""
import json, sys, re, os
from html import escape as E

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
mode = sys.argv[1] if len(sys.argv) > 1 else "preview"
P = "../../" if mode == "preview" else ""
OUT = os.path.join(HERE, "modern", "index.html") if mode == "preview" else os.path.join(ROOT, "index.html")
V = "3"

d = json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8"))
head_meta = open(os.path.join(HERE, "head-meta.html"), encoding="utf-8").read()
head_meta = head_meta.replace('href="favicon', f'href="{P}favicon').replace('href="apple-touch', f'href="{P}apple-touch')
head_meta = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#06060A">', head_meta)

EXT = 'target="_blank" rel="noopener"'
ARROW = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
GH = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" fill="currentColor" stroke="none"/></svg>'
LI = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z" fill="currentColor" stroke="none"/></svg>'
MAIL = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
COPY = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'

UNDER = '<svg class="draw under" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M3 15 C 60 7, 110 19, 170 11 S 260 5, 297 13"/></svg>'
CIRCLE = '<svg class="draw circle" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><path d="M160 9 C 70 4, 9 28, 12 62 C 15 99, 92 115, 165 111 C 246 106, 293 84, 288 50 C 283 17, 212 2, 118 13"/></svg>'
HAND_ARROW = '<svg class="draw harrow" viewBox="0 0 120 90" aria-hidden="true"><path d="M110 8 C 70 4, 30 20, 22 70"/><path d="M8 56 L 22 74 L 36 58"/></svg>'
TILTS = [-1.3, 1.1, -0.7, 1.4, -1.0, 0.8, -1.2, 0.9, -0.6]

CAT_LABEL = {"web": "Web", "ai": "AI / ML", "data": "Data", "security": "Security", "embedded": "Embedded"}

def link_btns(links, cls="lnk"):
    out = []
    for l in links:
        href = l["href"] or "#"
        lab = l["label"] or "Open"
        ext = EXT if href.startswith("http") else ""
        out.append(f'<a class="{cls}" href="{E(href)}" {ext}>{E(lab)} {ARROW}</a>')
    return "".join(out)

def tags(ts, cls="tags"):
    return f'<ul class="{cls}">' + "".join(f"<li>{E(t)}</li>" for t in ts) + "</ul>" if ts else ""

def host(url):
    return re.sub(r"^https?://|/$", "", url or "")

# ---------------- live projects ----------------
live_cards, modals = [], []
for i, p in enumerate(d["live"]):
    pid = p["id"] or f"p-{i}"
    shot = p["shot"].replace(".webp", "")
    cats = p["cats"].split()
    catlab = " · ".join(CAT_LABEL.get(c, c) for c in cats)
    tagline = p["tag"] or catlab
    size = "xl" if i == 0 else ("lg" if i in (2, 3, 7, 8) else "")
    live_cards.append(f'''
<article class="pcard {size}" style="--tilt:{TILTS[i % len(TILTS)]}deg" data-cat="{E(p["cats"])}" data-flip-id="{pid}" id="{pid}" data-reveal>
  <button class="pcard-hit" type="button" data-open="m-{pid}" aria-label="Details for {E(p["name"])}"></button>
  <div class="pcard-shot">
    <img src="{P}{shot}-800.webp" srcset="{P}{shot}-800.webp 800w, {P}{shot}.webp 1600w" sizes="(max-width: 760px) 92vw, 50vw" width="1600" height="900" loading="lazy" decoding="async" alt="{E(p["alt"])}">
    <span class="live-pill"><i></i>Live</span>
  </div>
  <div class="pcard-body">
    <p class="pcard-kicker">{E(tagline)}</p>
    <h3 class="pcard-name">{E(p["name"])}</h3>
    <p class="pcard-line">{E(p["line"])}</p>
    {tags(p["tags"][:5])}
    <div class="pcard-links">
      <a class="lnk solid" href="{E(p["url"])}" {EXT}>Open live {ARROW}</a>
      <span class="pcard-more">Details <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </div>
  </div>
</article>''')
    notes = "".join(f'<div class="note"><h4>{E(n["t"])}</h4><p>{E(n["d"])}</p></div>' for n in p["notes"])
    if p.get("note"):
        notes = f'<div class="note"><p>{E(p["note"])}</p></div>'
    modals.append(f'''
<dialog class="modal" id="m-{pid}" aria-labelledby="mt-{pid}">
  <div class="modal-box">
    <button class="modal-x" type="button" data-close aria-label="Close">
      <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
    <div class="modal-shot"><img src="{P}{shot}.webp" width="1600" height="900" loading="lazy" decoding="async" alt="{E(p["alt"])}"></div>
    <div class="modal-body">
      <p class="pcard-kicker">{E(tagline)}</p>
      <h3 class="modal-title" id="mt-{pid}">{E(p["name"])}</h3>
      <p class="modal-line">{E(p["line"])}</p>
      <p class="modal-host"><span class="dot-live"></span>{E(host(p["url"]))}</p>
      {tags(p["tags"])}
      <div class="notes">{notes}</div>
      <div class="modal-links">{link_btns(p["links"])}</div>
    </div>
  </div>
</dialog>''')

# ---------------- more projects (tabs) ----------------
tabs, panels = [], []
groups = d["groups"] + [{"id": "earlier", "kicker": "Earlier", "title": "Earlier projects", "sub": "", "items": None}]
for gi, g in enumerate(groups):
    sel = "true" if gi == 0 else "false"
    label = {"ai": "AI & ML", "data": "Data", "security": "Security", "cloud": "Cloud", "hardware": "Hardware", "earlier": "Earlier"}[g["id"]]
    count = len(g["items"]) if g["items"] else len(d["earlier"])
    tabs.append(f'<button class="tab" role="tab" id="tab-{g["id"]}" aria-controls="panel-{g["id"]}" aria-selected="{sel}" tabindex="{0 if gi == 0 else -1}">{label}<span class="tab-n">{count}</span></button>')
    if g["items"]:
        cards = []
        for it in g["items"]:
            src = next((l["href"] for l in it["links"] if "github.com" in (l["href"] or "")), None)
            notes = "".join(f'<div class="note"><h4>{E(n["t"])}</h4><p>{E(n["d"])}</p></div>' for n in it["notes"])
            more = f'<details class="mcard-more"><summary>How it works</summary><div class="notes">{notes}</div></details>' if notes else ""
            cards.append(f'''
<article class="mcard" data-reveal>
  <div class="mcard-top"><h3>{E(it["name"])}</h3>{f'<span class="chip">{E(it["chip"])}</span>' if it["chip"] else ""}</div>
  <p>{E(it["desc"])}</p>
  {tags(it["tags"])}
  {more}
  {f'<a class="lnk" href="{E(src)}" {EXT}>{GH} Source</a>' if src else ""}
</article>''')
        body = f'<p class="panel-sub">{E(g["sub"])}</p><div class="mgrid">{"".join(cards)}</div>'
    else:
        rows = "".join(f'''<li class="erow" data-reveal><div><h3>{E(e["name"])}</h3><p>{E(e["desc"])}</p></div><span class="chip">{E(e["plat"])}</span>{f'<a class="lnk" href="{E(e["href"])}" {EXT}>{GH} Source</a>' if e["href"] else ""}</li>''' for e in d["earlier"])
        body = f'<ul class="elist">{rows}</ul>'
    panels.append(f'<div class="panel" role="tabpanel" id="panel-{g["id"]}" aria-labelledby="tab-{g["id"]}" {"" if gi == 0 else "hidden"}><h3 class="panel-title">{E(g["title"])}</h3>{body}</div>')

# ---------------- experience ----------------
xp_items = []
for x in d["xp"]:
    xp_items.append(f'''
<li class="xp" data-reveal>
  <span class="xp-node" aria-hidden="true"></span>
  <div class="xp-card" data-spot>
    <p class="xp-when">{E(x["when"])}<span>{E(x["where"])}</span></p>
    <h3 class="xp-role">{E(x["role"])}</h3>
    <p class="xp-org">{E(x["org"])}</p>
    <p class="xp-desc">{E(x["desc"])}</p>
    <div class="xp-links">{link_btns(x["links"])}</div>
  </div>
</li>''')

# ---------------- certificates ----------------
cert_cards = []
for c in d["certs_raw"]:
    name = next(cc["name"] for cc in d["certs"] if c["text"].startswith(cc["name"]))
    meta = c["text"][len(name):].replace("Verify ↗", "").strip()
    issuer = meta.split(" · ")[0]
    initial = "".join(w[0] for w in re.findall(r"[A-Za-z][A-Za-z.]+", issuer)[:2]).upper()
    inner = f'''<span class="cert-logo" aria-hidden="true">{E(initial)}</span><div><h3>{E(name)}</h3><p>{E(meta)}</p></div>'''
    if c["href"]:
        cert_cards.append(f'<a class="cert" href="{E(c["href"])}" {EXT} data-reveal data-spot>{inner}<span class="cert-go">Verify {ARROW}</span></a>')
    else:
        cert_cards.append(f'<div class="cert" data-reveal data-spot>{inner}</div>')

# ---------------- stack ----------------
stack = "".join(f'<div class="srow" data-reveal><h3>{E(s["h"])}</h3>{tags(s["items"], "chips")}</div>' for s in d["stack"])
marquee_a = [t for s in d["stack"][:3] for t in s["items"]]
marquee_b = [t for s in d["stack"][3:7] for t in s["items"]]
def mq(items):
    one = "".join(f"<span>{E(t)}</span>" for t in items)
    return f'<div class="mq-track">{one}{one.replace("<span>", "<span aria-hidden=\"true\">")}</div>'

# ---------------- marketing ----------------
crumb = d["live"][-1]
mk_rows = "".join(f'<li class="task" data-reveal><span class="task-area">{E(t["area"])}</span><h3>{E(t["name"])}</h3><p>{E(t["brief"])}</p>{f'<a class="lnk" href="{E(t["href"])}" {EXT}>{GH} Repo</a>' if t["href"] else ""}</li>' for t in d["mk_tasks"])

about = d["about"]
about_words = " ".join(f'<span class="w">{E(w)}</span>' for w in about["big"].split())
greenve = E(about["note"]).replace("Smart Dustbin", '<a href="#p-dustbin">Smart Dustbin</a>', 1)

nav_links = [("work", "Work"), ("experience", "Experience"), ("certifications", "Certificates"), ("stack", "Stack"), ("about", "About"), ("contact", "Contact")]
nav_html = "".join(f'<a href="#{a}" data-nav="{a}">{b}</a>' for a, b in nav_links)

filters = '<button class="fbtn" aria-pressed="true" data-filter="all">All</button>' + "".join(
    f'<button class="fbtn" aria-pressed="false" data-filter="{k}">{v}</button>' for k, v in CAT_LABEL.items())

page = f'''{head_meta}
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=boska@1,2&display=swap">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{P}modern.css?v={V}">
<script>document.documentElement.classList.add('js');</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="paper" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"><i></i></div>

<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Sadhanala Nischay Prasad, home">
    <span class="brand-mark" aria-hidden="true">sn.</span><span class="brand-name">Sadhanala Nischay Prasad</span>
  </a>
  <nav class="nav-links" aria-label="Sections">{nav_html}<span class="nav-pill" aria-hidden="true"></span></nav>
  <a class="btn btn-ink nav-cta" href="#contact">Get in touch</a>
  <button class="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><i></i><i></i></button>
</header>
<div class="mnav" id="mnav" hidden><nav aria-label="Sections">{nav_html}<a href="#contact" class="btn btn-ink">Get in touch</a></nav></div>

<main id="main">
<section class="hero" id="top">
  <div class="hero-copy">
    <p class="avail" data-hero><span class="pulse" aria-hidden="true"></span>Open to roles · Hyderabad, India</p>
    <h1 class="hero-title"><span class="name" data-split>Sadhanala Nischay Prasad</span><span class="name-under">{UNDER}</span></h1>
    <p class="strike" data-hero>I build <s>websites</s> <s>apps</s> <span class="hand">things that run on the web, the phone and a microcontroller.</span></p>
    <p class="lede" data-hero>Full-stack &amp; AI engineer with an embedded background. Next.js, FastAPI and Postgres on the web, Kotlin on the phone, C++ on the microcontroller, and the machine learning that decides things in between.</p>
    <div class="cta" data-hero>
      <a class="btn btn-ink" href="#work" data-magnetic>See what’s live {ARROW}</a>
      <a class="btn btn-line" href="https://github.com/SNischayPrasad" {EXT} data-magnetic>{GH} GitHub</a>
      <a class="btn btn-line" href="https://www.linkedin.com/in/sadhanala-nischay-prasad-0b0978389/" {EXT} data-magnetic>{LI} LinkedIn</a>
    </div>
    <dl class="stats" data-hero>
      <div><dd data-count="9">9</dd><dt>live projects</dt></div>
      <div><dd data-count="70" data-suffix="+">70+</dd><dt>repositories</dt></div>
      <div><dd data-count="{len(d["xp"])}">{len(d["xp"])}</dd><dt>internships</dt></div>
      <div><dd data-count="{len(d["certs_raw"])}">{len(d["certs_raw"])}</dd><dt>certificates</dt></div>
    </dl>
  </div>
  <div class="hero-visual" data-hero>
    <figure class="polaroid" data-tilt data-tilt-max="8">
      <span class="tape" aria-hidden="true"></span>
      <img src="{P}assets/me.webp" width="600" height="800" alt="Sadhanala Nischay Prasad" fetchpriority="high">
      <figcaption class="hand">that’s me · Hyderabad</figcaption>
    </figure>
    <p class="hero-note hand" aria-hidden="true">currently building Greenve{HAND_ARROW}</p>
  </div>
</section>

<div class="marquee" aria-label="Technologies">
  <div class="mq" data-dir="1">{mq(marquee_a)}</div>
</div>

<section class="sec" id="work">
  <div class="sec-head">
    <p class="kicker hand" data-reveal>the live stuff ↓</p>
    <h2 class="h2" data-reveal>Nine things I built that you can <span class="scrib">open right now.{UNDER}</span></h2>
    <p class="sub" data-reveal>Deployed and clickable. Tap a card for how it works, or open it live.</p>
    <div class="filters" role="group" aria-label="Filter projects" data-reveal>{filters}<span class="fpill" aria-hidden="true"></span></div>
  </div>
  <div class="bento" id="bento">{"".join(live_cards)}</div>
</section>

<section class="sec" id="more">
  <div class="sec-head">
    <p class="kicker hand" data-reveal>more things I built</p>
    <h2 class="h2" data-reveal>Machine learning, data, security, cloud <mark class="hl">and hardware.</mark></h2>
  </div>
  <div class="tabs" role="tablist" aria-label="Project categories" data-reveal>{"".join(tabs)}<span class="tab-pill" aria-hidden="true"></span></div>
  <div class="panels">{"".join(panels)}</div>
</section>

<section class="sec" id="experience">
  <div class="sec-head">
    <p class="kicker hand" data-reveal>where I’ve worked</p>
    <h2 class="h2" data-reveal><mark class="hl">Internships.</mark></h2>
    <p class="sub" data-reveal>{E(d["xp_head"])}</p>
  </div>
  <ol class="timeline"><span class="tl-line" aria-hidden="true"><i></i></span>{"".join(xp_items)}</ol>
</section>

<section class="sec" id="certifications">
  <div class="sec-head">
    <p class="kicker hand" data-reveal>the paperwork</p>
    <h2 class="h2" data-reveal>Verified <span class="scrib">certifications.{UNDER}</span></h2>
    <p class="sub" data-reveal>Each links to the issuer’s own verification page where one exists.</p>
  </div>
  <div class="certs">{"".join(cert_cards)}</div>
</section>

<section class="sec" id="stack">
  <div class="sec-head">
    <p class="kicker hand" data-reveal>my toolbox</p>
    <h2 class="h2" data-reveal>What I’ve shipped with.</h2>
    <p class="sub" data-reveal>Not what I’ve read about.</p>
  </div>
  <div class="stack">{stack}</div>
</section>

<section class="sec" id="about">
  <p class="kicker hand" data-reveal>a bit about me</p>
  <p class="about-big" data-words>{about_words}</p>
  <div class="about-cols">{"".join(f'<p data-reveal>{E(c)}</p>' for c in about["cols"])}</div>
  <div class="greenve" data-reveal data-spot><span class="greenve-k">Greenve</span><p>{greenve}</p></div>
</section>

<section class="sec" id="marketing">
  <div class="sec-head">
    <p class="kicker hand" data-reveal>the other half</p>
    <h2 class="h2" data-reveal>{E(d["mk_head"]["title"])}</h2>
    <p class="sub" data-reveal>{E(d["mk_head"]["sub"])}</p>
  </div>
  <div class="crumb" data-reveal data-spot>
    <div class="crumb-shot"><img src="{P}{crumb["shot"].replace(".webp", "-800.webp")}" width="1600" height="900" loading="lazy" decoding="async" alt="{E(crumb["alt"])}"></div>
    <div class="crumb-body">
      <p class="pcard-kicker">Featured strategy</p>
      <h3>{E(crumb["name"])}</h3>
      <p>{E(crumb["line"])}</p>
      <div class="notes">{"".join(f'<div class="note"><h4>{E(n["t"])}</h4><p>{E(n["d"])}</p></div>' for n in crumb["notes"])}</div>
      <div class="modal-links">{link_btns(crumb["links"])}</div>
    </div>
  </div>
  <h3 class="tasks-title" data-reveal>Internship tasks <span class="tab-n">{len(d["mk_tasks"])}</span></h3>
  <ul class="tasks" id="tasks">{mk_rows}</ul>
  <button class="btn btn-line tasks-toggle" type="button" aria-expanded="false" aria-controls="tasks">Show all tasks</button>
</section>

<section class="sec contact" id="contact">
  <p class="kicker hand" data-reveal>say hello</p>
  <h2 class="contact-big"><span class="scrib">Let’s talk.{CIRCLE}</span></h2>
  <p class="sub" data-reveal>Open to full-stack, backend, AI/ML and embedded roles, and to internships.</p>
  <div class="contact-row" data-reveal>
    <a class="btn btn-ink big" href="mailto:nischayprasuna@gmail.com" data-magnetic>{MAIL} nischayprasuna@gmail.com</a>
    <button class="btn btn-line copy" type="button" data-copy="nischayprasuna@gmail.com" data-magnetic>{COPY} Copy email</button>
  </div>
  <div class="contact-row" data-reveal>
    <a class="btn btn-line" href="https://www.linkedin.com/in/sadhanala-nischay-prasad-0b0978389/" {EXT} data-magnetic>{LI} LinkedIn</a>
    <a class="btn btn-line" href="https://github.com/SNischayPrasad" {EXT} data-magnetic>{GH} GitHub</a>
  </div>
</section>
</main>

<footer class="foot">
  <p>© 2026 Sadhanala Nischay Prasad</p>
  <a class="totop" href="#top" aria-label="Back to top"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></a>
</footer>

<div class="toast" role="status" aria-live="polite"></div>
{"".join(modals)}

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js" defer></script>
<script src="{P}modern.js?v={V}" defer></script>
</body>
</html>
'''
open(OUT, "w", encoding="utf-8").write(page)
print("wrote", OUT, len(page) // 1024, "KB")
