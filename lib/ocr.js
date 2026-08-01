import { createWorker } from 'tesseract.js';

let workerPromise = null;

/**
 * Le worker Tesseract est coûteux à créer (téléchargement du modèle de
 * langue). On le garde en singleton et on le réutilise pour chaque
 * lecture, avant ET après, dans la même session.
 */
function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng', 1, {
      // whitelist chiffres/virgule/point : réduit les erreurs et accélère
      // la reconnaissance sur un afficheur de balance.
    }).then(async (worker) => {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.,',
      });
      return worker;
    });
  }
  return workerPromise;
}

/**
 * Découpe le canvas source sur la zone de scan (coordonnées normalisées
 * 0..1) puis lance l'OCR uniquement sur ce recadrage. Limite drastiquement
 * les faux positifs et accélère la reconnaissance par rapport à une
 * lecture de l'image entière.
 */
export async function readWeightFromCanvas(sourceCanvas, scanZone) {
  const { left, top, width, height } = scanZone;
  const sw = sourceCanvas.width;
  const sh = sourceCanvas.height;

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.round(width * sw);
  cropCanvas.height = Math.round(height * sh);
  const ctx = cropCanvas.getContext('2d');
  ctx.drawImage(
    sourceCanvas,
    Math.round(left * sw),
    Math.round(top * sh),
    Math.round(width * sw),
    Math.round(height * sh),
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

/** Extrait un nombre du type 72.45 / 72,45 depuis le texte OCR brut. */
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
