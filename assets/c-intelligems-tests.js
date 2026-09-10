let domLoaded = false;
let igReady = false;

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
  // document.body.classList.add(
  //   isHeldOut ? "c-validareHoldout" : "c-validareOptimized"
  // );
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

  // Test: V_PRIME_PDP_25 | Unlock Bonus Free Gifts
  const primePdp25 = window.igData?.user.getTestGroup(
    "59bf8132-e0c0-4d87-acec-2b3319273615"
  );
  if (primePdp25?.name === "Var A - Inline gifts shown") {
    document.body.classList.add("c-primePdp25VarA");
  } else if (primePdp25?.name === "Var B - Gifts with lock thresholds") {
    document.body.classList.add("c-primePdp25VarB");
  } else if (
    primePdp25?.name === "Var C - Bordered gift tiles with lock/unlock"
  ) {
    document.body.classList.add("c-primePdp25VarC");
  } else if (
    primePdp25?.name ===
    "Var D - Bordered gift tiles with lock/unlock Threshold"
  ) {
    document.body.classList.add("c-primePdp25VarD");
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
