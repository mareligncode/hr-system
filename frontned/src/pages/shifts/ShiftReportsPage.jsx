import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Clock,
    Users,
    AlertTriangle,
    Calendar,
    TrendingUp,
    Download,
    Filter
} from 'lucide-react';
import shiftService from '../../services/shiftService';
import organizationService from '../../services/organizationService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const ShiftReportsPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [activeTab, setActiveTab] = useState('coverage');
    const [filters, setFilters] = useState({
        department_id: '',
        from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        organizationService.getDepartments().then(d => setDepartments(d)).catch(() => { });
    }, []);

    useEffect(() => {
        fetchReport();
    }, [filters, activeTab]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await shiftService.getShiftReports({
                type: activeTab,
                ...filters
            });
            setReportData(res.data);
        } catch (error) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const setDatePreset = (preset) => {
        const now = new Date();
        let from, to;
        switch (preset) {
            case 'thisMonth':
                from = startOfMonth(now);
                to = endOfMonth(now);
                break;
            case 'lastMonth':
                from = startOfMonth(subMonths(now, 1));
                to = endOfMonth(subMonths(now, 1));
                break;
            case 'last3Months':
                from = startOfMonth(subMonths(now, 2));
                to = endOfMonth(now);
                break;
            default:
                return;
        }
        setFilters(f => ({ ...f, from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') }));
    };

    const tabs = [
        { key: 'coverage', label: 'Coverage', icon: <Users size={16} /> },
        { key: 'overtime', label: 'Overtime', icon: <Clock size={16} /> },
        { key: 'summary', label: 'Shift Distribution', icon: <BarChart3 size={16} /> }
    ];

    const renderCoverageReport = () => {
        if (!reportData) return null;
        const { total_employees, total_shifts, daily_coverage } = reportData;

        const avgCoverage = daily_coverage?.length > 0
            ? Math.round(daily_coverage.reduce((sum, d) => sum + d.coverage_percentage, 0) / daily_coverage.length)
            : 0;

        return (
            <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Employees</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{total_employees}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Shifts</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{total_shifts}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Avg Coverage</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{avgCoverage}%</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Days Covered</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{daily_coverage?.length || 0}</p>
                    </div>
                </div>

                {/* Daily Coverage Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Daily Coverage Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium">Date</th>
                                    <th className="text-center px-4 py-3 font-medium">Shifts Assigned</th>
                                    <th className="text-center px-4 py-3 font-medium">Unique Employees</th>
                                    <th className="text-center px-4 py-3 font-medium">Coverage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {daily_coverage?.map((day, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {format(new Date(day.date + 'T00:00:00'), 'EEE, MMM d')}
                                        </td>
                                        <td className="px-4 py-3 text-center">{day.shifts_assigned}</td>
                                        <td className="px-4 py-3 text-center">{day.unique_employees}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${day.coverage_percentage >= 80 ? 'bg-green-500' : day.coverage_percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${Math.min(100, day.coverage_percentage)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`font-semibold text-xs ${day.coverage_percentage >= 80 ? 'text-green-600' : day.coverage_percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {day.coverage_percentage}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!daily_coverage || daily_coverage.length === 0) && (
                                    <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No data for the selected period</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderOvertimeReport = () => {
        if (!reportData || !Array.isArray(reportData)) return null;

        const totalOT = reportData.reduce((sum, emp) => sum + emp.overtime_hours, 0);

        return (
            <div>
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Employees</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">With Overtime</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{reportData.filter(e => e.overtime_hours > 0).length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total OT Hours</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{totalOT.toFixed(1)}</p>
                    </div>
                </div>

                {/* OT Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Employee Overtime Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium">Employee</th>
                                    <th className="text-left px-4 py-3 font-medium">Department</th>
                                    <th className="text-center px-4 py-3 font-medium">Shifts</th>
                                    <th className="text-center px-4 py-3 font-medium">Total Hours</th>
                                    <th className="text-center px-4 py-3 font-medium">Overtime</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reportData.map((emp, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{emp.employee_name}</td>
                                        <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                                        <td className="px-4 py-3 text-center">{emp.total_shifts}</td>
                                        <td className="px-4 py-3 text-center">{emp.total_hours}h</td>
                                        <td className="px-4 py-3 text-center">
                                            {emp.overtime_hours > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                                                    <AlertTriangle size={14} />
                                                    {emp.overtime_hours}h
                                                </span>
                                            ) : (
                                                <span className="text-green-600 font-medium">0h</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {reportData.length === 0 && (
                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No data for the selected period</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderSummaryReport = () => {
        if (!reportData || !Array.isArray(reportData)) return null;

        const totalAssignments = reportData.reduce((sum, s) => sum + s.total_assignments, 0);

        return (
            <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Shift Types Used</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Assignments</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{totalAssignments}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Night Shifts</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                            {reportData.filter(s => s.is_overnight).reduce((sum, s) => sum + s.total_assignments, 0)}
                        </p>
                    </div>
                </div>

                {/* Distribution Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.map((s, i) => {
                        const pct = totalAssignments > 0 ? Math.round((s.total_assignments / totalAssignments) * 100) : 0;
                        return (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-1.5" style={{ backgroundColor: s.color_code }}></div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{s.shift_name}</h4>
                                            <p className="text-xs text-gray-500 font-mono">{s.shift_code}</p>
                                        </div>
                                        <span className="text-2xl font-bold" style={{ color: s.color_code }}>{pct}%</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Assignments</span>
                                            <span className="font-medium">{s.total_assignments}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Unique Employees</span>
                                            <span className="font-medium">{s.unique_employees}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Time</span>
                                            <span className="font-medium">{s.time_range}</span>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: s.color_code }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {reportData.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-400">No data for the selected period</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={28} className="text-blue-600" />
                    Shift Reports
                </h1>
                <p className="text-gray-500 mt-1">Analyze shift coverage, overtime, and distribution</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    {['admin', 'hr'].includes(user?.role) && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                            <select
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[180px]"
                                value={filters.department_id}
                                onChange={(e) => setFilters(f => ({ ...f, department_id: e.target.value }))}
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.from}
                            onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.to}
                            onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
                        />
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => setDatePreset('thisMonth')} className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">This Month</button>
                        <button onClick={() => setDatePreset('lastMonth')} className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Last Month</button>
                        <button onClick={() => setDatePreset('last3Months')} className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Last 3 Mo</button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Report Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {activeTab === 'coverage' && renderCoverageReport()}
                    {activeTab === 'overtime' && renderOvertimeReport()}
                    {activeTab === 'summary' && renderSummaryReport()}
                </>
            )}
        </div>
    );
};

export default ShiftReportsPage;
