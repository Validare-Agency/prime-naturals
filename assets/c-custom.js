// V_PRIME_SITE_01 | Sitewide - Price Test
// Hides test prices before first paint, reveals them after variant is applied.

(function () {
  var path = window.location.pathname;

  var TEST_PDPS = [
    "/products/murphys-law-for-kids",
    "/products/murphys-law-for-kids-copy",
    "/products/kidss-encyclopedia-10-000-whys",
  ];

  // window.Shopify.currency.active and window.Shopify.country are set inline by Shopify
  // before theme JS runs. Fall back to USD / null if not present.
  var activeCurrency = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || "USD";
  var visitorIsUSD = activeCurrency === "USD";
  var visitorCountry = (window.Shopify && window.Shopify.country) || null; // e.g. "AU", "NZ", "CA", "GB"

  // Inject hiding CSS synchronously — runs in <head> before any paint.
  // Only hide elements we're going to change. Non-USD visitors use Liquid geo pricing —
  // those elements already render correctly and must never be hidden.
  var style = document.createElement("style");
  var css = "";

  // Countries that have international hero price overrides configured below.
  var INTL_HERO_COUNTRIES = ["NZ", "AU", "CA", "GB"];
  var willSwapHero = path === "/" && (visitorIsUSD || (visitorCountry && INTL_HERO_COUNTRIES.indexOf(visitorCountry) !== -1));
  if (willSwapHero) {
    css += ".hero-price,.hero-price-orig{visibility:hidden;}";
  }
  // PDP pib-price block: hide when we're going to swap the price.
  // USD visitors: always hide (we swap all test PDPs).
  // Non-USD visitors: only hide when we have a country-specific price override for this page.
  var INTL_PDP_COUNTRIES = {
    "/products/kidss-encyclopedia-10-000-whys": ["NZ", "AU", "CA", "GB"],
    "/products/murphys-law-for-kids":           ["NZ", "AU", "CA", "GB"],
    "/products/murphys-law-for-kids-copy":      ["NZ", "AU", "CA", "GB"],
  };
  var willSwapPibPrice = TEST_PDPS.indexOf(path) !== -1 && (
    visitorIsUSD ||
    (visitorCountry && (INTL_PDP_COUNTRIES[path] || []).indexOf(visitorCountry) !== -1)
  );
  if (willSwapPibPrice) {
    css += ".pib-price-current,.pib-price-original,.pib-price-note{visibility:hidden;}";
  }
  // Countries that have international card price overrides for the encyclopedia.
  var INTL_CARD_COUNTRIES_ENCYC = ["NZ", "AU", "CA", "GB"];
  var willSwapEncycCard = visitorIsUSD || (visitorCountry && INTL_CARD_COUNTRIES_ENCYC.indexOf(visitorCountry) !== -1);
  var INTL_CARD_COUNTRIES_MURPHY = ["NZ", "AU", "CA", "GB"];
  var willSwapMurphyCard = visitorIsUSD || (visitorCountry && INTL_CARD_COUNTRIES_MURPHY.indexOf(visitorCountry) !== -1);
  if (willSwapMurphyCard) {
    css +=
      ".card-wrapper:has(a[href^=\"/products/murphys-law-for-kids\"]) .price__container," +
      ".card-wrapper:has(a[href^=\"/products/murphys-law-for-kids\"]) .card__badge" +
      "{visibility:hidden;}";
  }
  if (willSwapEncycCard) {
    css +=
      ".card-wrapper:has(a[href^=\"/products/kidss-encyclopedia-10-000-whys\"]) .price__container," +
      ".card-wrapper:has(a[href^=\"/products/kidss-encyclopedia-10-000-whys\"]) .card__badge" +
      "{visibility:hidden;}";
  }

  style.textContent = css;
  document.head.appendChild(style);

  function revealPrices() {
    style.textContent = "";
  }

  // Failsafe: always reveal after 5s in case Intelligems never fires
  var failsafe = setTimeout(revealPrices, 5000);

  // --- Price configs ---

  var PDP_PRICES = {
    "/products/murphys-law-for-kids": {
      "Var A - $44.90": { current: "$34.90", orig: "$69.80", saving: "$34.90" },
      "Var B - $49.90": { current: "$39.90", orig: "$79.80", saving: "$39.90" },
    },
    "/products/murphys-law-for-kids-copy": {
      "Var A - $44.90": { current: "$34.90", orig: "$69.80", saving: "$34.90" },
      "Var B - $49.90": { current: "$39.90", orig: "$79.80", saving: "$39.90" },
    },
    "/products/kidss-encyclopedia-10-000-whys": {
      "Var A - $44.90": { current: "$44.90", orig: "$89.80", saving: "$44.90" },
      "Var B - $49.90": { current: "$49.90", orig: "$99.80", saving: "$49.90" },
    },
  };

  // International (non-USD) pib-price overrides, keyed by product path → country → variant.
  // "was" = current × 2 (same 50% off pattern as control). "saving" = current.
  // Add more countries here as prices are confirmed.
  var INTL_PDP_PRICES = {
    "/products/murphys-law-for-kids": {
      "GB": {
        "Var A - $44.90": { current: "£26.90", orig: "£53.80", saving: "£26.90" },
        "Var B - $49.90": { current: "£30.90", orig: "£61.80", saving: "£30.90" },
      },
      "AU": {
        "Var A - $44.90": { current: "A$50.90", orig: "A$101.80", saving: "A$50.90" },
        "Var B - $49.90": { current: "A$58.90", orig: "A$117.80", saving: "A$58.90" },
      },
      "CA": {
        "Var A - $44.90": { current: "C$50.90", orig: "C$101.80", saving: "C$50.90" },
        "Var B - $49.90": { current: "C$57.90", orig: "C$115.80", saving: "C$57.90" },
      },
      "NZ": {
        "Var A - $44.90": { current: "NZ$61.90", orig: "NZ$123.80", saving: "NZ$61.90" },
        "Var B - $49.90": { current: "NZ$70.90", orig: "NZ$141.80", saving: "NZ$70.90" },
      },
    },
    "/products/murphys-law-for-kids-copy": {
      "GB": {
        "Var A - $44.90": { current: "£26.90", orig: "£53.80", saving: "£26.90" },
        "Var B - $49.90": { current: "£30.90", orig: "£61.80", saving: "£30.90" },
      },
      "AU": {
        "Var A - $44.90": { current: "A$50.90", orig: "A$101.80", saving: "A$50.90" },
        "Var B - $49.90": { current: "A$58.90", orig: "A$117.80", saving: "A$58.90" },
      },
      "CA": {
        "Var A - $44.90": { current: "C$50.90", orig: "C$101.80", saving: "C$50.90" },
        "Var B - $49.90": { current: "C$57.90", orig: "C$115.80", saving: "C$57.90" },
      },
      "NZ": {
        "Var A - $44.90": { current: "NZ$61.90", orig: "NZ$123.80", saving: "NZ$61.90" },
        "Var B - $49.90": { current: "NZ$70.90", orig: "NZ$141.80", saving: "NZ$70.90" },
      },
    },
    "/products/kidss-encyclopedia-10-000-whys": {
      "NZ": {
        "Var A - $44.90": { current: "NZ$79.90", orig: "NZ$159.80", saving: "NZ$79.90" },
        "Var B - $49.90": { current: "NZ$88.90", orig: "NZ$177.80", saving: "NZ$88.90" },
      },
      "AU": {
        "Var A - $44.90": { current: "A$65.90", orig: "A$131.80", saving: "A$65.90" },
        "Var B - $49.90": { current: "A$72.90", orig: "A$145.80", saving: "A$72.90" },
      },
      "CA": {
        "Var A - $44.90": { current: "C$64.90", orig: "C$129.80", saving: "C$64.90" },
        "Var B - $49.90": { current: "C$71.90", orig: "C$143.80", saving: "C$71.90" },
      },
      "GB": {
        "Var A - $44.90": { current: "£34.90", orig: "£69.80", saving: "£34.90" },
        "Var B - $49.90": { current: "£37.90", orig: "£75.80", saving: "£37.90" },
      },
    },
  };

  var CARD_PRICES = {
    "/products/murphys-law-for-kids": {
      "Var A - $44.90": { sale: "$34.90", compare: "$69.80", badge: "SAVE $34.90" },
      "Var B - $49.90": { sale: "$39.90", compare: "$79.80", badge: "SAVE $39.90" },
    },
    "/products/murphys-law-for-kids-copy": {
      "Var A - $44.90": { sale: "$34.90", compare: "$69.80", badge: "SAVE $34.90" },
      "Var B - $49.90": { sale: "$39.90", compare: "$79.80", badge: "SAVE $39.90" },
    },
    "/products/kidss-encyclopedia-10-000-whys": {
      "Var A - $44.90": { sale: "$44.90", compare: "$89.80", badge: "SAVE $44.90" },
      "Var B - $49.90": { sale: "$49.90", compare: "$99.80", badge: "SAVE $49.90" },
    },
  };

  // handle → variant + price per variant group
  var UPSELL_CONFIG = {
    "murphys-law-for-kids": {
      "Var A - $44.90": { regular: "$34.90", compare: "$69.80", variantId: "44124736454790" },
      "Var B - $49.90": { regular: "$39.90", compare: "$79.80", variantId: "44124758835334" },
    },
    "murphys-law-for-kids-copy": {
      "Var A - $44.90": { regular: "$34.90", compare: "$69.80", variantId: "44124769255558" },
      "Var B - $49.90": { regular: "$39.90", compare: "$79.80", variantId: "44124769452166" },
    },
    "kidss-encyclopedia-10-000-whys": {
      "Var A - $44.90": { regular: "$44.90", compare: "$89.80", variantId: "44124769747078" },
      "Var B - $49.90": { regular: "$49.90", compare: "$99.80", variantId: "44124770041990" },
    },
  };

  // International upsell display prices, keyed by country → handle → variant.
  // variantId is always taken from UPSELL_CONFIG (same Shopify variant, any currency).
  var INTL_UPSELL_CONFIG = {
    "NZ": {
      "murphys-law-for-kids":      { "Var A - $44.90": { regular: "NZ$61.90", compare: "NZ$123.80" }, "Var B - $49.90": { regular: "NZ$70.90", compare: "NZ$141.80" } },
      "murphys-law-for-kids-copy": { "Var A - $44.90": { regular: "NZ$61.90", compare: "NZ$123.80" }, "Var B - $49.90": { regular: "NZ$70.90", compare: "NZ$141.80" } },
      "kidss-encyclopedia-10-000-whys": { "Var A - $44.90": { regular: "NZ$79.90", compare: "NZ$159.80" }, "Var B - $49.90": { regular: "NZ$88.90", compare: "NZ$177.80" } },
    },
    "AU": {
      "murphys-law-for-kids":      { "Var A - $44.90": { regular: "A$50.90", compare: "A$101.80" }, "Var B - $49.90": { regular: "A$58.90", compare: "A$117.80" } },
      "murphys-law-for-kids-copy": { "Var A - $44.90": { regular: "A$50.90", compare: "A$101.80" }, "Var B - $49.90": { regular: "A$58.90", compare: "A$117.80" } },
      "kidss-encyclopedia-10-000-whys": { "Var A - $44.90": { regular: "A$65.90", compare: "A$131.80" }, "Var B - $49.90": { regular: "A$72.90", compare: "A$145.80" } },
    },
    "CA": {
      "murphys-law-for-kids":      { "Var A - $44.90": { regular: "C$50.90", compare: "C$101.80" }, "Var B - $49.90": { regular: "C$57.90", compare: "C$115.80" } },
      "murphys-law-for-kids-copy": { "Var A - $44.90": { regular: "C$50.90", compare: "C$101.80" }, "Var B - $49.90": { regular: "C$57.90", compare: "C$115.80" } },
      "kidss-encyclopedia-10-000-whys": { "Var A - $44.90": { regular: "C$64.90", compare: "C$129.80" }, "Var B - $49.90": { regular: "C$71.90", compare: "C$143.80" } },
    },
    "GB": {
      "murphys-law-for-kids":      { "Var A - $44.90": { regular: "£26.90", compare: "£53.80" }, "Var B - $49.90": { regular: "£30.90", compare: "£61.80" } },
      "murphys-law-for-kids-copy": { "Var A - $44.90": { regular: "£26.90", compare: "£53.80" }, "Var B - $49.90": { regular: "£30.90", compare: "£61.80" } },
      "kidss-encyclopedia-10-000-whys": { "Var A - $44.90": { regular: "£34.90", compare: "£69.80" }, "Var B - $49.90": { regular: "£37.90", compare: "£75.80" } },
    },
  };

  var HERO_PRICES = {
    "Var A - $44.90": { price: "$44.90", orig: "$89.80" },
    "Var B - $49.90": { price: "$49.90", orig: "$99.80" },
  };

  // International hero prices keyed by country → variant.
  var INTL_HERO_PRICES = {
    "NZ": {
      "Var A - $44.90": { price: "NZ$79.90", orig: "NZ$159.80" },
      "Var B - $49.90": { price: "NZ$88.90", orig: "NZ$177.80" },
    },
    "AU": {
      "Var A - $44.90": { price: "A$65.90", orig: "A$131.80" },
      "Var B - $49.90": { price: "A$72.90", orig: "A$145.80" },
    },
    "CA": {
      "Var A - $44.90": { price: "C$64.90", orig: "C$129.80" },
      "Var B - $49.90": { price: "C$71.90", orig: "C$143.80" },
    },
    "GB": {
      "Var A - $44.90": { price: "£34.90", orig: "£69.80" },
      "Var B - $49.90": { price: "£37.90", orig: "£75.80" },
    },
  };

  // International card prices keyed by product path → country → variant.
  var INTL_CARD_PRICES = {
    "/products/murphys-law-for-kids": {
      "GB": {
        "Var A - $44.90": { sale: "£26.90", compare: "£53.80", badge: "SAVE £26.90" },
        "Var B - $49.90": { sale: "£30.90", compare: "£61.80", badge: "SAVE £30.90" },
      },
      "AU": {
        "Var A - $44.90": { sale: "A$50.90", compare: "A$101.80", badge: "SAVE A$50.90" },
        "Var B - $49.90": { sale: "A$58.90", compare: "A$117.80", badge: "SAVE A$58.90" },
      },
      "CA": {
        "Var A - $44.90": { sale: "C$50.90", compare: "C$101.80", badge: "SAVE C$50.90" },
        "Var B - $49.90": { sale: "C$57.90", compare: "C$115.80", badge: "SAVE C$57.90" },
      },
      "NZ": {
        "Var A - $44.90": { sale: "NZ$61.90", compare: "NZ$123.80", badge: "SAVE NZ$61.90" },
        "Var B - $49.90": { sale: "NZ$70.90", compare: "NZ$141.80", badge: "SAVE NZ$70.90" },
      },
    },
    "/products/murphys-law-for-kids-copy": {
      "GB": {
        "Var A - $44.90": { sale: "£26.90", compare: "£53.80", badge: "SAVE £26.90" },
        "Var B - $49.90": { sale: "£30.90", compare: "£61.80", badge: "SAVE £30.90" },
      },
      "AU": {
        "Var A - $44.90": { sale: "A$50.90", compare: "A$101.80", badge: "SAVE A$50.90" },
        "Var B - $49.90": { sale: "A$58.90", compare: "A$117.80", badge: "SAVE A$58.90" },
      },
      "CA": {
        "Var A - $44.90": { sale: "C$50.90", compare: "C$101.80", badge: "SAVE C$50.90" },
        "Var B - $49.90": { sale: "C$57.90", compare: "C$115.80", badge: "SAVE C$57.90" },
      },
      "NZ": {
        "Var A - $44.90": { sale: "NZ$61.90", compare: "NZ$123.80", badge: "SAVE NZ$61.90" },
        "Var B - $49.90": { sale: "NZ$70.90", compare: "NZ$141.80", badge: "SAVE NZ$70.90" },
      },
    },
    "/products/kidss-encyclopedia-10-000-whys": {
      "NZ": {
        "Var A - $44.90": { sale: "NZ$79.90", compare: "NZ$159.80", badge: "SAVE NZ$79.90" },
        "Var B - $49.90": { sale: "NZ$88.90", compare: "NZ$177.80", badge: "SAVE NZ$88.90" },
      },
      "AU": {
        "Var A - $44.90": { sale: "A$65.90", compare: "A$131.80", badge: "SAVE A$65.90" },
        "Var B - $49.90": { sale: "A$72.90", compare: "A$145.80", badge: "SAVE A$72.90" },
      },
      "CA": {
        "Var A - $44.90": { sale: "C$64.90", compare: "C$129.80", badge: "SAVE C$64.90" },
        "Var B - $49.90": { sale: "C$71.90", compare: "C$143.80", badge: "SAVE C$71.90" },
      },
      "GB": {
        "Var A - $44.90": { sale: "£34.90", compare: "£69.80", badge: "SAVE £34.90" },
        "Var B - $49.90": { sale: "£37.90", compare: "£75.80", badge: "SAVE £37.90" },
      },
    },
  };

  // Only overwrite USD-denominated elements for non-USD visitors.
  // Non-USD visitors see Liquid geo pricing (already correct) — don't touch those elements.
  function isUSD() { return visitorIsUSD; }

  window.applyPriceUpdates = function (variantName) {
    clearTimeout(failsafe);

    // Homepage hero — USD uses HERO_PRICES, non-USD checks INTL_HERO_PRICES by country.
    var heroVariant = isUSD()
      ? HERO_PRICES[variantName]
      : (INTL_HERO_PRICES[visitorCountry] || {})[variantName];
    if (heroVariant) {
      var heroPrice = document.querySelector(".hero-price");
      var heroPriceOrig = document.querySelector(".hero-price-orig s");
      if (heroPrice) heroPrice.textContent = heroVariant.price;
      if (heroPriceOrig) heroPriceOrig.textContent = heroVariant.orig;
    }

    // PDP pib-price block. For USD visitors use PDP_PRICES; for non-USD visitors
    // check INTL_PDP_PRICES for a country-specific override — fall back to Liquid
    // geo pricing (no change) if none is configured for this country yet.
    var pdpVariantPrices = isUSD()
      ? (PDP_PRICES[path] || {})[variantName]
      : ((INTL_PDP_PRICES[path] || {})[visitorCountry] || {})[variantName];
    if (pdpVariantPrices) {
      var pibPrice = document.querySelector(".pib-price-current");
      var pibPriceOrig = document.querySelector(".pib-price-original s");
      var pibSaving = document.querySelector(".pib-price-note strong");
      if (pibPrice) pibPrice.textContent = pdpVariantPrices.current;
      if (pibPriceOrig) pibPriceOrig.textContent = pdpVariantPrices.orig;
      if (pibSaving) pibSaving.textContent = pdpVariantPrices.saving;
    }

    // Product card prices — USD uses CARD_PRICES; non-USD checks INTL_CARD_PRICES by country.
    var processedCards = new Set();
    var allCardPaths = Object.keys(isUSD() ? CARD_PRICES : INTL_CARD_PRICES);
    allCardPaths.forEach(function (productPath) {
      var targetPrices = isUSD()
        ? CARD_PRICES[productPath][variantName]
        : ((INTL_CARD_PRICES[productPath] || {})[visitorCountry] || {})[variantName];
      if (!targetPrices) return;
      document.querySelectorAll("a[href^=\"" + productPath + "\"]").forEach(function (link) {
        if (link.getAttribute("href").split("?")[0] !== productPath) return;
        var card = link.closest(".card-wrapper");
        if (!card || processedCards.has(card)) return;
        processedCards.add(card);
        var saleEl = card.querySelector(".price-item--sale");
        var compareEl = card.querySelector(".price__compare-price .price-item--regular");
        var regularEl = card.querySelector(".price__regular .price-item--regular");
        var badgeEl = card.querySelector(".card__badge .nowrap");
        if (saleEl) saleEl.textContent = targetPrices.sale;
        if (compareEl) compareEl.textContent = targetPrices.compare;
        if (regularEl) regularEl.textContent = targetPrices.sale;
        if (badgeEl) badgeEl.textContent = targetPrices.badge;
      });
    });

    // Swap ATC variant ID on collection cards — all visitors, all countries.
    // The variant ID is the same regardless of currency; Shopify serves the right price.
    var CARD_ATC_VARIANTS = {
      "/products/murphys-law-for-kids":           { "Var A - $44.90": "44124736454790", "Var B - $49.90": "44124758835334" },
      "/products/murphys-law-for-kids-copy":      { "Var A - $44.90": "44124769255558", "Var B - $49.90": "44124769452166" },
      "/products/kidss-encyclopedia-10-000-whys": { "Var A - $44.90": "44124769747078", "Var B - $49.90": "44124770041990" },
    };
    Object.keys(CARD_ATC_VARIANTS).forEach(function (productPath) {
      var targetVariantId = CARD_ATC_VARIANTS[productPath][variantName];
      if (!targetVariantId) return;
      document.querySelectorAll("a[href^=\"" + productPath + "\"]").forEach(function (link) {
        if (link.getAttribute("href").split("?")[0] !== productPath) return;
        var card = link.closest(".card-wrapper");
        if (!card) return;
        var atcInput = card.querySelector("input[name=\"id\"]");
        if (atcInput) atcInput.value = targetVariantId;
      });
    });

    applyUpsellUpdates(variantName);

    // Reveal all — prices are now correct for this variant (or unchanged for Control)
    revealPrices();
  };

  var currentVariantName = null;

  function applyUpsellUpdates(variantName) {
    if (!variantName) return;
    Object.keys(UPSELL_CONFIG).forEach(function (handle) {
      var upsellPrices = UPSELL_CONFIG[handle][variantName];
      if (!upsellPrices) return;
      // International display prices override Shopify's native conversion when available.
      var intlPrices = (!isUSD() && visitorCountry)
        ? ((INTL_UPSELL_CONFIG[visitorCountry] || {})[handle] || {})[variantName]
        : null;
      var displayPrices = intlPrices || (isUSD() ? upsellPrices : null);
      document.querySelectorAll("[data-handle=\"" + handle + "\"]").forEach(function (el) {
        var regularEl = el.querySelector(".regular-price");
        var compareEl = el.querySelector(".compare-price");
        var input = el.querySelector("input[name=\"id\"]");
        if (input) input.value = upsellPrices.variantId;
        if (displayPrices) {
          if (regularEl) regularEl.textContent = displayPrices.regular;
          if (compareEl) {
            compareEl.textContent = displayPrices.compare;
            compareEl.classList.remove("hidden");
          }
        }
      });
    });
  }

  // Re-apply upsell updates whenever the cart drawer re-renders (e.g. after add-to-cart).
  document.addEventListener("DOMContentLoaded", function () {
    var cartDrawer = document.querySelector("cart-drawer");
    if (!cartDrawer) return;
    var debounce;
    var obs = new MutationObserver(function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { applyUpsellUpdates(currentVariantName); }, 50);
    });
    obs.observe(cartDrawer, { childList: true, subtree: true });
  });

  var _origApply = window.applyPriceUpdates;
  window.applyPriceUpdates = function (variantName) {
    currentVariantName = variantName;
    _origApply(variantName);
  };
})();
