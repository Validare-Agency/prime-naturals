document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelectorAll('[data-sticky-cta-bar]');
  const trigger = document.querySelector('[data-sticky-cta-trigger]');
  if (!bar || !trigger) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.forEach((b) => b.classList.toggle('is-visible', scrolledPast));
    },
    { threshold: 0 }
  );

  observer.observe(trigger);
});
