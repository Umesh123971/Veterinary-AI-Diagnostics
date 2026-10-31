import React,{useEffect,useState} from 'react';
export const UploadedPdfPreview=({url})=>{
 const [preview,setPreview]=useState(''),[error,setError]=useState('');
 useEffect(()=>{const controller=new AbortController();let objectUrl='';setPreview('');setError('');fetch(url,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('The uploaded PDF could not be loaded');return response.blob()}).then(blob=>{if(!controller.signal.aborted){objectUrl=URL.createObjectURL(blob);setPreview(objectUrl)}}).catch(error=>{if(error.name!=='AbortError')setError(error.message)});return()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)}},[url]);
 if(error)return <p role="alert" className="text-sm text-amber-800">{error}. Use Open PDF to view it in a separate tab.</p>;
 return preview?<iframe title="Uploaded CBC report" src={preview} className="w-full h-[780px] border rounded-lg"/>:<p role="status" className="text-sm text-slate-500">Loading uploaded PDF...</p>;
};
