// Pre-order PDP — "add both volumes" buttons ([data-c-pre-add-both]).
// Used by sections/c-preorder-compare.liquid and sections/c-preorder-set.liquid.
(function () {
  function init(button) {
    if (button.dataset.cPreAddBothInit) return;
    button.dataset.cPreAddBothInit = 'true';
    button.addEventListener('click', function () {
      // Pre-order properties are only rendered while pre-order is on
      // (product metafield custom.preorder_enabled), so none are sent after.
      var properties = {};
      if (button.dataset.propertyName && button.dataset.propertyValue) {
        properties._preorder = button.dataset.propertyValue;
        properties[button.dataset.propertyName] = button.dataset.propertyValue;
      }
      var items = [
        { id: button.dataset.variantA, quantity: 1 },
        { id: button.dataset.variantB, quantity: 1, properties: properties }
      ];
      button.disabled = true;
      fetch(window.routes.cart_add_url + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: items })
      })
        .then(function (response) {
          if (!response.ok) return Promise.reject(response);
          return Promise.all([
            fetch(window.routes.cart_url + '?section_id=cart-drawer').then(function (r) { return r.text(); }),
            fetch(window.routes.cart_url + '?section_id=cart-icon-bubble').then(function (r) { return r.text(); })
          ]);
        })
        .then(function (html) {
          var parser = new DOMParser();
          var freshDrawer = parser.parseFromString(html[0], 'text/html').querySelector('cart-drawer');
          var liveDrawer = document.querySelector('cart-drawer');
          if (freshDrawer && liveDrawer) {
            liveDrawer.replaceWith(freshDrawer);
            freshDrawer.classList.add('active');
          } else {
            window.location.href = window.routes.cart_url;
            return;
          }
          var freshBubble = parser.parseFromString(html[1], 'text/html').querySelector('.shopify-section');
          var liveBubble = document.getElementById('cart-icon-bubble');
          if (freshBubble && liveBubble) liveBubble.innerHTML = freshBubble.innerHTML;
        })
        .catch(function () {})
        .finally(function () {
          button.disabled = false;
        });
    });
  }
  function run() {
    document.querySelectorAll('[data-c-pre-add-both]').forEach(init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('shopify:section:load', run);
})();
