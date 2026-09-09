let domLoaded = false;
let igReady = false;

// Validare Holdout. Permanent, never end it.
const HOLDOUT_EXPERIMENT_ID = "3ad2181f-d285-418c-b4d8-a52ce3a136a1";
const HOLDOUT_GROUP_ID = "c41ea5b4-45b8-4edf-8687-844be31c4054";

function handleExperiments() {
  if (!domLoaded || !igReady) return;

  // Holdout: V_PRIME_HOLDOUT_G1 (do not edit)
  const isHeldOut = window.igData?.user.getTestGroup(HOLDOUT_EXPERIMENT_ID)?.id === HOLDOUT_GROUP_ID;
  document.body.classList.add(isHeldOut ? "c-validareHoldout" : "c-validareOptimized");
  try { localStorage.setItem("validare_holdout", isHeldOut ? "1" : "0"); } catch (e) {}

  // Test: V_PRIME_MIX_26 | Grandparent-voice Testimonial Carousel
  const primeMix26 = window.igData?.user.getTestGroup(
    "09581346-2806-47e0-80ef-c94e215d67b1"
  );
  if (primeMix26?.name === "Var A") {
    document.body.classList.add("c-primeMix26VarA");
  }


  // Test: V_PRIME_PDP_20 | Product Page - USPs - ATF
  const primePdp20 = window.igData?.user.getTestGroup(
    "7238475d-4fc1-46fd-99f1-7c262f87885c"
  );
  if (primePdp20?.name === "Var A - Badges below thumbnails") {
    document.body.classList.add("c-primePdp20VarA");
  } else if (primePdp20?.name === "Var B - Badges below review card") {
    document.body.classList.add("c-primePdp20VarB");
  } else if (primePdp20?.name === "Var C - Badges within info stack") {
    document.body.classList.add("c-primePdp20VarC");
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
    user.getTestGroup = (id) => (id === HOLDOUT_EXPERIMENT_ID ? getTestGroup(id) : null);
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
