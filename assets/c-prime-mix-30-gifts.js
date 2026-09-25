// V_PRIME_MIX_30 | PDP Gift-Threshold Progress Bar (BFCM) — cart gift sync
//
// Keeps the free gift lines in the cart matching the cart total: every gift
// whose threshold the (non-gift) subtotal clears is added once, anything it
// no longer clears is removed. Loaded sitewide from sections/cart-drawer.liquid,
// which also renders window.primeMix30Gifts (variant ids + thresholds from the
// gift products' compare-at prices).
//
// Only Var A ever receives gifts. Holdout / Control / other visitors get any
// stray gift line removed — but only once c-intelligems-tests.js has actually
// decided the visitor's bucket (c-validareHoldout / c-validareOptimized), so a
// slow Intelligems load never strips a Var A shopper's gifts.
(function () {
  if (window.primeMix30GiftsInit) return;
  window.primeMix30GiftsInit = true;

  var GIFT_PROP = '_pmb30_gift';

  // Captured before this file patches fetch below, so our own cart requests
  // never re-trigger a sync.
  var rawFetch = window.fetch.bind(window);

  function gifts() {
    return (window.primeMix30Gifts || []).filter(function (g) { return g && g.id; });
  }

  function bucketDecided() {
    var cl = document.body.classList;
    return cl.contains('c-validareHoldout') || cl.contains('c-validareOptimized');
  }

  function variantActive() {
    var cl = document.body.classList;
    return cl.contains('c-primeMix30VarA') && !cl.contains('c-validareHoldout');
  }

  function isGiftLine(item) {
    return !!(item.properties && item.properties[GIFT_PROP]);
  }

  // Cart total the thresholds are measured against — gift lines never count
  // toward unlocking other gifts.
  function eligibleSubtotal(cart) {
    return cart.items.reduce(function (sum, item) {
      return isGiftLine(item) ? sum : sum + item.final_line_price;
    }, 0);
  }
  window.primeMix30EligibleSubtotal = eligibleSubtotal;

  function fetchCart() {
    return rawFetch(window.routes.cart_url + '.js').then(function (r) { return r.json(); });
  }

  function cartChange(key, quantity) {
    return rawFetch(window.routes.cart_change_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    });
  }

  function cartAdd(items) {
    return rawFetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    });
  }

  function diffGifts(cart) {
    var active = variantActive();
    var subtotal = eligibleSubtotal(cart);
    var changes = [];
    var adds = [];

    gifts().forEach(function (gift) {
      // Most gifts are $0 products; free-gift-card-20 is priced $99 and made
      // free by a Shopify automatic discount at a $99+ cart — which is also
      // its threshold here, so it's only ever added when that discount applies.
      var justified = active && gift.available && subtotal >= gift.threshold;
      var lines = cart.items.filter(function (item) {
        return isGiftLine(item) && item.variant_id === gift.id;
      });

      if (!justified) {
        lines.forEach(function (line) { changes.push({ key: line.key, quantity: 0 }); });
        return;
      }
      if (!lines.length) {
        adds.push({ id: gift.id, quantity: 1, properties: { _pmb30_gift: 'true' } });
        return;
      }
      // Exactly one line, quantity 1
      lines.forEach(function (line, i) {
        var want = i === 0 ? 1 : 0;
        if (line.quantity !== want) changes.push({ key: line.key, quantity: want });
      });
    });

    return { changes: changes, adds: adds };
  }

  // --- Cart UI refresh (same fetch+swap technique as c-prime-pdp-35.js) ---
  function refreshCartDrawer() {
    return rawFetch(window.routes.cart_url + '?section_id=cart-drawer')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-drawer');
        var live = document.querySelector('cart-drawer');
        if (!fresh || !live) return;
        var wasActive = live.classList.contains('active');
        live.replaceWith(fresh);
        if (wasActive) fresh.classList.add('active');
      });
  }

  // The cart-icon-bubble section only renders the icon's inner markup
  function refreshCartIconBubble() {
    return rawFetch(window.routes.cart_url + '?section_id=cart-icon-bubble')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('.shopify-section');
        var live = document.getElementById('cart-icon-bubble');
        if (fresh && live) live.innerHTML = fresh.innerHTML;
      });
  }

  // Cart page sections are template-scoped — their real section id is on
  // data-id (sections/main-cart-items.liquid, main-cart-footer.liquid).
  function refreshCartPageSection(elementId) {
    var live = document.getElementById(elementId);
    if (!live || !live.dataset.id) return Promise.resolve();
    return rawFetch(window.routes.cart_url + '?section_id=' + live.dataset.id)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html').getElementById(elementId);
        var current = document.getElementById(elementId);
        if (fresh && current) current.replaceWith(fresh);
      });
  }

  function refreshCartUI() {
    return Promise.all([
      refreshCartDrawer(),
      refreshCartIconBubble(),
      refreshCartPageSection('main-cart-items'),
      refreshCartPageSection('main-cart-footer')
    ]);
  }

  function setCheckoutDisabled(disabled) {
    ['checkout', 'CartDrawer-Checkout'].forEach(function (id) {
      var button = document.getElementById(id);
      if (button) button.disabled = disabled;
    });
  }

  // --- Sync loop: one run at a time; requests during a run queue one rerun ---
  var running = false;
  var queued = false;

  function sync() {
    if (!bucketDecided()) return;
    if (running) { queued = true; return; }
    running = true;

    fetchCart()
      .then(function (cart) {
        var diff = diffGifts(cart);
        if (!diff.changes.length && !diff.adds.length) return;

        setCheckoutDisabled(true);
        return diff.changes
          .reduce(function (chain, c) {
            return chain.then(function () { return cartChange(c.key, c.quantity); });
          }, Promise.resolve())
          .then(function () {
            if (diff.adds.length) return cartAdd(diff.adds);
          })
          .then(refreshCartUI)
          .then(function () {
            document.dispatchEvent(new CustomEvent('c-pmb30:gifts-synced'));
          })
          .finally(function () { setCheckoutDisabled(false); });
      })
      .catch(function () {})
      .finally(function () {
        running = false;
        if (queued) { queued = false; sync(); }
      });
  }

  var debounceTimer;
  function scheduleSync() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sync, 300);
  }

  function isCartMutation(url) {
    return typeof url === 'string' && /\/cart\/(add|change|update|clear)/.test(url);
  }

  // Any cart mutation from the theme / other scripts → re-sync afterwards
  window.fetch = function (input) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var result = rawFetch.apply(window, arguments);
    if (isCartMutation(url)) {
      result.then(scheduleSync, scheduleSync);
    }
    return result;
  };

  var xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (isCartMutation(url)) this.addEventListener('loadend', scheduleSync);
    return xhrOpen.apply(this, arguments);
  };

  // Run once the visitor's bucket is known (class lands asynchronously)
  function startWhenDecided() {
    if (bucketDecided()) {
      sync();
      return;
    }
    var observer = new MutationObserver(function () {
      if (!bucketDecided()) return;
      observer.disconnect();
      sync();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startWhenDecided);
  } else {
    startWhenDecided();
  }
})();
