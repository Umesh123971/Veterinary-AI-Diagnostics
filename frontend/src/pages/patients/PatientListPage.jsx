import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Search, Plus, Eye, FolderKanban, Stethoscope } from 'lucide-react';

export const PatientListPage = () => {
  const { patients } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p =>
    p.dogName.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.breed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card
        title="Canine Patient Management"
        subtitle="Catalog of all registered canine patients and diagnostic statuses"
        action={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dog, owner, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none w-64"
              />
            </div>
            <Button variant="primary" icon={Plus} onClick={() => navigate('/patients/new')}>
              Add Patient
            </Button>
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
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((patient) => (
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
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      View Profile
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
