import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPositions, fetchDepartments, createPosition, updatePosition, deletePosition } from '../../store/organizationSlice';
import { useSettings } from '../../context/SettingsContext.jsx';
import Button from '../../components/ui/Button';
import usePermission from '../../hooks/usePermission';
import { Edit, Trash2, Plus, ShieldCheck } from 'lucide-react';

const PositionsPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { positions, departments, loading } = useSelector((state) => state.organization);
    const { t } = useSettings();
    const { hasPermission } = usePermission();

    const canManage = hasPermission('manage_org');

    // Filter positions for employees without manage_org permission
    const displayPositions = canManage
        ? positions
        : positions.filter(p => p.id === user?.employee_details?.position_id);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [filters, setFilters] = useState({ department_id: '', grade: '' });
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        code: '',
        department_id: '',
        salary_range_min: '',
        salary_range_max: '',
        is_management: false
    });

    useEffect(() => {
        dispatch(fetchPositions(filters));
        dispatch(fetchDepartments());
    }, [dispatch, filters]);

    const handleAddPosition = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            salary_range_min: parseFloat(formData.salary_range_min),
            salary_range_max: parseFloat(formData.salary_range_max)
        };

        if (isEditing) {
            await dispatch(updatePosition({ id: formData.id, data: payload }));
        } else {
            await dispatch(createPosition(payload));
        }
        setShowAddModal(false);
        setFormData({ id: null, title: '', code: '', department_id: '', salary_range_min: '', salary_range_max: '', is_management: false });
        setIsEditing(false);
    };

    const openEditModal = (pos) => {
        setFormData({
            id: pos.id,
            title: pos.title,
            code: pos.code,
            department_id: pos.department_id || '',
            salary_range_min: pos.salary_range_min || '',
            salary_range_max: pos.salary_range_max || '',
            is_management: pos.is_management
        });
        setIsEditing(true);
        setShowAddModal(true);
    };

    const openCreateModal = () => {
        setFormData({ id: null, title: '', code: '', department_id: '', salary_range_min: '', salary_range_max: '', is_management: false });
        setIsEditing(false);
        setShowAddModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this position?')) {
            dispatch(deletePosition(id));
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {canManage ? t('positions') : "My Position"}
                        </h1>
                        <p className="text-[var(--text-soft)]">
                            {canManage
                                ? `${positions.length} ${t('activeRolesAcross')}`
                                : "Your assigned professional role"}
                        </p>
                    </div>
                    {canManage && (
                        <Button onClick={openCreateModal} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            {t('addPosition')}
                        </Button>
                    )}
                </div>

                {/* Filters */}
                {canManage && (
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border-main)]">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('byDepartment')}</label>
                            <select
                                value={filters.department_id}
                                onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
                                className="bg-[var(--bg-base)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            >
                                <option value="">{t('allDepartments')}</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-main)] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-left border-b border-[var(--border-main)]">
                            <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4">{t('titleAndCode')}</th>
                            <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4">{t('department')}</th>
                            <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4">{t('salaryRange')}</th>
                            <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] text-right px-4">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-main)] text-[var(--text-main)]">
                        {displayPositions.map((pos) => (
                            <tr key={pos.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                                <td className="px-6 py-5">
                                    <h3 className="font-bold text-sm text-[var(--text-main)] transition-colors group-hover:text-blue-500">{pos.title}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] font-mono">{pos.code}</p>
                                </td>
                                <td className="py-5 px-4">
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--bg-surface-soft)] rounded-lg border border-[var(--border-main)]">
                                        {pos.Department?.name || t('unassigned')}
                                    </span>
                                </td>
                                <td className="py-5 px-4 font-mono text-xs">
                                    ${pos.salary_range_min?.toLocaleString() || '0'} - ${pos.salary_range_max?.toLocaleString() || '0'}
                                </td>
                                <td className="px-6 py-5 text-right w-[120px]">
                                    {canManage && (
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            {pos.is_management && (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest mr-2">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {t('coreManager')}
                                                </span>
                                            )}
                                            <button onClick={() => openEditModal(pos)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(pos.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
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

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <form onSubmit={handleAddPosition} className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl pb-8 border border-[var(--border-main)] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-main)]">
                            <h2 className="text-2xl font-bold">{isEditing ? t('editRoleSpec') : t('newRoleSpec')}</h2>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('positionTitle')}</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/40 font-medium"
                                        placeholder="Chief Operating Officer"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{t('code')}</label>
                                        <input
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/40 font-mono font-bold"
                                            placeholder="COO"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{t('department')}</label>
                                        <select
                                            required
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 outline-none hover:border-blue-500/50"
                                        >
                                            <option value="">{t('selectUnit')}</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('minSalary')}</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.salary_range_min}
                                            onChange={(e) => setFormData({ ...formData, salary_range_min: e.target.value })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{t('maxSalary')}</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.salary_range_max}
                                            onChange={(e) => setFormData({ ...formData, salary_range_max: e.target.value })}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center gap-3 p-4 bg-[var(--bg-surface-soft)] rounded-xl group cursor-pointer" onClick={() => setFormData({ ...formData, is_management: !formData.is_management })}>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.is_management ? 'bg-blue-600 border-blue-600' : 'border-[var(--border-main)]'}`}>
                                    {formData.is_management && <span className="text-[8px] text-white">✓</span>}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${formData.is_management ? 'text-blue-500' : 'text-[var(--text-soft)]'}`}>{t('managementRole')}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 px-8 pb-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold rounded-xl bg-[var(--bg-surface-soft)] text-[var(--text-main)] hover:bg-[var(--border-main)] transition-all">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="flex-1 py-3 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                                {isEditing ? t('updateRole') : t('saveRole')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PositionsPage;
