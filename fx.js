/* =========================================================
   Motion layer ("after effects"). Everything here is
   decoration on top of a page that already works:
   - nothing runs for prefers-reduced-motion, except the
     scroll progress bar, which is not motion
   - pointer effects only run on a mouse/trackpad
   - if GSAP fails to load, the effects that need it are
     skipped and the intro guard in index.html reveals the
     hero after 2.5 s
   ========================================================= */
(function(){
  var root = document.documentElement;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;

  /* ---------- scroll progress bar ---------- */
  var bar = document.createElement("div");
  bar.className = "fx-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  function progress(){
    var max = root.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
  }
  addEventListener("scroll", progress, { passive: true });
  progress();

  if (still) { root.classList.remove("fx-intro"); return; }

  /* ---------- film grain + cursor spotlight ---------- */
  var grain = document.createElement("div");
  grain.className = "fx-grain";
  grain.setAttribute("aria-hidden", "true");
  document.body.appendChild(grain);

  if (fine) {
    var glow = document.createElement("div");
    glow.className = "fx-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
    var gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, gRaf = 0;
    addEventListener("pointermove", function(e){
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("on");
      if (!gRaf) gRaf = requestAnimationFrame(moveGlow);
    }, { passive: true });
    function moveGlow(){
      gRaf = 0;
      gx += (tx - gx) * 0.18; gy += (ty - gy) * 0.18;
      glow.style.transform = "translate(" + (gx - 300) + "px," + (gy - 300) + "px)";
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) gRaf = requestAnimationFrame(moveGlow);
    }
    document.addEventListener("pointerleave", function(){ glow.classList.remove("on"); });
  }

  /* ---------- 3D tilt with light glare ---------- */
  if (fine) {
    var tiltables = document.querySelectorAll(".frame, .slab, .brick, .xp-item, .cert");
    [].forEach.call(tiltables, function(el){
      var max = el.classList.contains("frame") ? 7 : 4, raf = 0, rx = 0, ry = 0, trx = 0, try_ = 0;
      el.classList.add("fx-tilt");
      el.addEventListener("pointermove", function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        try_ = (px - 0.5) * max * 2; trx = -(py - 0.5) * max * 2;
        el.style.setProperty("--mx", (px * 100) + "%");
        el.style.setProperty("--my", (py * 100) + "%");
        el.classList.add("is-tilting");
        if (!raf) raf = requestAnimationFrame(step);
      });
      el.addEventListener("pointerleave", function(){
        trx = 0; try_ = 0; el.classList.remove("is-tilting");
        if (!raf) raf = requestAnimationFrame(step);
      });
      function step(){
        raf = 0;
        rx += (trx - rx) * 0.14; ry += (try_ - ry) * 0.14;
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        if (Math.abs(trx - rx) + Math.abs(try_ - ry) > 0.02) raf = requestAnimationFrame(step);
        else if (!trx && !try_) el.style.transform = "";
      }
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine) {
    [].forEach.call(document.querySelectorAll(".btn, .fchip, .nav-gh, .more"), function(el){
      el.addEventListener("pointermove", function(e){
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22, y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function(){ el.style.transform = ""; });
    });
  }

  /* ---------- scrambled-text section labels ---------- */
  var glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#*";
  function scramble(el){
    var final = el.textContent, frame = 0, total = 22;
    (function tick(){
      var out = "";
      for (var i = 0; i < final.length; i++) {
        var settle = (i / final.length) * total;
        out += (frame >= settle || final[i] === " ") ? final[i] : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (frame++ < total) requestAnimationFrame(tick); else el.textContent = final;
    })();
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    [].forEach.call(document.querySelectorAll(".kicker"), function(k){ io.observe(k); });
  }

  /* ---------- count-up stats ---------- */
  [].forEach.call(document.querySelectorAll(".stats dd"), function(dd){
    var target = dd.querySelector(".live-n") || dd;
    var n = parseInt(target.textContent, 10);
    if (isNaN(n)) return;
    var t0 = null;
    target.textContent = "0";
    function run(ts){
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      target.textContent = String(Math.round(n * e));
      if (p < 1) requestAnimationFrame(run);
    }
    setTimeout(function(){ requestAnimationFrame(run); }, 500);
  });

  /* ---------- GSAP: hero intro + scroll parallax ---------- */
  if (!gsap) { root.classList.remove("fx-intro"); return; }
  if (ST) gsap.registerPlugin(ST);

  var hero = document.querySelectorAll(".hero-copy > *, .hero .stats > div");
  root.classList.remove("fx-intro");
  gsap.from(hero, { y: 34, opacity: 0, duration: 1.0, ease: "power3.out", stagger: 0.09, delay: 0.05, clearProps: "transform,opacity" });
  gsap.from(".hero-3d", { opacity: 0, scale: 0.92, duration: 1.6, ease: "power2.out", delay: 0.2 });

  if (!ST) return;

  // screenshots drift inside their browser frames as you scroll
  [].forEach.call(document.querySelectorAll(".shot img"), function(img){
    gsap.fromTo(img, { yPercent: -4, scale: 1.08 }, {
      yPercent: 4, scale: 1.08, ease: "none",
      scrollTrigger: { trigger: img.closest(".frame"), start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // section headlines rise and un-blur into place
  [].forEach.call(document.querySelectorAll(".band-head .h2"), function(h){
    gsap.from(h, {
      y: 40, opacity: 0, filter: "blur(8px)", duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: h, start: "top 88%" },
    });
  });

  // filtering and toggles change the page height
  document.addEventListener("filterchange", function(){ ST.refresh(); });
  document.addEventListener("click", function(e){
    if (e.target.closest && e.target.closest(".more")) setTimeout(function(){ ST.refresh(); }, 50);
  });
})();
