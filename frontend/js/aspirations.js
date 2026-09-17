document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aspirationForm");
  const feedback = document.getElementById("aspirationFeedback");
  const submitBtn = document.getElementById("aspirationSubmit");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const category = document.getElementById("aspirationCategory").value;
    const message = document.getElementById("aspirationMessage").value;
    const kelas = document.getElementById("aspirationClass").value;

    if (!category || !message) {
      feedback.textContent = "Kategori dan pesan wajib diisi.";
      feedback.style.color = "#e5484d";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "MENGIRIM...";
    feedback.innerHTML = "";

    const result = await postAspiration({ category, message, class: kelas });

    if (result.success) {
      // Fallback ID
      let finalId = result.id;
      if (!finalId || finalId === "undefined" || finalId === "null") {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, "0");
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const y = now.getFullYear();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        finalId = `ASP-${d}${m}${y}-${hh}${mm}${ss}`;
      }

      // SMOOTH TRANSITION: fade out form dulu
      form.style.transition = "opacity 0.35s cubic-bezier(0.2, 0.8, 0.1, 1), transform 0.35s cubic-bezier(0.2, 0.8, 0.1, 1)";
      form.style.opacity = "0";
      form.style.transform = "translateY(-16px) scale(0.97)";

      setTimeout(() => {
        form.style.display = "none";
        form.style.opacity = "";
        form.style.transform = "";
        form.style.transition = "";
        showReceipt(finalId, category, kelas || "-", message);
      }, 350);

    } else {
      feedback.textContent = result.message || "Gagal mengirim aspirasi.";
      feedback.style.color = "#e5484d";
      submitBtn.disabled = false;
      submitBtn.textContent = "KIRIM ASPIRASI";
    }
  });

  /* =========================================
     RECEIPT VIEW
  ========================================= */
  function showReceipt(id, category, kelas, message) {
    const now = new Date();
    const time = now.toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    const receipt = document.createElement("div");
    receipt.className = "receipt";

    // Set initial state SEBELUM masuk DOM
    receipt.style.opacity = "0";
    receipt.style.transform = "translateY(24px) scale(0.96)";
    receipt.style.transition = "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";

    receipt.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-check">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12l5 5L20 6"/>
          </svg>
        </div>
        <h3>Aspirasi Terkirim!</h3>
        <p class="receipt-sub">Simpan ID di bawah untuk melacak status</p>
      </div>

      <div class="receipt-id-block">
        <div class="receipt-label">ID ASPIRASI</div>
        <div class="receipt-id" id="receiptId">${id}</div>
        <button class="receipt-copy" id="receiptCopy" type="button">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>Copy ID</span>
        </button>
      </div>

      <div class="receipt-details">
        <div class="receipt-row">
          <span>Kategori</span>
          <strong>${category}</strong>
        </div>
        <div class="receipt-row">
          <span>Kelas</span>
          <strong>${kelas}</strong>
        </div>
        <div class="receipt-row">
          <span>Waktu</span>
          <strong>${time}</strong>
        </div>
        <div class="receipt-row">
          <span>Status</span>
          <strong class="receipt-status">Menunggu Diproses</strong>
        </div>
      </div>

      <div class="receipt-message">
        <span>Pesan</span>
        <p>${message}</p>
      </div>

      <div class="receipt-note">
        💡 Aspirasi kamu akan ditinjau oleh pengurus OSIS.<br>
        Gunakan ID di atas di menu <strong>Pantau Aspirasi</strong> untuk melihat progress.
      </div>

      <div class="receipt-actions">
        <button class="receipt-btn-secondary" id="receiptReset" type="button">
          Kirim Aspirasi Lain
        </button>
        <a href="#status" class="receipt-btn-primary" id="receiptTrack">
          Lacak Aspirasi →
        </a>
      </div>
    `;

    // Insert after form
    form.parentNode.insertBefore(receipt, form.nextSibling);

    // Trigger entrance animation dengan double rAF (biar transisi jalan)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        receipt.style.opacity = "1";
        receipt.style.transform = "translateY(0) scale(1)";
      });
    });

    // Copy ID handler
    document.getElementById("receiptCopy").addEventListener("click", () => {
      const text = document.getElementById("receiptId").textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("receiptCopy");
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span>Tersalin!</span>
        `;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove("copied");
        }, 2000);
      });
    });

    // Reset handler — smooth
    document.getElementById("receiptReset").addEventListener("click", () => {
      // Fade out receipt
      receipt.style.opacity = "0";
      receipt.style.transform = "translateY(-16px) scale(0.97)";

      setTimeout(() => {
        receipt.remove();

        // Reset form state
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "KIRIM ASPIRASI";
        feedback.innerHTML = "";

        // Fade in form
        form.style.display = "";
        form.style.opacity = "0";
        form.style.transform = "translateY(16px)";
        form.style.transition = "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            form.style.opacity = "1";
            form.style.transform = "translateY(0)";
          });
        });

        // Clean up inline styles setelah selesai
        setTimeout(() => {
          form.style.opacity = "";
          form.style.transform = "";
          form.style.transition = "";
        }, 600);
      }, 350);
    });

    // Track handler — auto-fill tracker input
    document.getElementById("receiptTrack").addEventListener("click", () => {
      const trackInput = document.getElementById("trackIdInput");
      if (trackInput) {
        trackInput.value = id;
        setTimeout(() => {
          const trackBtn = document.getElementById("trackBtn");
          if (trackBtn) trackBtn.click();
        }, 300);
      }
    });
  }
});