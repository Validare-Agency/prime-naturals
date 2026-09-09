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

// V_PRIME_PDP_20 | Product Page - USPs - ATF
// Badge markup is rendered server-side by snippets/pdp20-badges.liquid;
// this only draws the dashed border SVG to match each badge's live box size.
(function () {
  function sizeOneBadgeBorder(badge) {
    var svg = badge.querySelector('.badge-border');
    var rect = svg && svg.querySelector('rect');
    if (!svg || !rect) return;
    var w = badge.offsetWidth;
    var h = badge.offsetHeight;
    if (!w || !h) return;
    var outerRadius = parseFloat(getComputedStyle(badge).borderRadius) || 0;
    var innerRadius = Math.max(0, outerRadius - 0.5);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    rect.setAttribute('width', w - 1);
    rect.setAttribute('height', h - 1);
    rect.setAttribute('rx', innerRadius);
    rect.setAttribute('ry', innerRadius);
  }

  function sizeBadgeBorders() {
    document.querySelectorAll('.c-pdp20-badge').forEach(sizeOneBadgeBorder);
  }

  // Re-measures a badge the instant its rendered box size changes for any
  // reason a one-time DOMContentLoaded/resize measurement would miss.
  var badgeResizeObserver = (typeof ResizeObserver !== 'undefined')
    ? new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        sizeOneBadgeBorder(entry.target);
      });
    })
    : null;

  function initBadgeBorders() {
    if (badgeResizeObserver) {
      document.querySelectorAll('.c-pdp20-badge').forEach(function (badge) {
        badgeResizeObserver.observe(badge);
      });
    }
    sizeBadgeBorders();
  }

  document.addEventListener('DOMContentLoaded', initBadgeBorders);
  window.addEventListener('resize', sizeBadgeBorders);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sizeBadgeBorders);
  }
})();
