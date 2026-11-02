/* =========================================================
   Hero 3D scene: the nine live projects as a ring of
   screenshots floating in a particle field.

   - turns slowly on its own, leans toward the pointer
   - drag to spin it (with inertia); click a screenshot to
     jump to that project on the page
   - pauses when off-screen or in a background tab
   - static (no motion) for prefers-reduced-motion
   - if WebGL or the CDN is unavailable the stage is removed
     and the hero is simply text, as before
   ========================================================= */
import * as THREE from "three";

const PROJECTS = [
  ["commons", "Commons", "#p-commons"],
  ["civicpulse", "CivicPulse", "#p-civicpulse"],
  ["transmission", "Transmission", "#p-transmission"],
  ["steelaccessdoors", "Steel Access Doors", "#p-steel"],
  ["secureauth", "Credential", "#p-credential"],
  ["splitupi", "SplitUPI", "#p-splitupi"],
  ["dustbin", "Smart Dustbin", "#dustbin"],
  ["tally", "Tally", "#p-tally"],
  ["crumbandco", "Crumb & Co.", "#p-crumb"],
];

function init() {
  const stage = document.getElementById("hero-3d");
  const canvas = document.getElementById("hero3d");
  const tip = document.getElementById("hero3d-tip");
  if (!stage || !canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    stage.remove();
    return;
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const small = () => stage.clientWidth < 620;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0b, 11, 22);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0.9, 13.5);
  camera.lookAt(0, 0.2, 0);

  /* ---------- the ring ---------- */
  const ring = new THREE.Group();
  ring.rotation.x = 0.16;
  scene.add(ring);

  const W = 2.7, H = W * 9 / 16, R = 4.6;
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const cards = [];

  PROJECTS.forEach(([file, name, href], i) => {
    const a = (i / PROJECTS.length) * Math.PI * 2;
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    g.rotation.y = a;

    const mat = new THREE.MeshBasicMaterial({ color: 0x1a1a1d, side: THREE.DoubleSide, transparent: true });
    loader.load(`assets/shots/${file}-800.webp`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      mat.map = tex;
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
    plane.userData = { name, href };

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(W * 1.012, H * 1.02)),
      new THREE.LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.0 })
    );
    edge.position.z = 0.002;

    g.add(plane, edge);
    ring.add(g);
    cards.push({ g, plane, mat, edge, hover: 0 });
  });

  /* ---------- particles ---------- */
  const count = small() ? 420 : 1100;
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const green = new THREE.Color(0x4ade80), white = new THREE.Color(0xd9d9d4);
  for (let i = 0; i < count; i++) {
    const r = 6 + Math.random() * 9, t = Math.random() * Math.PI * 2, u = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(u) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.cos(u) * 0.6;
    pos[i * 3 + 2] = r * Math.sin(u) * Math.sin(t);
    const c = Math.random() < 0.18 ? green : white;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pgeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const dots = new THREE.Points(pgeo, new THREE.PointsMaterial({
    size: 0.045, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true,
  }));
  scene.add(dots);

  /* ---------- sizing ---------- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = small() ? 12.5 : 13.5;
    camera.lookAt(0, 0.2, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* ---------- interaction ---------- */
  const pointer = new THREE.Vector2(9, 9);   // off-canvas until it moves
  let lean = { x: 0, y: 0 }, leanTarget = { x: 0, y: 0 };
  let spin = 0, velocity = 0, dragging = false, dragMoved = 0, lastX = 0;
  const raycaster = new THREE.Raycaster();
  let hovered = null;

  function toLocal(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }
  canvas.addEventListener("pointermove", (e) => {
    toLocal(e);
    leanTarget.x = pointer.y * 0.12;
    leanTarget.y = pointer.x * 0.25;
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragMoved += Math.abs(dx);
      velocity = dx * 0.0045;
      spin += velocity;
    }
    if (!still) requestFrame();
  });
  canvas.addEventListener("pointerleave", () => { pointer.set(9, 9); leanTarget.x = leanTarget.y = 0; setHover(null); });
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; dragMoved = 0; lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointerup", (e) => {
    dragging = false;
    canvas.releasePointerCapture(e.pointerId);
    if (dragMoved < 6) {               // a click, not a drag
      toLocal(e);
      const hit = pick();
      if (hit) {
        const el = document.querySelector(hit.plane.userData.href);
        if (el) el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
      }
    }
  });

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(cards.map((c) => c.plane), false);
    if (!hits.length) return null;
    const card = cards.find((c) => c.plane === hits[0].object);
    // only the side facing the viewer is clickable
    return facing(card) > 0.15 ? card : null;
  }
  const tmp = new THREE.Vector3(), camDir = new THREE.Vector3();
  function facing(card) {
    card.plane.getWorldDirection(tmp);
    camDir.copy(camera.position).sub(card.g.getWorldPosition(new THREE.Vector3())).normalize();
    return tmp.dot(camDir);
  }
  function setHover(card) {
    if (hovered === card) return;
    hovered = card;
    canvas.style.cursor = card ? "pointer" : "grab";
    if (tip) {
      tip.textContent = card ? card.plane.userData.name + "  →" : "";
      tip.classList.toggle("on", !!card);
    }
  }

  /* ---------- scroll: ring rises and fades as the hero leaves ---------- */
  let scrollT = 0;
  addEventListener("scroll", () => {
    const r = stage.getBoundingClientRect();
    scrollT = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    if (!still) requestFrame();
  }, { passive: true });

  /* ---------- loop ---------- */
  let visible = true, raf = 0, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestFrame(); }).observe(stage);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) requestFrame(); });

  function requestFrame() { if (!raf) raf = requestAnimationFrame(frame); }

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (!still) {
      if (!dragging) { velocity *= 0.95; spin += velocity + dt * 0.12; }
      lean.x += (leanTarget.x - lean.x) * 0.06;
      lean.y += (leanTarget.y - lean.y) * 0.06;
      dots.rotation.y += dt * 0.02;
    }
    ring.rotation.y = spin + lean.y;
    ring.rotation.x = 0.16 + lean.x + scrollT * 0.35;
    ring.position.y = 0.35 + scrollT * 2.2;
    dots.rotation.x = lean.x * 0.5;
    stage.style.opacity = String(1 - scrollT * 0.9);

    if (finePointer && !dragging) setHover(pick()); else if (dragging) setHover(null);

    cards.forEach((c) => {
      const f = facing(c);
      c.mat.opacity = 0.18 + 0.82 * Math.max(0, f);
      c.hover += ((c === hovered ? 1 : 0) - c.hover) * 0.15;
      const s = 1 + c.hover * 0.07;
      c.g.scale.set(s, s, s);
      c.edge.material.opacity = c.hover * 0.9;
    });

    renderer.render(scene, camera);
    const settling = Math.abs(velocity) > 1e-4 || Math.abs(leanTarget.x - lean.x) > 1e-3 || Math.abs(leanTarget.y - lean.y) > 1e-3;
    if (visible && !document.hidden && (!still || settling)) requestFrame();
  }

  canvas.style.cursor = "grab";
  stage.classList.add("ready");
  requestFrame();
  // textures arrive after the first frame; draw again once they do
  THREE.DefaultLoadingManager.onLoad = () => requestFrame();
}

try { init(); } catch (e) { const s = document.getElementById("hero-3d"); if (s) s.remove(); }
