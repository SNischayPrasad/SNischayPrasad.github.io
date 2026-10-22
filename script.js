/* =========================================================
   Portfolio behaviour
   1. Optional resume link
   2. Scroll reveal
   ========================================================= */

/* ---------------------------------------------------------
   1. RESUME

   Set a path and the button appears in the contact panel.
   Leave it empty and no element is created at all, so the
   live site can never show a dead link.
   --------------------------------------------------------- */
var PROFILE = {
  resume: ""                    // e.g. "assets/Nischay-Prasad-Resume.pdf"
};

(function resumeLink(){
  var host = document.getElementById("contact-actions");
  if (!host || !PROFILE.resume) return;

  var a = document.createElement("a");
  a.className = "btn btn-line";
  a.href = PROFILE.resume;
  a.textContent = "Download resume";
  a.setAttribute("download", "Nischay-Prasad-Resume.pdf");
  host.appendChild(a);
})();


/* ---------------------------------------------------------
   2. SCROLL REVEAL

   index.html adds .js-reveal to <html> only when
   IntersectionObserver exists and the visitor has not asked
   for reduced motion. Without that class the hidden state is
   never applied, so a blocked or failed script leaves the
   page fully readable rather than blank.
   --------------------------------------------------------- */
(function reveal(){
  if (!document.documentElement.classList.contains("js-reveal")) return;

  var items = [].slice.call(document.querySelectorAll(
    ".case, .mini, .slab, .band-head, .brick, .rows, .table-wrap, .about-big, .about-cols"
  ));
  if (!items.length) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

  items.forEach(function(el){ io.observe(el); });
})();


/* ---------------------------------------------------------
   3. COMPACT PROJECT CARDS
   The four text-card sections start as one-line summaries;
   "Show details" opens the notes and tags. Without script
   every card is simply shown in full.
   --------------------------------------------------------- */
(function compactCards(){
  var slabs = [].slice.call(document.querySelectorAll("#ai .slab, #data .slab, #security .slab, #cloud .slab"));
  slabs.forEach(function(card, i){
    var notes = card.querySelector(".notes");
    if (!notes) return;
    var id = "details-" + i;
    var extra = [notes, card.querySelector(".tags")].filter(Boolean);
    extra.forEach(function(el, j){ el.id = id + "-" + j; });

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "more";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", extra.map(function(el){ return el.id; }).join(" "));
    btn.textContent = "Show details";
    btn.addEventListener("click", function(){
      var open = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Hide details" : "Show details";
    });

    var links = card.querySelector(".case-links");
    if (links) links.insertBefore(btn, links.firstChild); else card.appendChild(btn);
    card.classList.add("is-compact");
  });
})();


/* ---------------------------------------------------------
   4. CERTIFICATIONS, COLLAPSED TO ONE LINE
   --------------------------------------------------------- */
(function certs(){
  var list = document.getElementById("cert-list");
  if (!list) return;
  var n = list.children.length;
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "more more-lg";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "cert-list");
  btn.textContent = "See all " + n + " certifications";
  list.hidden = true;
  btn.addEventListener("click", function(){
    var open = list.hidden;
    list.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Hide certifications" : "See all " + n + " certifications";
  });
  list.parentNode.insertBefore(btn, list);
})();


/* ---------------------------------------------------------
   5. FILTER THE WORK BY AREA
   Cards carry data-cat. A section with no matching card is
   hidden; sections marked data-filter-all-only (earlier
   projects, marketing) only show under "All".
   --------------------------------------------------------- */
(function filter(){
  var bar = document.getElementById("filter");
  if (!bar) return;
  var chips = [].slice.call(bar.querySelectorAll(".fchip"));
  var items = [].slice.call(document.querySelectorAll("[data-cat]"));
  var count = document.getElementById("filter-count");
  var sections = [].slice.call(document.querySelectorAll("section")).filter(function(sec){
    return sec.querySelector("[data-cat]") || sec.hasAttribute("data-filter-all-only");
  });
  bar.hidden = false;

  function apply(f){
    var shown = 0;
    items.forEach(function(el){
      var ok = f === "all" || el.getAttribute("data-cat").split(" ").indexOf(f) !== -1;
      el.hidden = !ok;
      if (ok) shown++;
    });
    sections.forEach(function(sec){
      if (sec.hasAttribute("data-filter-all-only")) { sec.hidden = f !== "all"; return; }
      sec.hidden = !sec.querySelector("[data-cat]:not([hidden])");
    });
    chips.forEach(function(c){ c.setAttribute("aria-pressed", String(c.getAttribute("data-f") === f)); });
    count.textContent = f === "all" ? "" : shown + (shown === 1 ? " project" : " projects");
    document.dispatchEvent(new CustomEvent("filterchange"));
  }
  chips.forEach(function(c){
    c.addEventListener("click", function(){ apply(c.getAttribute("data-f")); });
  });
})();


/* ---------------------------------------------------------
   6. NAV: MARK THE CURRENT SECTION, AND BACK TO TOP
   --------------------------------------------------------- */
(function navState(){
  var links = [].slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var byId = {};
  links.forEach(function(a){ byId[a.getAttribute("href").slice(1)] = a; });
  var secs = Object.keys(byId).map(function(id){ return document.getElementById(id); }).filter(Boolean);
  var toTop = document.getElementById("to-top");

  function update(){
    var line = window.innerHeight * 0.3, current = null;
    secs.forEach(function(sec){
      if (sec.hidden) return;
      if (sec.getBoundingClientRect().top <= line) current = sec.id;
    });
    // at the very bottom a short last section can never reach the line
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      var vis = secs.filter(function(sec){ return !sec.hidden; });
      if (vis.length) current = vis[vis.length - 1].id;
    }
    links.forEach(function(a){
      var on = a === byId[current];
      if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
    // keep the active link visible in the phone's scrolling nav row
    var a = byId[current];
    if (a && a.parentNode && a.closest(".nav-links").scrollWidth > a.closest(".nav-links").clientWidth) {
      var row = a.closest(".nav-links"), r = a.getBoundingClientRect(), rr = row.getBoundingClientRect();
      if (r.left < rr.left || r.right > rr.right) row.scrollLeft += r.left - rr.left - 20;
    }
    if (toTop) toTop.hidden = window.scrollY < window.innerHeight * 2;
  }
  var ticking = false;
  window.addEventListener("scroll", function(){
    if (ticking) return; ticking = true;
    window.requestAnimationFrame(function(){ ticking = false; update(); });
  }, { passive: true });
  document.addEventListener("filterchange", update);
  update();
})();
