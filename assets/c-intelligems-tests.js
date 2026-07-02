let domLoaded = false;
let igReady = false;

// Test: V_PRIME_SITE_01 | Sitewide - Price Test
const PRIME_SITE_01_PRODUCTS = {
  "/products/murphys-law-for-kids":           { vara: "7640277811334", varb: "7640284823686", control: "7568898293894" },
  "/products/murphys-law-for-kids-copy":      { vara: "7640287772806", varb: "7640287871110", control: "7587123658886" },
  "/products/kidss-encyclopedia-10-000-whys": { vara: "7640288002182", varb: "7640288100486", control: "7590728794246" },
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
      if (group?.name === "Var A - $44.90") {
        return config.vara;
      } else if (group?.name === "Var B - $49.90") {
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
