import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-800 border-blue-200 font-semibold',
    accent: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    danger: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
    outline: 'bg-transparent text-slate-600 border-slate-300'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
};

export const MatchBadge = ({ percentage = 0, isEligible = true }) => {
  if (isEligible && percentage === 100) {
    return (
      <Badge variant="success" className="px-3 py-1 text-xs shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        100% Eligible
      </Badge>
    );
  }

  if (isEligible) {
    return (
      <Badge variant="success" className="px-3 py-1 text-xs">
        {percentage}% Match (Eligible)
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className="px-3 py-1 text-xs">
      {percentage}% Match (Not Eligible)
    </Badge>
  );
};
