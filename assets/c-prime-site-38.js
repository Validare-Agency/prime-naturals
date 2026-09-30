// V_PRIME_SITE_38 | Reduce 3-Book and 5-Book Bundle Prices by $10
// Intelligems custom events for the 3/5-book tiers. Fires from both the
// Control (c-prime-pdp-17-bundle) and Var A (c-prime-site-38-bundle) selectors
// so the groups can be compared.
(function () {
  var TIER_EVENTS = {
    3: { select: 'site38_select_3_books', atc: 'site38_atc_3_books' },
    5: { select: 'site38_select_5_books', atc: 'site38_atc_5_books' }
  };

  function track(radio, type) {
    var tier = radio && TIER_EVENTS[radio.getAttribute('data-quantity')];
    if (!tier) return;
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: tier[type] });
  }

  document.addEventListener('change', function (event) {
    var radio = event.target.closest && event.target.closest('.c-pdp17-variant .c-pdp17-row__radio');
    if (radio && radio.checked) track(radio, 'select');
  });

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.c-pdp17-variant [data-pdp17-atc]');
    if (!button || button.disabled) return;
    var root = button.closest('.c-pdp17-variant');
    track(root.querySelector('.c-pdp17-row__radio:checked'), 'atc');
  });
})();
