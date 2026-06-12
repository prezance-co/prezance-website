// Kinetic-typography page transitions (inspired by Codrops' KineticTypePageTransition).
//
// The home layer (#app) is a persistent singleton — never destroyed — so its scroll
// position and live effects survive a round trip. A preview layer (template/demo iframe)
// is mounted on top; a transient, top-most "kinetic" layer renders the exploding /
// converging characters of the template name over the swap.
//
// Forward (Home → Preview): the name SplitText-explodes outward (scale + rotate + blur +
//   fade, staggered from centre, ~600ms) while the iframe loads behind an opaque backdrop,
//   then the characters contract inward and fade out (~300ms) as the preview slides in.
// Back (Preview → Home): the preview fades out fast, "PREZANCE" flies in from scattered
//   positions and converges to centre, then dissolves as the home page resumes.
//
// Everything is GSAP-timeline driven (no setTimeout chains) and interruptible: a new
// navigation kills the in-flight timeline and reverses.

import { createPreview } from './pages/template.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsapOf = () => window.gsap;
const home = () => document.getElementById('app');
const BRAND = 'PREZANCE';

let overlay = null;     // the preview layer (iframe + back bar)
let activeTl = null;    // the in-flight GSAP timeline
let savedScroll = 0;

export function previewOpen() {
  return overlay !== null;
}

// Kill any in-flight timeline and tear down stray kinetic layers so a new transition
// can start from a clean slate (the interruptible / reverse requirement).
function interrupt() {
  if (activeTl) { activeTl.kill(); activeTl = null; }
  document.querySelectorAll('.kinetic-layer').forEach((n) => n.remove());
}

// Build a top-most layer holding an opaque backdrop + the SplitText characters of `text`.
// Each character gets a precomputed radial offset (dx/dy) pointing away from screen centre,
// used for the explosion / scatter vectors.
function buildKinetic(text) {
  const layer = document.createElement('div');
  layer.className = 'kinetic-layer';
  const bg = document.createElement('div');
  bg.className = 'kinetic-bg';
  const textEl = document.createElement('div');
  textEl.className = 'kinetic-text';
  textEl.textContent = text;
  layer.appendChild(bg);
  layer.appendChild(textEl);
  document.body.appendChild(layer);

  const split = new window.SplitText(textEl, { type: 'chars', charsClass: 'kchar' });
  const chars = split.chars;

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const reach = Math.max(window.innerWidth, window.innerHeight) * 0.55;
  chars.forEach((ch) => {
    const r = ch.getBoundingClientRect();
    let vx = (r.left + r.width / 2) - cx;
    let vy = (r.top + r.height / 2) - cy;
    let len = Math.hypot(vx, vy);
    if (len < 1) { const a = Math.random() * Math.PI * 2; vx = Math.cos(a); vy = Math.sin(a); len = 1; }
    const d = reach * (0.7 + Math.random() * 0.5);
    ch.dataset.dx = ((vx / len) * d).toFixed(1);
    ch.dataset.dy = ((vy / len) * d).toFixed(1);
  });

  return { layer, bg, chars };
}

function lockHome() {
  if (window.__lenis) window.__lenis.stop();
  document.body.classList.add('preview-open');
  home().style.pointerEvents = 'none';
}

function restoreHome() {
  const gsap = gsapOf();
  if (gsap) gsap.set(home(), { clearProps: 'all' });
  home().style.pointerEvents = '';
  document.body.classList.remove('preview-open');
  if (window.__lenis) {
    window.__lenis.start();
    window.__lenis.scrollTo(savedScroll, { immediate: true });
  } else {
    window.scrollTo(0, savedScroll);
  }
}

export async function openPreview(view, animate) {
  const firstOpen = overlay === null;
  interrupt();
  const gsap = gsapOf();

  if (firstOpen) savedScroll = window.scrollY;
  lockHome();

  // (Re)create the preview overlay now — the iframe begins loading immediately,
  // in the background, while the characters explode.
  if (overlay) overlay.remove();
  overlay = createPreview(view);
  document.body.appendChild(overlay);

  // Instant (initial deep link, or GSAP unavailable).
  if (!gsap || !animate) {
    if (gsap) gsap.set(overlay, { clearProps: 'all' });
    return;
  }

  const kinetic = !reduce && !!window.SplitText;

  // Reduced motion / no SplitText → simple 200ms opacity crossfade.
  if (!kinetic) {
    gsap.set(overlay, { autoAlpha: 0 });
    activeTl = gsap.timeline({ onComplete: () => { activeTl = null; } });
    activeTl.to(overlay, { autoAlpha: 1, duration: 0.2, ease: 'none' });
    await activeTl.then();
    return;
  }

  // Kinetic explode-out.
  const k = buildKinetic(view.title || '');
  gsap.set(overlay, { yPercent: 6, autoAlpha: 1 });          // ready underneath the backdrop
  gsap.set(k.bg, { autoAlpha: 1 });
  gsap.set(k.chars, { transformOrigin: '50% 50%', filter: 'blur(0px)' });

  activeTl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => { k.layer.remove(); gsap.set(overlay, { clearProps: 'transform' }); activeTl = null; }
  });
  // explode outward (~600ms) — scale up, rotate, blur, fade, staggered from centre
  activeTl.to(k.chars, {
    duration: 0.6,
    x: (i, t) => +t.dataset.dx,
    y: (i, t) => +t.dataset.dy,
    scale: 2.4,
    rotation: () => gsap.utils.random(-140, 140),
    filter: 'blur(14px)',
    opacity: 0.55,
    ease: 'power2.out',
    stagger: { each: 0.025, from: 'center' }
  }, 0);
  // contract inward + fade out completely (~300ms)
  activeTl.to(k.chars, {
    duration: 0.3,
    x: 0, y: 0,
    scale: 0.05,
    filter: 'blur(22px)',
    opacity: 0,
    ease: 'power2.in',
    stagger: { each: 0.012, from: 'edges' }
  }, 0.6);
  // preview slides in from underneath as the backdrop dissolves
  activeTl.to(overlay, { duration: 0.45, yPercent: 0, ease: 'power3.out' }, 0.62);
  activeTl.to(k.bg, { duration: 0.4, autoAlpha: 0, ease: 'power2.inOut' }, 0.62);

  await activeTl.then();
}

export async function closePreview(animate) {
  interrupt();
  if (!overlay) return;
  const gsap = gsapOf();

  const finish = () => {
    if (overlay) overlay.remove();
    overlay = null;
    restoreHome();
  };

  // Instant.
  if (!gsap || !animate) { finish(); return; }

  const kinetic = !reduce && !!window.SplitText;

  // Reduced motion / no SplitText → simple 200ms opacity crossfade.
  if (!kinetic) {
    activeTl = gsap.timeline({ onComplete: () => { activeTl = null; finish(); } });
    activeTl.to(overlay, { autoAlpha: 0, duration: 0.2, ease: 'none' });
    await activeTl.then();
    return;
  }

  // Kinetic type-in of the brand, then dissolve into home.
  const k = buildKinetic(BRAND);
  gsap.set(k.bg, { autoAlpha: 0 });
  gsap.set(k.chars, {
    transformOrigin: '50% 50%',
    x: (i, t) => +t.dataset.dx,
    y: (i, t) => +t.dataset.dy,
    scale: () => gsap.utils.random(0.3, 2.2),
    rotation: () => gsap.utils.random(-160, 160),
    filter: 'blur(16px)',
    opacity: 0
  });

  activeTl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => { k.layer.remove(); activeTl = null; finish(); }
  });
  // preview fades out quickly while the backdrop covers
  activeTl.to(overlay, { duration: 0.25, autoAlpha: 0, ease: 'power2.in' }, 0)
          .to(k.bg, { duration: 0.25, autoAlpha: 1, ease: 'power2.out' }, 0);
  // characters fly in from scatter and converge to centre
  activeTl.to(k.chars, {
    duration: 0.5,
    x: 0, y: 0,
    scale: 1,
    rotation: 0,
    filter: 'blur(0px)',
    opacity: 1,
    ease: 'power3.out',
    stagger: { each: 0.03, from: 'random' }
  }, 0.12);
  // characters dissolve as the backdrop reveals the resumed home page
  activeTl.to(k.chars, {
    duration: 0.3,
    scale: 1.6,
    filter: 'blur(20px)',
    opacity: 0,
    ease: 'power2.in',
    stagger: { each: 0.015, from: 'center' }
  }, 0.62);
  activeTl.to(k.bg, { duration: 0.32, autoAlpha: 0, ease: 'power2.inOut' }, 0.66);

  await activeTl.then();
}
