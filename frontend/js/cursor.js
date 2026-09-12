/* ============================================
   CUSTOM CURSOR
============================================ */
(function initCursor() {
  // Skip di mobile/touch
  if (window.matchMedia("(pointer: coarse)").matches) return;

  // Buat elemen cursor kalau belum ada
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

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Ring smooth follow
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    // Dot sedikit lebih cepat
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;

    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animate);
  }
  animate();

  // Deteksi hover pada elemen interaktif
  function attachHover(selector, mode) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener("mouseenter", () => {
        ring.dataset.mode = mode || "hover";
      });
      el.addEventListener("mouseleave", () => {
        ring.dataset.mode = "";
      });
    });
  }

  // Attach ke berbagai elemen
  attachHover("a, button, .nav-link, .nav-admin-btn", "link");
  attachHover(".program-card", "view");
  attachHover(".filter-pill, .filter-btn", "click");
  attachHover("input, textarea, select", "text");
})();