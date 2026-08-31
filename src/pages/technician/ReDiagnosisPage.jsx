import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import { CbcChart } from '../../components/charts/CbcChart';
import { 
  AlertTriangle, 
  RotateCcw, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Microscope, 
  FileText,
  Sparkles
} from 'lucide-react';

export const ReDiagnosisPage = () => {
  const { id } = useParams();
  const { patients, runAiDiagnosis, updatePatientCbc } = useApp();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === id) || patients[3]; // Luna is the mock re-diagnosis case!
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [imageReplaced, setImageReplaced] = useState(false);
  const [reportReplaced, setReportReplaced] = useState(false);
  const [isReDiagnosing, setIsReDiagnosing] = useState(false);

  const handlePerformReDiagnosis = () => {
    setIsReDiagnosing(true);
    setTimeout(() => {
      runAiDiagnosis(patient.id);
      setIsReDiagnosing(false);
      navigate(`/results/${patient.id}`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        fileName={patient.cbcReportPdf}
        patientName={patient.dogName}
      />

      {/* Header Banner */}
      <div className="bg-rose-950 text-white rounded-2xl p-6 border border-rose-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] uppercase font-mono rounded font-semibold">
              Action Required: Re-Diagnosis Workflow
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Re-Diagnosis Requested: {patient.dogName} ({patient.id})
          </h2>
          <p className="text-xs text-rose-200 mt-0.5">
            Returned by clinician for slide re-staining / CBC data re-evaluation
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Pipeline State:</span>
          <span className="text-amber-400 font-bold">Previous Result → Re-Diagnosis → Updated Result</span>
        </div>
      </div>

      {/* Doctor Feedback Summary Box (Step 20 requirement) */}
      <Card 
        title="Doctor Feedback & Re-diagnosis Remarks" 
        subtitle="Review clinician comments prior to performing re-diagnosis"
        className="border-2 border-amber-300 bg-amber-50/40"
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 bg-amber-100/80 rounded-xl border border-amber-200 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                Doctor: {patient.doctorReview?.doctorName || 'Dr. Amara Fernando'}
              </p>
              <p className="mt-1 text-slate-800 leading-relaxed font-medium">
                "{patient.doctorReview?.comments || 'Smear quality has slight stain precipitate artifacts near neutrophil clusters. Please re-stain Giemsa slide and re-upload smear for confirmation.'}"
              </p>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Returned on: {patient.doctorReview?.reviewDate || '2026-08-26 17:15'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Previous Primary Output</span>
              <span className="font-bold text-slate-900">{patient.primaryPrediction}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Previous Confidence</span>
              <span className="font-bold text-teal-600">{patient.overallConfidence}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Review Status</span>
              <span className="font-bold text-rose-600">{patient.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Re-Diagnosis State</span>
              <span className="font-bold text-amber-700">Awaiting Lab Re-Run</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Media Inspection & Replacement Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Blood Smear Re-upload Card */}
        <Card title="Microscope Blood Smear Image" subtitle="Review or replace Giemsa blood smear slide image">
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={patient.bloodSmearImage} alt="Smear" className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
                <div>
                  <h5 className="font-semibold text-white">Giemsa Smear Slide Image</h5>
                  <p className="text-[10px] text-slate-400 font-mono">{imageReplaced ? 'Re-stained Slide (v2.0)' : 'Original Slide (v1.0)'}</p>
                </div>
              </div>
              <Badge variant={imageReplaced ? 'success' : 'warning'}>
                {imageReplaced ? 'Replaced' : 'Original'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={Eye} className="w-full" onClick={() => alert('Inspecting slide image details.')}>
                Review Image
              </Button>
              <Button variant="primary" size="sm" icon={RefreshCw} className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => setImageReplaced(true)}>
                Replace Slide Image
              </Button>
            </div>
          </div>
        </Card>

        {/* CBC Report Re-upload Card */}
        <Card title="CBC / Hematology Report" subtitle="Review or replace automated analyzer CBC PDF document">
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-lg font-bold text-xs">PDF</div>
                <div>
                  <h5 className="font-semibold text-slate-900">{patient.cbcReportPdf}</h5>
                  <p className="text-[10px] text-slate-500 font-mono">{reportReplaced ? 'Updated CBC PDF (v2.0)' : 'Initial CBC PDF (v1.0)'}</p>
                </div>
              </div>
              <Badge variant={reportReplaced ? 'success' : 'neutral'}>
                {reportReplaced ? 'Replaced' : 'Active'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={FileText} className="w-full" onClick={() => setShowPdfModal(true)}>
                View CBC Report
              </Button>
              <Button variant="primary" size="sm" icon={RefreshCw} className="w-full bg-sky-600 hover:bg-sky-700" onClick={() => setReportReplaced(true)}>
                Replace CBC PDF
              </Button>
            </div>
          </div>
        </Card>

      </div>

      {/* CBC Values Display */}
      <Card title="Hematological Data Review" subtitle="Review or edit extracted CBC indices before re-triggering AI model">
        <CbcChart cbcData={patient.cbcData} />
      </Card>

      {/* Bottom Perform Re-Diagnosis Trigger Button */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white">Execute Multi-Modal Re-Diagnosis</h4>
          <p className="text-xs text-slate-400 mt-0.5">Re-run feature extraction and late-fusion model on updated inputs</p>
        </div>

        <Button
          variant="primary"
          icon={Sparkles}
          size="lg"
          className="bg-teal-600 hover:bg-teal-500 font-bold px-8 py-3"
          disabled={isReDiagnosing}
          onClick={handlePerformReDiagnosis}
        >
          {isReDiagnosing ? 'Executing Re-Diagnosis...' : 'Perform Re-Diagnosis'}
        </Button>
      </div>
    </div>
  );
};
