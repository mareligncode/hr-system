import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Download,
    Filter,
    Calendar as CalendarIcon,
    Users,
    Clock,
    CheckCircle2,
    Search
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import organizationService from '../../services/organizationService';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const AttendanceReports = () => {
    const { t } = useTranslation();
    const [reportData, setReportData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        departmentId: ''
    });

    useEffect(() => {
        fetchDepartments();
        handleSearch();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await organizationService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Fetch Depts Error:', error);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await attendanceService.getAttendanceReports(
                filters.startDate,
                filters.endDate,
                filters.departmentId
            );
            setReportData(data);
        } catch (error) {
            toast.error(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await attendanceService.exportAttendance(
                filters.startDate,
                filters.endDate
            );
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${filters.startDate}_to_${filters.endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error(t('exportError') || t('error'));
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('attendanceReports') || 'Attendance Reports'}</h1>
                    <p className="text-gray-500">Analyze workforce attendance and work hour distributions.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Download className="h-4 w-4" />
                    {t('export')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{t('reportPeriod') || 'Report Period'}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{t('department') || 'Department'}</label>
                    <select
                        className="w-48 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.departmentId}
                        onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                    >
                        <option value="">{t('allDepartments')}</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                >
                    {loading ? <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div> : <Search className="h-4 w-4" />}
                    {t('update')}
                </button>
            </div>

            {reportData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">{t('totalHours')}</span>
                            </div>
                            <div className="text-2xl font-bold">{reportData.totals.hours}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <BarChart className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">{t('overtimeHours') || 'Overtime Hours'}</span>
                            </div>
                            <div className="text-2xl font-bold">{reportData.totals.overtime}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">{t('totalEmployees')}</span>
                            </div>
                            <div className="text-2xl font-bold">{reportData.totals.employees}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Records</span>
                            </div>
                            <div className="text-2xl font-bold">{reportData.totals.records}</div>
                        </div>
                    </div>

                    {/* Employee Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Employee Performance Breakdown</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">{t('employee')}</th>
                                        <th className="px-6 py-4">{t('department')}</th>
                                        <th className="px-6 py-4">Days Present</th>
                                        <th className="px-6 py-4">Total Hours</th>
                                        <th className="px-6 py-4">Overtime</th>
                                        <th className="px-6 py-4">Approval Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reportData.employees.map((emp) => (
                                        <tr key={emp.userId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{emp.name}</div>
                                                <div className="text-xs text-gray-500">ID: {emp.employeeNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                                            <td className="px-6 py-4 text-gray-900 font-semibold">{emp.totalDays}</td>
                                            <td className="px-6 py-4 text-gray-900">{emp.totalHours}h</td>
                                            <td className="px-6 py-4 text-orange-600 font-medium">{emp.totalOvertime}h</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className="bg-green-500 h-1.5 rounded-full"
                                                            style={{ width: `${(emp.approvedDays / emp.totalDays) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {Math.round((emp.approvedDays / emp.totalDays) * 100)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AttendanceReports;
