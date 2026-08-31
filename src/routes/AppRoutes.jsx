import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/auth/Login';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { TechnicianDashboard } from '../pages/technician/TechnicianDashboard';
import { AddPatientWizard } from '../pages/technician/AddPatientWizard';
import { ReDiagnosisPage } from '../pages/technician/ReDiagnosisPage';
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { DoctorReviewPage } from '../pages/doctor/DoctorReviewPage';
import { PatientListPage } from '../pages/patients/PatientListPage';
import { PatientDetailPage } from '../pages/patients/PatientDetailPage';
import { DiagnosisWorkflowPage } from '../pages/diagnosis/DiagnosisWorkflowPage';
import { DiagnosticResultsPage } from '../pages/diagnosis/DiagnosticResultsPage';
import { DiagnosticResultPage } from '../pages/diagnosis/DiagnosticResultPage';
import { ReportsListPage } from '../pages/reports/ReportsListPage';
import { ViewReportPage } from '../pages/reports/ViewReportPage';
import { UserProfilePage } from '../pages/profile/UserProfilePage';

export const AppRoutes = () => {
  const { currentUser } = useApp();

  const getDefaultRedirect = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'technician') return '/technician';
    return '/doctor';
  };

  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Main Dashboard Layout Shell */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to={getDefaultRedirect()} replace />} />

        {/* Role Dashboards */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />

        <Route path="technician" element={<TechnicianDashboard />} />
        <Route path="technician/rediagnosis/:id" element={<ReDiagnosisPage />} />

        <Route path="doctor" element={<DoctorDashboard />} />
        <Route path="doctor/review/:id" element={<DoctorReviewPage />} />

        {/* Patient Management */}
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/new" element={<AddPatientWizard />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />

        {/* Diagnosis Workflows & Results */}
        <Route path="diagnosis/workflow" element={<DiagnosisWorkflowPage />} />
        <Route path="results" element={<DiagnosticResultsPage />} />
        <Route path="results/:id" element={<DiagnosticResultPage />} />

        {/* Reports Catalog */}
        <Route path="reports" element={<ReportsListPage />} />
        <Route path="reports/:id" element={<ViewReportPage />} />

        {/* User Profile */}
        <Route path="profile" element={<UserProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
    </Routes>
  );
};
