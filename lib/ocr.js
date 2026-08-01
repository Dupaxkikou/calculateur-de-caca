import { createWorker } from 'tesseract.js';

let workerPromise = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng', 1, {}).then(async (worker) => {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.,',
        tessedit_pageseg_mode: '7',
      });
      return worker;
    });
  }
  return workerPromise;
}

export function preloadOcr() {
  return getWorker();
}

const MAX_CROP_WIDTH = 320;

export async function readWeightFromCanvas(sourceCanvas, scanZone) {
  const { left, top, width, height } = scanZone;
  const sw = sourceCanvas.width;
  const sh = sourceCanvas.height;

  const rawCropWidth = Math.round(width * sw);
  const rawCropHeight = Math.round(height * sh);
  const scale = Math.min(1, MAX_CROP_WIDTH / rawCropWidth);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.round(rawCropWidth * scale);
  cropCanvas.height = Math.round(rawCropHeight * scale);
  const ctx = cropCanvas.getContext('2d');
  ctx.drawImage(
    sourceCanvas,
    Math.round(left * sw),
    Math.round(top * sh),
    rawCropWidth,
    rawCropHeight,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  const worker = await getWorker();
  const { data } = await worker.recognize(cropCanvas);
  const weightKg = extractWeight(data.text);

  return {
    weightKg,
    rawText: data.text.trim(),
    isValid: weightKg !== null && weightKg > 0 && weightKg < 300,
  };
}

function extractWeight(text) {
  const cleaned = text.replace(',', '.').replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const match = cleaned.match(/^\d{1,3}(\.\d{1,2})?/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  return Number.isNaN(value) ? null : value;
}

export async function terminateOcr() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
