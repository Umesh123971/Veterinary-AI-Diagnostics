import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Plus, FolderKanban, Clock, CheckCircle2, AlertTriangle, Eye, Stethoscope, ArrowRight } from 'lucide-react';

export const TechnicianDashboard = () => {
  const { patients } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');

  const totalPatients = patients.length;
  const pendingDiagnoses = patients.filter(p => p.status === 'Awaiting Diagnosis' || p.status === 'New').length;
  const completedDiagnoses = patients.filter(p => p.status === 'Diagnosis Complete').length;
  const rediagnosisRequests = patients.filter(p => p.status === 'Re-diagnosis Requested').length;

  const filteredPatients = statusFilter === 'All'
    ? patients
    : patients.filter(p => p.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
            Laboratory Workstation Portal
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Lab Technician Control Center</h2>
          <p className="text-xs text-slate-400 mt-1">Sample registration, Giemsa smear upload, and CBC extraction workflow</p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          size="lg"
          className="bg-teal-600 hover:bg-teal-500 font-bold px-5"
          onClick={() => navigate('/patients/new')}
        >
          Add New Patient
        </Button>
      </div>

      {/* 4 Statistics Cards (Step 8 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Patients</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalPatients}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Registered Canines</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending Diagnoses</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{pendingDiagnoses}</h3>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">Needs Multi-Modal Run</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Completed Diagnoses</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{completedDiagnoses}</h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">Verified & Approved</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Re-diagnosis Requests</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{rediagnosisRequests}</h3>
              <p className="text-[11px] text-rose-700 font-semibold mt-1">Doctor Feedback Returned</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Patient Table with Status Filter */}
      <Card
        title="Recent Patient Cases"
        subtitle="Manage canine sample pipeline and AI multi-modal diagnostic triggers"
        action={
          <div className="flex gap-2">
            {['All', 'Awaiting Diagnosis', 'Doctor Review', 'Re-diagnosis Requested', 'Diagnosis Complete'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Dog Name</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Breed</th>
                <th className="py-3 px-4">Sample Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{patient.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{patient.dogName}</td>
                  <td className="py-3 px-4 text-slate-600">{patient.ownerName}</td>
                  <td className="py-3 px-4 text-slate-600">{patient.age} / {patient.sex}</td>
                  <td className="py-3 px-4 text-slate-600">{patient.breed}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{patient.sampleDate}</td>
                  <td className="py-3 px-4">
                    <Badge variant={patient.status}>{patient.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {patient.status === 'Re-diagnosis Requested' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={AlertTriangle}
                        onClick={() => navigate(`/technician/rediagnosis/${patient.id}`)}
                      >
                        Re-Diagnose Case
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate(`/results/${patient.id}`)}
                      >
                        View Case
                      </Button>
                    )}
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
