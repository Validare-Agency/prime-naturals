// V_PRIME_SITE_38 | Reduce 3-Book and 5-Book Bundle Prices by $10 — winner
// (Var A), rolled out to c-validareOptimized visitors only.
(function () {
  // Loaded by both sections/main-product.liquid and sections/cart-drawer.liquid
  if (window.primeSite38Loaded) return;
  window.primeSite38Loaded = true;

  // c-validareOptimized: cart drawer upsells add the price-test duplicate of
  // each book (window.primeSite38PriceTestVariants, from
  // sections/cart-drawer.liquid) so Kaching prices them the same as the
  // winner PDP bundle. Holdout visitors keep the live products.
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
    if (!map || !document.body.classList.contains('c-validareOptimized')) return;

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

  // The drawer is re-rendered after every cart change, and the
  // c-validareOptimized body class can land after DOMContentLoaded (ig:ready)
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
