import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Key,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Search,
  Plus,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Lock,
  Building,
  Briefcase,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, RoleDefinition, PermissionKey } from '../../types';

export const AdminUsers: React.FC = () => {
  const { user: currentAuthUser, hasPermission } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermsModal, setShowPermsModal] = useState(false);
  const [permTargetUser, setPermTargetUser] = useState<User | null>(null);
  const [selectedUserPerms, setSelectedUserPerms] = useState<PermissionKey[]>([]);
  const [userGrantedPerms, setUserGrantedPerms] = useState<PermissionKey[]>([]);
  const [userRevokedPerms, setUserRevokedPerms] = useState<PermissionKey[]>([]);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [rolePerms, setRolePerms] = useState<PermissionKey[]>([]);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canCreateUser = hasPermission('users.create');
  const canEditUser = hasPermission('users.edit');
  const canDeleteUser = hasPermission('users.delete');
  const canManageRoles = hasPermission('roles.edit') || hasPermission('roles.create');
  const canManagePermissions = hasPermission('roles.permissions');

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, rList, pList] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
        api.getPermissions()
      ]);
      setUsers(uList);
      setRoles(rList);
      setAllPermissions(pList);
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to load user access data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Exact grouped permissions as defined by user requirement
  const groupedPermissions: Record<string, PermissionKey[]> = {
    'Dashboard': [
      'dashboard.view'
    ],
    'Orders': [
      'orders.view',
      'orders.create',
      'orders.edit',
      'orders.status',
      'orders.cancel',
      'orders.refund'
    ],
    'Products': [
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'products.pricing',
      'products.inventory'
    ],
    'Inventory': [
      'inventory.view',
      'inventory.create',
      'inventory.edit',
      'inventory.adjust',
      'inventory.consume',
      'inventory.purchase'
    ],
    'Purchase Orders': [
      'purchases.view',
      'purchases.create',
      'purchases.edit',
      'purchases.receive'
    ],
    'Customers CRM': [
      'customers.view',
      'customers.create',
      'customers.edit'
    ],
    'Quotations': [
      'quotes.view',
      'quotes.create',
      'quotes.edit',
      'quotes.approve',
      'quotes.convert'
    ],
    'Reports & Analytics': [
      'reports.view',
      'reports.export'
    ],
    'System Settings': [
      'settings.view',
      'settings.edit'
    ],
    'User & Access Control': [
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      'users.deactivate',
      'roles.permissions'
    ]
  };

  const permissionLabels: Record<string, string> = {
    'dashboard.view': 'View Dashboard',
    'orders.view': 'View Orders',
    'orders.create': 'Create Orders',
    'orders.edit': 'Edit Orders',
    'orders.status': 'Status Change',
    'orders.cancel': 'Cancel Orders',
    'orders.refund': 'Refund Orders',
    'products.view': 'View Products',
    'products.create': 'Create Products',
    'products.edit': 'Edit Products',
    'products.delete': 'Delete Products',
    'products.pricing': 'Pricing',
    'products.inventory': 'Stock Control',
    'inventory.view': 'View Inventory',
    'inventory.create': 'Create Inventory',
    'inventory.edit': 'Edit Inventory',
    'inventory.adjust': 'Stock Adjust',
    'inventory.consume': 'Consume',
    'inventory.purchase': 'Purchase',
    'purchases.view': 'View Purchase Orders',
    'purchases.create': 'Create Purchase Orders',
    'purchases.edit': 'Edit Purchase Orders',
    'purchases.receive': 'Receive Goods',
    'customers.view': 'View Customers',
    'customers.create': 'Create Customers',
    'customers.edit': 'Edit Customers',
    'quotes.view': 'View Quotations',
    'quotes.create': 'Create Quotations',
    'quotes.edit': 'Edit Quotations',
    'quotes.approve': 'Approve Quotation',
    'quotes.convert': 'Convert to Order',
    'reports.view': 'View Reports',
    'reports.export': 'Export Data',
    'settings.view': 'View Settings',
    'settings.edit': 'Edit Settings',
    'users.view': 'View Users',
    'users.create': 'Create User',
    'users.edit': 'Edit User',
    'users.delete': 'Delete User',
    'users.deactivate': 'Deactivate User',
    'roles.permissions': 'Manage Permissions'
  };

  // User form submit
  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      role: formData.get('role') as string,
      phone: formData.get('phone') as string,
      mobile: formData.get('phone') as string,
      department: formData.get('department') as string,
      designation: formData.get('designation') as string,
      notes: formData.get('notes') as string,
      password: formData.get('password') as string
    };

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, userData);
        notify('success', `User account "${userData.name}" updated successfully`);
      } else {
        await api.createUser(userData);
        notify('success', `New user "${userData.name}" created successfully`);
      }
      setShowUserModal(false);
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      notify('error', err.message || 'Error saving user');
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userToToggle: User) => {
    try {
      const res = await api.setUserStatus(userToToggle.id, !userToToggle.active);
      notify('success', res.message);
      loadData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to update user status');
    }
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    try {
      const res = await api.resetUserPassword(passwordTargetUser.id, newPassword);
      notify('success', res.message);
      setShowPasswordModal(false);
      setPasswordTargetUser(null);
      setNewPassword('');
    } catch (err: any) {
      notify('error', err.message || 'Failed to reset password');
    }
  };

  // Delete user
  const handleDeleteUser = async (userToDelete: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${userToDelete.name}"?`)) {
      return;
    }
    try {
      const res = await api.deleteUser(userToDelete.id);
      notify('success', res.message);
      loadData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete user');
    }
  };

  // Open Permissions Override modal (checkbox-based)
  const handleOpenPermsModal = (target: User) => {
    setPermTargetUser(target);
    const baseRole = roles.find(r => r.id === target.role);
    const roleBasePerms = baseRole?.permissions || [];
    const effective = target.effectivePermissions && target.effectivePermissions.length > 0
      ? target.effectivePermissions
      : Array.from(new Set([...roleBasePerms.filter(p => !(target.revokedPermissions || []).includes(p)), ...(target.grantedPermissions || [])]));
    setSelectedUserPerms(effective);
    setUserGrantedPerms(target.grantedPermissions || []);
    setUserRevokedPerms(target.revokedPermissions || []);
    setShowPermsModal(true);
  };

  // Save Permissions Override
  const handleSavePermOverrides = async () => {
    if (!permTargetUser) return;
    const baseRole = roles.find(r => r.id === permTargetUser.role);
    const roleBasePerms = baseRole?.permissions || [];

    const granted = selectedUserPerms.filter(p => !roleBasePerms.includes(p));
    const revoked = roleBasePerms.filter(p => !selectedUserPerms.includes(p));

    try {
      await api.setUserPermissions(permTargetUser.id, granted, revoked);
      notify('success', `Permissions updated for ${permTargetUser.name}`);
      setShowPermsModal(false);
      setPermTargetUser(null);
      loadData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to update permissions');
    }
  };

  // Save Role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      notify('error', 'Role name is required');
      return;
    }

    try {
      if (editingRole) {
        await api.updateRole(editingRole.id, {
          name: roleName,
          description: roleDesc,
          permissions: rolePerms
        });
        notify('success', `Role "${roleName}" updated successfully`);
      } else {
        await api.createRole({
          name: roleName,
          description: roleDesc,
          permissions: rolePerms
        });
        notify('success', `New role "${roleName}" created`);
      }
      setShowRoleModal(false);
      setEditingRole(null);
      loadData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to save role');
    }
  };

  // Delete Role
  const handleDeleteRole = async (roleToDelete: RoleDefinition) => {
    if (!window.confirm(`Delete custom role "${roleToDelete.name}"?`)) return;
    try {
      const res = await api.deleteRole(roleToDelete.id);
      notify('success', res.message);
      loadData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete role');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900">Access Control & Staff Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise role-based security, granular permission overrides, and employee provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'users' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'roles' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roles & Permissions ({roles.length})
            </button>
          </div>

          {activeTab === 'users' && canCreateUser && (
            <button
              onClick={() => {
                setEditingUser(null);
                setShowUserModal(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}

          {activeTab === 'roles' && canManageRoles && (
            <button
              onClick={() => {
                setEditingRole(null);
                setRoleName('');
                setRoleDesc('');
                setRolePerms([]);
                setShowRoleModal(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, department..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-hidden"
              >
                <option value="ALL">All Roles</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role & Permissions</th>
                    <th className="py-3 px-4">Contact & Dept</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isCurrentUser = currentAuthUser?.id === u.id;
                      const isSuper = u.role === 'SUPER_ADMIN';
                      const roleDef = roles.find(r => r.id === u.role);
                      const basePermsCount = isSuper ? allPermissions.length : (roleDef?.permissions?.length || 0);
                      const extraCount = u.grantedPermissions?.length || 0;
                      const revokedCount = u.revokedPermissions?.length || 0;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-slate-800 to-slate-700 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrentUser && (
                                    <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 flex items-center gap-1 mt-0.5 text-[11px]">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                  isSuper
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : u.role === 'ADMIN' || u.role === 'MANAGER'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                                }`}
                              >
                                <Shield className="w-2.5 h-2.5" />
                                {u.roleName || u.role}
                              </span>

                              <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1.5">
                                <span>{isSuper ? 'Full Unrestricted Access' : `${basePermsCount} base rights`}</span>
                                {extraCount > 0 && (
                                  <span className="text-emerald-700 font-semibold">+{extraCount} extra</span>
                                )}
                                {revokedCount > 0 && (
                                  <span className="text-rose-600 font-semibold">-{revokedCount} restricted</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 text-slate-600 text-[11px]">
                              {u.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{u.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-slate-500">
                                <Building className="w-3 h-3 text-slate-400" />
                                <span>{u.department || 'General'} · {u.designation || 'Staff'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isCurrentUser || (isSuper && u.active)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                u.active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              {u.active ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                  Deactivated
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Override Permissions Button */}
                              {!isSuper && canManagePermissions && (
                                <button
                                  onClick={() => handleOpenPermsModal(u)}
                                  title="Custom Permissions Override"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Reset Password */}
                              {canEditUser && (
                                <button
                                  onClick={() => {
                                    setPasswordTargetUser(u);
                                    setNewPassword('');
                                    setShowPasswordModal(true);
                                  }}
                                  title="Reset Password"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit Profile */}
                              {canEditUser && (
                                <button
                                  onClick={() => {
                                    setEditingUser(u);
                                    setShowUserModal(true);
                                  }}
                                  title="Edit Profile"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete User */}
                              {canDeleteUser && !isCurrentUser && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Delete Account"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(roleItem => {
              const assignedCount = users.filter(u => u.role === roleItem.id).length;
              return (
                <div
                  key={roleItem.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{roleItem.name}</h3>
                          <span className="text-[10px] text-slate-400">
                            {roleItem.isSystem ? 'System Core Role' : 'Custom Role'}
                          </span>
                        </div>
                      </div>

                      {roleItem.isSystem ? (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Built-in
                        </span>
                      ) : (
                        <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-2">{roleItem.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span className="font-bold text-slate-800">
                          {roleItem.id === 'SUPER_ADMIN' ? 'All (Full)' : roleItem.permissions.length}
                        </span>{' '}
                        permissions
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{assignedCount}</span> users assigned
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    {canManageRoles && (
                      <button
                        onClick={() => {
                          setEditingRole(roleItem);
                          setRoleName(roleItem.name);
                          setRoleDesc(roleItem.description);
                          setRolePerms([...roleItem.permissions]);
                          setShowRoleModal(true);
                        }}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      >
                        Edit Permissions
                      </button>
                    )}

                    {!roleItem.isSystem && canManageRoles && (
                      <button
                        onClick={() => handleDeleteRole(roleItem)}
                        className="text-xs font-semibold px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingUser ? 'Edit Staff Profile' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingUser?.name || ''}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingUser?.email || ''}
                    placeholder="user@printezyour.com"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editingUser?.username || ''}
                    placeholder="e.g. ramesh"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingUser?.phone || editingUser?.mobile || ''}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    name="role"
                    required
                    defaultValue={editingUser?.role || 'STAFF'}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.isSystem ? '(System)' : '(Custom)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={editingUser?.department || 'Production'}
                    placeholder="e.g. Offset Press / Dispatch"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    defaultValue={editingUser?.designation || 'Staff'}
                    placeholder="e.g. Machine Operator"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                    <input
                      type="password"
                      name="password"
                      defaultValue="Printez@2026"
                      placeholder="Default: Printez@2026"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingUser?.notes || ''}
                  placeholder="Responsibilities, shift details or emergency contacts..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {editingUser ? 'Update Profile' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHECKBOX-BASED PERMISSIONS OVERRIDE MODAL */}
      {showPermsModal && permTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    Permissions: {permTargetUser.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Base System Role: <strong className="text-slate-800">{permTargetUser.roleName || permTargetUser.role}</strong>. Check or uncheck individual privileges below.
                </p>
              </div>
              <button onClick={() => setShowPermsModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action bar */}
            <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Active Permissions:</span>
                <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full text-[11px]">
                  {selectedUserPerms.length} assigned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allP = Object.values(groupedPermissions).flat();
                    setSelectedUserPerms(Array.from(new Set(allP)));
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100/70 rounded-lg border border-blue-200 bg-white transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserPerms([])}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200/70 rounded-lg border border-slate-300 bg-white transition-colors"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const baseRole = roles.find(r => r.id === permTargetUser.role);
                    setSelectedUserPerms(baseRole?.permissions || []);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100/70 rounded-lg border border-amber-200 bg-white transition-colors"
                >
                  Reset to Role Defaults
                </button>
              </div>
            </div>

            {/* Checkbox grid by category */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {Object.entries(groupedPermissions).map(([categoryName, perms]) => {
                const checkedCount = perms.filter(p => selectedUserPerms.includes(p)).length;

                return (
                  <div key={categoryName} className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-100/80 px-3 py-1.5 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-800">
                        {categoryName}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {checkedCount} of {perms.length} enabled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {perms.map(permKey => {
                        const isChecked = selectedUserPerms.includes(permKey);
                        const label = permissionLabels[permKey] || permKey;

                        return (
                          <label
                            key={permKey}
                            className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-2xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedUserPerms([...selectedUserPerms, permKey]);
                                } else {
                                  setSelectedUserPerms(selectedUserPerms.filter(p => p !== permKey));
                                }
                              }}
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-800 leading-tight">{label}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">{permKey}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Changes will take effect immediately upon saving.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPermsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePermOverrides}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE EDIT / CREATE MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
              </h3>
              <button onClick={() => setShowRoleModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="flex-1 flex flex-col overflow-hidden mt-4">
              <div className="space-y-3 pb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Role Title *</label>
                    <input
                      type="text"
                      required
                      value={roleName}
                      disabled={editingRole?.isSystem}
                      onChange={e => setRoleName(e.target.value)}
                      placeholder="e.g. Account Executive"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={roleDesc}
                      onChange={e => setRoleDesc(e.target.value)}
                      placeholder="e.g. Manages customer quotes and orders"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-800">
                    Assigned Rights ({rolePerms.length} / {allPermissions.length})
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRolePerms([...allPermissions])}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setRolePerms([])}
                      className="text-slate-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 border-t border-slate-100 pt-3">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded">
                      {category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {perms.map(permKey => {
                        const isChecked = rolePerms.includes(permKey);
                        return (
                          <label
                            key={permKey}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50/70 border-blue-200 text-slate-900 font-semibold'
                                : 'hover:bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={editingRole?.id === 'SUPER_ADMIN'}
                              onChange={e => {
                                if (e.target.checked) {
                                  setRolePerms([...rolePerms, permKey]);
                                } else {
                                  setRolePerms(rolePerms.filter(p => p !== permKey));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-mono text-[11px]">{permKey}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {editingRole ? 'Save Role Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && passwordTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Reset User Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
                <div className="font-bold">Super Admin Authority Action</div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Resetting credentials for <strong>{passwordTargetUser.name}</strong> ({passwordTargetUser.email}).
                  Old password is never exposed.
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">New Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
                      let generated = 'Pz@';
                      for (let i = 0; i < 7; i++) {
                        generated += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setNewPassword(generated);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters (e.g. Printez#2026)"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
