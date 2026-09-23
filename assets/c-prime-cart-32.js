// V_PRIME_CART_32 | Charity Donation Minicart Add-On — Give the Gift of Reading (BFCM)
// Loaded from sections/cart-drawer.liquid (sitewide). The donation card
// (snippets/c-prime-cart-32-donation.liquid) is re-rendered by the server on
// every drawer refresh, so its data-* attributes are always the cart's real
// state — this file only adds/removes the donation line and keeps it valid:
//   Var A — unchecked by default, shopper opts in.
//   Var B — added by default once the cart has other items, unless the
//           shopper has unticked it this session (sessionStorage).
//   Control / holdout — never has a donation line; any stray one is removed.
//   Any group — a donation left alone in an otherwise empty cart is removed.
(function () {
  var OPT_OUT_KEY = 'c_cart32_varb_opt_out';
  var busy = false;
  var lastBox = null;
  var lastVariant = null;

  // c-intelligems-tests.js always adds one of these once handleExperiments()
  // has run — until then the variant is unknown and nothing should change.
  function experimentsReady() {
    var classList = document.body.classList;
    return classList.contains('c-validareOptimized') || classList.contains('c-validareHoldout');
  }

  function getVariant() {
    if (document.body.classList.contains('c-primeCart32VarA')) return 'A';
    if (document.body.classList.contains('c-primeCart32VarB')) return 'B';
    return null;
  }

  function isOptedOut() {
    try {
      return sessionStorage.getItem(OPT_OUT_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setOptedOut(optedOut) {
    try {
      if (optedOut) sessionStorage.setItem(OPT_OUT_KEY, '1');
      else sessionStorage.removeItem(OPT_OUT_KEY);
    } catch (e) {}
  }

  function setCheckoutDisabled(disabled) {
    ['checkout', 'CartDrawer-Checkout'].forEach(function (id) {
      var button = document.getElementById(id);
      if (button) button.disabled = disabled;
    });
  }

  // Same drawer + icon bubble swap c-prime-pdp-35.js uses.
  function refreshCartDrawer() {
    return Promise.all([
      fetch(window.routes.cart_url + '?section_id=cart-drawer').then(function (response) {
        return response.text();
      }),
      fetch(window.routes.cart_url + '?section_id=cart-icon-bubble').then(function (response) {
        return response.text();
      })
    ]).then(function (html) {
      var parser = new DOMParser();
      var freshDrawer = parser.parseFromString(html[0], 'text/html').querySelector('cart-drawer');
      var liveDrawer = document.querySelector('cart-drawer');
      if (freshDrawer && liveDrawer) {
        if (liveDrawer.classList.contains('active')) freshDrawer.classList.add('active');
        liveDrawer.replaceWith(freshDrawer);
      }
      var freshIcon = parser.parseFromString(html[1], 'text/html').querySelector('.shopify-section');
      var liveIcon = document.getElementById('cart-icon-bubble');
      if (freshIcon && liveIcon) liveIcon.innerHTML = freshIcon.innerHTML;
    });
  }

  function setDonation(box, add) {
    busy = true;
    box.classList.add('c-cart32--loading');
    setCheckoutDisabled(true);

    var request = add
      ? fetch(window.routes.cart_add_url + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: box.dataset.variantId, quantity: 1 }] })
        })
      : fetch(window.routes.cart_change_url + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: box.dataset.lineKey, quantity: 0 })
        });

    return request
      .then(refreshCartDrawer)
      .catch(function () {})
      .finally(function () {
        busy = false;
        box.classList.remove('c-cart32--loading');
        setCheckoutDisabled(false);
        sync();
      });
  }

  function sync() {
    if (busy || !experimentsReady()) return;
    var box = document.querySelector('[data-c-cart32]');
    var variant = getVariant();
    if (!box || (box === lastBox && variant === lastVariant)) return;
    lastBox = box;
    lastVariant = variant;

    var inCart = !!box.dataset.lineKey;
    var otherCount = parseInt(box.dataset.otherCount, 10) || 0;

    if (inCart && (!variant || otherCount === 0)) {
      setDonation(box, false);
    } else if (!inCart && variant === 'B' && otherCount > 0 && !isOptedOut()) {
      setDonation(box, true);
    }
  }

  document.addEventListener('change', function (event) {
    var input = event.target.closest('.c-cart32__input');
    if (!input || busy) return;
    var box = input.closest('[data-c-cart32]');
    // Only a Var B untick opts out of its default-on — Var A has no default.
    if (getVariant() === 'B') setOptedOut(!input.checked);
    setDonation(box, input.checked);
  });

  // The drawer is swapped out wholesale whenever the cart changes, and the
  // variant class lands on <body> whenever Intelligems is ready — re-check
  // on both. sync() bails early unless the card or variant actually changed.
  new MutationObserver(sync).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
})();
