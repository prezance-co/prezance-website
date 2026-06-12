export function initCore() {
  /* Capability detection — effects degrade gracefully */
  const isTouch = window.matchMedia("(hover: none)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger, ...(window.ScrollToPlugin ? [ScrollToPlugin] : []), ...(window.SplitText ? [SplitText] : []));

  /* Nav background on scroll */
  const navEl = document.getElementById("nav");
  const onScroll = () => navEl.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ───── Lenis smooth scroll + GSAP wiring ───── */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis; // exposed for the Codrops smoother bridge below
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  document.querySelectorAll('nav a[href^="#"], .hero a[href^="#"], .contact-cta a[href^="#"], footer a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: 0 });
      else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ───── Starfield (stars built in JS, twinkle via CSS) ───── */
  const starfield = document.querySelector(".starfield");
  if (starfield) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 250; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.style.left = (Math.random() * 100).toFixed(2) + "%";
      s.style.top = (Math.random() * 100).toFixed(2) + "%";
      // size tiers: 60% @1.5px, 30% @2px, 10% @3px — larger ones glow
      const r = Math.random();
      const sz = r < 0.6 ? 1.5 : r < 0.9 ? 2 : 3;
      s.style.setProperty("--sz", sz + "px");
      if (sz >= 2) s.style.setProperty("--glow", "0 0 3px rgba(255,255,255,0.8)");
      s.style.setProperty("--o", (0.3 + Math.random() * 0.5).toFixed(2));      // opacity 0.3–0.8
      s.style.setProperty("--d", (2 + Math.random() * 3).toFixed(2) + "s");    // twinkle 2–5s
      s.style.setProperty("--dl", (Math.random() * 5).toFixed(2) + "s");       // random phase
      frag.appendChild(s);
    }
    starfield.appendChild(frag);
  }

  /* ───── Section fade-ups + inner reveals + process slide-ins ───── */
  if (reduced) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  } else if (hasGSAP) {
    gsap.utils.toArray(".section").forEach((sec) => {
      gsap.from(sec, {
        opacity: 0, y: 60, duration: 0.8,
        scrollTrigger: { trigger: sec, start: "top 80%", once: true }
      });
    });
    ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      once: true,
      onEnter: (els) => els.forEach((el) => el.classList.add("in"))
    });
    gsap.utils.toArray(".step").forEach((row) => {
      gsap.from(row, {
        x: -60, opacity: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 85%", once: true }
      });
    });
  } else {
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));
  }

  /* SplitText word reveals on section headings (after fonts so metrics are right) */
  function splitHeadings() {
    if (!hasGSAP || !window.SplitText || reduced) return;
    document.querySelectorAll(".section-head h2, .contact-band h2").forEach((h) => {
      try {
        const split = new SplitText(h, { type: "words", wordsClass: "word" });
        gsap.from(split.words, {
          opacity: 0, y: 40, duration: 0.7, ease: "power3.out", stagger: 0.05,
          scrollTrigger: { trigger: h, start: "top 85%", once: true }
        });
      } catch (e) { /* heading stays visible un-split */ }
    });
  }

  /* ───── Three.js PREZANCE particle watermark (full-width canvas, bottom-left text) ───── */
  const heroEl = document.querySelector(".hero");
  const pCanvas = document.getElementById("particle-canvas");
  function initParticles() {
    if (!window.THREE) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: pCanvas, alpha: true, antialias: false });
    } catch (e) {
      pCanvas.style.display = "none";
      console.warn("particle hero unavailable:", e);
      return;
    }
    const COUNT = isTouch ? 3500 : 8000;
    const scene = new THREE.Scene();
    let W = pCanvas.clientWidth, H = pCanvas.clientHeight; // canvas spans the full hero
    const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 10);
    camera.position.z = 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);

    // sample "PREZANCE" pixels from an offscreen 2D canvas — large dim watermark,
    // bottom-left. Layout-aware: always sits ≥120px below the CTA buttons so the
    // headline never overlaps it (shrinks gracefully on short viewports).
    function sampleText() {
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const ctx = off.getContext("2d");
      const GAP = 120;          // min clear space between buttons and PREZANCE
      const capRatio = 0.72;    // cap height as a fraction of font size
      const heroRect = heroEl.getBoundingClientRect();
      const cta = heroEl.querySelector(".hero-cta");
      const ctaBottom = cta ? (cta.getBoundingClientRect().bottom - heroRect.top) : H * 0.45;
      const bottomMargin = H * 0.05;                       // keep off the very bottom edge
      const avail = H - bottomMargin - (ctaBottom + GAP);  // vertical room for the watermark band
      const fs = Math.min(W / 5.2, 220, avail / capRatio);
      if (fs < 48) return [];                              // too short to read as a watermark — skip cleanly
      const capTop = ctaBottom + GAP;                      // top of the letters
      const baselineY = capTop + fs * capRatio;            // alphabetic baseline
      ctx.fillStyle = "#fff";
      ctx.font = `700 ${fs}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("PREZANCE", W * 0.5, baselineY);
      const data = ctx.getImageData(0, 0, W, H).data;
      const pts = [];
      const step = 2;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 128) pts.push([x - W / 2, -(y - H / 2)]);
        }
      }
      return pts;
    }

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const targets = new Float32Array(COUNT * 2);
    const scatter = new Float32Array(COUNT * 2);
    const phase = new Float32Array(COUNT);

    function assignTargets() {
      const pts = sampleText();
      if (!pts.length) return;
      for (let i = 0; i < COUNT; i++) {
        const p = pts[(Math.random() * pts.length) | 0];
        targets[i * 2] = p[0] + (Math.random() - 0.5) * 1.5;
        targets[i * 2 + 1] = p[1] + (Math.random() - 0.5) * 1.5;
      }
    }
    for (let i = 0; i < COUNT; i++) {
      scatter[i * 2] = (Math.random() - 0.5) * W * 1.2;
      scatter[i * 2 + 1] = (Math.random() - 0.5) * H * 1.2;
      positions[i * 3] = scatter[i * 2];
      positions[i * 3 + 1] = scatter[i * 2 + 1];
      positions[i * 3 + 2] = 0;
      phase[i] = Math.random() * Math.PI * 2;
      const b = 0xaa / 255; // grey #aaaaaa watermark
      colors[i * 3] = b; colors[i * 3 + 1] = b; colors[i * 3 + 2] = b;
    }
    assignTargets();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.45, // grey watermark — headline (z3) reads on top
      depthTest: false,
      blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(geo, mat));

    let mx = 1e9, my = 1e9;
    if (!isTouch) {
      heroEl.addEventListener("pointermove", (e) => {
        const r = pCanvas.getBoundingClientRect();
        mx = e.clientX - r.left - W / 2;
        my = -(e.clientY - r.top - H / 2);
      }, { passive: true });
      heroEl.addEventListener("pointerleave", () => { mx = 1e9; my = 1e9; });
    }

    const assembleStart = performance.now() + 300;
    const DURATION = 2500;
    let heroVisible = true;
    new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; }).observe(heroEl);

    function frame(now) {
      requestAnimationFrame(frame);
      if (!heroVisible) return;
      let t = Math.min(Math.max((now - assembleStart) / DURATION, 0), 1);
      t = 1 - Math.pow(1 - t, 3);
      if (reduced) t = 1;
      const time = now * 0.0012;
      const arr = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        const tx = targets[i * 2], ty = targets[i * 2 + 1];
        let bx = scatter[i * 2] + (tx - scatter[i * 2]) * t;
        let by = scatter[i * 2 + 1] + (ty - scatter[i * 2 + 1]) * t;
        if (!reduced) {
          bx += Math.sin(time + phase[i]) * 3 * t;
          by += Math.cos(time * 1.3 + phase[i]) * 3 * t;
        }
        const dx = bx - mx, dy = by - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 6400 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (80 - d) / 80;
          bx += (dx / d) * f * 42;
          by += (dy / d) * f * 42;
        }
        arr[i * 3] += (bx - arr[i * 3]) * 0.16;
        arr[i * 3 + 1] += (by - arr[i * 3 + 1]) * 0.16;
      }
      geo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    let rsT;
    window.addEventListener("resize", () => {
      clearTimeout(rsT);
      rsT = setTimeout(() => {
        W = pCanvas.clientWidth; H = pCanvas.clientHeight;
        camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H, false);
        assignTargets();
      }, 200);
    });
  }

  /* Clean headline entrance: words fade in + slide up on load (no chromatic split) */
  function animateHeadline() {
    const h1 = document.getElementById("hero-headline");
    if (!h1) return;
    if (reduced || !hasGSAP || !window.SplitText) return; // headline stays visible as-is
    try {
      const split = new SplitText(h1, { type: "words", wordsClass: "hword" });
      gsap.from(split.words, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.15
      });
    } catch (e) { /* SplitText failed — headline stays visible un-split */ }
  }

  /* ───── Cursor spotlight / text swap / magnetic (kept per FIX 4) ───── */
  if (!isTouch) {
    const spot = document.getElementById("spotlight");
    const label = document.getElementById("cursor-label");
    /* exact-match map: ONLY these three element kinds get a label */
    const cursorMap = [
      [".template-card", "Explore →"],
      [".cta-button", "Start →"],
      [".process-step", "Read →"]
    ];
    const magnets = [...document.querySelectorAll(".cta-button")].map((b) => ({
      el: b,
      qx: hasGSAP ? gsap.quickTo(b, "x", { duration: 0.3, ease: "power3" }) : null,
      qy: hasGSAP ? gsap.quickTo(b, "y", { duration: 0.3, ease: "power3" }) : null,
      pulled: false
    }));

    window.addEventListener("mousemove", (e) => {
      spot.style.background = `radial-gradient(circle 300px at ${e.clientX}px ${e.clientY}px, rgba(255,255,255,0.08), transparent)`;
      spot.classList.add("on");

      label.style.left = e.clientX + "px";
      label.style.top = e.clientY + "px";
      let text = null;
      if (e.target instanceof Element) {
        for (const [sel, txt] of cursorMap) {
          if (e.target.closest(sel)) { text = txt; break; }
        }
      }
      if (text) { label.textContent = text; label.classList.add("on"); }
      else label.classList.remove("on");

      if (!reduced && hasGSAP) {
        magnets.forEach((m) => {
          const r = m.el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const ex = Math.max(Math.abs(dx) - r.width / 2, 0);
          const ey = Math.max(Math.abs(dy) - r.height / 2, 0);
          const d = Math.hypot(ex, ey);
          if (d < 60) {
            m.qx(dx * 0.3 * (1 - d / 60));
            m.qy(dy * 0.3 * (1 - d / 60));
            m.pulled = true;
          } else if (m.pulled) {
            m.qx(0); m.qy(0); m.pulled = false;
          }
        });
      }
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => {
      spot.classList.remove("on");
      label.classList.remove("on");
      magnets.forEach((m) => { if (m.pulled) { m.qx && m.qx(0); m.qy && m.qy(0); m.pulled = false; } });
    });
  }

  /* ───── Stats counters (0.8s, once) ───── */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const to = parseInt(el.dataset.to, 10);
      countObs.unobserve(el);
      if (reduced) { el.textContent = to; return; }
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 800, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * to).toString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".count").forEach((c) => countObs.observe(c));

  /* boot non-carousel pieces after fonts */
  function boot() {
    splitHeadings();
    animateHeadline();
    initParticles();
  }
  if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(boot);
  else boot();
}
