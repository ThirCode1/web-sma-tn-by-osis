let allPrograms = [];


async function renderPrograms() {

    const container =
        document.getElementById(
            "programContainer"
        );


    container.innerHTML = `
        <div class="program-loading">
            LOADING PROGRAMS...
        </div>
    `;


    allPrograms =
        await getPrograms();


    renderProgramList(
        allPrograms
    );

}


/* =========================================
   RENDER LIST
========================================= */

function createProgramCard(program, index) {
  const card = document.createElement("article");
  card.className = "program-card";
  card.style.animationDelay = (index * 0.05) + "s";

  const category = program.CATEGORY || "Information";
  const statusClass = (program.STATUS || "").replace(/\s/g, "-");

  // Icon emoji berdasarkan kategori
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
   FILTER
========================================= */

document
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(
                            item =>
                                item.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    const filter =
                        button.dataset.filter;


                    if (
                        filter === "ALL"
                    ) {

                        renderProgramList(
                            allPrograms
                        );

                        return;

                    }


                    const filtered =
                        allPrograms.filter(
                            program =>
                                program.CATEGORY
                                === filter
                        );


                    renderProgramList(
                        filtered
                    );

                }
            );

        }
    );


/* =========================================
   MODAL
========================================= */

function openProgramModal(
    program
) {

    document.getElementById(
        "modalCategory"
    ).textContent =
        program.CATEGORY || "-";


    document.getElementById(
        "modalTitle"
    ).textContent =
        program.NAME || "-";


    document.getElementById(
        "modalDescription"
    ).textContent =
        program.DESCRIPTION || "-";


    document.getElementById(
        "modalDate"
    ).textContent =
        program.DATE || "-";


    document.getElementById(
        "modalLocation"
    ).textContent =
        program.LOCATION || "-";


    document.getElementById(
        "modalStatus"
    ).textContent =
        program.STATUS || "-";


    document
        .getElementById(
            "programModal"
        )
        .classList.add(
            "open"
        );

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeProgramModal() {

    document
        .getElementById(
            "programModal"
        )
        .classList.remove(
            "open"
        );

}


document
   const filterButton = document.getElementById("filterSemua"); // ganti dengan id yang kamu pakai
if (filterButton) {
  filterButton.addEventListener("click", function() {
    // logika filter kamu
  });
}

document
  // ... kode filterButton kamu yang sudah aman ...

const modalBackground = document.querySelector(".modal-background");
if (modalBackground) {
  modalBackground.addEventListener("click", closeProgramModal);
}