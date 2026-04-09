import React, { useState, useEffect } from 'react';
import {
    Calendar,
    ArrowRightLeft,
    Clock,
    AlertCircle,
    ChevronRight,
    MapPin
} from 'lucide-react';
import shiftService from '../../services/shiftService';
import employeeService from '../../services/employeeService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, isToday, isFuture, addDays, parseISO, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

const MyShiftsPage = () => {
    const { t } = useTranslation();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [swapReason, setSwapReason] = useState('');
    const [targetEmployeeId, setTargetEmployeeId] = useState('');
    const [colleagues, setColleagues] = useState([]);

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchMyShifts();
        fetchColleagues();
    }, []);

    const fetchColleagues = async () => {
        try {
            // Fetch employees in the same department
            const data = await employeeService.getEmployees();
            const employees = data.employees || data;
            // Filter out the current user
            setColleagues(employees.filter(e => e.user_id !== user.id));
        } catch (error) {
            console.error('Failed to load colleagues', error);
        }
    };

    const fetchMyShifts = async () => {
        try {
            setLoading(true);
            // Fetch a wider range to be safe (previous 7 days to next 30 days)
            const from = format(addDays(new Date(), -7), 'yyyy-MM-dd');
            const to = format(addDays(new Date(), 30), 'yyyy-MM-dd');

            const res = await shiftService.getMyShifts({ from, to });
            setShifts(res.data);
        } catch (error) {
            toast.error(t('failedToLoadSchedule'));
        } finally {
            setLoading(false);
        }
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

    if (loading) return <div className="p-8 text-center animate-pulse">{t('loadingYourShifts')}</div>;

    // Simplified filtering to avoid timezone edge cases with string dates
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    // If we have shifts, show them all in a sorted list, but highlight/focus on upcoming ones
    const sortedShifts = [...shifts].sort((a, b) => a.assignment_date.localeCompare(b.assignment_date));
    const upcomingShifts = sortedShifts.filter(s => s.assignment_date >= todayStr);

    // Fallback: if no upcoming shifts but we have some shifts in the range we fetched, show them all
    const displayShifts = upcomingShifts.length > 0 ? upcomingShifts : sortedShifts;

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <header className="mb-8 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">{t('myWorkSchedule')}</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('yourAssignedShiftsAndRotations')} ({shifts.length} {t('totalShiftsFound')})</p>
            </header>

            <div className="space-y-6">
                {displayShifts.length > 0 ? (
                    displayShifts.map((shift) => (
                        <div
                            key={shift.id}
                            className={`bg-white rounded-[2rem] shadow-sm border ${isToday(new Date(shift.assignment_date)) ? 'border-blue-200 ring-4 ring-blue-50' : 'border-[var(--border-main)]'} p-6 relative overflow-hidden transition-all hover:shadow-md`}
                        >
                            {shift.assignment_date === todayStr && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                                    {t('today')}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${shift.assignment_date === todayStr ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-600'}`}>
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-80">{format(parseISO(shift.assignment_date), 'EEE')}</span>
                                        <span className="text-2xl sm:text-3xl font-black">{format(parseISO(shift.assignment_date), 'd')}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-gray-900 uppercase tracking-tighter">{shift.ShiftType.name}</h3>
                                        <div className="flex items-center gap-2 text-[var(--text-soft)] mt-1.5 font-bold text-sm">
                                            <Clock size={16} className="text-blue-500" />
                                            <span>{shift.ShiftType.start_time.substring(0, 5)} - {shift.ShiftType.end_time.substring(0, 5)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => { setSelectedShift(shift); setIsSwapModalOpen(true); }}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--bg-surface-soft)] text-[var(--text-main)] hover:bg-blue-50 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-widest border border-transparent hover:border-blue-100"
                                    >
                                        <ArrowRightLeft size={16} />
                                        {t('requestSwap')}
                                    </button>
                                    <button className="hidden sm:flex p-3 text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-[var(--border-main)]/50 flex flex-wrap items-center gap-4 sm:gap-8">
                                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface-soft)]/50 px-3 py-1.5 rounded-full">
                                    <MapPin size={14} className="text-rose-500" />
                                    <span>{t('mainHallLevel2')}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface-soft)]/50 px-3 py-1.5 rounded-full">
                                    <AlertCircle size={14} className="text-amber-500" />
                                    <span>{t('minutesBreak', { minutes: shift.ShiftType.break_duration_minutes })}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">{t('noUpcomingShifts')}</h3>
                        <p className="text-gray-500 mt-1">{t('checkBackLater')}</p>
                    </div>
                )}
            </div>

            {/* Swap Request Modal */}
            {isSwapModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 pb-4">
                            <h2 className="text-2xl font-black text-gray-900">{t('swapShift')}</h2>
                            <p className="text-gray-500 mt-2">{t('requestToSwapYour')} <span className="text-blue-600 font-bold">{selectedShift?.ShiftType.name}</span> {t('shiftOn')} {format(new Date(selectedShift?.assignment_date), 'MMMM d')}.</p>
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
                                    {colleagues.map(c => (
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

export default MyShiftsPage;
