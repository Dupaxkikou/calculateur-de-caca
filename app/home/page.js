'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BigButton from '../../components/BigButton';
import { getActiveProfile, setActiveProfile, resetPendingMeasurement } from '../../lib/store';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const p = getActiveProfile();
    if (!p) {
      router.replace('/');
      return;
    }
    setProfile(p);
  }, [router]);

  function switchProfile() {
    setActiveProfile(null);
    router.push('/');
  }

  function startMeasure() {
    resetPendingMeasurement();
    router.push('/measure/before');
  }

  if (!profile) return null;

  return (
    <main className="px-6 py-8 flex flex-col min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <span className="text-4xl">💩</span>
        <button
          onClick={switchProfile}
          className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primaryDark"
        >
          {profile.name.charAt(0).toUpperCase()}
        </button>
      </div>

      <h1 className="text-2xl font-bold">Salut {profile.name} 👋</h1>
      <p className="text-muted mb-10">Prêt(e) à peser le morceau ?</p>

      <div className="mt-auto flex flex-col gap-3.5">
        <BigButton label="Nouvelle mesure" icon="📸" onClick={startMeasure} />
        <BigButton
          label="Historique"
          icon="🕓"
          variant="outline"
          onClick={() => router.push('/history')}
        />
        <BigButton
          label="Statistiques"
          icon="📊"
          variant="outline"
          onClick={() => router.push('/stats')}
        />
        <BigButton
          label="Classement entre amis"
          icon="🏆"
          variant="outline"
          onClick={() => router.push('/leaderboard')}
        />
      </div>
    </main>
  );
}
