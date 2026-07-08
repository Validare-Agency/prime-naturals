function initPrimeHp05() {
  document.querySelectorAll('.c-prime-hp-05').forEach(function (section) {
    const carousel = section.querySelector('.c-prime-hp-05__carousel');
    const viewport = section.querySelector('.c-prime-hp-05__viewport');
    const track = section.querySelector('.c-prime-hp-05__track');
    const dotsWrap = section.querySelector('.c-prime-hp-05__dots');
    const prevBtn = section.querySelector('.c-prime-hp-05__arrow--prev');
    const nextBtn = section.querySelector('.c-prime-hp-05__arrow--next');

    if (!viewport || !track) return;

    function setup() {
      const realCards = Array.prototype.slice.call(track.children);
      const total = realCards.length;
      if (!total) return;

      const dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

      const firstClone = realCards[0].cloneNode(true);
      const lastClone = realCards[total - 1].cloneNode(true);
      firstClone.setAttribute('aria-hidden', 'true');
      lastClone.setAttribute('aria-hidden', 'true');
      track.appendChild(firstClone);
      track.insertBefore(lastClone, track.firstChild);

      let index = 1; // slot 1 is the first real card once the clones are in place
      let snapTimer = null;

      function step() {
        const cards = track.children;
        return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
      }

      function setPosition(animate) {
        const cardWidth = track.children[index].getBoundingClientRect().width;
        const offset = (viewport.clientWidth - cardWidth) / 2;
        track.style.transition = animate ? 'transform 0.45s ease' : 'none';
        track.style.transform = 'translateX(' + (offset - index * step()) + 'px)';
      }

      function setActiveDot() {
        const realIndex = (index - 1 + total) % total;
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === realIndex);
        });
      }

      function goTo(newIndex, animate) {
        clearTimeout(snapTimer);
        index = Math.max(0, Math.min(total + 1, newIndex));
        setPosition(animate !== false);
        setActiveDot();

        if (animate !== false) {
          snapTimer = setTimeout(function () {
            if (index === 0) {
              goTo(total, false);
            } else if (index === total + 1) {
              goTo(1, false);
            }
          }, 460);
        }
      }

      if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { goTo(i + 1); });
      });

      let startX = null;
      viewport.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
      }, { passive: true });
      viewport.addEventListener('touchend', function (e) {
        if (startX === null) return;
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 40) {
          goTo(diff < 0 ? index + 1 : index - 1);
        }
        startX = null;
      });

      let resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { setPosition(false); }, 100);
      });

      setPosition(false);
      setActiveDot();
      if (carousel) carousel.classList.add('is-ready');

      if (nextBtn) nextBtn.click();
    }

    if (viewport.getBoundingClientRect().width > 0) {
      setup();
      return;
    }

    // The section stays display:none until the AB-test body class lands,
    // which happens async — wait for real layout before measuring anything.
    const observer = new ResizeObserver(function () {
      if (viewport.getBoundingClientRect().width > 0) {
        observer.disconnect();
        setup();
      }
    });
    observer.observe(viewport);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrimeHp05);
} else {
  initPrimeHp05();
}
