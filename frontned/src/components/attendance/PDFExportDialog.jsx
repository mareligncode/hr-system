import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, FileText, Download, Calendar, Users, Building2, 
    CheckSquare, Loader2, Filter, FileDown 
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import attendanceService from '../../services/attendanceService';
import { useSettings } from '../../context/SettingsContext';
import usePermission from '../../hooks/usePermission';

const PDFExportDialog = ({ isOpen, onClose }) => {
    const { t } = useSettings();
    const { role } = usePermission();
    
    const [reportType, setReportType] = useState('my'); // 'my', 'department', 'company', 'custom'
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [includeDetails, setIncludeDetails] = useState(true);
    const [includeViolations, setIncludeViolations] = useState(true);
    const [includeBreaks, setIncludeBreaks] = useState(false);

    const canViewDepartment = ['admin', 'hr', 'manager'].includes(role);
    const canViewCompany = ['admin', 'hr'].includes(role);

    const reportTypes = [
        { 
            id: 'my', 
            label: 'My Attendance Report', 
            description: 'Your personal attendance record with details',
            icon: <FileText className="w-5 h-5" />,
            available: true
        },
        { 
            id: 'department', 
            label: 'Department Report', 
            description: 'Team attendance overview with statistics',
            icon: <Building2 className="w-5 h-5" />,
            available: canViewDepartment
        },
        { 
            id: 'company', 
            label: 'Company-Wide Report', 
            description: 'Complete organizational attendance analytics',
            icon: <Users className="w-5 h-5" />,
            available: canViewCompany
        },
        { 
            id: 'custom', 
            label: 'Custom Report', 
            description: 'Advanced filtering and customization',
            icon: <Filter className="w-5 h-5" />,
            available: canViewDepartment
        }
    ];

    const quickDateRanges = [
        { label: 'This Month', getValue: () => ({
            start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
            end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
        })},
        { label: 'Last Month', getValue: () => ({
            start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
            end: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
        })},
        { label: 'Last 3 Months', getValue: () => ({
            start: format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'),
            end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
        })},
        { label: 'This Year', getValue: () => ({
            start: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
            end: format(new Date(), 'yyyy-MM-dd')
        })}
    ];

    const handleDownload = async () => {
        setLoading(true);
        try {
            let blob;
            let filename;

            switch (reportType) {
                case 'my':
                    blob = await attendanceService.downloadMyPDFReport(
                        dateRange.start, 
                        dateRange.end
                    );
                    filename = `attendance_report_${format(new Date(dateRange.start), 'yyyy-MM')}.pdf`;
                    break;
                
                case 'department':
                    if (!selectedDepartment) {
                        alert('Please select a department');
                        setLoading(false);
                        return;
                    }
                    blob = await attendanceService.downloadDepartmentPDFReport(
                        selectedDepartment,
                        dateRange.start,
                        dateRange.end
                    );
                    filename = `department_report_${format(new Date(dateRange.start), 'yyyy-MM')}.pdf`;
                    break;
                
                case 'company':
                    blob = await attendanceService.downloadCompanyPDFReport(
                        dateRange.start,
                        dateRange.end,
                        includeDetails
                    );
                    filename = `company_report_${format(new Date(dateRange.start), 'yyyy-MM')}.pdf`;
                    break;
                
                case 'custom':
                    blob = await attendanceService.downloadCustomPDFReport({
                        start_date: dateRange.start,
                        end_date: dateRange.end,
                        department_ids: selectedDepartment ? [selectedDepartment] : [],
                        include_violations: includeViolations,
                        include_breaks: includeBreaks
                    });
                    filename = `custom_report_${Date.now()}.pdf`;
                    break;
                
                default:
                    throw new Error('Invalid report type');
            }

            // Download the file
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // Success notification
            alert('PDF report downloaded successfully!');
            onClose();

        } catch (error) {
            console.error('PDF Download Error:', error);
            alert('Failed to download PDF report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                                <FileDown className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Export PDF Report</h2>
                                <p className="text-sm text-[var(--text-soft)] mt-0.5">
                                    Professional attendance reports with charts and analytics
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Report Type Selection */}
                    <div className="mb-6">
                        <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                            Select Report Type
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reportTypes.filter(type => type.available).map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        reportType === type.id
                                            ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                            : 'border-[var(--border-main)] hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            reportType === type.id ? 'bg-blue-500 text-white' : 'bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                                        }`}>
                                            {type.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-sm mb-1">{type.label}</h3>
                                            <p className="text-xs text-[var(--text-soft)]">{type.description}</p>
                                        </div>
                                        {reportType === type.id && (
                                            <CheckSquare className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="mb-6">
                        <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                            Date Range
                        </label>
                        
                        {/* Quick select buttons */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {quickDateRanges.map((range) => (
                                <button
                                    key={range.label}
                                    onClick={() => setDateRange(range.getValue())}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[var(--bg-surface-soft)] hover:bg-blue-50 hover:text-blue-600 border border-[var(--border-main)] transition-colors"
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom date inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
                                    Start Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface-soft)] text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2">
                                    End Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface-soft)] text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="mb-6">
                        <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                            Report Options
                        </label>
                        <div className="space-y-2 bg-[var(--bg-surface-soft)] p-4 rounded-xl border border-[var(--border-main)]">
                            {reportType === 'company' && (
                                <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-surface)] p-2 rounded-lg transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={includeDetails}
                                        onChange={(e) => setIncludeDetails(e.target.checked)}
                                        className="w-4 h-4 rounded border-2 border-blue-500 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <span className="text-sm font-bold">Include detailed attendance records</span>
                                </label>
                            )}
                            {reportType === 'custom' && (
                                <>
                                    <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-surface)] p-2 rounded-lg transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={includeViolations}
                                            onChange={(e) => setIncludeViolations(e.target.checked)}
                                            className="w-4 h-4 rounded border-2 border-blue-500 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <span className="text-sm font-bold">Include violations section</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-surface)] p-2 rounded-lg transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={includeBreaks}
                                            onChange={(e) => setIncludeBreaks(e.target.checked)}
                                            className="w-4 h-4 rounded border-2 border-blue-500 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <span className="text-sm font-bold">Include break details</span>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-blue-900 mb-1">
                                    📄 Professional PDF Format
                                </p>
                                <p className="text-xs text-blue-700">
                                    Your report will include company branding, charts, statistics, and formatted tables.
                                    Perfect for printing or sharing with management.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-widest bg-[var(--bg-surface-soft)] hover:bg-[var(--bg-surface)] border border-[var(--border-main)] transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-widest bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PDFExportDialog;
