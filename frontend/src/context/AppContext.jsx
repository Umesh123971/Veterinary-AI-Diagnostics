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
  const [patients, setPatients] = useState([]);
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
          if (fetchedPatients && Array.isArray(fetchedPatients)) {
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

  // Clinical records are persisted by the backend; failed requests never create demo results.
  const syncPatient = patient => {
    setPatients(previous => previous.some(p => p.id === patient.id)
      ? previous.map(p => p.id === patient.id ? patient : p) : [patient,...previous]);
    return patient;
  };
  const refreshPatient = async id => syncPatient(await patientsApi.getById(id));
  const addPatient = async data => syncPatient(await patientsApi.create(data));
  const updatePatientCbc = async (id,values,options) => {
    const response=await patientsApi.updateCbc(id,values,options);
    return syncPatient(response.patient);
  };
  const runAiDiagnosis = async (id,options={}) => {
    const response=await patientsApi.runAiDiagnosis(id,options);
    return syncPatient(response.patient);
  };

  const submitDoctorReview = async (id,action,comments) => {
    const response=await patientsApi.submitDoctorReview(id,action,comments,currentUser?.name || 'Technician');
    return syncPatient(response.patient);
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
      syncPatient,
      refreshPatient,
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
