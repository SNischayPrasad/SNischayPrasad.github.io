/* =========================================================
   Pro layer: things that behave like real tooling.
   1. smooth momentum scrolling (Lenis) + one scroll helper
   2. command palette  (Ctrl/Cmd+K, "/")
   3. live uptime check of every deployment
   4. live GitHub activity
   5. cursor ring, copy-email toast, stack pills -> palette
   Every part degrades: with no script the page is unchanged,
   and reduced-motion visitors get native scrolling.
   ========================================================= */
(function(){
  var root = document.documentElement;
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var NAV_OFFSET = function(){ return (document.querySelector(".nav") || {}).offsetHeight || 64; };

  /* ---------- 1. smooth scrolling ---------- */
  var lenis = null;
  if (!still && fine && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -NAV_OFFSET() - 8 } });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function loop(t){ lenis.raf(t); requestAnimationFrame(loop); })(performance.now());
    }
  }
  // one helper every script uses, so programmatic jumps and Lenis never fight
  window.siteScrollTo = function(el){
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -NAV_OFFSET() - 8 });
    else el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  };
  function flash(el){
    el.classList.remove("pro-flash"); void el.offsetWidth; el.classList.add("pro-flash");
  }
  function reveal(el){
    // undo the filter, open compact cards, then jump
    var all = document.querySelector('.fchip[data-f="all"]');
    if (el.closest("[hidden]") && all) all.click();
    if (el.classList.contains("is-compact") && !el.classList.contains("is-open")) {
      var b = el.querySelector(".more"); if (b) b.click();
    }
    setTimeout(function(){ window.siteScrollTo(el); setTimeout(function(){ flash(el); }, still ? 0 : 700); }, 30);
  }

  /* ---------- toast ---------- */
  var toastEl = document.createElement("div");
  toastEl.className = "pro-toast"; toastEl.setAttribute("role", "status"); toastEl.setAttribute("aria-live", "polite");
  document.body.appendChild(toastEl);
  var toastT;
  function toast(msg){
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove("on"); }, 2200);
  }

  /* ---------- 2. command palette ---------- */
  var catNames = { web:"Web", ai:"AI / ML", data:"Data", security:"Security", embedded:"Embedded" };
  function text(el){ return (el && el.textContent || "").replace(/\s+/g, " ").trim(); }
  function buildIndex(){
    var out = [];
    [].forEach.call(document.querySelectorAll(".nav-links a[href^='#']"), function(a){
      var t = document.getElementById(a.getAttribute("href").slice(1));
      if (t) out.push({ kind:"Section", title:text(a), sub:"Jump to section", el:t, hay:text(a) });
    });
    [].forEach.call(document.querySelectorAll("[data-cat], .mk-feature"), function(card){
      var h = card.querySelector("h3"); if (!h) return;
      var cats = (card.getAttribute("data-cat") || "marketing").split(" ").map(function(c){ return catNames[c] || "Marketing"; });
      var live = !!card.querySelector(".badge");
      var line = text(card.querySelector(".case-line, .mini-line, .slab > p, .brick > p"));
      out.push({ kind: live ? "Live" : "Project", title:text(h), sub:cats.join(" · ") + (line ? " — " + line : ""),
                 el:card, hay:text(h) + " " + text(card.querySelector(".tags")) + " " + text(card.querySelector(".chip")) + " " + cats.join(" ") + " " + line });
    });
    [].forEach.call(document.querySelectorAll(".xp-item"), function(li){
      out.push({ kind:"Internship", title:text(li.querySelector(".xp-role")), sub:text(li.querySelector(".xp-org")) + " · " + text(li.querySelector(".xp-when")), el:li, hay:text(li) });
    });
    [].forEach.call(document.querySelectorAll(".cert"), function(c){
      out.push({ kind:"Certificate", title:text(c.querySelector(".cert-name")), sub:text(c.querySelector(".cert-org")), el:c, hay:text(c),
                 cert:true });
    });
    [].forEach.call(document.querySelectorAll("#marketing tbody tr"), function(tr){
      out.push({ kind:"Marketing task", title:text(tr.querySelector("th")), sub:text(tr.querySelector("td:nth-of-type(2)")), el:tr, hay:text(tr) });
    });
    out.push({ kind:"Action", title:"Copy email address", sub:"nischayprasuna@gmail.com", action:copyEmail, hay:"email mail contact copy" });
    out.push({ kind:"Action", title:"Open GitHub", sub:"github.com/SNischayPrasad", href:"https://github.com/SNischayPrasad", hay:"github code source" });
    out.push({ kind:"Action", title:"Open LinkedIn", sub:"Sadhanala Nischay Prasad", href:"https://www.linkedin.com/in/sadhanala-nischay-prasad-0b0978389/", hay:"linkedin profile" });
    out.push({ kind:"Action", title:"Back to top", sub:"Home", el:document.getElementById("top"), hay:"top home start" });
    return out;
  }
  // subsequence fuzzy score: consecutive and word-start matches rank higher
  function score(q, item){
    if (!q) return 1;
    var hay = item.hay.toLowerCase(), title = item.title.toLowerCase();
    var words = q.toLowerCase().split(/\s+/).filter(Boolean), total = 0;
    for (var w = 0; w < words.length; w++) {
      var word = words[w], idx = title.indexOf(word);
      if (idx === 0) { total += 120; continue; }
      if (idx > 0) { total += 90 - Math.min(idx, 40); continue; }
      idx = hay.indexOf(word);
      if (idx >= 0) { total += 50; continue; }
      // last resort: letters in order within the title only (typos like "trnsmsn")
      var i = 0, j = 0, streak = 0, s = 0;
      while (i < title.length && j < word.length) {
        if (title[i] === word[j]) { streak++; s += streak; j++; } else streak = 0;
        i++;
      }
      if (j < word.length) return 0;
      total += Math.min(30, s);
    }
    return total;
  }
  function highlight(str, q){
    var esc = str.replace(/[&<>]/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c]; });
    if (!q) return esc;
    var w = q.trim().split(/\s+/)[0]; if (!w) return esc;
    var i = str.toLowerCase().indexOf(w.toLowerCase());
    if (i < 0) return esc;
    var before = str.slice(0, i), mid = str.slice(i, i + w.length), after = str.slice(i + w.length);
    var e = function(x){ return x.replace(/[&<>]/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c]; }); };
    return e(before) + "<mark>" + e(mid) + "</mark>" + e(after);
  }

  var pal = document.createElement("div");
  pal.className = "pal"; pal.hidden = true;
  pal.innerHTML =
    '<div class="pal-back" data-close></div>' +
    '<div class="pal-box" role="dialog" aria-modal="true" aria-label="Search the portfolio">' +
      '<div class="pal-head"><span class="pal-icon" aria-hidden="true">&#8981;</span>' +
      '<input class="pal-input" type="text" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" ' +
      'placeholder="Search projects, tech, internships&hellip;" autocomplete="off" spellcheck="false">' +
      '<kbd class="pal-esc">Esc</kbd></div>' +
      '<ul class="pal-list" id="pal-list" role="listbox" data-lenis-prevent></ul>' +
      '<div class="pal-foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span><span><kbd>Enter</kbd> open</span><span class="pal-count"></span></div>' +
    '</div>';
  document.body.appendChild(pal);
  var input = pal.querySelector(".pal-input"), list = pal.querySelector(".pal-list"), countEl = pal.querySelector(".pal-count");
  var index = null, results = [], active = 0, lastFocus = null;

  function render(){
    var q = input.value.trim();
    results = index.map(function(it){ return { it:it, s:score(q, it) }; })
      .filter(function(r){ return r.s > 0; })
      .sort(function(a, b){ return b.s - a.s; })
      .slice(0, q ? 40 : 14).map(function(r){ return r.it; });
    if (!q) results = index.filter(function(it){ return it.kind === "Live" || it.kind === "Section"; }).slice(0, 14);
    active = 0;
    list.innerHTML = results.length ? results.map(function(it, i){
      return '<li role="option" id="pal-o' + i + '" class="pal-opt" data-i="' + i + '" aria-selected="' + (i === 0) + '">' +
        '<span class="pal-kind k-' + it.kind.split(" ")[0].toLowerCase() + '">' + it.kind + '</span>' +
        '<span class="pal-text"><span class="pal-title">' + highlight(it.title, q) + '</span>' +
        '<span class="pal-sub">' + highlight(it.sub, q) + '</span></span><span class="pal-go" aria-hidden="true">&#8629;</span></li>';
    }).join("") : '<li class="pal-empty">No matches for &ldquo;' + highlight(q, "") + '&rdquo;. Try a technology, like <em>FastAPI</em> or <em>ESP32</em>.</li>';
    countEl.textContent = results.length + (results.length === 1 ? " result" : " results");
    setActive(0);
  }
  function setActive(i){
    var opts = list.querySelectorAll(".pal-opt");
    if (!opts.length) { input.removeAttribute("aria-activedescendant"); return; }
    active = (i + opts.length) % opts.length;
    [].forEach.call(opts, function(o, k){ o.setAttribute("aria-selected", String(k === active)); });
    input.setAttribute("aria-activedescendant", "pal-o" + active);
    opts[active].scrollIntoView({ block: "nearest" });
  }
  function choose(i){
    var it = results[i]; if (!it) return;
    close();
    if (it.action) return it.action();
    if (it.href) return void window.open(it.href, "_blank", "noopener");
    if (it.cert) {
      var cl = document.getElementById("cert-list");
      if (cl && cl.hidden) { var b = cl.previousElementSibling; if (b && b.click) b.click(); }
    }
    reveal(it.el);
  }
  function open(q){
    if (!pal.hidden) return;
    index = index || buildIndex();
    lastFocus = document.activeElement;
    pal.hidden = false;
    if (lenis) lenis.stop();
    input.value = q || "";
    render();
    requestAnimationFrame(function(){ pal.classList.add("on"); input.focus(); });
  }
  function close(){
    if (pal.hidden) return;
    pal.classList.remove("on"); pal.hidden = true;
    if (lenis) lenis.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.openPalette = open;
  input.addEventListener("input", render);
  input.addEventListener("keydown", function(e){
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") { e.preventDefault(); }   // focus stays in the dialog
  });
  list.addEventListener("click", function(e){ var o = e.target.closest(".pal-opt"); if (o) choose(+o.getAttribute("data-i")); });
  list.addEventListener("mousemove", function(e){ var o = e.target.closest(".pal-opt"); if (o) setActive(+o.getAttribute("data-i")); });
  pal.addEventListener("click", function(e){ if (e.target.hasAttribute("data-close")) close(); });
  document.addEventListener("keydown", function(e){
    var typing = /input|textarea|select/i.test((e.target.tagName || "")) || e.target.isContentEditable;
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pal.hidden ? open() : close(); }
    else if (e.key === "/" && !typing && pal.hidden) { e.preventDefault(); open(); }
  });

  // trigger in the nav
  var navIn = document.querySelector(".nav-in"), gh = document.querySelector(".nav-gh");
  if (navIn) {
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || "");
    var trig = document.createElement("button");
    trig.type = "button"; trig.className = "pal-trigger";
    trig.setAttribute("aria-label", "Search the portfolio");
    trig.innerHTML = '<span aria-hidden="true">&#8981;</span><span class="pal-trigger-t">Search</span><kbd>' + (mac ? "&#8984;" : "Ctrl") + ' K</kbd>';
    trig.addEventListener("click", function(){ open(); });
    navIn.insertBefore(trig, gh);
  }

  // stack pills search the palette
  [].forEach.call(document.querySelectorAll("#stack .pills li"), function(li){
    li.tabIndex = 0; li.setAttribute("role", "button");
    li.setAttribute("aria-label", "Find projects using " + text(li));
    function go(){ open(text(li)); }
    li.addEventListener("click", go);
    li.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  /* ---------- copy email ---------- */
  function copyEmail(){
    var addr = "nischayprasuna@gmail.com";
    var done = function(){ toast("Email copied: " + addr); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(done, function(){ location.href = "mailto:" + addr; });
    else location.href = "mailto:" + addr;
  }
  var mail = document.querySelector('#contact a[href^="mailto:"]');
  if (mail) {
    var cp = document.createElement("button");
    cp.type = "button"; cp.className = "btn btn-line"; cp.textContent = "Copy email";
    cp.addEventListener("click", copyEmail);
    mail.parentNode.insertBefore(cp, mail.nextSibling);
  }

  /* ---------- 3. live uptime check ---------- */
  function ping(url){
    var t0 = performance.now(), ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function(){ if (ctl) ctl.abort(); }, 9000);
    var u = url + (url.indexOf("?") < 0 ? "?" : "&") + "_ping=" + Date.now();
    return fetch(u, { mode: "no-cors", cache: "no-store", signal: ctl ? ctl.signal : undefined })
      .then(function(){ clearTimeout(to); return Math.round(performance.now() - t0); },
            function(){ clearTimeout(to); return null; });
  }
  function runUptime(){
    var frames = [].slice.call(document.querySelectorAll(".frame"));
    var hero = document.createElement("p");
    hero.className = "pro-status"; hero.setAttribute("aria-live", "polite");
    hero.innerHTML = '<span class="pro-dot checking" aria-hidden="true"></span>Checking ' + frames.length + ' deployments&hellip;';
    var cta = document.querySelector(".hero .cta"); if (cta) cta.parentNode.insertBefore(hero, cta.nextSibling);
    var up = 0, times = [];
    Promise.all(frames.map(function(f){
      var a = f.querySelector(".addr"), badge = f.querySelector(".badge");
      if (!a || !badge) return null;
      return ping(a.href).then(function(ms){
        if (ms !== null) { up++; times.push(ms); badge.textContent = "live · " + ms + " ms"; badge.title = "Responded just now from your browser"; }
        else { badge.textContent = "live"; badge.title = "Could not confirm from this network"; }
      });
    })).then(function(){
      times.sort(function(a, b){ return a - b; });
      var med = times.length ? times[Math.floor(times.length / 2)] : null;
      hero.innerHTML = '<span class="pro-dot' + (up === frames.length ? "" : " partial") + '" aria-hidden="true"></span>' +
        up + "/" + frames.length + " deployments responding" + (med !== null ? " · median " + med + " ms" : "") + " · checked from your browser just now";
    });
  }

  /* ---------- 4. live GitHub activity ---------- */
  function ago(iso){
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + " min ago";
    if (s < 86400) return Math.round(s / 3600) + " h ago";
    var d = Math.round(s / 86400); return d + (d === 1 ? " day ago" : " days ago");
  }
  function runGitHub(){
    fetch("https://api.github.com/users/SNischayPrasad/repos?sort=pushed&per_page=3")
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(repos){
        if (!repos || !repos.length) return;
        var r = repos.filter(function(x){ return x.name !== "SNischayPrasad.github.io"; })[0] || repos[0];
        var p = document.createElement("p");
        p.className = "pro-status pro-gh";
        p.innerHTML = '<span class="pro-gh-icon" aria-hidden="true">&#9679;</span>Last pushed to GitHub: <a href="' + r.html_url + '" target="_blank" rel="noopener">' +
          r.name.replace(/[&<>]/g, "") + "</a> · " + ago(r.pushed_at);
        var s = document.querySelector(".pro-status");
        (s || document.querySelector(".hero .cta")).insertAdjacentElement("afterend", p);
      }).catch(function(){});
  }

  var idle = window.requestIdleCallback || function(f){ return setTimeout(f, 600); };
  idle(function(){ runUptime(); runGitHub(); });

  /* ---------- 5. cursor ring ---------- */
  if (fine && !still) {
    var ring = document.createElement("div");
    ring.className = "pro-cursor"; ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    var x = -100, y = -100, rx = x, ry = y, raf = 0;
    addEventListener("pointermove", function(e){
      x = e.clientX; y = e.clientY;
      var hot = e.target.closest && e.target.closest("a, button, [role=button], .fchip, canvas, .pal-opt, summary");
      ring.classList.toggle("hot", !!hot);
      ring.classList.add("on");
      if (!raf) raf = requestAnimationFrame(move);
    }, { passive: true });
    addEventListener("pointerdown", function(){ ring.classList.add("down"); });
    addEventListener("pointerup", function(){ ring.classList.remove("down"); });
    document.addEventListener("pointerleave", function(){ ring.classList.remove("on"); });
    function move(){
      raf = 0;
      rx += (x - rx) * 0.22; ry += (y - ry) * 0.22;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      if (Math.abs(x - rx) + Math.abs(y - ry) > 0.3) raf = requestAnimationFrame(move);
    }
  }

  /* ---------- tech marquee (decorative) ---------- */
  var stack = document.querySelector("#stack .rows");
  if (stack) {
    var names = [].map.call(document.querySelectorAll("#stack .pills li"), function(li){ return text(li); });
    var m = document.createElement("div");
    m.className = "marquee"; m.setAttribute("aria-hidden", "true");
    var track = '<div class="marquee-track">' + names.concat(names).map(function(n){ return "<span>" + n.replace(/[&<>]/g, "") + "</span>"; }).join("") + "</div>";
    m.innerHTML = track;
    stack.parentNode.insertBefore(m, stack);
  }
})();
