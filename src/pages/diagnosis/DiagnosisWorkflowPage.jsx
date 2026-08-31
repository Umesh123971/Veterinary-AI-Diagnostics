import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { WorkflowDiagram } from '../../components/diagnosis/WorkflowDiagram';
import { Stethoscope, ArrowRight, Play, Cpu, Layers } from 'lucide-react';

export const DiagnosisWorkflowPage = () => {
  const { patients } = useApp();
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'PAT-2026-001');

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
            Interactive AI Architecture Showcase
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Modal Deep Learning Pipeline</h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing microscopic blood smear vision model and hematological CBC feature fusion
          </p>
        </div>

        <Button
          variant="primary"
          icon={Play}
          size="lg"
          className="bg-teal-600 hover:bg-teal-500 font-bold px-6"
          onClick={() => navigate(`/results/${selectedPatient.id}`)}
        >
          View Live Case Result
        </Button>
      </div>

      {/* Main Visual Workflow Diagram (Step 10 requirement) */}
      <WorkflowDiagram />

      {/* Active Demonstration Case Selector */}
      <Card title="Select Case for Pipeline Inspection" subtitle="Choose a fictional research patient to trace feature extraction and late-fusion outputs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPatientId === p.id
                  ? 'bg-teal-50/70 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{p.dogName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{p.id} • {p.breed}</p>
                </div>
                <Badge variant={p.primaryPrediction.includes('Negative') ? 'Negative' : 'Positive'}>
                  {p.primaryPrediction}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Fusion Confidence:</span>
                <span className="font-mono font-bold text-teal-600">{p.overallConfidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
