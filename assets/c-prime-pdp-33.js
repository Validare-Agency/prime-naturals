// V_PRIME_PDP_33 | Teacher-Authority Image (PDP)
// Inserts a "Loved by Teachers" teacher-authority image at gallery slot 3 (Var A only).
// Slots 1 & 2 are unchanged; every existing slot 3+ shifts down by one.

(function () {
  'use strict';

  var done = false;

  function getImgUrl() {
    return (window.cPrimePdp33 && window.cPrimePdp33.teacherImg) || '';
  }

  // ── Build the main gallery slide <li> ──────────────────────────────────────
  function makeSlide(sectionId, imgUrl) {
    var li = document.createElement('li');
    li.className =
      'product__media-item grid__item slider__slide c-primePdp33-slide';
    li.setAttribute('data-media-id', sectionId + '-c33teacher');

    var container = document.createElement('div');
    container.className =
      'product-media-container media-type-image media-fit-contain global-media-settings gradient';
    container.style.cssText = '--ratio:1;--preview-ratio:1;';

    var opener = document.createElement('modal-opener');
    opener.className =
      'product__modal-opener product__modal-opener--image no-js-hidden';

    var mediaDiv = document.createElement('div');
    mediaDiv.className = 'product__media media media--transparent';

    var img = document.createElement('img');
    img.src = imgUrl;
    img.alt = 'Loved by Teachers — teacher holding the book';
    img.className = 'image-magnify-none';
    img.loading = 'lazy';
    img.width = 734;
    img.height = 733;
    img.setAttribute(
      'sizes',
      '(min-width: 990px) calc(55vw - 10rem), calc(100vw - 4rem)'
    );

    mediaDiv.appendChild(img);
    opener.appendChild(mediaDiv);
    container.appendChild(opener);
    li.appendChild(container);
    return li;
  }

  // ── Build the thumbnail <li> ───────────────────────────────────────────────
  function makeThumb(sectionId, imgUrl, position) {
    var li = document.createElement('li');
    li.id = 'Slide-Thumbnails-' + sectionId + '-c33teacher';
    li.className = 'thumbnail-list__item slider__slide c-primePdp33-thumb';
    li.setAttribute('data-target', sectionId + '-c33teacher');
    li.setAttribute('data-media-position', String(position));

    var thumbId = 'Thumbnail-' + sectionId + '-c33teacher';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'thumbnail global-media-settings global-media-settings--no-shadow';
    btn.setAttribute('aria-label', 'Load image ' + position + ' of product gallery');
    btn.setAttribute('aria-controls', 'GalleryViewer-' + sectionId);
    btn.setAttribute('aria-describedby', thumbId);

    var img = document.createElement('img');
    img.id = thumbId;
    img.src = imgUrl;
    img.alt = 'Loved by Teachers';
    img.loading = 'lazy';
    img.width = 74;
    img.height = 74;

    btn.appendChild(img);
    li.appendChild(btn);
    return li;
  }

  // ── Build a mobile dot <button> ────────────────────────────────────────────
  function makeDot(sectionId) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'slider-counter__link slider-counter__link--dots link c-primePdp33-dot';
    btn.setAttribute('aria-label', 'Go to slide 3');
    btn.setAttribute('aria-controls', 'Slider-' + sectionId);

    var span = document.createElement('span');
    span.className = 'dot';
    btn.appendChild(span);
    return btn;
  }

  // ── Main insertion routine ─────────────────────────────────────────────────
  function insertSlide() {
    if (done) return;
    if (!document.body.classList.contains('c-primePdp33VarA')) return;

    var imgUrl = getImgUrl();
    if (!imgUrl) return;

    // Target the primary (non-duplicate) GalleryViewer
    var galleryViewer = document.querySelector(
      '[id^="GalleryViewer-"]:not([id$="-duplicate"])'
    );
    if (!galleryViewer) return;

    var sectionId = galleryViewer.id.replace('GalleryViewer-', '');
    var sliderList = document.getElementById('Slider-Gallery-' + sectionId);
    if (!sliderList) return;

    var slides = Array.prototype.slice.call(
      sliderList.querySelectorAll(':scope > li.slider__slide')
    );
    // Need at least 2 existing slides before we can insert at position 3
    if (slides.length < 2) return;

    done = true;

    // ── Insert main slide after 2nd existing slide ─────────────────────────
    sliderList.insertBefore(makeSlide(sectionId, imgUrl), slides[1].nextSibling);

    // ── Insert thumbnail after 2nd existing thumbnail ──────────────────────
    var thumbList = document.getElementById('Slider-Thumbnails-' + sectionId);
    if (thumbList) {
      var thumbItems = Array.prototype.slice.call(
        thumbList.querySelectorAll(':scope > li.slider__slide')
      );
      var afterThumb = thumbItems.length >= 2 ? thumbItems[1].nextSibling : null;
      thumbList.insertBefore(makeThumb(sectionId, imgUrl, 3), afterThumb);
    }

    // ── Insert mobile dot after 2nd existing dot ───────────────────────────
    var dotsContainer = galleryViewer.querySelector('.slider__dots');
    if (dotsContainer) {
      var dots = Array.prototype.slice.call(
        dotsContainer.querySelectorAll('.slider-counter__link')
      );
      var afterDot = dots.length >= 2 ? dots[1].nextSibling : null;
      dotsContainer.insertBefore(makeDot(sectionId), afterDot);
    }

    // Update numeric counter total if the theme uses numeric pagination
    var totalEl = galleryViewer.querySelector('.slider-counter--total');
    if (totalEl) {
      totalEl.textContent = String(
        parseInt(totalEl.textContent || '0', 10) + 1
      );
    }

    // Notify slider-component that its children changed (Dawn-style API)
    var sliderComponent = document.getElementById('GalleryViewer-' + sectionId);
    if (sliderComponent && typeof sliderComponent.resetPages === 'function') {
      sliderComponent.resetPages();
    }
  }

  // ── Timing: react the moment Intelligems applies the body class ────────────
  function watchForClass() {
    if (document.body.classList.contains('c-primePdp33VarA')) {
      insertSlide();
      return;
    }
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (
          mutations[i].attributeName === 'class' &&
          document.body.classList.contains('c-primePdp33VarA')
        ) {
          observer.disconnect();
          insertSlide();
          return;
        }
      }
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchForClass);
  } else {
    watchForClass();
  }
})();
