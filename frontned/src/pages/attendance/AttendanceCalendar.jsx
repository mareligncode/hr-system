import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    XCircle,
    HelpCircle
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    isToday
} from 'date-fns';

const AttendanceCalendar = () => {
    const { t } = useTranslation();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, [currentMonth]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            const data = await attendanceService.getMyAttendance(startDate, endDate);
            setAttendanceData(data);
        } catch (error) {
            console.error('Fetch Calendar Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('attendanceCalendar') || 'Attendance Calendar'}</h1>
                        <p className="text-gray-500">{format(currentMonth, 'MMMM yyyy')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2 border-b border-gray-100">
                {days.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const dayStr = format(day, 'yyyy-MM-dd');
                const attendance = attendanceData.find(a => isSameDay(new Date(a.clock_in), day));

                days.push(
                    <div
                        key={dayStr}
                        className={`min-h-[120px] p-2 border-b border-r border-gray-100 transition-colors ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50 text-gray-300' : 'bg-white'
                            } ${isToday(day) ? 'ring-2 ring-inset ring-blue-500 ring-opacity-50' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                                {format(day, 'd')}
                            </span>
                            {attendance && (
                                <div title={attendance.status}>
                                    {attendance.status === 'approved' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    {attendance.status === 'pending' && <HelpCircle className="h-4 w-4 text-amber-500" />}
                                    {attendance.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                                </div>
                            )}
                        </div>

                        {attendance ? (
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Clock In / Out</div>
                                <div className="text-xs font-medium text-gray-700 bg-blue-50 rounded px-1.5 py-0.5 border border-blue-100">
                                    {format(new Date(attendance.clock_in), 'HH:mm')} - {attendance.clock_out ? format(new Date(attendance.clock_out), 'HH:mm') : '--:--'}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{attendance.work_hours}h worked</span>
                                </div>
                                {attendance.overtime_hours > 0 && (
                                    <div className="text-[10px] text-orange-600 font-medium">
                                        +{attendance.overtime_hours}h OT
                                    </div>
                                )}
                            </div>
                        ) : isSameMonth(day, monthStart) && day < new Date() ? (
                            <div className="mt-4 text-center">
                                <span className="text-[10px] text-gray-300 font-medium lowercase italic">No record</span>
                            </div>
                        ) : null}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="border-t border-l border-gray-100 rounded-xl overflow-hidden shadow-sm">{rows}</div>;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {renderHeader()}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-4">
                {renderDays()}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    renderCells()
                )}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Approved</span>
                </div>
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    <span>Pending Approval</span>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-blue-500 ring-2 ring-blue-500 ring-opacity-50 rounded-sm"></div>
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
