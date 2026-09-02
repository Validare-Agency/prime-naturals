// PDP bundle/offer selector
(function () {
  // V_PRIME_MIX_29: when live, a 1-book order no longer qualifies for free
  // shipping, so its price now bakes in an actual shipping fee — $5
  // USD-equivalent for Var A, $10 for Var B. Liquid precomputes the already-
  // summed, correctly-localized total as its own money-formatted attribute
  // (data-pdp17-price-mix29-fee-*-money) so this never has to do currency
  // math/formatting itself.
  function withMix29Fee(checked, basePriceMoney) {
    if (checked.getAttribute('data-quantity') !== '1') return basePriceMoney;
    var totalMoney = null;
    if (document.body.classList.contains('c-primeMix29VarA')) {
      totalMoney = checked.getAttribute('data-pdp17-price-mix29-fee-a-money');
    } else if (document.body.classList.contains('c-primeMix29VarB')) {
      totalMoney = checked.getAttribute('data-pdp17-price-mix29-fee-b-money');
    }
    return totalMoney || basePriceMoney;
  }

  function updateAtcPrice(root) {
    var checked = root.querySelector('.c-pdp17-row__radio:checked');
    var priceEl = root.querySelector('[data-pdp17-atc-price]');
    if (!checked || !priceEl) return;
    priceEl.textContent = withMix29Fee(checked, checked.getAttribute('data-pdp17-price-money'));
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
    document.querySelectorAll('.c-pdp17-variant').forEach(function (root) {
      initRoot(root);
      // initRoot no-ops after its first call, but the V_PRIME_MIX_29 test
      // class can land on <body> after this first runs (Intelligems resolves
      // asynchronously) — re-check the fee every time this fires so the ATC
      // price never gets stuck showing the pre-test amount.
      updateAtcPrice(root);
    });
  }

  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('ig:ready', run);
  new MutationObserver(run).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
