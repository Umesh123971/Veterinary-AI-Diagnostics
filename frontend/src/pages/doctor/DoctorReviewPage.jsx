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
  ShieldCheck
} from 'lucide-react';

export const DoctorReviewPage = () => {
  const { id } = useParams();
  const { patients, submitDoctorReview } = useApp();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === id) || patients[0];
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('accept'); // 'accept' | 'rediagnose'
  const [doctorComments, setDoctorComments] = useState(
    patient?.doctorReview?.comments || 'Clinical signs and hematological anemia confirm Babesia merozoite parasitemia. Treatment approved.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    submitDoctorReview(patient.id, reviewAction, doctorComments);
    if (reviewAction === 'accept') {
      navigate(`/results/${patient.id}`);
    } else {
      navigate('/doctor');
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
            <Button variant="ghost" size="sm" icon={ArrowLeft} className="text-slate-300 hover:text-white" onClick={() => navigate('/doctor')}>
              Back to Queue
            </Button>
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] uppercase font-mono rounded font-semibold">
              Doctor Clinical Review Mode
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">
            Clinical Decision Review: {patient.dogName} ({patient.id})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {patient.breed} • {patient.age} • {patient.sex} • Owner: {patient.ownerName}
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

      {/* BOTTOM DOCTOR CLINICAL REVIEW ACTION CARD (STEP 19 REQUIREMENT) */}
      <Card title="Doctor Clinical Sign-Off & Review" subtitle="Select your decision and enter clinical notes for record finalization">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Action Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Option 1: Accept Diagnosis */}
            <div 
              onClick={() => setReviewAction('accept')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                reviewAction === 'accept'
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
                  <h4 className="text-sm font-bold text-slate-900">Accept AI-Assisted Diagnosis</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Approve diagnostic findings and finalize official report</p>
                </div>
              </div>
            </div>

            {/* Option 2: Request Re-Diagnosis */}
            <div 
              onClick={() => setReviewAction('rediagnose')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                reviewAction === 'rediagnose'
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
                  <h4 className="text-sm font-bold text-slate-900">Request Re-Diagnosis</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Return sample to lab technician for re-staining or re-upload</p>
                </div>
              </div>
            </div>

          </div>

          {/* Re-diagnosis Warning Callout per Step 19 */}
          {reviewAction === 'rediagnose' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Notice:</strong> Re-diagnosis will return this case to the laboratory technician for further review and slide/CBC re-intake.</span>
            </div>
          )}

          {/* Doctor Comments Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Doctor Clinical Comments & Recommendations *
            </label>
            <textarea
              rows={3}
              required
              value={doctorComments}
              onChange={(e) => setDoctorComments(e.target.value)}
              placeholder="Enter your clinical remarks, treatment approvals, or reason for re-diagnosis..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => navigate('/doctor')}>Cancel</Button>
            
            {reviewAction === 'accept' ? (
              <Button type="submit" variant="primary" icon={CheckCircle2} size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6">
                Accept Diagnosis & Issue Report
              </Button>
            ) : (
              <Button type="submit" variant="danger" icon={AlertTriangle} size="lg" className="font-bold px-6">
                Return for Re-Diagnosis
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
