import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, fetchDepartmentHierarchy, createDepartment, deleteDepartment } from '../../store/organizationSlice';
import { useSettings } from '../../context/SettingsContext.jsx';
import Button from '../../components/ui/Button';

const DepartmentsPage = () => {
    const dispatch = useDispatch();
    const { departments, hierarchy, loading } = useSelector((state) => state.organization);
    const { t } = useSettings();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', parent_department_id: null });

    useEffect(() => {
        dispatch(fetchDepartments());
        dispatch(fetchDepartmentHierarchy());
    }, [dispatch]);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        await dispatch(createDepartment(formData));
        setShowAddModal(false);
        setFormData({ name: '', code: '', parent_department_id: null });
        dispatch(fetchDepartmentHierarchy());
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            dispatch(deleteDepartment(id));
        }
    };

    const renderTree = (items) => {
        return (
            <ul className="pl-6 border-l-2 border-[var(--border-main)] mt-2 flex flex-col gap-2">
                {items.map((item) => (
                    <li key={item.id} className="relative">
                        <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl shadow-sm hover:shadow-md transition-all group">
                            <span className="text-xl">🏢</span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{item.name}</h4>
                                <p className="text-xs text-[var(--text-muted)] font-mono uppercase">{item.code}</p>
                            </div>
                            {item.Manager && (
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Manager</p>
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
                    <h1 className="text-2xl font-bold tracking-tight">{t('departments')}</h1>
                    <p className="text-[var(--text-soft)]">{departments.length} units functional</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-main)] flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'tree' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                        >
                            Tree
                        </button>
                    </div>
                    <Button onClick={() => setShowAddModal(true)} variant="primary">
                        + New Department
                    </Button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                        <div key={dept.id} className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-main)] hover:border-blue-500/50 transition-all group shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                    <span className="text-2xl">🏢</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg">✏️</button>
                                    <button onClick={() => handleDelete(dept.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">🗑️</button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{dept.name}</h3>
                            <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest mb-4">{dept.code}</p>

                            <div className="space-y-3 pt-4 border-t border-[var(--border-main)]">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Location</span>
                                    <span className="font-medium">{dept.location || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Employees</span>
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold">
                                        {dept.employee_count}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-main)] shadow-sm">
                    {hierarchy.length > 0 ? renderTree(hierarchy) : <p className="text-center text-[var(--text-muted)] py-10">No structure defined yet.</p>}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <form onSubmit={handleAddDepartment} className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--border-main)] shadow-2xl space-y-6">
                        <h2 className="text-2xl font-bold">Add New Department</h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                                    placeholder="Human Resources"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Short Code</label>
                                <input
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono font-bold"
                                    placeholder="HR"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Parent Unit</label>
                                <select
                                    value={formData.parent_department_id || ''}
                                    onChange={(e) => setFormData({ ...formData, parent_department_id: e.target.value || null })}
                                    className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                                >
                                    <option value="">Top Level (Root)</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold rounded-xl bg-[var(--bg-surface-soft)] text-[var(--text-main)] hover:bg-[var(--border-main)] transition-all">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 py-3 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all">
                                Create Department
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DepartmentsPage;
