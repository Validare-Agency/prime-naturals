// V_PRIME_MIX_30 | PDP Gift-Threshold Progress Bar (BFCM)
(function () {
  var cartCents = 0;

  // Price of the bundle currently selected in the PDP17 offer selector (not
  // yet in the cart). Shown as a light "preview" fill on top of the cart total.
  function selectedCents() {
    var radio = document.querySelector('.c-pdp17-variant .c-pdp17-row__radio:checked');
    // PDP17 is hidden for paid search visitors (Kaching bundle instead)
    if (!radio || !radio.closest('.c-pdp17-variant').offsetParent) return 0;
    var digits = (radio.getAttribute('data-pdp17-price-money') || '').replace(/[^0-9]/g, '');
    return parseInt(digits || '0', 10);
  }

  // Thresholds come from the gift products' compare-at prices, rendered by
  // snippets/c-prime-mix-30-progress-bar.liquid.
  function getThresholds(wrap) {
    return Array.prototype.map.call(wrap.querySelectorAll('.c-pmb30-milestone'), function (m) {
      return { cents: parseInt(m.dataset.threshold, 10), gift: m.dataset.gift };
    });
  }

  // Always leave this much track visible before an unreached milestone, so
  // "almost there" never looks like "reached".
  var MIN_GAP_PX = 8;

  // Milestones are evenly spaced (not proportional to price), so the fill is
  // interpolated per segment — from the previous marker's right edge to the
  // next marker's left edge. The fill only slides under a marker once its
  // threshold is actually reached.
  function fillWidth(wrap, subtotalCents) {
    var track = wrap.querySelector('.c-pmb30-track');
    var milestones = wrap.querySelectorAll('.c-pmb30-milestone');
    if (!track || !track.offsetWidth) return null;

    var points = [{ cents: 0, px: 0, r: 0 }];
    milestones.forEach(function (m) {
      var marker = m.querySelector('.c-pmb30-marker');
      points.push({
        cents: parseInt(m.dataset.threshold, 10),
        px: m.offsetLeft,
        r: marker ? marker.offsetWidth / 2 : 0
      });
    });

    var last = points[points.length - 1];
    if (subtotalCents >= last.cents) return track.offsetWidth + 'px';

    for (var i = 1; i < points.length; i++) {
      if (subtotalCents < points[i].cents) {
        var a = points[i - 1];
        var b = points[i];
        var start = a.px + a.r;
        var end = b.px - b.r - MIN_GAP_PX;
        var ratio = (subtotalCents - a.cents) / (b.cents - a.cents);
        return start + ratio * (end - start) + 'px';
      }
    }
    return null;
  }

  function updateBar() {
    var wrap = document.querySelector('.c-pmb30-wrap');
    if (!wrap) return;

    // Status + milestone states follow the projected total (cart + selection)
    var subtotalCents = cartCents + selectedCents();

    var fillEl = wrap.querySelector('.c-pmb30-fill:not(.c-pmb30-fill--preview)');
    var previewEl = wrap.querySelector('.c-pmb30-fill--preview');
    var statusEl = wrap.querySelector('.c-pmb30-status-text');
    var milestones = wrap.querySelectorAll('.c-pmb30-milestone');

    var width = fillWidth(wrap, cartCents);
    if (fillEl && width !== null) fillEl.style.width = width;
    var previewWidth = fillWidth(wrap, subtotalCents);
    if (previewEl && previewWidth !== null) previewEl.style.width = previewWidth;

    // Find next threshold not yet reached
    var thresholds = getThresholds(wrap);
    var next = null;
    for (var i = 0; i < thresholds.length; i++) {
      if (subtotalCents < thresholds[i].cents) {
        next = thresholds[i];
        break;
      }
    }

    milestones.forEach(function (m) {
      var threshold = parseInt(m.dataset.threshold, 10);
      m.classList.toggle('c-pmb30-milestone--reached', subtotalCents >= threshold);
      m.classList.toggle('c-pmb30-milestone--next', !!next && threshold === next.cents);
    });

    if (statusEl) {
      if (!next) {
        statusEl.textContent = "You've unlocked all gifts! 🎉";
      } else {
        var neededDollars = Math.ceil((next.cents - subtotalCents) / 100);
        statusEl.textContent = 'Add $' + neededDollars + ' more to unlock ' + next.gift;
      }
    }
  }

  function fetchAndUpdate() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        // Gift lines never count toward the thresholds (same rule as
        // c-prime-mix-30-gifts.js)
        cartCents = data.items.reduce(function (sum, item) {
          return item.properties && item.properties._pmb30_gift ? sum : sum + item.final_line_price;
        }, 0);
        updateBar();
      })
      .catch(function () {});
  }

  function init() {
    var wrap = document.querySelector('.c-pmb30-wrap');
    if (!wrap) return;
    // Use Liquid-rendered subtotal for instant first paint
    cartCents = parseInt(wrap.dataset.subtotal || '0', 10);
    updateBar();
    // Then fetch live data to catch any cart changes since page load
    fetchAndUpdate();

    // The bar is hidden until the Var A body class lands, and milestone
    // positions change per breakpoint — re-measure the fill whenever the
    // track's size changes.
    var track = wrap.querySelector('.c-pmb30-track');
    if (track && 'ResizeObserver' in window) {
      new ResizeObserver(updateBar).observe(track);
    } else {
      window.addEventListener('resize', updateBar);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Bundle selection moves the preview fill
  document.addEventListener('change', function (event) {
    if (event.target.closest && event.target.closest('.c-pdp17-row__radio')) updateBar();
  });

  // Gift lines were added/removed by c-prime-mix-30-gifts.js
  document.addEventListener('c-pmb30:gifts-synced', fetchAndUpdate);

  // Listen for common Shopify theme cart update events
  document.addEventListener('cart:refresh', fetchAndUpdate);
  document.addEventListener('cart:updated', fetchAndUpdate);
  document.addEventListener('cart:change', fetchAndUpdate);

  // Listen for the theme's cart-drawer open event (fires on each open)
  document.addEventListener('cartDrawerOpen', fetchAndUpdate);

  // Intercept Shopify cart POST requests to catch live add-to-cart updates
  var _xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (typeof url === 'string' && (url.indexOf('/cart/add') !== -1 || url.indexOf('/cart/change') !== -1 || url.indexOf('/cart/update') !== -1)) {
      this.addEventListener('loadend', function () {
        setTimeout(fetchAndUpdate, 300);
      });
    }
    return _xhrOpen.apply(this, arguments);
  };

  // Also catch fetch-based cart mutations
  var _fetch = window.fetch;
  window.fetch = function (input) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('/cart/add') !== -1 || url.indexOf('/cart/change') !== -1 || url.indexOf('/cart/update') !== -1) {
      return _fetch.apply(this, arguments).then(function (res) {
        setTimeout(fetchAndUpdate, 300);
        return res;
      });
    }
    return _fetch.apply(this, arguments);
  };
})();
