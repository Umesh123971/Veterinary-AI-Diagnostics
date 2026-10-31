import {useState,useEffect} from 'react';
import {useApp} from '../context/AppContext';
export function usePatientRecord(id) {
  const {patients,refreshPatient}=useApp();
  const [loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{let active=true;setLoading(true);setError('');refreshPatient(id).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
  return {patient:patients.find(p=>p.id===id),loading,error};
}
