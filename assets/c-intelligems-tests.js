let domLoaded = false;
let igReady = false;

// V_PRIME_PDP_35 | Kaching product-id swap, Murphy/Leadership only. Same
// mechanism as the Snuggi price test on ab-test/V_PIL_PDP_04: kaching-bundle
// is hidden from page load via an injected style (before we even know the
// visitor's paid-search/test-bucket status, which only resolves later on
// ig:ready), then for paid search + Var A/B visitors it's swapped to point
// at the OTHER product id below (the id that carries the actual deal config
// to use) and force-initialized via Kaching's own internal init function —
// staying hidden permanently, since the shopper sees .c-pdp35-variant
// instead and is never meant to see this widget at all. Anyone else: the
// original, un-swapped widget is revealed immediately.
//
// Keys are the real product ids shoppers land on (murphys-law-for-kids =
// "Murphy", murphys-law-for-kids-copy = "Leadership" despite its handle);
// values are the OTHER id whose Kaching config should render in its place.
// The "-google-ads" duplicate handles/ids given earlier were only ever
// reference for which two products this applies to, not the real URLs or
// swap targets.
const KACHING_SWAP_TARGET_BY_PRODUCT_ID = {
  "7568898293894": "7733150187654", // murphys-law-for-kids -> swap to this id
  "7587123658886": "7733149794438", // murphys-law-for-kids-copy -> swap to this id
};
const kachingSwapProductId =
  KACHING_SWAP_TARGET_BY_PRODUCT_ID[String(window.__productIdFromTemplate)];

let kachingRevealBundle = () => {};
let kachingRevealBackstop = null;
if (kachingSwapProductId) {
  const kachingHideStyle = document.createElement("style");
  kachingHideStyle.textContent = "kaching-bundle{display:none !important;}";
  document.head.appendChild(kachingHideStyle);

  let kachingRevealed = false;
  kachingRevealBundle = () => {
    if (kachingRevealed) return;
    kachingRevealed = true;
    clearTimeout(kachingRevealBackstop);
    kachingHideStyle.remove();
  };

  // Absolute backstop — never leave the widget hidden forever, no matter
  // what fails upstream (Intelligems, Kaching, or our own logic below).
  // Cleared once a swap actually succeeds, since that case is meant to stay
  // hidden permanently.
  kachingRevealBackstop = setTimeout(kachingRevealBundle, 20000);
}

function kachingWaitForInit(onReady, retriesLeft = 25) {
  if (typeof window.__kachingBundlesInitializeInternal === "function") {
    onReady();
    return;
  }
  if (retriesLeft <= 0) {
    kachingRevealBundle();
    return;
  }
  setTimeout(() => kachingWaitForInit(onReady, retriesLeft - 1), 200);
}

const KACHING_SWAP_ATTEMPT_TIMEOUT = 4000;
const KACHING_SWAP_MAX_ATTEMPTS = 3;
let kachingSwapAttempted = false;

// Called once we know this visitor's paid-search status and V_PRIME_PDP_35
// bucket. The swap itself applies to ANY paid search visitor on these two
// pages — Control (no test bucket) still needs to see the swapped Kaching
// config, not the page's own original one, same as Var A/B — the only
// difference is what happens after the swap succeeds:
//   - not paid search: no swap, reveal the original widget immediately.
//   - paid search, Control/no group: swap, then REVEAL it (this is the
//     group that's actually meant to see Kaching at all — see the 3-way
//     split in c-prime-pdp-17.css).
//   - paid search, Var A/B: swap, then stay HIDDEN — the shopper sees
//     .c-pdp35-variant instead, but the swapped widget keeps
//     computing/updating in the background regardless.
function decideKachingSwap(isPaidSearch, isVarAOrB) {
  if (kachingSwapAttempted) return;
  kachingSwapAttempted = true;

  // Called unconditionally on every page (see handleExperiments below), but
  // this whole mechanism — including the hide-style — only ever applies to
  // Murphy/Leadership. Everywhere else, kachingSwapProductId is undefined
  // and nothing here should run at all: no swap, no reveal call (nothing
  // was hidden to begin with), otherwise a paid search visitor on ANY OTHER
  // product would get its kaching-bundle cloned with product-id="undefined".
  if (!kachingSwapProductId) return;

  if (!isPaidSearch) {
    kachingRevealBundle();
    return;
  }
  kachingWaitForInit(() => kachingAttemptSwap(1, !isVarAOrB));
}

function kachingAttemptSwap(attempt, revealAfterSwap) {
  const oldEl = document.querySelector("kaching-bundle");
  const parent = oldEl?.parentNode;
  if (!oldEl || !parent) {
    kachingRevealBundle();
    return;
  }

  const newEl = document.createElement("kaching-bundle");
  Array.from(oldEl.attributes).forEach((attr) =>
    newEl.setAttribute(attr.name, attr.value)
  );
  newEl.setAttribute("product-id", kachingSwapProductId);
  newEl.removeAttribute("data-initialized");
  parent.appendChild(newEl);

  let settled = false;

  const confirmSwap = () => {
    if (settled) return;
    settled = true;
    obs.disconnect();
    clearTimeout(fallback);
    parent.replaceChild(newEl, oldEl);
    if (revealAfterSwap) {
      // Control/no group — Kaching is what this visitor is meant to see,
      // just showing the swapped product's config instead of the
      // original.
      kachingRevealBundle();
    } else {
      // Var A/B — intentionally never revealed. This swapped widget keeps
      // computing/updating in the background, never shown to the shopper.
      clearTimeout(kachingRevealBackstop);
    }
  };

  const retryOrGiveUp = () => {
    if (settled) return;
    settled = true;
    obs.disconnect();
    clearTimeout(fallback);
    newEl.remove();

    if (attempt < KACHING_SWAP_MAX_ATTEMPTS) {
      kachingAttemptSwap(attempt + 1, revealAfterSwap);
    } else {
      // Exhausted retries — reveal the original, un-swapped widget rather
      // than nothing.
      kachingRevealBundle();
    }
  };

  const fallback = setTimeout(() => {
    if (newEl.children.length > 0) confirmSwap();
    else retryOrGiveUp();
  }, KACHING_SWAP_ATTEMPT_TIMEOUT);

  const obs = new MutationObserver(() => {
    if (settled || newEl.children.length === 0) return;
    confirmSwap();
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

  // Test: V_PRIME_MIX_26 | Grandparent-voice Testimonial Carousel
  const primeMix26 = window.igData?.user.getTestGroup(
    "09581346-2806-47e0-80ef-c94e215d67b1"
  );
  if (primeMix26?.name === "Var A") {
    document.body.classList.add("c-primeMix26VarA");
  }

  // Test: V_PRIME_PDP_22 | Encyclopedia - Upsell
  const primePdp22 = window.igData?.user.getTestGroup(
    "611c3873-2fc9-458b-82a5-f3ed383dd2ef"
  );
  if (primePdp22?.name === "Var A - Leadership checkbox") {
    document.body.classList.add("c-primePdp22VarA");
  } else if (primePdp22?.name === "Var B - Leadership ADD button") {
    document.body.classList.add("c-primePdp22VarB");
  } else if (primePdp22?.name === "Var C - Murphy checkbox") {
    document.body.classList.add("c-primePdp22VarC");
  } else if (primePdp22?.name === "Var D - Murphy ADD button") {
    document.body.classList.add("c-primePdp22VarD");
  } else if (primePdp22?.name === "Var E - Both checkbox") {
    document.body.classList.add("c-primePdp22VarE");
  } else if (primePdp22?.name === "Var F - Both ADD button") {
    document.body.classList.add("c-primePdp22VarF");
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
  } else if (
    primePdp35?.name === "Var B - Compact status cards"
  ) {
    document.body.classList.add("c-primePdp35VarB");
    primePdp35InVarAOrB = true;
  }
  decideKachingSwap(
    document.documentElement.classList.contains("c-paidSearchVisitor"),
    primePdp35InVarAOrB
  );
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
