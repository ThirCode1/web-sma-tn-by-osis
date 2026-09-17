/* ============================================
   LOADER
============================================ */
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
   PARALLAX HERO (Native)
============================================ */
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


/* ============================================
   STATUS TRACKER
============================================ */
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
      scrollTrigger: {
        trigger: header,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  });

  gsap.utils.toArray(".filter-pills").forEach((pills) => {
    gsap.from(pills, {
      scrollTrigger: {
        trigger: pills,
        start: "top 90%",
        toggleActions: "play none none none"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  gsap.utils.toArray(".stats-grid").forEach((grid) => {
    const items = grid.querySelectorAll(".stat-item");
    gsap.from(items, {
      scrollTrigger: {
        trigger: grid,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      y: 50,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out"
    });
  });

  const trackerBox = document.querySelector(".tracker-box");
  if (trackerBox) {
    gsap.from(trackerBox, {
      scrollTrigger: {
        trigger: trackerBox,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      y: 50,
      opacity: 0,
      scale: 0.98,
      duration: 1,
      ease: "power3.out"
    });
  }

  const aspirationLayout = document.querySelector(".aspiration-layout");
  if (aspirationLayout) {
    const info = aspirationLayout.querySelector(".aspiration-info");
    const form = aspirationLayout.querySelector(".aspiration-form");

    if (info) {
      gsap.from(info, {
        scrollTrigger: {
          trigger: aspirationLayout,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }

    if (form) {
      gsap.from(form, {
        scrollTrigger: {
          trigger: aspirationLayout,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        x: 60,
        opacity: 0,
        duration: 1,
        delay: 0.15,
        ease: "power3.out"
      });
    }
  }

  const footerTitle = document.querySelector(".footer-title");
  if (footerTitle) {
    gsap.from(footerTitle, {
      scrollTrigger: {
        trigger: footerTitle,
        start: "top 90%",
        toggleActions: "play none none none"
      },
      y: 80,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
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
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      },
      y: 150,
      opacity: 0,
      ease: "none"
    });
  }

  if (heroCrest) {
    gsap.to(heroCrest, {
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 1
      },
      y: 100,
      rotate: 30,
      scale: 1.1,
      ease: "none"
    });
  }

  if (heroScrollHint) {
    gsap.to(heroScrollHint, {
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "30% top",
        scrub: 1
      },
      opacity: 0,
      y: 30,
      ease: "none"
    });
  }
})();


/* ============================================
   MARQUEE VELOCITY (via animationDuration)
============================================ */
(function initMarqueeVelocity() {
  if (typeof ScrollTrigger === "undefined") return;

  const marqueeTrack = document.querySelector(".marquee-track");
  if (!marqueeTrack) return;

  let currentSpeed = 1;

  ScrollTrigger.create({
    trigger: ".marquee",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const velocity = Math.min(Math.abs(self.getVelocity()) / 800, 3);
      const targetSpeed = 1 + velocity;
      currentSpeed += (targetSpeed - currentSpeed) * 0.15;
      marqueeTrack.style.animationDuration = (40 / currentSpeed) + "s";
    }
  });
})();