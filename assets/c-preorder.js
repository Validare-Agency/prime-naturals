// Pre-order PDP blocks — snippets/c-preorder-blocks.liquid
(function () {
  /* ───── Review carousel ───── */
  function initReviews(root) {
    if (root.dataset.cPreInit) return;
    root.dataset.cPreInit = 'true';

    var slides = root.querySelectorAll('.c-pre-reviews__slide');
    var dots = root.querySelectorAll('[data-c-pre-reviews-dot]');
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;
    var delay = (parseInt(root.dataset.autoplay, 10) || 0) * 1000;

    function goTo(index) {
      slides[current].classList.remove('is-active');
      if (dots[current]) dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    }

    function restart() {
      if (!delay) return;
      clearInterval(timer);
      timer = setInterval(function () {
        goTo(current + 1);
      }, delay);
    }

    var prev = root.querySelector('[data-c-pre-reviews-prev]');
    var next = root.querySelector('[data-c-pre-reviews-next]');
    if (prev) prev.addEventListener('click', function () { goTo(current - 1); restart(); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); restart(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.getAttribute('data-c-pre-reviews-dot'), 10));
        restart();
      });
    });
    restart();
  }

  /* ───── Countdown ───── */
  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function initCountdown(root) {
    if (root.dataset.cPreInit) return;
    root.dataset.cPreInit = 'true';

    var end = new Date(root.dataset.end).getTime();
    if (isNaN(end)) return;

    var units = {};
    root.querySelectorAll('[data-unit]').forEach(function (el) {
      units[el.getAttribute('data-unit')] = el;
    });
    var label = root.querySelector('[data-c-pre-countdown-label]');
    var timer = null;

    function tick() {
      var diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      if (diff === 0) {
        clearInterval(timer);
        root.classList.add('is-expired');
        if (label && root.dataset.expiredText) label.textContent = root.dataset.expiredText;
        return;
      }
      units.days.textContent = pad(Math.floor(diff / 86400));
      units.hours.textContent = pad(Math.floor((diff % 86400) / 3600));
      units.minutes.textContent = pad(Math.floor((diff % 3600) / 60));
      units.seconds.textContent = pad(diff % 60);
    }

    tick();
    timer = setInterval(tick, 1000);
  }

  /* ───── Offer + pre-order button ───── */
  function getScope(el) {
    return el.closest('product-info') || el.closest('section') || document;
  }

  function getSelection(scope) {
    var offer = scope.querySelector('[data-c-pre-offer]');
    if (!offer) return null;
    var tier = offer.querySelector('.c-pre-tier__radio:checked');
    var addon = offer.querySelector('[data-c-pre-addon]');
    return {
      tier: tier,
      addonChecked: !!(addon && addon.checked),
      addonVariantId: addon ? addon.closest('[data-variant-id]').getAttribute('data-variant-id') : null
    };
  }

  function updateAtcLabel(scope) {
    var button = scope.querySelector('[data-c-pre-atc]');
    if (!button || button.disabled) return;
    var selection = getSelection(scope);
    var money = button.dataset.money;
    if (selection && selection.tier) {
      money = selection.addonChecked && selection.tier.dataset.moneyWithAddon
        ? selection.tier.dataset.moneyWithAddon
        : selection.tier.dataset.money;
    }
    button.textContent = (button.dataset.label || '').replace('[price]', money);
  }

  function refreshCart() {
    var drawerReq = fetch(window.routes.cart_url + '?section_id=cart-drawer')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-drawer');
        var live = document.querySelector('cart-drawer');
        if (fresh && live) {
          live.replaceWith(fresh);
          fresh.classList.add('active');
        }
      });
    var bubbleReq = fetch(window.routes.cart_url + '?section_id=cart-icon-bubble')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('.shopify-section');
        var live = document.getElementById('cart-icon-bubble');
        if (fresh && live) live.innerHTML = fresh.innerHTML;
      });
    return Promise.all([drawerReq, bubbleReq]);
  }

  function addToCart(button) {
    var scope = getScope(button);
    var selection = getSelection(scope);
    var errorEl = button.parentElement.querySelector('[data-c-pre-atc-error]');

    var properties = {};
    if (button.dataset.preorder === 'true') {
      // Hidden flag — drives the "Pre-order" badge in the cart drawer / cart page.
      properties._preorder = button.dataset.propertyValue || 'true';
    }
    if (button.dataset.propertyName && button.dataset.propertyValue) {
      properties[button.dataset.propertyName] = button.dataset.propertyValue;
    }

    var mainVariant = button.dataset.variantId;
    var quantity = 1;
    if (selection && selection.tier) {
      mainVariant = selection.tier.dataset.variantId;
      quantity = parseInt(selection.tier.dataset.quantity, 10) || 1;
      properties._preorder_bundle_qty = String(quantity);
    }

    var items = [{ id: mainVariant, quantity: quantity, properties: properties }];

    if (selection && selection.addonChecked && selection.addonVariantId) {
      items.push({ id: selection.addonVariantId, quantity: 1, properties: { _preorder_addon: 'true' } });
    }

    if (button.dataset.addGifts === 'true') {
      scope.querySelectorAll('[data-c-pre-gift-variant]').forEach(function (gift) {
        items.push({
          id: gift.getAttribute('data-c-pre-gift-variant'),
          quantity: 1,
          properties: { _preorder_gift: 'true' }
        });
      });
    }

    button.disabled = true;
    button.classList.add('is-loading');
    if (errorEl) errorEl.hidden = true;

    // Free pre-order gift: its own line, added in the same request as the
    // book, add-on and gifts, once per cart. Shopify lists the last item of a
    // multi-item add first, so the gift goes first in the request to land at
    // the bottom of the cart.
    var giftVariant = button.dataset.giftVariant;
    var giftCheck = giftVariant
      ? fetch(window.routes.cart_url + '.js', { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json(); })
          .then(function (cart) {
            return !cart.items.some(function (line) { return String(line.variant_id) === giftVariant; });
          })
          .catch(function () { return true; })
      : Promise.resolve(false);

    giftCheck
      .then(function (addGift) {
        if (addGift) {
          items.unshift({
            id: giftVariant,
            quantity: 1,
            properties: { _preorder_gift: 'true' }
          });
        }
        return fetch(window.routes.cart_add_url + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: items })
        });
      })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) return Promise.reject(data);
          return refreshCart();
        });
      })
      .catch(function (error) {
        if (!errorEl) return;
        errorEl.textContent = (error && (error.description || error.message)) || 'Something went wrong. Please try again.';
        errorEl.hidden = false;
      })
      .finally(function () {
        button.disabled = false;
        button.classList.remove('is-loading');
      });
  }

  function initOffer(offer) {
    if (offer.dataset.cPreInit) return;
    offer.dataset.cPreInit = 'true';
    var scope = getScope(offer);

    if (!offer.querySelector('.c-pre-tier__radio:checked')) {
      var first = offer.querySelector('.c-pre-tier__radio');
      if (first) first.checked = true;
    }

    offer.addEventListener('change', function () {
      updateAtcLabel(scope);
    });
    updateAtcLabel(scope);
  }

  function initAtc(button) {
    if (button.dataset.cPreInit) return;
    button.dataset.cPreInit = 'true';
    button.addEventListener('click', function () {
      addToCart(button);
    });
    updateAtcLabel(getScope(button));
  }

  // Per-visitor stock count: a random start (e.g. 300–350) saved in
  // localStorage, lowered by a random 1–5 for every full hour since it was
  // last updated, never below the floor.
  var HOUR = 3600000;

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function initStock(root) {
    if (root.dataset.cPreInit) return;
    root.dataset.cPreInit = 'true';

    var d = root.dataset;
    var total = parseInt(d.total, 10);
    var startMin = parseInt(d.startMin, 10);
    var startMax = parseInt(d.startMax, 10);
    var dropMin = parseInt(d.dropMin, 10);
    var dropMax = parseInt(d.dropMax, 10);
    var floor = parseInt(d.floor, 10) || 0;
    var now = Date.now();
    var state = null;

    try {
      state = JSON.parse(localStorage.getItem(d.key));
    } catch (e) {}

    if (!state || typeof state.left !== 'number' || typeof state.ts !== 'number' || state.left > total) {
      state = { left: randomInt(startMin, startMax), ts: now };
    } else {
      var hours = Math.floor((now - state.ts) / HOUR);
      for (var i = 0; i < hours && state.left > floor; i++) {
        state.left -= randomInt(dropMin, dropMax);
      }
      state.left = Math.max(floor, state.left);
      if (hours > 0) state.ts += hours * HOUR;
    }

    try {
      localStorage.setItem(d.key, JSON.stringify(state));
    } catch (e) {}

    var text = root.querySelector('[data-c-pre-stock-text]');
    var bar = root.querySelector('[data-c-pre-stock-bar]');
    if (text) text.textContent = d.text.replace('[left]', state.left);
    if (bar) {
      bar.setAttribute('aria-valuenow', state.left);
      var fill = bar.querySelector('span');
      if (fill) fill.style.width = (state.left * 100) / total + '%';
    }
    root.classList.add('is-ready');
  }

  function run() {
    document.querySelectorAll('[data-c-pre-stock]').forEach(initStock);
    document.querySelectorAll('[data-c-pre-reviews]').forEach(initReviews);
    document.querySelectorAll('[data-c-pre-countdown]').forEach(initCountdown);
    document.querySelectorAll('[data-c-pre-offer]').forEach(initOffer);
    document.querySelectorAll('[data-c-pre-atc]').forEach(initAtc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Theme editor: re-init when a section/block is re-rendered.
  document.addEventListener('shopify:section:load', run);
})();
