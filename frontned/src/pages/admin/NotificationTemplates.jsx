import { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { useSettings } from '../../context/SettingsContext';

const NotificationTemplates = () => {
    const { t } = useSettings();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: '',
        channels: ['email', 'in_app'],
        variables: [],
        is_active: true
    });
    const [varInput, setVarInput] = useState('');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await notificationService.getTemplates();
            setTemplates(data || []);
        } catch (error) {
            console.error('Failed to load templates', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setFormData({
            name: '',
            subject: '',
            body: '',
            channels: ['email', 'in_app'],
            variables: [],
            is_active: true
        });
        setShowModal(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject,
            body: template.body,
            channels: template.channels || ['email', 'in_app'],
            variables: template.variables || [],
            is_active: template.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await notificationService.deleteTemplate(id);
                loadTemplates();
            } catch (error) {
                console.error('Failed to delete template', error);
                alert('Error deleting template');
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingTemplate) {
                await notificationService.updateTemplate(editingTemplate.id, formData);
            } else {
                await notificationService.createTemplate(formData);
            }
            setShowModal(false);
            loadTemplates();
        } catch (error) {
            console.error('Failed to save template', error);
            alert('Error saving template. Ensure name is unique.');
        }
    };

    const addVariable = (e) => {
        e.preventDefault(); // allow enter key trick if wrapped in minor form container
        if (varInput.trim() && !formData.variables.includes(varInput.trim())) {
            setFormData(prev => ({
                ...prev,
                variables: [...prev.variables, varInput.trim()]
            }));
            setVarInput('');
        }
    };

    const removeVariable = (v) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables.filter(x => x !== v)
        }));
    };

    if (loading) {
        return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading templates...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-main)]">Notification Templates</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Manage email and in-app message templates</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm shadow-blue-500/30 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-[var(--text-main)] truncate pr-2">{template.name}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${template.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Subject</p>
                                <p className="text-sm text-[var(--text-main)] truncate mt-0.5">{template.subject}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Variables</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(template.variables || []).length === 0 ? (
                                        <span className="text-xs text-slate-400 italic">None</span>
                                    ) : (
                                        (template.variables || []).map(v => (
                                            <span key={v} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                {`{{${v}}}`}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative z-10 w-full max-w-2xl bg-[var(--bg-surface)] rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-[var(--border-main)] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[var(--text-main)]">
                                {editingTemplate ? 'Edit Template' : 'Create Template'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="templateForm" onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
                                            Unique Name Identifier
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-input)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. leave_approved"
                                            disabled={!!editingTemplate}
                                        />
                                        {editingTemplate && <p className="text-xs text-orange-500 mt-1">Template name cannot be changed.</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-input)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
                                        Email Subject
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-input)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Available variables: {{variable_name}}"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
                                        Email / App Body Content
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.body}
                                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-input)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                        placeholder="Hello {{first_name}}, your request is approved."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
                                        Variables Expected
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={varInput}
                                            onChange={(e) => setVarInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariable(e); } }}
                                            className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-input)] rounded-lg text-[var(--text-main)] text-sm"
                                            placeholder="e.g. employee_name"
                                        />
                                        <button
                                            type="button"
                                            onClick={addVariable}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-[var(--border-input)]"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 min-h-8 p-3 bg-slate-50 dark:bg-[var(--bg-surface-soft)] border border-[var(--border-input)] rounded-lg">
                                        {formData.variables.map(v => (
                                            <span key={v} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
                                                {v}
                                                <button type="button" onClick={() => removeVariable(v)} className="hover:text-blue-500 focus:outline-none">
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                        {formData.variables.length === 0 && (
                                            <span className="text-sm text-slate-400 italic">No variables added yet</span>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-[var(--border-main)] bg-[var(--bg-surface-soft)] rounded-b-2xl flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface)] border border-[var(--border-input)] rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="templateForm"
                                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationTemplates;
