import React from 'react';
import { Microscope, FileBarChart2, Cpu, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';

export const FusionResultCard = ({ patient }) => {
  if (!patient) return null;

  const fusion = patient.fusionDetails || {
    visualWeight: 0.65,
    hematologicalWeight: 0.35,
    fusionScore: 0.942,
    fusionExplanation: 'Deep late-fusion decision layer combined visual merozoites (65%) and anemic CBC indicators (35%).'
  };

  const isPositive = !patient.primaryPrediction?.toLowerCase().includes('negative') && 
    (patient.primaryPrediction?.toLowerCase().includes('positive') || patient.primaryPrediction?.toLowerCase().includes('babesiosis'));

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
            Late-Fusion Decision Layer Output
          </span>
          <h3 className="text-xl font-bold text-white mt-1">Multi-Modal Fusion Assessment</h3>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isPositive ? 'Positive' : 'Negative'} size="lg">
            {patient.primaryPrediction}
          </Badge>
          <span className="text-xl font-extrabold text-teal-400 font-mono">
            {patient.overallConfidence}% <span className="text-xs text-slate-400 font-sans font-normal">Confidence</span>
          </span>
        </div>
      </div>

      {/* Visual Fusion Flow Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Modality 1: Image Score */}
        <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase">
              <Microscope className="w-4 h-4" /> Microscopic Image Model
            </span>
            <span className="text-xs font-mono font-bold text-teal-300">
              Weight: {(fusion.visualWeight * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {isPositive 
              ? 'Detected intracellular parasite merozoite inclusions. High spatial feature correlation.'
              : 'Clean erythrocyte morphology. No intra-erythrocytic piroplasm inclusions detected.'}
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${fusion.visualWeight * 100}%` }} />
          </div>
        </div>

        {/* Fusion Node Center */}
        <div className="md:col-span-2 text-center flex flex-col items-center justify-center p-3 bg-teal-950/60 rounded-xl border border-teal-500/40">
          <Cpu className="w-6 h-6 text-teal-300 animate-pulse mb-1" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">Late Fusion</span>
          <span className="text-[10px] text-teal-400 font-mono">Score: {fusion.fusionScore}</span>
        </div>

        {/* Modality 2: CBC Score */}
        <div className="md:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase">
              <FileBarChart2 className="w-4 h-4" /> Hematological CBC Model
            </span>
            <span className="text-xs font-mono font-bold text-sky-300">
              Weight: {(fusion.hematologicalWeight * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {isPositive 
              ? 'Marked hemolytic anemia (PCV 28%, RBC 4.2) and mild thrombocytopenia profile.'
              : 'Erythrocyte and platelet indices within baseline boundaries.'}
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${fusion.hematologicalWeight * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Detailed Explanation */}
      <div className="relative z-10 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <p className="font-semibold text-white mb-1">Fusion Model Rationale:</p>
        <p>{fusion.fusionExplanation}</p>
      </div>

      {/* Mandatory Prompts Step 13 Disclaimers */}
      <div className="relative z-10 pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="font-semibold">AI-Assisted Research Prototype Result</span>
        </div>
        <span className="text-slate-400 text-center sm:text-right text-[11px]">
          Final interpretation must be performed by a qualified veterinary professional.
        </span>
      </div>
    </div>
  );
};
