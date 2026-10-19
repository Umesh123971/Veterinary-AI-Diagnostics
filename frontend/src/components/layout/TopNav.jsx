import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X,
  UserCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const TopNav = ({ title = 'Dashboard' }) => {
  const { currentUser, notifications, switchRole, markNotificationRead, clearAllNotifications } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleBadges = {
    admin: { label: 'Administrator', variant: 'purple' },
    technician: { label: 'Lab Technician', variant: 'teal' },
    doctor: { label: 'Doctor / Clinician', variant: 'info' }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 h-16 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>

      {/* Right: Search, Quick Role Switcher, Notifications & User Info */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, sample ID, breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 text-slate-800 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 w-64 transition-all"
          />
        </div>

        {/* Quick Demo Role Switcher (Crucial for live prototype demonstration) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200"
            title="Switch Demo Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-slate-900 capitalize">{currentUser?.role || 'Admin'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-slate-100 font-semibold text-slate-400 uppercase text-[10px]">
                Switch Demo Persona
              </div>
              <button
                onClick={() => { switchRole('admin'); setShowRoleMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-800 font-medium"
              >
                <span>Administrator</span>
                {currentUser?.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
              </button>
              <button
                onClick={() => { switchRole('technician'); setShowRoleMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-800 font-medium"
              >
                <span>Lab Technician</span>
                {currentUser?.role === 'technician' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 transition-colors cursor-pointer flex gap-3 items-start ${
                        notif.read ? 'bg-white text-slate-600' : 'bg-sky-50/40 font-medium text-slate-900'
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Info className="w-4 h-4 text-sky-500" />
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Avatar & Info */}
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-300 ring-2 ring-slate-100"
          />
          <div className="hidden lg:block text-left">
            <h4 className="text-xs font-semibold text-slate-900 leading-tight">
              {currentUser?.name || 'Dr. Eleanor Vance'}
            </h4>
            <div className="mt-0.5">
              <Badge variant={roleBadges[currentUser?.role || 'admin']?.variant} size="sm">
                {roleBadges[currentUser?.role || 'admin']?.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
