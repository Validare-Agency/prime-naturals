document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelector('[data-sticky-cta-bar]');
  const trigger = document.querySelector('[data-sticky-cta-trigger]');
  if (!bar || !trigger) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('is-visible', scrolledPast);
    },
    { threshold: 0 }
  );

  observer.observe(trigger);
});
