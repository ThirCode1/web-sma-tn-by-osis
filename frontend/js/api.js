/* ============================================
   API CONFIG
============================================ */
const API_URL =
  "https://script.google.com/macros/s/AKfycbz8F0avGv_Os_4X1B0naxm_NGmOLXogQv7IDTBR4pnNreB_DaU0PE93T_APfkjQ79oDGg/exec";

const API_TIMEOUT_MS = 20000;


/* ============================================
   CACHE (in-memory)
============================================ */
let _aspirationsCache = null;
let _aspirationsCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;


/* ============================================
   FETCH WRAPPER
============================================ */
async function apiFetch(params) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}?${queryString}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-cache",
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout — cek koneksi internet.");
    }
    throw error;
  }
}


/* ============================================
   GET PROGRAMS
============================================ */
async function getPrograms() {
  try {
    const result = await apiFetch({ action: "programs" });
    if (!result.success) throw new Error(result.message || "API gagal");
    return result.data || [];
  } catch (error) {
    console.error("[api] getPrograms error:", error);
    return [];
  }
}


/* ============================================
   GET NEWS
============================================ */
async function getNews() {
  try {
    const result = await apiFetch({ action: "news" });
    if (!result.success) throw new Error(result.message || "API gagal");
    return result.data || [];
  } catch (error) {
    console.error("[api] getNews error:", error);
    return [];
  }
}


/* ============================================
   GET ASPIRATIONS (cache)
============================================ */
async function getAspirations(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && _aspirationsCache && now - _aspirationsCacheTime < CACHE_TTL_MS) {
    return _aspirationsCache;
  }

  try {
    const result = await apiFetch({ action: "aspirations" });
    if (!result.success) throw new Error(result.message || "API gagal");

    _aspirationsCache = result.data || [];
    _aspirationsCacheTime = now;
    return _aspirationsCache;

  } catch (error) {
    console.error("[api] getAspirations error:", error);
    if (_aspirationsCache) return _aspirationsCache;
    return [];
  }
}


/* ============================================
   INVALIDATE CACHE
============================================ */
function invalidateAspirationsCache() {
  _aspirationsCache = null;
  _aspirationsCacheTime = 0;
}


/* ============================================
   GET ASPIRATION BY ID
============================================ */
async function getAspirationById(id) {
  try {
    const all = await getAspirations();
    return all.find(a => a.ID === id) || null;
  } catch (error) {
    console.error("[api] getAspirationById error:", error);
    return null;
  }
}


/* ============================================
   POST ASPIRATION
============================================ */
async function postAspiration(payload) {
  try {
    const result = await apiFetch({
      action: "createAspiration",
      category: payload.category || "",
      message: payload.message || "",
      class: payload.class || ""
    });

    if (!result.success) throw new Error(result.message || "Gagal mengirim aspirasi");

    invalidateAspirationsCache();

    return { success: true, message: "Aspirasi berhasil dikirim!", id: result.id };
  } catch (error) {
    console.error("[api] postAspiration error:", error);
    return { success: false, message: "Gagal mengirim: " + error.message };
  }
}


/* ============================================
   UPDATE ASPIRATION
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

    if (!result.success) throw new Error(result.message || "Gagal update aspirasi");

    invalidateAspirationsCache();
    return { success: true };
  } catch (error) {
    console.error("[api] updateAspiration error:", error);
    return { success: false, message: "Gagal update: " + error.message };
  }
}