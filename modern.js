/* Sadhanala Nischay Prasad · modern portfolio interactions */
(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = () => window.gsap && window.ScrollTrigger;

  // If the CDN scripts never arrive, show everything after a moment.
  const fallback = setTimeout(() => doc.classList.add('ready-fallback'), 2500);
  if (reduce) doc.classList.add('no-motion');

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
    history.replaceState(null, '', id);
  }));

  /* ---------------- progress + nav hide/show + active link ---------------- */
  const bar = $('.progress i'), nav = $('#nav');
  let lastY = scrollY;
  const onScroll = () => {
    const max = document.body.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const y = scrollY;
    nav.classList.toggle('hide', y > 300 && y > lastY + 4 && !document.body.classList.contains('menu-open'));
    if (y < lastY - 4 || y < 300) nav.classList.remove('hide');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav-links a[data-nav]'), pill = $('.nav-pill');
  const movePill = (a) => {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  const sectIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id === 'more' ? 'work' : en.target.id === 'marketing' ? 'about' : en.target.id;
      navLinks.forEach((a) => a.classList.toggle('on', a.dataset.nav === id));
      $$('.mnav a[data-nav]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.nav === id));
      movePill(navLinks.find((a) => a.dataset.nav === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach((s) => sectIO.observe(s));
  $('#top') && new IntersectionObserver(([en]) => { if (en.isIntersecting) { navLinks.forEach((a) => a.classList.remove('on')); movePill(null); } }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#top'));

  /* ---------------- mobile menu ---------------- */
  const burger = $('.burger'), mnav = $('#mnav');
  function closeMenu() { if (!mnav || mnav.hidden) return; mnav.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const open = mnav.hidden;
    mnav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) { lenis && lenis.stop(); hasGsap() && !reduce && gsap.from('#mnav a', { y: 30, opacity: 0, stagger: .06, duration: .5, ease: 'power3.out' }); }
    else lenis && lenis.start();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------------- custom cursor ---------------- */
  const cursor = $('.cursor');
  if (fine && !reduce && cursor) {
    const dot = $('.cur-dot'), ring = $('.cur-ring'), label = $('.cur-label');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    addEventListener('pointerdown', () => cursor.classList.add('down'));
    addEventListener('pointerup', () => cursor.classList.remove('down'));
    const tick = () => { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(tick); };
    tick();
    document.addEventListener('pointerover', (e) => {
      const card = e.target.closest('.pcard');
      const hot = e.target.closest('a, button, summary, .chips li');
      cursor.classList.toggle('label', !!card && !e.target.closest('.pcard-links a'));
      label.textContent = card ? 'View' : '';
      cursor.classList.toggle('hover', !!hot && !card);
    });
    document.addEventListener('pointerleave', () => cursor.style.opacity = 0);
    document.addEventListener('pointerenter', () => cursor.style.opacity = 1);
  }

  /* ---------------- spotlight + tilt + magnetic ---------------- */
  if (fine) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest('.pcard, [data-spot]');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }
  if (fine && !reduce) {
    $$('[data-tilt]').forEach((el) => {
      const max = +el.dataset.tiltMax || 6;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(1000px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(() => (el.style.transition = ''), 600);
      });
    });
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .25}px,${y * .35}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(() => (el.style.transition = ''), 500);
      });
    });
  }

  /* ---------------- split text ---------------- */
  $$('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="wd" aria-hidden="true">${[...w].map((c) => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
  });

  /* ---------------- typing rotator ---------------- */
  const rot = $('.rot-word');
  if (rot) {
    const words = ['full-stack web apps', 'AI that makes decisions', 'real-time systems', 'secure auth services', 'firmware for ESP32', 'data dashboards'];
    if (reduce) rot.textContent = words[0];
    else {
      let wi = 0, ci = words[0].length, del = true;
      const step = () => {
        if (del) { ci--; if (ci <= 0) { del = false; wi = (wi + 1) % words.length; } }
        else { ci++; if (ci >= words[wi].length) { del = true; rot.textContent = words[wi]; return setTimeout(step, 1800); } }
        rot.textContent = words[wi].slice(0, Math.max(ci, 0)) || '​';
        setTimeout(step, del ? 35 : 70);
      };
      setTimeout(step, 2600);
    }
  }

  /* ---------------- counters ---------------- */
  const countUp = (el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const f = (t) => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };

  /* ---------------- filters (with Flip) ---------------- */
  const fpill = $('.fpill'), fbtns = $$('.fbtn');
  const placePill = (pillEl, btn) => {
    if (!pillEl || !btn) return;
    pillEl.style.width = btn.offsetWidth + 'px';
    pillEl.style.height = btn.offsetHeight + 'px';
    pillEl.style.transform = `translate(${btn.offsetLeft}px,${btn.offsetTop}px)`;
  };
  fbtns.forEach((b) => b.addEventListener('click', () => {
    fbtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    placePill(fpill, b);
    const f = b.dataset.filter, cards = $$('.pcard');
    const state = window.Flip && !reduce ? Flip.getState(cards) : null;
    cards.forEach((c) => c.classList.toggle('is-hidden', f !== 'all' && !c.dataset.cat.split(' ').includes(f)));
    if (state) Flip.from(state, { duration: .6, ease: 'power3.inOut', scale: true, absolute: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .5 }), onLeave: (els) => gsap.to(els, { opacity: 0, scale: .9, duration: .4 }) });
    hasGsap() && ScrollTrigger.refresh();
  }));

  /* ---------------- tabs ---------------- */
  const tabs = $$('.tab'), tpill = $('.tab-pill');
  const selectTab = (t, focus) => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    placePill(tpill, t);
    if (focus) t.focus();
    const panel = $('#' + t.getAttribute('aria-controls'));
    if (hasGsap() && !reduce) gsap.fromTo(panel.querySelectorAll('.mcard, .erow'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power3.out', clearProps: 'transform' });
    else panel.querySelectorAll('[data-reveal]').forEach((n) => { n.style.opacity = 1; n.style.transform = 'none'; });
    hasGsap() && ScrollTrigger.refresh();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      const k = e.key; let n = null;
      if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === 'Home') n = tabs[0]; if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  const layoutPills = () => { placePill(fpill, $('.fbtn[aria-pressed="true"]')); placePill(tpill, $('.tab[aria-selected="true"]')); movePill($('.nav-links a.on')); };
  addEventListener('resize', layoutPills);
  document.fonts && document.fonts.ready.then(layoutPills);
  layoutPills();

  /* ---------------- modals ---------------- */
  let lastFocus = null;
  const closeModal = (m) => {
    if (reduce) { m.close(); return; }
    m.classList.add('closing');
    setTimeout(() => { m.classList.remove('closing'); m.close(); }, 260);
  };
  $$('[data-open]').forEach((btn) => btn.addEventListener('click', () => {
    const m = $('#' + btn.dataset.open);
    if (!m) return;
    lastFocus = btn;
    m.showModal();
    lenis && lenis.stop();
    if (hasGsap() && !reduce) gsap.from(m.querySelectorAll('.modal-body > *'), { y: 18, opacity: 0, stagger: .05, duration: .5, delay: .12, ease: 'power3.out' });
  }));
  $$('dialog.modal').forEach((m) => {
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
    m.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(m); });
    m.addEventListener('close', () => { lenis && lenis.start(); lastFocus && lastFocus.focus(); });
  });

  /* ---------------- tasks toggle + copy email ---------------- */
  const tt = $('.tasks-toggle');
  tt && tt.addEventListener('click', () => {
    const open = $('#tasks').classList.toggle('open');
    tt.setAttribute('aria-expanded', String(open));
    tt.textContent = open ? 'Show fewer tasks' : 'Show all tasks';
    if (open && hasGsap() && !reduce) gsap.fromTo('#tasks .task:nth-child(n+7)', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: .04, duration: .45 });
    hasGsap() && ScrollTrigger.refresh();
  });
  const toast = $('.toast');
  const showToast = (msg) => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 2200); };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); showToast('Email copied to clipboard'); }
    catch { showToast(b.dataset.copy); }
  }));

  /* ---------------- particle field ---------------- */
  const cv = $('#field');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d');
    let w, h, dpr, pts = [], mouse = { x: -999, y: -999 };
    const N = () => Math.min(90, Math.floor((w * h) / 16000));
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
      pts = Array.from({ length: N() }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr }));
    };
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    let visible = true;
    document.addEventListener('visibilitychange', () => (visible = !document.hidden));
    const link = 130 * (devicePixelRatio || 1);
    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        for (const p of pts) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy, R = 140 * dpr;
          if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (R - d) / R * .9; p.x += dx / d * f; p.y += dy / d * f; }
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
            if (d < link * link) { ctx.strokeStyle = `rgba(167,139,250,${(1 - Math.sqrt(d) / link) * .22})`; ctx.lineWidth = dpr; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
          }
          ctx.fillStyle = 'rgba(196,181,253,.55)';
          ctx.beginPath(); ctx.arc(a.x, a.y, 1.3 * dpr, 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------------- highlighter sweeps ---------------- */
  const hlIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { setTimeout(() => en.target.classList.add('on'), 250); hlIO.unobserve(en.target); }
  }), { rootMargin: '0px 0px -15% 0px' });
  $$('.hl').forEach((el) => hlIO.observe(el));

  /* ---------------- GSAP choreography ---------------- */
  const start = () => {
    clearTimeout(fallback);
    if (!hasGsap() || reduce) {
      doc.classList.add('ready-fallback');
      $$('[data-count]').forEach(countUp);
      $$('.about-big .w').forEach((w) => (w.style.opacity = 1));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    window.Flip && gsap.registerPlugin(Flip);
    if (lenis) { lenis.on('scroll', ScrollTrigger.update); }

    // hero intro
    gsap.set('[data-hero]', { opacity: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.avail', { y: 20, opacity: 0, duration: .7 }, 0)
      .from('.hero-title .ch', { yPercent: 100, opacity: 0, duration: .9, stagger: .02 }, .1)
      .from('.strike', { y: 24, opacity: 0, duration: .8, onComplete: () => $('.strike').classList.add('on') }, .7)
      .from('.lede', { y: 24, opacity: 0, duration: .8 }, .85)
      .from('.cta > *', { y: 20, opacity: 0, duration: .7, stagger: .08 }, 1)
      .from('.stats > div', { y: 16, opacity: 0, duration: .7, stagger: .08, onStart: () => $$('[data-count]').forEach(countUp) }, 1.1)
      .from('.polaroid', { y: -260, rotate: -14, opacity: 0, duration: 1.3, ease: 'bounce.out' }, .3)
      .from('.tape', { scaleX: 0, opacity: 0, duration: .5, ease: 'power2.out' }, 1.4)
      .from('.hero-note', { opacity: 0, x: -20, duration: .7 }, 1.7);

    // pen marks draw themselves when they come into view
    $$('svg.draw').forEach((svg) => {
      const paths = [...svg.querySelectorAll('path')];
      paths.forEach((p) => { const L = p.getTotalLength() + 2; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      const inHero = !!svg.closest('.hero');
      gsap.to(paths, { strokeDashoffset: 0, duration: svg.classList.contains('circle') ? 1.4 : .9, ease: 'power2.inOut', stagger: .35,
        delay: inHero ? (svg.closest('.hero-note') ? 2 : 1.2) : 0,
        scrollTrigger: inHero ? undefined : { trigger: svg, start: 'top 85%' } });
    });

    // hero parallax on scroll
    gsap.to('.hero-visual', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy', { yPercent: 8, opacity: .25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // generic reveals, batched per section
    // IntersectionObserver is reliable even after long jumps (nav links, Home/End keys)
    let queue = [], qTimer = 0;
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { queue.push(en.target); revealIO.unobserve(en.target); } });
      clearTimeout(qTimer);
      qTimer = setTimeout(() => { gsap.to(queue, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: 'power3.out', overwrite: true }); queue = []; }, 30);
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach((el) => revealIO.observe(el));

    // marquee driven by scroll velocity
    $$('.mq').forEach((m) => {
      const track = m.querySelector('.mq-track'), dir = +m.dataset.dir;
      let x = 0, speed = 0.6;
      gsap.ticker.add(() => {
        const half = track.scrollWidth / 2;
        x -= speed * dir;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        track.style.transform = `translateX(${x}px)`;
        speed += (0.6 - speed) * 0.05;
      });
      ScrollTrigger.create({ onUpdate: (s) => { speed = 0.6 + Math.min(Math.abs(s.getVelocity()) / 400, 8); } });
    });

    // timeline line draws as you scroll
    gsap.to('.tl-line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    $$('.xp').forEach((x) => gsap.from(x.querySelector('.xp-node'), { scale: 0, duration: .5, ease: 'back.out(3)', scrollTrigger: { trigger: x, start: 'top 75%' } }));

    // about: words light up while scrolling
    const words = $$('.about-big .w');
    if (words.length) gsap.to(words, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.about-big', start: 'top 80%', end: 'bottom 45%', scrub: true } });

    // contact heading
    gsap.fromTo('.contact-big', { yPercent: 30, scale: .85, opacity: 0, filter: 'blur(12px)' }, { yPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power4.out', scrollTrigger: { trigger: '.contact', start: 'top 75%' } });

    // project shots parallax inside cards
    $$('.pcard-shot img, .crumb-shot img').forEach((img) => gsap.fromTo(img, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.closest('.pcard, .crumb'), start: 'top bottom', end: 'bottom top', scrub: true } }));

    layoutPills();
    ScrollTrigger.refresh();
  };
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
})();
