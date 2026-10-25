import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../api';
import type { DocType } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocType>('SALE_DEED');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setUploadError(null);
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validExtensions.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
      setUploadError('Invalid file type. Please upload a JPG, PNG, or PDF document.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File exceeds the 20MB maximum size limit.');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: DocType }) => {
      // Simulate stepped progress bar
      for (let p = 15; p <= 90; p += 25) {
        setUploadProgress(p);
        await new Promise((r) => setTimeout(r, 120));
      }
      const res = await api.uploadDocument(file, type);
      setUploadProgress(100);
      return res;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setTimeout(() => {
        navigate(`/documents/${newDoc.document.id}`);
      }, 500);
    },
    onError: (err: any) => {
      setUploadProgress(0);
      setUploadError(err.message || 'Failed to upload document');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a document file to proceed.');
      return;
    }
    uploadMutation.mutate({ file: selectedFile, type: docType });
  };

  const loadSampleDocument = async () => {
    try {
      const response = await fetch('/mock/rtc_sample.jpg');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'rtc_sample.jpg', { type: 'image/jpeg' });
      setDocType('SALE_DEED');
      handleFile(sampleFile);
    } catch {
      setUploadError('Failed to load sample document.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {language === 'kn' ? 'ಭೂ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Land Records'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'kn'
            ? 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಆರ್‌ಟಿಸಿ (ಪಹಣಿ), ಕ್ರಯಪತ್ರ ಅಥವಾ ಇ-ಮುದ್ರಾಂಕ ಪತ್ರಗಳನ್ನು ಒಸಿಆರ್ ಮತ್ತು ಮೌಲ್ಯೀಕರಣಕ್ಕಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ'
            : 'Upload scanned RTC, Sale Deed, or e-Stamp documents for automated OCR text extraction and rule validation.'}
        </p>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Classification Select */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {language === 'kn' ? 'ದಾಖಲೆಯ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ' : '1. Select Document Classification'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                type: 'RTC' as DocType,
                title: 'RTC (Pahani)',
                subtitle: 'Record of Rights, Tenancy & Crops',
                badge: 'ಭೂಮಿ (Bhoomi)',
              },
              {
                type: 'SALE_DEED' as DocType,
                title: 'Agreement of Sale / Deed',
                subtitle: 'Sale Deed & Conveyance papers',
                badge: 'ಕಾವೇರಿ (Kaveri)',
              },
              {
                type: 'ESTAMP' as DocType,
                title: 'e-Stamp Certificate',
                subtitle: 'Karnataka non-judicial stamp paper',
                badge: 'e-Stamp',
              },
            ].map((item) => (
              <div
                key={item.type}
                onClick={() => setDocType(item.type)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  docType === item.type
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900">{item.title}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'kn' ? 'ಕಡತವನ್ನು ಲಗತ್ತಿಸಿ' : '2. Attach Document File'}
            </label>
            <button
              type="button"
              onClick={loadSampleDocument}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use Sample RTC Scan</span>
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/60'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {language === 'kn'
                ? 'ಕಡತವನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ, ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ'
                : 'Click to select or drag and drop your document scan'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports high-resolution JPG, PNG, and PDF up to 20MB (300 DPI recommended)
            </p>
          </div>

          {/* Selected File Card Preview */}
          {selectedFile && (
            <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-md border border-slate-300 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                disabled={uploadMutation.isPending}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition shrink-0"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Progress Bar */}
          {uploadMutation.isPending && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading & Running OCR Preprocessing...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedFile || uploadMutation.isPending}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-xs sm:text-sm font-semibold shadow-xs transition ${
              !selectedFile || uploadMutation.isPending
                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Record...</span>
              </>
            ) : (
              <>
                <span>Digitize & Inspect</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
