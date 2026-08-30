/* =========================================================
   Portfolio behaviour
   1. Optional profile links (LinkedIn, resume)
   2. Hero signature: HC-SR04 trigger/echo scope
   3. Scroll reveal
   ========================================================= */

/* ---------------------------------------------------------
   1. PROFILE LINKS

   Fill these in and the buttons appear on the contact panel.
   Leave a value as an empty string and its button stays hidden,
   so the live site never shows a dead link.
   --------------------------------------------------------- */
var PROFILE = {
  linkedin: "",                 // e.g. "https://www.linkedin.com/in/your-handle/"
  resume:   ""                  // e.g. "assets/Nischay-Prasad-Resume.pdf"
};

(function applyProfileLinks(){
  var map = [
    ["link-linkedin", PROFILE.linkedin, null],
    ["link-resume",   PROFILE.resume,   "Nischay-Prasad-Resume.pdf"]
  ];
  map.forEach(function(entry){
    var el = document.getElementById(entry[0]);
    if (!el || !entry[1]) return;
    el.href = entry[1];
    if (entry[2]) el.setAttribute("download", entry[2]);
    el.hidden = false;
  });
})();


/* ---------------------------------------------------------
   2. SCOPE

   An HC-SR04 fires a 10 us trigger pulse, then holds ECHO high
   for the round-trip flight time of the burst. Distance follows
   from the speed of sound:

       t_ms = 2 * d_cm / 34300 * 1000  =>  d_cm = t_ms * 17.15

   The scenarios below are the actual decision points in the
   Smart Parking and Smart Dustbin firmware.
   --------------------------------------------------------- */

(function scope(){
  var svg = document.querySelector(".scope-svg");
  if (!svg) return;

  var trig  = document.getElementById("trace-trig");
  var echo  = document.getElementById("trace-echo");
  var bar   = document.getElementById("tof-bar");
  var barTx = document.getElementById("tof-text");
  var vDist = document.getElementById("v-dist");
  var vTof  = document.getElementById("v-tof");
  var vState= document.getElementById("v-state");
  var vLed  = document.getElementById("v-led");

  // plot geometry, in viewBox units
  var X0 = 52, X1 = 408;            // horizontal extent of the traces
  var SPAN_MS = 10;                 // full-width timebase
  var PX_PER_MS = (X1 - X0) / SPAN_MS;
  var TRIG_BASE = 44,  TRIG_HIGH = 20;
  var ECHO_BASE = 116, ECHO_HIGH = 88;
  var TRIG_W = 6;                   // 10 us is sub-pixel here; drawn at a legible minimum
  var GAP    = 5;                   // burst-to-echo lead-in

  var SOUND = 17.15;                // cm per ms of echo width

  // Targets the trace sweeps between.
  var SCENARIOS = [142.0, 29.8, 18.4, 4.2];

  // Thresholds, read against whatever the trace currently shows — so the verdict
  // flips mid-sweep at the crossing point, exactly as the firmware does.
  var BANDS = [
    { min: 60, state: "slot free",       led: "" },
    { min: 25, state: "slot occupied",   led: "is-warn" },
    { min: 10, state: "hand · lid open", led: "" },
    { min:  0, state: "bin full · alert",led: "is-alert" }
  ];

  function bandFor(d){
    for (var b = 0; b < BANDS.length; b++){
      if (d >= BANDS[b].min) return BANDS[b];
    }
    return BANDS[BANDS.length - 1];
  }

  function draw(d){
    var tof = d / SOUND;                        // ms
    var e0  = X0 + TRIG_W + GAP;
    var e1  = Math.min(e0 + tof * PX_PER_MS, X1 - 4);

    trig.setAttribute("d",
      "M" + X0 + "," + TRIG_BASE +
      "V" + TRIG_HIGH +
      "H" + (X0 + TRIG_W) +
      "V" + TRIG_BASE +
      "H" + X1);

    echo.setAttribute("d",
      "M" + X0 + "," + ECHO_BASE +
      "H" + e0 +
      "V" + ECHO_HIGH +
      "H" + e1.toFixed(1) +
      "V" + ECHO_BASE +
      "H" + X1);

    // measurement bracket under the echo pulse
    bar.setAttribute("d",
      "M" + e0 + ",134V146M" + e0 + ",140H" + e1.toFixed(1) +
      "M" + e1.toFixed(1) + ",134V146");
    barTx.setAttribute("x", ((e0 + e1) / 2).toFixed(1));
    barTx.textContent = tof.toFixed(2) + " ms";

    vDist.textContent = d.toFixed(1);
    vTof.textContent  = tof.toFixed(2);

    var band = bandFor(d);
    if (vState.textContent !== band.state){
      vState.textContent = band.state;
      vLed.className = "led " + band.led;
    }
  }

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (still.matches) {
    draw(SCENARIOS[1]);
    return;
  }

  var HOLD = 2200, SWEEP = 900;
  var i = 0, from = SCENARIOS[0], to = SCENARIOS[0], t0 = 0, phase = "hold";

  draw(from);

  function easeInOut(x){
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function frame(now){
    if (!t0) t0 = now;
    var dt = now - t0;

    if (phase === "hold") {
      if (dt >= HOLD) {
        i = (i + 1) % SCENARIOS.length;
        from = to;
        to = SCENARIOS[i];
        phase = "sweep";
        t0 = now;
      }
    } else {
      var p = Math.min(dt / SWEEP, 1);
      draw(from + (to - from) * easeInOut(p));
      if (p === 1) { phase = "hold"; t0 = now; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
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
  }, { rootMargin: "0px 0px -60px 0px", threshold: 0.06 });

  targets.forEach(function(el){ io.observe(el); });
})();
