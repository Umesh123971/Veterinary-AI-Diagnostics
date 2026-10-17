import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const ResearchDisclaimer = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 text-xs ${className}`}>
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span><strong>AI Research Prototype:</strong> Final interpretation must be performed by a qualified veterinary professional.</span>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-700 shadow-md ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            AI-Assisted Veterinary Decision-Support System
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-mono rounded">
              Research Prototype
            </span>
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            This deep learning multi-modal framework synthesizes microscopic image analysis and CBC hematology fusion for research decision support. 
            All generated disease predictions, parasitemia estimates, and confidence scores are decision-support indicators and must be validated by a licensed veterinary practitioner.
          </p>
        </div>
      </div>
    </div>
  );
};
