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
