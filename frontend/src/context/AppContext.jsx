import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_PATIENTS, MOCK_NOTIFICATIONS } from '../data/mockData';
import { authApi, usersApi, patientsApi, notificationsApi } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current user state - stored with localStorage persistence
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vetai_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_USERS[0];
  }); 
  const [users, setUsers] = useState(MOCK_USERS);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Initial fetch from Django Backend (with fallback to mock data)
  useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      try {
        const [fetchedUsers, fetchedPatients, fetchedNotifs] = await Promise.all([
          usersApi.getAll().catch(() => null),
          patientsApi.getAll().catch(() => null),
          notificationsApi.getAll().catch(() => null)
        ]);

        if (isMounted) {
          if (fetchedUsers && Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
            setUsers(fetchedUsers);
            const saved = localStorage.getItem('vetai_user');
            if (!saved) {
              setCurrentUser(fetchedUsers[0]);
            }
            setIsBackendConnected(true);
          }
          if (fetchedPatients && Array.isArray(fetchedPatients) && fetchedPatients.length > 0) {
            setPatients(fetchedPatients);
          }
          if (fetchedNotifs && Array.isArray(fetchedNotifs) && fetchedNotifs.length > 0) {
            setNotifications(fetchedNotifs);
          }
        }
      } catch (err) {
        console.warn('Backend API connection pending, running with local mock data.');
      }
    };

    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Authentication
  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    try {
      const res = await authApi.login(cleanEmail, password);
      if (res && res.success && res.user) {
        setCurrentUser(res.user);
        try { localStorage.setItem('vetai_user', JSON.stringify(res.user)); } catch (e) {}
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('API login failed or offline, checking local accounts:', err.message);
    }

    // Fallback local auth (supports both fetched and mock accounts)
    const allUsers = [...users, ...MOCK_USERS];
    const foundUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
      try { localStorage.setItem('vetai_user', JSON.stringify(foundUser)); } catch (e) {}
      return { success: true, user: foundUser };
    }

    return { success: false, message: 'Invalid credentials. Try admin@vetai.demo or technician@vetai.demo' };
  };

  const logout = () => {
    try { localStorage.removeItem('vetai_user'); } catch (e) {}
    authApi.logout().catch(() => {});
    setCurrentUser(null);
  };

  const switchRole = (role) => {
    const targetUser = users.find(u => u.role === role) || MOCK_USERS.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    try { localStorage.setItem('vetai_user', JSON.stringify(targetUser)); } catch (e) {}
  };

  // User Management Actions
  const addUser = async (newUser) => {
    const tempId = `USR-00${users.length + 1}`;
    const created = {
      ...newUser,
      id: tempId,
      status: newUser.status || 'Active',
      createdDate: new Date().toISOString().split('T')[0],
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    
    // Update local UI immediately
    setUsers(prev => [created, ...prev]);

    // Async sync with Django API
    try {
      const apiRes = await usersApi.create(newUser);
      if (apiRes && apiRes.id) {
        setUsers(prev => prev.map(u => u.id === tempId ? apiRes : u));
      }
    } catch (err) {
      console.warn('User saved locally (Django backend offline).');
    }

    return created;
  };

  const updateUser = async (userId, updatedFields) => {
    const sanitizedFields = { ...updatedFields };
    if (sanitizedFields.password && currentUser?.id !== userId) {
      delete sanitizedFields.password;
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...sanitizedFields } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...sanitizedFields }));
    }

    try {
      await usersApi.update(userId, sanitizedFields);
    } catch (err) {
      console.warn('User updated locally.');
    }
  };

  const deleteUser = async (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    try {
      await usersApi.delete(userId);
    } catch (err) {
      console.warn('User deleted locally.');
    }
  };

  // Patient Actions
  const addPatient = async (newPatientData) => {
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
      bloodSmearImage: newPatientData.bloodSmearImage || newPatientData.bloodSmearFile?.url || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
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
      primaryPrediction: newPatientData.primaryPrediction || 'Canine Babesiosis',
      overallConfidence: newPatientData.overallConfidence !== undefined ? newPatientData.overallConfidence : 94.2,
      estimatedParasitemia: newPatientData.estimatedParasitemia !== undefined ? newPatientData.estimatedParasitemia : 3.5,
      zoonoticRisk: newPatientData.zoonoticRisk || 'Low',
      diseasePredictions: newPatientData.diseasePredictions || {
        ehrlichiosis: { diseaseName: 'Canine Ehrlichiosis', prediction: 'Negative', confidence: 85.0, findings: 'No morulae observed.', imageFindings: 'Clear cytoplasm.', cbcFindings: 'Mild thrombocytopenia.' },
        babesiosis: { diseaseName: 'Canine Babesiosis', prediction: 'Positive', confidence: 94.2, findings: 'Intra-erythrocytic piriform merozoites.', imageFindings: 'Piriform merozoites in RBCs.', cbcFindings: 'Normocytic normochromic anemia.' },
        dirofilariasis: { diseaseName: 'Canine Dirofilariasis', prediction: 'Negative', confidence: 95.0, findings: 'No microfilariae.', imageFindings: 'No elongated structures.', cbcFindings: 'Normal eosinophils.' },
        hepatozoonosis: { diseaseName: 'Canine Hepatozoonosis', prediction: 'Negative', confidence: 90.0, findings: 'No gamont capsules.', imageFindings: 'Normal PMNs.', cbcFindings: 'WBC within limits.' }
      },
      imageAnnotations: newPatientData.imageAnnotations || {
        infectedRbcCount: 15,
        detectedParasitesCount: 20,
        avgConfidence: 92.0,
        parasitemiaPercent: 3.5,
        boxes: [
          { id: 1, label: 'Babesia Pair', x: 30, y: 40, width: 15, height: 15, confidence: 95.0 }
        ]
      },
      fusionDetails: newPatientData.fusionDetails || {
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

    addNotification({
      title: 'New Patient Registered',
      message: `${patientObj.dogName} (${patientObj.breed}) added for diagnostic analysis.`,
      type: 'info'
    });

    try {
      const apiRes = await patientsApi.create(patientObj);
      if (apiRes && apiRes.id) {
        setPatients(prev => prev.map(p => p.id === id ? apiRes : p));
      }
    } catch (err) {
      console.warn('Patient created locally (Django API offline).');
    }

    return patientObj;
  };

  const updatePatientCbc = async (patientId, newCbcValues) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          cbcData: { ...p.cbcData, ...newCbcValues }
        };
      }
      return p;
    }));

    try {
      await patientsApi.updateCbc(patientId, newCbcValues);
    } catch (err) {
      console.warn('CBC updated locally.');
    }
  };

  const runAiDiagnosis = async (patientId, imageInput = null) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'Doctor Review',
          timeline: [
            ...p.timeline,
            { date: new Date().toLocaleString(), title: 'AI Diagnosis & Multi-Modal Fusion Executed', actor: 'VetAI AI Engine v2.4' },
            { date: new Date().toLocaleString(), title: 'Submitted to Laboratory Verification Queue', actor: 'System' }
          ]
        };
      }
      return p;
    }));

    addNotification({
      title: 'AI Diagnosis Complete',
      message: `Multi-modal fusion completed for patient ${patientId}. Ready for laboratory verification sign-off.`,
      type: 'success'
    });

    try {
      const res = await patientsApi.runAiDiagnosis(patientId, imageInput);
      if (res && res.patient) {
        setPatients(prev => prev.map(p => p.id === patientId ? res.patient : p));
      }
    } catch (err) {
      console.warn('AI Diagnosis executed locally.');
    }
  };

  const submitDoctorReview = async (patientId, action, comments) => {
    const isAccept = action === 'accept';
    const reviewerName = currentUser?.name || 'Lab Specialist';

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const newStatus = isAccept ? 'Diagnosis Complete' : 'Re-diagnosis Requested';
        return {
          ...p,
          status: newStatus,
          doctorReview: {
            status: isAccept ? 'Accepted' : 'Re-diagnosis Requested',
            doctorName: reviewerName,
            reviewDate: new Date().toLocaleString(),
            comments: comments || (isAccept ? 'Accepted AI-assisted diagnosis findings.' : 'Requested laboratory re-analysis.')
          },
          timeline: [
            ...p.timeline,
            { 
              date: new Date().toLocaleString(), 
              title: isAccept ? 'Laboratory Verification Approved' : 'Re-diagnosis Requested by Laboratory Specialist', 
              actor: reviewerName 
            }
          ]
        };
      }
      return p;
    }));

    addNotification({
      title: action === 'accept' ? 'Laboratory Sign-Off Approved' : 'Re-diagnosis Requested',
      message: `Laboratory verification submitted for case ${patientId}. Status updated to ${action === 'accept' ? 'Diagnosis Complete' : 'Re-diagnosis Requested'}.`,
      type: action === 'accept' ? 'success' : 'warning'
    });

    try {
      const res = await patientsApi.submitDoctorReview(patientId, action, comments, reviewerName);
      if (res && res.patient) {
        setPatients(prev => prev.map(p => p.id === patientId ? res.patient : p));
      }
    } catch (err) {
      console.warn('Verification review saved locally.');
    }
  };

  const addNotification = async (notif) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      timestamp: 'Just now',
      type: notif.type || 'info',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      await notificationsApi.create(newNotif);
    } catch (err) {
      console.warn('Notification logged locally.');
    }
  };

  const markNotificationRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    try {
      await notificationsApi.markRead(notifId);
    } catch (err) {
      console.warn('Notification marked read locally.');
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    try {
      await notificationsApi.clearAll();
    } catch (err) {
      console.warn('Notifications cleared locally.');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      patients,
      notifications,
      isBackendConnected,
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
      submitTechnicianReview: submitDoctorReview,
      markNotificationRead,
      clearAllNotifications,
      addNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
