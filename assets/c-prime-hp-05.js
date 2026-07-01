(function () {
  'use strict';

  const SECTION_CLASS = 'c-prime-hp-05';
  const SLIDE_CLASS = SECTION_CLASS + '__slide';
  const SLIDE_ACTIVE_CLASS = SLIDE_CLASS + '--active';
  const TRACK_CLASS = SECTION_CLASS + '__track';
  const DOT_CLASS = SECTION_CLASS + '__dot';
  const DOT_ACTIVE_CLASS = DOT_CLASS + '--active';
  const ARROW_PREV_CLASS = SECTION_CLASS + '__arrow--prev';
  const ARROW_NEXT_CLASS = SECTION_CLASS + '__arrow--next';
  const BODY_VAR_A_CLASS = 'c-primeHp05VarA';

  let initialized = false;

  function init() {
    if (initialized) return;
    if (!document.body.classList.contains(BODY_VAR_A_CLASS)) return;

    const section = document.querySelector('.' + SECTION_CLASS);
    if (!section) return;

    initialized = true;
    observer.disconnect();

    const track = section.querySelector('.' + TRACK_CLASS);
    const slides = section.querySelectorAll('.' + SLIDE_CLASS);
    const dots = section.querySelectorAll('.' + DOT_CLASS);
    const prevBtn = section.querySelector('.' + ARROW_PREV_CLASS);
    const nextBtn = section.querySelector('.' + ARROW_NEXT_CLASS);

    if (!track || !slides.length) return;

    const total = slides.length;
    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();

    // ── Helpers ────────────────────────────────────────────────

    function getSlidesPerView() {
      return window.innerWidth >= 750 ? 3 : 1;
    }

    function clamp(idx) {
      // Infinite loop: wrap around
      return ((idx % total) + total) % total;
    }

    function updateTrack() {
      const slideWidth = track.parentElement.offsetWidth / slidesPerView;
      track.style.transform = 'translateX(-' + (currentIndex * slideWidth) + 'px)';
    }

    function updateDots() {
      dots.forEach(function (dot, i) {
        const isActive = i === currentIndex;
        dot.classList.toggle(DOT_ACTIVE_CLASS, isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function updateSlideAria() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle(SLIDE_ACTIVE_CLASS, i === currentIndex);
      });
    }

    function goTo(idx) {
      currentIndex = clamp(idx);
      updateTrack();
      updateDots();
      updateSlideAria();
    }

    // ── Initial render ──────────────────────────────────────────

    updateTrack();
    updateDots();
    updateSlideAria();

    // ── Arrow clicks ────────────────────────────────────────────

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(currentIndex - 1);
        fireArrowEvent();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(currentIndex + 1);
        fireArrowEvent();
      });
    }

    // ── Dot clicks ──────────────────────────────────────────────

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-index'), 10);
        if (!isNaN(idx)) goTo(idx);
      });
    });

    // ── Touch / pointer swipe ───────────────────────────────────

    let pointerStartX = null;
    const SWIPE_THRESHOLD = 40;

    track.addEventListener('pointerdown', function (e) {
      pointerStartX = e.clientX;
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointerup', function (e) {
      if (pointerStartX === null) return;
      const delta = e.clientX - pointerStartX;
      pointerStartX = null;

      if (Math.abs(delta) < SWIPE_THRESHOLD) return;

      if (delta < 0) {
        goTo(currentIndex + 1);
      } else {
        goTo(currentIndex - 1);
      }
      fireArrowEvent();
    });

    track.addEventListener('pointercancel', function () {
      pointerStartX = null;
    });

    // Prevent drag-scrolling the page while swiping the carousel
    track.addEventListener('pointermove', function (e) {
      if (pointerStartX !== null) e.preventDefault();
    }, { passive: false });

    // ── Resize: recalculate layout ──────────────────────────────

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        slidesPerView = getSlidesPerView();
        // Clamp index in case fewer slides are visible after resize
        currentIndex = clamp(currentIndex);
        updateTrack();
        updateDots();
      }, 120);
    });

    // ── IntersectionObserver: section view event ────────────────

    let sectionViewFired = false;
    if ('IntersectionObserver' in window) {
      const viewObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !sectionViewFired) {
            sectionViewFired = true;
            fireViewEvent();
            viewObserver.disconnect();
          }
        });
      }, { threshold: 0.2 });

      viewObserver.observe(section);
    }
  }

  // ── Custom event helpers ──────────────────────────────────────

  function fireViewEvent() {
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'testimonials_section_view' });
  }

  function fireArrowEvent() {
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'testimonials_arrow_click' });
  }

  // ── Boot: wait for body class then initialise ─────────────────

  const observer = new MutationObserver(function () { init(); });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('ig:ready', init);
})();
