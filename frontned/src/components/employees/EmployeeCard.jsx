import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

const EmployeeCard = ({ employee }) => {
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
                            {employee.User?.profile_picture && !imgError ? (
                                <img
                                    src={employee.User.profile_picture.startsWith('http') ? employee.User.profile_picture.replace('http://', 'https://') : employee.User.profile_picture}
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
                    <Link
                        to={`/employees/${employee.user_id}`}
                        className="flex-1 bg-[var(--bg-surface-soft)] hover:bg-blue-600 hover:text-white text-[var(--text-main)] py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
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
