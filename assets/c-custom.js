// V_PRIME_SITE_01 | Sitewide - Price Test
// Hides test prices before first paint, reveals them after variant is applied.

(function () {
  var path = window.location.pathname;

  var TEST_PDPS = [
    "/products/murphys-law-for-kids",
    "/products/murphys-law-for-kids-copy",
    "/products/kidss-encyclopedia-10-000-whys",
  ];

  // Inject hiding CSS synchronously — runs in <head> before any paint.
  var style = document.createElement("style");
  var css = "";

  if (path === "/") {
    css += ".hero-price,.hero-price-orig{visibility:hidden;}";
  }
  if (TEST_PDPS.indexOf(path) !== -1) {
    css += ".pib-price-current,.pib-price-original,.pib-price-note{visibility:hidden;}";
  }
  // Target test product card prices anywhere (:has() supported Chrome 105+, Safari 15.4+, Firefox 121+)
  css +=
    ".card-wrapper:has(a[href^=\"/products/murphys-law-for-kids\"]) .price__container," +
    ".card-wrapper:has(a[href^=\"/products/murphys-law-for-kids\"]) .card__badge," +
    ".card-wrapper:has(a[href^=\"/products/kidss-encyclopedia-10-000-whys\"]) .price__container," +
    ".card-wrapper:has(a[href^=\"/products/kidss-encyclopedia-10-000-whys\"]) .card__badge" +
    "{visibility:hidden;}";

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

  var HERO_PRICES = {
    "Var A - $44.90": { price: "$44.90", orig: "$89.80" },
    "Var B - $49.90": { price: "$49.90", orig: "$99.80" },
  };

  window.applyPriceUpdates = function (variantName) {
    clearTimeout(failsafe);

    // Homepage hero
    var heroVariant = HERO_PRICES[variantName];
    if (heroVariant) {
      var heroPrice = document.querySelector(".hero-price");
      var heroPriceOrig = document.querySelector(".hero-price-orig s");
      if (heroPrice) heroPrice.textContent = heroVariant.price;
      if (heroPriceOrig) heroPriceOrig.textContent = heroVariant.orig;
    }

    // PDP pib-price-row
    var pdpVariantPrices = (PDP_PRICES[path] || {})[variantName];
    if (pdpVariantPrices) {
      var pibPrice = document.querySelector(".pib-price-current");
      var pibPriceOrig = document.querySelector(".pib-price-original s");
      var pibSaving = document.querySelector(".pib-price-note strong");
      if (pibPrice) pibPrice.textContent = pdpVariantPrices.current;
      if (pibPriceOrig) pibPriceOrig.textContent = pdpVariantPrices.orig;
      if (pibSaving) pibSaving.textContent = pdpVariantPrices.saving;
    }

    // Product card prices (collection page, any page)
    var processedCards = new Set();
    Object.keys(CARD_PRICES).forEach(function (productPath) {
      var targetPrices = CARD_PRICES[productPath][variantName];
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

    // Reveal all — prices are now correct for this variant (or unchanged for Control)
    revealPrices();
  };
})();
