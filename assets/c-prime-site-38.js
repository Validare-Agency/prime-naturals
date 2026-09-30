// V_PRIME_SITE_38 | Reduce 3-Book and 5-Book Bundle Prices by $10
// Intelligems custom event: bundle_selector_click — any bundle option card on
// the PDP, from both the Control (c-prime-pdp-17-bundle) and Var A
// (c-prime-site-38-bundle) selectors.
(function () {
  // Each card is a <label> wrapping its radio: a click anywhere on the card
  // always lands exactly one click on the radio itself (the label forwards
  // it), so listening on the radio counts each card click once.
  document.addEventListener('click', function (event) {
    if (!event.target.matches || !event.target.matches('.c-pdp17-variant .c-pdp17-row__radio')) return;
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'bundle_selector_click' });
  });
})();
