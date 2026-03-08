import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    History, Search, Filter, Download,
    Eye, User, Clock, Shield, Globe,
    ChevronDown, FileText, Database, Info, XCircle
} from 'lucide-react';
import { fetchAuditLogs } from '../../store/auditSlice';
import auditService from '../../services/auditService';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';
import { useSettings } from '../../context/SettingsContext';

const AuditLogList = () => {
    const { t } = useSettings();
    const dispatch = useDispatch();
    const { logs, pagination, loading, error } = useSelector((state) => state.audit);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ model: '', action: '' });
    const [selectedLog, setSelectedLog] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // default to 10 rows
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'

    useEffect(() => {
        dispatch(fetchAuditLogs({ page, limit, ...filters }));
    }, [dispatch, page, limit, filters]);

    const handleNextPage = () => {
        if (page < pagination.totalPages) setPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleExport = async () => {
        try {
            const blob = await auditService.exportLogs();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'text-emerald-500 bg-emerald-500/10';
            case 'UPDATE': return 'text-amber-500 bg-amber-500/10';
            case 'DELETE': return 'text-rose-500 bg-rose-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[var(--bg-surface)] p-6 sm:p-8 rounded-[2rem] border border-[var(--border-main)] shadow-sm gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                            <History className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight tracking-tight">{'Audit & Transparency'}</h1>
                    </div>
                    <p className="text-[var(--text-soft)] text-xs font-medium leading-relaxed max-w-md">{'Monitor system-wide activities and changes'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-main)] flex">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                        >
                            {'Table'}
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-[var(--text-soft)] hover:text-[var(--text-main)]'}`}
                        >
                            {'Timeline'}
                        </button>
                    </div>
                    <Button onClick={handleExport} variant="secondary" className="bg-white border-[var(--border-main)] py-4 rounded-2xl shadow-sm active:scale-95 transition-all">
                        <Download className="w-4 h-4 mr-2" /> {'Export'}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[var(--bg-surface-soft)]/50 p-6 rounded-3xl border border-[var(--border-main)]/50">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl text-sm focus:ring-2 ring-blue-500/20 outline-none"
                        placeholder={'Search Logs'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className="px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl text-sm outline-none">
                    <option value="">{'All Models'}</option>
                    <option value="User">User</option>
                    <option value="Employee">Employee</option>
                    <option value="Department">Department</option>
                </select>
                <select className="px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl text-sm outline-none">
                    <option value="">{'All Actions'}</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                </select>
                <div className="flex items-center justify-end">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{pagination.total} {t('eventsLogged')}</p>
                </div>
            </div>

            {/* Log Table container with overflow-x */}
            <div className="bg-[var(--bg-surface)] rounded-[2rem] border border-[var(--border-main)] shadow-sm overflow-hidden">
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-[var(--bg-surface-soft)]/50 border-b border-[var(--border-main)]">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('time')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('user')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('action')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('resource')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t('ipAddress')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">{t('details')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-main)]">
                                {loading && <tr><td colSpan="6" className="p-20 text-center animate-pulse text-[var(--text-muted)]">{t('streamingLogs')}</td></tr>}
                                {logs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-[var(--bg-surface-soft)]/30 transition-colors group"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                <span className="text-xs font-medium text-[var(--text-soft)]">
                                                    {format(new Date(log.created_at || new Date()), 'MMM d, HH:mm:ss')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold">{log.User?.first_name || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{log.model_name}</span>
                                                <span className="text-[10px] text-[var(--text-muted)]">ID: #{log.model_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                                <Globe className="w-3 h-3" />
                                                <span className="text-[10px] font-mono">{log.ip_address || '127.0.0.1'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="p-2 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 space-y-12 relative">
                        <div className="absolute left-[3.5rem] top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500/50 via-[var(--border-main)] to-transparent" />
                        {logs.map((log, idx) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex gap-10 group"
                            >
                                <div className="min-w-[4rem] text-right pt-2">
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-muted)]">
                                        {format(new Date(log.created_at), 'HH:mm')}
                                    </p>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] opacity-50">
                                        {format(new Date(log.created_at), 'MMM d')}
                                    </p>
                                </div>
                                <div className="relative z-10 w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-main)] flex items-center justify-center group-hover:border-blue-500 transition-colors shadow-sm">
                                    <div className={`w-2 h-2 rounded-full ${log.action === 'DELETE' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                </div>
                                <div className="flex-1 bg-[var(--bg-surface-soft)]/30 border border-[var(--border-main)] p-6 rounded-3xl hover:border-blue-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md" onClick={() => setSelectedLog(log)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <h4 className="text-sm font-bold">{log.model_name} #{log.model_id}</h4>
                                        </div>
                                        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-lg border border-[var(--border-main)]">
                                            {log.ip_address}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                            {log.User?.first_name?.[0]}
                                        </div>
                                        <p className="text-xs text-[var(--text-soft)]">
                                            {t('actedUponBy')} <span className="font-bold text-[var(--text-main)]">{log.User?.first_name || 'System'}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[var(--border-main)] bg-[var(--bg-surface-soft)]/30 gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t('rowsPerPage')}:</span>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1); // Reset to first page
                                }}
                                className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                            {t('page')} {pagination.page} {t('of')} {pagination.totalPages}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="py-2 px-4 shadow-sm"
                            disabled={page === 1}
                            onClick={handlePrevPage}
                        >
                            {t('previous')}
                        </Button>
                        <Button
                            variant="secondary"
                            className="py-2 px-4 shadow-sm"
                            disabled={page === pagination.totalPages || pagination.totalPages === 0}
                            onClick={handleNextPage}
                        >
                            {t('next')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Detail Modal (Simplified for layout) */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-black">{t('auditDetail')}</h2>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('beforeChange')}</p>
                                    <pre className="text-[11px] font-mono overflow-auto max-h-40">
                                        {JSON.stringify(selectedLog.old_values, null, 2)}
                                    </pre>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t('afterChange')}</p>
                                    <pre className="text-[11px] font-mono overflow-auto max-h-40">
                                        {JSON.stringify(selectedLog.new_values, null, 2)}
                                    </pre>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                <Info className="w-5 h-5 text-amber-500" />
                                <p className="text-xs text-amber-700 italic">{t('userAgent')}: {selectedLog.user_agent}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AuditLogList;
