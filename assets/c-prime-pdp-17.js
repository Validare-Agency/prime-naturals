// PDP bundle/offer selector
(function () {
  // V_PRIME_PDP_22 winner rollout ("Var C - Murphy checkbox") — permanent,
  // encyclopedia-only upsell checkbox. c-validareHoldout visitors must keep
  // seeing pre-winner behavior forever (see assets/c-intelligems-tests.js),
  // so this double-checks that CSS's hiding of .c-pdp17-upsell with a live
  // JS gate, the same way c-prime-pdp-35.js's pdp35VariantActive() guards its
  // own gift-eligibility check against a stale/missing class.
  function pdp17UpsellEligible() {
    return !document.body.classList.contains('c-validareHoldout');
  }

  function getUpsellCheckbox(root) {
    return root.querySelector('[data-pdp17-upsell-checkbox]');
  }

  function updateAtcPrice(root) {
    var checked = root.querySelector('.c-pdp17-row__radio:checked');
    var priceEl = root.querySelector('[data-pdp17-atc-price]');
    if (!checked || !priceEl) return;

    var upsellCheckbox = getUpsellCheckbox(root);
    var withUpsellPrice = upsellCheckbox && upsellCheckbox.checked
      ? checked.getAttribute('data-pdp17-price-with-upsell-money')
      : null;
    priceEl.textContent = withUpsellPrice || checked.getAttribute('data-pdp17-price-money');
  }

  // Intelligems custom event — reuses V_PRIME_PDP_22's own event names so
  // reporting stays comparable across the test's pre/post-rollout history.
  function trackUpsellModuleView(upsellWrapper) {
    if (upsellWrapper.dataset.pdp17ViewTracked) return;
    upsellWrapper.dataset.pdp17ViewTracked = 'true';
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'upsell_module_view' });
  }

  function initUpsellViewTracking(upsellWrapper) {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        trackUpsellModuleView(upsellWrapper);
        observer.unobserve(upsellWrapper);
      });
    });
    observer.observe(upsellWrapper);
  }

  function trackUpsellAddClick() {
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'upsell_add_click' });
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

    var upsellCheckbox = getUpsellCheckbox(root);
    var upsellChecked = upsellCheckbox && upsellCheckbox.checked && pdp17UpsellEligible();
    if (upsellChecked) {
      var upsellRoot = upsellCheckbox.closest('[data-pdp17-upsell]');
      items.push({
        id: upsellRoot.getAttribute('data-variant-id'),
        quantity: 1,
        properties: { _pdp17_upsell: 'true', _pdp17_upsell_key: 'murphys' }
      });
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
      .then(function () {
        // Matches V_PRIME_PDP_22's own behavior: once the checked upsell has
        // actually been added alongside the bundle, uncheck it and drop the
        // ATC price back to the bundle-only total — leaving it checked would
        // add another one on the next click.
        if (upsellChecked) {
          upsellCheckbox.checked = false;
          updateAtcPrice(root);
        }
      })
      .catch(function () {})
      .finally(function () {
        button.disabled = false;
      });
  }

  // Mirrors V_PRIME_PDP_22's initUpsell(): checkbox change folds/unfolds its
  // price into the ATC total; clicking anywhere on the card (outside the
  // checkbox's own label, which already toggles it via native label
  // behavior) toggles the checkbox too.
  function initUpsell(upsellRoot, root) {
    if (upsellRoot.dataset.pdp17UpsellInit) return;
    upsellRoot.dataset.pdp17UpsellInit = 'true';

    var checkbox = upsellRoot.querySelector('[data-pdp17-upsell-checkbox]');
    if (!checkbox) return;

    checkbox.addEventListener('change', function () {
      updateAtcPrice(root);
      if (checkbox.checked) trackUpsellAddClick();
    });

    upsellRoot.addEventListener('click', function (event) {
      if (event.target.closest('.c-pdp17-upsell__checkbox-wrap')) return;
      checkbox.checked = !checkbox.checked;
      updateAtcPrice(root);
      if (checkbox.checked) trackUpsellAddClick();
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

    var upsellRoot = root.querySelector('[data-pdp17-upsell]');
    if (upsellRoot) initUpsell(upsellRoot, root);

    var upsellWrapper = root.querySelector('.c-pdp17-upsell');
    if (upsellWrapper) initUpsellViewTracking(upsellWrapper);
  }

  function run() {
    document.querySelectorAll('.c-pdp17-variant').forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
