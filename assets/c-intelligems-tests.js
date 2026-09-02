let domLoaded = false;
let igReady = false;

function handleExperiments() {
  if (!domLoaded || !igReady) return;

  // Test: V_PRIME_PDP_19 | PDP - Reviews - FB
  const primePdp19 = window.igData?.user.getTestGroup(
    "7540f3a1-7d2c-4ee8-a965-35aab62c7aae"
  );
  if (primePdp19?.name === "Var A") {
    document.body.classList.add("c-primePdp19VarA");
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

  // Test: V_PRIME_MIX_29 | Free Shipping Threshold at 2-Book Tier
  const primeMix29 = window.igData?.user.getTestGroup(
    "b92c2ab8-1943-40c1-b0d2-d3df7737f653"
  );
  if (primeMix29?.name === "Var A" || primeMix29?.name === "Var B") {
    document.body.classList.add("c-primeMix29VarA");
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

document.addEventListener("DOMContentLoaded", () => {
  domLoaded = true;
  handleExperiments();
});

window.addEventListener("ig:ready", () => {
  igReady = true;
  handleExperiments();
});
