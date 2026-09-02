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

// Test: V_PRIME_MIX_29 | Free Shipping Threshold at 2-Book Tier
(function () {
  // Var A/B both test a $55 USD-equivalent threshold (they only differ on the
  // 1-book shipping fee — see c-prime-pdp-17.js/c-prime-pdp-22.js); control
  // keeps using the block's own configured goal untouched (do not change
  // config/settings_data.json's "goal" for this test — that setting is
  // shared with control and must stay exactly as it was). Same vetted
  // per-currency map as the PDP bundle snippets' own ship-threshold case
  // block — window.primeCartCurrency is set globally in layout/theme.liquid.
  var GOAL_CENTS_BY_CURRENCY = { AUD: 8000, CAD: 8000, GBP: 4500, NZD: 9500 };
  var VARIANT_GOAL_CENTS = GOAL_CENTS_BY_CURRENCY[window.primeCartCurrency] || 5500;

  // Same copy as control's own success_message — only the goal amount differs
  // for Var A/B. Below the goal the bar is hidden entirely (no progress message).
  var SUCCESS_MESSAGE = 'Congrats! You Get Free Shipping!';

  function isActive() {
    return document.body.classList.contains('c-primeMix29VarA') ||
      document.body.classList.contains('c-primeMix29VarB');
  }

  function upgradeBar(bar) {
    var subtotalCents = parseInt(bar.getAttribute('data-cart-subtotal-cents'), 10);
    if (isNaN(subtotalCents)) return;

    var reached = subtotalCents >= VARIANT_GOAL_CENTS;
    bar.style.display = reached ? '' : 'none';
    bar.setAttribute('data-goal-reached', reached ? 'true' : 'false');
    if (!reached) return;

    var fill = bar.querySelector('.cart-progress__bar__progress');
    var text = bar.querySelector('.cart-progress__text');
    if (fill) fill.style.width = '100%';
    if (text && text.textContent.trim() !== SUCCESS_MESSAGE.trim()) {
      text.textContent = SUCCESS_MESSAGE;
    }
  }

  // Sitewide: any standalone "Free delivery" / "Free shipping" label (PDP trust
  // badges, homepage hero, cart, etc.) gets its own "on 2+ books" qualifier.
  // Matches only text nodes whose ENTIRE trimmed content is one of those labels
  // (an optional leading emoji/icon is preserved) — this deliberately skips
  // longer sentences that merely mention the phrase, so it never mangles
  // unrelated copy. The PDP17 and PDP22 bundle row perks keep their own
  // untouched "FREE shipping" copy and are explicitly excluded.
  var EXCLUDED_SELECTOR = '.c-pdp17-row__perk, .c-pdp22-row';
  var LABEL_REPLACEMENTS = {
    'free delivery': 'Free delivery on 2+ books',
    'free shipping': 'Free shipping on 2+ books'
  };

  function replaceFreeShippingCopy() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT)$/.test(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest(EXCLUDED_SELECTOR)) {
          return NodeFilter.FILTER_REJECT;
        }
        var trimmed = node.textContent.trim();
        if (!trimmed || trimmed.length > 40) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var text = node.textContent;
      var trimmed = text.trim();
      var match = trimmed.match(/^([^\w]*)(.*)$/);
      var prefix = match ? match[1] : '';
      var label = (match ? match[2] : trimmed).trim();
      var replacement = LABEL_REPLACEMENTS[label.toLowerCase()];
      if (replacement) {
        node.textContent = text.replace(trimmed, prefix + replacement);
      }
    }
  }

  // The GLP1 supplement PDP's BTF CTA section (templates/product.glp1-sup.json)
  // embeds "Free shipping." mid-sentence inside a longer trust line, so it
  // can't be caught by the exact-label walker above without loosening it
  // sitewide (which would risk mangling unrelated copy). Scope this fix to
  // that one known element instead.
  function upgradeCtaSubCopy() {
    document.querySelectorAll('.cta-sub').forEach(function (el) {
      if (el.textContent.indexOf('Free shipping.') !== -1) {
        el.textContent = el.textContent.replace('Free shipping.', 'Free shipping on 2+ books.');
      }
    });
  }

  function run() {
    if (!isActive()) return;
    document.querySelectorAll('.cart-progress[data-cart-subtotal-cents]').forEach(upgradeBar);
    replaceFreeShippingCopy();
    upgradeCtaSubCopy();
  }

  var observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('ig:ready', run);
})();
