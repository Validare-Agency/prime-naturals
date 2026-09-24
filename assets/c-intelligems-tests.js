let domLoaded = false;
let igReady = false;

// V_PRIME_PDP_35 | Kaching product-id swap, Control only, Murphy/Leadership
// only. Var A/B is never touched here at all — that side's cart-correctness
// is handled directly in c-prime-pdp-35.js's addToCart(). Same mechanism as
// the Snuggi price test on ab-test/V_PIL_PDP_04.
const KACHING_SWAP_TARGET_BY_PRODUCT_ID = {
  7568898293894: "7733150187654", // murphys-law-for-kids -> swap to this id
  7587123658886: "7733149794438", // murphys-law-for-kids-copy -> swap to this id
};
const kachingSwapProductId =
  KACHING_SWAP_TARGET_BY_PRODUCT_ID[String(window.__productIdFromTemplate)];
let kachingSwapAttempted = false;

function kachingWaitForInit(onReady, retriesLeft = 25) {
  if (typeof window.__kachingBundlesInitializeInternal === "function") {
    onReady();
    return;
  }
  if (retriesLeft <= 0) return;
  setTimeout(() => kachingWaitForInit(onReady, retriesLeft - 1), 200);
}

const KACHING_SWAP_ATTEMPT_TIMEOUT = 4000;
const KACHING_SWAP_MAX_ATTEMPTS = 3;

// Only ever called for Control (not paid search, or paid search + Var A/B,
// never reach here at all — see the call site in handleExperiments).
function decideKachingSwap(isControlPaidSearch) {
  if (kachingSwapAttempted || !kachingSwapProductId || !isControlPaidSearch) {
    return;
  }
  kachingSwapAttempted = true;
  kachingWaitForInit(() => kachingAttemptSwap(1));
}

function kachingAttemptSwap(attempt) {
  const oldEl = document.querySelector("kaching-bundle");
  const parent = oldEl?.parentNode;
  if (!oldEl || !parent) return;

  const nextSibling = oldEl.nextSibling;
  oldEl.remove();

  const newEl = document.createElement("kaching-bundle");
  Array.from(oldEl.attributes).forEach((attr) =>
    newEl.setAttribute(attr.name, attr.value)
  );
  newEl.setAttribute("product-id", kachingSwapProductId);
  newEl.removeAttribute("data-initialized");
  parent.insertBefore(newEl, nextSibling);

  let settled = false;

  const retryOrGiveUp = () => {
    if (settled) return;
    settled = true;
    obs.disconnect();
    clearTimeout(fallback);
    newEl.remove();
    parent.insertBefore(oldEl, nextSibling);
    if (attempt < KACHING_SWAP_MAX_ATTEMPTS) kachingAttemptSwap(attempt + 1);
  };

  const fallback = setTimeout(() => {
    if (newEl.children.length === 0) retryOrGiveUp();
    settled = true;
    obs.disconnect();
  }, KACHING_SWAP_ATTEMPT_TIMEOUT);

  const obs = new MutationObserver(() => {
    if (settled || newEl.children.length === 0) return;
    settled = true;
    obs.disconnect();
    clearTimeout(fallback);
  });
  obs.observe(newEl, { childList: true });

  window.__kachingBundlesInitializeInternal();
}

// Validare Holdout. Permanent, never end it.
const HOLDOUT_EXPERIMENT_ID = "3ad2181f-d285-418c-b4d8-a52ce3a136a1";
const HOLDOUT_GROUP_ID = "c41ea5b4-45b8-4edf-8687-844be31c4054";

function handleExperiments() {
  if (!domLoaded || !igReady) return;

  // Holdout: V_PRIME_HOLDOUT_G1 (do not edit)
  const isHeldOut =
    window.igData?.user.getTestGroup(HOLDOUT_EXPERIMENT_ID)?.id ===
    HOLDOUT_GROUP_ID;
  document.body.classList.add(
    isHeldOut ? "c-validareHoldout" : "c-validareOptimized"
  );
  try {
    localStorage.setItem("validare_holdout", isHeldOut ? "1" : "0");
  } catch (e) {}

  // Test: V_PRIME_MIX_26 | Grandparent-voice Testimonial Carousel
  const primeMix26 = window.igData?.user.getTestGroup(
    "09581346-2806-47e0-80ef-c94e215d67b1"
  );
  if (primeMix26?.name === "Var A") {
    document.body.classList.add("c-primeMix26VarA");
  }

  // Test: V_PRIME_PDP_23 | PDP 'What's inside' section: chapter map + Q&A
  const primePdp23 = window.igData?.user.getTestGroup(
    "2fbd76e4-5c99-438c-b112-d031dff9c4bd"
  );
  if (primePdp23?.name === "Var A - Topics then Q&A") {
    document.body.classList.add("c-primePdp23VarA");
  } else if (primePdp23?.name === "Var B - Q&A then topics") {
    document.body.classList.add("c-primePdp23VarB");
  } else if (primePdp23?.name === "Var C - Q&A only") {
    document.body.classList.add("c-primePdp23VarC");
  }

  // Test: V_PRIME_PDP_35 | Unlock Bonus Free Gifts
  const primePdp35 = window.igData?.user.getTestGroup(
    "97267cf0-b33c-48dc-a5e0-195f12d5587b"
  );
  let primePdp35InVarAOrB = false;
  if (primePdp35?.name === "Var A - Thumbnail unlock cards") {
    document.body.classList.add("c-primePdp35VarA");
    primePdp35InVarAOrB = true;
  } else if (primePdp35?.name === "Var B - Compact status cards") {
    document.body.classList.add("c-primePdp35VarB");
    primePdp35InVarAOrB = true;
  }
  decideKachingSwap(
    document.documentElement.classList.contains("c-paidSearchVisitor") &&
      !primePdp35InVarAOrB
  );

  // Test: V_PRIME_PDP_27 | Physical-Size Information - "Exactly What Arrives"
  const primePdp27 = window.igData?.user.getTestGroup(
    "ad3c1130-56a6-4aaa-a8bc-d22ebcc2cc64"
  );
  if (primePdp27?.id === "7d0e0615-de58-4c8c-a2fc-425fddb31f8d") {
    document.body.classList.add("c-primePdp27VarA");
  } else if (primePdp27?.id === "c82a6023-4e4c-4d51-8de0-3ed8db9f16ce") {
    document.body.classList.add("c-primePdp27VarB");
  } else if (primePdp27?.id === "e871cc71-7f5e-4756-9df6-a65c7e55b194") {
    document.body.classList.add("c-primePdp27VarC");
  } else if (primePdp27?.id === "8fdee977-6c36-4379-bbbb-4bd83be59175") {
    document.body.classList.add("c-primePdp27VarD");
  } else if (primePdp27?.id === "36f59724-5e21-411e-94c1-8988cfd83384") {
    document.body.classList.add("c-primePdp27VarE");
  } else if (primePdp27?.id === "640a45aa-d390-42b2-a8a8-28d5f305a890") {
    document.body.classList.add("c-primePdp27VarF");
  }

  // Test: V_PRIME_CART_32 | Charity Donation Minicart Add-On — Give the Gift of Reading (BFCM)
  const primeCart32 = window.igData?.user.getTestGroup(
    "09ae0d10-fdd8-4c8b-91e8-e282765ad1a2"
  );
  if (primeCart32?.id === "bc53f2c0-d5e5-4829-91b5-298e23b0a3b6") {
    document.body.classList.add("c-primeCart32VarA");
  } else if (primeCart32?.id === "63c92951-09f5-43e6-9cc9-656bd70479fa") {
    document.body.classList.add("c-primeCart32VarB");
  }

  // Test: V_PRIME_MIX_30 | PDP Gift-Threshold Progress Bar (BFCM)
  const primeMix30 = window.igData?.user.getTestGroup(
    "d6e0d425-a1eb-4507-9ff9-eb899b475a2f"
  );
  if (primeMix30?.name === "Var A") {
    document.body.classList.add("c-primeMix30VarA");
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
    window.igEvents.push({ event: "view_cart" });
    window.igEvents.push({ event: "Open_mini_cart" });
  } else if (!isActive) {
    cartDrawerWasActive = false;
  }
}, 200);

// Event: click_gallery_thumnail - Fires when users engage with the PDP gallery thumbnails
document.addEventListener("click", (event) => {
  const thumbnail = event.target.closest(".thumbnail-list__item .thumbnail");
  if (!thumbnail) return;
  window.igEvents = window.igEvents || [];
  window.igEvents.push({ event: "click_gallery_thumnail" });
});

// Held-out visitors get Control in every test. Runs before handleExperiments().
function holdOutFromAllTests() {
  const user = window.igData?.user;
  if (!user || user.validareHoldoutApplied) return;
  if (user.getTestGroup(HOLDOUT_EXPERIMENT_ID)?.id !== HOLDOUT_GROUP_ID) return;
  try {
    const getTestGroup = user.getTestGroup.bind(user);
    user.getTestGroup = (id) =>
      id === HOLDOUT_EXPERIMENT_ID ? getTestGroup(id) : null;
    user.validareHoldoutApplied = true;
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  domLoaded = true;
  handleExperiments();
});

window.addEventListener("ig:ready", () => {
  holdOutFromAllTests();
  igReady = true;
  handleExperiments();
});
