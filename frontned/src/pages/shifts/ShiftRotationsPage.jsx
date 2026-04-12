import React, { useState, useEffect } from 'react';
import {
    Plus,
    RotateCcw,
    Play,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    Layers,
    Trash2,
    XCircle
} from 'lucide-react';

import shiftService from '../../services/shiftService';
import organizationService from '../../services/organizationService';
import employeeService from '../../services/employeeService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';

const ShiftRotationsPage = () => {
    const { t } = useTranslation();
    const [rotations, setRotations] = useState([]);
    const [shiftTypes, setShiftTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [applyingRotation, setApplyingRotation] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        department_id: '',
        rotation_pattern: [],
        cycle_days: 7
    });

    const [applyData, setApplyData] = useState({
        employee_ids: [],
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 27), 'yyyy-MM-dd')
    });

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rotRes, typesRes, deptsRes, empRes] = await Promise.all([
                shiftService.getShiftRotations({ include_inactive: true }),
                shiftService.getShiftTypes(),
                organizationService.getDepartments(),
                employeeService.getEmployees()
            ]);
            setRotations(rotRes.data);
            setShiftTypes(typesRes.data);
            setDepartments(deptsRes);
            setEmployees(empRes.employees || empRes);
        } catch (error) {
            toast.error(t('failedToLoadData'));
        } finally {
            setLoading(false);
        }
    };

    const getShiftName = (id) => {
        if (id === null) return t('dayOff');
        const st = shiftTypes.find(t => t.id === id);
        return st ? st.name : `Shift #${id}`;
    };

    const getShiftColor = (id) => {
        if (id === null) return '#9ca3af';
        const st = shiftTypes.find(t => t.id === id);
        return st?.color_code || '#3788d8';
    };

    const addPatternStep = (shiftTypeId) => {
        setFormData(f => ({
            ...f,
            rotation_pattern: [...f.rotation_pattern, shiftTypeId]
        }));
    };

    const removePatternStep = (index) => {
        setFormData(f => ({
            ...f,
            rotation_pattern: f.rotation_pattern.filter((_, i) => i !== index)
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (formData.rotation_pattern.length === 0) {
            toast.error(t('rotationPatternRequired'));
            return;
        }
        setSubmitting(true);
        try {
            await shiftService.createShiftRotation({
                ...formData,
                cycle_days: formData.rotation_pattern.length
            });
            toast.success(t('rotationCreated'));
            setIsCreateOpen(false);
            setFormData({ name: '', description: '', department_id: '', rotation_pattern: [], cycle_days: 7 });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToCreateRotation'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (submitting) return;
        if (applyData.employee_ids.length === 0) {
            toast.error(t('selectAtLeastOneEmployee'));
            return;
        }
        setSubmitting(true);
        try {
            const res = await shiftService.applyShiftRotation(applyingRotation.id, applyData);
            const data = res.data;
            toast.success(t('rotationApplied', { created: data.created }) + (data.skipped_conflicts > 0 ? `, ${t('conflictsSkipped', { skipped: data.skipped_conflicts })}` : ''));
            setIsApplyOpen(false);
            setApplyData({ employee_ids: [], start_date: format(new Date(), 'yyyy-MM-dd'), end_date: format(addDays(new Date(), 27), 'yyyy-MM-dd') });
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToApplyRotation'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('confirmDeleteRotation'))) return;
        try {
            await shiftService.deleteShiftRotation(id);
            toast.success(t('rotationDeactivated'));
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToDeactivateRotation'));
        }
    };

    const handleReactivate = async (id) => {
        if (!window.confirm(t('confirmReactivate'))) return;
        try {
            await shiftService.reactivateShiftRotation(id);
            toast.success(t('rotationReactivated'));
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || t('failedToReactivateRotation'));
        }
    };

    const openApplyModal = (rotation) => {
        setApplyingRotation(rotation);
        setIsApplyOpen(true);
    };

    const toggleEmployee = (empId) => {
        setApplyData(prev => ({
            ...prev,
            employee_ids: prev.employee_ids.includes(empId)
                ? prev.employee_ids.filter(id => id !== empId)
                : [...prev.employee_ids, empId]
        }));
    };

    /** Filter employees by rotation's department */
    const filteredEmployees = applyingRotation
        ? employees.filter(emp => emp.department_id === applyingRotation.department_id)
        : employees;

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
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <RotateCcw size={28} className="text-blue-600" />
                        {t('shiftRotations')}
                    </h1>
                    <p className="text-gray-500 mt-1">{t('createAndApplyRotatingPatterns')}</p>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mt-4 w-fit">
                        <button
                            onClick={() => setShowInactive(false)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!showInactive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('active')}
                        </button>
                        <button
                            onClick={() => setShowInactive(true)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${showInactive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t('inactive')}
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-100 font-medium h-fit"
                >
                    <Plus size={20} />
                    {t('newRotation')}
                </button>
            </div>

            {/* Rotation Cards */}
            {rotations.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <RotateCcw size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">{t('noRotationsYet')}</h3>
                    <p className="text-gray-500 mt-1">{t('createRotationPatternInfo')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rotations
                        .filter(rot => rot.is_active === !showInactive)
                        .map(rot => (
                            <div key={rot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{rot.name}</h3>
                                            {rot.description && <p className="text-sm text-gray-500 mt-1">{rot.description}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {rot.is_active ? (
                                                <>
                                                    <button
                                                        onClick={() => openApplyModal(rot)}
                                                        className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        <Play size={14} />
                                                        {t('apply')}
                                                    </button>
                                                    {(user.role === 'admin' || user.role === 'hr' || user.role === 'manager') && (
                                                        <button
                                                            onClick={() => handleDelete(rot.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                            title={t('deactivate')}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleReactivate(rot.id)}
                                                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <RotateCcw size={14} />
                                                    {t('reactivate')}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>{rot.Department?.name || t('allDepts')}</span>
                                        <span className="text-gray-300">|</span>
                                        <Layers size={14} className="text-gray-400" />
                                        <span>{t('dayCycle', { days: rot.cycle_days })}</span>
                                    </div>

                                    {/* Pattern visualization */}
                                    <div className="flex flex-wrap gap-2">
                                        {rot.rotation_pattern?.map((stepId, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                                                style={{
                                                    backgroundColor: `${getShiftColor(stepId)}10`,
                                                    borderColor: `${getShiftColor(stepId)}30`,
                                                    color: getShiftColor(stepId)
                                                }}
                                            >
                                                <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-[10px] font-bold" style={{ color: getShiftColor(stepId) }}>
                                                    {i + 1}
                                                </span>
                                                {getShiftName(stepId)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Create Rotation Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsCreateOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                            <h2 className="text-xl font-bold text-gray-900">{t('newShiftRotation')}</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameWithStar')}</label>
                                <input
                                    type="text" required
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. 3-Shift Weekly Rotation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                                <textarea
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="2"
                                    value={formData.description}
                                    onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Optional description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('departmentWithStar')}</label>
                                <select
                                    required
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.department_id}
                                    onChange={(e) => setFormData(f => ({ ...f, department_id: e.target.value }))}
                                >
                                    <option value="">{t('selectDepartment')}</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Pattern Builder */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('rotationPatternWithStar')} <span className="text-gray-400 font-normal">({formData.rotation_pattern.length} {t('days')})</span>
                                </label>

                                {/* Current pattern */}
                                {formData.rotation_pattern.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-xl">
                                        {formData.rotation_pattern.map((stepId, i) => (
                                            <div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 text-xs">
                                                <span className="font-bold text-gray-500">D{i + 1}:</span>
                                                <span className="font-medium" style={{ color: getShiftColor(stepId) }}>
                                                    {getShiftName(stepId)}
                                                </span>
                                                <button type="button" onClick={() => removePatternStep(i)} className="ml-1 text-gray-400 hover:text-red-500">
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {shiftTypes
                                        .filter(st => !formData.department_id || st.department_id === parseInt(formData.department_id))
                                        .map(st => (
                                            <button
                                                key={st.id}
                                                type="button"
                                                onClick={() => addPatternStep(st.id)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors hover:shadow-sm"
                                                style={{
                                                    borderColor: `${st.color_code}40`,
                                                    color: st.color_code,
                                                    backgroundColor: `${st.color_code}08`
                                                }}
                                            >
                                                + {st.name}
                                            </button>
                                        ))}
                                    <button
                                        type="button"
                                        onClick={() => addPatternStep(null)}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        + {t('dayOff')}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium">{t('cancel')}</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md disabled:opacity-50">
                                    {submitting ? t('creating') : t('createRotation')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Apply Rotation Modal */}
            {isApplyOpen && applyingRotation && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsApplyOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{t('apply')}: {applyingRotation.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">{t('dayCycle', { days: applyingRotation.cycle_days })}</p>
                                </div>
                                <button onClick={() => setIsApplyOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                            </div>
                        </div>
                        <form onSubmit={handleApply} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')} *</label>
                                    <input
                                        type="date" required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={applyData.start_date}
                                        onChange={(e) => setApplyData(d => ({ ...d, start_date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')} *</label>
                                    <input
                                        type="date" required
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={applyData.end_date}
                                        onChange={(e) => setApplyData(d => ({ ...d, end_date: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Employee Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('selectEmployees')} * <span className="text-gray-400 font-normal">({applyData.employee_ids.length} {t('selected')})</span>
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-50">
                                    {filteredEmployees.map(emp => (
                                        <label key={emp.user_id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                checked={applyData.employee_ids.includes(emp.user_id)}
                                                onChange={() => toggleEmployee(emp.user_id)}
                                            />
                                            <span className="text-sm text-gray-800">
                                                {emp.User?.first_name} {emp.User?.last_name}
                                            </span>
                                        </label>
                                    ))}
                                    {filteredEmployees.length === 0 && (
                                        <p className="px-4 py-6 text-center text-gray-400 text-sm">No employees found for this department</p>
                                    )}
                                </div>
                                {filteredEmployees.length > 0 && (
                                    <button
                                        type="button"
                                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        onClick={() => setApplyData(d => ({
                                            ...d,
                                            employee_ids: d.employee_ids.length === filteredEmployees.length
                                                ? []
                                                : filteredEmployees.map(e => e.user_id)
                                        }))}
                                    >
                                        {applyData.employee_ids.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsApplyOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-md disabled:opacity-50">
                                    {submitting ? 'Applying...' : 'Apply Rotation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftRotationsPage;
