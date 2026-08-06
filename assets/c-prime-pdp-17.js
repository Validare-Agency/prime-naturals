// Test: V_PRIME_PDP_17 | Offer Restructure - PDP
(function () {
  function isActive() {
    return Array.prototype.some.call(document.body.classList, function (className) {
      return className.indexOf('c-primePdp17Var') === 0;
    });
  }

  // A cleanup pass's OWN corrective /cart/*.js calls (removing an orphaned
  // gift, adding a newly-qualified one, syncing a discount code) are cart
  // mutations too, so the fetch patch below would otherwise treat each one
  // as a fresh external change and kick off ANOTHER full cleanup pass —
  // which, run concurrently against several such corrective calls at once,
  // raced each other trying to remove/change the same already-gone line and
  // showed up as failed change.js requests in the network tab. Anything
  // wrapped in runSuppressed() still fires normally, it just doesn't
  // re-trigger the reactive check.
  var suppressReactiveCheck = 0;
  function runSuppressed(fn) {
    suppressReactiveCheck++;
    return fn().finally(function () {
      suppressReactiveCheck--;
    });
  }

  function updateAtcPrice(root) {
    var checked = root.querySelector('.c-pdp17-row__radio:checked');
    var priceEl = root.querySelector('[data-pdp17-atc-price]');
    if (!checked || !priceEl) return;
    priceEl.textContent = checked.getAttribute('data-pdp17-price-money');
  }

  // The header's cart-count-bubble is a separate section from the drawer —
  // refreshing the drawer alone leaves it stale for every mutation OUR code
  // makes directly (gift add/remove, set cleanup, discount-sync additions),
  // since those go through raw /cart/*.js fetches, not the theme's own
  // cart.js update flow that normally keeps this in sync. Same fetch+swap
  // technique the theme itself already uses for this exact section (see
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
          // The old drawer node (and its MutationObserver) is now detached —
          // re-attach to the fresh one so drawer-DOM watching keeps working.
          observeCartDrawer();
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
    // Each entry is "variantId" or "variantId:minQty" — the quantity of the
    // main line that has to be met for THIS specific gift to stay. Entries
    // with no ":minQty" (every variant except Var F) default to the row's
    // own quantity, matching the old shared-threshold behavior exactly.
    var giftEntries = (checked.getAttribute('data-gift-variant-ids') || '')
      .split(',')
      .map(function (entry) { return entry.trim(); })
      .filter(Boolean)
      .map(function (entry) {
        var parts = entry.split(':');
        return { variantId: parts[0], minQty: parts[1] ? parseInt(parts[1], 10) : quantity };
      });

    // Complete-the-Set-style rows only: multiple co-equal "required" book
    // lines (not a single main item + dependents) — each pair is
    // "duplicateVariantId:originalVariantId", the original id being what gets
    // added independently if the shopper clicks quantity+ on that line later.
    var setPairsAttr = checked.getAttribute('data-set-variant-ids') || '';
    var ownOriginalId = checked.getAttribute('data-original-variant-id');
    var setPairs = setPairsAttr
      .split(',')
      .map(function (pair) { return pair.trim(); })
      .filter(Boolean)
      .map(function (pair) {
        var parts = pair.split(':');
        return { variantId: parts[0], originalVariantId: parts[1] };
      });
    var isSet = setPairs.length > 0 && !!ownOriginalId;
    var setSize = isSet ? setPairs.length + 1 : 1;

    var bundleId = generateBundleId();
    var mainProperties = { _pdp17_bundle_id: bundleId, _pdp17_min_qty: quantity };
    if (isSet) {
      mainProperties._pdp17_set_member = 'true';
      mainProperties._pdp17_set_size = setSize;
      mainProperties._pdp17_original_variant_id = ownOriginalId;
    }

    var items = [{ id: variantId, quantity: quantity, properties: mainProperties }];

    setPairs.forEach(function (pair) {
      items.push({
        id: pair.variantId,
        quantity: 1,
        properties: {
          _pdp17_bundle_id: bundleId,
          _pdp17_min_qty: 1,
          _pdp17_set_member: 'true',
          _pdp17_set_size: setSize,
          _pdp17_original_variant_id: pair.originalVariantId
        }
      });
    });

    giftEntries.forEach(function (giftEntry) {
      items.push({
        id: giftEntry.variantId,
        quantity: 1,
        properties: {
          _pdp17_bundle_id: bundleId,
          _pdp17_gift_for: variantId,
          _pdp17_min_qty: giftEntry.minQty
        }
      });
    });

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

  function changeLineQuantity(key, quantity) {
    return runSuppressed(function () {
      return fetch(window.routes.cart_change_url + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      });
    });
  }

  // Keeps every bundle_id group internally consistent. Two group shapes:
  //  - Legacy (Var A-F "main item + gifts"): one line has no _pdp17_gift_for
  //    (the main book/tier line); everything else is a dependent gift that
  //    drops if the main line disappears or its quantity falls below what
  //    originally qualified it.
  //  - Set (Var G "Complete the Set"): multiple co-equal lines are tagged
  //    _pdp17_set_member — ALL of them must stay present at their original
  //    quantity, or the whole group (all set members + any gifts) drops.
  //    Clicking quantity+ on one of those lines doesn't grow the bundle line;
  //    it reverts that line back to 1 and adds the extra as its own
  //    independent, normally-priced line instead.
  function fetchCart() {
    return fetch(window.routes.cart_url + '.js').then(function (response) {
      return response.json();
    });
  }

  // Resolves true if anything actually changed, so the caller knows to
  // refresh the visible drawer (these fetches don't touch its DOM directly).
  // Takes an already-fetched cart (see runCleanupPass) instead of fetching
  // its own — this and syncBuilderDiscount used to each independently GET
  // /cart.js on every check, doubling an already-frequent request.
  function cleanupOrphanedGifts(cart) {
    return Promise.resolve()
      .then(function () {
        var items = cart.items || [];
        var groups = {};
        items.forEach(function (item) {
          var bundleId = (item.properties || {})._pdp17_bundle_id;
          if (!bundleId) return;
          groups[bundleId] = groups[bundleId] || [];
          groups[bundleId].push(item);
        });

        var removals = [];
        var additions = [];

        Object.keys(groups).forEach(function (bundleId) {
          var groupItems = groups[bundleId];
          var requiredItems = groupItems.filter(function (item) {
            return !!(item.properties || {})._pdp17_set_member;
          });

          if (requiredItems.length) {
            var setSize = parseInt((requiredItems[0].properties || {})._pdp17_set_size, 10) || requiredItems.length;
            var invalid = requiredItems.length < setSize;

            requiredItems.forEach(function (item) {
              var props = item.properties || {};
              var minQty = parseInt(props._pdp17_min_qty, 10) || 1;
              if (item.quantity > minQty) {
                var extra = item.quantity - minQty;
                if (props._pdp17_original_variant_id) {
                  additions.push({ id: props._pdp17_original_variant_id, quantity: extra });
                }
                removals.push(changeLineQuantity(item.key, minQty));
              } else if (item.quantity < minQty) {
                invalid = true;
              }
            });

            if (invalid) {
              groupItems.forEach(function (item) {
                removals.push(changeLineQuantity(item.key, 0));
              });
            }
          } else {
            var mainItem = groupItems.filter(function (item) {
              return !(item.properties || {})._pdp17_gift_for;
            })[0];

            if (!mainItem) {
              // Main line is gone entirely — every dependent gift goes with it.
              groupItems.forEach(function (item) {
                removals.push(changeLineQuantity(item.key, 0));
              });
            } else {
              var presentGiftIds = groupItems
                .filter(function (item) { return item !== mainItem; })
                .map(function (item) { return item.variant_id; });

              // Var C's gift count does NOT grow monotonically with quantity —
              // 1/3/5 books each unlock a gift, but 2/4 (only reachable via the
              // cart's own stepper, no row sells those quantities) unlock none.
              // Var F IS monotonic (Stickers 3+, Mystery Gift 4+, Gift Card
              // 5+ — nothing is ever taken away once earned by quantity alone).
              // Each is looked up against its exact current quantity so both
              // additions and removals come from the same source of truth,
              // instead of checking them independently and risking drift.
              var expectedGiftIds = null;
              if (document.body.classList.contains('c-primePdp17VarC') && window.cPdp17VarCGiftMap) {
                var qtyMap = window.cPdp17VarCGiftMap;
                var mapKeys = Object.keys(qtyMap).map(Number).sort(function (a, b) { return a - b; });
                var maxKey = mapKeys[mapKeys.length - 1];
                var lookupQty = mainItem.quantity >= maxKey ? maxKey : mainItem.quantity;
                expectedGiftIds = qtyMap[lookupQty] || [];
              } else if (document.body.classList.contains('c-primePdp17VarF') && window.cPdp17VarFGiftLadder) {
                expectedGiftIds = window.cPdp17VarFGiftLadder
                  .filter(function (rung) { return mainItem.quantity >= rung.minQty; })
                  .map(function (rung) { return rung.id; });
              }

              if (expectedGiftIds) {
                groupItems.forEach(function (item) {
                  if (item === mainItem) return;
                  if (expectedGiftIds.indexOf(item.variant_id) === -1) {
                    removals.push(changeLineQuantity(item.key, 0));
                  }
                });
                expectedGiftIds.forEach(function (giftId) {
                  if (presentGiftIds.indexOf(giftId) === -1) {
                    additions.push({
                      id: giftId,
                      quantity: 1,
                      properties: { _pdp17_bundle_id: bundleId, _pdp17_gift_for: mainItem.variant_id }
                    });
                  }
                });
              } else {
                // Var B/G etc.: single shared threshold set at Add to Cart time.
                groupItems.forEach(function (item) {
                  if (item === mainItem) return;
                  var giftMinQty = parseInt((item.properties || {})._pdp17_min_qty, 10) || 1;
                  if (mainItem.quantity < giftMinQty) {
                    removals.push(changeLineQuantity(item.key, 0));
                  }
                });
              }
            }
          }
        });

        if (!removals.length && !additions.length) return false;

        return Promise.all(removals)
          .then(function () {
            if (!additions.length) return;
            return runSuppressed(function () {
              return fetch(window.routes.cart_add_url + '.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ items: additions })
              });
            });
          })
          .then(function () {
            return true;
          });
      });
  }

  // Var H: keeps the applied discount code in sync with the CURRENT total
  // quantity of the 3 bundle-eligible books, even after the initial add — so
  // removing 1 of 4 books re-syncs from the 35%-off code down to the 25%-off
  // one automatically, instead of leaving a stale/mismatched discount applied.
  // Runs globally (not just when the builder widget is on the page) using
  // window.cPdp17BuilderVariantIds, set once per page load in theme.liquid.
  // NOTE: Shopify's /cart/update.js discount param replaces ALL applied
  // codes, not just this one — if a shopper has a separate, unrelated code
  // entered too, re-syncing here will clear it. Accepted tradeoff.
  function syncBuilderDiscount(cart) {
    var variantIds = window.cPdp17BuilderVariantIds;
    if (!variantIds || !variantIds.length) return Promise.resolve(false);

    return Promise.resolve()
      .then(function () {
        var totalQty = (cart.items || [])
          .filter(function (item) {
            return variantIds.indexOf(item.variant_id) !== -1;
          })
          .reduce(function (sum, item) {
            return sum + item.quantity;
          }, 0);

        var tier = pdp17BuilderTierFor(totalQty);
        var desiredCode = tier ? tier.code : '';
        var appliedCodes = (cart.discount_codes || []).map(function (d) {
          return d.code;
        });

        var appliedIsOneOfOurs = appliedCodes.some(function (code) {
          return PDP17_BUILDER_TIERS.some(function (t) {
            return t.code === code;
          });
        });

        var alreadyCorrect = desiredCode
          ? appliedCodes.length === 1 && appliedCodes[0] === desiredCode
          : !appliedIsOneOfOurs;
        if (alreadyCorrect) return false;

        return runSuppressed(function () {
          return fetch(window.routes.cart_update_url + '.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ discount: desiredCode })
          });
        }).then(function () {
          return true;
        });
      });
  }

  // Disables the checkout button (real disabled attribute, not just a style —
  // a disabled submit button can't be activated at all) for as long as any
  // cart mutation we care about is still being verified/cleaned up. Simpler
  // and more robust than intercepting the checkout click/submit itself, which
  // ran into real theme quirks (checkout button lives outside its <form>,
  // associated only via form="...").  Counter-based so overlapping mutations
  // don't re-enable the button while another one is still in flight.
  var checkoutBusyCount = 0;
  function setCheckoutBusy(busy) {
    checkoutBusyCount = Math.max(0, checkoutBusyCount + (busy ? 1 : -1));
    var isBusy = checkoutBusyCount > 0;
    document.querySelectorAll('[name="checkout"]').forEach(function (btn) {
      btn.disabled = isBusy;
      btn.classList.toggle('c-pdp17-checkout-pending', isBusy);
    });
  }

  // Var A/B/C/D/E: tier 1 adds the REAL product variant; tiers 2+ add a
  // DIFFERENT (duplicate) variant with its own bundle discount. The cart's
  // own "+"/"-" stepper only ever changes the quantity of whichever variant
  // is already on the line, so bumping a tier-1 line's quantity via the cart
  // can never reach the duplicate's tier pricing on its own — it just buys
  // more of the real variant at whatever (unrelated) discount that variant's
  // own native config happens to give. This swaps the line over to the
  // correct variant for its CURRENT quantity, in either direction.
  function activeVariantLadder() {
    var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (var i = 0; i < letters.length; i++) {
      if (document.body.classList.contains('c-primePdp17Var' + letters[i])) {
        return (window.cPdp17VariantLadders || {})[letters[i]] || null;
      }
    }
    return null;
  }

  function swapMainLineVariants(cart) {
    var ladder = activeVariantLadder();
    if (!ladder) return Promise.resolve(false);

    var items = cart.items || [];
    var groups = {};
    items.forEach(function (item) {
      var bundleId = (item.properties || {})._pdp17_bundle_id;
      if (!bundleId) return;
      groups[bundleId] = groups[bundleId] || [];
      groups[bundleId].push(item);
    });

    var swaps = [];
    Object.keys(groups).forEach(function (bundleId) {
      var groupItems = groups[bundleId];
      var mainItem = groupItems.filter(function (item) {
        var props = item.properties || {};
        return !props._pdp17_gift_for && !props._pdp17_set_member;
      })[0];
      if (!mainItem) return;

      var rung = ladder.filter(function (r) {
        return r.dupId && (r.realId === mainItem.variant_id || r.dupId === mainItem.variant_id);
      })[0];
      if (!rung) return;

      var correctId = mainItem.quantity >= rung.threshold ? rung.dupId : rung.realId;
      if (correctId !== mainItem.variant_id) {
        swaps.push({ item: mainItem, correctId: correctId });
      }
    });

    if (!swaps.length) return Promise.resolve(false);

    return Promise.all(swaps.map(function (swap) {
      return changeLineQuantity(swap.item.key, 0);
    }))
      .then(function () {
        return runSuppressed(function () {
          return fetch(window.routes.cart_add_url + '.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              items: swaps.map(function (swap) {
                return { id: swap.correctId, quantity: swap.item.quantity, properties: swap.item.properties };
              })
            })
          });
        });
      })
      .then(function () {
        return true;
      });
  }

  // Single shared cart read for all three checks — each used to fetch
  // /cart.js independently every time they ran together, tripling an
  // already-frequent request.
  // The fetch patch AND the cart-drawer MutationObserver both react to the
  // same external change (e.g. clicking "+" triggers a fetch AND re-renders
  // the drawer, which the observer also sees) — without this guard, two
  // concurrent passes each fetch the SAME pre-swap/pre-cleanup cart snapshot
  // and each independently decide to add the same corrective line, which
  // Shopify merges into one line at DOUBLE the intended quantity. Concurrent
  // callers share this one in-flight pass instead of each starting their own.
  var cleanupInFlight = null;
  function runCleanupPass() {
    if (cleanupInFlight) return cleanupInFlight;
    cleanupInFlight = fetchCart()
      .then(function (cart) {
        return Promise.all([
          cleanupOrphanedGifts(cart),
          syncBuilderDiscount(cart),
          swapMainLineVariants(cart)
        ]);
      })
      .finally(function () {
        cleanupInFlight = null;
      });
    return cleanupInFlight;
  }

  var pendingCheck = null;
  function scheduleCartCheck(delay) {
    clearTimeout(pendingCheck);
    pendingCheck = setTimeout(function () {
      runCleanupPass().then(function (results) {
        if (results.indexOf(true) !== -1) refreshCartDrawer();
      });
    }, delay || 60);
  }

  // React instantly to any Shopify cart AJAX call, from anywhere on the site,
  // regardless of who made it — the drawer's own remove/quantity controls,
  // the cart page, or our own addToCart above. Checkout stays disabled from
  // the moment the request goes out until THIS mutation's own cleanup pass
  // finishes. This single pass also does the busy-tracking's own job (an
  // earlier version ran a second, separate pass via scheduleCartCheck on
  // every mutation on top of this one — same work done twice).
  (function patchFetchForCartChanges() {
    if (window.__cPdp17FetchPatched) return;
    window.__cPdp17FetchPatched = true;

    var originalFetch = window.fetch;
    window.fetch = function () {
      var target = arguments[0];
      var url = typeof target === 'string' ? target : (target && target.url) || '';
      var isCartMutation = /\/cart\/(add|change|update|clear)(\.js)?(\?|$)/.test(url);
      // A cleanup pass's own corrective calls are wrapped in runSuppressed
      // and shouldn't re-trigger another pass on top of the one they're
      // already part of — see the note on suppressReactiveCheck above.
      var shouldReact = isCartMutation && suppressReactiveCheck === 0;
      if (shouldReact) setCheckoutBusy(true);
      var result = originalFetch.apply(this, arguments);
      if (shouldReact) {
        result
          .then(function () { return runCleanupPass(); }, function () { return null; })
          .then(function (results) {
            if (results && results.indexOf(true) !== -1) refreshCartDrawer();
          })
          .catch(function () {})
          .then(function () { setCheckoutBusy(false); });
      }
      return result;
    };
  })();

  // Belt-and-braces: also watch the drawer's own DOM for changes, in case the
  // theme's cart-drawer uses something other than fetch (e.g. XMLHttpRequest)
  // internally — we don't control or know its exact implementation.
  function observeCartDrawer() {
    var drawer = document.querySelector('cart-drawer');
    if (!drawer || drawer.dataset.pdp17Observed) return;
    drawer.dataset.pdp17Observed = 'true';
    new MutationObserver(function () {
      scheduleCartCheck(120);
    }).observe(drawer, { childList: true, subtree: true });
  }
  document.addEventListener('DOMContentLoaded', observeCartDrawer);

  // Final safety net for anything neither of the above catches (e.g. a
  // non-fetch, non-DOM-mutating change to the cart from another tab). The
  // fetch patch reacts within ~0ms and the DOM observer within ~120ms of any
  // real mutation, so this doesn't need to be fast — it was previously
  // polling /cart.js twice every 1.5s, forever, on every page of the site
  // regardless of whether the shopper had any pdp17 items in their cart at
  // all, which is what shows up as constant background traffic in the
  // network tab. 20s keeps it a genuine last resort without the noise.
  setInterval(function () {
    runCleanupPass().then(function (results) {
      if (results.indexOf(true) !== -1) refreshCartDrawer();
    });
  }, 20000);

  // Var C's "Free Gifts Unlocked" panel reflects whichever tier is currently
  // selected, not a fixed state — each gift card unlocks once the selected
  // row's tier position (data-tier) meets its own data-min-tier.
  function updateGiftLocks(root) {
    var checked = root.querySelector('.c-pdp17-row__radio:checked');
    var tier = checked ? parseInt(checked.getAttribute('data-tier'), 10) || 1 : 1;
    root.querySelectorAll('.c-pdp17-gift-card').forEach(function (card) {
      var minTier = parseInt(card.getAttribute('data-min-tier'), 10) || 1;
      card.classList.toggle('is-unlocked', tier >= minTier);
    });
  }

  function initRoot(root) {
    if (root.dataset.pdp17Init) return;
    root.dataset.pdp17Init = 'true';

    root.querySelectorAll('.c-pdp17-row__radio').forEach(function (radio) {
      radio.addEventListener('change', function () {
        updateAtcPrice(root);
        updateGiftLocks(root);
      });
    });
    updateAtcPrice(root);
    updateGiftLocks(root);

    var atcButton = root.querySelector('[data-pdp17-atc]');
    if (atcButton) {
      atcButton.addEventListener('click', function () {
        addToCart(root, atcButton);
      });
    }
  }

  // Var H: "Build your bundle" — a shared, cross-product discount ladder
  // (2 books=15%, 3=25%, 4+=35%, capped) applied via a manual Shopify
  // discount code, NOT an automatic discount — automatic discounts evaluate
  // every cart store-wide and would leak into Control and every other
  // checkout flow. A code only ever applies when this JS explicitly sets it.
  var PDP17_BUILDER_TIERS = [
    { min: 2, percent: 15, code: 'PDP17-BUNDLE-15' },
    { min: 3, percent: 25, code: 'PDP17-BUNDLE-25' },
    { min: 4, percent: 35, code: 'PDP17-BUNDLE-35' }
  ];

  function pdp17BuilderTierFor(totalQty) {
    var applicable = null;
    PDP17_BUILDER_TIERS.forEach(function (tier) {
      if (totalQty >= tier.min) applicable = tier;
    });
    return applicable;
  }

  function initBundleBuilder() {
    var root = document.querySelector('[data-pdp17-builder]');
    // Separate flag from initRoot's — this element is both a .c-pdp17-variant
    // (so initRoot also runs on it, harmlessly, since it has none of the
    // selectors initRoot looks for) and the builder root, and both functions
    // must not share one "already initialized" dataset key on the same node.
    if (!root || root.dataset.pdp17BuilderInit) return;
    root.dataset.pdp17BuilderInit = 'true';

    var CURRENCY_SYMBOLS = { USD: '$', AUD: 'AU$', CAD: 'CA$', GBP: '£', NZD: 'NZ$' };
    var currency = String(window.cPrimeCart15Currency || 'USD').toUpperCase();
    var symbol = CURRENCY_SYMBOLS[currency] || '$';

    function formatMoney(cents) {
      return symbol + (cents / 100).toFixed(2);
    }

    var rows = Array.prototype.slice.call(root.querySelectorAll('[data-pdp17-builder-row]'));
    var trackFill = root.querySelector('[data-pdp17-track-fill]');
    var nodes = Array.prototype.slice.call(root.querySelectorAll('[data-pdp17-node]'));
    var cta = root.querySelector('[data-pdp17-builder-cta]');
    var ctaCompare = root.querySelector('[data-pdp17-builder-cta-compare]');
    var ctaText = root.querySelector('[data-pdp17-builder-cta-text]');

    function rowQty(row) {
      return parseInt(row.querySelector('[data-pdp17-qty]').textContent, 10) || 0;
    }

    function setRowQty(row, qty) {
      var clamped = Math.max(0, qty);
      row.querySelector('[data-pdp17-qty]').textContent = String(clamped);
      row.querySelector('[data-pdp17-add]').hidden = clamped > 0;
      row.querySelector('[data-pdp17-stepper]').hidden = clamped === 0;
    }

    function render() {
      var totalQty = 0;
      var totalCents = 0;

      rows.forEach(function (row) {
        var qty = rowQty(row);
        var priceCents = parseInt(row.getAttribute('data-price-cents'), 10) || 0;
        totalQty += qty;
        totalCents += qty * priceCents;
      });

      // Nothing is filled at 0 items — the line and node 1 both start empty,
      // and node 1 only activates once the first book is actually added.
      var filledCount = Math.min(totalQty, 4);
      nodes.forEach(function (node) {
        var n = parseInt(node.getAttribute('data-pdp17-node'), 10);
        node.classList.toggle('is-filled', n <= filledCount);
      });
      if (trackFill) {
        // Overshoots each reached node by ~6% instead of stopping exactly at
        // it, so the fill always reads as "past" that node, not flush with it.
        var basePercent = filledCount === 0 ? 0 : Math.max(4, ((filledCount - 1) / 3) * 100);
        var fillPercent = filledCount === 0 ? 0 : Math.min(100, basePercent + 8.56);
        trackFill.style.width = fillPercent + '%';
      }

      var tier = pdp17BuilderTierFor(totalQty);

      if (totalQty === 0) {
        cta.disabled = true;
        ctaCompare.hidden = true;
        ctaText.textContent = 'ADD TO CART';
      } else if (!tier) {
        cta.disabled = false;
        ctaCompare.hidden = true;
        ctaText.textContent = formatMoney(totalCents) + ' ADD TO CART';
      } else {
        var discounted = Math.round(totalCents * (1 - tier.percent / 100));
        cta.disabled = false;
        ctaCompare.hidden = false;
        ctaCompare.textContent = formatMoney(totalCents);
        ctaText.textContent = formatMoney(discounted) + ' ADD TO CART';
      }
    }

    rows.forEach(function (row) {
      row.querySelector('[data-pdp17-add]').addEventListener('click', function () {
        setRowQty(row, 1);
        render();
      });
      row.querySelector('[data-pdp17-increment]').addEventListener('click', function () {
        setRowQty(row, rowQty(row) + 1);
        render();
      });
      row.querySelector('[data-pdp17-decrement]').addEventListener('click', function () {
        setRowQty(row, rowQty(row) - 1);
        render();
      });
    });

    cta.addEventListener('click', function () {
      if (cta.disabled) return;

      var items = rows
        .map(function (row) {
          return { id: row.getAttribute('data-variant-id'), quantity: rowQty(row) };
        })
        .filter(function (item) {
          return item.quantity > 0;
        });
      if (!items.length) return;

      var totalQty = items.reduce(function (sum, item) {
        return sum + item.quantity;
      }, 0);
      var tier = pdp17BuilderTierFor(totalQty);

      cta.disabled = true;
      fetch(window.routes.cart_add_url + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: items })
      })
        .then(function (response) {
          if (!response.ok) return Promise.reject(response);
          if (!tier) return;
          return fetch(window.routes.cart_update_url + '.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ discount: tier.code })
          });
        })
        .then(function () {
          rows.forEach(function (row) {
            setRowQty(row, 0);
          });
          render();
          return refreshCartDrawer();
        })
        .catch(function () {})
        .finally(function () {
          cta.disabled = rows.every(function (row) {
            return rowQty(row) === 0;
          });
        });
    });

    render();
  }

  function run() {
    if (!isActive()) return;
    document.querySelectorAll('.c-pdp17-variant').forEach(initRoot);
    initBundleBuilder();
  }

  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('ig:ready', run);
})();
