import React, { useState } from 'react';
import {
    FileText, Download, Users, Calendar,
    DollarSign, Briefcase, Award, Activity,
    TrendingUp, UserPlus, Clock, FileDown
} from 'lucide-react';
import reportService from '../../services/reportService';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const reports = [
    { id: 'employee-headcount', titleKey: 'report_employee_headcount_title', category: 'Workforce', icon: Users, descKey: 'report_employee_headcount_desc' },
    { id: 'attendance-summary', titleKey: 'report_attendance_summary_title', category: 'Attendance', icon: Activity, descKey: 'report_attendance_summary_desc' },
    { id: 'leave-summary', titleKey: 'report_leave_summary_title', category: 'Leave', icon: Calendar, descKey: 'report_leave_summary_desc' },
    { id: 'payroll-summary', titleKey: 'report_payroll_summary_title', category: 'Payroll', icon: DollarSign, descKey: 'report_payroll_summary_desc' },
    { id: 'labor-cost', titleKey: 'report_labor_cost_title', category: 'Finance', icon: Briefcase, descKey: 'report_labor_cost_desc' },
    { id: 'turnover-rate', titleKey: 'report_turnover_rate_title', category: 'Workforce', icon: TrendingUp, descKey: 'report_turnover_rate_desc' },
    { id: 'certifications', titleKey: 'report_certifications_title', category: 'Compliance', icon: Award, descKey: 'report_certifications_desc' },
    { id: 'recruitment-pipeline', titleKey: 'report_recruitment_pipeline_title', category: 'Recruitment', icon: UserPlus, descKey: 'report_recruitment_pipeline_desc' },
    { id: 'overtime-report', titleKey: 'report_overtime_report_title', category: 'Payroll', icon: Clock, descKey: 'report_overtime_report_desc' },
    { id: 'shift-coverage', titleKey: 'report_shift_coverage_title', category: 'Scheduling', icon: Activity, descKey: 'report_shift_coverage_desc' },
    { id: 'new-hires', titleKey: 'report_new_hires_title', category: 'Recruitment', icon: UserPlus, descKey: 'report_new_hires_desc' },
    { id: 'contract-distribution', titleKey: 'report_contract_distribution_title', category: 'Workforce', icon: FileText, descKey: 'report_contract_distribution_desc' },
    { id: 'document-expiry', titleKey: 'report_document_expiry_title', category: 'Compliance', icon: Award, descKey: 'report_document_expiry_desc' },
    { id: 'department-performance', titleKey: 'report_department_performance_title', category: 'Analytics', icon: Activity, descKey: 'report_department_performance_desc' },
    { id: 'audit-summary', titleKey: 'report_audit_summary_title', category: 'Security', icon: FileText, descKey: 'report_audit_summary_desc' }
];

const ReportCenter = () => {
    const { t } = useSettings();
    const [loadingReport, setLoadingReport] = useState(null);

    const handleExport = async (type, format = 'excel') => {
        setLoadingReport(`${type}-${format}`);
        try {
            toast.loading(`Generating ${format.toUpperCase()} report...`);
            
            if (format === 'pdf') {
                // For reports that need date range
                if (['attendance-summary', 'leave-summary'].includes(type)) {
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    const endDate = new Date();
                    
                    await reportService.exportReportPDF(type, {
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0]
                    });
                } else {
                    await reportService.exportReportPDF(type);
                }
            } else {
                await reportService.exportReport(type);
            }
            
            toast.dismiss();
            toast.success(`${format.toUpperCase()} report downloaded successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            toast.dismiss();
            toast.error(`Failed to generate ${format.toUpperCase()} report`);
        } finally {
            setLoadingReport(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black tracking-tight">{t('reportCenter') || 'Report Center'}</h1>
                <p className="text-[var(--text-soft)]">{t('reportCenterDesc') || 'Generate and export standard HR reports and compliance documents'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-[var(--bg-surface)] p-6 rounded-[2rem] border border-[var(--border-main)] hover:border-blue-500/30 transition-all flex flex-col justify-between shadow-sm group">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                    <report.icon className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-[var(--bg-surface-soft)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border border-[var(--border-main)]/50">
                                    {report.category}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors">{t(report.titleKey)}</h3>
                            <p className="text-xs text-[var(--text-soft)] leading-relaxed mb-8">
                                {t(report.descKey)}
                            </p>
                        </div>

                        {/* Export Buttons */}
                        <div className="flex gap-2">
                            {/* PDF Export Button */}
                            <Button
                                onClick={() => handleExport(report.id, 'pdf')}
                                disabled={loadingReport === `${report.id}-pdf`}
                                variant="primary"
                                className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingReport === `${report.id}-pdf` ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-3.5 h-3.5" /> PDF
                                    </>
                                )}
                            </Button>

                            {/* Excel Export Button */}
                            <Button
                                onClick={() => handleExport(report.id, 'excel')}
                                disabled={loadingReport === `${report.id}-excel`}
                                variant="secondary"
                                className="flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-[var(--border-main)] hover:bg-green-500 hover:text-white hover:border-green-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingReport === `${report.id}-excel` ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FileDown className="w-3.5 h-3.5" /> Excel
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportCenter;
