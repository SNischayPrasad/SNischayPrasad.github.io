/* =========================================================
   Crimson theme extras
   - drifting red embers + soft glow orbs behind the page
   Skipped for reduced motion; paused in background tabs.
   ========================================================= */
(function(){
  var c = document.getElementById("embers");
  if (!c) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { c.remove(); return; }
  var ctx = c.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 1.5), W, H, parts = [], orbs = [];
  function size(){
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(90, W * H / 16000));
    parts = []; for (var i = 0; i < n; i++) parts.push(spawn(true));
    orbs = [0, 1].map(function(k){ return { x: W * (k ? .78 : .2), y: H * (k ? .3 : .75), r: Math.max(W, H) * .32, t: Math.random() * 6 }; });
  }
  function spawn(any){
    return { x: Math.random() * W, y: any ? Math.random() * H : H + 10, r: .6 + Math.random() * 2.2,
             vy: -(.12 + Math.random() * .45), vx: (Math.random() - .5) * .18, a: .25 + Math.random() * .6, f: Math.random() * 6 };
  }
  var lastY = scrollY, drift = 0;
  addEventListener("scroll", function(){ drift += (scrollY - lastY) * .04; lastY = scrollY; }, { passive: true });
  addEventListener("resize", size);
  size();
  (function frame(t){
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      orbs.forEach(function(o, k){
        o.t += .004;
        var x = o.x + Math.sin(o.t + k * 2) * W * .06, y = o.y + Math.cos(o.t * .8 + k) * H * .05;
        var g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
        g.addColorStop(0, "rgba(220,20,45,.13)"); g.addColorStop(1, "rgba(220,20,45,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
      drift *= .9;
      parts.forEach(function(p, i){
        p.y += p.vy - drift; p.x += p.vx + Math.sin(t / 1400 + p.f) * .15;
        if (p.y < -10 || p.y > H + 20) parts[i] = spawn(false);
        var tw = .6 + .4 * Math.sin(t / 500 + p.f);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = "rgba(255," + (50 + (p.f * 12 | 0)) + ",60," + (p.a * tw).toFixed(3) + ")";
        ctx.shadowColor = "rgba(255,40,60,.9)"; ctx.shadowBlur = 8 * p.r;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(frame);
  })(performance.now());
})();
