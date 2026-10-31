import React, {useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {usePatientRecord} from '../../hooks/usePatientRecord';
import {IntegratedAnalysis} from '../../components/diagnosis/IntegratedAnalysis';
import {Button} from '../../components/common/Button';
export const ViewReportPage=()=>{
 const [downloading,setDownloading]=useState(false),[downloadError,setDownloadError]=useState('');
 const {id}=useParams(),{patient,loading,error}=usePatientRecord(id);
 if(loading)return <p>Loading report...</p>;
 if(error||!patient)return <p role="alert">{error||'Patient not found'}</p>;
 const downloadPdf=async()=>{
  setDownloading(true);setDownloadError('');
  try{
   const base=import.meta.env.VITE_API_BASE_URL||'http://localhost:8000/api';
   const response=await fetch(`${base}/patients/${encodeURIComponent(id)}/download-report/`,{headers:{Accept:'*/*'}});
   if(!response.ok)throw new Error('Report download failed. Please try again.');
   const blob=await response.blob();
   if(!blob.type.includes('application/pdf'))throw new Error('The server did not return a PDF report.');
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${patient.id}-screening-report.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(error){setDownloadError(error.message)}finally{setDownloading(false)}
 };
 const download=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(patient,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${patient.id}-screening.json`;a.click();URL.revokeObjectURL(url)};
 return <div className="max-w-6xl mx-auto space-y-6"><div className="print:hidden flex justify-between items-center gap-3"><Link className="text-teal-700 underline" to={`/results/${id}`}>Back to results</Link><div className="flex gap-3"><Button variant="outline" onClick={download}>Download JSON report</Button><Button variant="outline" onClick={()=>window.print()}>Print report</Button><Button onClick={downloadPdf} disabled={downloading}>{downloading?'Preparing PDF...':'Download Report'}</Button></div></div>{downloadError&&<p role="alert" className="text-red-700">{downloadError}</p>}<div className="bg-white p-6 rounded-xl border"><h1 className="text-2xl font-bold">Veterinary research screening report</h1><p className="mt-2">{patient.dogName} / {patient.id} / Owner: {patient.ownerName}</p><p className="text-sm text-slate-500">{patient.breed} - {patient.age} - {patient.sex} - Sample date: {patient.sampleDate}</p><p className="text-sm mt-3">Technician review: {patient.doctorReview?.status||'Pending'}</p>{patient.doctorReview?.comments&&<p className="text-sm mt-1">Review comments: {patient.doctorReview.comments}</p>}</div><IntegratedAnalysis patient={patient}/></div>;
};
