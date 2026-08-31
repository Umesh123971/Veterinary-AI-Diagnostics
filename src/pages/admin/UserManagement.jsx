import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UserTable } from '../../components/users/UserTable';
import { AddUserModal } from '../../components/users/AddUserModal';
import { Modal } from '../../components/common/Modal';
import { Plus, Search, Shield, UserCheck, Mail, Phone, Building } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const UserManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsAddModalOpen(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card
        title="System User Management"
        subtitle="Manage authorized administrators, lab technicians, and clinicians"
        action={
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add User
          </Button>
        }
      >
        <UserTable onEdit={handleEdit} onView={handleView} />
      </Card>

      {/* Add / Edit User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialData={editingUser}
      />

      {/* View User Modal */}
      {viewingUser && (
        <Modal
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
          title={`User Profile: ${viewingUser.name}`}
          maxWidth="max-w-md"
          footer={<Button variant="outline" onClick={() => setViewingUser(null)}>Close</Button>}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={viewingUser.avatar} alt={viewingUser.name} className="w-14 h-14 rounded-full object-cover border border-slate-300" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{viewingUser.name}</h4>
                <p className="text-slate-500 font-mono text-[11px]">{viewingUser.id}</p>
                <div className="mt-1">
                  <Badge variant={viewingUser.role === 'admin' ? 'purple' : viewingUser.role === 'technician' ? 'teal' : 'info'}>
                    {viewingUser.roleLabel || viewingUser.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Email:</span>
                <span className="font-mono">{viewingUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Phone:</span>
                <span>{viewingUser.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Organization:</span>
                <span>{viewingUser.organization}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
