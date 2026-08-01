'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfiles, createProfile } from '../lib/firestore';
import { getActiveProfile, setActiveProfile } from '../lib/store';

export default function ProfileSelectPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const existing = getActiveProfile();
    if (existing) {
      router.replace('/home');
      return;
    }
    loadProfiles();
  }, [router]);

  async function loadProfiles() {
    setLoading(true);
    try {
      const list = await getProfiles();
      setProfiles(list);
    } catch (e) {
      // Firestore pas encore configuré : on affiche juste la création
    }
    setLoading(false);
  }

  function selectProfile(profile) {
    setActiveProfile(profile);
    router.push('/home');
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const profile = await createProfile(name.trim());
    selectProfile(profile);
  }

  return (
    <main className="px-6 py-10">
      <div className="text-5xl mb-3">💩</div>
      <h1 className="text-2xl font-bold mb-8 leading-tight">
        Qui pèse le morceau
        <br />
        aujourd&apos;hui ?
      </h1>

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : (
        <div className="grid grid-cols-3 gap-5 mb-8">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProfile(p)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primaryDark text-lg">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate w-full text-center">{p.name}</span>
            </button>
          ))}
          <button onClick={() => setShowForm(true)} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#E9EDEB] flex items-center justify-center text-muted text-2xl">
              +
            </div>
            <span className="text-sm text-muted">Ajouter</span>
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card">
          <label className="block text-sm font-medium mb-2">Prénom ou pseudo</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#E0E4E2] rounded-xl px-4 py-3 mb-4"
            placeholder="Arthur"
          />
          <button type="submit" className="big-btn big-btn-primary">
            Créer
          </button>
        </form>
      )}
    </main>
  );
}
