import React from 'react';
import {Navigate,useParams} from 'react-router-dom';
export const ReDiagnosisPage=()=>{const {id}=useParams();return <Navigate replace to={`/patients/${id}/diagnose`}/>};
