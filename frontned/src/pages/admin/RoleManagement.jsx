import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Lock, Settings, Plus, Edit, Trash2,
    CheckCircle, XCircle, ShieldAlert,
    Users, Key, Search, ShieldCheck, Mail
} from 'lucide-react';
import { fetchRoles, fetchPermissions } from '../../store/roleSlice';
import { fetchEmployees } from '../../store/employeeSlice';
import { fetchDepartments } from '../../store/organizationSlice';
import roleService from '../../services/roleService';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useSettings } from '../../context/SettingsContext';

const RoleManagement = () => {
    const dispatch = useDispatch();
    const { t } = useSettings();
    const { roles, permissions, loading: rolesLoading, error: rolesError } = useSelector((state) => state.roles);
    const { employees, loading: empLoading } = useSelector((state) => state.employees);
    const { departments } = useSelector((state) => state.organization);

    const [activeTab, setActiveTab] = useState('permissions');
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeptMap, setSelectedDeptMap] = useState({}); // { [userId]: deptId }
    const [saving, setSaving] = useState(false);
    const [assignmentStatus, setAssignmentStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
        dispatch(fetchDepartments());
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'assignments') {
            const timer = setTimeout(() => {
                dispatch(fetchEmployees({ search: searchQuery }));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [dispatch, activeTab, searchQuery]);

    const handleTogglePermission = async (roleId, permissionId, hasIt) => {
        try {
            const role = roles.find(r => r.id === roleId);
            const currentPerms = role.Permissions.map(p => p.id);
            let nextPerms;
            if (hasIt) {
                nextPerms = currentPerms.filter(id => id !== permissionId);
            } else {
                nextPerms = [...currentPerms, permissionId];
            }
            await roleService.updateRole(roleId, { permissionIds: nextPerms });
            dispatch(fetchRoles());
        } catch (err) {
            console.error('Failed to update permission', err);
        }
    };

    const handleAssignRole = async (userId, roleId) => {
        try {
            setSaving(true);
            const departmentId = selectedDeptMap[userId] || null;
            await roleService.assignRole({ userId, roleId, departmentId });
            setAssignmentStatus({ type: 'success', message: 'Role assigned successfully!' });
            dispatch(fetchEmployees({ search: searchQuery }));
            setTimeout(() => setAssignmentStatus({ type: '', message: '' }), 3000);
        } catch (err) {
            setAssignmentStatus({ type: 'error', message: err.response?.data?.error || 'Failed to assign role' });
            setTimeout(() => setAssignmentStatus({ type: '', message: '' }), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleUnassignRole = async (userId, roleId) => {
        try {
            setSaving(true);
            await roleService.unassignRole({ userId, roleId });
            setAssignmentStatus({ type: 'success', message: 'Role removed successfully!' });
            dispatch(fetchEmployees({ search: searchQuery }));
            setTimeout(() => setAssignmentStatus({ type: '', message: '' }), 3000);
        } catch (err) {
            setAssignmentStatus({ type: 'error', message: err.response?.data?.error || 'Failed to remove role' });
            setTimeout(() => setAssignmentStatus({ type: '', message: '' }), 3000);
        } finally {
            setSaving(false);
        }
    };

    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
    }, {});

    if (rolesLoading && roles.length === 0) return <div className="p-20 text-center animate-pulse text-[var(--text-soft)]">Loading security systems...</div>;

    return (
        <div className="space-y-8 pb-20">
            {/* Header with Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">{t('accessControlCenter')}</h1>
                    <p className="text-[var(--text-soft)] mt-1">{t('configurePermissions')}</p>
                </div>

                <div className="flex bg-[var(--bg-surface-soft)] p-1 rounded-2xl border border-[var(--border-main)] shadow-sm">
                    <button
                        onClick={() => setActiveTab('permissions')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'permissions'
                            ? 'bg-[var(--bg-surface)] text-blue-600 shadow-sm border border-[var(--border-main)]/50'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-soft)]'
                            }`}
                    >
                        <Shield className="w-4 h-4" /> {t('permissions')}
                    </button>
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'assignments'
                            ? 'bg-[var(--bg-surface)] text-blue-600 shadow-sm border border-[var(--border-main)]/50'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-soft)]'
                            }`}
                    >
                        <Users className="w-4 h-4" /> {t('assignments')}
                    </button>
                </div>
            </div>

            {rolesError && <Alert type="error" message={rolesError} />}

            <AnimatePresence mode="wait">
                {activeTab === 'permissions' ? (
                    <motion.div
                        key="permissions"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col lg:grid lg:grid-cols-4 gap-8"
                    >
                        {/* ROLES LIST */}
                        <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar snap-x">
                            {roles.map((role) => (
                                <motion.button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    whileHover={{ x: 5 }}
                                    className={`min-w-[200px] lg:min-w-0 snap-center text-left p-5 rounded-2xl border transition-all duration-300 ${selectedRole?.id === role.id
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-[var(--bg-surface)] border-[var(--border-main)] hover:border-blue-600/50 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole?.id === role.id ? 'bg-white/20' : 'bg-blue-500/10'}`}>
                                            <Shield className={`w-5 h-5 ${selectedRole?.id === role.id ? 'text-white' : 'text-blue-600'}`} />
                                        </div>
                                        {role.is_system && <Lock className="w-3.5 h-3.5 opacity-50" />}
                                    </div>
                                    <h3 className="font-bold text-lg mb-0.5">{role.name}</h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedRole?.id === role.id ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>
                                        {role.Permissions?.length || 0} {t('activePerms')}
                                    </p>
                                </motion.button>
                            ))}
                        </div>

                        {/* PERMISSION MATRIX */}
                        <div className="lg:col-span-3">
                            {selectedRole ? (
                                <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] overflow-hidden shadow-sm">
                                    <div className="p-8 border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]/30 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                                                <Key className="w-3.5 h-3.5" />
                                                {t('aclConfiguration')}
                                            </div>
                                            <h2 className="text-2xl font-bold tracking-tight">{selectedRole.name}</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" className="rounded-xl border-[var(--border-main)]">
                                                <Edit className="w-4 h-4 mr-2" /> {t('edit')}
                                            </Button>
                                            {!selectedRole.is_system && (
                                                <Button variant="danger" size="sm" className="rounded-xl">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-12">
                                        {Object.entries(groupedPermissions).map(([module, perms]) => (
                                            <div key={module}>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--text-muted)] whitespace-nowrap">{module}</h3>
                                                    <div className="h-px bg-gradient-to-r from-[var(--border-main)] to-transparent w-full" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {perms.map((perm) => {
                                                        const hasPermission = selectedRole.Permissions.some(p => p.id === perm.id);
                                                        return (
                                                            <div
                                                                key={perm.id}
                                                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${hasPermission
                                                                    ? 'bg-blue-500/5 border-blue-500/30'
                                                                    : 'bg-[var(--bg-surface-soft)]/50 border-[var(--border-main)] opacity-70 hover:opacity-100'
                                                                    }`}
                                                                onClick={() => handleTogglePermission(selectedRole.id, perm.id, hasPermission)}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${hasPermission ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)]'
                                                                        }`}>
                                                                        {hasPermission ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`font-bold text-sm ${hasPermission ? 'text-blue-700' : 'text-[var(--text-soft)]'}`}>{perm.name}</p>
                                                                        <p className="text-[10px] text-[var(--text-muted)] font-bold font-mono tracking-tighter mt-0.5">{perm.slug}</p>
                                                                    </div>
                                                                </div>
                                                                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 pointer-events-none ${hasPermission ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                                                    <motion.div
                                                                        animate={{ x: hasPermission ? 26 : 4 }}
                                                                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[400px] flex flex-col items-center justify-center p-10 border-2 border-dashed border-[var(--border-main)] rounded-3xl bg-[var(--bg-surface-soft)]/20 shadow-inner">
                                    <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                                        <ShieldAlert className="w-10 h-10 text-blue-500/50" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-soft)]">{t('roleSelectionPending')}</h3>
                                    <p className="text-[var(--text-muted)] text-center max-w-xs mt-2 text-sm">
                                        {t('selectAccessProfile')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="assignments"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                    >
                        {/* SEARCH & STATUS */}
                        <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm flex flex-col md:flex-row gap-6 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder={t('searchEmployeesBy')}
                                    className="w-full bg-[var(--bg-surface-soft)]/50 border border-[var(--border-main)] rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-[var(--text-main)]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {assignmentStatus.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`px-6 py-4 rounded-2xl text-sm font-black flex items-center gap-3 shadow-lg ${assignmentStatus.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                                        }`}
                                >
                                    {assignmentStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                    {assignmentStatus.message}
                                </motion.div>
                            )}
                        </div>

                        {/* EMPLOYEE LIST */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {employees.map((emp) => (
                                <motion.div
                                    key={emp.user_id}
                                    layout
                                    className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] hover:shadow-xl hover:border-blue-500/40 transition-all duration-500 group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Users className="w-20 h-20 -mr-6 -mt-6" />
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                            {emp.User?.first_name?.[0]}{emp.User?.last_name?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg text-[var(--text-main)]">{emp.User?.first_name} {emp.User?.last_name}</h4>
                                            <p className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                                                <Mail className="w-3.5 h-3.5" /> {emp.User?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-wrap gap-2">
                                            <div className="w-full mb-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('definedRoles')}</p>
                                            </div>
                                            <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-black shadow-sm border border-blue-700 flex items-center gap-2">
                                                <Lock className="w-3.5 h-3.5" />
                                                {emp.User?.role?.toUpperCase() || 'EMPLOYEE'}
                                            </span>
                                            {emp.User?.Roles?.map(role => {
                                                const deptScope = departments.find(d => d.id === role.UserRole?.department_id);
                                                return (
                                                    <span
                                                        key={role.id}
                                                        className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 text-[10px] font-black border border-blue-500/20 flex items-center gap-2 group/role relative overflow-hidden"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        {role.name.toUpperCase()}
                                                        {deptScope && (
                                                            <span className="text-[8px] bg-blue-500 text-white px-1.5 py-0.5 rounded-md ml-1 opacity-80">
                                                                {deptScope.code}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleUnassignRole(emp.user_id, role.id)}
                                                            className="ml-1 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <div className="pt-6 border-t border-[var(--border-main)]/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('assignNewRole')}</p>
                                                <select
                                                    className="text-[10px] bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-lg px-2 py-1 outline-none font-bold text-blue-600"
                                                    value={selectedDeptMap[emp.user_id] || ''}
                                                    onChange={(e) => setSelectedDeptMap({ ...selectedDeptMap, [emp.user_id]: e.target.value || null })}
                                                >
                                                    <option value="">{t('globalScope')}</option>
                                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {roles.filter(r => r.code !== emp.User?.role && !emp.User?.Roles?.some(ur => ur.code === r.code)).map(role => (
                                                    <button
                                                        key={role.id}
                                                        disabled={saving}
                                                        onClick={() => handleAssignRole(emp.user_id, role.id)}
                                                        className="px-3 py-2.5 rounded-xl border border-[var(--border-main)] hover:border-blue-500 hover:bg-blue-600 hover:text-white text-[10px] font-black text-[var(--text-soft)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 group/btn shadow-sm"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" />
                                                        {role.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {employees.length === 0 && !empLoading && (
                            <div className="text-center py-20 bg-[var(--bg-surface-soft)]/20 rounded-3xl border border-dashed border-[var(--border-main)]">
                                <Search className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                                <h4 className="font-bold text-[var(--text-soft)]">{t('noEmployeesFound')}</h4>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{t('tryAdjusting')}</p>
                            </div>
                        )}
                        {empLoading && <div className="text-center py-10 text-blue-500 font-bold animate-pulse">{t('scanningWorkforce')}</div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleManagement;
