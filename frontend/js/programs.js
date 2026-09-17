/* =========================================
   STATE
========================================= */
let allPrograms = [];
let currentProgramFilter = "ALL";


/* =========================================
   RENDER PROGRAMS (Entry Point)
========================================= */
async function renderPrograms() {
  const container = document.getElementById("programContainer");
  if (!container) return;

  container.innerHTML = '<div class="program-loading">MEMUAT PROGRAM...</div>';

  allPrograms = await getPrograms();
  renderProgramList(allPrograms);
}


/* =========================================
   RENDER LIST (Filter result)
========================================= */
function renderProgramList(programs) {
  const container = document.getElementById("programContainer");
  if (!container) return;

  if (!programs || programs.length === 0) {
    container.innerHTML = '<div class="program-empty">Belum ada program kerja.</div>';
    return;
  }

  container.innerHTML = "";
  programs.forEach((program, index) => {
    container.appendChild(createProgramCard(program, index));
  });
}


/* =========================================
   CREATE CARD
========================================= */
function createProgramCard(program, index) {
  const card = document.createElement("article");
  card.className = "program-card";
  card.style.animationDelay = (index * 0.05) + "s";

  const category = program.CATEGORY || "Information";
  const statusClass = (program.STATUS || "").replace(/\s/g, "-");

  const icons = {
    Event: "🎯",
    Aspirasi: "💬",
    Information: "📢"
  };
  const icon = icons[category] || "📌";
  const iconClass = category.toLowerCase();

  card.innerHTML = `
    <div class="program-card-top">
      <div class="program-icon ${iconClass}">${icon}</div>
      <span class="program-status ${statusClass}">${program.STATUS || "OPEN"}</span>
    </div>
    <span class="program-category-badge">${category.toUpperCase()}</span>
    <h3>${program.NAME || "Tanpa Nama"}</h3>
    <p>${program.DESCRIPTION || "Belum ada deskripsi."}</p>
    <div class="program-card-footer">
      <span class="program-date">${program.DATE || "-"}</span>
      <span class="program-cta">
        Detail
        <span class="program-cta-arrow">→</span>
      </span>
    </div>
  `;

  card.addEventListener("click", () => openProgramModal(program));
  return card;
}


/* =========================================
   FILTER PILLS
========================================= */
function initProgramFilter() {
  const pills = document.querySelectorAll(".filter-pill, .filter-btn");
  if (!pills.length) return;

  pills.forEach((button) => {
    button.addEventListener("click", () => {
      // Reset active state
      pills.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter;

      if (filter === "ALL") {
        renderProgramList(allPrograms);
        return;
      }

      const filtered = allPrograms.filter(
        (program) => program.CATEGORY === filter
      );
      renderProgramList(filtered);
    });
  });
}


/* =========================================
   MODAL — OPEN
========================================= */
function openProgramModal(program) {
  document.getElementById("modalCategory").textContent = program.CATEGORY || "-";
  document.getElementById("modalTitle").textContent = program.NAME || "-";
  document.getElementById("modalDescription").textContent = program.DESCRIPTION || "-";
  document.getElementById("modalDate").textContent = program.DATE || "-";
  document.getElementById("modalLocation").textContent = program.LOCATION || "-";
  document.getElementById("modalStatus").textContent = program.STATUS || "-";

  document.getElementById("programModal").classList.add("open");
}


/* =========================================
   MODAL — CLOSE
========================================= */
function closeProgramModal() {
  document.getElementById("programModal").classList.remove("open");
}


/* =========================================
   INIT EVENTS (dipanggil dari DOMContentLoaded)
========================================= */
function initProgramEvents() {
  // Close button
  const closeBtn = document.getElementById("closeModal");
  if (closeBtn) closeBtn.addEventListener("click", closeProgramModal);

  // Click backdrop
  const modalBackground = document.querySelector(".modal-background");
  if (modalBackground) {
    modalBackground.addEventListener("click", closeProgramModal);
  }

  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProgramModal();
  });

  // Init filter
  initProgramFilter();
}

// Auto-init event setelah DOM siap
document.addEventListener("DOMContentLoaded", initProgramEvents);