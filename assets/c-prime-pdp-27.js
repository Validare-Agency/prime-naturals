// V_PRIME_PDP_27 | Physical-Size Information - "Exactly What Arrives"
(function () {
  function repositionPdp27() {
    var pdp27 = document.querySelector('.c-pdp27');
    if (!pdp27) return;

    var isBelowAtc =
      document.body.classList.contains('c-primePdp27VarD') ||
      document.body.classList.contains('c-primePdp27VarE') ||
      document.body.classList.contains('c-primePdp27VarF');

    if (isBelowAtc) {
      var atcAnchor = document.querySelector('.pib-trust');
      if (atcAnchor && atcAnchor.parentNode) {
        atcAnchor.parentNode.insertBefore(pdp27, atcAnchor.nextSibling);
      }
      return;
    }

    var pibBullets = document.querySelector('.pib-bullets');
    if (pibBullets && pibBullets.parentNode) {
      pibBullets.parentNode.insertBefore(pdp27, pibBullets);
    }
  }

  function mirrorPibBullets() {
    // Var B/C's Description-accordion markup (and its mirror slot) is always
    // in the DOM, just CSS-hidden for other variants — so only actually
    // mirror/hide the real bullets when B or C is the active variant.
    var isAccordionVariant =
      document.body.classList.contains('c-primePdp27VarB') ||
      document.body.classList.contains('c-primePdp27VarC');
    if (!isAccordionVariant) return;

    var source = document.querySelector('.pib-bullets');
    var targets = document.querySelectorAll('[data-mirror-target="pib-bullets"]');
    if (!source || !targets.length) return;

    targets.forEach(function (slot) {
      slot.innerHTML = '';
      slot.appendChild(source.cloneNode(true));
    });

    source.style.display = 'none';
  }

  function initPdp27() {
    repositionPdp27();
    mirrorPibBullets();

    // The Intelligems test-group body class can land after this script runs
    // (it waits on an async "ig:ready" event), so re-run whenever body's
    // class list changes instead of assuming it's already set.
    var bodyClassObserver = new MutationObserver(function () {
      repositionPdp27();
      mirrorPibBullets();
    });
    bodyClassObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    var buttons = document.querySelectorAll('.c-pdp27__accordion-btn');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isExpanded = this.getAttribute('aria-expanded') === 'true';
        var body = this.closest('.c-pdp27__accordion').querySelector('.c-pdp27__accordion-body');
        var eventName = isExpanded
          ? this.getAttribute('data-event-close')
          : this.getAttribute('data-event-open');

        this.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        if (body) {
          if (isExpanded) {
            body.hidden = true;
          } else {
            body.hidden = false;
          }
        }

        if (eventName) {
          window.igEvents = window.igEvents || [];
          window.igEvents.push({ event: eventName });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPdp27);
  } else {
    initPdp27();
  }
})();
