import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Clock,
    Calendar,
    XCircle,
    Moon,
    Timer,
    Shield,
    Zap
} from 'lucide-react';
import shiftService from '../../services/shiftService';
import organizationService from '../../services/organizationService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const INITIAL_FORM = {
    name: '',
    code: '',
    department_id: '',
    start_time: '08:00',
    end_time: '16:00',
    break_duration_minutes: 60,
    is_overnight: false,
    overtime_threshold_hours: 8,
    grace_period_minutes: 15,
    color_code: '#3b82f6'
};

const ShiftTypesPage = () => {
    const [shiftTypes, setShiftTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);

    const { user } = useSelector((state) => state.auth);
    const isAdminOrHR = ['admin', 'hr'].includes(user?.role);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [typesRes, deptsRes] = await Promise.all([
                shiftService.getShiftTypes(),
                organizationService.getDepartments()
            ]);
            setShiftTypes(typesRes.data);
            setDepartments(deptsRes);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type = null) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                code: type.code,
                department_id: type.department_id,
                start_time: type.start_time?.substring(0, 5) || '08:00',
                end_time: type.end_time?.substring(0, 5) || '16:00',
                break_duration_minutes: type.break_duration_minutes || 60,
                is_overnight: type.is_overnight || false,
                overtime_threshold_hours: type.overtime_threshold_hours || 8,
                grace_period_minutes: type.grace_period_minutes || 15,
                color_code: type.color_code || '#3b82f6'
            });
        } else {
            setEditingType(null);
            setFormData({
                ...INITIAL_FORM,
                department_id: user?.department_id || ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            if (editingType) {
                await shiftService.updateShiftType(editingType.id, formData);
                toast.success('Shift type updated');
            } else {
                await shiftService.createShiftType(formData);
                toast.success('Shift type created');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this shift type?')) {
            try {
                await shiftService.deleteShiftType(id);
                toast.success('Shift type deactivated');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to deactivate');
            }
        }
    };

    /** Calculate shift duration in readable format */
    const getShiftDuration = (start, end, isOvernight, breakMin) => {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let totalMin = (eh * 60 + em) - (sh * 60 + sm);
        if (isOvernight && totalMin <= 0) totalMin += 1440;
        const netMin = totalMin - (breakMin || 0);
        const hrs = Math.floor(netMin / 60);
        const min = netMin % 60;
        return min > 0 ? `${hrs}h ${min}m` : `${hrs}h`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shift Types</h1>
                    <p className="text-gray-500">Define and manage shift schedules across departments</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-100 font-medium"
                >
                    <Plus size={20} />
                    Add Shift Type
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Types</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{shiftTypes.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Night Shifts</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{shiftTypes.filter(t => t.is_overnight).length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Day Shifts</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{shiftTypes.filter(t => !t.is_overnight).length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departments</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{new Set(shiftTypes.map(t => t.department_id)).size}</p>
                </div>
            </div>

            {/* Shift Type Cards */}
            {shiftTypes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Shift Types Yet</h3>
                    <p className="text-gray-500 mt-1">Create your first shift type to start scheduling</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shiftTypes.map((type) => (
                        <div key={type.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="h-2" style={{ backgroundColor: type.color_code }}></div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{type.name}</h3>
                                        <span className="text-xs font-mono text-gray-400 uppercase">{type.code}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(type)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        {isAdminOrHR && (
                                            <button onClick={() => handleDelete(type.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Clock size={15} className="text-gray-400 flex-shrink-0" />
                                        <span>{type.start_time?.substring(0, 5)} – {type.end_time?.substring(0, 5)}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-500">{getShiftDuration(type.start_time, type.end_time, type.is_overnight, type.break_duration_minutes)} net</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                                        <span>{type.Department?.name || 'All Departments'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Timer size={15} className="text-gray-400 flex-shrink-0" />
                                        <span>{type.break_duration_minutes}m break</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{type.grace_period_minutes}m grace</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Zap size={15} className="text-gray-400 flex-shrink-0" />
                                        <span>OT after {type.overtime_threshold_hours}h</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 flex-wrap">
                                    {type.is_overnight && (
                                        <span className="bg-purple-50 text-purple-700 text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase flex items-center gap-1">
                                            <Moon size={10} /> Night
                                        </span>
                                    )}
                                    <span className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase">
                                        {type.break_duration_minutes}m Break
                                    </span>
                                    <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase">
                                        {type.grace_period_minutes}m Grace
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                            <h2 className="text-xl font-bold text-gray-900">{editingType ? 'Edit Shift Type' : 'New Shift Type'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Morning Shift"
                                    />
                                </div>
                                {/* Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="MORN"
                                    />
                                </div>
                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments?.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    />
                                </div>
                                {/* Break Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Break (minutes)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="480"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.break_duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, break_duration_minutes: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                {/* Grace Period */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (min)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.grace_period_minutes}
                                        onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                {/* Overtime Threshold */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OT Threshold (hrs)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        step="0.5"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.overtime_threshold_hours}
                                        onChange={(e) => setFormData({ ...formData, overtime_threshold_hours: parseFloat(e.target.value) || 8 })}
                                    />
                                </div>
                                {/* Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <input
                                        type="color"
                                        className="w-full h-11 border border-gray-200 rounded-xl cursor-pointer p-1"
                                        value={formData.color_code}
                                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Night Shift Toggle */}
                            <div className="flex items-center gap-3 py-3 px-4 bg-purple-50/50 rounded-xl border border-purple-100">
                                <input
                                    type="checkbox"
                                    id="is_overnight"
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                    checked={formData.is_overnight}
                                    onChange={(e) => setFormData({ ...formData, is_overnight: e.target.checked })}
                                />
                                <label htmlFor="is_overnight" className="text-sm text-gray-700 flex items-center gap-2">
                                    <Moon size={14} className="text-purple-500" />
                                    <span>Night / Overnight Shift</span>
                                    <span className="text-xs text-gray-400">(crosses midnight)</span>
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-100 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (editingType ? 'Save Changes' : 'Create Shift Type')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftTypesPage;
