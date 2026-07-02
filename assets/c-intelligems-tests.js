let domLoaded = false;
let igReady = false;

// Test: V_PRIME_SITE_01 | Sitewide - Price Test
const PRIME_SITE_01_PRODUCTS = {
  "/products/murphys-law-for-kids": {
    vara: "7640277811334", varb: "7640284823686", control: "7568898293894",
    prices: { vara: { current: "$34.90", orig: "$69.80", saving: "$34.90" }, varb: { current: "$39.90", orig: "$79.80", saving: "$39.90" } },
  },
  "/products/murphys-law-for-kids-copy": {
    vara: "7640287772806", varb: "7640287871110", control: "7587123658886",
    prices: { vara: { current: "$34.90", orig: "$69.80", saving: "$34.90" }, varb: { current: "$39.90", orig: "$79.80", saving: "$39.90" } },
  },
  "/products/kidss-encyclopedia-10-000-whys": {
    vara: "7640288002182", varb: "7640288100486", control: "7590728794246",
    prices: { vara: { current: "$44.90", orig: "$89.80", saving: "$44.90" }, varb: { current: "$49.90", orig: "$99.80", saving: "$49.90" } },
  },
};

// Kaching reads product-id via getAttribute on a plain HTML element (not a custom element).
// Intercept Element.prototype.getAttribute so any read of product-id on kaching-bundle
// returns our target ID — set up synchronously before any deferred scripts run.
(function () {
  const config = PRIME_SITE_01_PRODUCTS[window.location.pathname];
  if (!config) return;

  const _getAttribute = Element.prototype.getAttribute;
  Element.prototype.getAttribute = function (name) {
    if (this.tagName.toLowerCase() === "kaching-bundle" && name === "product-id") {
      // Evaluated lazily so igData is available if Intelligems has already run.
      const group = window.igData?.user.getTestGroup("3035373f-de77-42d2-942f-de88525a835d");
      document.body.classList.add("c-priceTestV1");
      if (group?.name === "Var A") {
        return config.vara;
      } else if (group?.name === "Var B") {
        return config.varb;
      } else {
        return config.control;
      }
    }
    return _getAttribute.call(this, name);
  };
})();

function handleExperiments() {
  if (!domLoaded || !igReady) return;

  // Test: V_PRIME_CART_02 - Cart Trust Assurance Policies
  const primeCart02 = window.igData?.user.getTestGroup(
    "f2abbdfd-8369-4f44-8427-22337bacae56"
  );

  if (primeCart02?.name === "Var A") {
    document.body.classList.add("c-primeCart02VarA");
  } else {
    document.body.classList.add("c-primeCart02Control");
  }

  // Test: V_PRIME_PDP_07 | PDP review format: auto-scroll vs manual arrows
  const primePdp07 = window.igData?.user.getTestGroup(
    "ec0d5412-f677-4267-b944-7cb74ffda215"
  );
  if (primePdp07?.name === "Var A") {
    document.body.classList.add("c-primePdp07VarA");
  }

  // Test: V_PRIME_SITE_01 | Sitewide - Price Test (3035373f-de77-42d2-942f-de88525a835d)
  // Var A: $44.90 | Var B: $49.90
  // Bundle swap handled via Element.prototype.getAttribute interceptor above.
  // Homepage hero price row — only update for non-control variants.
  const primeSite01 = window.igData?.user.getTestGroup("3035373f-de77-42d2-942f-de88525a835d");
  document.body.classList.add("c-priceTestV2");
  const heroPrice = document.querySelector(".hero-price");
  const heroPriceOrig = document.querySelector(".hero-price-orig s");
  if (heroPrice && heroPriceOrig) {
    if (primeSite01?.name === "Var A") {
      heroPrice.textContent = "$44.90";
      heroPriceOrig.textContent = "$89.80";
    } else if (primeSite01?.name === "Var B") {
      heroPrice.textContent = "$49.90";
      heroPriceOrig.textContent = "$99.80";
    }
  }

  // PDP pib-price-row — only update on test product pages.
  const pdpConfig = PRIME_SITE_01_PRODUCTS[window.location.pathname];
  if (pdpConfig) {
    const pibPrice = document.querySelector(".pib-price-current");
    const pibPriceOrig = document.querySelector(".pib-price-original s");
    const pibSaving = document.querySelector(".pib-price-note strong");
    if (pibPrice && pibPriceOrig) {
      let prices = null;
      if (primeSite01?.name === "Var A") prices = pdpConfig.prices.vara;
      else if (primeSite01?.name === "Var B") prices = pdpConfig.prices.varb;
      if (prices) {
        pibPrice.textContent = prices.current;
        pibPriceOrig.textContent = prices.orig;
        if (pibSaving) pibSaving.textContent = prices.saving;
      }
    }

    // Kaching may have read product-id before igData was ready (interceptor fell back to control).
    // Force re-init: replace element without data-initialized so Kaching treats it as fresh.
    if (primeSite01?.name === "Var A" || primeSite01?.name === "Var B") {
      const kachingEl = document.querySelector("kaching-bundle");
      if (kachingEl) {
        const clone = kachingEl.cloneNode(false);
        clone.removeAttribute("data-initialized");
        clone.style.visibility = "hidden";
        // Reveal once Kaching injects bundle content; fallback after 3s
        const fallback = setTimeout(() => { clone.style.visibility = ""; obs.disconnect(); }, 3000);
        const obs = new MutationObserver(() => {
          if (clone.children.length > 0) {
            clone.style.visibility = "";
            clearTimeout(fallback);
            obs.disconnect();
          }
        });
        obs.observe(clone, { childList: true });
        kachingEl.style.visibility = "hidden";
        kachingEl.parentNode.replaceChild(clone, kachingEl);
      }
    }
  }
}

let cartDrawerWasActive = false;
setInterval(() => {
  const el = document.querySelector("cart-drawer");
  if (!el) return;
  const isActive = el.classList.contains("active");
  if (isActive && !cartDrawerWasActive) {
    cartDrawerWasActive = true;
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: "cartDrawerOpen" });
  } else if (!isActive) {
    cartDrawerWasActive = false;
  }
}, 200);

document.addEventListener("DOMContentLoaded", () => {
  domLoaded = true;
  handleExperiments();
});

window.addEventListener("ig:ready", () => {
  igReady = true;
  handleExperiments();
});
