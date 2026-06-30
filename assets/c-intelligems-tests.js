let domLoaded = false;
let igReady = false;

function handleExperiments() {
  if (!domLoaded || !igReady) return;

  // Test: V_PRIME_PDP_07 | PDP review format: auto-scroll vs manual arrows
  const primePdp07 = window.igData?.user.getTestGroup("ec0d5412-f677-4267-b944-7cb74ffda215");
  if (primePdp07?.name === "Var A") {
    document.body.classList.add('c-primePdp07VarA');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  domLoaded = true;
  handleExperiments();
});

window.addEventListener("ig:ready", () => {
  igReady = true;
  handleExperiments();
});
