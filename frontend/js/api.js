/* ============================================
   API CONFIG
============================================ */
const API_URL =
  "https://script.google.com/macros/s/AKfycbz8F0avGv_Os_4X1B0naxm_NGmOLXogQv7IDTBR4pnNreB_DaU0PE93T_APfkjQ79oDGg/exec";


/* ============================================
   HELPER: Fetch wrapper
============================================ */
async function apiFetch(params) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}?${queryString}`);
  return response.json();
}


/* ============================================
   GET PROGRAMS
============================================ */
async function getPrograms() {
  try {
    const result = await apiFetch({ action: "programs" });

    if (!result.success) {
      throw new Error(result.message || "API gagal");
    }

    return result.data;

  } catch (error) {
    console.error("Gagal mengambil data programs:", error);
    return [];
  }
}


/* ============================================
   GET NEWS
============================================ */
async function getNews() {
  try {
    const result = await apiFetch({ action: "news" });

    if (!result.success) {
      throw new Error(result.message || "API gagal");
    }

    return result.data;

  } catch (error) {
    console.error("Gagal mengambil data news:", error);
    return [];
  }
}


/* ============================================
   GET ASPIRATIONS (Untuk Dashboard OSIS)
============================================ */
async function getAspirations() {
  try {
    const result = await apiFetch({ action: "aspirations" });

    if (!result.success) {
      throw new Error(result.message || "API gagal");
    }

    return result.data;

  } catch (error) {
    console.error("Gagal mengambil data aspirations:", error);
    return [];
  }
}


/* ============================================
   GET ASPIRATION BY ID (Untuk Status Tracker)
============================================ */
async function getAspirationById(id) {
  try {
    const all = await getAspirations();
    const found = all.find(a => a.ID === id);
    return found || null;

  } catch (error) {
    console.error("Gagal mencari aspirasi:", error);
    return null;
  }
}


/* ============================================
   POST ASPIRATION (Suara Nusantara)
============================================ */
async function postAspiration(payload) {
  try {
    const result = await apiFetch({
      action: "createAspiration",
      category: payload.category || "",
      message: payload.message || "",
      class: payload.class || ""
    });

    if (!result.success) {
      throw new Error(result.message || "Gagal mengirim aspirasi");
    }

    return {
      success: true,
      message: "Aspirasi berhasil dikirim!",
      id: result.id
    };

  } catch (error) {
    console.error("POST ASPIRATION ERROR:", error);
    return {
      success: false,
      message: "Gagal terhubung ke server: " + error.message
    };
  }
}


/* ============================================
   UPDATE ASPIRATION (Untuk Dashboard OSIS)
============================================ */
async function updateAspiration(payload) {
  try {
    const result = await apiFetch({
      action: "updateAspiration",
      id: payload.id || "",
      status: payload.status || "",
      pic: payload.pic || "",
      response: payload.response || ""
    });

    if (!result.success) {
      throw new Error(result.message || "Gagal update aspirasi");
    }

    return { success: true };

  } catch (error) {
    console.error("UPDATE ASPIRATION ERROR:", error);
    return {
      success: false,
      message: "Gagal update: " + error.message
    };
  }
}