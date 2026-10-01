// V_PRIME_SITE_38 | Reduce 3-Book and 5-Book Bundle Prices by $10
(function () {
  // Loaded by both sections/main-product.liquid and sections/cart-drawer.liquid
  if (window.primeSite38Loaded) return;
  window.primeSite38Loaded = true;

  // Intelligems custom event: bundle_selector_click — any bundle option card
  // on the PDP, from both the Control (c-prime-pdp-17-bundle) and Var A
  // (c-prime-site-38-bundle) selectors. Each card is a <label> wrapping its
  // radio: a click anywhere on the card always lands exactly one click on the
  // radio itself (the label forwards it), so listening on the radio counts
  // each card click once.
  document.addEventListener('click', function (event) {
    if (!event.target.matches || !event.target.matches('.c-pdp17-variant .c-pdp17-row__radio')) return;
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'bundle_selector_click' });
  });

  // Var A: cart drawer upsells add the price-test duplicate of each book
  // (window.primeSite38PriceTestVariants, from sections/cart-drawer.liquid)
  // so Kaching prices them the same as the Var A PDP bundle.
  // Hide the whole upsells block (incl. its "78% of parents add these"
  // title) once every card in it is hidden — Liquid only does this for
  // cards it hid itself, not the ones hidden below.
  function hideEmptyUpsellBlocks() {
    document.querySelectorAll('.cart-drawer-upsells-container').forEach(function (container) {
      var hasVisible = container.querySelector('cart-drawer-upsell:not(.hidden)');
      container.classList.toggle('hidden', !hasVisible);
    });
  }

  function swapCartUpsells() {
    var map = window.primeSite38PriceTestVariants;
    if (!map || !document.body.classList.contains('c-primeSite38VarA')) return;

    document.querySelectorAll('cart-drawer-upsell').forEach(function (upsell) {
      var entry = map[upsell.dataset.id];
      if (entry) {
        upsell.dataset.id = entry.id;
        upsell.dataset.site38Handle = entry.handle;
        var input = upsell.querySelector('input[name="id"]');
        if (input) input.value = entry.id;
      }
      // Same as the block's "hide in cart items" setting, which only checks
      // the live product's handle
      if (upsell.dataset.site38Handle && document.querySelector('.cart-item--product-' + upsell.dataset.site38Handle)) {
        upsell.classList.add('hidden');
      }
    });
    hideEmptyUpsellBlocks();
  }

  // The drawer is re-rendered after every cart change, and the Var A body
  // class can land after DOMContentLoaded (ig:ready)
  var queued = false;
  function queueSwap() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      swapCartUpsells();
    });
  }

  function init() {
    swapCartUpsells();
    new MutationObserver(queueSwap).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(queueSwap).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
