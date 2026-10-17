import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import { CbcChart } from '../../components/charts/CbcChart';
import { MicroscopicAnnotator } from '../../components/diagnosis/MicroscopicAnnotator';
import { 
  ArrowLeft, 
  FileText, 
  Printer, 
  Clock, 
  CheckCircle2, 
  Microscope, 
  User, 
  Calendar,
  Layers,
  History
} from 'lucide-react';

export const PatientDetailPage = () => {
  const { id } = useParams();
  const { patients } = useApp();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === id) || patients[0];
  const [showPdfModal, setShowPdfModal] = useState(false);

  return (
    <div className="space-y-6">
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        fileName={patient.cbcReportPdf}
        patientName={patient.dogName}
      />

      {/* Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={ArrowLeft} className="text-slate-300 hover:text-white" onClick={() => navigate('/patients')}>
              Back to Patients
            </Button>
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
              Patient Medical Record
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">
            Patient File: {patient.dogName} ({patient.id})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {patient.breed} • {patient.age} • {patient.sex} • Weight: {patient.weight}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={FileText} onClick={() => setShowPdfModal(true)}>
            View Raw CBC PDF
          </Button>
          <Button variant="primary" size="sm" icon={Printer} className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate(`/reports/${patient.id}`)}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Patient Demographics & Clinical Information (Step 22 requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Patient & Owner Information">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-slate-400 block text-[10px]">DOG NAME</span><span className="font-bold text-slate-900">{patient.dogName}</span></div>
            <div><span className="text-slate-400 block text-[10px]">PATIENT ID</span><span className="font-mono font-bold text-slate-800">{patient.id}</span></div>
            <div><span className="text-slate-400 block text-[10px]">OWNER NAME</span><span className="font-semibold text-slate-800">{patient.ownerName}</span></div>
            <div><span className="text-slate-400 block text-[10px]">CONTACT PHONE</span><span className="font-mono text-slate-800">{patient.contactNumber}</span></div>
            <div><span className="text-slate-400 block text-[10px]">AGE / SEX</span><span className="font-semibold text-slate-800">{patient.age} / {patient.sex}</span></div>
            <div><span className="text-slate-400 block text-[10px]">BREED</span><span className="font-semibold text-slate-800">{patient.breed}</span></div>
          </div>
        </Card>

        <Card title="Clinical Notes & Sample Information">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">SAMPLE COLLECTION DATE</span>
              <span className="font-mono font-bold text-slate-800">{patient.sampleDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CLINICAL OBSERVATIONS</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 mt-1 leading-relaxed">
                {patient.clinicalNotes}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Laboratory Reports Card (Step 22 requirement) */}
      <Card title="Laboratory Reports" subtitle="Uploaded CBC document metadata & controls">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-100 text-sky-700 rounded-lg font-bold text-xs">PDF</div>
            <div>
              <h4 className="font-bold text-slate-900">{patient.cbcReportPdf}</h4>
              <p className="text-[11px] text-slate-500 font-mono">Upload Date: {patient.sampleDate} • Format: PDF • Status: Synced</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" icon={FileText} className="bg-sky-600 hover:bg-sky-700" onClick={() => setShowPdfModal(true)}>
              View Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert('Report replaced.')}>
              Replace Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Clinical Images Section (Step 22 requirement) */}
      <Card title="Clinical Images" subtitle="Original and AI Annotated Giemsa Blood Smear microscopy images">
        <MicroscopicAnnotator patient={patient} />
      </Card>

      {/* Hematological Data Table */}
      <Card title="Hematological Data" subtitle="Extracted complete blood count values">
        <CbcChart cbcData={patient.cbcData} />
      </Card>

      {/* DIAGNOSTIC HISTORY TIMELINE (STEP 22 REQUIREMENT) */}
      <Card title="Diagnostic History Timeline" subtitle="End-to-end multi-modal diagnostic progression trail">
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 text-xs">
          {(patient.timeline || []).map((t, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-teal-500 border-2 border-white ring-2 ring-slate-100" />
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900">{t.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{t.date}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Actor / System: {t.actor}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
