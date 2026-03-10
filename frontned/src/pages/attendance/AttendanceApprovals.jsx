import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    MessageSquare,
    User as UserIcon,
    Calendar as CalendarIcon,
    ArrowRight
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const AttendanceApprovals = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('corrections'); // corrections or pending
    const [corrections, setCorrections] = useState([]);
    const [pendingAttendance, setPendingAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [corrData, attendanceData] = await Promise.all([
                attendanceService.getCorrectionRequests(),
                attendanceService.getTeamAttendance() // defaults to today's pending if filtered in component
            ]);

            setCorrections(corrData.filter(c => c.status === 'pending'));
            setPendingAttendance(attendanceData.filter(a => a.status === 'pending'));
        } catch (error) {
            console.error('Fetch Approvals Error:', error);
            toast.error(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCorrection = async (id, status) => {
        setProcessingId(id);
        try {
            await attendanceService.approveCorrection(id, status, comment);
            toast.success(status === 'approved' ? t('success') : t('statusUpdated'));
            setComment('');
            fetchData();
        } catch (error) {
            toast.error(t('error'));
        } finally {
            setProcessingId(null);
        }
    };

    const handleAttendance = async (id, status) => {
        setProcessingId(id);
        try {
            await attendanceService.approveAttendance(id, status, comment);
            toast.success(status === 'approved' ? t('success') : t('statusUpdated'));
            setComment('');
            fetchData();
        } catch (error) {
            toast.error(t('error'));
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('pendingApprovals')}</h1>
                    <p className="text-gray-500">{t('monitorSystemWide')}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('corrections')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'corrections'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('requestCorrection')} ({corrections.length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'pending'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('attendance')} ({pendingAttendance.length})
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : activeTab === 'corrections' ? (
                    corrections.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">No pending correction requests</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {corrections.map((corr) => (
                                <div key={corr.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {corr.User?.first_name} {corr.User?.last_name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">{corr.User?.Employee?.Department?.name}</p>
                                                </div>
                                                {corr.Attendance?.selfie_in && (
                                                    <div className="ml-auto">
                                                        <img
                                                            src={corr.Attendance.selfie_in}
                                                            alt="Clock-in Selfie"
                                                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                                            onClick={() => window.open(corr.Attendance.selfie_in, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Original: {corr.Attendance?.clock_in ? format(new Date(corr.Attendance.clock_in), 'HH:mm') : '--:--'}</span>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                                <div className="flex items-center gap-2 text-blue-600 font-medium">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Requested: {corr.requested_clock_in ? format(new Date(corr.requested_clock_in), 'HH:mm') : '--:--'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 text-sm text-gray-600 p-2 border-l-4 border-yellow-400 bg-yellow-50 rounded">
                                                <MessageSquare className="h-4 w-4 mt-0.5 text-yellow-600 shrink-0" />
                                                <p className="italic">"{corr.reason}"</p>
                                            </div>
                                        </div>

                                        <div className="md:w-72 space-y-3">
                                            <textarea
                                                placeholder="Add a comment..."
                                                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                rows="2"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            ></textarea>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCorrection(corr.id, 'rejected')}
                                                    disabled={processingId === corr.id}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    {t('reject')}
                                                </button>
                                                <button
                                                    onClick={() => handleCorrection(corr.id, 'approved')}
                                                    disabled={processingId === corr.id}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    {t('approve')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    pendingAttendance.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">No pending attendance records needing approval</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {pendingAttendance.map((att) => (
                                <div key={att.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {att.User?.first_name} {att.User?.last_name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">{att.User?.Employee?.Department?.name}</p>
                                                </div>
                                                {att.selfie_in && (
                                                    <div className="ml-auto">
                                                        <img
                                                            src={att.selfie_in}
                                                            alt="Clock-in Selfie"
                                                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                                            onClick={() => window.open(att.selfie_in, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    <span>{format(new Date(att.clock_in), 'MMM dd, yyyy')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                                                        {format(new Date(att.clock_in), 'HH:mm')} - {att.clock_out ? format(new Date(att.clock_out), 'HH:mm') : '??:??'}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-gray-700 font-medium">
                                                    Total Worked: <span className="text-blue-600">{att.work_hours} hrs</span>
                                                    {att.overtime_hours > 0 && <span className="ml-2 text-orange-600">(+{att.overtime_hours} OT)</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-72 space-y-3">
                                            <textarea
                                                placeholder="Add a comment..."
                                                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                rows="2"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            ></textarea>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAttendance(att.id, 'rejected')}
                                                    disabled={processingId === att.id}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    {t('reject')}
                                                </button>
                                                <button
                                                    onClick={() => handleAttendance(att.id, 'approved')}
                                                    disabled={processingId === att.id}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    {t('approve')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default AttendanceApprovals;
