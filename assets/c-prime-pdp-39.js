// V_PRIME_PDP_39 | Google Traffic Bundle Prices -$10
(function () {
  // Var A + paid search: cart drawer upsells add the -paid-search duplicate
  // of each book (window.primePdp39PaidSearchVariants, from
  // sections/cart-drawer.liquid) so Kaching prices them the same as the
  // swapped PDP bundle.
  function hideEmptyUpsellBlocks() {
    document.querySelectorAll('.cart-drawer-upsells-container').forEach(function (container) {
      var hasVisible = container.querySelector('cart-drawer-upsell:not(.hidden)');
      container.classList.toggle('hidden', !hasVisible);
    });
  }

  function swapCartUpsells() {
    var map = window.primePdp39PaidSearchVariants;
    if (
      !map ||
      !document.body.classList.contains('c-primePdp39VarA') ||
      !document.documentElement.classList.contains('c-paidSearchVisitor')
    ) return;

    document.querySelectorAll('cart-drawer-upsell').forEach(function (upsell) {
      var entry = map[upsell.dataset.id];
      if (entry) {
        upsell.dataset.id = entry.id;
        upsell.dataset.pdp39Handle = entry.handle;
        var input = upsell.querySelector('input[name="id"]');
        if (input) input.value = entry.id;
      }
      // Same as the block's "hide in cart items" setting, which only checks
      // the live product's handle
      if (upsell.dataset.pdp39Handle && document.querySelector('.cart-item--product-' + upsell.dataset.pdp39Handle)) {
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
