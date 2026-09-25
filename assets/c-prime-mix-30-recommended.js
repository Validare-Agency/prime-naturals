// V_PRIME_MIX_30 | PDP Gift-Threshold Progress Bar (BFCM) — Recommended books
(function () {
  // Same cart-icon-bubble / cart-drawer fetch+swap as c-prime-pdp-17.js.
  function refreshCartIconBubble() {
    return fetch(window.routes.cart_url + '?section_id=cart-icon-bubble')
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var freshSection = new DOMParser().parseFromString(html, 'text/html').querySelector('.shopify-section');
        var liveIcon = document.getElementById('cart-icon-bubble');
        if (!freshSection || !liveIcon) return;
        liveIcon.innerHTML = freshSection.innerHTML;
      });
  }

  function refreshCartDrawer() {
    return fetch(window.routes.cart_url + '?section_id=cart-drawer')
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var freshDrawer = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-drawer');
        var liveDrawer = document.querySelector('cart-drawer');
        if (freshDrawer && liveDrawer) {
          liveDrawer.replaceWith(freshDrawer);
          freshDrawer.classList.add('active');
        }
        return refreshCartIconBubble();
      });
  }

  function addToCart(button) {
    if (!document.body.classList.contains('c-primeMix30VarA')) return;

    button.disabled = true;
    // Goes through window.fetch so c-prime-mix-30.js's /cart/add intercept
    // refreshes the gift progress bar too.
    fetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        items: [{ id: button.getAttribute('data-variant-id'), quantity: 1 }]
      })
    })
      .then(function (response) {
        if (!response.ok) return Promise.reject(response);
        window.igEvents = window.igEvents || [];
        window.igEvents.push({ event: 'mix30_recommended_add' });
        return refreshCartDrawer();
      })
      .catch(function () {})
      .finally(function () {
        button.disabled = false;
      });
  }

  function init() {
    document.querySelectorAll('[data-mix30-rec-atc]').forEach(function (button) {
      if (button.dataset.mix30RecInit) return;
      button.dataset.mix30RecInit = 'true';
      button.addEventListener('click', function () {
        addToCart(button);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
