// PDP bundle/offer selector
(function () {
  function updateAtcPrice(root) {
    var checked = root.querySelector('.c-pdp17-row__radio:checked');
    var priceEl = root.querySelector('[data-pdp17-atc-price]');
    if (!checked || !priceEl) return;
    priceEl.textContent = checked.getAttribute('data-pdp17-price-money');
  }

  // The header's cart-count-bubble is a separate section from the drawer —
  // refreshing the drawer alone leaves it stale. Same fetch+swap technique
  // the theme itself already uses for this exact section (see
  // cart-notification.js's getSectionsToRender/renderContents).
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

  function refreshCartDrawer() {
    return fetch(window.routes.cart_url + '?section_id=cart-drawer')
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var freshDrawer = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-drawer');
        var liveDrawer = document.querySelector('cart-drawer');
        if (freshDrawer && liveDrawer) {
          liveDrawer.replaceWith(freshDrawer);
          freshDrawer.classList.add('active');
        }
        return refreshCartIconBubble();
      });
  }

  function generateBundleId() {
    return 'pdp17-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function addToCart(root, button) {
    var checked = root.querySelector('.c-pdp17-row__radio:checked');
    if (!checked) return;

    var variantId = checked.getAttribute('data-variant-id');
    var quantity = parseInt(checked.getAttribute('data-quantity'), 10) || 1;

    var bundleId = generateBundleId();
    var items = [{
      id: variantId,
      quantity: quantity,
      properties: { _pdp17_bundle_id: bundleId, _pdp17_min_qty: quantity }
    }];

    button.disabled = true;
    fetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (response) {
        if (!response.ok) return Promise.reject(response);
        return refreshCartDrawer();
      })
      .catch(function () {})
      .finally(function () {
        button.disabled = false;
      });
  }

  function initRoot(root) {
    if (root.dataset.pdp17Init) return;
    root.dataset.pdp17Init = 'true';

    root.querySelectorAll('.c-pdp17-row__radio').forEach(function (radio) {
      radio.addEventListener('change', function () {
        updateAtcPrice(root);
      });
    });
    updateAtcPrice(root);

    var atcButton = root.querySelector('[data-pdp17-atc]');
    if (atcButton) {
      atcButton.addEventListener('click', function () {
        addToCart(root, atcButton);
      });
    }
  }

  function run() {
    document.querySelectorAll('.c-pdp17-variant').forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
