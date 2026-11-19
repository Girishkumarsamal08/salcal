import { createWorker } from 'tesseract.js';
import { parseSalarySlipText } from './salary-extractor';
import { ExtractedSalaryData } from '../tax/types';

export interface OCRProgressCallback {
  (progress: number, status: string): void;
}

/**
 * Performs OCR on image files (PNG, JPG, JPEG) in the browser
 */
export async function performClientOCR(
  imageFile: File | Blob,
  onProgress?: OCRProgressCallback
): Promise<{ text: string; parsedData: ExtractedSalaryData }> {
  try {
    if (onProgress) onProgress(10, 'Initializing OCR engine...');

    const worker = await createWorker('eng');

    if (onProgress) onProgress(40, 'Scanning salary slip...');

    const ret = await worker.recognize(imageFile);
    const text = ret.data.text || '';

    if (onProgress) onProgress(85, 'Extracting salary components...');

    await worker.terminate();

    if (onProgress) onProgress(100, 'Extraction complete!');

    const parsedData = parseSalarySlipText(text);

    return { text, parsedData };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'OCR recognition failed';
    throw new Error(`OCR processing error: ${msg}`);
  }
}
