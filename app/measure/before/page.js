'use client';

import { useRouter } from 'next/navigation';
import CameraCapture from '../../../components/CameraCapture';
import { setPendingMeasurement } from '../../../lib/store';

export default function MeasureBeforePage() {
  const router = useRouter();

  function handleConfirmed(weightKg) {
    setPendingMeasurement({ weightBeforeKg: weightKg });
    router.push('/measure/after');
  }

  return <CameraCapture label="Avant" onConfirmed={handleConfirmed} />;
}
