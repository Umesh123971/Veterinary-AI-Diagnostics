import React from 'react';
import {useParams,Link} from 'react-router-dom';
import {usePatientRecord} from '../../hooks/usePatientRecord';
import {IntegratedAnalysis} from '../../components/diagnosis/IntegratedAnalysis';
export const DiagnosticResultPage=()=>{
 const {id}=useParams(),{patient,loading,error}=usePatientRecord(id);
 if(loading)return <p role="status">Loading analysis...</p>;
 if(error||!patient)return <p role="alert">{error||'Patient not found'}</p>;
 return <div className="space-y-6"><div className="flex flex-wrap gap-4 justify-between items-center"><div><h1 className="text-2xl font-bold">Screening result: {patient.dogName}</h1><p className="text-sm text-slate-500 mt-1">{patient.id} - {patient.sampleDate} - {patient.status}</p></div><div className="flex flex-wrap gap-4 text-sm text-teal-700 underline"><Link to={`/patients/${id}`}>Patient record</Link><Link to={`/patients/${id}/diagnose`}>Edit CBC / Re-analyse</Link><Link to={`/technician/review/${id}`}>Technician verification</Link><Link to={`/reports/${id}`}>Printable report</Link></div></div><IntegratedAnalysis patient={patient}/></div>;
};
