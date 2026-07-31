// Test: V_PRIME_PDP_12 | Gallery Image Size + Thumbnail Scroll Affordance
(function () {
  var started = false;

  // media-gallery.js's setActiveThumbnail() auto-scrolls the thumbnail strip to the active
  // thumbnail (via scrollTo) once the main viewer's initial slideChanged settles (debounced
  // 500ms, and can re-fire as images finish loading/resizing). That erases the left
  // scroll-affordance gap on load. Our own body-class assignment is itself gated behind
  // Intelligems' "ig:ready" event, which can fire well after that auto-scroll already
  // happened — so we can't just react to it, we correct immediately on detection AND keep
  // watching/re-correcting for a short window afterward, then get out of the way entirely so
  // later thumbnail clicks scroll normally.
  function resetScroll(list) {
    list.scrollLeft = 0;
  }

  function guard(lists) {
    lists.forEach(resetScroll);

    var observer = new MutationObserver(function () {
      lists.forEach(resetScroll);
    });
    lists.forEach(function (list) {
      observer.observe(list, { attributes: true, attributeFilter: ['aria-current'], subtree: true });
    });

    [100, 400, 900, 1500].forEach(function (delay) {
      setTimeout(function () {
        lists.forEach(resetScroll);
      }, delay);
    });

    setTimeout(function () {
      observer.disconnect();
    }, 2000);
  }

  // SliderComponent.update() disables the "next" button as soon as the LAST real thumbnail
  // <li> is fully in view (isSlideVisible), with no awareness of the trailing scroll-affordance
  // padding/spacer that lives after it. That greys the arrow out before the strip has actually
  // scrolled all the way to its right edge. Correct it for as long as the page lives: whenever
  // "disabled" gets set but we're not truly at the scroll end, take it back off.
  function fixNextDisabled(list) {
    var slider = list.closest('.thumbnail-slider');
    var nextBtn = slider && slider.querySelector('.slider-button--next');
    if (!nextBtn) return;

    function atEnd() {
      return list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
    }

    function correct() {
      if (nextBtn.hasAttribute('disabled') && !atEnd()) {
        nextBtn.removeAttribute('disabled');
      }
    }

    new MutationObserver(correct).observe(nextBtn, { attributes: true, attributeFilter: ['disabled'] });
    list.addEventListener('scroll', correct);
    correct();
  }

  function tryInit() {
    if (started || !document.body.classList.contains('c-primePdp12VarA')) return;
    var lists = document.querySelectorAll('media-gallery .thumbnail-slider .thumbnail-list.slider');
    if (!lists.length) return;
    started = true;
    guard(lists);
    lists.forEach(fixNextDisabled);
  }

  document.addEventListener('DOMContentLoaded', tryInit);
  window.addEventListener('ig:ready', tryInit);
  new MutationObserver(tryInit).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
