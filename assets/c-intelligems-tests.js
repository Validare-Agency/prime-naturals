let domLoaded = false;
let igReady = false;

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

  // Test: V_PRIME_HP_09 | HP - Banner Image - Repositioning
  const primeHp09 = window.igData?.user.getTestGroup(
    "d289d23b-c68c-48f7-b0b4-f39d3882426c"
  );

  if (primeHp09?.name === "Var A") {
    document.body.classList.add("c-primeHp09VarA");
  }

  // Test: V_PRIME_PDP_10 | Gallery Images Optimization
  const primePdp10 = window.igData?.user.getTestGroup(
    "5bacdd65-f916-4413-815f-bc4401969b33"
  );

  if (primePdp10?.name === "Var A") {
    document.body.classList.add("c-primePdp10VarA");
  } else if (primePdp10?.name === "Var B") {
    document.body.classList.add("c-primePdp10VarB");
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
