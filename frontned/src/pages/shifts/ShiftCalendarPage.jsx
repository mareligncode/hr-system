import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Users,
    Plus,
    MoreHorizontal,
    Clock,
    User as UserIcon,
    Edit2,
    Trash2,
    XCircle,
    ArrowRightLeft
} from 'lucide-react';
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    isSameDay,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    eachDayOfInterval
} from 'date-fns';
import shiftService from '../../services/shiftService';
import organizationService from '../../services/organizationService';
import employeeService from '../../services/employeeService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ShiftCalendarPage = () => {
    const { t } = useTranslation();
    const [view, setView] = useState('week'); // 'week' or 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [assignments, setAssignments] = useState([]);
    const [shiftTypes, setShiftTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newAssignment, setNewAssignment] = useState({
        id: null,
        employee_id: '',
        shift_type_id: '',
        assignment_date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    });

    // Swap State
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [swapReason, setSwapReason] = useState('');
    const [targetEmployeeId, setTargetEmployeeId] = useState('');

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchShiftTypes();
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [currentDate, view, selectedEmployeeId]);

    const fetchShiftTypes = async () => {
        try {
            const res = await shiftService.getShiftTypes();
            setShiftTypes(res.data);
        } catch (error) {
            toast.error('Failed to load shift types');
        }
    };

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getEmployees();
            // Handle both flat array and paginated object structures
            setEmployees(data.employees || data);
        } catch (error) {
            console.error('Failed to load employees');
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const start = view === 'week' ? startOfWeek(currentDate) : startOfMonth(currentDate);
            const end = view === 'week' ? endOfWeek(currentDate) : endOfMonth(currentDate);

            const params = {
                from: format(start, 'yyyy-MM-dd'),
                to: format(end, 'yyyy-MM-dd')
            };

            if (selectedEmployeeId) {
                params.employee_id = selectedEmployeeId;
            }

            const res = await shiftService.getShiftAssignments(params);
            setAssignments(res.data);
        } catch (error) {
            toast.error(t('failedToLoadAssignments'));
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setCurrentDate(view === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
    };

    const handlePrev = () => {
        setCurrentDate(view === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
    };

    const handleCellClick = (date) => {
        setSelectedDate(date);
        setNewAssignment({
            id: null,
            employee_id: selectedEmployeeId || '',
            shift_type_id: '',
            assignment_date: format(date, 'yyyy-MM-dd'),
            notes: ''
        });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (e, assign) => {
        e.stopPropagation();
        setSelectedDate(new Date(assign.assignment_date));
        setNewAssignment({
            id: assign.id,
            employee_id: assign.employee_id,
            shift_type_id: assign.shift_type_id,
            assignment_date: assign.assignment_date,
            notes: assign.notes || ''
        });
        setIsAddModalOpen(true);
    };

    const handleSwapClick = (e, shift) => {
        e.stopPropagation();
        setSelectedShift(shift);
        setIsSwapModalOpen(true);
    };

    const handleRequestSwap = async (e) => {
        e.preventDefault();
        try {
            await shiftService.createShiftSwap({
                shift_assignment_id: selectedShift.id,
                target_employee_id: targetEmployeeId,
                reason: swapReason
            });
            toast.success(t('swapRequestSubmitted'));
            setIsSwapModalOpen(false);
            setSwapReason('');
            setTargetEmployeeId('');
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToSubmitSwapRequest'));
        }
    };

    const handleDeleteAssignment = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm(t('confirmDeleteShift'))) return;

        try {
            await shiftService.deleteShiftAssignment(id);
            toast.success(t('shiftDeleted'));
            fetchAssignments();
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToDeleteShift'));
        }
    };

    const handleSaveAssignment = async (e) => {
        e.preventDefault();
        try {
            if (newAssignment.id) {
                await shiftService.updateShiftAssignment(newAssignment.id, newAssignment);
                toast.success(t('shiftUpdated'));
            } else {
                await shiftService.createShiftAssignment(newAssignment);
                toast.success(t('shiftAssigned'));
            }
            setIsAddModalOpen(false);
            setNewAssignment({ id: null, employee_id: '', shift_type_id: '', assignment_date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
            fetchAssignments();
        } catch (error) {
            if (error.response?.status === 409) {
                const conflicts = error.response.data.conflicts || [];
                const conflictMsg = error.response.data.message || t('conflictDetected');

                // Detailed toast for conflicts
                if (Array.isArray(conflicts)) {
                    const details = conflicts.map(c =>
                        `${c.ShiftType?.name || t('shift')} ${t('on')} ${c.assignment_date}`
                    ).join(', ');
                    toast.error(`${conflictMsg}: ${details}`, { duration: 6000 });
                } else {
                    toast.error(conflictMsg);
                }
            } else {
                toast.error(error.response?.data?.error || t('failedToSaveShift'));
            }
        }
    };

    const renderWeekHeader = () => {
        const start = startOfWeek(currentDate);
        return (
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 rounded-t-xl overflow-hidden">
                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                    const date = addDays(start, i);
                    return (
                        <div key={i} className="py-4 text-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{format(date, 'EEE')}</span>
                            <div className={`mt-1 text-lg font-semibold ${isSameDay(date, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>
                                {format(date, 'd')}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekGrid = () => {
        const start = startOfWeek(currentDate);
        const days = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(start, i));

        return (
            <div className="grid grid-cols-7 border-l border-gray-100 min-h-[500px]">
                {days.map(day => (
                    <div
                        key={day.toISOString()}
                        className="border-r border-b border-gray-100 p-2 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                        onClick={() => handleCellClick(day)}
                    >
                        <div className="flex flex-col gap-2 h-full">
                            {assignments.filter(a => {
                                const aDate = a.assignment_date.split('T')[0]; // Ensure we only have YYYY-MM-DD
                                const dDate = format(day, 'yyyy-MM-dd');
                                return aDate === dDate;
                            }).map(assign => (
                                <div
                                    key={assign.id}
                                    style={{
                                        backgroundColor: `${assign.ShiftType.color_code}15`,
                                        borderLeft: `4px solid ${assign.ShiftType.color_code}`
                                    }}
                                    className="p-2 rounded shadow-sm text-xs relative group/item"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold truncate text-gray-800 pr-4">{assign.ShiftType.name}</div>
                                        <div className="hidden group-hover/item:flex items-center gap-1 bg-white/80 p-0.5 rounded shadow-sm">
                                            {(user.role === 'admin' || user.role === 'hr' || user.role === 'manager') && (
                                                <>
                                                    <button
                                                        onClick={(e) => handleEditClick(e, assign)}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title={t('edit')}
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteAssignment(e, assign.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title={t('delete')}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </>
                                            )}
                                            {user.role === 'employee' && assign.employee_id === user.id && (
                                                <button
                                                    onClick={(e) => handleSwapClick(e, assign)}
                                                    className="text-orange-500 hover:text-orange-700 transition-colors"
                                                    title={t('requestSwap')}
                                                >
                                                    <ArrowRightLeft size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-600 flex items-center gap-1">
                                        <UserIcon size={10} />
                                        <span className="truncate">{assign.Employee?.User?.first_name} {assign.Employee?.User?.last_name}</span>
                                    </div>
                                    <div className="text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock size={10} />
                                        <span>{assign.ShiftType.start_time.substring(0, 5)}</span>
                                    </div>
                                </div>
                            ))}
                            {(user.role === 'admin' || user.role === 'hr' || user.role === 'manager') && (
                                <button className="hidden group-hover:flex items-center justify-center py-2 text-blue-600 opacity-50 hover:opacity-100 text-xs gap-1 transition-all">
                                    <Plus size={14} /> {t('assign')}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderMonthGrid = () => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const startVisible = startOfWeek(start);
        const endVisible = endOfWeek(end);

        const days = eachDayOfInterval({ start: startVisible, end: endVisible });

        return (
            <div className="grid grid-cols-7 border-l border-gray-100 min-h-[500px]">
                {days.map(day => {
                    const isSelectedMonth = day.getMonth() === currentDate.getMonth();
                    return (
                        <div
                            key={day.toISOString()}
                            className={`border-r border-b border-gray-100 p-2 min-h-[120px] hover:bg-gray-50/50 transition-colors cursor-pointer group ${!isSelectedMonth ? 'bg-gray-50/30' : ''}`}
                            onClick={() => handleCellClick(day)}
                        >
                            <div className="flex flex-col gap-1 h-full">
                                <div className={`text-right text-[10px] font-bold ${isToday(day) ? 'text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full inline-block ml-auto' : isSelectedMonth ? 'text-gray-400' : 'text-gray-200'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {assignments.filter(a => {
                                        const aDate = a.assignment_date.split('T')[0];
                                        const dDate = format(day, 'yyyy-MM-dd');
                                        return aDate === dDate;
                                    }).map(assign => (
                                        <div
                                            key={assign.id}
                                            style={{
                                                backgroundColor: `${assign.ShiftType.color_code}15`,
                                                borderLeft: `2px solid ${assign.ShiftType.color_code}`
                                            }}
                                            className="p-1 rounded text-[9px] relative group/item truncate"
                                            title={`${assign.ShiftType.name}: ${assign.Employee?.User?.first_name}`}
                                        >
                                            <span className="font-bold">{assign.ShiftType.name.substring(0, 5)}</span>: {assign.Employee?.User?.first_name.substring(0, 1)}.
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 max-w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('shiftCalendar')}</h1>
                    <p className="text-gray-500">{t('manageTeamSchedules')}</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center border-r border-gray-100 pr-2">
                        <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-gray-600" />
                        </button>
                        <span className="px-4 font-semibold text-gray-800 min-w-[150px] text-center">
                            {view === 'week' ? (
                                `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'd, yyyy')}`
                            ) : (
                                format(currentDate, 'MMMM yyyy')
                            )}
                        </span>
                        <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="flex gap-1 p-1">
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t('week')}
                        </button>
                        <button
                            onClick={() => setView('month')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t('month')}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 border-l border-gray-100 pl-4 pr-1">
                        <Users size={16} className="text-gray-400" />
                        <select
                            className="bg-transparent text-sm font-semibold border-none focus:ring-0 outline-none text-gray-700 min-w-[150px] cursor-pointer"
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        >
                            <option value="">{t('allEmployees')}</option>
                            {employees.map(emp => (
                                <option key={emp.user_id} value={emp.user_id}>
                                    {emp.User?.first_name} {emp.User?.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {renderWeekHeader()}
                {view === 'week' ? renderWeekGrid() : renderMonthGrid()}
            </div>

            {/* Manual Assignment Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{newAssignment.id ? t('editShift') : t('assignShift')}</h2>
                                <p className="text-xs text-gray-500 mt-1">{format(selectedDate, 'EEEE, MMMM d')}</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('employee')}</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={newAssignment.employee_id}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, employee_id: e.target.value })}
                                >
                                    <option value="">{t('selectEmployee')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.user_id} value={emp.user_id}>
                                            {emp.User?.first_name} {emp.User?.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('shiftType')}</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={newAssignment.shift_type_id}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, shift_type_id: e.target.value })}
                                >
                                    <option value="">{t('selectShift')}</option>
                                    {shiftTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.start_time.substring(0, 5)} - {t.end_time.substring(0, 5)})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')} {t('optional')}</label>
                                <textarea
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    rows="3"
                                    value={newAssignment.notes}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                                    placeholder={t('notesPlaceholder')}
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md shadow-blue-100"
                                >
                                    {newAssignment.id ? t('updateShift') : t('assignShift')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Swap Request Modal */}
            {isSwapModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 pb-4">
                            <h2 className="text-2xl font-black text-gray-900">{t('swapShift')}</h2>
                            <p className="text-gray-500 mt-2">{t('requestToSwapYour')} <span className="text-blue-600 font-bold">{selectedShift?.ShiftType.name}</span> {t('shiftOn')} {selectedShift?.assignment_date}.</p>
                        </div>
                        <form onSubmit={handleRequestSwap} className="p-8 pt-4 space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('requestSwapWith')}</label>
                                <select
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={targetEmployeeId}
                                    onChange={(e) => setTargetEmployeeId(e.target.value)}
                                >
                                    <option value="">{t('selectEmployee')}</option>
                                    {employees
                                        .filter(emp => emp.user_id !== user.id)
                                        .map(c => (
                                            <option key={c.user_id} value={c.user_id}>
                                                {c.User?.first_name} {c.User?.last_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('swapReason')}</label>
                                <textarea
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    rows="4"
                                    value={swapReason}
                                    onChange={(e) => setSwapReason(e.target.value)}
                                    placeholder={t('swapReasonPlaceholder')}
                                ></textarea>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSwapModalOpen(false)}
                                    className="flex-1 py-4 text-gray-600 font-bold hover:bg-gray-50 rounded-2xl transition"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-1 transition-all"
                                >
                                    {t('sendRequest')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftCalendarPage;
