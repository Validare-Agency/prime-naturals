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

  // Test: V_PRIME_CART_15 | Cart: Free shipping threshold
  const primeCart15 = window.igData?.user.getTestGroup(
    "b92c2ab8-1943-40c1-b0d2-d3df7737f653"
  );

  if (primeCart15?.name === "Var A") {
    document.body.classList.add("c-primeCart15VarA");
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

document.addEventListener("DOMContentLoaded", () => {
  domLoaded = true;
  handleExperiments();
});

window.addEventListener("ig:ready", () => {
  igReady = true;
  handleExperiments();
});
