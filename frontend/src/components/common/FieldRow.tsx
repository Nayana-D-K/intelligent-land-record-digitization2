import React, { useRef, useEffect } from 'react';
import type { DocumentField } from '../../types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, RotateCcw, Check } from 'lucide-react';

interface FieldRowProps {
  field: DocumentField;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange: (value: string) => void;
  onRevert?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  field,
  isSelected = false,
  onSelect,
  onChange,
  onRevert,
}) => {
  const { language } = useLanguage();
  const internalInputRef = useRef<HTMLInputElement>(null);
  const isEdited = field.value !== field.original_value;

  useEffect(() => {
    if (isSelected && internalInputRef.current) {
      internalInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      internalInputRef.current.focus();
    }
  }, [isSelected]);

  const primaryLabel = language === 'kn' ? field.label_kn || field.label_en : field.label_en;
  const secondaryLabel = language === 'kn' ? field.label_en : field.label_kn;

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-lg border transition-all duration-150 ${
        isSelected
          ? 'bg-blue-50/60 border-blue-500 shadow-sm ring-1 ring-blue-500'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <label
            htmlFor={`field-${field.key}`}
            className="text-xs font-semibold text-slate-800"
          >
            {primaryLabel}
          </label>
          {secondaryLabel && (
            <span className="text-[11px] text-slate-600 font-normal">
              ({secondaryLabel})
            </span>
          )}

          {field.needs_review && !isEdited && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
              title="Flagged for manual verification"
            >
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Needs Review
            </span>
          )}

          {isEdited && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600" />
              Edited
            </span>
          )}
        </div>

        <ConfidenceBadge confidence={field.confidence} size="sm" showLabel={false} />
      </div>

      <div className="relative mt-1">
        <input
          id={`field-${field.key}`}
          ref={internalInputRef}
          type="text"
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onSelect}
          className={`w-full text-sm font-medium px-3 py-1.5 rounded-md border outline-none transition-colors ${
            isEdited
              ? 'border-emerald-400 bg-emerald-50/30 text-emerald-950 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
              : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
          placeholder={`Enter ${primaryLabel}...`}
        />
      </div>

      {isEdited && (
        <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-100 rounded px-2.5 py-1 text-slate-600">
          <div className="truncate mr-2">
            <span className="font-medium text-slate-500">Original OCR: </span>
            <span className="font-mono text-slate-700">{field.original_value || '(empty)'}</span>
          </div>
          {onRevert && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRevert();
              }}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium shrink-0 ml-1"
              title="Reset to original OCR value"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

