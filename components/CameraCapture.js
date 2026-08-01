'use client';

import { useEffect, useRef, useState } from 'react';
import { readWeightFromCanvas } from '../lib/ocr';

// Zone de cadrage normalisée où l'utilisateur doit placer l'écran
// de la balance. Un rectangle centré, large, pas trop haut.
const SCAN_ZONE = { left: 0.12, top: 0.4, width: 0.76, height: 0.18 };

export default function CameraCapture({ label, onConfirmed }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const busyRef = useRef(false);
  const recentRef = useRef([]);

  const [hint, setHint] = useState('Place la balance dans le cadre…');
  const [confirmedWeight, setConfirmedWeight] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      startLoop();
    } catch (err) {
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifie les autorisations du navigateur."
      );
    }
  }

  function stopCamera() {
    clearInterval(loopRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function startLoop() {
    loopRef.current = setInterval(captureAndRead, 900);
  }

  async function captureAndRead() {
    if (busyRef.current || confirmedWeight !== null) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    busyRef.current = true;
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);

      const reading = await readWeightFromCanvas(canvas, SCAN_ZONE);

      if (!reading.isValid) {
        setHint('Place la balance dans le cadre…');
        return;
      }

      const recent = recentRef.current;
      recent.push(reading.weightKg);
      if (recent.length > 3) recent.shift();

      if (recent.length >= 2) {
        const last = recent[recent.length - 1];
        const prev = recent[recent.length - 2];
        if (Math.abs(last - prev) <= 0.05) {
          clearInterval(loopRef.current);
          setConfirmedWeight(last);
          setHint(null);
          return;
        }
      }
      setHint('Stabilisation…');
    } catch (err) {
      // frame ratée, on retente à la prochaine
    } finally {
      busyRef.current = false;
    }
  }

  function retry() {
    recentRef.current = [];
    setConfirmedWeight(null);
    setHint('Place la balance dans le cadre…');
    startLoop();
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => window.history.back()} className="text-white text-2xl px-2">
          ×
        </button>
        <p className="text-white font-semibold">{label}</p>
        <span className="w-8" />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {cameraError ? (
          <div className="flex items-center justify-center h-full px-8 text-center text-white/80">
            {cameraError}
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            <div
              className="absolute border-2 border-primary rounded-2xl"
              style={{
                left: `${SCAN_ZONE.left * 100}%`,
                top: `${SCAN_ZONE.top * 100}%`,
                width: `${SCAN_ZONE.width * 100}%`,
                height: `${SCAN_ZONE.height * 100}%`,
                boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)',
              }}
            />
            {hint && (
              <div className="absolute bottom-6 left-6 right-6 bg-black/60 text-white text-center py-2.5 rounded-xl text-sm">
                {hint}
              </div>
            )}
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="p-5">
        {confirmedWeight !== null ? (
          <div className="card">
            <p className="text-muted text-sm text-center">Poids {label.toLowerCase()} détecté</p>
            <p className="text-4xl font-bold text-center my-2">
              {confirmedWeight.toFixed(2).replace('.', ',')} kg
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={retry} className="big-btn big-btn-outline flex-1">
                Reprendre
              </button>
              <button
                onClick={() => onConfirmed(confirmedWeight)}
                className="big-btn big-btn-primary flex-1"
              >
                Valider
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white/70 text-sm text-center">
            Capture automatique dès que c&apos;est stable.
          </p>
        )}
      </div>
    </div>
  );
}
