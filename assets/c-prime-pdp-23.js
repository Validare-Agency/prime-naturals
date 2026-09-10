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

    var images = section.querySelectorAll('.c-pdp23-slide-img');
    var copies = section.querySelectorAll('.c-pdp23-slide-copy');
    var dots   = section.querySelectorAll('.c-pdp23-dot');
    var count  = section.querySelector('.c-pdp23-count-current');

    if (images.length === 0 || copies.length === 0) return;

    // Clamp index with wrapping
    idx = ((idx % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;

    // Deactivate current
    images[currentSlide].classList.remove('c-pdp23-slide-img--active');
    images[currentSlide].setAttribute('aria-hidden', 'true');
    copies[currentSlide].classList.remove('c-pdp23-slide-copy--active');
    copies[currentSlide].setAttribute('aria-hidden', 'true');
    dots[currentSlide].classList.remove('c-pdp23-dot--active');
    dots[currentSlide].setAttribute('aria-selected', 'false');

    // Activate new
    currentSlide = idx;
    images[currentSlide].classList.add('c-pdp23-slide-img--active');
    images[currentSlide].setAttribute('aria-hidden', 'false');
    copies[currentSlide].classList.add('c-pdp23-slide-copy--active');
    copies[currentSlide].setAttribute('aria-hidden', 'false');
    dots[currentSlide].classList.add('c-pdp23-dot--active');
    dots[currentSlide].setAttribute('aria-selected', 'true');

    if (count) {
      count.textContent = currentSlide + 1;
    }
  }

  function init(section) {
    if (!section || section.dataset.pdp23Bound === 'true') return;
    section.dataset.pdp23Bound = 'true';
    currentSlide = 0;

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

  function initFromDocument() {
    init(getSection());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFromDocument);
  } else {
    initFromDocument();
  }

  // Theme editor re-renders this section via AJAX on every setting change,
  // which swaps in fresh markup without re-running <script> tags — rebind then.
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector
      ? event.target.querySelector('#c-pdp23-whats-inside')
      : null;
    if (section) init(section);
  });
})();
