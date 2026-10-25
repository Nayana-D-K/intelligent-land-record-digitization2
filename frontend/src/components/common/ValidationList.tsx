import React from 'react';
import type { ValidationResult, ValidationSeverity } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface ValidationListProps {
  validations: ValidationResult[];
  onSelectField?: (fieldKey: string) => void;
}

export const ValidationList: React.FC<ValidationListProps> = ({
  validations,
  onSelectField,
}) => {
  if (!validations || validations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        No validation checks recorded for this document.
      </div>
    );
  }

  const failCount = validations.filter((v) => v.severity === 'FAIL').length;
  const warnCount = validations.filter((v) => v.severity === 'WARN').length;
  const passCount = validations.filter((v) => v.severity === 'PASS').length;

  const severityConfig: Record<
    ValidationSeverity,
    { label: string; bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    FAIL: {
      label: 'FAIL',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      icon: XCircle,
    },
    WARN: {
      label: 'WARN',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: AlertTriangle,
    },
    PASS: {
      label: 'PASS',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: CheckCircle2,
    },
  };

  return (
    <div className="space-y-3">
      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs font-medium pb-2 border-b border-slate-200">
        <span className="text-slate-600">Rule Validation Results</span>
        <div className="flex items-center gap-2">
          {failCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-[11px]">
              {failCount} Fail
            </span>
          )}
          {warnCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
              {warnCount} Warn
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
            {passCount} Pass
          </span>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {validations.map((v, idx) => {
          const config = severityConfig[v.severity] || severityConfig.PASS;
          const Icon = config.icon;

          return (
            <div
              key={`${v.rule_id}-${idx}`}
              className={`p-3 rounded-lg border ${config.bg} ${config.border} transition-all`}
            >
              <div className="flex items-start gap-2.5">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold tracking-wide text-slate-700">
                      {v.rule_id}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${config.border} ${config.text}`}
                    >
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {v.message}
                  </p>

                  {/* Related Field tags */}
                  {v.field_keys && v.field_keys.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-medium">Fields:</span>
                      {v.field_keys.map((fk) => (
                        <button
                          key={fk}
                          type="button"
                          onClick={() => onSelectField && onSelectField(fk)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                          title={`Focus field: ${fk}`}
                        >
                          <span>{fk}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

