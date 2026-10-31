import React,{useState,useEffect,useRef} from 'react';
import {useParams,useNavigate,Link} from 'react-router-dom';
import {useApp} from '../../context/AppContext';
import {patientsApi} from '../../services/api';
import {Card} from '../../components/common/Card';
import {UploadedPdfPreview} from '../../components/common/UploadedPdfPreview';
import {Button} from '../../components/common/Button';
import {ArrowRight,RefreshCw,Loader2} from 'lucide-react';
const CORE=['rbc','pcv','hb','wbc','platelets'];
const pendingExtractions=new Map();
const extractOnce=(id,force)=>{
 if(force)return patientsApi.extractCbc(id,true);
 if(!pendingExtractions.has(id))pendingExtractions.set(id,patientsApi.extractCbc(id).finally(()=>pendingExtractions.delete(id)));
 return pendingExtractions.get(id);
};
export const CbcReviewDiagnosis=()=>{
 const {id}=useParams(),navigate=useNavigate(),{syncPatient}=useApp();
 const loadVersion=useRef(0);
 const [patient,setPatient]=useState(null),[draft,setDraft]=useState({}),[profile,setProfile]=useState('report'),[ack,setAck]=useState(false),[busy,setBusy]=useState(true),[stage,setStage]=useState('Extracting CBC values...'),[error,setError]=useState('');
 const load=async(force=false)=>{const version=++loadVersion.current;setBusy(true);setError('');setAck(false);setStage('Extracting CBC values...');try{const res=await extractOnce(id,force);if(version!==loadVersion.current)return;const p=res.patient;setPatient(p);syncPatient(p);setDraft(Object.fromEntries((p.cbcExtraction.parameters||[]).map(param=>[param.key,p.cbcData[param.key]?.value??''])));setProfile(p.cbcAnalysis?.profile||p.cbcExtraction?.review?.referenceProfile||'report')}catch(e){if(version===loadVersion.current)setError(e.message)}finally{if(version===loadVersion.current)setBusy(false)}};
 useEffect(()=>{load();return()=>{loadVersion.current++}},[id]);
 const start=async()=>{setBusy(true);setError('');try{setStage('Checking reviewed CBC against the selected reference intervals...');const reviewed=await patientsApi.updateCbc(id,Object.fromEntries(Object.entries(draft).map(([key,value])=>[key,{value}])),{cbcRevision:patient.cbcRevision,referenceProfile:profile,confirmed:ack});setPatient(reviewed.patient);syncPatient(reviewed.patient);setStage('CBC analysis saved. Running Ehrlichiosis image analysis and weighted fusion...');const res=await patientsApi.runAiDiagnosis(id,{cbcRevision:reviewed.patient.cbcRevision});syncPatient(res.patient);navigate(`/results/${id}`)}catch(e){setError(e.message)}finally{setBusy(false)}};
 const parameters=patient?.cbcExtraction?.parameters||[];
 const changed=(key,value)=>{setDraft(old=>({...old,[key]:value}));setAck(false)};
 return <div className="space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Step 1: review CBC / Step 2: image and fusion</p><h1 className="text-2xl font-bold mt-2">Review extracted CBC values</h1><p className="text-sm text-slate-500 mt-1">{patient?.dogName} - Confirm measurements and units before image analysis.</p></div><Link className="text-teal-700 text-sm underline" to={`/patients/${id}`}>Back to patient</Link></div>
 {error&&<div role="alert" className="p-4 bg-rose-50 text-rose-800 rounded-lg">{error} <button onClick={()=>load()} className="underline ml-2">Reload review</button></div>}
 {busy&&<div role="status" className="p-5 border border-teal-200 bg-teal-50 rounded-xl flex gap-3 items-center"><Loader2 className="animate-spin w-5 h-5 text-teal-600"/><span>{stage}</span></div>}
 {patient&&<>
 <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm"><strong>Review required.</strong> Extraction can misread values, multipliers and differential units. Blank values stay blank; correct them using the original report. CBC patterns are not specific to Ehrlichiosis.</div>
 {!!patient.cbcExtraction?.warnings?.length&&<details className="bg-white border rounded-lg p-4" open><summary className="font-semibold cursor-pointer text-sm">Extraction notes ({patient.cbcExtraction.warnings.length})</summary><ul className="list-disc ml-5 mt-2 space-y-1 text-xs text-slate-600">{patient.cbcExtraction.warnings.map((warning,i)=><li key={i}>{warning}</li>)}</ul></details>}
 <div className="grid xl:grid-cols-3 gap-6"><div className="xl:col-span-1"><Card title="Original CBC report" action={patient.hasCbcReport?<a href={patient.cbcReportPdf} target="_blank" rel="noreferrer" className="text-xs text-teal-700 underline">Open PDF</a>:null}>{patient.hasCbcReport?<UploadedPdfPreview url={patient.cbcReportPdf}/>:<p className="text-sm text-slate-500">No uploaded PDF is available. Enter the measured CBC values manually.</p>}<Button className="mt-4" variant="outline" size="sm" icon={RefreshCw} disabled={busy} onClick={()=>{if(window.confirm('Re-extract the PDF? This replaces the current CBC draft.'))load(true)}}>Re-extract PDF</Button></Card></div>
 <div className="xl:col-span-2"><Card title="Editable CBC parameters"><label className="block text-sm mb-4">Reference profile<select value={profile} disabled={busy} onChange={e=>{setProfile(e.target.value);setAck(false)}} className="block border rounded-lg p-2 mt-1 w-full"><option value="report">Report lab intervals when available; Cornell fallback</option><option value="cornell">Published adult canine intervals (Cornell)</option></select></label>
 <p className="text-xs text-slate-500 mb-4">Published intervals are method-specific. The five starred values are required. Percentage and absolute differential counts are separate measurements.</p>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left"><th className="p-2">Parameter</th><th className="p-2">Measured value</th><th className="p-2">Unit</th><th className="p-2">Reference / source</th><th className="p-2">Flag</th></tr></thead><tbody>{parameters.map(p=>{const range=profile==='report'&&patient.cbcExtraction.reportRanges?.[p.key]||p;const value=draft[p.key];const flag=value===''||value==null?'Not entered':Number(value)<range.min?'Low':Number(value)>range.max?'High':'Normal';return <tr key={p.key} className="border-b border-slate-100"><td className="p-2 font-medium">{p.name}{CORE.includes(p.key)?' *':''}</td><td className="p-2"><input aria-label={`${p.name} value`} title={patient.cbcExtraction.values?.[p.key]?.raw||'Manual entry'} type="number" min="0" max={p.unit==='%'?100:undefined} step="any" disabled={busy} value={value??''} onChange={e=>changed(p.key,e.target.value)} className="w-28 border border-slate-300 rounded-lg p-2"/></td><td className="p-2 text-xs text-slate-500 whitespace-nowrap">{p.unit}</td><td className="p-2 text-xs"><span className="block whitespace-nowrap">{range.min} - {range.max}</span><span className="text-slate-500">{range.source==='Reporting laboratory'?'Report lab':'Cornell canine'}</span></td><td className="p-2"><span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${flag==='Low'||flag==='High'?'bg-amber-100 text-amber-900':flag==='Normal'?'bg-emerald-50 text-emerald-800':'bg-slate-100 text-slate-500'}`}>{flag}</span></td></tr>})}</tbody></table></div>
 <label className="flex items-start gap-3 text-sm mt-5 bg-slate-50 p-4 rounded-lg"><input type="checkbox" checked={ack} disabled={busy} onChange={e=>setAck(e.target.checked)} className="mt-1"/>I checked the extracted or manually entered values, units, patient report and reference profile.</label>
 <Button className="mt-4 w-full" icon={ArrowRight} disabled={busy||!ack} onClick={start}>Confirm CBC & Continue to Image Analysis</Button><p className="text-xs text-slate-500 mt-3">Combined score = 30% CBC + 70% ResNet50. YOLO supplies boxes. If image inference fails, use CBC alone with a visible warning.</p>
 </Card></div></div></>}
 </div>;
};
