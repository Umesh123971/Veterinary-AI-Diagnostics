import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';
import { ResearchDisclaimer } from '../components/common/ResearchDisclaimer';

export const DashboardLayout = () => {
  const location = useLocation();

  // Helper to map route path to readable page header title
  const getPageTitle = (path) => {
    if (path.includes('/admin')) return 'Administrator Dashboard';
    if (path.includes('/technician')) return 'Lab Technician Dashboard';
    if (path.includes('/doctor')) return 'Doctor / Clinician Review Portal';
    if (path.includes('/patients/new')) return 'Register New Canine Patient';
    if (path.includes('/patients/')) return 'Patient Clinical Profile';
    if (path.includes('/patients')) return 'Canine Patient Management';
    if (path.includes('/results/')) return 'Detailed Diagnostic Result';
    if (path.includes('/results')) return 'Diagnostic Case Repository';
    if (path.includes('/reports/')) return 'Veterinary Diagnostic Report Preview';
    if (path.includes('/reports')) return 'Generated Reports Catalog';
    if (path.includes('/users')) return 'System User Management';
    if (path.includes('/profile')) return 'User Profile & Credentials';
    return 'Veterinary AI Diagnostics';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNav title={getPageTitle(location.pathname)} />

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />

          {/* Persistent subtle footer research disclaimer */}
          <div className="pt-8 pb-4">
            <ResearchDisclaimer compact />
          </div>
        </main>
      </div>
    </div>
  );
};
