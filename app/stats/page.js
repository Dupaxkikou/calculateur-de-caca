'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveProfile } from '../../lib/store';
import { watchMeasurements } from '../../lib/firestore';

function averageForLastDays(measurements, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = measurements.filter((m) => m.createdAt >= cutoff);
  if (filtered.length === 0) return 0;
  return Math.round(
    filtered.reduce((a, m) => a + m.diffGrams, 0) / filtered.length
  );
}

export default function StatsPage() {
  const router = useRouter();
  const [measurements, setMeasurements] = useState(null);

  useEffect(() => {
    const profile = getActiveProfile();
    if (!profile) {
      router.replace('/');
      return;
    }
    const unsubscribe = watchMeasurements(profile.id, setMeasurements);
    return () => unsubscribe();
  }, [router]);

  return (
    <main className="px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-2xl">
          ←
        </button>
        <h1 className="text-xl font-bold">Statistiques</h1>
      </div>

      {measurements === null && <p className="text-muted">Chargement…</p>}
      {measurements?.length === 0 && <p className="text-muted">Pas encore de données.</p>}

      {measurements && measurements.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Total cumulé"
            value={`${measurements.reduce((a, m) => a + m.diffGrams, 0)} g`}
          />
          <StatTile
            label="Record"
            value={`${Math.max(...measurements.map((m) => m.diffGrams))} g`}
          />
          <StatTile label="Moyenne 7 jours" value={`${averageForLastDays(measurements, 7)} g`} />
          <StatTile
            label="Moyenne 30 jours"
            value={`${averageForLastDays(measurements, 30)} g`}
          />
        </div>
      )}
    </main>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="card">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-muted text-sm mt-1">{label}</p>
    </div>
  );
}
