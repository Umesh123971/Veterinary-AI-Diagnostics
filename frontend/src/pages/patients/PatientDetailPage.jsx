import React,{useState} from 'react';
import {useParams,Link,useNavigate} from 'react-router-dom';
import {usePatientRecord} from '../../hooks/usePatientRecord';
import {useApp} from '../../context/AppContext';
import {patientsApi} from '../../services/api';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {IntegratedAnalysis} from '../../components/diagnosis/IntegratedAnalysis';
export const PatientDetailPage=()=>{
 const {id}=useParams(),navigate=useNavigate(),{syncPatient}=useApp(),{patient,loading,error}=usePatientRecord(id);
 const [report,setReport]=useState(null),[image,setImage]=useState(null),[busy,setBusy]=useState(false),[uploadError,setUploadError]=useState('');
 const replace=async()=>{setBusy(true);setUploadError('');try{const data=new FormData();if(report)data.append('report',report);if(image)data.append('image',image);const res=await patientsApi.replaceFiles(id,data);syncPatient(res.patient);navigate(`/patients/${id}/diagnose`)}catch(e){setUploadError(e.message)}finally{setBusy(false)}};
 if(loading)return <p role="status">Loading patient...</p>;
 if(error||!patient)return <p role="alert" className="text-rose-700">{error||'Patient not found'}</p>;
 return <div className="space-y-6"><div className="flex flex-wrap gap-4 justify-between items-center"><div><Link to="/patients" className="text-sm underline text-teal-700">All patients</Link><h1 className="text-2xl font-bold mt-2">{patient.dogName}</h1><p className="text-sm text-slate-500">{patient.id} - {patient.status}</p></div><Button onClick={()=>navigate(`/patients/${id}/diagnose`)}>{patient.fusionDetails?.mode?'Review CBC / Re-diagnose':'Diagnose'}</Button></div>
 <Card title="Animal record"><dl className="grid sm:grid-cols-3 gap-5 text-sm">{[['Owner',patient.ownerName],['Age',patient.age],['Sex',patient.sex],['Breed',patient.breed],['Weight',patient.weight],['Sample date',patient.sampleDate]].map(([label,value])=><div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="font-semibold mt-1">{value||'Not entered'}</dd></div>)}</dl><p className="text-sm mt-5">{patient.clinicalNotes||'No clinical notes entered.'}</p><div className="flex gap-4 text-sm text-teal-700 underline mt-4">{patient.hasCbcReport&&<a href={patient.cbcReportPdf} target="_blank" rel="noreferrer">View original CBC PDF</a>}{patient.hasBloodSmear&&<a href={patient.bloodSmearImage} target="_blank" rel="noreferrer">View uploaded smear</a>}</div></Card>
 <IntegratedAnalysis patient={patient}/>
 <Card title="Replace clinical files" subtitle="Replacing a file clears the previous analysis and requires CBC review again."><div className="grid sm:grid-cols-2 gap-4"><label className="text-sm">CBC PDF<input aria-label="Replace CBC PDF" type="file" accept=".pdf" onChange={e=>setReport(e.target.files[0]||null)} className="block mt-2"/></label><label className="text-sm">Blood-smear image<input aria-label="Replace blood-smear image" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setImage(e.target.files[0]||null)} className="block mt-2"/></label></div>{uploadError&&<p role="alert" className="text-rose-700 mt-3">{uploadError}</p>}<Button className="mt-4" variant="outline" disabled={busy||(!report&&!image)} onClick={replace}>{busy?'Saving...':'Replace & Review CBC'}</Button></Card>
 <Card title="Case timeline"><ol className="space-y-3 text-sm">{patient.timeline?.map((event,i)=><li key={i}><span className="text-slate-400 text-xs">{event.date}</span><p>{event.title}</p></li>)}</ol></Card></div>;
};
