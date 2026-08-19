/* <-------------------Product gallery: prevent whitespace from mixed image aspect ratios-----------------> */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('media-gallery').forEach(function (gallery) {
    var viewer = gallery.querySelector('[id^="GalleryViewer"]');
    var row = viewer && viewer.querySelector('[id^="Slider-"]');
    if (!viewer || !row) return;

    viewer.addEventListener('slideChanged', function (event) {
      var slide = event.detail && event.detail.currentElement;
      if (!slide) return;
      row.style.height = slide.offsetHeight + 'px';
    });
  });
});

// Test: V_PRIME_PDP_20 | Product Page - USPs - ATF
(function () {
  var path = window.location.pathname.toLowerCase();
  var isOlderAgeProduct = path.indexOf('leadership') !== -1 || path.indexOf('murphy') !== -1;
  var ageBadgeText = isOlderAgeProduct ? 'Age: 8-12' : 'Age: 6-12';

  var BOOK_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SHIELD_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var AGE_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="white" stroke-width="2.2"/></svg>';

  function makeBadgesEl(modifierClass) {
    var div = document.createElement('div');
    div.className = 'c-pdp20-badges ' + modifierClass;
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML =
      '<span class="c-pdp20-badge">' + BOOK_ICON + 'Hardcover</span>' +
      '<span class="c-pdp20-badge">' + SHIELD_ICON + '30-Days Guarantee</span>' +
      '<span class="c-pdp20-badge">' + AGE_ICON + ageBadgeText + '</span>';
    return div;
  }

  function injectBadges() {
    // Var A — inserted after media-gallery (below the full thumbnail rail,
    // inside the media column on desktop; between gallery and info on mobile)
    var mediaGallery = document.querySelector('media-gallery');
    if (mediaGallery) {
      mediaGallery.after(makeBadgesEl('c-pdp20-badges--a'));
    }

    // Var B — inserted after .pib-carousel (below the review card,
    // inside the info column on both mobile and desktop)
    var carousel = document.querySelector('.pib-carousel');
    if (carousel) {
      carousel.after(makeBadgesEl('c-pdp20-badges--b'));
    }

    // Var C — inserted after the product title element
    // (.pib-title for pib-wrap templates; .product__title for standard theme blocks)
    var titleEl = document.querySelector('.pib-title') ||
      document.querySelector('.product__title');
    if (titleEl) {
      titleEl.after(makeBadgesEl('c-pdp20-badges--c'));
    }
  }

  document.addEventListener('DOMContentLoaded', injectBadges);
})();
