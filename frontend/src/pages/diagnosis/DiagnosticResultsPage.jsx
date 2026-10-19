import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Search, Eye, FileText, Printer, Stethoscope, Filter } from 'lucide-react';

export const DiagnosticResultsPage = () => {
  const { patients } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p => 
    p.dogName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.breed.toLowerCase().includes(search.toLowerCase()) ||
    p.primaryPrediction.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card
        title="Diagnostic Case Repository"
        subtitle="Catalog of completed multi-modal AI diagnostic evaluations and laboratory verification sign-offs"
        action={
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case, disease, dog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none w-64"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Dog Name</th>
                <th className="py-3 px-4">Sample Date</th>
                <th className="py-3 px-4">Primary Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Sign-Off</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{patient.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{patient.dogName}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{patient.sampleDate}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <Badge variant={patient.primaryPrediction.includes('Negative') ? 'Negative' : 'Positive'}>
                      {patient.primaryPrediction}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-600">
                    {patient.overallConfidence}%
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={patient.status}>{patient.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={patient.doctorReview?.status === 'Accepted' ? 'success' : patient.doctorReview?.status === 'Re-diagnosis Requested' ? 'danger' : 'warning'}>
                      {patient.doctorReview?.status || 'Pending Review'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate(`/results/${patient.id}`)}
                      >
                        View Result
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-slate-900"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        View Patient
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Printer}
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => navigate(`/reports/${patient.id}`)}
                      >
                        Report
                      </Button>
                    </div>
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
