import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    
    // Status mappings
    'New': 'bg-sky-50 text-sky-700 border-sky-200',
    'Awaiting Diagnosis': 'bg-purple-50 text-purple-700 border-purple-200',
    'Processing': 'bg-amber-50 text-amber-700 border-amber-200',
    'Diagnosis Complete': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Doctor Review': 'bg-blue-50 text-blue-700 border-blue-200',
    'Re-diagnosis Requested': 'bg-rose-50 text-rose-700 border-rose-200',
    
    // CBC Status
    'Low': 'bg-amber-50 text-amber-700 border-amber-200',
    'Normal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'High': 'bg-rose-50 text-rose-700 border-rose-200',
    
    // Diagnosis result
    'Positive': 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    'Negative': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const styleClass = variants[children] || variants[variant] || variants.neutral;

  return (
    <span className={`inline-flex items-center rounded-full border ${sizes[size]} ${styleClass} ${className}`}>
      {children}
    </span>
  );
};
