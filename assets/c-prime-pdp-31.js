// V_PRIME_PDP_31 | Gift-Bundle Combo Replacing Tier 3
(function () {
  // Cart refresh helpers -- same pattern as c-prime-pdp-17.js
  function refreshCartIconBubble() {
    return fetch(window.routes.cart_url + '?section_id=cart-icon-bubble')
      .then(function (response) { return response.text(); })
      .then(function (html) {
        var freshSection = new DOMParser().parseFromString(html, 'text/html').querySelector('.shopify-section');
        var liveIcon = document.getElementById('cart-icon-bubble');
        if (!freshSection || !liveIcon) return;
        liveIcon.innerHTML = freshSection.innerHTML;
      });
  }

  function refreshCartDrawer() {
    return fetch(window.routes.cart_url + '?section_id=cart-drawer')
      .then(function (response) { return response.text(); })
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

  // Returns the active variant's bundle card label element (CSS hides the others).
  // Body class is the single source of truth -- never use inline-style visibility.
  function getActiveBundleCard(root) {
    var body = document.body;
    if (body.classList.contains('c-primePdp31VarA')) return root.querySelector('.c-pdp31-card--var-a');
    if (body.classList.contains('c-primePdp31VarB')) return root.querySelector('.c-pdp31-card--var-b');
    if (body.classList.contains('c-primePdp31VarC')) return root.querySelector('.c-pdp31-card--var-c');
    return null;
  }

  function updateAtcButton(root) {
    var priceEl = root.querySelector('[data-pdp31-atc-price]');
    var labelEl = root.querySelector('[data-pdp31-atc-label]');
    if (!priceEl || !labelEl) return;

    // Tier 1 checked -> single-book add
    var checkedTier1 = root.querySelector('.c-pdp31-tier1__radio:checked');
    if (checkedTier1) {
      priceEl.textContent = checkedTier1.getAttribute('data-pdp31-price');
      labelEl.textContent = ' ADD TO CART';
      return;
    }

    // Bundle radio selected -- read price from the active variant card
    var bundleCard = getActiveBundleCard(root);
    if (!bundleCard) return;
    priceEl.textContent = bundleCard.getAttribute('data-pdp31-price');
    labelEl.textContent = ' ADD THIS BUNDLE';
  }

  function addToCart(root, button) {
    var isTier1 = !!root.querySelector('.c-pdp31-tier1__radio:checked');
    var items;

    if (isTier1) {
      var t1Radio = root.querySelector('.c-pdp31-tier1__radio');
      items = [{
        id: parseInt(t1Radio.getAttribute('data-variant-id'), 10),
        quantity: 1
      }];
    } else {
      var bundleCard = getActiveBundleCard(root);
      if (!bundleCard) return;

      var vid1 = parseInt(bundleCard.getAttribute('data-pdp31-vid-paid1'), 10);
      var vid2 = parseInt(bundleCard.getAttribute('data-pdp31-vid-paid2'), 10);
      var vidFree = parseInt(bundleCard.getAttribute('data-pdp31-vid-free'), 10);

      if (vid1 === vid2) {
        // Var C: 2x same encyclopedia -- add as qty 2
        items = [
          { id: vid1, quantity: 2 },
          { id: vidFree, quantity: 1, properties: { '_pdp31_free': 'true' } }
        ];
      } else {
        items = [
          { id: vid1, quantity: 1 },
          { id: vid2, quantity: 1 },
          { id: vidFree, quantity: 1, properties: { '_pdp31_free': 'true' } }
        ];
      }
    }

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
    if (root.dataset.pdp31Init) return;
    root.dataset.pdp31Init = 'true';

    var body = document.body;
    var isVarA = body.classList.contains('c-primePdp31VarA');
    var isVarB = body.classList.contains('c-primePdp31VarB');
    var isVarC = body.classList.contains('c-primePdp31VarC');
    if (!isVarA && !isVarB && !isVarC) return;

    // Pre-select the active variant's bundle radio (bundle expanded by default per brief)
    var bundleVariantSuffix = isVarA ? 'a' : isVarB ? 'b' : 'c';
    var bundleCard = root.querySelector('.c-pdp31-card--var-' + bundleVariantSuffix);
    var bundleRadio = bundleCard ? bundleCard.querySelector('.c-pdp31-card__radio') : null;
    if (bundleRadio) bundleRadio.checked = true;

    updateAtcButton(root);

    // Wire all radios -> update button on any change
    root.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        updateAtcButton(root);
      });
    });

    var atcButton = root.querySelector('[data-pdp31-atc]');
    if (atcButton) {
      atcButton.addEventListener('click', function () {
        addToCart(root, atcButton);
      });
    }
  }

  function run() {
    document.querySelectorAll('.c-pdp31-wrapper').forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
