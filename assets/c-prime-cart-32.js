// assets/c-prime-cart-32.js — V_PRIME_CART_32 | Charity Donation Minicart Add-On

(function () {
  var DONATION_CENTS = 200; // $2.00

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function updateTotals(isDonating) {
    var btn = document.getElementById('CartDrawer-Checkout');
    var baseAmount = btn ? parseInt(btn.dataset.baseAmount || '0', 10) : 0;
    var total = isDonating ? baseAmount + DONATION_CENTS : baseAmount;
    var formatted = formatMoney(total);

    // Update subtotal money span
    var subtotalEl = document.getElementById('c-primeCart32-subtotal-money');
    if (subtotalEl) subtotalEl.textContent = formatted;

    // Update checkout button label (only when display_price is enabled)
    if (btn) {
      var label = btn.querySelector('.button__label');
      if (label) {
        // Cache original text on first encounter
        if (!btn.dataset.originalLabel) {
          btn.dataset.originalLabel = label.textContent.trim().replace(/\s+/g, ' ');
        }
        var orig = btn.dataset.originalLabel;
        if (orig.indexOf('•') !== -1) {
          var prefix = orig.split('•')[0].trim();
          label.textContent = prefix + ' • ' + formatted;
        }
      }
    }

    // Show/hide donation line item row
    var lineItem = document.getElementById('c-primeCart32-line-item');
    if (lineItem) {
      lineItem.classList.toggle('c-primeCart32-line-item--active', isDonating);
      lineItem.setAttribute('aria-hidden', isDonating ? 'false' : 'true');
    }
  }

  function initDonationModule() {
    var module = document.getElementById('c-primeCart32-module');
    if (!module) return;

    var ctaBtn = document.getElementById('c-primeCart32-cta');
    if (!ctaBtn) return;

    // Reset originalLabel cache so fresh totals are read after re-renders
    var btn = document.getElementById('CartDrawer-Checkout');
    if (btn) btn.removeAttribute('data-original-label');

    // Var B: apply preselected state on (re-)init
    var isVarB = document.body.classList.contains('c-primeCart32VarB');
    if (isVarB) {
      module.classList.add('c-primeCart32-module--selected');
      ctaBtn.setAttribute('aria-pressed', 'true');
      updateTotals(true);
    } else {
      // Var A: ensure unselected on re-render
      module.classList.remove('c-primeCart32-module--selected');
      ctaBtn.setAttribute('aria-pressed', 'false');
      updateTotals(false);
    }

    // Clone to remove any stale event listeners after re-renders
    var freshCta = ctaBtn.cloneNode(true);
    ctaBtn.parentNode.replaceChild(freshCta, ctaBtn);

    freshCta.addEventListener('click', function () {
      var isSelected = module.classList.toggle('c-primeCart32-module--selected');
      freshCta.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      updateTotals(isSelected);
      window.igEvents = window.igEvents || [];
      window.igEvents.push({ event: 'donation_cta_click' });
    });

    // Decline button (Var A only)
    var declineBtn = document.getElementById('c-primeCart32-decline');
    if (declineBtn) {
      var freshDecline = declineBtn.cloneNode(true);
      declineBtn.parentNode.replaceChild(freshDecline, declineBtn);
      freshDecline.addEventListener('click', function () {
        if (!module.classList.contains('c-primeCart32-module--selected')) return;
        module.classList.remove('c-primeCart32-module--selected');
        var cta = document.getElementById('c-primeCart32-cta');
        if (cta) cta.setAttribute('aria-pressed', 'false');
        updateTotals(false);
        window.igEvents = window.igEvents || [];
        window.igEvents.push({ event: 'donation_cta_click' });
      });
    }
  }

  // Init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDonationModule);
  } else {
    initDonationModule();
  }

  // Re-init when cart items re-render (qty updates, add-to-cart, etc.)
  document.addEventListener('DOMContentLoaded', function () {
    var cartItemsEl = document.getElementById('CartDrawer-CartItems');
    if (!cartItemsEl) return;
    var observer = new MutationObserver(function (mutations) {
      var hasAddedNodes = mutations.some(function (m) {
        return m.type === 'childList' && m.addedNodes.length > 0;
      });
      if (hasAddedNodes) {
        setTimeout(initDonationModule, 150);
      }
    });
    observer.observe(cartItemsEl, { childList: true });
  });
})();
