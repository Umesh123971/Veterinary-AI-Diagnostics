import React,{useState} from 'react';
import {useParams,useNavigate,Link} from 'react-router-dom';
import {usePatientRecord} from '../../hooks/usePatientRecord';
import {useApp} from '../../context/AppContext';
import {IntegratedAnalysis} from '../../components/diagnosis/IntegratedAnalysis';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
export const TechnicianReviewPage=()=>{
 const {id}=useParams(),navigate=useNavigate(),{submitDoctorReview}=useApp(),{patient,loading,error}=usePatientRecord(id);
 const [action,setAction]=useState('accept'),[comments,setComments]=useState(''),[busy,setBusy]=useState(false),[failure,setFailure]=useState('');
 const submit=async e=>{e.preventDefault();setBusy(true);setFailure('');try{await submitDoctorReview(id,action,comments);navigate(`/results/${id}`)}catch(e){setFailure(e.message)}finally{setBusy(false)}};
 if(loading)return <p>Loading case...</p>;if(error||!patient)return <p role="alert">{error||'Patient not found'}</p>;
 return <div className="space-y-6"><div><Link className="text-teal-700 underline text-sm" to={`/results/${id}`}>Back to results</Link><h1 className="text-2xl font-bold mt-2">Technician review: {patient.dogName}</h1></div><IntegratedAnalysis patient={patient}/>{patient.fusionDetails?.mode&&<Card title="Record your review"><form onSubmit={submit} className="space-y-4"><label className="block text-sm">Decision<select className="block border p-2 rounded mt-1" value={action} onChange={e=>setAction(e.target.value)}><option value="accept">Accept reviewed screening record</option><option value="reject">Request re-analysis</option></select></label><label className="block text-sm">Review comments<textarea required value={comments} onChange={e=>setComments(e.target.value)} className="block border rounded p-2 w-full mt-1" rows={3}/></label><p className="text-xs text-slate-500">Reviewing a screening record does not establish a confirmed clinical diagnosis.</p>{failure&&<p role="alert" className="text-rose-700">{failure}</p>}<Button type="submit" disabled={busy}>{busy?'Saving review...':'Save verification'}</Button></form></Card>}</div>;
};
