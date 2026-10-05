/* Gallery lightbox with navigation arrows */
(function () {
  'use strict';

  var items     = Array.from(document.querySelectorAll('.gallery__item'));
  var lightbox  = document.getElementById('lightbox');
  if (!items.length || !lightbox) return;

  var imgEl      = document.getElementById('lightbox-img');
  var closeBtn   = document.getElementById('lightbox-close');
  var prevBtn    = document.getElementById('lightbox-prev');
  var nextBtn    = document.getElementById('lightbox-next');
  var current    = 0;
  var lastFocused = null;

  function getSrc(item) {
    var img = item.querySelector('img');
    return img ? { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' } : null;
  }

  function show(index) {
    var data = getSrc(items[index]);
    if (!data) return;
    current = index;
    imgEl.src = data.src;
    imgEl.alt = data.alt;

    /* Update nav button visibility */
    prevBtn.style.opacity = index === 0 ? '0.3' : '1';
    nextBtn.style.opacity = index === items.length - 1 ? '0.3' : '1';
  }

  function open(index) {
    lastFocused = document.activeElement;
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    show(index);
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function navigate(dir) {
    var next = current + dir;
    if (next >= 0 && next < items.length) show(next);
  }

  /* Bind gallery items */
  items.forEach(function (item, idx) {
    item.addEventListener('click', function () { open(idx); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(idx);
      }
    });
  });

  /* Controls */
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { navigate(-1); });
  nextBtn.addEventListener('click', function () { navigate(1); });

  /* Click outside image closes */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  /* Keyboard nav */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-active')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   navigate(-1);
    if (e.key === 'ArrowRight')  navigate(1);
  });

  /* Touch swipe */
  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
