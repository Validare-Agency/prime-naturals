let domLoaded = false;
let igReady = false;

function handleExperiments() {
  if (!domLoaded || !igReady) return;

  // Test: V_PRIME_CART_15 | Cart: Free shipping threshold
  const primeCart15 = window.igData?.user.getTestGroup(
    "b92c2ab8-1943-40c1-b0d2-d3df7737f653"
  );

  if (primeCart15?.name === "Var A") {
    document.body.classList.add("c-primeCart15VarA");
  }

  // Test: V_PRIME_PDP_12 | Gallery Image Size + Thumbnail Scroll Affordance
  const primePdp12 = window.igData?.user.getTestGroup(
    "411867b6-e6d9-4131-b67b-ccaae8b75fd3"
  );

  if (primePdp12?.name === "Var A") {
    document.body.classList.add("c-primePdp12VarA");
  }

  // Test: V_PRIME_PDP_17 | Offer Restructure - PDP
  const primePdp17 = window.igData?.user.getTestGroup(
    "48756dd3-fd4e-4831-a6da-d19821030fb4"
  );

  if (primePdp17?.name === "Var A - % stacking without offer") {
    document.body.classList.add("c-primePdp17VarA");
  } else if (primePdp17?.name === "Var B - % stacking with free gifts exposed") {
    document.body.classList.add("c-primePdp17VarB");
  } else if (primePdp17?.name === "Var C - B2G1 Free - Offer stacking") {
    document.body.classList.add("c-primePdp17VarC");
  } else if (primePdp17?.name === "Var D - B2G1 Free - Free Shipping") {
    document.body.classList.add("c-primePdp17VarD");
  } else if (primePdp17?.name === "Var E — B2G1 Free - No offer - Visual representation") {
    document.body.classList.add("c-primePdp17VarE");
  } else if (primePdp17?.name === "Var F - 5-tier ladder + stacked perks exposed") {
    document.body.classList.add("c-primePdp17VarF");
  } else if (primePdp17?.name === "Var G - The Complete Collection (all 3 titles) + Value stacking") {
    document.body.classList.add("c-primePdp17VarG");
  } else if (primePdp17?.name === "Var H — Bundle Offer") {
    document.body.classList.add("c-primePdp17VarH");
  }

  // Test: V_PRIME_PDP_19 | PDP - Reviews - FB
  const primePdp19 =  window.igData?.user.getTestGroup(
    "7540f3a1-7d2c-4ee8-a965-35aab62c7aae"
  );
  if (primePdp19?.name === "Var A") {
    document.body.classList.add("c-primePdp19VarA");
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
