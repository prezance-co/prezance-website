export function initProximity() {
  const stage = document.getElementById('proxStage');
  const cards = gsap.utils.toArray('.prox-card');
  let radius = 220;
  let maxScale = 1.35;
  let dur = 0.4;

  stage.addEventListener('mousemove', (e) => {
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const d = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2)
      );
      const p = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, radius, 1, 0, d));
      gsap.to(card, {
        scale: 1 + (maxScale - 1) * p,
        duration: dur,
        overwrite: true,
        ease: 'power2.out'
      });
    });
  });

  stage.addEventListener('mouseleave', () => {
    cards.forEach((card) => {
      gsap.to(card, { scale: 1, duration: 0.6, ease: 'power2.out', overwrite: true });
    });
  });
}
