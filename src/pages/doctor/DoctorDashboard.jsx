import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Stethoscope, Clock, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, Eye } from 'lucide-react';

export const DoctorDashboard = () => {
  const { patients } = useApp();
  const navigate = useNavigate();

  const awaitingReview = patients.filter(p => p.status === 'Doctor Review');
  const reviewedCases = patients.filter(p => p.status === 'Diagnosis Complete');
  const rediagnosisRequested = patients.filter(p => p.status === 'Re-diagnosis Requested');
  const highRiskCases = patients.filter(p => p.primaryPrediction?.toLowerCase().includes('positive') && p.overallConfidence > 90);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] uppercase font-mono rounded font-semibold">
            Clinical Decision Support Portal
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Doctor & Veterinary Clinician Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Validate multi-modal deep learning diagnostic predictions and issue clinical sign-offs</p>
        </div>

        <div className="px-4 py-2 bg-sky-950/80 rounded-xl border border-sky-800 text-sky-300 text-xs font-semibold flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Review Queue Active</span>
        </div>
      </div>

      {/* 4 Core Statistics (Step 18 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Cases Awaiting Review</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{awaitingReview.length}</h3>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">Requires Clinical Action</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Reviewed & Approved</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{reviewedCases.length}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Reports Finalized</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Re-diagnosis Requested</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{rediagnosisRequested.length}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Returned to Technician</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">High-Risk Positive Cases</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{highRiskCases.length}</h3>
              <p className="text-[11px] text-rose-700 font-semibold mt-1">Confidence &gt; 90%</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cases Awaiting Doctor Review Table (Step 18 requirement) */}
      <Card
        title="Cases Awaiting Doctor Clinical Review"
        subtitle="Review AI multi-modal predictions, parasite overlays, and CBC indices before approving final diagnosis"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">AI Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Sample Date</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {awaitingReview.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No cases currently awaiting doctor review.
                  </td>
                </tr>
              ) : (
                awaitingReview.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{patient.dogName}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">{patient.id} • {patient.breed}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <Badge variant={patient.primaryPrediction?.includes('Negative') ? 'Negative' : 'Positive'}>
                        {patient.primaryPrediction}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-600">
                      {patient.overallConfidence}%
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{patient.sampleDate}</td>
                    <td className="py-3 px-4">
                      <Badge variant="Doctor Review">Awaiting Review</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Stethoscope}
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(`/doctor/review/${patient.id}`)}
                      >
                        Review Diagnosis
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Previously Reviewed Cases Table */}
      <Card title="Recently Approved Cases" subtitle="Archived doctor clinical evaluations">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Final Prediction</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Review Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reviewedCases.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-semibold text-slate-900">{patient.dogName} ({patient.id})</td>
                  <td className="py-3 px-4"><Badge variant="Diagnosis Complete">{patient.primaryPrediction}</Badge></td>
                  <td className="py-3 px-4 text-slate-700">{patient.doctorReview?.doctorName || 'Dr. Marcus Sterling'}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{patient.doctorReview?.reviewDate}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/results/${patient.id}`)}>
                      View Record
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
