/* ============================================
   CUSTOM CURSOR
============================================ */
(function initCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let dot = document.getElementById("cursorDot");
  let ring = document.getElementById("cursorRing");

  if (!dot) {
    dot = document.createElement("div");
    dot.id = "cursorDot";
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
  }

  if (!ring) {
    ring = document.createElement("div");
    ring.id = "cursorRing";
    ring.className = "cursor-ring";
    document.body.appendChild(ring);
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;
  let dotX = mouseX, dotY = mouseY;
  let initialized = false;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!initialized) {
      ringX = dotX = mouseX;
      ringY = dotY = mouseY;
      initialized = true;
    }
  });

  function animate() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;

    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animate);
  }
  animate();

  function attachHover(selector, mode) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener("mouseenter", () => ring.dataset.mode = mode || "link");
      el.addEventListener("mouseleave", () => ring.dataset.mode = "");
    });
  }

  attachHover("a, button, .nav-link, .nav-admin-btn", "link");
  attachHover(".program-card", "view");
  attachHover(".filter-pill, .filter-btn", "click");
  attachHover("input, textarea, select", "text");
})();