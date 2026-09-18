// V_PRIME_PDP_27 | Physical-Size Information - "Exactly What Arrives"
(function () {
  function initPdp27() {
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
