// Vol. 2 pre-order — free gift cleanup.
//
// The free pre-order gift (line property _preorder_gift, added by
// assets/c-preorder.js) is its own cart line, so Shopify doesn't remove it
// with the book. After any cart change, if the cart has a gift line but no
// pre-order line (property _preorder) left, the gift is removed too.
// Loaded sitewide from sections/cart-drawer.liquid. Same fetch-watch and
// cart UI refresh technique as assets/c-prime-cart-37.js.
(function () {
  if (window.cPreorderCartInit) return;
  window.cPreorderCartInit = true;

  // Captured before patching fetch below, so our own requests never re-trigger
  var rawFetch = window.fetch.bind(window);

  function hasProp(item, name) {
    return item.properties && item.properties[name] != null && item.properties[name] !== '';
  }

  function cartChange(key) {
    return rawFetch(window.routes.cart_change_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: 0 })
    });
  }

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

  function refreshCartIconBubble() {
    return rawFetch(window.routes.cart_url + '?section_id=cart-icon-bubble')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('.shopify-section');
        var live = document.getElementById('cart-icon-bubble');
        if (fresh && live) live.innerHTML = fresh.innerHTML;
      });
  }

  // Cart page sections are template-scoped — their real section id is on data-id
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

  var running = false;
  var queued = false;

  function sync() {
    if (running) { queued = true; return; }
    running = true;

    rawFetch(window.routes.cart_url + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var hasPreorder = cart.items.some(function (item) { return hasProp(item, '_preorder'); });
        if (hasPreorder) return;
        var giftKeys = cart.items
          .filter(function (item) { return hasProp(item, '_preorder_gift'); })
          .map(function (item) { return item.key; });
        if (!giftKeys.length) return;

        return giftKeys
          .reduce(function (chain, key) {
            return chain.then(function () { return cartChange(key); });
          }, Promise.resolve())
          .then(function () {
            return Promise.all([
              refreshCartDrawer(),
              refreshCartIconBubble(),
              refreshCartPageSection('main-cart-items'),
              refreshCartPageSection('main-cart-footer')
            ]);
          });
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
    return typeof url === 'string' && /\/cart\/(change|update|clear)/.test(url);
  }

  // Any removal / quantity change from the theme or other scripts → check afterwards
  window.fetch = function (input) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var result = rawFetch.apply(window, arguments);
    if (isCartMutation(url)) result.then(scheduleSync, scheduleSync);
    return result;
  };

  var xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (isCartMutation(url)) this.addEventListener('loadend', scheduleSync);
    return xhrOpen.apply(this, arguments);
  };

  // Also on page load (e.g. the book was removed on another tab or page)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
})();
