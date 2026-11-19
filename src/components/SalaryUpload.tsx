'use client';

import React, { useState, useRef } from 'react';
import { ExtractedSalaryData } from '@/lib/tax/types';
import { performClientOCR } from '@/lib/extraction/ocr-service';
import { parseSalarySlipText } from '@/lib/extraction/salary-extractor';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Clipboard,
  ArrowRight,
  Download,
  Sparkles,
} from 'lucide-react';

interface SalaryUploadProps {
  onExtractionComplete: (data: ExtractedSalaryData, rawSnippet?: string) => void;
  onSwitchToManual: () => void;
}

const SAMPLE_SLIP_TEXT = `TECHFLOW SOLUTIONS PRIVATE LIMITED
PAYSLIP FOR OCTOBER 2024
Employee Name: Rohan S. Deshmukh (TF-89420)
Designation: Senior Software Engineer
Location: Bengaluru (Metro)

EARNINGS:
Basic Salary: 55,000
House Rent Allowance (HRA): 27,500
Special Allowance: 32,000
Leave Travel Allowance (LTA): 5,000
Performance Bonus: 15,000
Total Gross Salary: 1,34,500

DEDUCTIONS:
Employee Provident Fund (EPF): 6,600
Employer PF Contribution: 6,600
Professional Tax (PT): 200
Income Tax (TDS): 8,500
Net Pay: 1,19,200`;

export function SalaryUpload({ onExtractionComplete, onSwitchToManual }: SalaryUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPercent(15);
    setProcessingStatus(`Analyzing ${file.name}...`);

    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // PDF Processing via server route
        setProcessingStatus('Extracting text from PDF salary slip...');
        setProgressPercent(45);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/extract-salary', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to extract text from PDF');
        }

        setProgressPercent(100);
        setProcessingStatus('Extraction complete!');
        setTimeout(() => {
          onExtractionComplete(result.data, result.extractedText);
        }, 300);
      } else if (
        fileType.startsWith('image/') ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg')
      ) {
        // Image OCR via Tesseract.js in browser
        setProcessingStatus('Initializing OCR engine for salary slip image...');
        const { text, parsedData } = await performClientOCR(file, (pct, status) => {
          setProgressPercent(pct);
          setProcessingStatus(status);
        });

        setTimeout(() => {
          onExtractionComplete(parsedData, text.slice(0, 500));
        }, 300);
      } else {
        throw new Error('Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG file.');
      }
    } catch (err: unknown) {
      console.error('File extraction error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to process document';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  // Instant test with the generated sample PDF
  const handleTestWithSamplePDF = async () => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Loading sample salary slip PDF...');
      setProgressPercent(20);

      const response = await fetch('/sample-salary-slip.pdf');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'sample-salary-slip.pdf', { type: 'application/pdf' });
      await handleFileProcess(sampleFile);
    } catch (err) {
      console.error(err);
      // Fallback to text parsing
      const parsed = parseSalarySlipText(SAMPLE_SLIP_TEXT);
      onExtractionComplete(parsed, SAMPLE_SLIP_TEXT);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handlePastedTextSubmit = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please paste your salary slip text first.');
      return;
    }
    setIsProcessing(true);
    setProcessingStatus('Analyzing salary components...');
    setProgressPercent(80);

    setTimeout(() => {
      const parsed = parseSalarySlipText(pastedText);
      setProgressPercent(100);
      onExtractionComplete(parsed, pastedText.slice(0, 500));
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Sample Slip Quick Action Banner */}
      <div className="mb-4 p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-purple-900 font-medium">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Need a test salary slip? Use our pre-generated Indian tech company payslip.</span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <a
            href="/sample-salary-slip.pdf"
            download="TechFlow-Salary-Slip.pdf"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-100/50 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Download PDF</span>
          </a>
          <button
            type="button"
            onClick={handleTestWithSamplePDF}
            disabled={isProcessing}
            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors shadow-2xs"
          >
            <span>Auto-Upload & Parse</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50 p-2 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
              <span>Upload Document</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5 text-purple-600" />
              <span>Paste Text</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onSwitchToManual}
            className="text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors"
          >
            Skip to Manual Entry &rarr;
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'upload' ? (
            <div>
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-purple-500 hover:bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={isProcessing}
                />

                {isProcessing ? (
                  <div className="py-6 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-slate-900 mb-1">{processingStatus}</p>
                    <div className="w-48 bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 font-mono">{progressPercent}%</span>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                      <UploadCloud className="w-7 h-7" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      Drop your salary slip here, or <span className="text-purple-600">browse</span>
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                      Supports PDF, PNG, JPG, or JPEG salary slips. Your documents are processed in-memory and never stored.
                    </p>

                    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-rose-500" /> PDF Document
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> PNG / JPG Image
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste Salary Slip Content
                </label>
                <button
                  type="button"
                  onClick={() => setPastedText(SAMPLE_SLIP_TEXT)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-800"
                >
                  Load Sample Payslip Text
                </button>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the text from your monthly pay slip here (e.g. Basic Salary: 55,000, HRA: 27,500, Special Allowance: 32,000, PF: 6,600)..."
                rows={7}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-800 placeholder:text-slate-400"
              />
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handlePastedTextSubmit}
                  disabled={isProcessing || !pastedText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Parse Salary Components</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to process document</p>
                <p className="text-rose-700 mt-0.5">{errorMessage}</p>
                <button
                  type="button"
                  onClick={onSwitchToManual}
                  className="mt-1.5 font-bold text-rose-900 underline hover:no-underline"
                >
                  Switch to manual entry instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
