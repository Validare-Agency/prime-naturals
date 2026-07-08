// Test: V_PRIME_PDP_10 | Gallery Images Optimization
(function () {
  var path = window.location.pathname;
  var isMurphysLaw = path.indexOf('/products/murphys-law-for-kids-copy') !== -1;
  var isEncyclopedia = path.indexOf('/products/kidss-encyclopedia-10-000-whys') !== -1;
  if (!isMurphysLaw && !isEncyclopedia) return;

  var initialized = false;

  function swapImage(img, url) {
    if (!img || !url) return;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = url;
  }

  function setSquareRatio(slide) {
    var container = slide.querySelector('.product-media-container');
    if (!container) return;
    container.style.setProperty('--ratio', '1');
    container.style.setProperty('--preview-ratio', '1');
  }

  function getGallery() {
    return document.querySelector('media-gallery:not([id*="duplicate"])');
  }

  function getModalImg(slide) {
    var dataMediaId = slide.getAttribute('data-media-id') || '';
    var match = dataMediaId.match(/-(\d+)$/);
    if (!match) return null;
    return document.querySelector('.product-media-modal img[data-media-id="' + match[1] + '"]');
  }

  function swapSlideAt(gallery, position, url) {
    var slide = gallery.querySelectorAll('.product__media-item')[position - 1];
    if (!slide) return;

    swapImage(slide.querySelector('img'), url);
    setSquareRatio(slide);

    var dataMediaId = slide.getAttribute('data-media-id') || '';
    var thumb = gallery.querySelector('[data-target="' + dataMediaId + '"]');
    if (thumb) swapImage(thumb.querySelector('img'), url);

    swapImage(getModalImg(slide), url);
  }

  // Inserts a brand new slide (no corresponding product.media entry) right after
  // an existing slide, mirroring its markup so the theme's own slider-component
  // and media-gallery JS (setActiveMedia/resetPages) pick it up correctly.
  function insertSlideAfter(gallery, position, url) {
    var slides = gallery.querySelectorAll('.product__media-item');
    var refSlide = slides[position - 1];
    if (!refSlide) return;

    var uniqueId = 'cprimepdp10new';

    var newSlide = refSlide.cloneNode(true);
    newSlide.id = refSlide.id + '-' + uniqueId;
    newSlide.setAttribute('data-media-id', uniqueId);
    newSlide.classList.remove('is-active');
    swapImage(newSlide.querySelector('img'), url);
    setSquareRatio(newSlide);
    refSlide.insertAdjacentElement('afterend', newSlide);

    var refThumb = gallery.querySelector('[data-target="' + refSlide.getAttribute('data-media-id') + '"]');
    if (refThumb) {
      var newThumb = refThumb.cloneNode(true);
      newThumb.removeAttribute('id');
      newThumb.setAttribute('data-target', uniqueId);
      newThumb.querySelectorAll('[id]').forEach(function (el) {
        el.removeAttribute('id');
      });
      swapImage(newThumb.querySelector('img'), url);

      var thumbButton = newThumb.querySelector('button');
      if (thumbButton) {
        thumbButton.removeAttribute('aria-current');
        thumbButton.addEventListener('click', gallery.setActiveMedia.bind(gallery, uniqueId, false));
      }
      refThumb.insertAdjacentElement('afterend', newThumb);
    }

    var dot = gallery.querySelector('.slider__dots .slider-counter__link--dots');
    if (dot) {
      var newDot = dot.cloneNode(true);
      newDot.classList.remove('slider-counter__link--active');
      newDot.removeAttribute('aria-current');
      dot.parentElement.appendChild(newDot);
    }

    if (gallery.elements && gallery.elements.viewer && gallery.elements.viewer.resetPages) {
      gallery.elements.viewer.resetPages();
    }
  }

  function applyMurphysLawSwap(gallery) {
    swapSlideAt(gallery, 5, window.cPrimePdp10Image);
  }

  function applyEncyclopediaSwap(gallery, variant) {
    var firstImage = variant === 'B' ? window.cPrimePdp10Gallery1VarB : window.cPrimePdp10Gallery1;
    swapSlideAt(gallery, 1, firstImage);
    swapSlideAt(gallery, 2, window.cPrimePdp10Gallery3);
    swapSlideAt(gallery, 4, window.cPrimePdp10Gallery4);
    swapSlideAt(gallery, 5, window.cPrimePdp10Gallery5);
    insertSlideAfter(gallery, 1, window.cPrimePdp10Gallery2);
  }

  function tryInit() {
    if (initialized) return;

    var variant = document.body.classList.contains('c-primePdp10VarA')
      ? 'A'
      : document.body.classList.contains('c-primePdp10VarB')
        ? 'B'
        : null;
    if (!variant) return;

    var gallery = getGallery();
    if (!gallery) return;

    initialized = true;
    observer.disconnect();

    if (isMurphysLaw) {
      applyMurphysLawSwap(gallery);
    } else {
      applyEncyclopediaSwap(gallery, variant);
    }
  }

  var observer = new MutationObserver(tryInit);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('DOMContentLoaded', tryInit);
  window.addEventListener('ig:ready', tryInit);
})();
