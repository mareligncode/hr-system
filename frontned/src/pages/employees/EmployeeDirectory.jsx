import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, SlidersHorizontal, Users, User, Briefcase, Building2, LayoutGrid, List, Download, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchEmployees } from '../../store/employeeSlice';
import { useSettings } from '../../context/SettingsContext';
import EmployeeCard from '../../components/employees/EmployeeCard';
import usePermission from '../../hooks/usePermission';
import employeeService from '../../services/employeeService';
import Button from '../../components/ui/Button';

const UserAvatar = ({ src, size = "w-10 h-10", iconSize = "w-5 h-5" }) => {
    const [error, setError] = useState(false);
    return (
        <div className={`${size} rounded-full bg-blue-500/10 flex items-center justify-center overflow-hidden border border-[var(--border-main)]`}>
            {src && !error ? (
                <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <User className={`${iconSize} text-blue-500`} />
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-main)] shadow-sm flex items-center gap-4 hover:border-blue-500/30 transition-all group">
        <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{label}</p>
            <h3 className="text-2xl font-black">{value}</h3>
        </div>
    </div>
);

const EmployeeDirectory = () => {
    const dispatch = useDispatch();
    const { t } = useSettings();
    const { hasPermission } = usePermission();
    const { employees, loading, error } = useSelector((state) => state.employees);
    const { departments } = useSelector((state) => state.organization);
    const pagination = useSelector((state) => state.employees.pagination);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedDept, setSelectedDept] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            status: activeFilter === 'all' ? '' : activeFilter,
            department_id: selectedDept
        };
        dispatch(fetchEmployees(params));
    }, [dispatch, currentPage, searchTerm, activeFilter, selectedDept, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 on search
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1); // Reset on filter
    };

    const handleDeptChange = (e) => {
        setSelectedDept(e.target.value);
        setCurrentPage(1); // Reset on dept change
    };

    const handleLimitChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Reset to page 1 when limit changes
    };

    const exportToCSV = async () => {
        try {
            const blob = await employeeService.exportEmployees();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `employee_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] transition-colors">
                        {t('employeeDirectory')}
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--text-soft)] mt-1">
                        {t('employeeDirectoryDescription')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {hasPermission('manage_employees') && (
                        <Button
                            onClick={exportToCSV}
                            variant="secondary"
                            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 h-11 sm:h-auto text-xs sm:text-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t('exportCsv')}
                        </Button>
                    )}
                    {hasPermission('manage_employees') && (
                        <Link
                            to="/employees/create"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl sm:rounded-2xl font-semibold shadow-xl shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap text-xs sm:text-sm h-11 sm:h-auto"
                        >
                            <Plus className="w-5 h-5" />
                            {t('addEmployee')}
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label={t('totalEmployees')} value={pagination.total} icon={Users} color="blue" />
                <StatCard label={t('activeStatus')} value={employees.filter(e => e.employment_status === 'active').length} icon={ShieldCheck} color="emerald" />
                <StatCard label={t('departments')} value={new Set(employees.map(e => e.department_id)).size} icon={Building2} color="purple" />
                <StatCard label={t('positions')} value={new Set(employees.map(e => e.position_id)).size} icon={Briefcase} color="amber" />
            </div>

            {/* Search and Filters */}
            <div className="bg-[var(--bg-surface)] p-4 sm:p-6 rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                <div className="flex flex-col xl:flex-row gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder={t('searchEmployees')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-row items-stretch sm:items-center gap-4">
                        <div className="flex bg-[var(--bg-surface-soft)] p-1 rounded-xl sm:rounded-2xl border border-[var(--border-main)] overflow-x-auto no-scrollbar scroll-smooth">
                            {['all', 'active', 'on_leave', 'terminated'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f)}
                                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${activeFilter === f
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'
                                        }`}
                                >
                                    {t(f + 'Status')}
                                </button>
                            ))}
                        </div>

                        <select
                            value={selectedDept}
                            onChange={handleDeptChange}
                            className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-no-repeat bg-[right_1rem_center]"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1rem' }}
                        >
                            <option value="">{t('allDepartments')}</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>

                        <div className="hidden sm:flex bg-[var(--bg-surface-soft)] p-1.5 rounded-2xl border border-[var(--border-main)] ml-auto">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-md' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-main)] animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-12 text-center bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-500 font-medium">
                    {error}
                </div>
            ) : employees.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)]">
                    <div className="w-16 h-16 bg-[var(--bg-surface-soft)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] mx-auto mb-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('noEmployeesFound')}</h3>
                    <p className="text-[var(--text-soft)]">{t('tryAdjusting')}</p>
                </div>
            ) : viewMode === 'grid' ? (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {employees.map((emp) => (
                            <EmployeeCard key={emp.user_id} employee={emp} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-left border-b border-[var(--border-main)]">
                                    <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4">{t('employees')}</th>
                                    <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4">{t('department')}</th>
                                    <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4">{t('position')}</th>
                                    <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] px-4">{t('status')}</th>
                                    <th className="pb-4 pt-2 font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)] text-right px-4">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-main)]/50">
                                {employees.map((emp) => (
                                    <tr key={emp.user_id} className="hover:bg-[var(--bg-surface-soft)]/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar src={emp.User?.profile_picture_url} />
                                                <div>
                                                    <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-blue-500 transition-colors">{emp.User?.first_name} {emp.User?.last_name}</h3>
                                                    <p className="text-[10px] text-[var(--text-muted)] font-mono">{emp.employee_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--bg-surface-soft)] rounded-lg border border-[var(--border-main)]">
                                                {emp.Department?.name || t('unassigned')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 font-mono text-xs">
                                            {emp.Position?.title || t('unassigned')}
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${emp.employment_status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                <div className={`w-1 h-1 rounded-full ${emp.employment_status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {t(emp.employment_status + 'Status')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/employees/${emp.user_id}`}
                                                className="text-sm font-semibold text-blue-500 hover:text-blue-600 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 sm:mt-12 bg-[var(--bg-surface)] p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-[var(--border-main)] shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-soft)]">{t('rows')}:</span>
                        <select
                            value={itemsPerPage}
                            onChange={handleLimitChange}
                            className="bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-lg py-1.5 px-3 text-xs font-bold text-[var(--text-main)] appearance-none bg-no-repeat bg-[right_0.5rem_center] pr-7"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '0.8rem' }}
                        >
                            {[5, 10, 20, 50].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {Math.min(currentPage * itemsPerPage, pagination.total)} / {pagination.total}
                    </span>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest h-10"
                        >
                            {t('prev') || 'Prev'}
                        </Button>

                        <div className="hidden md:flex items-center gap-1">
                            {[...Array(pagination.totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                if (
                                    pageNum === 1 ||
                                    pageNum === pagination.totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'text-[var(--text-soft)] hover:bg-[var(--bg-surface-soft)]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    pageNum === currentPage - 2 ||
                                    pageNum === currentPage + 2
                                ) {
                                    return <span key={pageNum} className="text-[var(--text-muted)] px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <Button
                            variant="secondary"
                            disabled={currentPage === pagination.totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest h-10"
                        >
                            {t('next') || 'Next'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDirectory;
