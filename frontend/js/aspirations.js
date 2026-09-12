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
      feedback.style.color = "#ff6b6b";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "MENGIRIM...";
    feedback.textContent = "";

    const result = await postAspiration({
      category,
      message,
      class: kelas
    });

    if (result.success) {
      feedback.textContent = "Aspirasi berhasil dikirim! Silakan cek secara berkala.";
      feedback.style.color = "#c9a45b";
      form.reset();
    } else {
      feedback.textContent = result.message || "Gagal mengirim aspirasi.";
      feedback.style.color = "#ff6b6b";
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "KIRIM ASPIRASI";
  });
});