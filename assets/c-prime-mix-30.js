// V_PRIME_MIX_30 | PDP Gift-Threshold Progress Bar (BFCM)
(function () {
  var THRESHOLDS = [
    { cents: 5900, gift: 'free stickers' },
    { cents: 7900, gift: 'free sticker puzzle' },
    { cents: 9900, gift: 'free gift card 20$' },
    { cents: 14900, gift: 'free mystery book', giftDesktop: 'free mystery Gift' }
  ];
  var MAX_CENTS = 14900;

  function updateBar(subtotalCents) {
    var wrap = document.querySelector('.c-pmb30-wrap');
    if (!wrap) return;

    var fillEl = wrap.querySelector('.c-pmb30-fill');
    var statusEl = wrap.querySelector('.c-pmb30-status-text');
    var markers = wrap.querySelectorAll('.c-pmb30-marker');

    // Update fill width
    var pct = Math.min((subtotalCents / MAX_CENTS) * 100, 100);
    if (fillEl) fillEl.style.width = pct + '%';

    // Update marker states
    markers.forEach(function (m) {
      var threshold = parseInt(m.dataset.threshold, 10);
      m.classList.remove('c-pmb30-marker--reached', 'c-pmb30-marker--next');
      if (subtotalCents >= threshold) {
        m.classList.add('c-pmb30-marker--reached');
      }
    });

    // Find next threshold not yet reached
    var next = null;
    for (var i = 0; i < THRESHOLDS.length; i++) {
      if (subtotalCents < THRESHOLDS[i].cents) {
        next = THRESHOLDS[i];
        break;
      }
    }

    // Mark the next milestone
    if (next) {
      var nextMarker = wrap.querySelector('.c-pmb30-marker[data-threshold="' + next.cents + '"]');
      if (nextMarker) nextMarker.classList.add('c-pmb30-marker--next');
    }

    // Update status text
    if (statusEl) {
      if (!next) {
        statusEl.textContent = "You've unlocked all gifts! 🎉";
      } else {
        var neededCents = next.cents - subtotalCents;
        var neededDollars = Math.ceil(neededCents / 100);
        var isDesktop = window.innerWidth >= 750;
        var giftLabel = (isDesktop && next.giftDesktop) ? next.giftDesktop : next.gift;
        statusEl.textContent = 'Add $' + neededDollars + ' more to unlock ' + giftLabel;
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
    var initialCents = parseInt(wrap.dataset.subtotal || '0', 10);
    updateBar(initialCents);
    // Then fetch live data to catch any cart changes since page load
    fetchAndUpdate();
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
