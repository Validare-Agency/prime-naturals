// V_PRIME_MIX_30 | PDP Gift-Threshold Progress Bar (BFCM)
(function () {
  var currentCents = 0;

  // Thresholds come from the gift products' compare-at prices, rendered by
  // snippets/c-prime-mix-30-progress-bar.liquid.
  function getThresholds(wrap) {
    return Array.prototype.map.call(wrap.querySelectorAll('.c-pmb30-milestone'), function (m) {
      return { cents: parseInt(m.dataset.threshold, 10), gift: m.dataset.gift };
    });
  }

  // Milestones are evenly spaced (not proportional to price), so the fill is
  // interpolated between each milestone's center on the track.
  function fillWidth(wrap, subtotalCents) {
    var track = wrap.querySelector('.c-pmb30-track');
    var milestones = wrap.querySelectorAll('.c-pmb30-milestone');
    if (!track || !track.offsetWidth) return null;

    var points = [{ cents: 0, px: 0 }];
    milestones.forEach(function (m) {
      points.push({ cents: parseInt(m.dataset.threshold, 10), px: m.offsetLeft });
    });

    var last = points[points.length - 1];
    if (subtotalCents >= last.cents) return track.offsetWidth + 'px';

    for (var i = 1; i < points.length; i++) {
      if (subtotalCents < points[i].cents) {
        var a = points[i - 1];
        var b = points[i];
        var ratio = (subtotalCents - a.cents) / (b.cents - a.cents);
        return a.px + ratio * (b.px - a.px) + 'px';
      }
    }
    return null;
  }

  function updateBar(subtotalCents) {
    var wrap = document.querySelector('.c-pmb30-wrap');
    if (!wrap) return;
    currentCents = subtotalCents;

    var fillEl = wrap.querySelector('.c-pmb30-fill');
    var statusEl = wrap.querySelector('.c-pmb30-status-text');
    var milestones = wrap.querySelectorAll('.c-pmb30-milestone');

    var width = fillWidth(wrap, subtotalCents);
    if (fillEl && width !== null) fillEl.style.width = width;

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
      .then(function (data) { updateBar(data.items_subtotal_price); })
      .catch(function () {});
  }

  function init() {
    var wrap = document.querySelector('.c-pmb30-wrap');
    if (!wrap) return;
    // Use Liquid-rendered subtotal for instant first paint
    updateBar(parseInt(wrap.dataset.subtotal || '0', 10));
    // Then fetch live data to catch any cart changes since page load
    fetchAndUpdate();

    // The bar is hidden until the Var A body class lands, and milestone
    // positions change per breakpoint — re-measure the fill whenever the
    // track's size changes.
    var track = wrap.querySelector('.c-pmb30-track');
    if (track && 'ResizeObserver' in window) {
      new ResizeObserver(function () { updateBar(currentCents); }).observe(track);
    } else {
      window.addEventListener('resize', function () { updateBar(currentCents); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

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
