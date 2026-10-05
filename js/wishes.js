(function () {
  'use strict';

  var container = document.getElementById('wishes-carousel-container');
  var track     = document.getElementById('wishes-carousel');
  var prevBtn   = document.getElementById('wishes-prev');
  var nextBtn   = document.getElementById('wishes-next');
  var dotsWrap  = document.getElementById('wishes-dots');

  if (!container || !track) return;

  var cards = track.querySelectorAll('.wish-card');
  if (cards.length === 0) return;

  var currentIndex = 0;
  var autoSlideInterval = 3000; // 3 seconds
  var slideTimer = null;
  var isDragging = false;
  var startX = 0;
  var currentTranslate = 0;
  var prevTranslate = 0;

  // 1. Dynamically render indicator dots matching card count
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    for (var i = 0; i < cards.length; i++) {
      var dot = document.createElement('span');
      dot.className = 'wish-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('data-index', i);
      dotsWrap.appendChild(dot);
    }
  }
  var dots = dotsWrap ? dotsWrap.querySelectorAll('.wish-dot') : [];

  // 2. Position/Center calculation for active card
  function updateCarousel(transition) {
    if (transition === false) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    var containerWidth = container.offsetWidth;
    var activeCard = cards[currentIndex];
    var cardWidth = activeCard.offsetWidth;
    var cardOffset = activeCard.offsetLeft;

    // Calculate translate to center active card in the viewport container
    var translateVal = (containerWidth / 2) - (cardWidth / 2) - cardOffset;
    
    track.style.transform = 'translate3d(' + translateVal + 'px, 0, 0)';
    currentTranslate = translateVal;
    prevTranslate = translateVal;

    // Update active visual classes
    cards.forEach(function (card, index) {
      if (index === currentIndex) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    // Update dots status
    dots.forEach(function (dot, index) {
      if (index === currentIndex) {
        dot.classList.add('is-active');
      } else {
        dot.classList.remove('is-active');
      }
    });
  }

  // 3. Navigation utilities
  function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  // 4. Slide Timer (Auto Play) controls
  function startAutoSlide() {
    stopAutoSlide();
    slideTimer = setInterval(nextSlide, autoSlideInterval);
  }

  function stopAutoSlide() {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  }

  // Bind click listeners to navigation controls
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      nextSlide();
      startAutoSlide(); // reset timer
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      prevSlide();
      startAutoSlide(); // reset timer
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-index'), 10);
      goToSlide(idx);
      startAutoSlide(); // reset timer
    });
  });

  // Suspend auto slide when user hovers or targets container
  container.addEventListener('mouseenter', stopAutoSlide);
  container.addEventListener('mouseleave', startAutoSlide);

  // 5. Touch/Mouse Swipe dragging handlers
  function getPositionX(event) {
    return event.type.indexOf('touch') !== -1 ? event.touches[0].clientX : event.clientX;
  }

  function dragStart(event) {
    isDragging = true;
    startX = getPositionX(event);
    stopAutoSlide();
    track.style.transition = 'none';
    
    // Disable clicks during drags
    track.style.pointerEvents = 'none';
  }

  function dragMove(event) {
    if (!isDragging) return;
    
    var currentX = getPositionX(event);
    var diffX = currentX - startX;
    
    // Allow visual drag on the track
    var translateVal = prevTranslate + diffX;
    track.style.transform = 'translate3d(' + translateVal + 'px, 0, 0)';
    currentTranslate = translateVal;
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.pointerEvents = '';

    var dragDistance = currentTranslate - prevTranslate;

    // Threshold to trigger slide shift (50 pixels)
    if (dragDistance < -50) {
      // Swiped left -> next
      currentIndex = Math.min(currentIndex + 1, cards.length - 1);
    } else if (dragDistance > 50) {
      // Swiped right -> prev
      currentIndex = Math.max(currentIndex - 1, 0);
    }

    updateCarousel();
    startAutoSlide();
  }

  // Bind Drag/Swipe Events
  container.addEventListener('touchstart', dragStart, { passive: true });
  container.addEventListener('touchmove', dragMove, { passive: true });
  container.addEventListener('touchend', dragEnd);

  container.addEventListener('mousedown', dragStart);
  container.addEventListener('mousemove', dragMove);
  container.addEventListener('mouseup', dragEnd);
  container.addEventListener('mouseleave', dragEnd);

  // Prevent default image/drag actions inside container
  container.addEventListener('dragstart', function (e) { e.preventDefault(); });

  // 6. Recalculate positions on window resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      updateCarousel(false);
    }, 100);
  });

  // Initial draw and timer trigger
  // Wait slightly for layouts to settle
  setTimeout(function () {
    updateCarousel(false);
    startAutoSlide();
  }, 300);

})();
