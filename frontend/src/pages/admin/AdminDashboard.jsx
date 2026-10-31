import React from 'react';
import {Link} from 'react-router-dom';
import {useApp} from '../../context/AppContext';
import {Card} from '../../components/common/Card';
export const AdminDashboard=()=>{
 const {patients,users,isBackendConnected}=useApp();
 const analysed=patients.filter(p=>p.fusionDetails?.mode),fallback=analysed.filter(p=>p.fusionDetails.mode==='cbc_only');
 return <div className="space-y-6"><div className="bg-slate-900 text-white p-6 rounded-xl"><h1 className="text-2xl font-bold">Veterinary screening workspace</h1><p className="text-sm text-slate-300 mt-2">Reviewed CBC parameters, Ehrlichiosis image analysis and transparent weighted screening.</p><div className="flex gap-5 mt-4 text-sm text-teal-300 underline"><Link to="/patients/new">Add patient</Link><Link to="/patients">Patient records</Link><Link to="/results">Screening results</Link></div></div>
 {!isBackendConnected&&<p role="alert" className="bg-amber-50 p-4 rounded-lg text-amber-900">Connecting to the backend. Patient records and analyses require a working API.</p>}
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[['Patient records',patients.length],['Current screening results',analysed.length],['CBC-only results',fallback.length],['Users',users.length]].map(([label,value])=><Card key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></Card>)}</div>
 <Card title="Integrated models"><div className="grid sm:grid-cols-2 gap-4">{[['Canine Ehrlichiosis','ResNet50 image score + YOLOv8s localization + rule-based CBC'],['Canine Babesiosis','Model not integrated'],['Canine Dirofilariasis','Model not integrated'],['Canine Hepatozoonosis','Model not integrated']].map(([name,state])=><div key={name} className="p-4 bg-slate-50 rounded-lg border"><h2 className="font-semibold text-sm">{name}</h2><p className="text-xs text-slate-500 mt-2">{state}</p></div>)}</div></Card>
 <Card title="How screening works"><p className="text-sm text-slate-600">CBC values are extracted, corrected and confirmed by a technician. The combined experimental score uses 30% CBC and 70% ResNet50, with YOLO localization evidence shown separately. If image analysis is unavailable, the result uses CBC alone.</p><p className="mt-3 text-sm text-amber-800">No validated accuracy is claimed for this combined workflow. The image detector has limited validation, and CBC patterns are nonspecific.</p></Card></div>;
};
