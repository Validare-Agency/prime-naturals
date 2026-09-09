// V_PRIME_PDP_25 | Unlock Bonus Free Gifts
// Forked from c-prime-pdp-22.js (kept untouched as the rollback target for
// this test) — every selector below targets c-pdp25-* elements only, so this
// never binds to that file's markup even if both exist on a page at once.
//
// Loaded from sections/main-product.liquid (bundle rows + gift unlock UI +
// Add to Cart, below) AND sections/cart-drawer.liquid (cart gift-line
// reconciliation, at the bottom — cart-drawer.liquid is rendered sitewide
// from layout/theme.liquid, so this listens everywhere the drawer's quantity
// inputs/remove buttons can appear, cart page included) — each half no-ops
// if its markup isn't on the page.
(function () {
  function getCheckedTierQuantity(root) {
    var checked = root.querySelector('.c-pdp25-row__radio:checked');
    return checked ? parseInt(checked.getAttribute('data-quantity'), 10) || 0 : 0;
  }

  // The gift-stack markup always renders in the DOM (CSS just hides it
  // visually for Control — see c-prime-pdp-25.css) so gift-granting logic
  // must check this itself: Control must never actually receive a gift,
  // only shoppers c-intelligems-tests.js has bucketed into a named PDP_25
  // variant. Checked live off body classList rather than cached once, since
  // that's the single source of truth that file writes to.
  function pdp25VariantActive() {
    return ['c-primePdp25VarA', 'c-primePdp25VarB', 'c-primePdp25VarC', 'c-primePdp25VarD'].some(function (cls) {
      return document.body.classList.contains(cls);
    });
  }

  // Toggles each gift card's unlocked/locked look based on the selected row's
  // quantity vs. that card's own data-pdp25-unlock-qty threshold.
  function updateGiftLocks(root) {
    var quantity = getCheckedTierQuantity(root);
    root.querySelectorAll('[data-pdp25-gift]').forEach(function (gift) {
      var unlockQty = parseInt(gift.getAttribute('data-pdp25-unlock-qty'), 10) || 0;
      gift.classList.toggle('c-pdp25-gift--unlocked', quantity >= unlockQty);
    });
  }

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

  // Both the cart page's and the drawer's checkout button, disabled while
  // gifts are actively being added/removed (from the PDP's own Add to Cart,
  // below, or from a cart-side quantity edit/removal further down) so a
  // shopper can't reach checkout with a cart that's mid-change. Re-enabling
  // is a safety net in most callers — a section refresh normally replaces
  // these buttons outright with a freshly server-rendered pair (correctly
  // enabled/disabled per the cart's actual, now-settled state).
  function setCheckoutDisabled(disabled) {
    ['checkout', 'CartDrawer-Checkout'].forEach(function (id) {
      var button = document.getElementById(id);
      if (button) button.disabled = disabled;
    });
  }

  function generateBundleId() {
    return 'pdp25-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
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

  // Every gift whose unlock threshold the selected tier's quantity clears —
  // these are the ones that actually get added alongside the bundle.
  function getUnlockedGiftItems(root, bundleId) {
    if (!pdp25VariantActive()) return [];
    var quantity = getCheckedTierQuantity(root);
    var items = [];
    root.querySelectorAll('[data-pdp25-gift]').forEach(function (gift) {
      var unlockQty = parseInt(gift.getAttribute('data-pdp25-unlock-qty'), 10) || 0;
      if (quantity < unlockQty) return;
      items.push({
        id: gift.getAttribute('data-variant-id'),
        quantity: 1,
        properties: {
          _pdp25_gift: 'true',
          _pdp25_gift_key: gift.getAttribute('data-pdp25-gift-key'),
          _pdp25_bundle_id: bundleId
        }
      });
    });
    return items;
  }

  function addToCart(root, button) {
    var checked = root.querySelector('.c-pdp25-row__radio:checked');
    if (!checked) return;

    var variantId = checked.getAttribute('data-variant-id');
    var quantity = parseInt(checked.getAttribute('data-quantity'), 10) || 1;
    var bundleId = generateBundleId();

    var mainItem = {
      id: variantId,
      quantity: quantity,
      properties: { _pdp25_bundle_id: bundleId, _pdp25_min_qty: quantity }
    };

    var items = [mainItem].concat(getUnlockedGiftItems(root, bundleId));
    postCartAdd(items, button);
  }

  // Events: bundle_tier2_click / bundle_tier3_click — fire when a shopper
  // selects the 3-book or 5-book tier row. Not tied to any variant: the tier
  // radios are the same unconditional markup across Var A/B/C/D, so this
  // fires identically for everyone. Tier 1 (1 book) has no event — only
  // tiers 2/3 are tracked, per spec.
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
        updateGiftLocks(root);
        trackBundleTierClick(radio);
      });
    });
    updateAtcPrice(root);
    updateGiftLocks(root);

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

  // --- Cart gift-line reconciliation (drawer + cart page) ----------------
  // This theme has no AJAX cart/quantity JS at all — no customElements
  // definition anywhere backs <quantity-input>/<cart-remove-button>, and the
  // +/- buttons don't even work without it (confirmed by reading
  // sections/main-cart-items.liquid and snippets/cart-drawer.liquid: nothing
  // wires them up, no pub/sub, no data-key on a row — only data-index and,
  // via /cart.js, each line's properties). So this builds real AJAX behavior
  // itself, but ONLY for lines that are ours — identified by a
  // _pdp25_bundle_id property, which is only ever knowable by fetching
  // /cart.js fresh (the rendered DOM never exposes it). Every other
  // product's quantity input / remove link is left completely alone.
  if (window.pdp25CartListenersInit) return;
  window.pdp25CartListenersInit = true;

  // Mirrors the data-pdp25-unlock-qty values on the PDP gift cards above: 1-2
  // books unlocks none, 3-4 unlocks the mystery gift, 5+ unlocks all three.
  var GIFT_UNLOCK_THRESHOLDS = { mystery: 3, bookmark: 5, stickers: 5 };

  function fetchCart() {
    return fetch(window.routes.cart_url + '.js').then(function (response) {
      return response.json();
    });
  }

  // /cart/change.js accepts `id` as a line item key, which stays stable even
  // if other lines are added/removed around it — safer than addressing by
  // position (`line`) once several requests can be in flight.
  function cartChange(key, quantity) {
    return fetch(window.routes.cart_change_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    });
  }

  function cartAddGift(giftKey, bundleId) {
    var gift = window.pdp25GiftVariants && window.pdp25GiftVariants[giftKey];
    if (!gift || !gift.id) return Promise.resolve();
    return fetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        items: [{
          id: gift.id,
          quantity: 1,
          properties: { _pdp25_gift: 'true', _pdp25_gift_key: giftKey, _pdp25_bundle_id: bundleId }
        }]
      })
    });
  }

  function refreshSection(sectionId) {
    return fetch(window.routes.cart_url + '?section_id=' + sectionId)
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html').getElementById(sectionId);
        var live = document.getElementById(sectionId);
        if (fresh && live) live.replaceWith(fresh);
      });
  }

  // Re-renders whatever cart UI is actually on the current page — the
  // drawer/icon bubble always (cart-drawer.liquid renders sitewide), plus
  // the cart page's own line list + totals when this IS the cart page.
  function refreshCartUI() {
    var tasks = [refreshCartDrawer(false)];
    if (document.getElementById('main-cart-items')) tasks.push(refreshSection('main-cart-items'));
    if (document.getElementById('main-cart-footer')) tasks.push(refreshSection('main-cart-footer'));
    return Promise.all(tasks);
  }

  // Given a fresh cart, works out which of a bundle's gift lines its CURRENT
  // quantity no longer justifies (remove) and which it now justifies but
  // doesn't have yet (add) — same threshold table the PDP unlock UI uses.
  function diffBundleGifts(cart, bundleId) {
    var mainQuantity = 0;
    var giftsByKey = {};
    cart.items.forEach(function (item) {
      if (!item.properties || item.properties._pdp25_bundle_id !== bundleId) return;
      if (item.properties._pdp25_gift) {
        giftsByKey[item.properties._pdp25_gift_key] = item;
      } else {
        mainQuantity = item.quantity;
      }
    });

    // Never justified outside a named variant — this both stops Control
    // from ever getting a gift added here, and actively cleans up any gift
    // line that shouldn't exist (e.g. a shopper reassigned away from a
    // variant after already having one).
    var variantActive = pdp25VariantActive();

    var toRemove = [];
    var toAdd = [];
    Object.keys(GIFT_UNLOCK_THRESHOLDS).forEach(function (key) {
      var justified = variantActive && mainQuantity >= GIFT_UNLOCK_THRESHOLDS[key];
      var present = !!giftsByKey[key];
      if (present && !justified) toRemove.push(giftsByKey[key].key);
      if (!present && justified) toAdd.push(key);
    });

    return { toRemove: toRemove, toAdd: toAdd };
  }

  // Fixes ONE bundle's gift lines to match its current quantity (removing
  // what's no longer earned, adding what newly is), then refreshes the
  // visible cart UI in place — no page reload. A bundle already in sync is a
  // cheap no-op (one /cart.js fetch, nothing else — checkout is never
  // touched unless there's actually a gift to add or remove).
  function reconcileBundle(bundleId) {
    return fetchCart().then(function (cart) {
      var diff = diffBundleGifts(cart, bundleId);
      if (!diff.toRemove.length && !diff.toAdd.length) return;

      setCheckoutDisabled(true);

      return diff.toRemove
        .reduce(function (chain, key) {
          return chain.then(function () {
            return cartChange(key, 0);
          });
        }, Promise.resolve())
        .then(function () {
          return diff.toAdd.reduce(function (chain, key) {
            return chain.then(function () {
              return cartAddGift(key, bundleId);
            });
          }, Promise.resolve());
        })
        .then(refreshCartUI)
        .finally(function () {
          setCheckoutDisabled(false);
        });
    });
  }

  // Page-load safety net: the cart could have gone stale since it was last
  // rendered (edited in another tab, or an earlier visit) — sweep every
  // bundle currently in the cart once, silently, no reload either way.
  function reconcileAllBundles() {
    fetchCart()
      .then(function (cart) {
        var bundleIds = [];
        cart.items.forEach(function (item) {
          var bundleId = item.properties && item.properties._pdp25_bundle_id;
          if (bundleId && bundleIds.indexOf(bundleId) === -1) bundleIds.push(bundleId);
        });
        return bundleIds.reduce(function (chain, bundleId) {
          return chain.then(function () {
            return reconcileBundle(bundleId);
          });
        }, Promise.resolve());
      })
      .catch(function () {});
  }

  // Quantity input changed (typing a new value + blur/enter is the only
  // thing that fires `change` here — this theme's own +/- buttons don't do
  // anything at all, JS or not). Persists the edit ourselves, since nothing
  // else does, but ONLY for our own bundle lines — every other product's
  // quantity input is left exactly as-is (still not wired to anything,
  // matching today's behavior).
  document.addEventListener('change', function (event) {
    var input = event.target.closest('.quantity__input[data-index]');
    if (!input) return;
    var index = parseInt(input.getAttribute('data-index'), 10);
    var quantity = parseInt(input.value, 10);
    if (!index || isNaN(quantity)) return;

    fetchCart()
      .then(function (cart) {
        var item = cart.items[index - 1];
        var bundleId = item && item.properties && item.properties._pdp25_bundle_id;
        if (!bundleId || item.properties._pdp25_gift) return;
        return cartChange(item.key, quantity).then(function () {
          return reconcileBundle(bundleId);
        });
      })
      .catch(function () {});
  });

  // Remove-line click. On the cart page this is a real <a href> — preventing
  // that navigation only works if preventDefault() runs synchronously inside
  // this handler, before any of the async work below, so it has to happen
  // for every remove click (not just our bundle's), then fall back to doing
  // the removal ourselves via AJAX for whichever line it turns out to be.
  // The drawer's own remove button has no href already, so this is a no-op
  // there either way. Only bundle lines additionally cascade into the gift
  // reconciliation below; any other product's removal just refreshes the
  // cart UI in place instead of reloading.
  document.addEventListener('click', function (event) {
    var removeEl = event.target.closest('cart-remove-button[data-index]');
    if (!removeEl) return;
    event.preventDefault();

    var index = parseInt(removeEl.getAttribute('data-index'), 10);
    if (!index) return;

    fetchCart()
      .then(function (cart) {
        var item = cart.items[index - 1];
        if (!item) return;
        var bundleId = item.properties && item.properties._pdp25_bundle_id;
        return cartChange(item.key, 0).then(function () {
          if (bundleId && !item.properties._pdp25_gift) return reconcileBundle(bundleId);
          return refreshCartUI();
        });
      })
      .catch(function () {});
  });

  document.addEventListener('DOMContentLoaded', reconcileAllBundles);
})();
