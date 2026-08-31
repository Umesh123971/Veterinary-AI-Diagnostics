import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DiseaseDistributionChart } from '../../components/charts/DiseaseDistributionChart';
import { MonthlyActivityChart } from '../../components/charts/MonthlyActivityChart';
import { OutcomeChart } from '../../components/charts/OutcomeChart';
import { RESEARCH_METRICS } from '../../data/mockData';
import { Users, FolderKanban, Stethoscope, Clock, ShieldCheck, Activity, Brain, Award } from 'lucide-react';

export const AdminDashboard = () => {
  const { patients, users } = useApp();

  const totalPatients = patients.length;
  const totalUsers = users.length;
  const pendingReviews = patients.filter(p => p.status === 'Doctor Review').length;
  const completedDiagnoses = patients.filter(p => p.status === 'Diagnosis Complete').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] uppercase font-mono rounded font-semibold">
            System Administration & Research Intelligence
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Modal Veterinary Diagnostic System</h2>
          <p className="text-xs text-slate-400 mt-1">AI-assisted decision-support platform overview</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Active Model</span>
            <span className="text-xs font-bold text-teal-400">VetAI-FusionNet v2.4</span>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards (Step 6 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Users</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalUsers}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Admins, Techs, Doctors</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

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
              <p className="text-xs font-semibold text-slate-500">Total Diagnoses</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{completedDiagnoses}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">95.8% Model Precision</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending Reviews</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingReviews}</h3>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">Awaiting Doctor Action</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card title="Diagnoses by Disease" subtitle="Distribution across target vector-borne pathogens">
            <DiseaseDistributionChart />
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card title="Monthly Diagnosis Activity" subtitle="Diagnostic throughput over 6 months">
            <MonthlyActivityChart />
          </Card>
        </div>
      </div>

      {/* RESEARCH EVALUATION METRICS SECTION (CRITICAL STEP 6 REQUIREMENT) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Research Evaluation Metrics</h3>
              <p className="text-xs text-slate-400">Deep Learning Model Benchmarks on Multi-Modal Dataset (N=4,500)</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono rounded-full font-semibold">
            Validation Metric Suite v2.4
          </span>
        </div>

        {/* 4 Research KPI Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-sans block font-semibold uppercase">Overall Accuracy</span>
            <span className="text-2xl font-extrabold text-teal-400 mt-1 block">{RESEARCH_METRICS.overallAccuracy}%</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-sans block font-semibold uppercase">Sensitivity</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{RESEARCH_METRICS.sensitivity}%</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-sans block font-semibold uppercase">Specificity</span>
            <span className="text-2xl font-extrabold text-sky-400 mt-1 block">{RESEARCH_METRICS.specificity}%</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-sans block font-semibold uppercase">AUC-ROC Score</span>
            <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{RESEARCH_METRICS.aucRoc}</span>
          </div>
        </div>

        {/* Per-Disease Accuracy Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="py-2.5 px-4 font-sans font-semibold">Disease Module</th>
                <th className="py-2.5 px-4">Accuracy</th>
                <th className="py-2.5 px-4">Sensitivity</th>
                <th className="py-2.5 px-4">Specificity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {RESEARCH_METRICS.diseaseAccuracy.map((d) => (
                <tr key={d.disease} className="hover:bg-slate-950/60">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-200">{d.disease}</td>
                  <td className="py-3 px-4 text-teal-400 font-bold">{d.accuracy}%</td>
                  <td className="py-3 px-4 text-emerald-300">{d.sensitivity}%</td>
                  <td className="py-3 px-4 text-sky-300">{d.specificity}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
