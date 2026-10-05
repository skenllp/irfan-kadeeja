/* ==========================================================================
   Floating Flowers — full-viewport falling petal animation
   Vanilla JS · no dependencies
   ========================================================================== */

function initFloatingFlowers() {
  const container = document.getElementById("floating-flowers");
  if (!container) return;

  // Respect user's motion preference — skip entirely
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Brand palette: forest green + warm gold tones matching the site's CSS variables
  const colors = [
    "#C9A07A", // --color-gold
    "#E8D0AA", // --color-gold-light
    "#9A7040", // --color-gold-dark
    "#8A9678", // --color-maroon-light (sage green)
    "#D4DBC8", // --color-maroon-pale  (pale celadon)
    "#626D53", // --color-maroon       (forest green)
  ];

  // Fewer petals on smaller screens for performance
  const w = window.innerWidth;
  const PETAL_COUNT = w < 640 ? 6 : w < 1024 ? 9 : 14;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function flowerSVG(color) {
    // 5-petal flower: each petal is an ellipse rotated around the centre
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="${color}">
        <ellipse cx="20" cy="10" rx="6" ry="10" opacity="0.9"/>
        <ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(72 20 20)" opacity="0.9"/>
        <ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(144 20 20)" opacity="0.9"/>
        <ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(216 20 20)" opacity="0.9"/>
        <ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(288 20 20)" opacity="0.9"/>
        <circle cx="20" cy="20" r="4.5" fill="#FBF4E3"/>
      </g>
    </svg>`;
  }

  for (let i = 0; i < PETAL_COUNT; i++) {
    const petal = document.createElement("div");
    petal.className = "flower-petal";

    const size     = rand(12, 26);          // px
    const duration = rand(16, 28);          // seconds per loop
    const delay    = -rand(0, duration);    // negative = already mid-animation on load
    const color    = colors[Math.floor(Math.random() * colors.length)];
    const opacity  = rand(0.45, 0.80);

    petal.style.width              = `${size.toFixed(0)}px`;
    petal.style.height             = `${size.toFixed(0)}px`;
    petal.style.left               = `${rand(0, 100).toFixed(1)}%`;
    petal.style.animationDuration  = `${duration.toFixed(1)}s`;
    petal.style.animationDelay     = `${delay.toFixed(1)}s`;
    petal.style.setProperty("--op", opacity.toFixed(2));

    petal.innerHTML = flowerSVG(color);
    container.appendChild(petal);
  }
}

document.addEventListener("DOMContentLoaded", initFloatingFlowers);
