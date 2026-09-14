// PDP bundle tier picker (1 / 3 / 5 books).
// Forked from c-prime-pdp-22.js — every selector below targets c-pdp25-*
// elements only, so this never binds to that file's markup even if both
// exist on a page at once.
(function () {
  function updateAtcPrice(root) {
    var checked = root.querySelector('.c-pdp25-row__radio:checked');
    var priceEl = root.querySelector('[data-pdp25-atc-price]');
    if (!checked || !priceEl) return;
    priceEl.textContent = checked.getAttribute('data-pdp25-price-money');
  }

  // Same fetch+swap technique the theme itself uses for this section (see
  // cart-notification.js's getSectionsToRender/renderContents, and
  // c-prime-pdp-22.js for the identical pattern this is forked from).
  function refreshCartIconBubble() {
    return fetch(window.routes.cart_url + '?section_id=cart-icon-bubble')
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var freshSection = new DOMParser().parseFromString(html, 'text/html').querySelector('.shopify-section');
        var liveIcon = document.getElementById('cart-icon-bubble');
        if (!freshSection || !liveIcon) return;
        liveIcon.innerHTML = freshSection.innerHTML;
      });
  }

  function refreshCartDrawer(openDrawer) {
    return fetch(window.routes.cart_url + '?section_id=cart-drawer')
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var freshDrawer = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-drawer');
        var liveDrawer = document.querySelector('cart-drawer');
        if (freshDrawer && liveDrawer) {
          var wasActive = liveDrawer.classList.contains('active');
          liveDrawer.replaceWith(freshDrawer);
          if (openDrawer || wasActive) freshDrawer.classList.add('active');
        }
        return refreshCartIconBubble();
      });
  }

  function setCheckoutDisabled(disabled) {
    ['checkout', 'CartDrawer-Checkout'].forEach(function (id) {
      var button = document.getElementById(id);
      if (button) button.disabled = disabled;
    });
  }

  function postCartAdd(items, button) {
    button.disabled = true;
    setCheckoutDisabled(true);
    return fetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (response) {
        if (!response.ok) return Promise.reject(response);
        return refreshCartDrawer(true);
      })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        button.disabled = false;
        setCheckoutDisabled(false);
      });
  }

  function addToCart(root, button) {
    var checked = root.querySelector('.c-pdp25-row__radio:checked');
    if (!checked) return;

    var variantId = checked.getAttribute('data-variant-id');
    var quantity = parseInt(checked.getAttribute('data-quantity'), 10) || 1;

    postCartAdd([{ id: variantId, quantity: quantity }], button);
  }

  // Events: bundle_tier2_click / bundle_tier3_click — fire when a shopper
  // selects the 3-book or 5-book tier row. Tier 1 (1 book) has no event —
  // only tiers 2/3 are tracked, per spec.
  function trackBundleTierClick(radio) {
    var quantity = radio.getAttribute('data-quantity');
    var eventName = quantity === '3' ? 'bundle_tier2_click' : quantity === '5' ? 'bundle_tier3_click' : null;
    if (!eventName) return;
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: eventName });
  }

  function initRoot(root) {
    if (root.dataset.pdp25Init) return;
    root.dataset.pdp25Init = 'true';

    root.querySelectorAll('.c-pdp25-row__radio').forEach(function (radio) {
      radio.addEventListener('change', function () {
        updateAtcPrice(root);
        trackBundleTierClick(radio);
      });
    });
    updateAtcPrice(root);

    var atcButton = root.querySelector('[data-pdp25-atc]');
    if (atcButton) {
      atcButton.addEventListener('click', function () {
        addToCart(root, atcButton);
      });
    }
  }

  function run() {
    document.querySelectorAll('.c-pdp25-variant').forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
