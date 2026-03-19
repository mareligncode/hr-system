import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Calendar, CheckCircle, XCircle,
    ArrowRight, Search, Filter, Download, Clock, MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import attendanceService from '../../services/attendanceService';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const TeamAttendance = () => {
    const { t } = useSettings();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchTeamData = async () => {
        setLoading(true);
        try {
            const data = await attendanceService.getTeamAttendance({ date: selectedDate });
            setAttendance(data);
        } catch (err) {
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
    }, [selectedDate]);

    const handleApproval = async (id, status) => {
        try {
            await attendanceService.approveAttendance(id, status);
            setSuccess(t('statusUpdated'));
            fetchTeamData();
        } catch (err) {
            setError(t('error'));
        }
    };

    const handleExport = async () => {
        try {
            const blob = await attendanceService.exportAttendance(null, null, selectedDate);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError(t('exportError') || 'Failed to export attendance');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">{t('pendingApprovals')}</h1>
                    <p className="text-[var(--text-soft)]">Monitor and approve team presence for the selected day.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-main)] shadow-sm px-4">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent text-xs font-black uppercase tracking-widest outline-none border-none"
                        />
                    </div>
                    <Button
                        variant="secondary"
                        className="p-3 rounded-2xl border-[var(--border-main)]"
                        onClick={handleExport}
                        title={t('export')}
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

            {/* Attendance Table */}
            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-main)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-surface-soft)]/50 border-b border-[var(--border-main)]">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('employee')}</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Selfie</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('clockIn')}</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('clockOut')}</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('hoursWorked')}</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Location</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('status')}</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-main)]/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : attendance.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <p className="text-[var(--text-soft)]">No attendance records found for this date.</p>
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((row) => (
                                    <tr key={row.id} className="hover:bg-[var(--bg-surface-soft)]/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs uppercase">
                                                    {row.User?.first_name?.[0]}{row.User?.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{row.User?.first_name} {row.User?.last_name}</p>
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                                        {row.User?.Employee?.Department?.name || 'MANAGEMENT'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {row.selfie_in ? (
                                                <img
                                                    src={row.selfie_in}
                                                    alt="Selfie"
                                                    className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform border border-[var(--border-main)]"
                                                    onClick={() => window.open(row.selfie_in, '_blank')}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-main)] flex items-center justify-center text-[8px] text-[var(--text-muted)] font-black uppercase text-center p-1">
                                                    No Photo
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-sm font-bold">{format(new Date(row.clock_in), 'hh:mm a')}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {row.clock_out ? (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-sm font-bold">{format(new Date(row.clock_out), 'hh:mm a')}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 animate-pulse">{t('clockedIn')}</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <span className="text-sm font-black text-[var(--text-main)]">{row.work_hours || 0} HRS</span>
                                        </td>
                                        <td className="p-6">
                                            {row.location_in ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                    <a
                                                        href={`https://www.google.com/maps?q=${typeof row.location_in === 'object' ? `${row.location_in.lat},${row.location_in.lng}` : row.location_in}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-bold text-blue-500 underline uppercase tracking-tighter"
                                                    >
                                                        {typeof row.location_in === 'object' ? (row.location_in.address || `${row.location_in.lat?.toFixed(2)},${row.location_in.lng?.toFixed(2)}`) : 'MAP'}
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${row.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                row.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                    'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                {row.status}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {row.status === 'pending' && row.clock_out && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApproval(row.id, 'approved')}
                                                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                                        title={t('approve')}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(row.id, 'rejected')}
                                                        className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                                        title={t('reject')}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamAttendance;
