// Test: V_PRIME_CART_15 | Cart: Free shipping threshold
(function () {
  // Var A tests a $55 threshold; control keeps using the block's own configured
  // goal untouched (do not change config/settings_data.json's "goal" for this test —
  // that setting is shared with control and must stay exactly as it was).
  var VARIANT_GOAL_CENTS = 5500;

  var TRUCK_SVG =
    '<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M4.85733 16.1458C5.79977 15.8602 6.33225 14.8647 6.04666 13.9222C5.76108 12.9798 4.76557 12.4473 3.82313 12.7329C2.88069 13.0185 2.34821 14.014 2.6338 14.9564C2.91939 15.8989 3.9149 16.4314 4.85733 16.1458Z" fill="currentColor"/>' +
    '<path d="M14.5631 16.2264C15.5479 16.2264 16.3462 15.428 16.3462 14.4433C16.3462 13.4585 15.5479 12.6602 14.5631 12.6602C13.5784 12.6602 12.78 13.4585 12.78 14.4433C12.78 15.428 13.5784 16.2264 14.5631 16.2264Z" fill="currentColor"/>' +
    '<path d="M18.7495 8.52947C18.2252 7.60897 17.6285 6.73165 16.9649 5.90584C16.6547 5.52212 16.2642 5.21113 15.8207 4.99479C15.3773 4.77846 14.8918 4.66205 14.3984 4.65377C13.8047 4.64412 13.2195 4.63855 12.7797 4.63855H12.7753C12.6823 4.17051 12.44 3.74522 12.0849 3.42648C11.7298 3.10774 11.2809 2.91272 10.8055 2.87066C10.1654 2.81426 7.65492 2.77344 6.45258 2.77344C5.25023 2.77344 2.74164 2.81426 2.09965 2.87066C1.5835 2.91624 1.09986 3.142 0.733467 3.50839C0.367077 3.87478 0.141314 4.35842 0.0957422 4.87457C0.0408203 5.51471 0 7.32602 0 8.52799C0 9.72996 0.0408203 11.5409 0.0975977 12.1814C0.136233 12.618 0.304011 13.0332 0.579544 13.3741C0.855076 13.715 1.22588 13.9662 1.64469 14.0955C1.73066 13.4247 2.06393 12.8101 2.57925 12.372C3.09457 11.934 3.75483 11.7041 4.43076 11.7273C5.10669 11.7505 5.74962 12.0252 6.23368 12.4975C6.71774 12.9699 7.00806 13.6059 7.04781 14.2811C7.85309 14.2751 8.89846 14.2584 9.70596 14.235C10.3498 14.2551 11.1503 14.2699 11.8531 14.2777C11.8947 13.6011 12.188 12.9644 12.6752 12.493C13.1624 12.0216 13.8083 11.7495 14.486 11.7302C15.1636 11.7109 15.824 11.9458 16.3373 12.3887C16.8505 12.8316 17.1795 13.4505 17.2596 14.1237C17.7007 14.0096 18.0957 13.7617 18.3903 13.4141C18.6849 13.0664 18.8646 12.6361 18.9046 12.1821C18.9536 11.63 18.9907 10.553 19 9.4958C19.0031 9.15725 18.9167 8.8239 18.7495 8.52947ZM16.9427 9.09799H12.9059C12.9059 8.89834 12.9085 8.70648 12.9085 8.52799C12.9085 7.69971 12.8888 6.58197 12.8584 5.75777C13.2811 5.75777 13.8303 5.76371 14.3817 5.77262C14.7112 5.77818 15.0355 5.85608 15.3316 6.00082C15.6276 6.14555 15.8883 6.35357 16.0951 6.61018C16.5461 7.17067 16.9641 7.75701 17.3468 8.36619C17.3923 8.43842 17.4177 8.52154 17.4201 8.6069C17.4226 8.69225 17.4022 8.77671 17.3609 8.85146C17.3196 8.92621 17.259 8.98852 17.1855 9.03188C17.1119 9.07524 17.028 9.09807 16.9427 9.09799Z" fill="currentColor"/>' +
    '</svg>';

  function isActive() {
    return document.body.classList.contains('c-primeCart15VarA');
  }

  function formatMoney(cents) {
    var fixed = (cents / 100).toFixed(2).replace(/\.00$/, '');
    return '$' + fixed;
  }

  function upgradeBar(bar) {
    var track = bar.querySelector('.cart-progress__bar');
    var fill = bar.querySelector('.cart-progress__bar__progress');
    var badge = bar.querySelector('.cart-progress__bar__badge');
    var text = bar.querySelector('.cart-progress__text');
    if (!track || !fill || !badge || !text) return;

    // Move the badge out of the moving fill so it marks the fixed goal at the
    // end of the track instead of sliding along with cart progress.
    if (badge.parentElement === fill) {
      track.appendChild(badge);
    }

    // Swap the theme's Material Symbols glyph for the exact truck vector from
    // the Figma design.
    if (!badge.hasAttribute('data-cart15-icon')) {
      badge.innerHTML = TRUCK_SVG;
      badge.setAttribute('data-cart15-icon', '');
    }

    var subtotalCents = parseInt(bar.getAttribute('data-cart-subtotal-cents'), 10);
    if (isNaN(subtotalCents)) return;

    // Recompute everything against the variant's own $55 goal — control keeps
    // rendering against the block's real (untouched) configured goal.
    var pct = Math.min(100, (subtotalCents / VARIANT_GOAL_CENTS) * 100);
    var reached = subtotalCents >= VARIANT_GOAL_CENTS;
    fill.style.width = pct + '%';
    bar.setAttribute('data-goal-reached', reached ? 'true' : 'false');

    var progressTemplate = bar.getAttribute('data-progress-message') || '';
    var successTemplate = bar.getAttribute('data-success-message') || '';
    var message = reached
      ? successTemplate
      : progressTemplate.replace('[amount]', formatMoney(VARIANT_GOAL_CENTS - subtotalCents));
    if (message && text.textContent.trim() !== message.trim()) {
      text.textContent = message;
    }

    var goalAmount = formatMoney(VARIANT_GOAL_CENTS);
    var goalEl = track.querySelector('.cart-progress__bar__goal');
    if (!goalEl) {
      goalEl = document.createElement('span');
      goalEl.className = 'cart-progress__bar__goal';
      track.appendChild(goalEl);
    }
    if (goalEl.textContent !== goalAmount) {
      goalEl.textContent = goalAmount;
    }
  }

  function run() {
    if (!isActive()) return;
    document.querySelectorAll('.cart-progress[data-cart-subtotal-cents]').forEach(upgradeBar);
  }

  var observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('ig:ready', run);
})();
