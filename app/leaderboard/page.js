'use client';

import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <main className="px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-2xl">
          ←
        </button>
        <h1 className="text-xl font-bold">Classement entre amis</h1>
      </div>

      <div className="card text-center py-10">
        <div className="text-5xl mb-4">🏆</div>
        <p className="font-bold text-lg mb-2">Bientôt disponible</p>
        <p className="text-muted text-sm">
          Ajoute des amis et compare vos records. Cette fonctionnalité arrive après le MVP.
        </p>
        <div className="flex justify-center gap-2 mt-6">
          <span className="px-3 py-1.5 rounded-full bg-[#CFE9D9] text-sm font-semibold">
            100 g
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#9BD9B6] text-sm font-semibold">
            250 g
          </span>
          <span className="px-3 py-1.5 rounded-full bg-gold text-sm font-semibold">500 g</span>
        </div>
      </div>
    </main>
  );
}
