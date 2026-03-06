import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPositions, fetchDepartments, createPosition } from '../../store/organizationSlice';
import { useSettings } from '../../context/SettingsContext.jsx';
import Button from '../../components/ui/Button';

const PositionsPage = () => {
    const dispatch = useDispatch();
    const { positions, departments, loading } = useSelector((state) => state.organization);
    const { t } = useSettings();
    const [showAddModal, setShowAddModal] = useState(false);
    const [filters, setFilters] = useState({ department_id: '', grade: '' });
    const [formData, setFormData] = useState({
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
        await dispatch(createPosition(formData));
        setShowAddModal(false);
        setFormData({ title: '', code: '', department_id: '', salary_range_min: '', salary_range_max: '', is_management: false });
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-main)] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('positions')}</h1>
                        <p className="text-[var(--text-soft)]">{positions.length} active roles across organization</p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)} variant="primary">
                        + Add Position
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border-main)]">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">By Department</label>
                        <select
                            value={filters.department_id}
                            onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
                            className="bg-[var(--bg-base)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-main)] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--bg-surface-soft)] text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-[0.2em]">
                            <th className="px-6 py-4">Title & Code</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Management</th>
                            <th className="px-6 py-4">Salary Range</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-main)] text-[var(--text-main)]">
                        {positions.map((pos) => (
                            <tr key={pos.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                                <td className="px-6 py-5">
                                    <p className="font-bold text-sm">{pos.title}</p>
                                    <p className="text-[10px] font-mono text-[var(--text-muted)] font-bold">{pos.code}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-medium px-2 py-1 bg-[var(--bg-base)] border border-[var(--border-main)] rounded-lg">
                                        {pos.Department?.name || 'Unassigned'}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    {pos.is_management ? (
                                        <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20 uppercase">Core Manager</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-1 rounded-full border border-[var(--border-main)] uppercase">Staff</span>
                                    )}
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-bold font-mono">
                                        ${parseFloat(pos.salary_range_min).toLocaleString()} - ${parseFloat(pos.salary_range_max).toLocaleString()}
                                    </p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="p-2 transition-colors opacity-0 group-hover:opacity-100 hover:text-blue-500">
                                        ✏️
                                    </button>
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
                    <form onSubmit={handleAddPosition} className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--border-main)] shadow-2xl space-y-6">
                        <h2 className="text-2xl font-bold">New Role Specification</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Position Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/40 font-medium"
                                    placeholder="Chief Operating Officer"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Code</label>
                                <input
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/40 font-mono font-bold"
                                    placeholder="COO"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Department</label>
                                <select
                                    required
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 outline-none hover:border-blue-500/50"
                                >
                                    <option value="">Select Unit</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Min Salary</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.salary_range_min}
                                    onChange={(e) => setFormData({ ...formData, salary_range_min: e.target.value })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-mono font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Max Salary</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.salary_range_max}
                                    onChange={(e) => setFormData({ ...formData, salary_range_max: e.target.value })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-mono font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="col-span-2 flex items-center gap-3 p-4 bg-[var(--bg-surface-soft)] rounded-xl group cursor-pointer" onClick={() => setFormData({ ...formData, is_management: !formData.is_management })}>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.is_management ? 'bg-blue-600 border-blue-600' : 'border-[var(--border-main)]'}`}>
                                    {formData.is_management && <span className="text-[8px] text-white">✓</span>}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${formData.is_management ? 'text-blue-500' : 'text-[var(--text-soft)]'}`}>Management Role</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold rounded-xl bg-[var(--bg-surface-soft)] text-[var(--text-main)] hover:bg-[var(--border-main)] transition-all">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 py-3 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                                Save Role
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PositionsPage;
