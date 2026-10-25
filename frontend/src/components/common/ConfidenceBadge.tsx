import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  size = 'md',
  showLabel = true,
}) => {
  const percent = Math.round(confidence * 100);

  // Categorize
  let colorStyles = '';
  let Icon = ShieldCheck;
  let level = 'High';

  if (confidence >= 0.85) {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = ShieldCheck;
    level = 'High';
  } else if (confidence >= 0.70) {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertCircle;
    level = 'Medium';
  } else {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = AlertTriangle;
    level = 'Low';
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-2.5 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${colorStyles} ${sizeClasses[size]}`}
      title={`Confidence: ${percent}% (${level})`}
      aria-label={`Confidence ${percent}% (${level})`}
    >
      <Icon className={iconSizes[size]} aria-hidden="true" />
      <span>{percent}%</span>
      {showLabel && (
        <span className="opacity-75 font-normal hidden sm:inline">({level})</span>
      )}
    </span>
  );
};

