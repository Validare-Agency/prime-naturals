document.addEventListener('DOMContentLoaded', () => {
  const widget = document.querySelector('[data-sticky-cta-widget]');
  const triggers = document.querySelectorAll('[data-sticky-cta-bar]');
  if (!widget || !triggers.length) return;

  const visibleTriggers = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleTriggers.add(entry.target);
        } else {
          visibleTriggers.delete(entry.target);
        }
      });

      widget.classList.toggle('is-visible', visibleTriggers.size === 0);
    },
    { threshold: 0 }
  );

  triggers.forEach((trigger) => observer.observe(trigger));
});
