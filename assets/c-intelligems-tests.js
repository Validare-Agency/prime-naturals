let domLoaded = false;
let igReady = false;

// Kaching product-id swap for paid search visitors, Murphy/Leadership only.
// Same mechanism as the Snuggi price test on ab-test/V_PIL_PDP_04.
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

function decideKachingSwap(isPaidSearch) {
  if (kachingSwapAttempted || !kachingSwapProductId || !isPaidSearch) {
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
// const HOLDOUT_GROUP_ID = "c41ea5b4-45b8-4edf-8687-844be31c4054";
const HOLDOUT_GROUP_ID = "test";

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

  decideKachingSwap(
    document.documentElement.classList.contains("c-paidSearchVisitor")
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

  // Test: V_PRIME_MIX_30 | PDP Gift-Threshold Progress Bar (BFCM)
  const primeMix30 = window.igData?.user.getTestGroup(
    "d6e0d425-a1eb-4507-9ff9-eb899b475a2f"
  );
  if (primeMix30?.name === "Var A") {
    document.body.classList.add("c-primeMix30VarA");
  }

  // Test: V_PRIME_CART_37 | MiniCart Gift-Threshold Progress Bar (BFCM)
  const primeCart37 = window.igData?.user.getTestGroup(
    "1e564aa3-7b0c-40c6-a1c0-d538eb3b8ced"
  );
  if (primeCart37?.id === "bd8e7af0-8a44-4885-8d6f-f111dbfd8a10") {
    document.body.classList.add("c-primeCart37VarA");
  }

  // Test: V_PRIME_SITE_38 | Reduce 3-Book and 5-Book Bundle Prices by $10
  const primeSite38 = window.igData?.user.getTestGroup(
    "cfe28cd7-d647-4cf0-9ab3-b5af8877292a"
  );
  if (primeSite38?.name === "Var A") {
    document.body.classList.add("c-primeSite38VarA");
  }

  // Test: V_PRIME_PDP_24 | Product gallery Images
  const primePdp24 = window.igData?.user.getTestGroup(
    "9b991598-4882-4a65-a44b-9ec73a363963"
  );
  if (primePdp24?.id === "b9d01572-c89b-4040-8fe9-3e6c273816ed") {
    document.body.classList.add("c-primePdp24VarA");
  } else if (primePdp24?.id === "aa089d31-f24c-483d-bc47-e447bb9f0bd1") {
    document.body.classList.add("c-primePdp24VarB");
  } else if (primePdp24?.id === "6ea5a811-3db3-4f4d-80c9-8bcfccd30f68") {
    document.body.classList.add("c-primePdp24VarC");
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
    // V_PRIME_CART_37: mini_cart_opens — drawer opened by a PDP add-to-cart or the cart icon
    window.igEvents.push({ event: "mini_cart_opens" });
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
