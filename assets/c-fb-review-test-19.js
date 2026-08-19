(function () {
  const TARGET_POSITION = 3;
  const SUFFIX = '-c-fb-review-test-19';

  let initialized = false;

  function getNewImageUrl() {
    const scriptEl = document.getElementById('c-fb-review-test-19-script');
    return scriptEl && scriptEl.getAttribute('data-image');
  }

  function pointImageAt(img, newSrc) {
    if (!img) return;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = newSrc;
    img.alt = '';
  }

  function renameDuplicateIds(root) {
    // Some of the theme's own ids (e.g. thumbnail_id in product-media-gallery.liquid)
    // render with stray leading/trailing whitespace from the Liquid capture block, so
    // comparisons are done in JS instead of building a selector out of the raw value —
    // an embedded newline in a CSS attribute-selector string throws a SyntaxError.
    root.querySelectorAll('[id]').forEach(function (el) {
      const oldId = el.id.trim();
      const newId = oldId + SUFFIX;
      el.id = newId;
      root.querySelectorAll('[aria-describedby]').forEach(function (described) {
        if (described.getAttribute('aria-describedby').trim() === oldId) {
          described.setAttribute('aria-describedby', newId);
        }
      });
    });
  }

  function buildInsertedSlide(referenceSlide, newSrc) {
    const clone = referenceSlide.cloneNode(true);
    clone.id = referenceSlide.id + SUFFIX;
    clone.setAttribute('data-media-id', referenceSlide.getAttribute('data-media-id') + SUFFIX);
    clone.removeAttribute('data-alt');
    renameDuplicateIds(clone);
    pointImageAt(clone.querySelector('.product__media img'), newSrc);
    return clone;
  }

  function buildInsertedThumbnail(referenceThumbnail, newSlideMediaId, newSrc, gallery) {
    const clone = referenceThumbnail.cloneNode(true);
    if (clone.id) clone.id = clone.id + SUFFIX;
    clone.setAttribute('data-target', newSlideMediaId);
    renameDuplicateIds(clone);
    pointImageAt(clone.querySelector('.thumbnail img'), newSrc);

    // cloneNode doesn't copy event listeners, and media-gallery.js only wires up
    // thumbnail clicks once at page load — so this clone needs its own handler,
    // calling the gallery's own activation method to stay consistent with how
    // every other thumbnail switches the main slide.
    const button = clone.querySelector('button');
    if (button && gallery && typeof gallery.setActiveMedia === 'function') {
      button.addEventListener('click', function () {
        gallery.setActiveMedia(newSlideMediaId, false);
      });
    }
    return clone;
  }

  function insertThirdImage() {
    const newSrc = getNewImageUrl();
    if (!newSrc) return;

    document.querySelectorAll('ul[id^="Slider-Gallery-"]').forEach(function (list) {
      const items = list.querySelectorAll(':scope > li.product__media-item');
      const reference = items[TARGET_POSITION - 1];
      if (!reference) return;

      const insertedSlide = buildInsertedSlide(reference, newSrc);
      reference.before(insertedSlide);

      const gallery = list.closest('media-gallery');
      const referenceMediaId = reference.getAttribute('data-media-id');
      const referenceThumbnail = gallery && gallery.querySelector('li[data-target="' + referenceMediaId + '"]');
      if (referenceThumbnail) {
        const insertedThumbnail = buildInsertedThumbnail(
          referenceThumbnail,
          insertedSlide.getAttribute('data-media-id'),
          newSrc,
          gallery
        );
        referenceThumbnail.before(insertedThumbnail);
      }

      // Both the main viewer and the thumbnail rail are slider-component instances that
      // cache their slide list once at construction for scroll-position math. Inserting a
      // slide/thumbnail after that leaves them with a stale count, which drifts the active
      // index by one on swipe and can index past the end of the cached array. resetPages()
      // is the theme's own re-sync method (it does the same thing after prepending a
      // variant image in media-gallery.js).
      if (gallery && gallery.elements) {
        [gallery.elements.viewer, gallery.elements.thumbnails].forEach(function (slider) {
          if (slider && typeof slider.resetPages === 'function') slider.resetPages();
        });
      }
    });
  }

  function tryInit() {
    if (initialized) return;
    if (!document.body.classList.contains('c-primePdp19VarA')) return;
    initialized = true;
    observer.disconnect();
    insertThirdImage();
  }

  const observer = new MutationObserver(function () { tryInit(); });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('DOMContentLoaded', tryInit);
  window.addEventListener('ig:ready', tryInit);
})();
