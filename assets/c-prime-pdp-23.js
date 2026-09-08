// V_PRIME_PDP_23 | PDP 'What's inside' section: chapter map + Q&A

(function () {
  'use strict';

  var SLIDE_COUNT = 3;
  var currentSlide = 0;

  function getSection() {
    return document.getElementById('c-pdp23-whats-inside');
  }

  function goToSlide(idx) {
    var section = getSection();
    if (!section) return;

    var slides = section.querySelectorAll('.c-pdp23-slide');
    var dots   = section.querySelectorAll('.c-pdp23-dot');

    if (slides.length === 0) return;

    // Clamp index with wrapping
    idx = ((idx % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;

    // Deactivate current
    slides[currentSlide].classList.remove('c-pdp23-slide--active');
    slides[currentSlide].setAttribute('aria-hidden', 'true');
    dots[currentSlide].classList.remove('c-pdp23-dot--active');
    dots[currentSlide].setAttribute('aria-selected', 'false');

    // Activate new
    currentSlide = idx;
    slides[currentSlide].classList.add('c-pdp23-slide--active');
    slides[currentSlide].setAttribute('aria-hidden', 'false');
    dots[currentSlide].classList.add('c-pdp23-dot--active');
    dots[currentSlide].setAttribute('aria-selected', 'true');
  }

  function init() {
    var section = getSection();
    if (!section) return;

    // Arrow clicks
    var prevBtn = section.querySelector('.c-pdp23-arrow--prev');
    var nextBtn = section.querySelector('.c-pdp23-arrow--next');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentSlide - 1);
        window.igEvents = window.igEvents || [];
        window.igEvents.push({ event: 'sample_question_arrow_click' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentSlide + 1);
        window.igEvents = window.igEvents || [];
        window.igEvents.push({ event: 'sample_question_arrow_click' });
      });
    }

    // Dot clicks
    var dots = section.querySelectorAll('.c-pdp23-dot');
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-idx'), 10);
        if (!isNaN(idx) && idx !== currentSlide) {
          goToSlide(idx);
        }
      });
    });

    // Scroll-reach tracking via IntersectionObserver
    if (typeof IntersectionObserver !== 'undefined') {
      var viewFired = false;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !viewFired) {
            viewFired = true;
            window.igEvents = window.igEvents || [];
            window.igEvents.push({ event: 'whats_inside_view' });
            observer.disconnect();
          }
        });
      }, { threshold: 0.2 });

      observer.observe(section);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
