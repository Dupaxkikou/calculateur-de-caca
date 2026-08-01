// Petit wrapper localStorage : évite de payer une lecture Firestore
// juste pour savoir "qui est connecté" ou "où on en est dans la mesure".
// Les données définitives (profils, mesures) restent dans Firestore.

const KEYS = {
  activeProfile: 'cc_active_profile',
  pendingMeasurement: 'cc_pending_measurement',
};

export function getActiveProfile() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.activeProfile);
  return raw ? JSON.parse(raw) : null;
}

export function setActiveProfile(profile) {
  if (profile) {
    localStorage.setItem(KEYS.activeProfile, JSON.stringify(profile));
  } else {
    localStorage.removeItem(KEYS.activeProfile);
  }
}

export function getPendingMeasurement() {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(KEYS.pendingMeasurement);
  return raw ? JSON.parse(raw) : {};
}

export function setPendingMeasurement(partial) {
  const current = getPendingMeasurement();
  const next = { ...current, ...partial };
  localStorage.setItem(KEYS.pendingMeasurement, JSON.stringify(next));
  return next;
}

export function resetPendingMeasurement() {
  localStorage.removeItem(KEYS.pendingMeasurement);
}
