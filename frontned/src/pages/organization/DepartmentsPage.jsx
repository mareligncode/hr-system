import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, fetchDepartmentHierarchy, createDepartment, updateDepartment, deleteDepartment } from '../../store/organizationSlice';
import { fetchEmployees } from '../../store/employeeSlice';
import { useSettings } from '../../context/SettingsContext.jsx';
import Button from '../../components/ui/Button';
import usePermission from '../../hooks/usePermission';
import { Edit, Trash2, Building2 } from 'lucide-react';

const DepartmentsPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { departments, hierarchy, loading } = useSelector((state) => state.organization);
    const { employees } = useSelector((state) => state.employees);
    const { t } = useSettings();
    const { hasPermission } = usePermission();

    const canManage = hasPermission('manage_org');

    // Filter departments for employees without manage_org permission
    const displayDepartments = canManage
        ? departments
        : departments.filter(d => d.id === user?.employee_details?.department_id);

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        code: '',
        parent_department_id: null,
        manager_id: null,
        latitude: 0,
        longitude: 0,
        radius_meters: 100,
        is_geofencing_enabled: false
    });

    useEffect(() => {
        dispatch(fetchDepartments());
        dispatch(fetchDepartmentHierarchy());
        dispatch(fetchEmployees());
    }, [dispatch]);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await dispatch(updateDepartment({
                id: formData.id,
                data: {
                    name: formData.name,
                    code: formData.code,
                    parent_department_id: formData.parent_department_id,
                    manager_id: formData.manager_id,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    radius_meters: formData.radius_meters,
                    is_geofencing_enabled: formData.is_geofencing_enabled
                }
            }));
        } else {
            await dispatch(createDepartment(formData));
        }
        setShowAddModal(false);
        setFormData({
            id: null, name: '', code: '', parent_department_id: null, manager_id: null,
            latitude: 0, longitude: 0, radius_meters: 100, is_geofencing_enabled: false
        });
        setIsEditing(false);
        dispatch(fetchDepartmentHierarchy());
    };

    const openEditModal = (dept) => {
        setFormData({
            id: dept.id,
            name: dept.name,
            code: dept.code,
            parent_department_id: dept.parent_department_id || null,
            manager_id: dept.manager_id || null,
            latitude: dept.latitude || 0,
            longitude: dept.longitude || 0,
            radius_meters: dept.radius_meters || 100,
            is_geofencing_enabled: dept.is_geofencing_enabled || false
        });
        setIsEditing(true);
        setShowAddModal(true);
    };

    const openCreateModal = () => {
        setFormData({
            id: null, name: '', code: '', parent_department_id: null, manager_id: null,
            latitude: 0, longitude: 0, radius_meters: 100, is_geofencing_enabled: false
        });
        setIsEditing(false);
        setShowAddModal(true);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }));
            }, (err) => alert("Error getting location: " + err.message));
        } else {
            alert("Geolocation not supported");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirmDeleteDept'))) {
            try {
                const result = await dispatch(deleteDepartment(id)).unwrap();
                dispatch(fetchDepartmentHierarchy());
            } catch (err) {
                alert(err || t('deleteDeptError'));
            }
        }
    };

    const renderTree = (items) => {
        return (
            <ul className="pl-6 border-l-2 border-[var(--border-main)] mt-2 flex flex-col gap-2">
                {items.map((item) => (
                    <li key={item.id} className="relative">
                        <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl shadow-sm hover:shadow-md transition-all group">
                            <span className="text-blue-500 bg-blue-500/10 p-2 rounded-lg">
                                <Building2 className="w-5 h-5" />
                            </span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{item.name}</h4>
                                <p className="text-xs text-[var(--text-muted)] font-mono uppercase">{item.code}</p>
                            </div>
                            {item.Manager && (
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{t('manager')}</p>
                                    <p className="text-xs font-medium">{item.Manager.first_name} {item.Manager.last_name}</p>
                                </div>
                            )}
                        </div>
                        {item.subDepartments && renderTree(item.subDepartments)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)] shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {canManage ? t('departments') : "My Department"}
                    </h1>
                    <p className="text-[var(--text-soft)]">
                        {canManage
                            ? `${departments.length} ${t('unitsFunctional')}`
                            : "Your assigned organizational unit"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {canManage && (
                        <div className="bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-main)] flex">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                            >
                                {t('grid') || 'Grid'}
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                            >
                                {t('list') || 'List'}
                            </button>
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'tree' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                            >
                                {t('tree') || 'Tree'}
                            </button>
                        </div>
                    )}
                    {canManage && (
                        <Button onClick={openCreateModal} variant="primary">
                            + {t('newDepartment')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayDepartments.map((dept) => (
                        <div key={dept.id} className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-main)] hover:border-blue-500/50 transition-all group shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                {canManage && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(dept)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(dept.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold mb-1">{dept.name}</h3>
                            <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mb-4">{dept.code}</p>

                            <div className="space-y-3 pt-4 border-t border-[var(--border-main)]">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">{t('location')}</span>
                                    <span className="font-medium">{dept.location || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">{t('employees')}</span>
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold">
                                        {dept.employee_count}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('name')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('code')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('manager')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">{t('employees')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-main)]/50">
                                {displayDepartments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-[var(--bg-surface-soft)]/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm">{dept.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-500 bg-blue-500/5 rounded-lg inline-block my-3 ml-6 uppercase">{dept.code}</td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {dept.Manager ? `${dept.Manager.first_name} ${dept.Manager.last_name}` : <span className="text-[var(--text-muted)]">N/A</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-black">
                                                {dept.employee_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {canManage && (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(dept)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(dept.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-main)] shadow-sm">
                    {hierarchy.length > 0 ? renderTree(hierarchy) : <p className="text-center text-[var(--text-muted)] py-10">{t('noStructureDefined')}</p>}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <form onSubmit={handleAddDepartment} className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--border-main)] shadow-2xl space-y-6">
                        <h2 className="text-2xl font-bold">{isEditing ? t('editDepartment') : t('addNewDepartment')}</h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('firstName')}</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                                    placeholder="Human Resources"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('shortCode')}</label>
                                <input
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono font-bold"
                                    placeholder="HR"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('parentUnit')}</label>
                                <select
                                    value={formData.parent_department_id || ''}
                                    onChange={(e) => setFormData({ ...formData, parent_department_id: e.target.value || null })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                                >
                                    <option value="">{t('topLevelRoot')}</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('departmentManager')}</label>
                                <select
                                    value={formData.manager_id || ''}
                                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value || null })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                                >
                                    <option value="">{t('noManagerAssigned')}</option>
                                    {employees
                                        .filter(emp => emp.User?.role === 'manager')
                                        .map(emp => (
                                            <option key={emp.user_id} value={emp.user_id}>
                                                {emp.User?.first_name} {emp.User?.last_name} ({emp.employee_number})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Geofencing Section */}
                            <div className="pt-4 border-t border-[var(--border-main)] space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-tight">Geofencing</h4>
                                        <p className="text-[10px] text-[var(--text-muted)]">Restrict attendance to a specific location</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_geofencing_enabled}
                                            onChange={(e) => setFormData({ ...formData, is_geofencing_enabled: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {formData.is_geofencing_enabled && (
                                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Latitude</label>
                                            <input
                                                type="number" step="any"
                                                value={formData.latitude}
                                                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                                className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-2 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Longitude</label>
                                            <input
                                                type="number" step="any"
                                                value={formData.longitude}
                                                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                                className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-2 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="col-span-2 flex gap-2">
                                            <div className="flex-1 space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Radius (Meters)</label>
                                                <input
                                                    type="number"
                                                    value={formData.radius_meters}
                                                    onChange={(e) => setFormData({ ...formData, radius_meters: parseInt(e.target.value) })}
                                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-2 text-xs"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={getCurrentLocation}
                                                    className="px-4 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-blue-500 rounded-xl text-xs font-bold border border-blue-500/20 transition-all"
                                                >
                                                    Set My Location
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold rounded-xl bg-[var(--bg-surface-soft)] text-[var(--text-main)] hover:bg-[var(--border-main)] transition-all">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="flex-1 py-3 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                                {isEditing ? t('updateDepartment') : t('createDepartment')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DepartmentsPage;
