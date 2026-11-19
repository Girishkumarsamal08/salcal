import { NextRequest, NextResponse } from 'next/server';
import { parseSalarySlipText } from '@/lib/extraction/salary-extractor';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawText = formData.get('rawText') as string | null;

    if (rawText && rawText.trim().length > 0) {
      const parsed = parseSalarySlipText(rawText);
      return NextResponse.json({ success: true, data: parsed, extractedText: rawText });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file or text provided' }, { status: 400 });
    }

    const fileType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = '';

    if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParseModule = require('pdf-parse');
        if (pdfParseModule.PDFParse) {
          const parser = new pdfParseModule.PDFParse(new Uint8Array(buffer));
          const pdfResult = await parser.getText();
          extractedText = pdfResult.text || pdfResult || '';
        } else if (typeof pdfParseModule === 'function') {
          const pdfData = await pdfParseModule(buffer);
          extractedText = pdfData.text || '';
        }
      } catch (pdfErr) {
        console.warn('PDF parsing error, falling back to basic buffer string extraction:', pdfErr);
        // Fallback: extract visible ASCII text from PDF streams
        extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ');
      }
    } else {
      // For images, when running in server environment or if client sends text
      return NextResponse.json({
        success: false,
        error: 'Please use client-side OCR for image processing or upload a text/PDF salary slip.',
        needsClientOCR: true,
      });
    }

    const parsedData = parseSalarySlipText(extractedText);
    return NextResponse.json({
      success: true,
      data: parsedData,
      extractedText: extractedText.slice(0, 1000), // snippet for verification
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error during extraction';
    console.error('Extraction error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
