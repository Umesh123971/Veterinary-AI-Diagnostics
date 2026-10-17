import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import { FusionResultCard } from '../../components/diagnosis/FusionResultCard';
import { MicroscopicAnnotator } from '../../components/diagnosis/MicroscopicAnnotator';
import { CbcChart } from '../../components/charts/CbcChart';
import { DiseaseModuleCards } from '../../components/diagnosis/DiseaseModuleCards';
import { 
  FileText, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Stethoscope, 
  Layers, 
  Microscope,
  Info,
  Award
} from 'lucide-react';

export const DiagnosticResultPage = () => {
  const { id } = useParams();
  const { patients } = useApp();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === id) || patients[0];
  const [showPdfModal, setShowPdfModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* PDF Modal */}
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        fileName={patient.cbcReportPdf}
        patientName={patient.dogName}
      />

      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={ArrowLeft} className="text-slate-300 hover:text-white" onClick={() => navigate('/results')}>
              All Results
            </Button>
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
              Diagnostic Result Report
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">
            Multi-Modal Diagnostic Case: {patient.dogName} ({patient.id})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sample Collection Date: {patient.sampleDate} • Owner: {patient.ownerName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={FileText} onClick={() => setShowPdfModal(true)}>
            View CBC Report
          </Button>
          <Button variant="primary" size="sm" icon={Printer} className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate(`/reports/${patient.id}`)}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Patient Demographics Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
        <div><span className="text-slate-400 block text-[10px]">PATIENT NAME</span><span className="font-bold text-slate-900 text-sm">{patient.dogName}</span></div>
        <div><span className="text-slate-400 block text-[10px]">BREED</span><span className="font-semibold text-slate-800">{patient.breed}</span></div>
        <div><span className="text-slate-400 block text-[10px]">AGE / SEX</span><span className="font-semibold text-slate-800">{patient.age} / {patient.sex}</span></div>
        <div><span className="text-slate-400 block text-[10px]">WEIGHT</span><span className="font-semibold text-slate-800">{patient.weight}</span></div>
        <div><span className="text-slate-400 block text-[10px]">PRIMARY PREDICTION</span><span className="font-bold text-rose-700">{patient.primaryPrediction}</span></div>
        <div><span className="text-slate-400 block text-[10px]">CONFIDENCE</span><span className="font-bold text-teal-600 font-mono text-sm">{patient.overallConfidence}%</span></div>
      </div>

      {/* Multi-Modal Fusion Result Card */}
      <FusionResultCard patient={patient} />

      {/* Microscopic Evidence Section (Step 17 requirement) */}
      <Card title="Microscopic Image Findings & Parasite Localization" subtitle="Annotated Giemsa smear microscopy field">
        <MicroscopicAnnotator patient={patient} />
      </Card>

      {/* Hematological Findings (Step 17 requirement) */}
      <Card title="Hematological Findings & Automated CBC Parameters" subtitle="Sysmex XN-V Analyzer data fusion input">
        <CbcChart cbcData={patient.cbcData} emphasizeBabesiosis={patient.primaryPrediction?.includes('Babesiosis')} />
      </Card>

      {/* Disease Predictions & Multi-Evidence Details (Step 17 requirement) */}
      <Card title="Concurrent Pathogen Predictions & Multi-Modal Evidence Breakdown" subtitle="Detailed breakdown across all 4 vector-borne disease models">
        <DiseaseModuleCards diseasePredictions={patient.diseasePredictions} cbcData={patient.cbcData} estimatedParasitemia={patient.estimatedParasitemia} />
      </Card>
    </div>
  );
};
