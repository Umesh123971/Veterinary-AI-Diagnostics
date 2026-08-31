import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Users, 
  FolderKanban, 
  Stethoscope, 
  FileCheck2, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Microscope,
  Shield
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'technician') return '/technician';
    return '/doctor';
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: getDashboardPath(),
      icon: Activity,
      roles: ['admin', 'technician', 'doctor']
    },
    {
      name: 'Patients',
      path: '/patients',
      icon: FolderKanban,
      roles: ['admin', 'technician', 'doctor']
    },
    {
      name: 'Diagnosis',
      path: '/diagnosis/workflow',
      icon: Stethoscope,
      roles: ['admin', 'technician', 'doctor']
    },
    {
      name: 'Diagnostic Results',
      path: '/results',
      icon: FileCheck2,
      roles: ['admin', 'technician', 'doctor']
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: FileText,
      roles: ['admin', 'technician', 'doctor']
    },
    {
      name: 'Users',
      path: '/users',
      icon: Users,
      roles: ['admin'] // Admin ONLY per Step 4
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      roles: ['admin', 'technician', 'doctor']
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30 shadow-inner">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-1">
              Vet<span className="text-teal-400">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              Veterinary AI Diagnostics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          // Filter by role
          if (currentUser && !item.roles.includes(currentUser.role)) return null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Account section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
