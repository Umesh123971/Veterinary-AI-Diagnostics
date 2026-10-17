import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { User, Lock, CheckCircle2, ShieldCheck, Mail, Phone, Building, Camera } from 'lucide-react';

export const UserProfilePage = () => {
  const { currentUser, updateUser } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateUser(currentUser.id, { name, phone, avatar });
    setProfileMsg('Profile details updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ text: 'Please enter your current password.', type: 'error' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMsg({ text: 'New password must be at least 4 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    // Update logged in user password
    updateUser(currentUser.id, { password: newPassword });
    setPasswordMsg({ text: 'Password successfully changed!', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg({ text: '', type: '' }), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={avatar || currentUser?.avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-teal-400 shadow-md"
          />
          <div>
            <h2 className="text-xl font-bold text-white">{currentUser?.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{currentUser?.email} • {currentUser?.organization}</p>
            <div className="mt-1">
              <Badge variant={currentUser?.role === 'admin' ? 'purple' : currentUser?.role === 'technician' ? 'teal' : 'info'}>
                {currentUser?.roleLabel || currentUser?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Personal Information Edit */}
        <div className="md:col-span-7">
          <Card title="Personal Profile Information" subtitle="Update your account display details">
            {profileMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" icon={CheckCircle2} className="bg-teal-600 hover:bg-teal-700">
                  Update Profile Details
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right 5 Cols: Change Password Card (Step 23 requirement) */}
        <div className="md:col-span-5">
          <Card 
            title="Change Password" 
            subtitle="Only logged-in user can change their own password"
          >
            {passwordMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-xs border ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="secondary" icon={Lock} className="w-full">
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
};
