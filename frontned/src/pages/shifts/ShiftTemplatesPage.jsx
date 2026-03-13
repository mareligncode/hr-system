import React, { useState, useEffect } from 'react';
import {
    Layout,
    Play,
    Calendar,
    Copy,
    Plus,
    X,
    Save,
    Trash2,
    Edit2,
    Info
} from 'lucide-react';
import shiftService from '../../services/shiftService';
import organizationService from '../../services/organizationService';
import employeeService from '../../services/employeeService';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { format, addDays, startOfWeek } from 'date-fns';

const ShiftTemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [shiftTypes, setShiftTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [departments, setDepartments] = useState([]);

    const [newTemplate, setNewTemplate] = useState({
        name: '',
        department_id: '',
        pattern: {
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        }
    });

    const [applyDates, setApplyDates] = useState({
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        apply_to_individual: false,
        employee_id: ''
    });

    const [employees, setEmployees] = useState([]);

    const { user } = useSelector((state) => state.auth);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        fetchTemplates();
        fetchShiftTypes();
        fetchDepartments();
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to load employees');
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await organizationService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await shiftService.getShiftTemplates();
            setTemplates(res.data);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const fetchShiftTypes = async () => {
        try {
            const res = await shiftService.getShiftTypes();
            setShiftTypes(res.data);
        } catch (error) {
            console.error('Failed to load shift types');
        }
    };

    const handleAddShiftToPattern = (day, shiftTypeId) => {
        const type = shiftTypes.find(t => t.id === parseInt(shiftTypeId));
        if (!type) return;

        setNewTemplate(prev => ({
            ...prev,
            pattern: {
                ...prev.pattern,
                [day]: [...prev.pattern[day], {
                    shift_type_id: type.id,
                    name: type.name,
                    start_time: type.start_time
                }]
            }
        }));
    };

    const handleRemoveFromPattern = (day, index) => {
        setNewTemplate(prev => ({
            ...prev,
            pattern: {
                ...prev.pattern,
                [day]: prev.pattern[day].filter((_, i) => i !== index)
            }
        }));
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newTemplate,
                department_id: newTemplate.department_id || user.department_id
            };

            if (selectedTemplate && !isApplyModalOpen) {
                await shiftService.updateShiftTemplate(selectedTemplate.id, payload);
                toast.success('Template updated successfully');
            } else {
                await shiftService.createShiftTemplate(payload);
                toast.success('Template created successfully');
            }
            setIsCreateModalOpen(false);
            fetchTemplates();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save template');
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this template?')) {
            try {
                await shiftService.deleteShiftTemplate(id);
                toast.success('Template deactivated successfully');
                fetchTemplates();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to deactivate template');
            }
        }
    };

    const openEditModal = (template) => {
        setSelectedTemplate(template);
        setNewTemplate({
            name: template.name,
            department_id: template.department_id,
            pattern: template.pattern || {
                monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
            }
        });
        setIsCreateModalOpen(true);
    };

    const openCreateModal = () => {
        setSelectedTemplate(null);
        setNewTemplate({
            name: '',
            department_id: user.department_id || '',
            pattern: {
                monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
            }
        });
        setIsCreateModalOpen(true);
    };

    const handleApplyTemplate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                start_date: applyDates.start_date,
                end_date: applyDates.end_date
            };

            if (applyDates.apply_to_individual && applyDates.employee_id) {
                payload.employee_id = applyDates.employee_id;
            }

            await shiftService.applyShiftTemplate(selectedTemplate.id, payload);
            toast.success('Template applied to roster');
            setIsApplyModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to apply template');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shift Templates</h1>
                    <p className="text-gray-500">Create recurring shift patterns for easier scheduling</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    New Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                <Layout size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setSelectedTemplate(template); setIsApplyModalOpen(true); }}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="Apply to roster"
                                >
                                    <Play size={18} />
                                </button>
                                <button
                                    onClick={() => openEditModal(template)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit template"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete template"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{template.Department?.name || 'General'}</p>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-xs text-gray-400">Created by System</span>
                            <div className="flex -space-x-2">
                                {/* Visual representation of pattern dots */}
                                {days.map(d => (
                                    <div key={d} className={`w-2 h-2 rounded-full border border-white ${template.pattern[d]?.length > 0 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Template Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Create Shift Template</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        placeholder="e.g. Standard Housekeeping Week"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newTemplate.department_id}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, department_id: e.target.value })}
                                        disabled={user.role === 'manager'}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                                {days.map(day => (
                                    <div key={day} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">{day.substring(0, 3)}</h4>
                                        <div className="space-y-2 mb-3">
                                            {newTemplate.pattern[day].map((shift, idx) => (
                                                <div key={idx} className="bg-white p-2 rounded border border-gray-100 text-[10px] relative group">
                                                    <div className="font-bold truncate">{shift.name}</div>
                                                    <div className="text-gray-500">{shift.start_time.substring(0, 5)}</div>
                                                    <button
                                                        onClick={() => handleRemoveFromPattern(day, idx)}
                                                        className="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={8} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <select
                                            className="w-full text-[10px] p-1 border border-gray-200 rounded outline-none bg-white"
                                            onChange={(e) => {
                                                if (e.target.value) handleAddShiftToPattern(day, e.target.value);
                                                e.target.value = "";
                                            }}
                                        >
                                            <option value="">+ Add</option>
                                            {shiftTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium">Cancel</button>
                            <button onClick={handleCreateTemplate} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md shadow-blue-100">Save Template</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Template Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Apply Template</h2>
                            <button onClick={() => setIsApplyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleApplyTemplate} className="p-6 space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                                <Info className="text-blue-500 shrink-0" size={20} />
                                <p className="text-xs text-blue-700">This will bulk-assign shifts based on the template pattern for the selected date range. Conflicts will not be overwritten.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={applyDates.start_date}
                                    onChange={(e) => setApplyDates({ ...applyDates, start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={applyDates.end_date}
                                    onChange={(e) => setApplyDates({ ...applyDates, end_date: e.target.value })}
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        checked={applyDates.apply_to_individual}
                                        onChange={(e) => setApplyDates({ ...applyDates, apply_to_individual: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Apply to specific employee only</span>
                                </label>
                            </div>

                            {applyDates.apply_to_individual && (
                                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-sm font-medium text-gray-700">Target Employee</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        value={applyDates.employee_id}
                                        onChange={(e) => setApplyDates({ ...applyDates, employee_id: e.target.value })}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees
                                            .filter(emp => emp.department_id === selectedTemplate?.department_id)
                                            .map(emp => (
                                                <option key={emp.user_id} value={emp.user_id}>
                                                    {emp.User?.first_name} {emp.User?.last_name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsApplyModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md shadow-blue-100">Confirm Apply</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftTemplatesPage;
