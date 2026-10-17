import React from 'react';
import { CBC_REFERENCE_RANGES } from '../../data/mockData';
import { Badge } from '../common/Badge';
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';

export const CbcChart = ({ cbcData, emphasizeBabesiosis = false }) => {
  if (!cbcData) return null;

  const keyParameters = [
    { key: 'rbc', title: 'RBC Count', rangeKey: 'rbc', isBabesiosisKey: true },
    { key: 'pcv', title: 'PCV (Hematocrit)', rangeKey: 'pcv', isBabesiosisKey: true },
    { key: 'hb', title: 'Hemoglobin', rangeKey: 'hb' },
    { key: 'wbc', title: 'WBC Count', rangeKey: 'wbc' },
    { key: 'platelets', title: 'Platelet Count', rangeKey: 'platelets' },
  ];

  const diffParameters = [
    { key: 'neutrophils', title: 'Neutrophils', rangeKey: 'neutrophils' },
    { key: 'lymphocytes', title: 'Lymphocytes', rangeKey: 'lymphocytes' },
    { key: 'monocytes', title: 'Monocytes', rangeKey: 'monocytes' },
    { key: 'eosinophils', title: 'Eosinophils', rangeKey: 'eosinophils' },
    { key: 'basophils', title: 'Basophils', rangeKey: 'basophils' },
  ];

  const renderParamBar = (param) => {
    const dataObj = cbcData[param.key] || { value: 0, status: 'Normal' };
    const ref = CBC_REFERENCE_RANGES[param.rangeKey];
    if (!ref) return null;

    const val = dataObj.value;
    const isLow = dataObj.status === 'Low';
    const isHigh = dataObj.status === 'High';
    const isBabesiosisEmphasized = emphasizeBabesiosis && param.isBabesiosisKey;

    // Calculate percentage along reference bar (mapping min-20% to max+20%)
    const minRange = ref.min;
    const maxRange = ref.max;
    const rangeSpan = maxRange - minRange;
    const lowerBound = Math.max(0, minRange - rangeSpan * 0.3);
    const upperBound = maxRange + rangeSpan * 0.3;
    const percent = Math.min(100, Math.max(0, ((val - lowerBound) / (upperBound - lowerBound)) * 100));

    return (
      <div 
        key={param.key} 
        className={`p-3.5 rounded-xl border transition-all ${
          isBabesiosisEmphasized 
            ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30' 
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">{ref.name}</span>
            {isBabesiosisEmphasized && (
              <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded uppercase">
                Babesiosis Key Metric
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-sm font-bold ${
              isLow ? 'text-amber-700' : isHigh ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {val} <span className="text-xs font-normal text-slate-500">{ref.unit}</span>
            </span>
            <Badge variant={dataObj.status}>{dataObj.status}</Badge>
          </div>
        </div>

        {/* Reference Bar Visual */}
        <div className="relative pt-1">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
            {/* Green Reference Interval Zone */}
            <div 
              className="absolute top-0 bottom-0 bg-emerald-200/80 border-x border-emerald-400/50"
              style={{
                left: `${((minRange - lowerBound) / (upperBound - lowerBound)) * 100}%`,
                width: `${((maxRange - minRange) / (upperBound - lowerBound)) * 100}%`
              }}
            />
            {/* Value Indicator Pointer */}
            <div 
              className={`absolute top-0 bottom-0 w-2.5 -ml-1.25 rounded-full shadow-sm ${
                isLow ? 'bg-amber-600 ring-2 ring-amber-200' : isHigh ? 'bg-rose-600 ring-2 ring-rose-200' : 'bg-emerald-600'
              }`}
              style={{ left: `${percent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
            <span>Ref: {ref.min} – {ref.max} {ref.unit}</span>
            {isLow && <span className="text-amber-700 flex items-center gap-0.5 font-sans font-medium"><TrendingDown className="w-3 h-3" /> Below Baseline</span>}
            {isHigh && <span className="text-rose-700 flex items-center gap-0.5 font-sans font-medium"><TrendingUp className="w-3 h-3" /> Above Baseline</span>}
            {!isLow && !isHigh && <span className="text-emerald-700 flex items-center gap-0.5 font-sans font-medium"><CheckCircle2 className="w-3 h-3" /> Within Normal Range</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary CBC Panel */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Primary Erythrocytic & Leucocyte Parameters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {keyParameters.map(renderParamBar)}
        </div>
      </div>

      {/* Differential Panel */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Differential Leucocyte Counts (%)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {diffParameters.map(renderParamBar)}
        </div>
      </div>
    </div>
  );
};
