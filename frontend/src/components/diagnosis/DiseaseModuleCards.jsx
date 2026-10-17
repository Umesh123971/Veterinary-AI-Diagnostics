import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Bug, ShieldCheck, AlertCircle, Sparkles, Activity } from 'lucide-react';

export const DiseaseModuleCards = ({ diseasePredictions, cbcData, estimatedParasitemia = 3.8 }) => {
  const predictions = diseasePredictions || {
    ehrlichiosis: { diseaseName: 'Canine Ehrlichiosis', prediction: 'Negative', confidence: 88.4, findings: 'No morulae observed.', imageFindings: 'Clear monocytes.', cbcFindings: 'Normal leukocytes.' },
    babesiosis: { diseaseName: 'Canine Babesiosis', prediction: 'Positive', confidence: 94.2, findings: 'Pair merozoites detected.', imageFindings: 'Piriform intra-erythrocytic merozoites.', cbcFindings: 'Normocytic normochromic anemia.' },
    dirofilariasis: { diseaseName: 'Canine Dirofilariasis', prediction: 'Negative', confidence: 96.1, findings: 'No microfilariae.', imageFindings: 'Clear fields.', cbcFindings: 'Normal eosinophils.' },
    hepatozoonosis: { diseaseName: 'Canine Hepatozoonosis', prediction: 'Negative', confidence: 91.0, findings: 'No PMN gamonts.', imageFindings: 'Clean PMN cytoplasm.', cbcFindings: 'No extreme leukocytosis.' }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* 1. Canine Ehrlichiosis Module */}
      <Card 
        title="1. Canine Ehrlichiosis Module" 
        subtitle="Rickettsial Vector-Borne Pathogen (Ehrlichia canis)"
        action={<Badge variant={predictions.ehrlichiosis.prediction}>{predictions.ehrlichiosis.prediction}</Badge>}
        className="hover:border-purple-300 transition-all"
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-purple-50 p-2.5 rounded-lg border border-purple-100">
            <span className="font-semibold text-purple-950">Model Certainty Score</span>
            <span className="font-mono font-bold text-sm text-purple-800">{predictions.ehrlichiosis.confidence}%</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-bold text-slate-700 block">Microscopic Image Evidence:</span>
              <p className="text-slate-600 mt-0.5">{predictions.ehrlichiosis.imageFindings}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Hematological Evidence:</span>
              <p className="text-slate-600 mt-0.5">{predictions.ehrlichiosis.cbcFindings}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Canine Babesiosis Module (High Detail per Step 28) */}
      <Card 
        title="2. Canine Babesiosis Module" 
        subtitle="Intra-erythrocytic Protozoan (Babesia canis / gibsoni)"
        action={<Badge variant={predictions.babesiosis.prediction}>{predictions.babesiosis.prediction}</Badge>}
        className="border-2 border-rose-200 bg-rose-50/10 shadow-md hover:border-rose-300 transition-all"
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-rose-100/70 p-2.5 rounded-lg border border-rose-200">
            <span className="font-semibold text-rose-950">Model Certainty Score</span>
            <span className="font-mono font-bold text-sm text-rose-800">{predictions.babesiosis.confidence}%</span>
          </div>

          {/* Babesiosis Key Parameters (Step 28 requirement: RBC, PCV, Parasitemia) */}
          <div className="grid grid-cols-3 gap-2 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 text-center font-mono">
            <div>
              <span className="text-[10px] text-amber-800 font-sans block font-semibold">RBC Count</span>
              <span className="font-bold text-rose-700">{cbcData?.rbc?.value || 4.2}</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-800 font-sans block font-semibold">PCV %</span>
              <span className="font-bold text-rose-700">{cbcData?.pcv?.value || 28}%</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-800 font-sans block font-semibold">Parasitemia</span>
              <span className="font-bold text-amber-900">{estimatedParasitemia}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-bold text-slate-700 block">Parasite & Cell Detection:</span>
              <p className="text-slate-600 mt-0.5">{predictions.babesiosis.imageFindings}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Hemolytic Anemia Findings:</span>
              <p className="text-slate-600 mt-0.5">{predictions.babesiosis.cbcFindings}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Canine Dirofilariasis Module */}
      <Card 
        title="3. Canine Dirofilariasis Module" 
        subtitle="Helminthic Heartworm Pathogen (Dirofilaria immitis)"
        action={<Badge variant={predictions.dirofilariasis.prediction}>{predictions.dirofilariasis.prediction}</Badge>}
        className="hover:border-sky-300 transition-all"
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-sky-50 p-2.5 rounded-lg border border-sky-100">
            <span className="font-semibold text-sky-950">Model Certainty Score</span>
            <span className="font-mono font-bold text-sm text-sky-800">{predictions.dirofilariasis.confidence}%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-200 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-500 font-sans block">Eosinophil %</span>
              <span className="font-bold text-slate-800">{cbcData?.eosinophils?.value || 4}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-sans block">Zoonotic Risk</span>
              <span className="font-bold text-amber-700">Vector Dependent</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-bold text-slate-700 block">Microfilariae Detection:</span>
              <p className="text-slate-600 mt-0.5">{predictions.dirofilariasis.imageFindings}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Hematological Evidence:</span>
              <p className="text-slate-600 mt-0.5">{predictions.dirofilariasis.cbcFindings}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Canine Hepatozoonosis Module */}
      <Card 
        title="4. Canine Hepatozoonosis Module" 
        subtitle="Apioflexan Parasite (Hepatozoon canis)"
        action={<Badge variant={predictions.hepatozoonosis.prediction}>{predictions.hepatozoonosis.prediction}</Badge>}
        className="hover:border-amber-300 transition-all"
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            <span className="font-semibold text-amber-950">Model Certainty Score</span>
            <span className="font-mono font-bold text-sm text-amber-800">{predictions.hepatozoonosis.confidence}%</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-bold text-slate-700 block">PMN Gamont Detection:</span>
              <p className="text-slate-600 mt-0.5">{predictions.hepatozoonosis.imageFindings}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Leukocytic Response Evidence:</span>
              <p className="text-slate-600 mt-0.5">{predictions.hepatozoonosis.cbcFindings}</p>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};
