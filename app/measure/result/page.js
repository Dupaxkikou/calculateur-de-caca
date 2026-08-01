'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BigButton from '../../../components/BigButton';
import { resetPendingMeasurement } from '../../../lib/store';

function funMessage(diffGrams) {
  if (diffGrams >= 500) return 'Grosse performance aujourd\'hui 🏆';
  if (diffGrams >= 250) return 'Beau résultat, respect 👏';
  if (diffGrams >= 100) return 'Petite victoire du jour 🙂';
  if (diffGrams > 0) return 'Chaque gramme compte.';
  return 'Rien à signaler, ça arrive 🤷';
}

export default function ResultPage() {
  const router = useRouter();
  const [measurement, setMeasurement] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('cc_last_result');
    if (!raw) {
      router.replace('/home');
      return;
    }
    setMeasurement(JSON.parse(raw));
  }, [router]);

  if (!measurement) return null;

  const diff = Math.abs(measurement.diffGrams);

  function share() {
    const text = `Je viens de perdre ${diff} g au petit coin 💩 (Calculateur de Caca)`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Copié dans le presse-papier !');
    }
  }

  function backHome() {
    resetPendingMeasurement();
    router.push('/home');
  }

  return (
    <main className="px-6 py-10 flex flex-col min-h-screen items-center text-center">
      <div className="flex-1" />
      <div className="text-6xl animate-bounce">🎉💩</div>
      <p className="text-5xl font-bold text-primaryDark mt-4">{diff} g</p>
      <p className="text-muted mt-1">{funMessage(diff)}</p>

      <div className="flex items-center gap-3 mt-8 w-full">
        <div className="card flex-1">
          <p className="text-muted text-sm">Avant</p>
          <p className="font-semibold text-lg">
            {measurement.weightBeforeKg.toFixed(2).replace('.', ',')} kg
          </p>
        </div>
        <span className="text-muted">→</span>
        <div className="card flex-1">
          <p className="text-muted text-sm">Après</p>
          <p className="font-semibold text-lg">
            {measurement.weightAfterKg.toFixed(2).replace('.', ',')} kg
          </p>
        </div>
      </div>

      <div className="flex-1" />

      <div className="w-full flex flex-col gap-3">
        <BigButton label="Partager" icon="📤" onClick={share} />
        <BigButton
          label="Voir mes statistiques"
          icon="📊"
          variant="outline"
          onClick={() => router.push('/stats')}
        />
        <BigButton label="Retour à l'accueil" icon="🏠" variant="outline" onClick={backHome} />
      </div>
    </main>
  );
}
