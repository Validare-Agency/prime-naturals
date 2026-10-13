// V_PRIME_PDP_27 | Physical-Size Information - "Exactly What Arrives" (winner: Var A)
// Moves the badge row above the PIB bullets. Visibility is CSS-gated to
// paid search visitors in the optimized group (see c-prime-pdp-27.css).
(function () {
  function repositionPdp27() {
    var pdp27 = document.querySelector('.c-pdp27');
    var pibBullets = document.querySelector('.pib-bullets');
    if (pdp27 && pibBullets && pibBullets.parentNode) {
      pibBullets.parentNode.insertBefore(pdp27, pibBullets);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', repositionPdp27);
  } else {
    repositionPdp27();
  }
})();
