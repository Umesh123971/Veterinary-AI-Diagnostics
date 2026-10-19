import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import { MicroscopicAnnotator } from '../../components/diagnosis/MicroscopicAnnotator';
import { FusionResultCard } from '../../components/diagnosis/FusionResultCard';
import { DiseaseModuleCards } from '../../components/diagnosis/DiseaseModuleCards';
import { CbcChart } from '../../components/charts/CbcChart';
import {
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  FileText,
  Microscope,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  ClipboardCheck
} from 'lucide-react';

export const TechnicianReviewPage = () => {
  const { id } = useParams();
  const { patients, submitDoctorReview, currentUser } = useApp();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === id) || patients[0];
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('accept'); // 'accept' | 'rediagnose'
  const [verificationComments, setVerificationComments] = useState(
    patient?.doctorReview?.comments || 'Microscopic intracellular piriform merozoites and automated CBC hematological indices verified. AI diagnostic assessment approved for official release.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    submitDoctorReview(patient.id, reviewAction, verificationComments);
    if (reviewAction === 'accept') {
      navigate(`/results/${patient.id}`);
    } else {
      navigate('/technician');
    }
  };

  return (
    <div className="space-y-6">
      {/* Pdf Modal */}
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        fileName={patient.cbcReportPdf}
        patientName={patient.dogName}
      />

      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={ArrowLeft} className="text-slate-300 hover:text-white" onClick={() => navigate('/technician')}>
              Back to Dashboard
            </Button>
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
              Laboratory Verification & Sign-Off
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">
            Diagnostic Verification: {patient.dogName} ({patient.id})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {patient.breed} • {patient.age} • {patient.sex} • Owner: {patient.ownerName} • Verifier: {currentUser?.name || 'Lab Specialist'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={FileText} onClick={() => setShowPdfModal(true)}>
            View Raw CBC PDF
          </Button>
          <Badge variant={patient.status} size="lg">{patient.status}</Badge>
        </div>
      </div>

      {/* Main Dual Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Panel: Microscopic Evidence & Annotator */}
        <div className="lg:col-span-12 space-y-6">
          <Card title="Microscopic Blood Smear Evidence" subtitle="Giemsa-stained 100x oil immersion image analysis & parasite localization">
            <MicroscopicAnnotator patient={patient} />
          </Card>
        </div>

        {/* Fusion Breakdown */}
        <div className="lg:col-span-12">
          <FusionResultCard patient={patient} />
        </div>

        {/* Detailed CBC Parameter Chart */}
        <div className="lg:col-span-12">
          <Card title="Extracted Hematology CBC Indices" subtitle="Automated Sysmex analyzer parameters & status flags">
            <CbcChart cbcData={patient.cbcData} emphasizeBabesiosis={patient.primaryPrediction?.includes('Babesiosis')} />
          </Card>
        </div>

        {/* 4 Pathogen Predictions Breakdown */}
        <div className="lg:col-span-12">
          <DiseaseModuleCards diseasePredictions={patient.diseasePredictions} cbcData={patient.cbcData} estimatedParasitemia={patient.estimatedParasitemia} />
        </div>

      </div>

      {/* BOTTOM VERIFICATION & SIGN-OFF ACTION CARD */}
      <Card title="Laboratory Specialist Verification & Sign-Off" subtitle="Review AI findings, provide laboratory remarks, and finalize the official case record">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Action Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Option 1: Accept Diagnosis */}
            <div
              onClick={() => setReviewAction('accept')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${reviewAction === 'accept'
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="reviewAction"
                  checked={reviewAction === 'accept'}
                  onChange={() => setReviewAction('accept')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Verify & Approve Diagnostic Findings</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Confirm AI assessment and sign off official diagnostic report</p>
                </div>
              </div>
            </div>

            {/* Option 2: Request Re-Diagnosis */}
            <div
              onClick={() => setReviewAction('rediagnose')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${reviewAction === 'rediagnose'
                  ? 'bg-rose-50/70 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="reviewAction"
                  checked={reviewAction === 'rediagnose'}
                  onChange={() => setReviewAction('rediagnose')}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Request Re-Diagnosis / Re-Stain</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Flag slide for re-staining, re-imaging, or CBC recalibration</p>
                </div>
              </div>
            </div>

          </div>

          {/* Re-diagnosis Warning Callout */}
          {reviewAction === 'rediagnose' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Notice:</strong> Flagging this case will queue it for slide re-imaging or CBC re-extraction before final release.</span>
            </div>
          )}

          {/* Verification Comments Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Laboratory Verification & Validation Remarks *
            </label>
            <textarea
              rows={3}
              required
              value={verificationComments}
              onChange={(e) => setVerificationComments(e.target.value)}
              placeholder="Enter your verification observations, slide quality remarks, or reasons for re-analysis..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => navigate('/technician')}>Cancel</Button>

            {reviewAction === 'accept' ? (
              <Button type="submit" variant="primary" icon={ClipboardCheck} size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6">
                Sign Off Diagnosis & Issue Report
              </Button>
            ) : (
              <Button type="submit" variant="danger" icon={AlertTriangle} size="lg" className="font-bold px-6">
                Flag for Re-Diagnosis
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
