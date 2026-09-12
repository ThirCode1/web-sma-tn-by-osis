/* LOADER */
(function initLoader() {
  const loader = document.getElementById("loader");
  const countEl = document.getElementById("loaderCount");
  const barEl = document.getElementById("loaderBar");
  if (!loader) return;

  document.body.style.overflow = "hidden";

  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 8) + 3;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add("done");
        document.body.style.overflow = "auto";
      }, 400);
    }
    countEl.textContent = count;
    barEl.style.width = count + "%";
  }, 80);
})();


/* SCROLL PROGRESS */
(function initScrollProgress() {
  const fill = document.getElementById("scrollProgress");
  if (!fill) return;

  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const percent = (scrolled / total) * 100;
    fill.style.width = percent + "%";
  });
})();


/* NAVBAR SCROLL */
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
})();


/* LIVE CLOCK */
(function initClock() {
  const el = document.getElementById("navTime");
  if (!el) return;

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    el.textContent = `${h}:${m}:${s}`;
  }
  update();
  setInterval(update, 1000);
})();


/* SCROLL REVEAL */
(function initReveal() {
  const els = document.querySelectorAll(".reveal-up");
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
})();


/* COUNT-UP */
(function initCountUp() {
  const numbers = document.querySelectorAll(".stat-number[data-count]");
  if (!numbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 2000;
      const start = performance.now();

      function animate(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(animate);
        else el.textContent = target;
      }

      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  numbers.forEach(n => observer.observe(n));
})();


/* PARALLAX HERO */
(function initParallax() {
  const crest = document.querySelector(".hero-crest");
  const title = document.querySelector(".hero-title");

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (crest) crest.style.transform = `translateY(calc(-50% + ${y * 0.3}px))`;
    if (title) {
      title.style.transform = `translateY(${y * 0.1}px)`;
      title.style.opacity = Math.max(0, 1 - y / 700);
    }
  });
})();


/* STATUS TRACKER */
(function initTracker() {
  const btn = document.getElementById("trackBtn");
  const input = document.getElementById("trackIdInput");
  const result = document.getElementById("trackResult");
  if (!btn || !input || !result) return;

  btn.addEventListener("click", async () => {
    const id = input.value.trim();
    if (!id) {
      result.innerHTML = '<div class="track-empty">Masukkan ID aspirasi terlebih dahulu.</div>';
      return;
    }

    result.innerHTML = '<div class="track-empty">Mencari aspirasi...</div>';

    const data = await getAspirationById(id);

    if (!data) {
      result.innerHTML = `
        <div class="track-empty">
          Aspirasi dengan ID <strong>${id}</strong> tidak ditemukan.
        </div>`;
      return;
    }

    const statusClass = (data.STATUS || "").replace(/\s/g, "-");
    result.innerHTML = `
      <div class="track-card">
        <div class="track-header">
          <span class="track-id">${data.ID}</span>
          <span class="track-status ${statusClass}">${data.STATUS}</span>
        </div>
        <p class="track-message">${data.MESSAGE}</p>
        <div class="track-meta">
          <div>
            <small>KATEGORI</small>
            <strong>${data.CATEGORY || "-"}</strong>
          </div>
          <div>
            <small>KELAS</small>
            <strong>${data.CLASS || "-"}</strong>
          </div>
          <div>
            <small>WAKTU</small>
            <strong>${data.TIME || "-"}</strong>
          </div>
          <div>
            <small>PIC</small>
            <strong>${data.PIC || "Belum ditentukan"}</strong>
          </div>
        </div>
        ${data.RESPONSE ? `
          <div class="track-response">
            <small>BALASAN OSIS</small>
            <p>${data.RESPONSE}</p>
          </div>
        ` : ""}
      </div>
    `;
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") btn.click();
  });
})();