import React from 'react';
import { Badge } from '../common/Badge';
import { Eye, Edit2, Trash2, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserTable = ({ onEdit, onView }) => {
  const { users, deleteUser, currentUser } = useApp();

  const roleVariants = {
    admin: 'purple',
    technician: 'teal',
    doctor: 'info'
  };

  const handleDelete = (userId, userName) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own active administrator account.");
      return;
    }
    if (confirm(`Are you sure you want to remove user "${userName}" (${userId})?`)) {
      deleteUser(userId);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-700">{user.id}</td>
                <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                  <span>{user.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono">{user.email}</td>
                <td className="py-3 px-4">
                  <Badge variant={roleVariants[user.role]}>
                    {user.roleLabel || user.role}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={user.status === 'Active' ? 'success' : 'neutral'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-500">{user.createdDate}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(user)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
