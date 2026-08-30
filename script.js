/* =========================================================
   Portfolio behaviour
   1. Optional profile links (resume)
   2. Scroll reveal for the glass panels
   ========================================================= */

/* ---------------------------------------------------------
   1. PROFILE LINKS

   Fill in a path and the button appears in the contact
   panel. Leave it empty and no element is created at all,
   so the live site can never show a dead link.
   --------------------------------------------------------- */
var PROFILE = {
  resume: ""                    // e.g. "assets/Nischay-Prasad-Resume.pdf"
};

(function profileLinks(){
  var host = document.getElementById("contact-actions");
  if (!host) return;

  if (!PROFILE.resume) return;  // nothing rendered when unset

  var a = document.createElement("a");
  a.className = "btn btn-glass";
  a.href = PROFILE.resume;
  a.textContent = "Download resume";
  a.setAttribute("download", "Nischay-Prasad-Resume.pdf");
  host.appendChild(a);
})();


/* ---------------------------------------------------------
   2. SCROLL REVEAL

   Panels start faded and lift into place as they enter the
   viewport.

   The faded state lives behind the .js-reveal class, which
   index.html adds only when IntersectionObserver exists and
   the visitor has not asked for reduced motion. Everywhere
   else the panels are simply visible, so content is never
   left hidden behind an animation that did not run.
   --------------------------------------------------------- */
(function reveal(){
  /* index.html sets .js-reveal only when the hidden state is safe to apply.
     Without it the panels are already visible and there is nothing to do. */
  if (!document.documentElement.classList.contains("js-reveal")) return;

  var items = [].slice.call(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

  items.forEach(function(el){ io.observe(el); });
})();
