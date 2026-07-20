/**
 * Favoritos del asistente — persistidos solo en localStorage, sin login, sin Supabase.
 */

const FAVORITES_KEY = "riesgird_favoritos";

function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function isFavorite(sesionId) {
  return getFavorites().includes(sesionId);
}

function toggleFavorite(sesionId) {
  const current = getFavorites();
  const idx = current.indexOf(sesionId);
  if (idx === -1) {
    current.push(sesionId);
  } else {
    current.splice(idx, 1);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
  return current.includes(sesionId);
}
