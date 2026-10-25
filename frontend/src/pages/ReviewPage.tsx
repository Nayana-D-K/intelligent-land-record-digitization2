import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import api from '../api';
import type { DocumentField } from '../types';
import { BoundingBoxOverlay } from '../components/common/BoundingBoxOverlay';
import { FieldRow } from '../components/common/FieldRow';
import { ValidationList } from '../components/common/ValidationList';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { useLanguage } from '../context/LanguageContext';

export const ReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState<boolean>(false);

  // Fetch document detail
  const {
    data: docDetail,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['document', id],
    queryFn: () => (id ? api.getDocumentById(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  // Initialize edited field values once document data loads
  useEffect(() => {
    if (docDetail?.fields) {
      const initialMap: Record<string, string> = {};
      docDetail.fields.forEach((f) => {
        initialMap[f.key] = f.value;
      });
      setFieldValues(initialMap);
      setHasUnsavedChanges(false);

      // Select first low confidence field by default
      const firstLow = docDetail.fields.find((f) => f.needs_review || f.confidence < 0.70);
      if (firstLow) {
        setSelectedFieldKey(firstLow.key);
      } else if (docDetail.fields.length > 0) {
        setSelectedFieldKey(docDetail.fields[0].key);
      }
    }
  }, [docDetail]);

  // Mutations
  const updateFieldsMutation = useMutation({
    mutationFn: (values: Record<string, string>) => {
      if (!id) throw new Error('No document ID');
      return api.updateFields(id, { fields: values });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['document', id], updated);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setHasUnsavedChanges(false);
      setSaveSuccessMsg('Corrections saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (override: boolean) => {
      if (!id) throw new Error('No document ID');
      return api.approveDocument(id, { override_failures: override });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['document', id], updated);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setIsOverrideModalOpen(false);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => {
      if (!id) throw new Error('No document ID');
      return api.rejectDocument(id, { reason });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['document', id], updated);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setIsRejectModalOpen(false);
      setRejectReason('');
    },
  });

  // Low confidence keyboard navigation
  const jumpToNextLowConfidence = () => {
    if (!docDetail?.fields) return;
    const reviewFields = docDetail.fields.filter((f) => f.needs_review || f.confidence < 0.80);
    if (reviewFields.length === 0) return;

    const currentIndex = reviewFields.findIndex((f) => f.key === selectedFieldKey);
    const nextIndex = (currentIndex + 1) % reviewFields.length;
    setSelectedFieldKey(reviewFields[nextIndex].key);
  };

  // Keyboard shortcut listener: Alt+N or Tab to cycle low confidence fields
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'n') || (e.key === 'Tab' && e.shiftKey && e.altKey)) {
        e.preventDefault();
        jumpToNextLowConfidence();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docDetail, selectedFieldKey]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
          <div className="bg-slate-200 rounded-xl"></div>
          <div className="bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !docDetail) {
    return (
      <div className="p-12 text-center max-w-md mx-auto my-12 bg-white rounded-xl border border-slate-200 shadow-sm">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Document Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {error instanceof Error ? error.message : `Document '${id}' could not be loaded.`}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const { document, fields, validation } = docDetail;
  const failValidations = validation.filter((v) => v.severity === 'FAIL');
  const hasFails = failValidations.length > 0;
  const isApproved = document.status === 'VALIDATED';
  const isRejected = document.status === 'REJECTED';

  const handleFieldValueChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleRevertField = (field: DocumentField) => {
    setFieldValues((prev) => ({ ...prev, [field.key]: field.original_value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    updateFieldsMutation.mutate(fieldValues);
  };

  const handleApproveClick = () => {
    if (hasFails) {
      setIsOverrideModalOpen(true);
    } else {
      approveMutation.mutate(false);
    }
  };

  // Merge local state values into fields array for display
  const mergedFields = fields.map((f) => ({
    ...f,
    value: fieldValues[f.key] !== undefined ? fieldValues[f.key] : f.value,
  }));

  const lowConfidenceCount = fields.filter((f) => f.needs_review || f.confidence < 0.80).length;

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Top Workbench Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Back & Document Meta */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Return to Documents"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  {document.filename}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {document.id}
                </span>
                <StatusBadge status={document.status} size="sm" />
                <ConfidenceBadge confidence={document.overall_confidence} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {document.doc_type} • OCR: {document.ocr_engine} • Preprocess: {document.preprocessing}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Keyboard helper button */}
            {lowConfidenceCount > 0 && (
              <button
                type="button"
                onClick={jumpToNextLowConfidence}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition"
                title="Shortcut: Alt+N"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Next Low Conf ({lowConfidenceCount})</span>
              </button>
            )}

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || updateFieldsMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <Save className={`w-3.5 h-3.5 ${updateFieldsMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{hasUnsavedChanges ? 'Save Corrections' : 'Saved'}</span>
            </button>

            {/* Reject Button */}
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isRejected || rejectMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            {/* Approve Button */}
            <button
              type="button"
              onClick={handleApproveClick}
              disabled={isApproved || approveMutation.isPending}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                  : hasFails
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={hasFails ? 'Warning: Document has unresolved validation failures' : 'Approve and validate'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isApproved ? 'Approved' : hasFails ? 'Approve with Override' : 'Approve'}</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            {saveSuccessMsg}
          </div>
        )}
      </div>

      {/* Main 2-Panel Workbench Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Panel: Document Viewer with Bounding Boxes */}
        <div className="lg:col-span-7 h-[50vh] lg:h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Document Page Preview</span>
            <span className="text-[11px] text-slate-500">Click any box to inspect & edit field</span>
          </div>
          <div className="flex-1 min-h-0">
            <BoundingBoxOverlay
              imageUrl={document.image_url}
              fields={mergedFields}
              selectedFieldKey={selectedFieldKey}
              onSelectField={(key) => setSelectedFieldKey(key)}
            />
          </div>
        </div>

        {/* Right Panel: Fields form & Validation checks */}
        <div className="lg:col-span-5 h-[50vh] lg:h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Tabs / Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {language === 'kn' ? 'ಕ್ಷೇತ್ರ ದತ್ತಾಂಶ ಮತ್ತು ಮೌಲ್ಯೀಕರಣ' : 'Extracted Fields & Rules'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {fields.length} extracted fields • {validation.length} rule checks
              </p>
            </div>
            {hasUnsavedChanges && (
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Unsaved Edits
              </span>
            )}
          </div>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Form Fields Section */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Extracted Fields ({mergedFields.length})
              </span>
              <div className="space-y-2.5">
                {mergedFields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    isSelected={selectedFieldKey === field.key}
                    onSelect={() => setSelectedFieldKey(field.key)}
                    onChange={(val) => handleFieldValueChange(field.key, val)}
                    onRevert={() => handleRevertField(field)}
                  />
                ))}
              </div>
            </div>

            {/* Validation Rules Section */}
            <div className="pt-2 border-t border-slate-200">
              <ValidationList
                validations={validation}
                onSelectField={(key) => setSelectedFieldKey(key)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600 mb-3">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Reject Land Record</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Please state the justification for rejecting this document (e.g. illegible scan, mismatched survey number, tampering).
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate(rejectReason)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Approval Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-amber-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Confirm Override Approval</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-3">
              This document contains unresolved validation errors:
            </p>

            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {failValidations.map((v) => (
                <div key={v.rule_id} className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <span className="font-bold">{v.rule_id}:</span> {v.message}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              As an authorized revenue officer, you can override these rule failures and validate the document for the official land record index.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => approveMutation.mutate(true)}
                disabled={approveMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-xs"
              >
                Confirm Override & Validate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
