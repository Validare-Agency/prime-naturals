// V_PRIME_PDP_22 | Encyclopedia - Upsell
// Forked from c-prime-pdp-17.js (kept untouched as the rollback target for
// this test) — every selector below targets c-pdp22-* elements only, so this
// never binds to the original file's markup even if both exist on a page.
(function () {
  // Which upsell keys are currently checked. Var A-D only ever show one
  // checkable block at a time, so this returns at most 1 key there — Var E/F
  // show both blocks, so a shopper can check either or both at once.
  function getCheckedUpsellKeys(root) {
    var checkboxes = root.querySelectorAll('[data-pdp22-checkbox]:checked');
    return Array.prototype.map.call(checkboxes, function (checkbox) {
      var upsell = checkbox.closest('[data-pdp22-upsell]');
      return upsell && upsell.getAttribute('data-pdp22-upsell-key');
    }).filter(Boolean);
  }

  function updateAtcPrice(root) {
    var checked = root.querySelector('.c-pdp22-row__radio:checked');
    var priceEl = root.querySelector('[data-pdp22-atc-price]');
    if (!checked || !priceEl) return;

    // Checking an upsell folds its price into the bundle's own Add to Cart
    // button total, since that click adds them together. Liquid precomputes
    // the sum for every possible combination (one product, the other, or
    // both) as a money-formatted attribute, keyed by what's checked, so this
    // never has to do currency math/formatting itself.
    var keys = getCheckedUpsellKeys(root);
    var attr = null;
    if (keys.length === 2) {
      attr = 'data-pdp22-price-with-both-upsells-money';
    } else if (keys.length === 1) {
      attr = 'data-pdp22-price-with-upsell-' + keys[0] + '-money';
    }
    var withUpsellPrice = attr && checked.getAttribute(attr);
    priceEl.textContent = withUpsellPrice || checked.getAttribute('data-pdp22-price-money');
  }

  // Same fetch+swap technique the theme itself uses for this section (see
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

  // Always swaps in fresh drawer content so it's never stale next time it's
  // opened — openDrawer only controls whether this call itself pops it open
  // (Var B/D/F's own Add button keeps it closed, but must still refresh its
  // content, otherwise manually opening the drawer afterwards — without a
  // page refresh — shows what was in the cart before that click).
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

  function generateBundleId() {
    return 'pdp22-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  // Intelligems custom event: fires once per upsell module — see
  // window.igEvents usage in assets/c-intelligems-tests.js for the pattern.
  function trackUpsellModuleView(upsellWrapper) {
    if (upsellWrapper.dataset.pdp22ViewTracked) return;
    upsellWrapper.dataset.pdp22ViewTracked = 'true';
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'upsell_module_view' });
  }

  // Observes the whole upsell module (heading + card(s)) and fires the view
  // event the first time it scrolls into the viewport. A hidden module
  // (Control, or the non-active product's card) never intersects, so this
  // naturally only fires for shoppers who actually see it.
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

  // Intelligems custom event: fires on the click/check that SELECTS an
  // upsell item — a checkbox being checked, or the Add button being clicked
  // — not on unchecking.
  function trackUpsellAddClick() {
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'upsell_add_click' });
  }

  function postCartAdd(items, button, options) {
    var openDrawer = !options || options.openDrawer !== false;
    button.disabled = true;
    return fetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (response) {
        if (!response.ok) return Promise.reject(response);
        // Var B/D/F's own Add button shows its own "Added" confirmation
        // inline, so popping the drawer open too would be redundant — but
        // its content still needs refreshing either way (see
        // refreshCartDrawer), just without forcing it visible.
        return refreshCartDrawer(openDrawer);
      })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        button.disabled = false;
      });
  }

  // Var A/C/E: every checked upsell (Var E can have both checked at once)
  // folds its variant into the bundle's Add to Cart click.
  function getCheckedUpsellItems(root) {
    var checkboxes = root.querySelectorAll('[data-pdp22-checkbox]:checked');
    return Array.prototype.map.call(checkboxes, function (checkbox) {
      var upsell = checkbox.closest('[data-pdp22-upsell]');
      return {
        id: upsell.getAttribute('data-variant-id'),
        quantity: 1,
        properties: { _pdp22_upsell: 'true', _pdp22_upsell_key: upsell.getAttribute('data-pdp22-upsell-key') }
      };
    });
  }

  function addToCart(root, button) {
    var checked = root.querySelector('.c-pdp22-row__radio:checked');
    if (!checked) return;

    var variantId = checked.getAttribute('data-variant-id');
    var quantity = parseInt(checked.getAttribute('data-quantity'), 10) || 1;

    var bundleId = generateBundleId();
    var items = [{
      id: variantId,
      quantity: quantity,
      properties: { _pdp22_bundle_id: bundleId, _pdp22_min_qty: quantity }
    }];

    var upsellItems = getCheckedUpsellItems(root);
    items = items.concat(upsellItems);

    postCartAdd(items, button).then(function (success) {
      // Var A/C/E: once the checked upsell(s) have actually been added
      // alongside the bundle, uncheck them and drop the ATC price back to
      // the bundle-only total — leaving them checked would add another one
      // on the next click.
      if (success && upsellItems.length) {
        root.querySelectorAll('[data-pdp22-checkbox]:checked').forEach(function (checkbox) {
          checkbox.checked = false;
        });
        updateAtcPrice(root);
      }
    });
  }

  // Var B/D only: the upsell's own Add button, adds just that item immediately
  // — independent of the bundle's Add to Cart button/click above.
  function addUpsellToCart(upsellRoot, button) {
    var variantId = upsellRoot.getAttribute('data-variant-id');
    if (!variantId) return;
    var properties = { _pdp22_upsell: 'true', _pdp22_upsell_key: upsellRoot.getAttribute('data-pdp22-upsell-key') };
    postCartAdd([{ id: variantId, quantity: 1, properties: properties }], button, { openDrawer: false })
      .then(function (success) {
        if (success) showAdded(button);
      });
  }

  // Briefly swaps the Add button into a "✓ Added" confirmation state, then
  // reverts back to "Add" so the shopper can add another one if they want.
  function showAdded(button) {
    var originalHTML = button.innerHTML;
    button.classList.add('c-pdp22-upsell__add-btn--added');
    button.innerHTML = '&#10003; Added';
    window.setTimeout(function () {
      button.classList.remove('c-pdp22-upsell__add-btn--added');
      button.innerHTML = originalHTML;
    }, 2000);
  }

  function initUpsell(upsellRoot, root) {
    if (upsellRoot.dataset.pdp22UpsellInit) return;
    upsellRoot.dataset.pdp22UpsellInit = 'true';

    var addBtn = upsellRoot.querySelector('[data-pdp22-add-btn]');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        trackUpsellAddClick();
        addUpsellToCart(upsellRoot, addBtn);
      });
    }

    var checkbox = upsellRoot.querySelector('[data-pdp22-checkbox]');
    if (checkbox) {
      // Checking it folds its price into the bundle ATC button's total.
      checkbox.addEventListener('change', function () {
        updateAtcPrice(root);
        if (checkbox.checked) trackUpsellAddClick();
      });
    }

    // Var A/C/E: clicking anywhere on the row (upsellRoot IS the
    // .c-pdp22-upsell__card now — one card per product, not a wrapper around
    // it) toggles that card's own checkbox, not just the 20x20 box itself.
    // Skip clicks inside the checkbox's own label (native label behavior
    // already toggles it, and fires its own 'change' above — doing it again
    // here would cancel the toggle out and double-count the click) and
    // inside the Add button (Var B/D/F's own, unrelated action).
    if (checkbox) {
      upsellRoot.addEventListener('click', function (event) {
        if (event.target.closest('.c-pdp22-upsell__checkbox-wrap')) return;
        if (event.target.closest('[data-pdp22-add-btn]')) return;
        checkbox.checked = !checkbox.checked;
        updateAtcPrice(root);
        if (checkbox.checked) trackUpsellAddClick();
      });
    }
  }

  function initRoot(root) {
    if (root.dataset.pdp22Init) return;
    root.dataset.pdp22Init = 'true';

    root.querySelectorAll('.c-pdp22-row__radio').forEach(function (radio) {
      radio.addEventListener('change', function () {
        updateAtcPrice(root);
      });
    });
    updateAtcPrice(root);

    var atcButton = root.querySelector('[data-pdp22-atc]');
    if (atcButton) {
      atcButton.addEventListener('click', function () {
        addToCart(root, atcButton);
      });
    }

    root.querySelectorAll('[data-pdp22-upsell]').forEach(function (upsellRoot) {
      initUpsell(upsellRoot, root);
    });

    var upsellWrapper = root.querySelector('.c-pdp22-upsell');
    if (upsellWrapper) initUpsellViewTracking(upsellWrapper);
  }

  function run() {
    document.querySelectorAll('.c-pdp22-variant').forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
