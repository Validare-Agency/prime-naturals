// Test: V_PRIME_PDP_24 | Product gallery Images
(function () {
  'use strict';

  // TODO: Replace placeholder URLs with actual Shopify CDN URLs after uploading the test images.
  // Store CDN path: https://cdn.shopify.com/s/files/1/0610/1463/8726/files/
  // Var A image: corrected true-size B5 hero (slot 3 replacement)
  var VAR_A_SLOT3_IMAGE = {
    src: 'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg',
    srcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=550 550w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=1100 1100w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=1445 1445w'
    ].join(', '),
    thumbSrcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=54 54w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=74 74w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=104 104w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=162 162w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=208 208w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-vara-true-size.jpg?width=416 416w'
    ].join(', '),
    alt: "Kid's Encyclopedia 10,000 Whys shown at true B5 size (17.6×25 cm) with grandma and grandchild reading together"
  };

  // Var B image: benefit-led hero (slot 1 replacement)
  // Includes: "Sparks Curiosity" headline, "Complete Hardcover Edition" callout, 3 key benefits
  var VAR_B_SLOT1_IMAGE = {
    src: 'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg',
    srcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=550 550w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=1100 1100w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=1445 1445w'
    ].join(', '),
    thumbSrcset: [
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=54 54w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=74 74w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=104 104w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=162 162w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=208 208w',
      'https://cdn.shopify.com/s/files/1/0610/1463/8726/files/c-pdp24-varb-benefit-hero.jpg?width=416 416w'
    ].join(', '),
    alt: 'Sparks Curiosity – Complete Hardcover Edition: rewires curiosity, boosts school performance, competes with screens'
  };

  var domReady = false;
  var igReady = false;
  var galleryEngaged = false;

  // Swap src/srcset/alt on the main gallery image and matching thumbnail for a given slot.
  // slotIndex is 0-based: slot 1 = 0, slot 3 = 2.
  function swapGallerySlot(slotIndex, imageData) {
    document.querySelectorAll('media-gallery').forEach(function (gallery) {
      // Main slider slides
      var slides = gallery.querySelectorAll('.product__media-list .product__media-item');
      var targetSlide = slides[slotIndex];
      if (targetSlide) {
        var img = targetSlide.querySelector('img.global-media-settings');
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

  function applyImageSwap() {
    if (document.body.classList.contains('c-primePdp24VarA')) {
      // Var A: replace slot 3 (0-indexed: 2) with the corrected true-size image
      swapGallerySlot(2, VAR_A_SLOT3_IMAGE);
    } else if (document.body.classList.contains('c-primePdp24VarB')) {
      // Var B: replace slot 1 (0-indexed: 0) with the benefit-led hero image
      swapGallerySlot(0, VAR_B_SLOT1_IMAGE);
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

  // Mirror the double-gate pattern used in c-intelligems-tests.js.
  // handleExperiments() in that file sets the body class; our ig:ready listener
  // fires after theirs (scripts load in DOM order), so the class is already
  // present by the time tryInit() runs here.
  function tryInit() {
    if (!domReady || !igReady) return;
    applyImageSwap();
    initGalleryEngagement();
  }

  document.addEventListener('DOMContentLoaded', function () {
    domReady = true;
    tryInit();
  });

  window.addEventListener('ig:ready', function () {
    igReady = true;
    tryInit();
  });
})();
