/* ============================================
   LOADER (skip kalau dari redirect)
============================================ */
(function initLoader() {
  const loader = document.getElementById("loader");
  const countEl = document.getElementById("loaderCount");
  const barEl = document.getElementById("loaderBar");
  if (!loader) return;

  // Kalau datang dari redirect root → skip loader
  if (sessionStorage.getItem("from_redirect") === "true") {
    sessionStorage.removeItem("from_redirect");
    loader.classList.add("done");
    loader.style.display = "none";
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.4s ease";
    requestAnimationFrame(() => {
      document.body.style.opacity = "1";
    });
    return;
  }

  document.body.style.overflow = "hidden";

  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 12) + 5;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add("done");
        document.body.style.overflow = "auto";
      }, 200);
    }
    if (countEl) countEl.textContent = count;
    if (barEl) barEl.style.width = count + "%";
  }, 50);
})();


/* ============================================
   SCROLL PROGRESS
============================================ */
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


/* ============================================
   NAVBAR SCROLL
============================================ */
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
})();


/* ============================================
   LIVE CLOCK
============================================ */
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


/* ============================================
   SCROLL REVEAL (Native)
============================================ */
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


/* ============================================
   COUNT-UP
============================================ */
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


/* ============================================
   PARALLAX HERO (Native fallback)
============================================ */
(function initParallax() {
  if (typeof gsap !== "undefined") return;

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


/* ============================================
   RENDER TRACK RESULT (helper)
============================================ */
function renderTrackResult(data) {
  const result = document.getElementById("trackResult");
  if (!result || !data) return;

  const statusClass = (data.STATUS || "").replace(/\s/g, "-");
  result.innerHTML = `
    <div class="track-card">
      <div class="track-header">
        <span class="track-id">${data.ID}</span>
        <span class="track-status ${statusClass}">${data.STATUS}</span>
      </div>
      <p class="track-message">${data.MESSAGE}</p>
      <div class="track-meta">
        <div><small>KATEGORI</small><strong>${data.CATEGORY || "-"}</strong></div>
        <div><small>KELAS</small><strong>${data.CLASS || "-"}</strong></div>
        <div><small>WAKTU</small><strong>${data.TIME || "-"}</strong></div>
        <div><small>PIC</small><strong>${data.PIC || "Belum ditentukan"}</strong></div>
      </div>
      ${data.RESPONSE ? `
        <div class="track-response">
          <small>BALASAN OSIS</small>
          <p>${data.RESPONSE}</p>
        </div>
      ` : ""}
    </div>
  `;
}


/* ============================================
   STATUS TRACKER (dengan fuzzy match + retry)
============================================ */
(function initTracker() {
  const btn = document.getElementById("trackBtn");
  const input = document.getElementById("trackIdInput");
  const result = document.getElementById("trackResult");
  if (!btn || !input || !result) return;

  btn.addEventListener("click", async () => {
    const rawId = input.value.trim();
    if (!rawId) {
      result.innerHTML = '<div class="track-empty">Masukkan ID aspirasi terlebih dahulu.</div>';
      return;
    }

    result.innerHTML = '<div class="track-empty">Mencari aspirasi...</div>';

    const targetId = rawId.toUpperCase();
    let data = null;

    // Retry 3x dengan force refresh
    for (let attempt = 0; attempt < 3; attempt++) {
      invalidateAspirationsCache();
      await getAspirations(true);
      data = await getAspirationById(targetId);

      if (data) break;

      if (attempt < 2) {
        result.innerHTML = `<div class="track-empty">Mencari... (${attempt + 1}/3)</div>`;
        await new Promise(r => setTimeout(r, 1200));
      }
    }

    // Kalau nggak ketemu, coba partial match
    if (!data) {
      const all = await getAspirations();
      const partial = all.filter(a =>
        String(a.ID || "").toUpperCase().includes(targetId)
      );

      if (partial.length === 1) {
        data = partial[0];
      } else if (partial.length > 1) {
        result.innerHTML = `
          <div class="track-empty">
            Ada <strong>${partial.length}</strong> aspirasi dengan ID mirip.<br>
            <small style="opacity: 0.7;">Masukkan ID yang lebih lengkap.</small>
          </div>`;
        return;
      }
    }

    if (!data) {
      const all = await getAspirations();
      result.innerHTML = `
        <div class="track-empty">
          Aspirasi dengan ID <strong>${rawId}</strong> tidak ditemukan.<br>
          <small style="opacity: 0.7; font-size: 11px;">
            Total ${all.length} aspirasi di database.<br>
            Tunggu 1-2 menit jika baru saja dikirim.
          </small>
        </div>`;
      return;
    }

    renderTrackResult(data);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") btn.click();
  });
})();


/* ============================================
   ENHANCED SCROLL REVEAL (GSAP)
============================================ */
(function initEnhancedReveal() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section-header").forEach((header) => {
    gsap.from(header, {
      scrollTrigger: { trigger: header, start: "top 85%", toggleActions: "play none none none" },
      y: 60, opacity: 0, duration: 1, ease: "power3.out"
    });
  });

  gsap.utils.toArray(".filter-pills").forEach((pills) => {
    gsap.from(pills, {
      scrollTrigger: { trigger: pills, start: "top 90%", toggleActions: "play none none none" },
      y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
    });
  });

  gsap.utils.toArray(".stats-grid").forEach((grid) => {
    const items = grid.querySelectorAll(".stat-item");
    gsap.from(items, {
      scrollTrigger: { trigger: grid, start: "top 85%", toggleActions: "play none none none" },
      y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out"
    });
  });

  const trackerBox = document.querySelector(".tracker-box");
  if (trackerBox) {
    gsap.from(trackerBox, {
      scrollTrigger: { trigger: trackerBox, start: "top 85%", toggleActions: "play none none none" },
      y: 50, opacity: 0, scale: 0.98, duration: 1, ease: "power3.out"
    });
  }

  const footerTitle = document.querySelector(".footer-title");
  if (footerTitle) {
    gsap.from(footerTitle, {
      scrollTrigger: { trigger: footerTitle, start: "top 90%", toggleActions: "play none none none" },
      y: 80, opacity: 0, duration: 1.2, ease: "power3.out"
    });
  }
})();


/* ============================================
   HERO PARALLAX (GSAP)
============================================ */
(function initHeroParallaxGSAP() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const heroCrest = document.querySelector(".hero-crest");
  const heroScrollHint = document.querySelector(".hero-scroll-hint");

  if (!hero) return;

  if (heroContent) {
    gsap.to(heroContent, {
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 },
      y: 150, opacity: 0, ease: "none"
    });
  }

  if (heroCrest) {
    gsap.to(heroCrest, {
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 },
      y: 100, scale: 1.1, ease: "none"
    });
  }

  if (heroScrollHint) {
    gsap.to(heroScrollHint, {
      scrollTrigger: { trigger: hero, start: "top top", end: "30% top", scrub: 1 },
      opacity: 0, y: 30, ease: "none"
    });
  }
})();


/* ============================================
   MARQUEE DYNAMIC SPEED
============================================ */
(function initMarqueeSpeed() {
  if (typeof ScrollTrigger === "undefined") return;

  const marqueeTrack = document.querySelector(".marquee-track");
  if (!marqueeTrack) return;

  let currentSpeed = 1;

  ScrollTrigger.create({
    trigger: ".marquee",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const v = self.getVelocity() / 4000;
      const targetSpeed = 1 + Math.min(Math.abs(v), 1.5);
      currentSpeed += (targetSpeed - currentSpeed) * 0.1;
      marqueeTrack.style.animationDuration = (40 / currentSpeed) + "s";
    }
  });
})();