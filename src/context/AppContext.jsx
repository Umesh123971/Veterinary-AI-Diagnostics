import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_NOTIFICATIONS } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current user state - defaults to Admin for demo convenience, or set on login
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]); 
  const [users, setUsers] = useState(MOCK_USERS);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Authentication
  const login = (email, password) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Invalid credentials. Try admin@vetai.demo, technician@vetai.demo, or doctor@vetai.demo' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role) => {
    const targetUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
  };

  // User Management Actions
  const addUser = (newUser) => {
    const created = {
      ...newUser,
      id: `USR-00${users.length + 1}`,
      status: newUser.status || 'Active',
      createdDate: new Date().toISOString().split('T')[0],
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setUsers(prev => [created, ...prev]);
    return created;
  };

  const updateUser = (userId, updatedFields) => {
    // IMPORTANT: Security rule - Administrators cannot directly edit another user's password.
    // If updatedFields includes password, only allow if currentUser.id === userId
    const sanitizedFields = { ...updatedFields };
    if (sanitizedFields.password && currentUser?.id !== userId) {
      delete sanitizedFields.password;
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...sanitizedFields } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...sanitizedFields }));
    }
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Patient Actions
  const addPatient = (newPatientData) => {
    const id = `PAT-2026-00${patients.length + 1}`;
    const patientObj = {
      id,
      dogName: newPatientData.dogName || 'Unnamed Dog',
      ownerName: newPatientData.ownerName || 'Unknown Owner',
      age: newPatientData.age || '3 years',
      sex: newPatientData.sex || 'Male',
      breed: newPatientData.breed || 'Mixed Breed',
      weight: newPatientData.weight || '20.0 kg',
      contactNumber: newPatientData.contactNumber || '+94 77 000 0000',
      sampleDate: newPatientData.sampleDate || new Date().toISOString().split('T')[0],
      status: newPatientData.status || 'Awaiting Diagnosis',
      clinicalNotes: newPatientData.clinicalNotes || '',
      bloodSmearImage: newPatientData.bloodSmearImage || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
      cbcReportPdf: newPatientData.cbcReportPdf || `${newPatientData.dogName || 'Patient'}_CBC_Report.pdf`,
      cbcData: newPatientData.cbcData || {
        rbc: { value: 4.5, status: 'Low' },
        pcv: { value: 30, status: 'Low' },
        hb: { value: 10.0, status: 'Low' },
        wbc: { value: 13.0, status: 'Normal' },
        platelets: { value: 170, status: 'Low' },
        neutrophils: { value: 70, status: 'Normal' },
        lymphocytes: { value: 18, status: 'Normal' },
        monocytes: { value: 7, status: 'Normal' },
        eosinophils: { value: 4, status: 'Normal' },
        basophils: { value: 1, status: 'Normal' },
      },
      primaryPrediction: 'Canine Babesiosis',
      overallConfidence: 94.2,
      estimatedParasitemia: 3.5,
      zoonoticRisk: 'Low',
      diseasePredictions: {
        ehrlichiosis: { diseaseName: 'Canine Ehrlichiosis', prediction: 'Negative', confidence: 85.0, findings: 'No morulae observed.', imageFindings: 'Clear cytoplasm.', cbcFindings: 'Mild thrombocytopenia.' },
        babesiosis: { diseaseName: 'Canine Babesiosis', prediction: 'Positive', confidence: 94.2, findings: 'Intra-erythrocytic piriform merozoites.', imageFindings: 'Piriform merozoites in RBCs.', cbcFindings: 'Normocytic normochromic anemia.' },
        dirofilariasis: { diseaseName: 'Canine Dirofilariasis', prediction: 'Negative', confidence: 95.0, findings: 'No microfilariae.', imageFindings: 'No elongated structures.', cbcFindings: 'Normal eosinophils.' },
        hepatozoonosis: { diseaseName: 'Canine Hepatozoonosis', prediction: 'Negative', confidence: 90.0, findings: 'No gamont capsules.', imageFindings: 'Normal PMNs.', cbcFindings: 'WBC within limits.' }
      },
      imageAnnotations: {
        infectedRbcCount: 15,
        detectedParasitesCount: 20,
        avgConfidence: 92.0,
        parasitemiaPercent: 3.5,
        boxes: [
          { id: 1, label: 'Babesia Pair', x: 30, y: 40, width: 15, height: 15, confidence: 95.0 }
        ]
      },
      fusionDetails: {
        visualWeight: 0.65,
        hematologicalWeight: 0.35,
        fusionScore: 0.942,
        fusionExplanation: 'Deep late-fusion decision layer combined visual merozoites (65%) and anemic CBC indicators (35%).'
      },
      doctorReview: {
        status: 'Pending',
        doctorName: '',
        reviewDate: '',
        comments: ''
      },
      timeline: [
        { date: new Date().toLocaleString(), title: 'Patient Registered & Data Uploaded', actor: currentUser?.name || 'Lab Tech' },
      ]
    };

    setPatients(prev => [patientObj, ...prev]);

    // Add notification
    addNotification({
      title: 'New Patient Registered',
      message: `${patientObj.dogName} (${patientObj.breed}) added for diagnostic analysis.`,
      type: 'info'
    });

    return patientObj;
  };

  const updatePatientCbc = (patientId, newCbcValues) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          cbcData: { ...p.cbcData, ...newCbcValues }
        };
      }
      return p;
    }));
  };

  const runAiDiagnosis = (patientId) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'Doctor Review',
          timeline: [
            ...p.timeline,
            { date: new Date().toLocaleString(), title: 'AI Diagnosis & Multi-Modal Fusion Executed', actor: 'VetAI AI Engine v2.4' },
            { date: new Date().toLocaleString(), title: 'Submitted to Doctor Review Queue', actor: 'System' }
          ]
        };
      }
      return p;
    }));

    addNotification({
      title: 'AI Diagnosis Complete',
      message: `Multi-modal fusion completed for patient ${patientId}. Sent to Doctor Review queue.`,
      type: 'success'
    });
  };

  const submitDoctorReview = (patientId, action, comments) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const isAccept = action === 'accept';
        const newStatus = isAccept ? 'Diagnosis Complete' : 'Re-diagnosis Requested';
        
        return {
          ...p,
          status: newStatus,
          doctorReview: {
            status: isAccept ? 'Accepted' : 'Re-diagnosis Requested',
            doctorName: currentUser?.name || 'Dr. Marcus Sterling',
            reviewDate: new Date().toLocaleString(),
            comments: comments || (isAccept ? 'Accepted AI-assisted diagnosis findings.' : 'Requested laboratory re-analysis.')
          },
          timeline: [
            ...p.timeline,
            { 
              date: new Date().toLocaleString(), 
              title: isAccept ? 'Doctor Review Approved' : 'Re-diagnosis Requested by Doctor', 
              actor: currentUser?.name || 'Doctor' 
            }
          ]
        };
      }
      return p;
    }));

    addNotification({
      title: action === 'accept' ? 'Diagnosis Approved' : 'Re-diagnosis Requested',
      message: `Doctor review submitted for case ${patientId}. Status updated to ${action === 'accept' ? 'Complete' : 'Re-diagnosis Requested'}.`,
      type: action === 'accept' ? 'success' : 'warning'
    });
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      timestamp: 'Just now',
      type: notif.type || 'info',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      patients,
      notifications,
      login,
      logout,
      switchRole,
      addUser,
      updateUser,
      deleteUser,
      addPatient,
      updatePatientCbc,
      runAiDiagnosis,
      submitDoctorReview,
      markNotificationRead,
      clearAllNotifications,
      addNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
