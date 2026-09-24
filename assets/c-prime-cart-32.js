// assets/c-prime-cart-32.js — V_PRIME_CART_32 | Charity Donation Minicart Add-On — Give the Gift of Reading (BFCM)

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

    // Update checkout button label when display_price is enabled (label contains '•')
    if (btn) {
      var label = btn.querySelector('.button__label');
      if (label) {
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

    // Show/hide donation line-item row in the pricing summary
    var lineItem = document.getElementById('c-primeCart32-line-item');
    if (lineItem) {
      lineItem.classList.toggle('c-primeCart32-line-item--active', isDonating);
      lineItem.setAttribute('aria-hidden', isDonating ? 'false' : 'true');
    }
  }

  function initDonationModule() {
    var card = document.querySelector('[data-c-cart32]');
    if (!card) return;

    var checkbox = card.querySelector('.c-cart32__input');
    if (!checkbox) return;

    // Reset cached label so a re-rendered button is read fresh
    var btn = document.getElementById('CartDrawer-Checkout');
    if (btn) btn.removeAttribute('data-original-label');

    var isVarB = document.body.classList.contains('c-primeCart32VarB');

    // Var B: force the checkbox into the preselected state on every init
    if (isVarB && !checkbox.checked) {
      checkbox.checked = true;
    }

    // Sync the card class and the totals with the current checkbox state
    card.classList.toggle('c-cart32--selected', checkbox.checked);
    updateTotals(checkbox.checked);

    // Clone to drop any stale event listeners from a previous render
    var freshCheckbox = checkbox.cloneNode(true);
    checkbox.parentNode.replaceChild(freshCheckbox, checkbox);

    freshCheckbox.addEventListener('change', function () {
      card.classList.toggle('c-cart32--selected', this.checked);
      updateTotals(this.checked);
      window.igEvents = window.igEvents || [];
      window.igEvents.push({ event: 'donation_cta_click' });
    });

    // Decline helper button (Var A only — CSS guards visibility)
    var declineBtn = card.querySelector('.c-cart32__decline');
    if (declineBtn) {
      var freshDecline = declineBtn.cloneNode(true);
      declineBtn.parentNode.replaceChild(freshDecline, declineBtn);
      freshDecline.addEventListener('click', function () {
        var cb = card.querySelector('.c-cart32__input');
        if (!cb || !cb.checked) return;
        cb.checked = false;
        card.classList.remove('c-cart32--selected');
        updateTotals(false);
        window.igEvents = window.igEvents || [];
        window.igEvents.push({ event: 'donation_cta_click' });
      });
    }
  }

  // Init on DOMContentLoaded (or immediately if the DOM is already ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDonationModule);
  } else {
    initDonationModule();
  }

  // Re-init when the cart items area re-renders (qty changes, add-to-cart, etc.)
  // The donation card itself sits outside CartDrawer-CartItems so it survives
  // re-renders, but the checkout button's data-base-amount and the subtotal
  // element may be refreshed — re-reading them here keeps totals accurate.
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
