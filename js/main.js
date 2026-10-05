(function () {
  'use strict';

  /* =====================================================================
     1. Loader — minimum display time + font readiness
  ===================================================================== */
  var loader   = document.getElementById('loader');
  var START_MS = Date.now();
  var MIN_MS   = 1600;

  function hideLoader() {
    var wait = Math.max(0, MIN_MS - (Date.now() - START_MS));
    setTimeout(function () {
      if (loader) loader.classList.add('is-hidden');
    }, wait);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(hideLoader).catch(hideLoader);
  } else {
    window.addEventListener('load', hideLoader);
  }
  setTimeout(hideLoader, 4000); /* safety net */

  /* =====================================================================
     2. Opening gate — "Open Invitation" button
  ===================================================================== */
  var gate    = document.getElementById('gate');
  var openBtn = document.getElementById('open-invitation-btn');

  if (gate && openBtn) {
    document.body.style.overflow = 'hidden';

    openBtn.addEventListener('click', function () {
      gate.classList.add('is-open');

      setTimeout(function () {
        document.body.style.overflow = '';
        document.body.classList.add('page-entering');
        document.dispatchEvent(new CustomEvent('invitation:opened'));
      }, 600);
    });
  }

  /* =====================================================================
     3. Nav — reveal after scrolling past hero
  ===================================================================== */
  var nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 280) {
        nav.classList.add('is-visible');
      } else {
        nav.classList.remove('is-visible');
      }
    }, { passive: true });

    /* Highlight active section in nav */
    var sections = document.querySelectorAll('section[id], header[id]');
    var navLinks = nav.querySelectorAll('a[href^="#"]');

    window.addEventListener('scroll', function () {
      var scrollMid = window.scrollY + window.innerHeight / 2;
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollMid && section.offsetTop + section.offsetHeight > scrollMid) {
          navLinks.forEach(function (link) {
            link.classList.remove('is-active');
            if (link.getAttribute('href') === '#' + section.id) {
              link.classList.add('is-active');
            }
          });
        }
      });
    }, { passive: true });
  }

  /* =====================================================================
     4. Scroll reveal via IntersectionObserver
  ===================================================================== */
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* =====================================================================
     5. Cursor glow + magnetic buttons (desktop / pointer: fine only)
  ===================================================================== */
  var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (supportsHover) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    var glowX = 0, glowY = 0, curX = 0, curY = 0;

    window.addEventListener('mousemove', function (e) {
      glowX = e.clientX;
      glowY = e.clientY;
      glow.style.opacity = '1';
    });

    (function raf() {
      curX += (glowX - curX) * 0.1;
      curY += (glowY - curY) * 0.1;
      glow.style.left = curX + 'px';
      glow.style.top  = curY + 'px';
      requestAnimationFrame(raf);
    })();

    /* Magnetic buttons */
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width  / 2) * 0.18;
        var y = (e.clientY - rect.top  - rect.height / 2) * 0.28;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* =====================================================================
     6. Button ripple effect
  ===================================================================== */
  document.querySelectorAll('.btn--ripple').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var rect   = btn.getBoundingClientRect();
      var size   = Math.max(rect.width, rect.height) * 1.4;
      var ripple = document.createElement('span');
      ripple.className  = 'ripple';
      ripple.style.width  = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left   = (e.clientX - rect.left  - size / 2) + 'px';
      ripple.style.top    = (e.clientY - rect.top   - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  });

  /* =====================================================================
     7. Parallax on hero florals
  ===================================================================== */
  var florals = document.querySelectorAll('.hero__floral');
  if (florals.length && supportsHover) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      florals.forEach(function (f, i) {
        var speed = 0.04 + i * 0.015;
        var drift = y * speed;
        /* Don't fight the float keyframe — add translateY on top via cssText hack */
        f.style.marginTop = drift + 'px';
      });
    }, { passive: true });
  }

  /* =====================================================================
     8. Per-letter text reveal for hero names
  ===================================================================== */
  document.querySelectorAll('.text-reveal').forEach(function (el) {
    var original = el.innerHTML;
    var frag = document.createDocumentFragment();
    var chars = [];

    /* Parse preserving HTML entities (amp, etc.) */
    var tmp = document.createElement('div');
    tmp.innerHTML = original;

    function wrapTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent;
        var words = text.split(/(\s+)/);
        words.forEach(function (part) {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
          } else {
            var wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';
            for (var i = 0; i < part.length; i++) {
              var span = document.createElement('span');
              span.textContent = part[i];
              chars.push(span);
              wordSpan.appendChild(span);
            }
            frag.appendChild(wordSpan);
          }
        });
      } else {
        var clone = node.cloneNode(false);
        node.childNodes.forEach(function (child) {
          if (child.nodeType === Node.TEXT_NODE) {
            var text = child.textContent;
            var words = text.split(/(\s+)/);
            words.forEach(function (part) {
              if (/^\s+$/.test(part)) {
                clone.appendChild(document.createTextNode(' '));
              } else {
                var wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap';
                for (var i = 0; i < part.length; i++) {
                  var span = document.createElement('span');
                  span.textContent = part[i];
                  chars.push(span);
                  wordSpan.appendChild(span);
                }
                clone.appendChild(wordSpan);
              }
            });
          } else {
            clone.appendChild(child.cloneNode(true));
          }
        });
        frag.appendChild(clone);
      }
    }

    tmp.childNodes.forEach(wrapTextNodes);
    el.textContent = '';
    el.appendChild(frag);

    chars.forEach(function (span, i) {
      span.style.animationDelay = (0.03 * i) + 's';
    });
  });

  /* =====================================================================
     9. Falling petals canvas animation
  ===================================================================== */
  (function initPetals() {
    var canvas = document.getElementById('petals-canvas');
    if (!canvas) return;

    var ctx    = canvas.getContext('2d');
    var petals = [];
    var COUNT  = window.innerWidth < 640 ? 18 : 35;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var COLORS = [
      'rgba(184, 92, 110, 0.55)',
      'rgba(201, 160, 122, 0.5)',
      'rgba(232, 197, 205, 0.5)',
      'rgba(122, 158, 126, 0.4)',
      'rgba(123,  45,  62, 0.4)',
    ];

    function createPetal() {
      return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * -canvas.height,
        r:     Math.random() * 5 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx:    (Math.random() - 0.5) * 0.6,
        vy:    Math.random() * 0.8 + 0.3,
        rot:   Math.random() * Math.PI * 2,
        dRot:  (Math.random() - 0.5) * 0.03,
        sway:  Math.random() * 2,
        swayT: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.3
      };
    }

    for (var i = 0; i < COUNT; i++) {
      var p = createPetal();
      p.y = Math.random() * canvas.height; /* initial scatter */
      petals.push(p);
    }

    var raf;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach(function (p) {
        p.swayT += 0.012;
        p.x += p.vx + Math.sin(p.swayT) * p.sway * 0.15;
        p.y += p.vy;
        p.rot += p.dRot;

        if (p.y > canvas.height + 20) {
          /* reset to top */
          Object.assign(p, createPetal());
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        /* Petal shape: elongated ellipse */
        ctx.ellipse(0, 0, p.r, p.r * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      raf = requestAnimationFrame(tick);
    }

    /* Only run when hero is visible (IntersectionObserver) */
    var heroEl = document.querySelector('.hero');
    if (heroEl && 'IntersectionObserver' in window) {
      var petalsObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tick();
          } else {
            cancelAnimationFrame(raf);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        });
      }, { threshold: 0.01 });
      petalsObs.observe(heroEl);
    } else {
      tick();
    }
  })();

  /* =====================================================================
     10. RSVP Form — client-side handler
  ===================================================================== */
  var rsvpForm    = document.getElementById('rsvp-form');
  var rsvpSuccess = document.getElementById('rsvp-success');

  if (rsvpForm && rsvpSuccess) {
    /* Make radio choices visually selectable */
    rsvpForm.querySelectorAll('.rsvp__choice').forEach(function (label) {
      label.addEventListener('change', function () {
        rsvpForm.querySelectorAll('.rsvp__choice').forEach(function (l) {
          l.classList.remove('is-selected');
        });
        label.classList.add('is-selected');
      });
    });

    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = rsvpForm.querySelector('#rsvp-name').value.trim();
      var attending = rsvpForm.querySelector('input[name="attending"]:checked');

      if (!name) {
        rsvpForm.querySelector('#rsvp-name').focus();
        return;
      }
      if (!attending) {
        rsvpForm.querySelector('#choice-yes-label').style.borderColor = '#E57070';
        return;
      }

      /* Simulate submit (no backend) */
      var submitBtn = rsvpForm.querySelector('#rsvp-submit-btn');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      setTimeout(function () {
        rsvpForm.hidden    = true;
        rsvpSuccess.hidden = false;
      }, 800);
    });
  }

  /* =====================================================================
     11. Smooth anchor scroll with nav offset
  ===================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var offset = nav ? nav.offsetHeight + 16 : 0;
      var top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

})();
