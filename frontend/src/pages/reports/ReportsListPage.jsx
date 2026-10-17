import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FileText, Printer, Eye, Download } from 'lucide-react';

export const ReportsListPage = () => {
  const { patients } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card
        title="Generated Reports Catalog"
        subtitle="Access and export official multi-modal veterinary diagnostic report certificates"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Primary Diagnosis</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">REP-2026-{patient.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{patient.dogName} ({patient.id})</td>
                  <td className="py-3 px-4"><Badge variant="Diagnosis Complete">{patient.primaryPrediction}</Badge></td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{patient.sampleDate}</td>
                  <td className="py-3 px-4 text-slate-700">{patient.doctorReview?.doctorName || 'Dr. Marcus Sterling'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" icon={Eye} onClick={() => navigate(`/reports/${patient.id}`)}>
                        Preview Report
                      </Button>
                      <Button variant="primary" size="sm" icon={Printer} className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate(`/reports/${patient.id}`)}>
                        Print
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
