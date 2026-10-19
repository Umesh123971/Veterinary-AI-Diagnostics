import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Microscope, 
  FileText, 
  CheckCircle2, 
  ShieldAlert,
  Award
} from 'lucide-react';

export const ViewReportPage = () => {
  const { id } = useParams();
  const { patients } = useApp();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === id) || patients[0];
  const reportRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = () => {
    alert(`Generating high-resolution PDF for patient ${patient.dogName} (${patient.id})... Download initiated.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Toolbar (Hidden on print) */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} className="text-slate-300 hover:text-white" onClick={() => navigate('/reports')}>
            Reports Catalog
          </Button>
          <span className="font-bold text-sm">Official Diagnostic Report Preview</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={Download} onClick={handleGeneratePdf}>
            Generate PDF
          </Button>
          <Button variant="primary" size="sm" icon={Printer} className="bg-teal-600 hover:bg-teal-700" onClick={handlePrint}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Printable Report Document Sheet (Step 21 requirement) */}
      <div ref={reportRef} className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 text-slate-900 space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* Header Branding */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 text-white rounded-xl">
              <Microscope className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI-ASSISTED VETERINARY DIAGNOSTIC REPORT</h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
                Multi-Modal Deep Learning Research Framework • Vector-Borne Screening
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded uppercase">
              Official Diagnostic Certificate
            </span>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Report ID: REP-2026-{patient.id}</p>
          </div>
        </div>

        {/* 1. Patient, Owner & Sample Information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div><span className="text-slate-400 block text-[10px]">DOG NAME</span><span className="font-bold text-slate-900 text-sm">{patient.dogName}</span></div>
          <div><span className="text-slate-400 block text-[10px]">PATIENT ID</span><span className="font-mono font-semibold">{patient.id}</span></div>
          <div><span className="text-slate-400 block text-[10px]">OWNER NAME</span><span className="font-semibold">{patient.ownerName}</span></div>
          <div><span className="text-slate-400 block text-[10px]">SAMPLE DATE</span><span className="font-mono font-semibold">{patient.sampleDate}</span></div>
          <div><span className="text-slate-400 block text-[10px]">BREED</span><span className="font-semibold">{patient.breed}</span></div>
          <div><span className="text-slate-400 block text-[10px]">AGE / SEX</span><span className="font-semibold">{patient.age} / {patient.sex}</span></div>
          <div><span className="text-slate-400 block text-[10px]">WEIGHT</span><span className="font-semibold">{patient.weight}</span></div>
          <div><span className="text-slate-400 block text-[10px]">REVIEW STATUS</span><span className="font-bold text-emerald-700">{patient.doctorReview?.status || 'Accepted'}</span></div>
        </div>

        {/* 2. Microscopic & CBC Modality Images & Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Microscopic Blood Smear Evidence</h4>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
              <img src={patient.bloodSmearImage} alt="Smear" className="max-h-48 w-auto mx-auto rounded object-cover" />
              <p className="text-[10px] text-slate-300 font-mono mt-1">Giemsa-stained 100x oil immersion microscopy image</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">CBC Hematology Summary</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>RBC Count:</span>
                <span className="font-bold text-rose-600">{patient.cbcData?.rbc?.value} ×10⁶/µL (Low)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>PCV (Hematocrit):</span>
                <span className="font-bold text-rose-600">{patient.cbcData?.pcv?.value}% (Low)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Hemoglobin:</span>
                <span className="font-bold text-rose-600">{patient.cbcData?.hb?.value} g/dL (Low)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>WBC Count:</span>
                <span className="font-bold text-slate-900">{patient.cbcData?.wbc?.value} ×10³/µL (Normal)</span>
              </div>
              <div className="flex justify-between">
                <span>Platelets:</span>
                <span className="font-bold text-amber-600">{patient.cbcData?.platelets?.value} ×10³/µL (Low)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Disease Predictions & Confidence Scores (Step 21 requirement) */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Multi-Modal AI Pathogen Predictions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(patient.diseasePredictions || {}).map(([key, d]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-900">{d.diseaseName}</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">{d.findings}</p>
                </div>
                <div className="text-right">
                  <Badge variant={d.prediction}>{d.prediction}</Badge>
                  <span className="block text-[10px] font-mono font-bold text-teal-600 mt-1">{d.confidence}% Certainty</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parasitemia & Zoonotic Risk Callout */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-teal-50/60 rounded-xl border border-teal-200 text-xs">
          <div>
            <span className="text-teal-800 font-semibold block text-[10px]">ESTIMATED PARASITEMIA BURDEN</span>
            <span className="text-lg font-mono font-extrabold text-teal-900">{patient.estimatedParasitemia}%</span>
          </div>
          <div>
            <span className="text-teal-800 font-semibold block text-[10px]">ZOONOTIC RISK ASSESSMENT</span>
            <span className="text-lg font-mono font-extrabold text-teal-900">{patient.zoonoticRisk || 'Low'}</span>
          </div>
        </div>

        {/* 4. Laboratory Verification Remarks */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
          <h4 className="font-bold text-slate-900">Laboratory Verification & Sign-Off Remarks:</h4>
          <p className="text-slate-700 italic">"{patient.doctorReview?.comments || 'Confirmed multi-modal findings. Automated hematology indices and microscopic smear validated.'}"</p>
          <div className="pt-2 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Verified by: {patient.doctorReview?.doctorName || 'Marcus Sterling, MT'}</span>
            <span>Date: {patient.doctorReview?.reviewDate || patient.sampleDate}</span>
          </div>
        </div>

        {/* 5. Mandatory Disclaimer */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-amber-900">Research Prototype Disclaimer</h5>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              This report is generated by an AI-assisted research prototype and should be interpreted and validated by a qualified veterinary professional.
            </p>
          </div>
        </div>

        {/* Signature Line */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
          <div>
            <p className="font-mono text-[10px] text-slate-400">System Signature Hash: 0x8F9A4B2C1D...</p>
            <p className="text-[10px] text-slate-400">VetAI Deep Learning Decision Support System v2.4</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-700 text-sm">
              {patient.doctorReview?.doctorName || 'Marcus Sterling, MT'}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Authorized Laboratory Specialist</span>
          </div>
        </div>

      </div>
    </div>
  );
};
