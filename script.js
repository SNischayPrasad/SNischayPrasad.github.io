/* =========================================================
   Portfolio behaviour
   1. Optional profile links (LinkedIn, resume)
   2. Hero signature: the board — cursor tilt, component focus
   3. Scroll reveal
   ========================================================= */

/* ---------------------------------------------------------
   1. PROFILE LINKS

   Fill these in and the buttons appear on the contact panel.
   Leave a value empty and no element is created at all, so the
   live site can never show a dead link.
   --------------------------------------------------------- */
var PROFILE = {
  linkedin: "https://www.linkedin.com/in/sadhanala-nischay-prasad-0b0978389/",
  resume:   ""                  // e.g. "assets/Nischay-Prasad-Resume.pdf"
};

(function profileLinks(){
  var host = document.getElementById("contact-actions");
  if (!host) return;

  function add(url, label, opts){
    if (!url) return;                       // nothing rendered when unset
    var a = document.createElement("a");
    a.className = "btn btn-ghost";
    a.href = url;
    a.textContent = label;
    if (opts && opts.external){
      a.target = "_blank";
      a.rel = "noopener";
      var c = document.createElement("span");
      c.setAttribute("aria-hidden", "true");
      c.textContent = " ↗";
      a.appendChild(c);
    }
    if (opts && opts.download) a.setAttribute("download", opts.download);
    host.appendChild(a);
  }

  add(PROFILE.linkedin, "LinkedIn", { external:true });
  add(PROFILE.resume,   "Download resume", { download:"Nischay-Prasad-Resume.pdf" });
})();


/* ---------------------------------------------------------
   2. THE BOARD

   The hero is a PCB carrying the parts these projects actually
   run on. It tilts toward the pointer, each component lifts in Z
   and lights the traces that feed it, and the readout says which
   build the part belongs to. Clicking jumps to that project.
   --------------------------------------------------------- */
(function board(){
  var stage = document.getElementById("stage");
  var board = document.getElementById("board");
  if (!stage || !board) return;

  var comps    = [].slice.call(board.querySelectorAll(".comp"));
  var traces   = [].slice.call(board.querySelectorAll(".trace"));
  var hint     = document.getElementById("ro-hint");
  var roBody   = document.getElementById("ro-body");
  var roName   = document.getElementById("ro-name");
  var roRole   = document.getElementById("ro-role");
  var roProj   = document.getElementById("ro-projects");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* -- readout ------------------------------------------------ */
  function activate(el){
    comps.forEach(function(c){ c.classList.toggle("is-active", c === el); });

    var key = el ? el.id.replace("c-", "") : null;
    traces.forEach(function(t){
      t.classList.toggle("is-hot", !!key && t.getAttribute("data-for") === key);
    });

    if (!el){
      roBody.hidden = true;
      hint.hidden = false;
      return;
    }
    roName.textContent = el.getAttribute("data-name");
    roRole.textContent = el.getAttribute("data-role");
    roProj.textContent = el.getAttribute("data-projects");
    hint.hidden = true;
    roBody.hidden = false;
  }

  comps.forEach(function(c){
    c.addEventListener("mouseenter", function(){ activate(c); });
    c.addEventListener("focus",      function(){ activate(c); });
    c.addEventListener("mouseleave", function(){ activate(null); });
    c.addEventListener("blur",       function(){ activate(null); });
    c.addEventListener("click", function(){
      var sel = c.getAttribute("data-target");
      var target = sel && document.querySelector(sel);
      if (target) target.scrollIntoView({ behavior: still.matches ? "auto" : "smooth", block:"center" });
    });
  });

  /* -- cursor tilt -------------------------------------------- */
  var REST_X = 16, REST_Y = -16;      // the angle it sits at untouched
  var SWING  = 13;                    // degrees of travel either way
  var tx = REST_X, ty = REST_Y;       // target
  var cx = REST_X, cy = REST_Y;       // current
  var raf = null, engaged = false;

  function apply(){
    board.style.transform = "rotateX(" + cx.toFixed(2) + "deg) rotateY(" + cy.toFixed(2) + "deg)";
  }

  function tick(){
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    apply();
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05){
      raf = requestAnimationFrame(tick);
    } else {
      cx = tx; cy = ty; apply();
      raf = null;
    }
  }

  function nudge(){
    if (raf === null) raf = requestAnimationFrame(tick);
  }

  // A pointer that reports no hover (touch) should not drive the tilt.
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  function onMove(e){
    if (still.matches || !canHover.matches) return;
    var r = stage.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 .. 0.5
    var py = (e.clientY - r.top)  / r.height - 0.5;
    tx = REST_X - py * SWING * 2;
    ty = REST_Y + px * SWING * 2;
    engaged = true;
    nudge();
  }

  function onLeave(){
    if (!engaged) return;
    tx = REST_X; ty = REST_Y;
    engaged = false;
    nudge();
  }

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);

  apply();
})();


/* ---------------------------------------------------------
   3. SCROLL REVEAL
   Classes are added by script, so the page stays fully
   visible when JavaScript does not run.
   --------------------------------------------------------- */
(function reveal(){
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (still.matches || !("IntersectionObserver" in window)) return;

  var targets = document.querySelectorAll(".band-head, .card, .table-wrap, .stack-col, .about-body, .contact, .stats");
  targets.forEach(function(el){ el.classList.add("rise"); });

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin:"0px 0px -60px 0px", threshold:0.06 });

  targets.forEach(function(el){ io.observe(el); });
})();
