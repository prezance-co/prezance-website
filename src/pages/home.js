// Home page logic — orchestrates the three concern modules ported from the
// original inline <script> blocks. Runs once; the home layer is never re-created.

import { initCore } from './home/core.js';
import { initProximity } from './home/proximity.js';
import { initCarousel } from './home/carousel.js';

export function initHome() {
  initCore();       // registers GSAP plugins; Lenis, scroll/nav, particles, cursor, stats
  initProximity();  // industries proximity grid
  initCarousel();   // 3D ring carousel (cards link to routes via [data-route])
}
