import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    XCircle,
    HelpCircle,
    MapPin,
    Camera,
    AlertCircle,
    TrendingUp,
    Download,
    Filter,
    Users,
    User as UserIcon,
    Eye,
    Coffee,
    Activity,
    BarChart3
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import { useSettings } from '../../context/SettingsContext';
import usePermission from '../../hooks/usePermission';
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
    isToday,
    isWeekend,
    isBefore,
    startOfDay
} from 'date-fns';

const AttendanceCalendar = () => {
    const { t } = useSettings();
    const { user } = useSelector((state) => state.auth);
    const { role, hasPermission } = usePermission();
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [viewMode, setViewMode] = useState('my'); // 'my' or 'team'
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        overtime: 0,
        totalHours: 0
    });

    const canViewTeam = ['admin', 'hr', 'manager'].includes(role);

    useEffect(() => {
        fetchAttendance();
    }, [currentMonth, viewMode, selectedDepartment]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            
            if (viewMode === 'my' || !canViewTeam) {
                const data = await attendanceService.getMyAttendance(startDate, endDate);
                setAttendanceData(data);
                calculateStats(data);
            } else {
                // Fetch team data for managers/hr/admin
                const teamAttendance = await attendanceService.getAttendanceReports(
                    startDate, 
                    endDate, 
                    selectedDepartment
                );
                setTeamData(teamAttendance);
            }
        } catch (error) {
            console.error('Fetch Calendar Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const present = data.filter(a => a.clock_in).length;
        const late = data.filter(a => {
            if (!a.clock_in) return false;
            const clockInTime = new Date(a.clock_in);
            const expectedTime = new Date(clockInTime);
            expectedTime.setHours(9, 0, 0, 0); // Assuming 9 AM start
            return clockInTime > expectedTime;
        }).length;
        
        const totalHours = data.reduce((sum, a) => sum + (parseFloat(a.work_hours) || 0), 0);
        const overtime = data.reduce((sum, a) => sum + (parseFloat(a.overtime_hours) || 0), 0);
        
        setStats({
            present,
            absent: getDaysInMonth() - present,
            late,
            overtime: overtime.toFixed(1),
            totalHours: totalHours.toFixed(1)
        });
    };

    const getDaysInMonth = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        let count = 0;
        let day = start;
        while (day <= end) {
            if (!isWeekend(day)) count++;
            day = addDays(day, 1);
        }
        return count;
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                        <CalendarIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">{t('attendanceCalendar')}</h1>
                        <p className="text-sm text-[var(--text-soft)] font-bold mt-1">
                            {format(currentMonth, 'MMMM yyyy')} • {stats.present} Days Present
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Toggle for managers/hr/admin */}
                    {canViewTeam && (
                        <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1.5 rounded-xl border border-[var(--border-main)]">
                            <button
                                onClick={() => setViewMode('my')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                    viewMode === 'my'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                }`}
                            >
                                <UserIcon className="w-3.5 h-3.5 inline mr-1.5" />
                                My View
                            </button>
                            <button
                                onClick={() => setViewMode('team')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                    viewMode === 'team'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                }`}
                            >
                                <Users className="w-3.5 h-3.5 inline mr-1.5" />
                                Team View
                            </button>
                        </div>
                    )}

                    {/* Month Navigation */}
                    <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1.5 rounded-xl border border-[var(--border-main)]">
                        <button
                            onClick={prevMonth}
                            className="p-2 rounded-lg hover:bg-[var(--bg-surface-soft)] transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-[var(--bg-surface-soft)] rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 rounded-lg hover:bg-[var(--bg-surface-soft)] transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] hover:bg-[var(--bg-surface-soft)] transition-colors"
                        title="Export Calendar"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };

    const renderStats = () => {
        const statCards = [
            { label: 'Present', value: stats.present, icon: <CheckCircle2 className="w-5 h-5" />, color: 'emerald', bgGradient: 'from-emerald-500 to-teal-500' },
            { label: 'Absent', value: stats.absent, icon: <XCircle className="w-5 h-5" />, color: 'rose', bgGradient: 'from-rose-500 to-pink-500' },
            { label: 'Late Check-ins', value: stats.late, icon: <AlertCircle className="w-5 h-5" />, color: 'amber', bgGradient: 'from-amber-500 to-orange-500' },
            { label: 'Total Hours', value: `${stats.totalHours}h`, icon: <Clock className="w-5 h-5" />, color: 'blue', bgGradient: 'from-blue-500 to-indigo-500' },
            { label: 'Overtime', value: `${stats.overtime}h`, icon: <TrendingUp className="w-5 h-5" />, color: 'purple', bgGradient: 'from-purple-500 to-violet-500' },
        ];

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-main)] p-5 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.bgGradient} text-white shadow-md`}>
                                {stat.icon}
                            </div>
                        </div>
                        <p className="text-2xl font-black text-[var(--text-main)] mb-1">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{stat.label}</p>
                    </motion.div>
                ))}
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]/50">
                {days.map((day, index) => (
                    <div
                        key={day}
                        className={`py-4 text-center text-xs font-black uppercase tracking-widest ${
                            index === 0 || index === 6 ? 'text-blue-500' : 'text-[var(--text-muted)]'
                        }`}
                    >
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
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);
                const isWeekendDay = isWeekend(day);
                const isPastDay = isBefore(day, startOfDay(new Date())) && !isTodayDate;
                const currentDay = day;

                // Determine status colors
                let statusColor = 'bg-[var(--bg-surface)]';
                let borderColor = 'border-[var(--border-main)]';
                
                if (attendance) {
                    if (attendance.status === 'approved') {
                        statusColor = 'bg-emerald-500/5';
                        borderColor = 'border-emerald-500/20';
                    } else if (attendance.status === 'rejected') {
                        statusColor = 'bg-rose-500/5';
                        borderColor = 'border-rose-500/20';
                    } else {
                        statusColor = 'bg-amber-500/5';
                        borderColor = 'border-amber-500/20';
                    }
                } else if (isPastDay && isCurrentMonth && !isWeekendDay) {
                    statusColor = 'bg-rose-500/5';
                    borderColor = 'border-rose-500/10';
                }

                days.push(
                    <motion.div
                        key={dayStr}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => attendance && setSelectedDay(attendance)}
                        className={`min-h-[140px] p-3 border-r border-b ${borderColor} ${statusColor} transition-all duration-200 ${
                            !isCurrentMonth ? 'opacity-30' : ''
                        } ${isTodayDate ? 'ring-2 ring-blue-500 ring-inset' : ''} ${
                            attendance ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''
                        } ${isWeekendDay ? 'bg-slate-50/50' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span
                                className={`text-sm font-black ${
                                    isTodayDate
                                        ? 'bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center'
                                        : isWeekendDay
                                        ? 'text-blue-500'
                                        : 'text-[var(--text-main)]'
                                }`}
                            >
                                {format(currentDay, 'd')}
                            </span>

                            {attendance && (
                                <div className="flex items-center gap-1">
                                    {attendance.status === 'approved' && (
                                        <div className="p-1 rounded-full bg-emerald-500/10" title="Approved">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    )}
                                    {attendance.status === 'pending' && (
                                        <div className="p-1 rounded-full bg-amber-500/10" title="Pending">
                                            <HelpCircle className="w-4 h-4 text-amber-500" />
                                        </div>
                                    )}
                                    {attendance.status === 'rejected' && (
                                        <div className="p-1 rounded-full bg-rose-500/10" title="Rejected">
                                            <XCircle className="w-4 h-4 text-rose-500" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {attendance ? (
                            <div className="space-y-2">
                                {/* Clock In/Out Time */}
                                <div className="bg-[var(--bg-surface)] rounded-xl p-2 border border-[var(--border-main)]/50">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Clock className="w-3 h-3 text-blue-500" />
                                        <span className="font-bold text-[var(--text-main)]">
                                            {format(new Date(attendance.clock_in), 'HH:mm')}
                                        </span>
                                        <span className="text-[var(--text-muted)]">→</span>
                                        <span className="font-bold text-[var(--text-main)]">
                                            {attendance.clock_out ? format(new Date(attendance.clock_out), 'HH:mm') : '--:--'}
                                        </span>
                                    </div>
                                </div>

                                {/* Work Hours */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider">Hours</span>
                                    <span className="font-black text-blue-600">{attendance.work_hours || 0}h</span>
                                </div>

                                {/* Overtime */}
                                {attendance.overtime_hours > 0 && (
                                    <div className="flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-200">
                                        <TrendingUp className="w-3 h-3" />
                                        <span className="font-black">+{attendance.overtime_hours}h OT</span>
                                    </div>
                                )}

                                {/* Breaks */}
                                {attendance.AttendanceBreaks && attendance.AttendanceBreaks.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-amber-600">
                                        <Coffee className="w-3 h-3" />
                                        <span className="font-bold">{attendance.AttendanceBreaks.length} break(s)</span>
                                    </div>
                                )}

                                {/* Location Indicator */}
                                {attendance.location_in && (
                                    <div className="flex items-center gap-1 text-[9px] text-blue-500">
                                        <MapPin className="w-2.5 h-2.5" />
                                        <span className="font-bold truncate">GPS Verified</span>
                                    </div>
                                )}

                                {/* Selfie Indicator */}
                                {attendance.selfie_in && (
                                    <div className="flex items-center gap-1 text-[9px] text-purple-500">
                                        <Camera className="w-2.5 h-2.5" />
                                        <span className="font-bold">Photo ✓</span>
                                    </div>
                                )}
                            </div>
                        ) : isCurrentMonth && isPastDay && !isWeekendDay ? (
                            <div className="mt-8 text-center">
                                <XCircle className="w-6 h-6 text-rose-300 mx-auto mb-1" />
                                <span className="text-[9px] text-rose-400 font-black uppercase tracking-wider">Absent</span>
                            </div>
                        ) : isWeekendDay && isCurrentMonth ? (
                            <div className="mt-8 text-center">
                                <Activity className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Weekend</span>
                            </div>
                        ) : null}
                    </motion.div>
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

        return <div className="border-t border-l border-[var(--border-main)] rounded-2xl overflow-hidden shadow-sm">{rows}</div>;
    };

    const renderDayDetailModal = () => {
        if (!selectedDay) return null;

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedDay(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl w-full max-w-lg p-8"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">
                                    {format(new Date(selectedDay.clock_in), 'MMMM dd, yyyy')}
                                </h3>
                                <p className="text-sm text-[var(--text-soft)] font-bold mt-1">
                                    {format(new Date(selectedDay.clock_in), 'EEEE')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="p-2 rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest mb-6 ${
                            selectedDay.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : selectedDay.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                            {selectedDay.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                            {selectedDay.status === 'rejected' && <XCircle className="w-4 h-4" />}
                            {selectedDay.status === 'pending' && <HelpCircle className="w-4 h-4" />}
                            {selectedDay.status}
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            {/* Time Card */}
                            <div className="bg-[var(--bg-surface-soft)] rounded-2xl p-5 border border-[var(--border-main)]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Clock In</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="text-lg font-black">{format(new Date(selectedDay.clock_in), 'hh:mm a')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Clock Out</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-rose-500" />
                                            <span className="text-lg font-black">
                                                {selectedDay.clock_out ? format(new Date(selectedDay.clock_out), 'hh:mm a') : '--:--'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Work Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">Total Hours</p>
                                    <p className="text-2xl font-black text-blue-600">{selectedDay.work_hours || 0}h</p>
                                </div>
                                <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-600 mb-1">Overtime</p>
                                    <p className="text-2xl font-black text-orange-600">{selectedDay.overtime_hours || 0}h</p>
                                </div>
                                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-purple-600 mb-1">Breaks</p>
                                    <p className="text-2xl font-black text-purple-600">{selectedDay.AttendanceBreaks?.length || 0}</p>
                                </div>
                            </div>

                            {/* Selfie */}
                            {selectedDay.selfie_in && (
                                <div className="bg-[var(--bg-surface-soft)] rounded-2xl p-4 border border-[var(--border-main)]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Clock-In Selfie</p>
                                    <img
                                        src={selectedDay.selfie_in}
                                        alt="Clock-in Selfie"
                                        className="w-full h-48 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => window.open(selectedDay.selfie_in, '_blank')}
                                    />
                                </div>
                            )}

                            {/* Location */}
                            {selectedDay.location_in && (
                                <div className="bg-[var(--bg-surface-soft)] rounded-2xl p-4 border border-[var(--border-main)]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Location</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-bold">
                                            {typeof selectedDay.location_in === 'object'
                                                ? selectedDay.location_in.address || `${selectedDay.location_in.lat}, ${selectedDay.location_in.lng}`
                                                : selectedDay.location_in}
                                        </span>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${
                                            typeof selectedDay.location_in === 'object'
                                                ? `${selectedDay.location_in.lat},${selectedDay.location_in.lng}`
                                                : selectedDay.location_in
                                        }`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 underline font-bold mt-2 inline-block"
                                    >
                                        View on Map →
                                    </a>
                                </div>
                            )}

                            {/* Admin Comment */}
                            {selectedDay.admin_comment && (
                                <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Admin Comment</p>
                                    <p className="text-sm text-amber-700 italic">"{selectedDay.admin_comment}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    const renderLegend = () => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-main)] p-6"
            >
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-xs font-bold">Approved</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold">Pending</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-rose-500" />
                        </div>
                        <span className="text-xs font-bold">Rejected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black">
                            15
                        </div>
                        <span className="text-xs font-bold">Today</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50/50 border border-[var(--border-main)] flex items-center justify-center">
                            <Activity className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-xs font-bold">Weekend</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-rose-300" />
                        </div>
                        <span className="text-xs font-bold">Absent</span>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-8 pb-20">
            {renderHeader()}
            {renderStats()}

            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-main)] shadow-sm overflow-hidden">
                {renderDays()}
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading Calendar...</p>
                        </div>
                    </div>
                ) : (
                    renderCells()
                )}
            </div>

            {renderLegend()}
            {renderDayDetailModal()}
        </div>
    );
};

export default AttendanceCalendar;
