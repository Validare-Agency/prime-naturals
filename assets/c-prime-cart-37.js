// V_PRIME_CART_37 | MiniCart Gift-Threshold Progress Bar (BFCM) — cart gift sync
//
// Duplicated from assets/c-prime-mix-30-gifts.js (V_PRIME_MIX_30) so each test
// stays independent. Keeps the free gift lines in the cart matching the cart
// total: every gift whose threshold the (non-gift) subtotal clears is added
// once, anything it no longer clears is removed. Loaded sitewide from
// sections/cart-drawer.liquid, which also renders window.primeCart37Gifts.
//
// Only Var A ever receives gifts. Holdout / Control / other visitors get any
// stray CART_37 gift line removed — but only once c-intelligems-tests.js has
// decided the visitor's bucket (c-validareHoldout / c-validareOptimized).
//
// A visitor in both tests' Var A gets gifts from MIX_30 only: this script
// steps aside, and neither script ever touches the other test's gift lines.
(function () {
  if (window.primeCart37GiftsInit) return;
  window.primeCart37GiftsInit = true;

  var GIFT_PROP = '_pc37_gift';
  // V_PRIME_MIX_30's gift lines — never ours to add, remove or count
  var OTHER_GIFT_PROP = '_pmb30_gift';

  // Captured before this file patches fetch below, so our own cart requests
  // never re-trigger a sync.
  var rawFetch = window.fetch.bind(window);

  function gifts() {
    return (window.primeCart37Gifts || []).filter(function (g) { return g && g.id; });
  }

  function bucketDecided() {
    var cl = document.body.classList;
    return cl.contains('c-validareHoldout') || cl.contains('c-validareOptimized');
  }

  function variantActive() {
    var cl = document.body.classList;
    return cl.contains('c-primeCart37VarA') &&
      !cl.contains('c-validareHoldout') &&
      // MIX_30 Var A already grants the same gifts
      !cl.contains('c-primeMix30VarA');
  }

  function isGiftLine(item) {
    return !!(item.properties && item.properties[GIFT_PROP]);
  }

  // Gifts the shopper removed with the delete icon — never re-added for the
  // same cart. Keyed by the Shopify cart token, so a new cart (e.g. after
  // checkout) starts with every gift available again.
  var DECLINED_KEY = 'c-pc37-declined-gifts';
  var cartToken = null;

  function readDeclined() {
    try {
      return JSON.parse(localStorage.getItem(DECLINED_KEY)) || { token: null, ids: [] };
    } catch (e) {
      return { token: null, ids: [] };
    }
  }

  function writeDeclined(declined) {
    try { localStorage.setItem(DECLINED_KEY, JSON.stringify(declined)); } catch (e) {}
  }

  function declinedIds(cart) {
    var declined = readDeclined();
    if (declined.token && cart.token && declined.token !== cart.token) {
      writeDeclined({ token: cart.token, ids: [] });
      return [];
    }
    if (!declined.token && cart.token && declined.ids.length) {
      declined.token = cart.token;
      writeDeclined(declined);
    }
    return declined.ids;
  }

  function declineGift(id) {
    var declined = readDeclined();
    if (declined.ids.indexOf(id) === -1) declined.ids.push(id);
    if (!declined.token) declined.token = cartToken;
    writeDeclined(declined);
  }

  function isOtherTestGiftLine(item) {
    return !!(item.properties && item.properties[OTHER_GIFT_PROP]);
  }

  // Any line of a gift product, whether or not this script added it
  function isGiftVariant(item) {
    return gifts().some(function (g) { return g.id === item.variant_id; });
  }

  // Cart total the thresholds are measured against — gift lines never count
  // toward unlocking other gifts.
  function eligibleSubtotal(cart) {
    return cart.items.reduce(function (sum, item) {
      return isGiftLine(item) || isGiftVariant(item) ? sum : sum + item.final_line_price;
    }, 0);
  }

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
    var declined = declinedIds(cart);
    cartToken = cart.token;
    var changes = [];
    var adds = [];

    // Gift products added any other way (e.g. a /cart/add?id= link) are never
    // honored — removed for every visitor, Var A or not.
    cart.items.forEach(function (item) {
      if (isGiftVariant(item) && !isGiftLine(item) && !isOtherTestGiftLine(item)) changes.push({ key: item.key, quantity: 0 });
    });

    gifts().forEach(function (gift) {
      // Most gifts are $0 products; free-gift-card-20 is a Shopify gift card
      // product made free by an automatic discount at a $99+ cart — its $99
      // threshold is set explicitly in sections/cart-drawer.liquid, so it's
      // only ever added when that discount applies.
      var justified = active && gift.available && subtotal >= gift.threshold &&
        declined.indexOf(gift.id) === -1;
      var lines = cart.items.filter(function (item) {
        return isGiftLine(item) && item.variant_id === gift.id;
      });

      if (!justified) {
        lines.forEach(function (line) { changes.push({ key: line.key, quantity: 0 }); });
        return;
      }
      if (!lines.length) {
        adds.push({ id: gift.id, quantity: 1, properties: { _pc37_gift: 'true' } });
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

  // --- Cart UI refresh (same fetch+swap technique as c-prime-mix-30-gifts.js) ---
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
            document.dispatchEvent(new CustomEvent('c-pc37:gifts-synced'));
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

  // Delete icon on a gift line → remember it as declined before the theme's
  // removal request lands (capture phase, so it runs before theme handlers)
  document.addEventListener('click', function (event) {
    var removeButton = event.target.closest && event.target.closest('cart-remove-button');
    if (!removeButton) return;
    var line = removeButton.closest('[data-c-pc37-gift-id]');
    if (line) declineGift(parseInt(line.getAttribute('data-c-pc37-gift-id'), 10));
  }, true);

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
