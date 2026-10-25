import React from 'react';
import type { DocumentStatus } from '../../types';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    PROCESSING: {
      label: 'Processing',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Loader2,
      spin: true,
    },
    NEEDS_REVIEW: {
      label: 'Needs Review',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
      spin: false,
    },
    VALIDATED: {
      label: 'Validated',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      spin: false,
    },
    REJECTED: {
      label: 'Rejected',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      spin: false,
    },
  }[status] || {
    label: status,
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: AlertCircle,
    spin: false,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses}`}
      role="status"
    >
      <Icon className={`w-3.5 h-3.5 ${config.spin ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

