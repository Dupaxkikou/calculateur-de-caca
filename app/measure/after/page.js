'use client';

import { useRouter } from 'next/navigation';
import CameraCapture from '../../../components/CameraCapture';
import { getActiveProfile, getPendingMeasurement, setPendingMeasurement } from '../../../lib/store';
import { saveMeasurement } from '../../../lib/firestore';

export default function MeasureAfterPage() {
  const router = useRouter();

  async function handleConfirmed(weightKg) {
    const profile = getActiveProfile();
    const pending = getPendingMeasurement();
    if (!profile || pending.weightBeforeKg == null) {
      router.replace('/home');
      return;
    }

    setPendingMeasurement({ weightAfterKg: weightKg });

    const measurement = await saveMeasurement({
      profileId: profile.id,
      weightBeforeKg: pending.weightBeforeKg,
      weightAfterKg: weightKg,
    });

    sessionStorage.setItem('cc_last_result', JSON.stringify(measurement));
    router.push('/measure/result');
  }

  return <CameraCapture label="Après" onConfirmed={handleConfirmed} />;
}
