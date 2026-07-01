import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Edit, User, Mail, Phone, Briefcase, Calendar, ChevronRight, Trash2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { fetchEmployees } from '../../store/employeeSlice';
import employeeService from '../../services/employeeService';
import usePermission from '../../hooks/usePermission';

const EmployeeCard = ({ employee }) => {
    const dispatch = useDispatch();
    const { hasPermission } = usePermission();
    const { t } = useSettings();
    const [imgError, setImgError] = React.useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'on_leave': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'inactive': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            case 'terminated': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/10 overflow-hidden">
                            {employee.User?.profile_picture_url && !imgError ? (
                                <img
                                    src={employee.User.profile_picture_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <User className="w-6 h-6 text-blue-500" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-[var(--text-main)] group-hover:text-blue-500 transition-colors">
                                {employee.User?.first_name} {employee.User?.last_name}
                            </h3>
                            <p className="text-sm text-[var(--text-soft)] flex items-center gap-1.5 mt-0.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                {employee.Position?.title || 'No Position'}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(employee.employment_status)}`}>
                        {t(employee.employment_status + 'Status')}
                    </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-[var(--border-main)]/50">
                    <div className="flex items-center gap-3 text-sm text-[var(--text-soft)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                            <Mail className="w-4 h-4 text-blue-500/70" />
                        </div>
                        <span className="truncate">{employee.User?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[var(--text-soft)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-soft)] flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-500/70" />
                        </div>
                        <span> {t('hireDate')}: {new Date(employee.hire_date).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    {hasPermission('manage_employees') && (
                        <>
                            {employee.employment_status === 'active' ? (
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (window.confirm(t('confirmDeactivate') || 'Deactivate?')) {
                                            try {
                                                await employeeService.updateEmployee(employee.user_id, { employment_status: 'inactive' });
                                                dispatch(fetchEmployees());
                                            } catch (err) {
                                                alert(err.response?.data?.error || 'Failed to deactivate');
                                            }
                                        }
                                    }}
                                    className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                    title={t('deactivate')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (window.confirm(t('confirmActivate') || 'Activate?')) {
                                            try {
                                                await employeeService.updateEmployee(employee.user_id, { employment_status: 'active' });
                                                dispatch(fetchEmployees());
                                            } catch (err) {
                                                alert(err.response?.data?.error || 'Failed to activate');
                                            }
                                        }
                                    }}
                                    className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                    title={t('activate')}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                            )}
                            <Link
                                to={`/employees/edit/${employee.user_id}`}
                                className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                title={t('edit')}
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                        </>
                    )}
                    <Link
                        to={`/employees/${employee.user_id}`}
                        className="flex-1 bg-[var(--bg-surface-soft)] hover:bg-blue-600 hover:text-white text-[var(--text-main)] py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-[var(--border-main)]/50"
                    >
                        {t('viewProfile')}
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default EmployeeCard;
