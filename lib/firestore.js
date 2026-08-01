import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------- Profils ----------

export async function getProfiles() {
  const snap = await getDocs(
    query(collection(db, 'profiles'), orderBy('createdAt'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createProfile(name) {
  const docRef = await addDoc(collection(db, 'profiles'), {
    name,
    photoUrl: null,
    createdAt: Date.now(),
  });
  return { id: docRef.id, name, photoUrl: null, createdAt: Date.now() };
}

// ---------- Mesures ----------

export async function saveMeasurement({ profileId, weightBeforeKg, weightAfterKg }) {
  const diffGrams = Math.round((weightBeforeKg - weightAfterKg) * 1000);
  const data = {
    profileId,
    weightBeforeKg,
    weightAfterKg,
    diffGrams,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(collection(db, 'measurements'), data);
  return { id: docRef.id, ...data };
}

/**
 * S'abonne en temps réel aux mesures d'un profil.
 * `callback` reçoit la liste triée (plus récent en premier).
 * Retourne la fonction pour se désabonner.
 */
export function watchMeasurements(profileId, callback) {
  const q = query(
    collection(db, 'measurements'),
    where('profileId', '==', profileId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
