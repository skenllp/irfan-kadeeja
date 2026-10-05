/* Floating music control — plays only after a user gesture (browser autoplay policy) */
(function () {
  var toggle = document.querySelector('.music-toggle');
  var audio = document.getElementById('bg-music');
  if (!toggle || !audio) return;

  var hasStarted = false;

  function updateIcon(playing) {
    toggle.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  }

  function play() {
    audio.play().then(function () {
      updateIcon(true);
    }).catch(function () {
      // Autoplay blocked or file missing — fail silently, keep icon paused.
      updateIcon(false);
    });
  }

  toggle.addEventListener('click', function () {
    if (audio.paused) {
      play();
      hasStarted = true;
    } else {
      audio.pause();
      updateIcon(false);
    }
  });

  // Attempt a soft-start on the very first interaction anywhere on the page,
  // as requested ("autoplay after user interaction"). Respects browser policy.
  function firstInteraction() {
    if (!hasStarted) {
      hasStarted = true;
      play();
    }
    document.removeEventListener('click', firstInteraction);
    document.removeEventListener('touchstart', firstInteraction);
  }
  document.addEventListener('click', firstInteraction, { once: true });
  document.addEventListener('touchstart', firstInteraction, { once: true });
})();
