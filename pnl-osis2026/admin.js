/* ============================================
   KONFIGURASI
============================================ */

// Hash SHA-256 dari kode akses kamu
// GANTI INI dengan hash yang kamu generate dari emn178.github.io
const ADMIN_CODE_HASH = "P42286028d2f7116a595d204e39ea9347839884ca60cc99a3c8e6cf0d5852caea";

const SESSION_KEY = "osis_logged_in";
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 jam
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 menit

/* ============================================
   STATE
============================================ */
let allAspirations = [];
let currentFilter = "ALL";
let currentSearch = "";
let currentEditId = null;

/* ============================================
   INIT
============================================ */
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initClock();
  checkLogin();
  setupLogin();
  setupLogout();
  setupRefresh();
  setupFilters();
  setupSearch();
  setupModal();
});

/* ============================================
   SECURITY — HASH
============================================ */
async function hashCode(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ============================================
   SECURITY — RATE LIMIT
============================================ */
function checkRateLimit() {
  const lockUntil = parseInt(localStorage.getItem("login_lock_until") || "0");
  const now = Date.now();
  if (lockUntil > now) {
    return { blocked: true, secondsLeft: Math.ceil((lockUntil - now) / 1000) };
  }
  return { blocked: false };
}

function recordFailedAttempt() {
  const attempts = parseInt(localStorage.getItem("login_attempts") || "0") + 1;
  localStorage.setItem("login_attempts", attempts.toString());

  if (attempts >= MAX_ATTEMPTS) {
    localStorage.setItem("login_lock_until", (Date.now() + LOCKOUT_MS).toString());
    localStorage.setItem("login_attempts", "0");
    return true;
  }
  return false;
}

function resetLoginAttempts() {
  localStorage.removeItem("login_attempts");
  localStorage.removeItem("login_lock_until");
}

/* ============================================
   SECURITY — SESSION
============================================ */
function checkSessionExpiry() {
  const loginTime = parseInt(localStorage.getItem("login_time") || "0");
  if (!loginTime) return true;
  return (Date.now() - loginTime) > SESSION_TIMEOUT_MS;
}

function startSession() {
  localStorage.setItem(SESSION_KEY, "true");
  localStorage.setItem("login_time", Date.now().toString());
}

function endSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("login_time");
}

/* ============================================
   LOADER ADMIN
============================================ */
function initLoader() {
  const loader = document.getElementById("adminLoader");
  const fill = document.getElementById("adminLoaderFill");
  const loginScreen = document.getElementById("loginScreen");
  if (!loader) return;

  if (loginScreen) loginScreen.style.display = "none";

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add("done");
        if (loginScreen) {
          loginScreen.style.display = "grid";
          setTimeout(() => loginScreen.classList.add("animate"), 50);
        }
      }, 300);
    }
    if (fill) fill.style.width = progress + "%";
  }, 100);
}

/* ============================================
   LIVE CLOCK
============================================ */
function initClock() {
  const el = document.getElementById("dashTime");
  if (!el) return;
  function update() {
    const n = new Date();
    el.textContent =
      String(n.getHours()).padStart(2, "0") + ":" +
      String(n.getMinutes()).padStart(2, "0") + ":" +
      String(n.getSeconds()).padStart(2, "0");
  }
  update();
  setInterval(update, 1000);
}

/* ============================================
   LOGIN
============================================ */
function checkLogin() {
  if (localStorage.getItem(SESSION_KEY) === "true") {
    if (checkSessionExpiry()) {
      endSession();
      return;
    }
    showDashboard(true);
  }
}

function setupLogin() {
  const btn = document.getElementById("loginBtn");
  const input = document.getElementById("adminCode");
  const err = document.getElementById("loginError");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    // Cek rate limit dulu
    const limit = checkRateLimit();
    if (limit.blocked) {
      err.textContent = `Terlalu banyak percobaan. Tunggu ${limit.secondsLeft} detik.`;
      return;
    }

    // Hash input user
    const inputHash = await hashCode(input.value);

    if (inputHash === ADMIN_CODE_HASH) {
      // ✅ Login sukses
      resetLoginAttempts();
      startSession();
      showDashboard();
    } else {
      // ❌ Login gagal
      const locked = recordFailedAttempt();
      if (locked) {
        err.textContent = "Terlalu banyak percobaan. Terkunci 5 menit.";
      } else {
        const attempts = parseInt(localStorage.getItem("login_attempts") || "0");
        const left = MAX_ATTEMPTS - attempts;
        err.textContent = `Kode akses salah. Sisa ${left} percobaan.`;
      }
      input.value = "";
      input.focus();
      input.style.animation = "shake 0.4s ease";
      setTimeout(() => { input.style.animation = ""; }, 400);
    }
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") btn.click();
  });
}

function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (confirm("Yakin ingin logout?")) {
      endSession();
      location.reload();
    }
  });
}

function showDashboard(skipAnimation) {
  const loginScreen = document.getElementById("loginScreen");
  const dashboard = document.getElementById("dashboard");
  if (!dashboard) return;

  if (skipAnimation) {
    if (loginScreen) loginScreen.style.display = "none";
    dashboard.style.display = "block";
    loadAspirations();
    return;
  }

  if (loginScreen) {
    loginScreen.style.transition = "opacity 0.4s ease";
    loginScreen.style.opacity = "0";
  }

  setTimeout(() => {
    if (loginScreen) loginScreen.style.display = "none";
    dashboard.style.display = "block";
    dashboard.classList.add("entering");
    loadAspirations();
    setTimeout(() => dashboard.classList.remove("entering"), 1500);
  }, 400);
}

/* ============================================
   REFRESH
============================================ */
function setupRefresh() {
  const btn = document.getElementById("refreshBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    loadAspirations();
  });
}

/* ============================================
   LOAD ASPIRATIONS
============================================ */
async function loadAspirations() {
  const container = document.getElementById("aspirationContainer");
  if (!container) return;
  container.innerHTML = '<div class="loading-state">MEMUAT ASPIRASI...</div>';

  try {
    allAspirations = await getAspirations(true);

    if (!allAspirations || !allAspirations.length) {
      container.innerHTML = '<div class="loading-state">BELUM ADA ASPIRASI MASUK.</div>';
      updateStats([]);
      return;
    }

    updateStats(allAspirations);
    renderAspirations();
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading-state">GAGAL MEMUAT DATA.</div>';
  }
}

/* ============================================
   STATS
============================================ */
function updateStats(data) {
  const total = data.length;
  const baru = data.filter(a => a.STATUS === "MASUK").length;
  const proses = data.filter(a => a.STATUS === "SEDANG DIURUS" || a.STATUS === "DIPERIKSA").length;
  const selesai = data.filter(a => a.STATUS === "SELESAI").length;

  animateCount("statTotal", total);
  animateCount("statBaru", baru);
  animateCount("statProses", proses);
  animateCount("statSelesai", selesai);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const duration = 800;
  const startTime = performance.now();

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(animate);
    else el.textContent = target;
  }
  requestAnimationFrame(animate);
}

/* ============================================
   RENDER ASPIRATIONS
============================================ */
function renderAspirations() {
  const container = document.getElementById("aspirationContainer");
  if (!container) return;

  let filtered = [...allAspirations];

  if (currentFilter !== "ALL") {
    filtered = filtered.filter(a => a.STATUS === currentFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(a =>
      (a.ID || "").toLowerCase().includes(q) ||
      (a.MESSAGE || "").toLowerCase().includes(q) ||
      (a.CATEGORY || "").toLowerCase().includes(q) ||
      (a.CLASS || "").toLowerCase().includes(q) ||
      (a.PIC || "").toLowerCase().includes(q)
    );
  }

  if (!filtered.length) {
    container.innerHTML = '<div class="loading-state">TIDAK ADA ASPIRASI DENGAN FILTER INI.</div>';
    return;
  }

  container.innerHTML = "";
  filtered.reverse().forEach((item, index) => {
    container.appendChild(createCard(item, index));
  });
}

function createCard(item, index) {
  const card = document.createElement("div");
  card.className = "aspiration-card";
  card.style.animationDelay = (index * 0.04) + "s";

  const statusClass = (item.STATUS || "MASUK").replace(/\s/g, "-");
  const pic = item.PIC || "Belum ditentukan";
  const picEmpty = !item.PIC ? "empty" : "";

  card.innerHTML = `
    <div class="card-top">
      <span class="card-id">${item.ID || "-"}</span>
      <span class="status-badge ${statusClass}">${item.STATUS || "MASUK"}</span>
    </div>
    <span class="card-category">${item.CATEGORY || "-"}</span>
    <h4>${item.CLASS || "Tanpa Kelas"}</h4>
    <p class="card-msg">${item.MESSAGE || "-"}</p>
    <div class="card-bottom">
      <span class="card-pic ${picEmpty}">
        <span class="pic-dot"></span>
        ${pic}
      </span>
      <span class="card-arrow">→</span>
    </div>
  `;

  card.addEventListener("click", () => openEditModal(item.ID));
  return card;
}

/* ============================================
   FILTERS
============================================ */
function setupFilters() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.status;
      renderAspirations();
    });
  });
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  let timer;
  input.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      currentSearch = e.target.value.trim();
      renderAspirations();
    }, 200);
  });
}

/* ============================================
   MODAL EDIT
============================================ */
function setupModal() {
  const backdrop = document.querySelector(".modal-backdrop");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelModal");
  const saveBtn = document.getElementById("saveModal");

  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (saveBtn) saveBtn.addEventListener("click", saveAspiration);

  document.querySelectorAll(".status-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".status-opt").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("modalStatus").value = btn.dataset.value;
    });
  });
}

function openEditModal(id) {
  const item = allAspirations.find(a => a.ID === id);
  if (!item) return;

  currentEditId = id;

  document.getElementById("modalIdDisplay").textContent = item.ID || "-";
  document.getElementById("modalMessageDisplay").textContent = item.MESSAGE || "-";
  document.getElementById("modalCategory").textContent = item.CATEGORY || "-";
  document.getElementById("modalClass").textContent = item.CLASS || "-";
  document.getElementById("modalTime").textContent = item.TIME || "-";
  document.getElementById("modalPic").value = item.PIC || "";
  document.getElementById("modalResponse").value = item.RESPONSE || "";
  document.getElementById("modalStatus").value = item.STATUS || "MASUK";

  document.querySelectorAll(".status-opt").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.value === (item.STATUS || "MASUK"));
  });

  document.getElementById("editModal").classList.add("open");
}

function closeModal() {
  document.getElementById("editModal").classList.remove("open");
  currentEditId = null;
}

async function saveAspiration() {
  if (!currentEditId) return;

  const saveBtn = document.getElementById("saveModal");
  const originalText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = "MENYIMPAN...";

  const result = await updateAspiration({
    id: currentEditId,
    status: document.getElementById("modalStatus").value,
    pic: document.getElementById("modalPic").value,
    response: document.getElementById("modalResponse").value
  });

  if (result.success) {
    closeModal();
    await loadAspirations();
    showToast("Aspirasi berhasil diupdate!", "success");
  } else {
    showToast("Gagal menyimpan: " + result.message, "error");
  }

  saveBtn.disabled = false;
  saveBtn.textContent = originalText;
}

/* ============================================
   TOAST
============================================ */
function showToast(message, type) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast toast-" + (type || "success");
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================
   ANTI-INSPECT (Deterrent)
============================================ */
document.addEventListener("contextmenu", (e) => {
  if (window.location.pathname.includes("dashboard")) {
    e.preventDefault();
  }
});

document.addEventListener("keydown", (e) => {
  if (!window.location.pathname.includes("dashboard")) return;
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
    (e.metaKey && e.altKey && ["I", "J", "C"].includes(e.key.toUpperCase()))
  ) {
    e.preventDefault();
  }
});