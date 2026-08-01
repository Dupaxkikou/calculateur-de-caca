'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveProfile } from '../../lib/store';
import { watchMeasurements } from '../../lib/firestore';

function formatDate(ts) {
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
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
        <h1 className="text-xl font-bold">Historique</h1>
      </div>

      {measurements === null && <p className="text-muted">Chargement…</p>}

      {measurements?.length === 0 && (
        <p className="text-muted">Aucune mesure pour l&apos;instant.</p>
      )}

      {measurements && measurements.length > 0 && (
        <>
          <SummaryCards measurements={measurements} />
          {measurements.length >= 2 && <EvolutionBars measurements={measurements} />}
          <h2 className="font-bold mt-6 mb-2">Détail</h2>
          <div className="flex flex-col gap-2.5">
            {measurements.map((m) => (
              <div key={m.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-bold">{m.diffGrams} g</p>
                  <p className="text-xs text-muted">{formatDate(m.createdAt)}</p>
                </div>
                <p className="text-xs text-muted text-right">
                  {m.weightBeforeKg.toFixed(2)} → {m.weightAfterKg.toFixed(2)} kg
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function SummaryCards({ measurements }) {
  const values = measurements.map((m) => m.diffGrams);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const record = Math.max(...values);

  return (
    <div className="flex gap-3 mb-6">
      <div className="card flex-1 text-center">
        <p className="text-2xl font-bold">{average} g</p>
        <p className="text-muted text-sm">Moyenne</p>
      </div>
      <div className="card flex-1 text-center">
        <p className="text-2xl font-bold">{record} g</p>
        <p className="text-muted text-sm">Record</p>
      </div>
    </div>
  );
}

function EvolutionBars({ measurements }) {
  const ordered = [...measurements].reverse().slice(-12);
  const max = Math.max(...ordered.map((m) => m.diffGrams), 1);

  return (
    <div className="mb-6">
      <h2 className="font-bold mb-2">Évolution</h2>
      <div className="card flex items-end gap-1.5 h-32">
        {ordered.map((m) => (
          <div
            key={m.id}
            className="flex-1 bg-primary rounded-t-md"
            style={{ height: `${Math.max((m.diffGrams / max) * 100, 4)}%` }}
            title={`${m.diffGrams} g`}
          />
        ))}
      </div>
    </div>
  );
}
