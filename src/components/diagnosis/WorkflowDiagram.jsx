import React from 'react';
import { Microscope, FileBarChart2, Layers, Cpu, CheckCircle2, ArrowRight, ArrowDown } from 'lucide-react';

export const WorkflowDiagram = ({ activeStage = 4 }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
              Research Pipeline Architecture
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Multi-Modal Deep Learning Fusion Architecture</h3>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Dual Feature Alignment Engine Active</span>
          </div>
        </div>

        {/* Responsive Multi-Modal Architecture Flow */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Branch 1: Microscopic Image Path */}
          <div className="md:col-span-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
              <Microscope className="w-4 h-4" />
              <span>Modal 1: Microscopic Image</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <p className="font-semibold text-slate-200">Giemsa Blood Smear Image</p>
              <p className="text-[11px] text-slate-400 mt-0.5">100× Oil Immersion Microscopy</p>
            </div>
            <div className="flex justify-center text-teal-500">
              <ArrowDown className="w-4 h-4 md:hidden" />
              <ArrowRight className="w-4 h-4 hidden md:block" />
            </div>
            <div className="p-3 bg-teal-950/40 rounded-lg border border-teal-800/60 text-xs">
              <p className="font-semibold text-teal-200">CNN Visual Feature Extractor</p>
              <p className="text-[11px] text-teal-400/80 mt-0.5">YOLOv8 Detection + Parasitemia Segmenter</p>
            </div>
          </div>

          {/* Fusion Bridge Connector */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/90 rounded-xl border border-teal-500/40 shadow-lg my-2 md:my-0">
            <div className="p-3 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/40 mb-2">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-white text-center">Multi-Modal Fusion Layer</h4>
            <p className="text-[11px] text-slate-400 text-center mt-1">Cross-Attention Tensor Concatenation</p>
            <span className="mt-3 px-3 py-1 bg-teal-500/20 text-teal-300 text-[10px] font-mono rounded-full border border-teal-500/30">
              Late Fusion Weight Optimization
            </span>
          </div>

          {/* Branch 2: CBC Hematological Path */}
          <div className="md:col-span-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <FileBarChart2 className="w-4 h-4" />
              <span>Modal 2: CBC Hematology</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <p className="font-semibold text-slate-200">Structured CBC Parameters</p>
              <p className="text-[11px] text-slate-400 mt-0.5">RBC, PCV, Hb, WBC, Platelets, Differential</p>
            </div>
            <div className="flex justify-center text-sky-500">
              <ArrowDown className="w-4 h-4 md:hidden" />
              <ArrowRight className="w-4 h-4 hidden md:block" />
            </div>
            <div className="p-3 bg-sky-950/40 rounded-lg border border-sky-800/60 text-xs">
              <p className="font-semibold text-sky-200">Tabular Feature Transformer</p>
              <p className="text-[11px] text-sky-400/80 mt-0.5">Hematological Anemia & Cytopenia Encoder</p>
            </div>
          </div>

        </div>

        {/* Final Diagnostic Output Box */}
        <div className="mt-6 p-4 bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950 rounded-xl border border-teal-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-300 uppercase">Final Output</h5>
              <p className="text-sm font-semibold text-white">AI-Assisted Multi-Disease Diagnostic Assessment & Parasitemia Score</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Output: [Ehrlichiosis, Babesiosis, Dirofilariasis, Hepatozoonosis]
          </span>
        </div>
      </div>
    </div>
  );
};
