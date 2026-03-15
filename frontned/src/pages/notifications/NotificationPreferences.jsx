import { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { useSettings } from '../../context/SettingsContext';

const NotificationPreferences = () => {
    const { t } = useSettings();
    const [settings, setSettings] = useState({
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        notify_on_leave_status: true,
        notify_on_payroll: true,
        notify_on_shift_swap: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await notificationService.getSettings();
            if (data) {
                setSettings({
                    email_notifications: data.email_notifications,
                    push_notifications: data.push_notifications,
                    in_app_notifications: data.in_app_notifications,
                    notify_on_leave_status: data.notify_on_leave_status,
                    notify_on_payroll: data.notify_on_payroll,
                    notify_on_shift_swap: data.notify_on_shift_swap
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load preferences.' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await notificationService.updateSettings(settings);
            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
            // hide message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save preferences.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4 flex justify-center mt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const ToggleSwitch = ({ label, description, checked, onChange }) => (
        <div className="flex items-center justify-between py-4 border-b border-[var(--border-main)] last:border-0">
            <div className="flex-1 pr-6">
                <h4 className="text-sm font-semibold text-[var(--text-main)] text-left">{label}</h4>
                {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
            </div>
            <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                role="switch"
                aria-checked={checked}
                onClick={onChange}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-main)]">Notification Preferences</h1>
                <p className="text-[var(--text-muted)] text-sm mt-1">Control how and when you want to be notified.</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:border-red-800'}`}>
                    <svg className={`w-5 h-5 mt-0.5 shrink-0 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {message.type === 'success'
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                    </svg>
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Global Notification Channels */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]">
                        <h3 className="font-bold text-[var(--text-main)]">Delivery Methods</h3>
                    </div>
                    <div className="px-6">
                        <ToggleSwitch
                            label="Email Notifications"
                            description="Receive important updates via email to your primary address."
                            checked={settings.email_notifications}
                            onChange={() => handleToggle('email_notifications')}
                        />
                        <ToggleSwitch
                            label="In-App Notifications"
                            description="Show alerts in the dropdown menu while actively using the application."
                            checked={settings.in_app_notifications}
                            onChange={() => handleToggle('in_app_notifications')}
                        />
                        <ToggleSwitch
                            label="Push Notifications"
                            description="Receive push notifications on your mobile device (Requires mobile app installed)."
                            checked={settings.push_notifications}
                            onChange={() => handleToggle('push_notifications')}
                        />
                    </div>
                </div>

                {/* Specific Event Triggers */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-surface-soft)]">
                        <h3 className="font-bold text-[var(--text-main)]">Alert Triggers</h3>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mt-1">Which events notify you</p>
                    </div>
                    <div className="px-6">
                        <ToggleSwitch
                            label="Leave Status Updates"
                            description="Get notified when your manager approves or rejects your leave requests."
                            checked={settings.notify_on_leave_status}
                            onChange={() => handleToggle('notify_on_leave_status')}
                        />
                        <ToggleSwitch
                            label="Payroll Notifications"
                            description="Alert me when a new payslip is generated and available to view."
                            checked={settings.notify_on_payroll}
                            onChange={() => handleToggle('notify_on_payroll')}
                        />
                        <ToggleSwitch
                            label="Shift Swaps"
                            description="Receive alerts when someone requests a swap or responds to your swap request."
                            checked={settings.notify_on_shift_swap}
                            onChange={() => handleToggle('notify_on_shift_swap')}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Preferences'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferences;
