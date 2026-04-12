import React, { useState } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import attendanceService from '../../services/attendanceService';
import { useSettings } from '../../context/SettingsContext';

const AttendanceCorrectionForm = ({ isOpen, onClose, attendanceId, onSuccess }) => {
    const { t } = useSettings();
    const [formData, setFormData] = useState({
        requested_clock_in: '',
        requested_clock_out: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await attendanceService.requestCorrection({
                attendance_id: attendanceId,
                ...formData
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">{t('requestCorrection')}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && <Alert type="error" message={error} className="mb-6" />}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('clockIn')}
                            type="datetime-local"
                            value={formData.requested_clock_in}
                            onChange={(e) => setFormData({ ...formData, requested_clock_in: e.target.value })}
                            required
                        />
                        <Input
                            label={t('clockOut')}
                            type="datetime-local"
                            value={formData.requested_clock_out}
                            onChange={(e) => setFormData({ ...formData, requested_clock_out: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 px-1">
                            {t('correctionReason')}
                        </label>
                        <textarea
                            className="w-full bg-[var(--bg-surface-soft)] border border-[var(--border-main)] rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500/50 transition-colors min-h-[120px] resize-none"
                            placeholder="Why do you need this correction?"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-[10px] font-bold text-blue-600/80 leading-relaxed uppercase tracking-wider">
                            Correction requests will be reviewed by your manager. Please provide accurate details.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="secondary" type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest">
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest">
                            Submit Request
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceCorrectionForm;
