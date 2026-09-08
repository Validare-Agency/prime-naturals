// V_PRIME_PDP_25 | Offer iteration: winning BOGO + gift stack
// Handles gift-tier unlock states and Intelligems bundle-tier click events.
// ATC, tier-price update, and upsell interactions are owned by c-prime-pdp-22.js
// (which still binds to the c-pdp22-* elements kept in c-prime-pdp-25-bundle.liquid).
(function () {
  // Derive a 1-based tier number from a radio's data-quantity attribute.
  // Quantity 1 = tier 1, 3 = tier 2 (B2G1), 5 = tier 3 (B3G2).
  function tierFromRadio(radio) {
    var qty = parseInt(radio.getAttribute('data-quantity'), 10) || 1;
    if (qty >= 5) return 3;
    if (qty >= 3) return 2;
    return 1;
  }

  // Refresh each gift's data-pdp25-unlocked attribute based on the
  // currently selected tier.  CSS reads this attribute to show/hide
  // the lock overlay, threshold label, retail value, and FREE label.
  function updateGifts(root) {
    var giftsContainer = root.querySelector('[data-pdp25-gifts]');
    if (!giftsContainer) return;

    var checked = root.querySelector('.c-pdp22-row__radio:checked');
    if (!checked) return;

    var tier = tierFromRadio(checked);

    root.querySelectorAll('[data-pdp25-gift]').forEach(function (gift) {
      var minTier = parseInt(gift.getAttribute('data-pdp25-gift-min-tier'), 10) || 1;
      gift.setAttribute('data-pdp25-unlocked', tier >= minTier ? 'true' : 'false');
    });
  }

  // Fire the relevant Intelligems custom event for tier-2 or tier-3 clicks.
  // Fires for ALL visitors (Control and variants) — these are behavioural
  // engagement metrics, not variant-gated.
  function trackBundleTierClick(radio) {
    var tier = tierFromRadio(radio);
    if (tier === 2) {
      window.igEvents = window.igEvents || [];
      window.igEvents.push({ event: 'bundle_tier2_click' });
    } else if (tier === 3) {
      window.igEvents = window.igEvents || [];
      window.igEvents.push({ event: 'bundle_tier3_click' });
    }
  }

  function initRoot(root) {
    if (root.dataset.pdp25Init) return;
    root.dataset.pdp25Init = 'true';

    root.querySelectorAll('.c-pdp22-row__radio').forEach(function (radio) {
      radio.addEventListener('change', function () {
        updateGifts(root);
        trackBundleTierClick(radio);
      });
    });

    // Initialise gift states to match the default-checked radio (tier 1).
    updateGifts(root);
  }

  function run() {
    document.querySelectorAll('.c-pdp25-variant').forEach(initRoot);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
