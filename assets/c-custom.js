// V_PRIME_SITE_01 | Sitewide - Price Test
// Price display updates for hero, PDP, and collection cards.
// Called by c-intelligems-tests.js once igData is ready.

(function () {
  var PDP_PRICES = {
    "/products/murphys-law-for-kids": {
      "Var A": { current: "$34.90", orig: "$69.80", saving: "$34.90" },
      "Var B": { current: "$39.90", orig: "$79.80", saving: "$39.90" },
    },
    "/products/murphys-law-for-kids-copy": {
      "Var A": { current: "$34.90", orig: "$69.80", saving: "$34.90" },
      "Var B": { current: "$39.90", orig: "$79.80", saving: "$39.90" },
    },
    "/products/kidss-encyclopedia-10-000-whys": {
      "Var A": { current: "$44.90", orig: "$89.80", saving: "$44.90" },
      "Var B": { current: "$49.90", orig: "$99.80", saving: "$49.90" },
    },
  };

  var CARD_PRICES = {
    "/products/murphys-law-for-kids": {
      "Var A": { sale: "$34.90", compare: "$69.80" },
      "Var B": { sale: "$39.90", compare: "$79.80" },
    },
    "/products/murphys-law-for-kids-copy": {
      "Var A": { sale: "$34.90", compare: "$69.80" },
      "Var B": { sale: "$39.90", compare: "$79.80" },
    },
    "/products/kidss-encyclopedia-10-000-whys": {
      "Var A": { sale: "$44.90", compare: "$89.80" },
      "Var B": { sale: "$49.90", compare: "$99.80" },
    },
  };

  var HERO_PRICES = {
    "Var A": { price: "$44.90", orig: "$89.80" },
    "Var B": { price: "$49.90", orig: "$99.80" },
  };

  window.applyPriceUpdates = function (variantName) {
    // Homepage hero
    var heroVariant = HERO_PRICES[variantName];
    if (heroVariant) {
      var heroPrice = document.querySelector(".hero-price");
      var heroPriceOrig = document.querySelector(".hero-price-orig s");
      if (heroPrice) heroPrice.textContent = heroVariant.price;
      if (heroPriceOrig) heroPriceOrig.textContent = heroVariant.orig;
    }

    // PDP pib-price-row
    var pdpVariantPrices = (PDP_PRICES[window.location.pathname] || {})[variantName];
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
      document.querySelectorAll('a[href^="' + productPath + '"]').forEach(function (link) {
        if (link.getAttribute("href").split("?")[0] !== productPath) return;
        var card = link.closest(".card-wrapper");
        if (!card || processedCards.has(card)) return;
        processedCards.add(card);
        var saleEl = card.querySelector(".price-item--sale");
        var compareEl = card.querySelector(".price__compare-price .price-item--regular");
        var regularEl = card.querySelector(".price__regular .price-item--regular");
        if (saleEl) saleEl.textContent = targetPrices.sale;
        if (compareEl) compareEl.textContent = targetPrices.compare;
        if (regularEl) regularEl.textContent = targetPrices.sale;
      });
    });
  };
})();
