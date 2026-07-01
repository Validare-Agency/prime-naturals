let domLoaded = false;
let igReady = false;

// Test: V_PRIME_SITE_01 | Sitewide - Price Test
const PRIME_SITE_01_PRODUCTS = {
  "/products/murphys-law-for-kids":           { vara: "7640277811334", varb: "7640284823686" },
  "/products/murphys-law-for-kids-copy":      { vara: "7640287772806", varb: "7640287871110" },
  "/products/kidss-encyclopedia-10-000-whys": { vara: "7640288002182", varb: "7640288100486" },
};

// Kaching reads product-id via getAttribute on a plain HTML element (not a custom element).
// Intercept Element.prototype.getAttribute so any read of product-id on kaching-bundle
// returns our target ID — set up synchronously before any deferred scripts run.
(function () {
  const config = PRIME_SITE_01_PRODUCTS[window.location.pathname];
  if (!config) return;

  // Replace { name: "Var A" } with window.igData?.user.getTestGroup("UUID") when ready.
  const group = { name: "Var A" };
  let productId = null;
  if (group?.name === "Var A") productId = config.vara;
  if (group?.name === "Var B") productId = config.varb;
  if (!productId) return;

  const _getAttribute = Element.prototype.getAttribute;
  Element.prototype.getAttribute = function (name) {
    if (this.tagName.toLowerCase() === "kaching-bundle" && name === "product-id") {
      return productId;
    }
    return _getAttribute.call(this, name);
  };

  // Also set the actual attribute at DOM-ready so it stays consistent.
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("kaching-bundle").forEach((el) => {
      el.setAttribute("product-id", productId);
    });
  });
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

  // Test: V_PRIME_SITE_01 | Sitewide - Price Test
  // Bundle swap is handled via the customElements.define interceptor above.
  // When UUID is ready, update the group value in that IIFE.
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
