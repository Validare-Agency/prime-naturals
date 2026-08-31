/* <-------------------Product gallery: prevent whitespace from mixed image aspect ratios-----------------> */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('media-gallery').forEach(function (gallery) {
    var viewer = gallery.querySelector('[id^="GalleryViewer"]');
    var row = viewer && viewer.querySelector('[id^="Slider-"]');
    if (!viewer || !row) return;

    viewer.addEventListener('slideChanged', function (event) {
      var slide = event.detail && event.detail.currentElement;
      if (!slide) return;
      row.style.height = slide.offsetHeight + 'px';
    });
  });
});

// Test: V_PRIME_PDP_20 | Product Page - USPs - ATF
(function () {
  var path = window.location.pathname.toLowerCase();
  var isOlderAgeProduct = path.indexOf('leadership') !== -1 || path.indexOf('murphy') !== -1;
  var ageBadgeText = isOlderAgeProduct ? 'Age: 8-12' : 'Age: 6-12';

  var BOOK_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g clip-path="url(#clip0_837_8026)"><path d="M2.66663 13.0026C2.66663 12.5606 2.84222 12.1367 3.15478 11.8241C3.46734 11.5115 3.89127 11.3359 4.33329 11.3359H13.3333" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.33329 1.33594H13.3333V14.6693H4.33329C3.89127 14.6693 3.46734 14.4937 3.15478 14.1811C2.84222 13.8686 2.66663 13.4446 2.66663 13.0026V3.0026C2.66663 2.56058 2.84222 2.13665 3.15478 1.82409C3.46734 1.51153 3.89127 1.33594 4.33329 1.33594Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_837_8026"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>';
  var SHIELD_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g clip-path="url(#clip0_837_8031)"><path d="M7.99996 14.6693C7.99996 14.6693 13.3333 12.0026 13.3333 8.0026V3.33594L7.99996 1.33594L2.66663 3.33594V8.0026C2.66663 12.0026 7.99996 14.6693 7.99996 14.6693Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 7.9974L7.33333 9.33073L10 6.66406" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_837_8031"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>';
  var AGE_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.3333 14V12.6667C13.3333 11.9594 13.0523 11.2811 12.5522 10.781C12.0521 10.281 11.3739 10 10.6666 10H5.33329C4.62605 10 3.94777 10.281 3.44767 10.781C2.94758 11.2811 2.66663 11.9594 2.66663 12.6667V14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.00004 7.33333C9.4728 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.4728 2 8.00004 2C6.52728 2 5.33337 3.19391 5.33337 4.66667C5.33337 6.13943 6.52728 7.33333 8.00004 7.33333Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var BADGE_BORDER = '<svg class="badge-border" aria-hidden="true"><rect x="0.5" y="0.5" rx="10" ry="10"/></svg>';

  function makeBadgesEl(modifierClass) {
    var div = document.createElement('div');
    div.className = 'c-pdp20-badges ' + modifierClass;
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML =
      '<span class="c-pdp20-badge">' + BOOK_ICON + 'Hardcover' + BADGE_BORDER + '</span>' +
      '<span class="c-pdp20-badge">' + SHIELD_ICON + '30-Days Guarantee' + BADGE_BORDER + '</span>' +
      '<span class="c-pdp20-badge">' + AGE_ICON + ageBadgeText + BADGE_BORDER + '</span>';
    if (badgeResizeObserver) {
      div.querySelectorAll('.c-pdp20-badge').forEach(function (badge) {
        badgeResizeObserver.observe(badge);
      });
    }
    return div;
  }

  function sizeOneBadgeBorder(badge) {
    var svg = badge.querySelector('.badge-border');
    var rect = svg && svg.querySelector('rect');
    if (!svg || !rect) return;
    var w = badge.offsetWidth;
    var h = badge.offsetHeight;
    if (!w || !h) return;
    var outerRadius = parseFloat(getComputedStyle(badge).borderRadius) || 0;
    var innerRadius = Math.max(0, outerRadius - 0.5);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    rect.setAttribute('width', w - 1);
    rect.setAttribute('height', h - 1);
    rect.setAttribute('rx', innerRadius);
    rect.setAttribute('ry', innerRadius);
  }

  function sizeBadgeBorders() {
    document.querySelectorAll('.c-pdp20-badge').forEach(sizeOneBadgeBorder);
  }

  // Re-measures a badge the instant its rendered box size changes for any
  // reason — including a variant toggle flipping its group from
  // display:none to visible without a full page reload, which a one-time
  // DOMContentLoaded/resize measurement would otherwise miss.
  var badgeResizeObserver = (typeof ResizeObserver !== 'undefined')
    ? new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        sizeOneBadgeBorder(entry.target);
      });
    })
    : null;

  function injectBadges() {
    // Var A — inserted after media-gallery (below the full thumbnail rail,
    // inside the media column on desktop; between gallery and info on mobile)
    var mediaGallery = document.querySelector('media-gallery');
    if (mediaGallery) {
      mediaGallery.after(makeBadgesEl('c-pdp20-badges--a'));
    }

    // Var B — mobile: after .pib-carousel (below the review card)
    var carousel = document.querySelector('.pib-carousel');
    if (carousel) {
      carousel.after(makeBadgesEl('c-pdp20-badges--b c-pdp20-badges--b-mobile'));
    }

    // Var C — inserted after the product title element
    // (.pib-title for pib-wrap templates; .product__title for standard theme blocks)
    var titleEl = document.querySelector('.pib-title') ||
      document.querySelector('.product__title');

    // Var B — desktop: after .pib-scarcity, right above the title
    // (falls back to right before the title on templates with no scarcity badge)
    var scarcity = document.querySelector('.pib-scarcity');
    if (scarcity) {
      scarcity.after(makeBadgesEl('c-pdp20-badges--b c-pdp20-badges--b-desktop'));
    } else if (titleEl) {
      titleEl.before(makeBadgesEl('c-pdp20-badges--b c-pdp20-badges--b-desktop'));
    }

    if (titleEl) {
      titleEl.after(makeBadgesEl('c-pdp20-badges--c'));
    }

    sizeBadgeBorders();
  }

  document.addEventListener('DOMContentLoaded', injectBadges);
  window.addEventListener('resize', sizeBadgeBorders);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sizeBadgeBorders);
  }
})();

// Test: V_PRIME_PDP_22 | Encyclopedia - Upsell
(function () {
  var UPSELL_PRODUCTS = {
    leadership: {
      handle: 'leadership-enlightenment-for-kids',
      title: 'Leadership Enlightenment For Kids',
      desc: 'Life lessons before life teaches them'
    },
    murphy: {
      handle: 'murphys-law-for-kids',
      title: "Murphy's Law For Kids",
      desc: 'Teaches your child to handle anything life throws at them'
    }
  };

  var upsellData = { leadership: null, murphy: null };
  var MODULE_ID = 'c-pdp22-upsell';

  function isAnyVariant() {
    var b = document.body.classList;
    return b.contains('c-primePdp22VarA') || b.contains('c-primePdp22VarB') ||
           b.contains('c-primePdp22VarC') || b.contains('c-primePdp22VarD') ||
           b.contains('c-primePdp22VarE') || b.contains('c-primePdp22VarF');
  }

  function isCheckboxVariant() {
    var b = document.body.classList;
    return b.contains('c-primePdp22VarA') || b.contains('c-primePdp22VarC') ||
           b.contains('c-primePdp22VarE');
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
  }

  function getCartUrl() {
    return (window.routes && window.routes.cart_url) ? window.routes.cart_url : '/cart';
  }

  function getCartAddUrl() {
    return (window.routes && window.routes.cart_add_url)
      ? window.routes.cart_add_url + '.js'
      : '/cart/add.js';
  }

  function fetchProductData(key) {
    var handle = UPSELL_PRODUCTS[key].handle;
    return fetch('/products/' + handle + '.js')
      .then(function (r) {
        if (!r.ok) throw new Error('product not found: ' + handle);
        return r.json();
      })
      .then(function (data) {
        var variant = data.variants && data.variants[0];
        if (!variant) throw new Error('no variants');
        upsellData[key] = {
          variantId: variant.id,
          price: variant.price,
          comparePrice: variant.compare_at_price || variant.price * 2,
          image: (data.images && data.images[0] && data.images[0].src) ? data.images[0].src : ''
        };
      })
      .catch(function () { /* graceful — row stays in loading state */ });
  }

  function updateRowDisplay(key) {
    var row = document.querySelector('[data-c-pdp22-key="' + key + '"]');
    var data = upsellData[key];
    if (!row || !data) return;
    var thumb = row.querySelector('.c-pdp22-upsell__thumb');
    if (thumb && data.image) thumb.src = data.image;
    var priceEl = row.querySelector('.c-pdp22-upsell__price');
    if (priceEl) priceEl.textContent = formatMoney(data.price);
    var compareEl = row.querySelector('.c-pdp22-upsell__compare');
    if (compareEl) compareEl.textContent = formatMoney(data.comparePrice);
  }

  function buildRowHTML(key) {
    var p = UPSELL_PRODUCTS[key];
    return '<div class="c-pdp22-upsell__row c-pdp22-upsell__row--' + key + '"' +
           ' data-c-pdp22-key="' + key + '" data-c-pdp22-state="idle">' +
      '<label class="c-pdp22-upsell__check-wrap">' +
        '<input type="checkbox" class="c-pdp22-upsell__checkbox"' +
               ' data-c-pdp22-checkbox="' + key + '">' +
        '<span class="c-pdp22-upsell__checkmark"></span>' +
      '</label>' +
      '<img class="c-pdp22-upsell__thumb" src="" alt="' + p.title + '">' +
      '<div class="c-pdp22-upsell__body">' +
        '<p class="c-pdp22-upsell__title">' + p.title + '</p>' +
        '<p class="c-pdp22-upsell__desc">' + p.desc + '</p>' +
      '</div>' +
      '<div class="c-pdp22-upsell__prices">' +
        '<span class="c-pdp22-upsell__price">—</span>' +
        '<span class="c-pdp22-upsell__compare">—</span>' +
      '</div>' +
      '<button class="c-pdp22-upsell__add-btn" data-c-pdp22-add="' + key + '"' +
              ' type="button" aria-label="Add ' + p.title + '">Add</button>' +
      '<div class="c-pdp22-upsell__added-state">' +
        '<span class="c-pdp22-upsell__added-icon">&#10003;</span>' +
        '<span class="c-pdp22-upsell__added-text">Added</span>' +
      '</div>' +
    '</div>';
  }

  function buildModuleHTML() {
    return '<div class="c-pdp22-upsell" id="' + MODULE_ID + '">' +
      '<p class="c-pdp22-upsell__heading">Most Grandparents Bought This Together!</p>' +
      buildRowHTML('leadership') +
      buildRowHTML('murphy') +
    '</div>';
  }

  function setRowAdded(key) {
    var row = document.querySelector('[data-c-pdp22-key="' + key + '"]');
    if (row) row.setAttribute('data-c-pdp22-state', 'added');
  }

  function refreshCartIconBubble() {
    return fetch(getCartUrl() + '?section_id=cart-icon-bubble')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html')
          .querySelector('.shopify-section');
        var live = document.getElementById('cart-icon-bubble');
        if (fresh && live) live.innerHTML = fresh.innerHTML;
      })
      .catch(function () {});
  }

  function refreshCartDrawer() {
    return fetch(getCartUrl() + '?section_id=cart-drawer')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var fresh = new DOMParser().parseFromString(html, 'text/html')
          .querySelector('cart-drawer');
        var live = document.querySelector('cart-drawer');
        if (fresh && live) {
          live.replaceWith(fresh);
          fresh.classList.add('active');
        }
        return refreshCartIconBubble();
      })
      .catch(function () {});
  }

  // Replicates c-prime-pdp-17.js addToCart, optionally with extra upsell items
  function pdp17AddToCartWithUpsells(atcBtn, extraItems) {
    var root = document.querySelector('.c-pdp17-variant');
    if (!root) return;
    var checkedRadio = root.querySelector('.c-pdp17-row__radio:checked');
    if (!checkedRadio) return;

    var variantId = parseInt(checkedRadio.getAttribute('data-variant-id'), 10);
    var quantity = parseInt(checkedRadio.getAttribute('data-quantity'), 10) || 1;
    var bundleId = 'pdp17-' + Date.now().toString(36) + '-' +
                   Math.random().toString(36).slice(2, 8);

    var items = [{
      id: variantId,
      quantity: quantity,
      properties: { _pdp17_bundle_id: bundleId, _pdp17_min_qty: quantity }
    }];

    (extraItems || []).forEach(function (item) { items.push(item); });

    atcBtn.disabled = true;

    fetch(getCartAddUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (r) {
        if (!r.ok) return Promise.reject(r);
        return r.json();
      })
      .then(function () {
        // Mark each upsell row as Added
        (extraItems || []).forEach(function (item) {
          Object.keys(upsellData).forEach(function (key) {
            if (upsellData[key] && upsellData[key].variantId === item.id) {
              setRowAdded(key);
            }
          });
        });
        return refreshCartDrawer();
      })
      .catch(function () {})
      .finally(function () { atcBtn.disabled = false; });
  }

  // Capture-phase listener: fires before PDP17's bubble listener on the target element.
  // Only intercepts when a checkbox variant is active AND at least one box is checked.
  function wireAtcCaptureListener(atcBtn) {
    atcBtn.addEventListener('click', function (e) {
      if (!isCheckboxVariant()) return;

      var checkedBoxes = Array.from(
        document.querySelectorAll('.c-pdp22-upsell__checkbox:checked')
      );
      if (!checkedBoxes.length) return; // no upsells selected — let PDP17 handle normally

      // Stop PDP17's bubble listener from firing
      e.stopImmediatePropagation();

      var extraItems = checkedBoxes.map(function (cb) {
        var key = cb.getAttribute('data-c-pdp22-checkbox');
        return (upsellData[key] && upsellData[key].variantId)
          ? { id: upsellData[key].variantId, quantity: 1 }
          : null;
      }).filter(Boolean);

      pdp17AddToCartWithUpsells(e.currentTarget, extraItems);

    }, true /* capture phase — fires before PDP17's bubble listener */);
  }

  // Event delegation for individual ADD buttons (button variants: B, D, F)
  function wireAddButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-c-pdp22-add]');
      if (!btn) return;

      var key = btn.getAttribute('data-c-pdp22-add');
      var data = upsellData[key];
      if (!data) return;

      var row = document.querySelector('[data-c-pdp22-key="' + key + '"]');
      if (!row || row.getAttribute('data-c-pdp22-state') === 'added') return;

      window.igEvents = window.igEvents || [];
      window.igEvents.push({ event: 'upsell_add_click' });

      btn.disabled = true;

      fetch(getCartAddUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id: data.variantId, quantity: 1 }] })
      })
        .then(function (r) {
          if (!r.ok) throw new Error();
          setRowAdded(key);
          // Silent add — do NOT open the drawer; only refresh the cart icon
          return refreshCartIconBubble();
        })
        .catch(function () {})
        .finally(function () { btn.disabled = false; });
    });
  }

  // Fire upsell_add_click when a checkbox is checked (not unchecked)
  function wireCheckboxChangeEvents() {
    document.addEventListener('change', function (e) {
      if (!e.target.classList.contains('c-pdp22-upsell__checkbox')) return;
      if (!e.target.checked) return; // only on check, not uncheck
      window.igEvents = window.igEvents || [];
      window.igEvents.push({ event: 'upsell_add_click' });
    });
  }

  // IntersectionObserver: fire upsell_module_view once when module scrolls into view
  function wireViewEvent(moduleEl) {
    if (!window.IntersectionObserver) return;
    var fired = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !fired && isAnyVariant()) {
          fired = true;
          obs.disconnect();
          window.igEvents = window.igEvents || [];
          window.igEvents.push({ event: 'upsell_module_view' });
        }
      });
    }, { threshold: 0.5 });
    obs.observe(moduleEl);
  }

  // Check cart on load; mark rows "Added" for items already in cart
  function syncCartState() {
    fetch(getCartUrl() + '.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        Object.keys(upsellData).forEach(function (key) {
          if (!upsellData[key]) return;
          var varId = upsellData[key].variantId;
          var inCart = (cart.items || []).some(function (item) {
            return item.variant_id === varId;
          });
          if (inCart) setRowAdded(key);
        });
      })
      .catch(function () {});
  }

  function init() {
    // Guard: only inject on pages with the PDP17 bundle ATC
    var atcBtn = document.querySelector('.c-pdp17-atc[data-pdp17-atc]');
    if (!atcBtn) return;

    // Build and insert the module before the ATC button
    var wrapper = document.createElement('div');
    wrapper.innerHTML = buildModuleHTML();
    var moduleEl = wrapper.firstChild;
    atcBtn.parentNode.insertBefore(moduleEl, atcBtn);

    // Fetch product data, then update prices + thumbnails, then sync cart state
    Promise.all([
      fetchProductData('leadership'),
      fetchProductData('murphy')
    ]).then(function () {
      updateRowDisplay('leadership');
      updateRowDisplay('murphy');
      syncCartState();
    });

    // Wire interactions
    wireAtcCaptureListener(atcBtn);
    wireAddButtons();
    wireCheckboxChangeEvents();
    wireViewEvent(moduleEl);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
