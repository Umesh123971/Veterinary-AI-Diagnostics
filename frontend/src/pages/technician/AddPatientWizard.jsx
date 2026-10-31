import React,{useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useApp} from '../../context/AppContext';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {Upload,ArrowRight,Loader2} from 'lucide-react';
const defaults={dogName:'',ownerName:'',age:'',sex:'Male',breed:'',weight:'',contactNumber:'',sampleDate:new Date().toLocaleDateString('en-CA'),clinicalNotes:''};
export const AddPatientWizard=()=>{
 const {addPatient}=useApp(),navigate=useNavigate();
 const [form,setForm]=useState(defaults),[report,setReport]=useState(null),[image,setImage]=useState(null),[preview,setPreview]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(!image){setPreview('');return}const url=URL.createObjectURL(image);setPreview(url);return()=>URL.revokeObjectURL(url)},[image]);
 const save=async e=>{e.preventDefault();setBusy(true);setError('');try{const data=new FormData();Object.entries(form).forEach(([k,v])=>data.append(k,v));if(report)data.append('report',report);if(image)data.append('image',image);const patient=await addPatient(data);navigate(`/patients/${patient.id}`)}catch(e){setError(e.message)}finally{setBusy(false)}};
 return <form onSubmit={save} className="max-w-5xl mx-auto space-y-6">
 <div><p className="text-xs font-semibold text-teal-700 uppercase tracking-widest">Patient record / CBC review / Image and fusion</p><h1 className="text-2xl font-bold text-slate-900 mt-2">Add canine patient</h1><p className="text-sm text-slate-500 mt-1">Save the record, then click Diagnose to extract and review the CBC before image analysis.</p></div>
 {error&&<div role="alert" className="p-4 bg-rose-50 text-rose-800 rounded-lg">{error}</div>}
 <Card title="Patient and owner details"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[['dogName','Animal name',true],['ownerName','Owner name',true],['age','Age'],['breed','Breed'],['weight','Weight (kg)'],['contactNumber','Contact number']].map(([key,label,required])=><label key={key} className="text-sm text-slate-700">{label}{required?' *':''}<input required={required} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-1 w-full border rounded-lg p-2" /></label>)}
 <label className="text-sm">Sex<select value={form.sex} onChange={e=>setForm({...form,sex:e.target.value})} className="mt-1 w-full border rounded-lg p-2">{['Male','Female','Neutered male','Spayed female'].map(s=><option key={s}>{s}</option>)}</select></label>
 <label className="text-sm">Sample date<input type="date" value={form.sampleDate} onChange={e=>setForm({...form,sampleDate:e.target.value})} className="mt-1 w-full border rounded-lg p-2" /></label></div>
 <label className="block text-sm mt-4">Clinical notes<textarea value={form.clinicalNotes} onChange={e=>setForm({...form,clinicalNotes:e.target.value})} className="w-full mt-1 border rounded-lg p-2" rows={3}/></label></Card>
 <div className="grid md:grid-cols-2 gap-6"><Card title="CBC report" subtitle="Text-based PDF, up to 20 MB"><label className="block p-6 border-2 border-dashed rounded-xl bg-slate-50 text-sm"><Upload className="w-7 h-7 text-teal-600 mb-3"/>Choose CBC report<input aria-label="CBC report PDF" type="file" accept="application/pdf,.pdf" onChange={e=>setReport(e.target.files[0]||null)} className="mt-3 w-full"/></label>{report&&<p className="text-sm mt-3">{report.name}</p>}<p className="text-xs text-slate-500 mt-3">If there is no readable PDF, the next step supports manual CBC entry.</p></Card>
 <Card title="Blood-smear image" subtitle="JPG, PNG or WebP, up to 15 MB"><label className="block text-sm">Choose microscope image<input aria-label="Blood-smear image" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setImage(e.target.files[0]||null)} className="mt-3 w-full"/></label>{preview&&<img src={preview} alt="Uploaded blood smear preview" className="h-48 max-w-full object-contain mt-4 rounded-lg"/>}<p className="text-xs text-slate-500 mt-3">If the image or model is unavailable, a clearly labelled CBC-only result will be provided.</p></Card></div>
 <div className="flex justify-end"><Button type="submit" disabled={busy} icon={busy?Loader2:ArrowRight}>{busy?'Saving record...':'Save Patient'}</Button></div></form>;
};
