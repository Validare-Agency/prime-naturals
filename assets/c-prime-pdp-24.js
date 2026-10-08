// Test: V_PRIME_PDP_24 | Product gallery Images
(function () {
  'use strict';

  // Store CDN path: https://cdn.shopify.com/s/files/1/0610/1463/8726/files/
  // Var A image: corrected true-size B5 hero (slot 3 replacement)
  var VAR_A_SLOT3_IMAGE = {
    src: 'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp',
    srcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=550 550w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=1100 1100w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=1445 1445w'
    ].join(', '),
    thumbSrcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=54 54w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=74 74w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=104 104w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=162 162w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=208 208w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376.webp?width=416 416w'
    ].join(', '),
    alt: "Read it together – grandma and grandchild reading Kid's Encyclopedia 10000 Whys by the fireplace, the book kids choose over YouTube"
  };

  // Var B image: benefit-led hero (slot 1 replacement)
  // Includes: "Sparks Curiosity" headline, "Complete Hardcover Edition" callout, 3 key benefits
  var VAR_B_SLOT1_IMAGE = {
    src: 'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp',
    srcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=550 550w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=1100 1100w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=1445 1445w'
    ].join(', '),
    thumbSrcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=54 54w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=74 74w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=104 104w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=162 162w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=208 208w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_1.webp?width=416 416w'
    ].join(', '),
    alt: 'Sparks Curiosity – Complete Hardcover Edition: rewires curiosity, boosts school performance, competes with screens'
  };

  // Var C image: social-proof hero (new slide inserted at slot 3, existing slot 3 onward shifts right)
  // Includes: 4.9 star rating, 30-Day Guarantee badge, "Trusted by 18,000+ families" bar
  var VAR_C_SLOT3_IMAGE = {
    src: 'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp',
    srcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=550 550w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=1100 1100w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=1445 1445w'
    ].join(', '),
    thumbSrcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=54 54w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=74 74w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=104 104w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=162 162w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=208 208w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/Frame_1948756376_2.webp?width=416 416w'
    ].join(', '),
    alt: 'Spark Curiosity – 10000 Whys Complete Hardcover Edition, rated 4.9 stars, 30-day guarantee, trusted by 18,000+ families'
  };

  var VAR_C_MEDIA_KEY = 'pdp24-varc';

  // The gallery <img> sits in .product__media inside the modal-opener; the
  // .global-media-settings class is on the wrapper div, not the img itself.
  var MAIN_IMG_SELECTOR = '.product__modal-opener .product__media img';
  var VARIANT_CLASSES = ['c-primePdp24VarA', 'c-primePdp24VarB', 'c-primePdp24VarC'];
  var swapApplied = false;
  var galleryEngaged = false;

  // Swap src/srcset/alt on the main gallery image and matching thumbnail for a given slot.
  // slotIndex is 0-based: slot 1 = 0, slot 3 = 2.
  function swapGallerySlot(slotIndex, imageData) {
    document.querySelectorAll('media-gallery').forEach(function (gallery) {
      // Main slider slides
      var slides = gallery.querySelectorAll('.product__media-list .product__media-item');
      var targetSlide = slides[slotIndex];
      if (targetSlide) {
        var img = targetSlide.querySelector(MAIN_IMG_SELECTOR);
        if (img) {
          img.src = imageData.src;
          img.srcset = imageData.srcset;
          img.alt = imageData.alt;
          // Ensure the image isn't stuck in a lazy-loading pending state
          img.removeAttribute('loading');
        }
      }

      // Thumbnail strip
      var thumbItems = gallery.querySelectorAll('.thumbnail-list .thumbnail-list__item');
      var targetThumb = thumbItems[slotIndex];
      if (targetThumb) {
        var thumbImg = targetThumb.querySelector('img');
        if (thumbImg) {
          thumbImg.src = imageData.src;
          thumbImg.srcset = imageData.thumbSrcset;
          thumbImg.alt = imageData.alt;
        }
      }
    });
  }

  // Insert a brand-new slide (main slider + thumbnail + mobile dot) before slotIndex.
  // Clones the existing slide at that slot so markup/classes match the theme, then
  // re-syncs the theme's slider-component so arrows, dots and counters include it.
  function insertGallerySlot(slotIndex, imageData) {
    document.querySelectorAll('media-gallery').forEach(function (gallery) {
      if (gallery.querySelector('[data-c-pdp24-inserted]')) return;

      var viewer = gallery.querySelector('[id^="GalleryViewer"]');
      var slides = gallery.querySelectorAll('.product__media-list .product__media-item');
      var refSlide = slides[slotIndex];
      if (!viewer || !refSlide) return;

      var mediaId = gallery.dataset.section + '-' + VAR_C_MEDIA_KEY;

      // Main slider slide
      var newSlide = refSlide.cloneNode(true);
      newSlide.id = 'Slide-' + mediaId;
      newSlide.dataset.mediaId = mediaId;
      newSlide.dataset.alt = 'always_display';
      newSlide.setAttribute('data-c-pdp24-inserted', '');
      newSlide.classList.remove('is-active', 'hidden');
      // The zoom/modal opener points at the cloned media's id, so drop it rather than
      // open the wrong image in the product modal.
      newSlide.querySelectorAll('.product__media-toggle, .product__media-icon').forEach(function (el) {
        el.remove();
      });
      var img = newSlide.querySelector(MAIN_IMG_SELECTOR);
      if (img) {
        img.src = imageData.src;
        img.srcset = imageData.srcset;
        img.alt = imageData.alt;
        img.removeAttribute('loading');
        img.removeAttribute('id');
      }
      var container = newSlide.querySelector('.product-media-container');
      if (container) {
        // Same 1:1 ratio as the uploaded image, so it never inherits the cloned slide's ratio
        container.style.setProperty('--ratio', '1');
        container.style.setProperty('--preview-ratio', '1');
      }
      refSlide.parentElement.insertBefore(newSlide, refSlide);

      // Thumbnail strip
      var thumbItems = gallery.querySelectorAll('.thumbnail-list .thumbnail-list__item');
      var refThumb = thumbItems[slotIndex];
      if (refThumb) {
        var newThumb = refThumb.cloneNode(true);
        newThumb.id = 'Slide-Thumbnails-' + mediaId;
        newThumb.dataset.target = mediaId;
        newThumb.dataset.alt = 'always_display';
        newThumb.classList.remove('hidden');
        var badge = newThumb.querySelector('.thumbnail__badge');
        if (badge) badge.remove();
        var thumbButton = newThumb.querySelector('button');
        if (thumbButton) {
          thumbButton.removeAttribute('aria-current');
          thumbButton.removeAttribute('aria-describedby');
          // Cloned nodes don't carry listeners, so wire the click the way MediaGallery does
          thumbButton.addEventListener('click', function () {
            gallery.setActiveMedia(mediaId, false);
          });
        }
        var thumbImg = newThumb.querySelector('img');
        if (thumbImg) {
          thumbImg.src = imageData.src;
          thumbImg.srcset = imageData.thumbSrcset;
          thumbImg.alt = imageData.alt;
          thumbImg.removeAttribute('id');
        }
        refThumb.parentElement.insertBefore(newThumb, refThumb);

        gallery.querySelectorAll('.thumbnail-list .thumbnail-list__item').forEach(function (item, i) {
          item.dataset.mediaPosition = i + 1;
        });
      }

      // Mobile pagination dots (only rendered when pagination isn't numeric)
      var dots = viewer.querySelectorAll('.slider-counter__link');
      if (dots.length) {
        var newDot = dots[0].cloneNode(true);
        newDot.classList.remove('slider-counter__link--active', 'hidden');
        newDot.removeAttribute('aria-current');
        newDot.dataset.alt = 'always_display';
        newDot.addEventListener('click', viewer.linkToSlide.bind(viewer));
        var refDot = dots[slotIndex];
        if (refDot) {
          refDot.parentElement.insertBefore(newDot, refDot);
        } else {
          dots[dots.length - 1].parentElement.appendChild(newDot);
        }
        viewer.sliderControlLinksArray = Array.from(viewer.querySelectorAll('.slider-counter__link'));
      }

      // Re-sync both theme sliders with the new slide count
      if (typeof viewer.resetPages === 'function') viewer.resetPages();
      var thumbnails = gallery.querySelector('[id^="GalleryThumbnails"]');
      if (thumbnails && typeof thumbnails.resetPages === 'function') thumbnails.resetPages();
    });
  }

  function applyImageSwap() {
    if (document.body.classList.contains('c-primePdp24VarA')) {
      // Var A: replace slot 3 (0-indexed: 2) with the corrected true-size image
      swapGallerySlot(2, VAR_A_SLOT3_IMAGE);
    } else if (document.body.classList.contains('c-primePdp24VarB')) {
      // Var B: replace slot 1 (0-indexed: 0) with the benefit-led hero image
      swapGallerySlot(0, VAR_B_SLOT1_IMAGE);
    } else if (document.body.classList.contains('c-primePdp24VarC')) {
      // Var C: insert the social-proof hero as a new slide at slot 3 (0-indexed: 2);
      // existing slot 3 onward shifts one place right
      insertGallerySlot(2, VAR_C_SLOT3_IMAGE);
    }
  }

  // engagement_gallery — fires once on first gallery interaction (all variants including Control)
  function initGalleryEngagement() {
    document.querySelectorAll('media-gallery').forEach(function (gallery) {
      gallery.addEventListener('click', fireGalleryEngagement);
      gallery.addEventListener('touchstart', fireGalleryEngagement, { passive: true });
    });
  }

  function fireGalleryEngagement() {
    if (galleryEngaged) return;
    galleryEngaged = true;
    window.igEvents = window.igEvents || [];
    window.igEvents.push({ event: 'engagement_gallery' });
  }

  function hasVariantClass() {
    return VARIANT_CLASSES.some(function (cls) {
      return document.body.classList.contains(cls);
    });
  }

  function trySwap() {
    if (swapApplied || !hasVariantClass()) return false;
    swapApplied = true;
    applyImageSwap();
    return true;
  }

  // The variant body class is set by handleExperiments() in c-intelligems-tests.js once
  // both DOM and ig:ready are in. ig:ready can fire before this deferred script runs, so
  // instead of listening for it, check for the class now and watch body for it to appear.
  function init() {
    initGalleryEngagement();
    if (trySwap()) return;
    var observer = new MutationObserver(function () {
      if (trySwap()) observer.disconnect();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
