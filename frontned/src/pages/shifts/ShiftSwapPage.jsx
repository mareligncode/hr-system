import React, { useState, useEffect } from 'react';
import {
    ArrowRightLeft,
    Check,
    X,
    Clock,
    User,
    Calendar,
    Filter,
    MessageSquare
} from 'lucide-react';
import shiftService from '../../services/shiftService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ShiftSwapPage = () => {
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [viewMode, setViewMode] = useState('my'); // 'my' or 'team'

    const { user } = useSelector((state) => state.auth);
    const isManager = ['admin', 'hr', 'manager'].includes(user?.role);

    useEffect(() => {
        // Default managers to team view
        if (isManager) setViewMode('team');
    }, [isManager]);

    useEffect(() => {
        fetchSwaps();
    }, [filter, viewMode]);

    const fetchSwaps = async () => {
        try {
            setLoading(true);
            const res = viewMode === 'team' && isManager
                ? await shiftService.getShiftSwaps({ status: filter })
                : await shiftService.getMySwaps({ status: filter });
            setSwaps(res.data);
        } catch (error) {
            toast.error('Failed to load swap requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await shiftService.approveShiftSwap(id);
            toast.success('Swap request approved');
            fetchSwaps();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to approve');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason === null) return;

        try {
            await shiftService.rejectShiftSwap(id, { rejection_reason: reason });
            toast.success('Swap request rejected');
            fetchSwaps();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reject');
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shift Swaps</h1>
                    <p className="text-gray-500">
                        {isManager ? 'Manage team swap requests and view your own' : 'View your swap status'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {isManager && (
                        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                            <button
                                onClick={() => setViewMode('team')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'team' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Team Swaps
                            </button>
                            <button
                                onClick={() => setViewMode('my')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'my' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                My Swaps
                            </button>
                        </div>
                    )}



                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                        {['pending', 'approved', 'rejected'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${filter === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div >

            {
                loading ? (
                    <div className="space-y-4" >
                        {
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
                            ))
                        }
                    </div>
                ) : (
                    <div className="space-y-4">
                        {swaps.length > 0 ? (
                            swaps.map((swap) => (
                                <div key={swap.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
                                                    <User size={24} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900">{swap.Requester?.User?.first_name} {swap.Requester?.User?.last_name}</h3>
                                                    <ArrowRightLeft className="text-blue-400" size={16} />
                                                    <h3 className="font-bold text-gray-900">
                                                        {swap.TargetEmployee ? `${swap.TargetEmployee.User.first_name} ${swap.TargetEmployee.User.last_name}` : <span className="text-gray-400 font-normal italic">Open Swap</span>}
                                                    </h3>
                                                    {/* Badge for open/peer */}
                                                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${swap.TargetEmployee ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        {swap.TargetEmployee ? 'Peer-to-Peer' : 'Open Pool'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        <span>{format(new Date(swap.requested_date), 'MMM d, yyyy')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} />
                                                        <span className="font-medium text-blue-600 italic">
                                                            {swap.ShiftAssignment?.ShiftType?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 rounded-xl flex-1 max-w-md">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                                <MessageSquare size={12} />
                                                Reason
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 italic">"{swap.reason}"</p>
                                        </div>

                                        {swap.status === 'pending' && isManager && viewMode === 'team' && (
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleReject(swap.id)}
                                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition flex items-center gap-2"
                                                >
                                                    <X size={18} /> Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(swap.id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition flex items-center gap-2 shadow-lg shadow-green-100"
                                                >
                                                    <Check size={18} /> Approve
                                                </button>
                                            </div>
                                        )}

                                        {swap.status === 'pending' && (!isManager || viewMode === 'my') && (
                                            <div className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider shrink-0 bg-yellow-50 text-yellow-700 border border-yellow-200">
                                                Awaiting Approval
                                            </div>
                                        )}

                                        {swap.status !== 'pending' && (
                                            <div className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider shrink-0 shadow-sm border ${swap.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                {swap.status}
                                            </div>
                                        )}
                                    </div>
                                    {swap.rejection_reason && (
                                        <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs text-red-700">
                                            <span className="font-bold">Rejection Reason:</span> {swap.rejection_reason}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                                <ArrowRightLeft size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No swap requests found in this category.</p>
                            </div>
                        )}
                    </div>
                )}
        </div >
    );
};

export default ShiftSwapPage;
