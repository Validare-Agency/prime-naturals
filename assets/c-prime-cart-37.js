// V_PRIME_CART_37 | MiniCart Gift-Threshold Progress Bar (BFCM)

(function () {
  'use strict';

  // ─── Progress bar fill animation ─────────────────────────────────────────
  // When the cart drawer re-renders (full HTML swap), the .c-cart37-fill
  // element is replaced from scratch so CSS transitions don't fire. We
  // immediately set width:0 then restore the target in the next frame so
  // the transition plays on every render.
  function animateFill(root) {
    var fills = (root || document).querySelectorAll('.c-cart37-fill');
    fills.forEach(function (fill) {
      var target = fill.getAttribute('data-fill') || fill.style.width;
      fill.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = (parseFloat(target) || 0) + '%';
        });
      });
    });
  }

  // Run on DOMContentLoaded and on every cart re-render
  document.addEventListener('DOMContentLoaded', function () {
    animateFill();
  });

  // MutationObserver: watches the cart drawer body for new .c-cart37-fill
  // elements that appear after a cart update / re-render.
  var drawerBodyEl = document.querySelector('.cart-drawer__body');
  if (drawerBodyEl) {
    var fillObserver = new MutationObserver(function (mutations) {
      var needsAnim = false;
      mutations.forEach(function (m) {
        if (!m.addedNodes.length) return;
        m.addedNodes.forEach(function (node) {
          if (
            node.nodeType === 1 &&
            (node.classList.contains('c-cart37-fill') ||
              (node.querySelector && node.querySelector('.c-cart37-fill')))
          ) {
            needsAnim = true;
          }
        });
      });
      if (needsAnim) animateFill();
    });
    fillObserver.observe(drawerBodyEl, { childList: true, subtree: true });
  }

  // ─── Gift tier sync ───────────────────────────────────────────────────────
  // Automatically adds / removes the gift line items when the cart subtotal
  // crosses a tier boundary. Variant IDs come from window.cart37GiftVariants,
  // which is populated by sections/cart-drawer.liquid with Liquid-rendered IDs.
  //
  // Only runs for Var A visitors.

  if (!document.body.classList.contains('c-primeCart37VarA')) return;

  var gv = window.cart37GiftVariants || {};
  var TIERS = [
    { cents: 5900,  variantId: gv.tier1 && gv.tier1.variantId },
    { cents: 7900,  variantId: gv.tier2 && gv.tier2.variantId },
    { cents: 9900,  variantId: gv.tier3 && gv.tier3.variantId },
    { cents: 14900, variantId: gv.tier4 && gv.tier4.variantId }
  ].filter(function (t) { return t.variantId; }); // skip unconfigured tiers

  if (TIERS.length === 0) return; // nothing to sync yet — gift products not set up

  var syncInProgress = false;

  function fetchCart() {
    return fetch('/cart.js').then(function (r) { return r.json(); });
  }

  function addGift(variantId) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: variantId,
        quantity: 1,
        properties: { _cart37_gift: '1' }
      })
    }).then(function (r) { return r.json(); });
  }

  function removeItem(lineKey) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lineKey, quantity: 0 })
    }).then(function (r) { return r.json(); });
  }

  function refreshCartDrawer() {
    // Attempt to call the theme's cart-drawer refresh method
    var cd = document.querySelector('cart-drawer');
    if (!cd) return;
    if (typeof cd.renderContents === 'function') {
      cd.renderContents({});
    } else if (typeof cd.refresh === 'function') {
      cd.refresh();
    } else {
      // Fallback: dispatch a synthetic cart event that theme JS listens for
      document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
    }
  }

  function syncGifts(subtotalCents, cartItems) {
    if (syncInProgress) return;

    var changes = [];
    TIERS.forEach(function (tier) {
      var shouldHave = subtotalCents >= tier.cents;
      var inCart = cartItems.find(function (item) {
        return (
          item.variant_id === tier.variantId &&
          item.properties &&
          item.properties._cart37_gift === '1'
        );
      });

      if (shouldHave && !inCart) {
        changes.push({ action: 'add', variantId: tier.variantId });
      } else if (!shouldHave && inCart) {
        changes.push({ action: 'remove', key: inCart.key });
      }
    });

    if (changes.length === 0) return;

    syncInProgress = true;
    var chain = Promise.resolve();
    changes.forEach(function (change) {
      chain = chain.then(function () {
        return change.action === 'add'
          ? addGift(change.variantId)
          : removeItem(change.key);
      });
    });
    chain
      .then(function () {
        syncInProgress = false;
        refreshCartDrawer();
      })
      .catch(function () {
        syncInProgress = false;
      });
  }

  // Listen for cart update events that the theme emits
  // (event names vary by theme; handle the common ones)
  var lastSubtotal = null;

  function handleCartState(cart) {
    if (!cart || cart.items_subtotal_price === lastSubtotal) return;
    lastSubtotal = cart.items_subtotal_price;
    syncGifts(cart.items_subtotal_price, cart.items || []);
  }

  document.addEventListener('cart:updated', function (e) {
    handleCartState(e.detail && e.detail.cart);
  });

  // Also check on drawer open (covers cases where JS events are missing)
  var drawerCheckDone = false;
  document.addEventListener('cartDrawerOpen', function () {
    if (drawerCheckDone) return;
    drawerCheckDone = true;
    fetchCart().then(handleCartState).catch(function () {});
  });

})();
