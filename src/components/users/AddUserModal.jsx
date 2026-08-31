import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Info } from 'lucide-react';

export const AddUserModal = ({ isOpen, onClose, initialData = null }) => {
  const { addUser, updateUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('technician');
  const [status, setStatus] = useState('Active');
  const [organization, setOrganization] = useState('Department of Veterinary Medicine');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setRole(initialData.role || 'technician');
      setStatus(initialData.status || 'Active');
      setOrganization(initialData.organization || 'Department of Veterinary Medicine');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('technician');
      setStatus('Active');
      setOrganization('Department of Veterinary Medicine');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const roleLabels = {
      admin: 'Administrator',
      technician: 'Lab Technician',
      doctor: 'Doctor / Clinician'
    };

    if (initialData) {
      updateUser(initialData.id, {
        name,
        email,
        phone,
        role,
        roleLabel: roleLabels[role],
        status,
        organization
      });
    } else {
      addUser({
        name,
        email,
        phone,
        role,
        roleLabel: roleLabels[role],
        status,
        organization
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit User: ${initialData.name}` : 'Add New System User'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Create User Account'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Security Rule Alert per Step 7 */}
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-700">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            <strong>Security Notice:</strong> Administrators cannot set or edit passwords for user accounts directly. Password changes must be performed by each user individually in their profile settings.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. John Doe"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@vetai.demo"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="admin">Administrator</option>
              <option value="technician">Lab Technician</option>
              <option value="doctor">Doctor / Clinician</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Department</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};
