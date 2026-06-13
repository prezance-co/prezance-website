import { MANIFEST, CAT_LABEL, routeFor } from '../../manifest.js';

export function initCarousel() {
  const drag = document.getElementById('carousel-drag');
  if (!drag) return;
  const carousel = drag.closest('.carousel');
  const scene = drag.closest('.scene');
  const filtersBar = document.getElementById('template-filters');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!window.gsap;

  // MANIFEST · CAT_LABEL · routeFor are imported from ../../manifest.js

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // Card face background: the template thumbnail layered over its gradient, so the
  // gradient shows through while the image loads or if it 404s. Falls back to the
  // bare gradient for entries without a thumb.
  const faceImg = (t) => {
    const grad = `linear-gradient(150deg, ${t.a}, ${t.b})`;
    return t.thumb ? `url('/${t.thumb}'), ${grad}` : grad;
  };
  const cardHTML = (t) => {
    const label = esc(t.label), cat = esc(CAT_LABEL[t.category] || t.category);
    const lbl = `<div class="card__label"><div class="name">${label}</div><div class="cat">${cat}</div></div>`;
    const route = esc(routeFor(t));
    return `<div class="carousel__cell">
      <div class="card template-card" style="--img: ${faceImg(t)}">
        <div class="card__face card__face--front" data-route="${route}" role="link" aria-label="Explore ${label}">
          <button class="card__explore" type="button" data-route="${route}">Explore →</button>
          ${lbl}
        </div>
        <div class="card__face card__face--back">${lbl}</div>
      </div>
    </div>`;
  };

  const isNarrow = () => window.matchMedia('(max-width: 560px)').matches;
  function radiusFor(n) {
    const cardW = isNarrow() ? 200 : 280;
    const gap = isNarrow() ? 20 : 36;
    const minR = isNarrow() ? 260 : 380;
    if (n <= 1) return minR;
    return Math.max(minR, Math.round((cardW / 2 + gap) / Math.tan(Math.PI / n)));
  }

  let cells = [];
  let dragRot = 0;
  let dragging = false, lastX = 0;

  function setRot(el, deg) {
    if (hasGSAP) gsap.set(el, { rotationY: deg });
    else el.style.transform = `rotateY(${deg}deg)`;
  }

  function layout() {
    const n = cells.length;
    if (!n) return;
    const radius = radiusFor(n);
    const step = 360 / n;
    cells.forEach((cell, i) => {
      cell.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
    });
    // base depth so the front-facing card sits near the camera plane
    const baseZ = -(radius - 40);
    if (hasGSAP) gsap.set(carousel, { z: baseZ, rotationX: 0, rotationY: 0, rotationZ: 0 });
    else carousel.style.transform = `translateZ(${baseZ}px) rotateY(0deg)`;
    setRot(drag, dragRot);
  }

  // Hovering a card pops it flat and stable so the orbiting 3D card is an easy
  // click target. Auto-rotation is already paused while the pointer is in the
  // scene (see the auto-rotate block below), so the card stays put.
  function bindHover() {
    drag.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-focused');
        if (hasGSAP) gsap.to(card, { rotationZ: 0, scale: 1.05, duration: 0.3, ease: 'power2.out', overwrite: true });
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-focused');
        if (hasGSAP) gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: true });
      });
    });
  }

  function render(filter, animate) {
    const subset = MANIFEST.filter((t) => filter === 'all' || t.category === filter);
    const doSwap = () => {
      drag.innerHTML = subset.map(cardHTML).join('');
      cells = Array.from(drag.querySelectorAll('.carousel__cell'));
      layout();
      bindHover();
      if (animate && hasGSAP && !reduced) {
        gsap.fromTo(cells, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.03 });
      }
    };
    if (animate && hasGSAP && !reduced && cells.length) {
      gsap.to(drag, { autoAlpha: 0, duration: 0.25, ease: 'power1.in', onComplete: () => { gsap.set(drag, { autoAlpha: 1 }); doSwap(); } });
    } else {
      doSwap();
    }
  }

  // Explore → navigate to the template/demo route (handled by the global router
  // click delegation via [data-route]); just keep the drag from hijacking the press.
  drag.addEventListener('pointerdown', (e) => { if (e.target.closest('[data-route]')) e.stopPropagation(); });

  // Category filter pills
  if (filtersBar) {
    filtersBar.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      filtersBar.querySelectorAll('.filter-pill').forEach((p) => { p.classList.remove('active'); p.setAttribute('aria-selected', 'false'); });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      render(pill.dataset.filter, true);
    });
  }

  // Drag-to-rotate on the orbit layer. NOTE: scroll / wheel is NOT captured
  // anywhere — the page scrolls completely normally over the carousel. The orbit
  // rotates on its own (auto-rotate below) and can be nudged by dragging.
  scene.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-route]')) return; // let the link handle its own click
    dragging = true; lastX = e.clientX; scene.classList.add('grabbing');
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    dragRot += dx * 0.35;
    setRot(drag, dragRot);
  }, { passive: true });
  window.addEventListener('pointerup', () => { dragging = false; scene.classList.remove('grabbing'); });

  // Gentle continuous auto-rotation. Pauses while the pointer is over the scene
  // (so cards stay readable/clickable) and while dragging. No scroll capture, so
  // vertical page scrolling is never intercepted — fixes the scroll-jump bug.
  let hovering = false;
  scene.addEventListener('mouseenter', () => { hovering = true; });
  scene.addEventListener('mouseleave', () => { hovering = false; });
  function autoTick() {
    if (!hovering && !dragging) {
      dragRot += 0.12;
      setRot(drag, dragRot);
    }
    requestAnimationFrame(autoTick);
  }
  if (!reduced) requestAnimationFrame(autoTick);

  let rsT;
  window.addEventListener('resize', () => {
    clearTimeout(rsT);
    rsT = setTimeout(layout, 200);
  });

  // initial render — All (no transition)
  render('all', false);
}
