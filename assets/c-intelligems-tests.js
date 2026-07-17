let domLoaded = false;
let igReady = false;

function handleExperiments() {
  if (!domLoaded || !igReady) return;

  // Test: V_PRIME_HP_09 | HP - Banner Image - Repositioning
  const primeHp09 = window.igData?.user.getTestGroup(
    "d289d23b-c68c-48f7-b0b4-f39d3882426c"
  );

  if (primeHp09?.name === "Var A") {
    document.body.classList.add("c-primeHp09VarA");
  }

  // Test: V_PRIME_HP_05 | Testimonials - Homepage
  const primeHp05 = window.igData?.user.getTestGroup(
    "17369126-c2d8-4bd2-a678-994de7489a47"
  );

  if (primeHp05?.name === "Var A") {
    document.body.classList.add("c-primeHp05VarA");
  }

  // Test: V_PRIME_PDP_10 | Gallery Images Optimization
  const primePdp10 = window.igData?.user.getTestGroup(
    "5bacdd65-f916-4413-815f-bc4401969b33"
  );

  if (primePdp10?.name === "Var A : Sparks Curiosity") {
    document.body.classList.add("c-primePdp10VarA");
  } else if (primePdp10?.name === "Var B : Gift + Less Screen Time") {
    document.body.classList.add("c-primePdp10VarB");
  }

  // Test: V_PRIME_SITE_11 | Sitewide Typography Scale Increase
  const primeSite11 = window.igData?.user.getTestGroup(
    "0852104b-e9e7-4343-ae4d-ad36fb8a3ea8"
  );

  if (primeSite11?.name === "Var A") {
    document.body.classList.add("c-primeSite11VarA");
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
