import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, MapPin, Camera, CheckCircle2, XCircle,
    AlertCircle, Calendar, History, Download,
    Wifi, WifiOff, Loader2, X, RotateCcw, Check,
    TrendingUp, Zap, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import attendanceService from '../../services/attendanceService';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import AttendanceCorrectionForm from './AttendanceCorrectionForm';

/* ─────────────────────────────── helpers ─────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');

const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/* ───────────────────────── GPS Status Badge ───────────────────────────── */
const GpsBadge = ({ status, coords, address }) => {
    const cfg = {
        locating: { color: 'text-amber-400', bg: 'bg-amber-400/10  border-amber-400/30', icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Locating…' },
        acquired: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: <MapPin className="w-3 h-3" />, label: address || 'GPS Acquired' },
        unavailable: { color: 'text-rose-400', bg: 'bg-rose-400/10    border-rose-400/30', icon: <WifiOff className="w-3 h-3" />, label: 'GPS Unavailable' },
    }[status] ?? { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/30', icon: <Wifi className="w-3 h-3" />, label: 'GPS' };

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${cfg.color} ${cfg.bg}`}>
            {cfg.icon}
            <span className="max-w-[150px] truncate">{cfg.label}</span>
            {status === 'acquired' && coords && !address && (
                <span className="opacity-60 normal-case tracking-normal font-normal">
                    {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                </span>
            )}
        </div>
    );
};

/* ──────────────────────── Webcam Modal ────────────────────────────────── */
const WebcamModal = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [captured, setCaptured] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then((stream) => {
                if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => setReady(true);
                }
            })
            .catch(() => setCameraError('Camera access denied. Please allow camera permissions.'));
        return () => {
            active = false;
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCaptured(dataUrl);
        streamRef.current?.getTracks().forEach(t => t.stop());
    };

    const handleRetake = () => {
        setCaptured(null);
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then((stream) => {
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
            });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                            <Camera className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-tight">Selfie Verification</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-surface-soft)] transition-colors text-[var(--text-muted)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Camera body */}
                <div className="p-6 space-y-4">
                    {cameraError ? (
                        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center">
                            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                            <p className="text-sm text-rose-400">{cameraError}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-2">You can still clock in without a selfie.</p>
                            <Button className="mt-4 w-full" onClick={() => onCapture(null)}>Continue Without Selfie</Button>
                        </div>
                    ) : captured ? (
                        <>
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
                                <img src={captured} alt="Captured selfie" className="w-full h-full object-cover" />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        ✓ Captured
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1 rounded-xl" onClick={handleRetake}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Retake
                                </Button>
                                <Button className="flex-1 rounded-xl" onClick={() => onCapture(captured)}>
                                    <Check className="w-4 h-4 mr-2" /> Use This Photo
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                {!ready && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    </div>
                                )}
                                {/* Face guide overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-40 h-48 border-2 border-white/30 rounded-full" />
                                </div>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                            <Button className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest" onClick={handleCapture} disabled={!ready}>
                                <Camera className="w-4 h-4 mr-2" />
                                Capture Photo
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ──────────────────────── Confirmation Step ───────────────────────────── */
const ConfirmStep = ({ type, selfie, coords, address, gpsStatus, onConfirm, onCancel, loading }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-main)] shadow-2xl w-full max-w-sm overflow-hidden"
        >
            <div className={`h-1.5 w-full ${type === 'in' ? 'bg-gradient-to-r from-blue-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`} />
            <div className="p-6 space-y-5">
                <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {type === 'in' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                    </div>
                    <h3 className="font-black text-xl uppercase tracking-tight">{type === 'in' ? 'Confirm Clock In' : 'Confirm Clock Out'}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{format(new Date(), 'EEEE, MMMM do • hh:mm:ss a')}</p>
                </div>

                {selfie && (
                    <div className="rounded-2xl overflow-hidden border border-[var(--border-main)] aspect-video bg-black">
                        <img src={selfie} alt="selfie" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="space-y-2">
                    <GpsBadge status={gpsStatus} coords={coords} address={address} />
                    {!window.isSecureContext && window.location.hostname !== 'localhost' && (
                        <p className="text-[10px] text-rose-500 font-bold px-1 bg-rose-500/10 py-1 rounded-lg">
                            ⚠️ Insecure context detected (HTTP). Geolocation requires HTTPS or localhost.
                        </p>
                    )}
                    {gpsStatus === 'unavailable' && (
                        <p className="text-[10px] text-rose-400 font-bold px-1 animate-pulse">
                            ⚠️ GPS error or permission denied. Please allow location access.
                        </p>
                    )}
                    {address && <p className="text-[10px] text-[var(--text-soft)] px-1 leading-relaxed italic">Environment: {address}</p>}
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1 rounded-xl" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        className={`flex-1 rounded-xl font-black ${type === 'out' ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {type === 'in' ? 'Clock In' : 'Clock Out'}
                    </Button>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

/* ═══════════════════════ Main Component ══════════════════════════════════ */
const AttendanceDashboard = () => {
    const { t } = useSettings();

    // Data state
    const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState({ totalHours: 0, totalOvertime: 0, daysPresent: 0 });
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // UI flow state
    const [showWebcam, setShowWebcam] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingType, setPendingType] = useState(null); // 'in' | 'out'
    const [capturedSelfie, setCapturedSelfie] = useState(null);
    const [showCorrection, setShowCorrection] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

    // Clock state
    const [now, setNow] = useState(new Date());
    const [elapsedSec, setElapsedSec] = useState(0);

    /* ── Live clock ── */
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    /* ── Elapsed timer ── */
    useEffect(() => {
        if (!activeSession) { setElapsedSec(0); return; }
        const base = new Date(activeSession.clock_in).getTime();
        const tick = () => setElapsedSec(Math.floor((Date.now() - base) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [activeSession]);

    // GPS & Geocoding state
    const [gpsStatus, setGpsStatus] = useState('locating');
    const [coords, setCoords] = useState(null);
    const [address, setAddress] = useState(null);

    /* ── Reverse Geocoding ── */
    const fetchAddress = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data.display_name) {
                // Shorten common names for cleaner UI
                const parts = data.display_name.split(',');
                setAddress(parts.slice(0, 3).join(','));
            }
        } catch (err) {
            console.error('Geocoding Error:', err);
        }
    };

    /* ── GPS ── */
    useEffect(() => {
        if (!navigator.geolocation) { setGpsStatus('unavailable'); return; }
        setGpsStatus('locating');

        let geocodingTriggered = false;

        const onGpsError = (err) => {
            console.error('GPS Error:', err);
            // If high accuracy failed or timed out, try again with low accuracy
            if (err.code === 3 || err.code === 1) {
                setGpsStatus('unavailable');
            } else {
                setGpsStatus('unavailable');
            }
        };

        const options = {
            enableHighAccuracy: true, // Try high accuracy first
            timeout: 10000,
            maximumAge: 60000
        };

        const id = navigator.geolocation.watchPosition(
            (pos) => {
                const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                // Filter out obviously wrong data (like 0,0)
                if (newCoords.lat === 0 && newCoords.lng === 0) return;

                setGpsStatus('acquired');
                setCoords(newCoords);

                if (!geocodingTriggered) {
                    fetchAddress(newCoords.lat, newCoords.lng);
                    geocodingTriggered = true;
                }
            },
            onGpsError,
            options
        );
        return () => navigator.geolocation.clearWatch(id);
    }, []);

    /* ── Data fetch ── */
    const fetchData = useCallback(async () => {
        try {
            const [historyData, summaryData] = await Promise.all([
                attendanceService.getMyAttendance(),
                attendanceService.getAttendanceSummary()
            ]);
            setHistory(historyData);
            setSummary(summaryData);
            setActiveSession(historyData.find(s => !s.clock_out) ?? null);
        } catch (err) {
            console.error(err);
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── Flow: start clock action ── */
    const startClockAction = (type) => {
        setError(null);
        setSuccess(null);
        setPendingType(type);
        if (type === 'in') {
            setShowWebcam(true);  // open webcam first
        } else {
            setCapturedSelfie(null);
            setShowConfirm(true); // clock-out: confirm directly
        }
    };

    /* ── Flow: selfie captured ── */
    const handleSelfieCaptured = (dataUrl) => {
        setShowWebcam(false);
        setCapturedSelfie(dataUrl);
        setShowConfirm(true);
    };

    /* ── Flow: confirmed ── */
    const handleConfirm = async () => {
        setActionLoading(true);
        try {
            const location = {
                lat: coords?.lat || null,
                lng: coords?.lng || null,
                address: address || ''
            };
            const timestamp = new Date().toISOString();
            if (pendingType === 'in') {
                await attendanceService.clockIn({ location, selfie_url: capturedSelfie, timestamp });
                setSuccess('✅ Clocked in successfully!');
            } else {
                await attendanceService.clockOut({ location, timestamp });
                setSuccess('✅ Clocked out successfully!');
            }
            setShowConfirm(false);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.error || t('error'));
            setShowConfirm(false);
        } finally {
            setActionLoading(false);
        }
    };

    /* ── Export ── */
    const handleExport = async () => {
        try {
            const blob = await attendanceService.exportAttendance();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `my_attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            setError(t('exportError') || 'Failed to export attendance');
        }
    };

    /* ── Loading screen ── */
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    const isClockedIn = !!activeSession;

    /* ══════════════════════════ RENDER ══════════════════════════════════ */
    return (
        <>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">{t('attendance')}</h1>
                        <p className="text-[var(--text-soft)]">{format(now, 'EEEE, MMMM do')}</p>
                    </div>
                    <GpsBadge status={gpsStatus} coords={coords} address={address} />
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
                {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ════════════ Left: Clock Widget ════════════ */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl overflow-hidden text-center"
                            style={{ background: 'var(--bg-surface)' }}
                        >
                            {/* Gradient top bar */}
                            <div className={`h-1.5 w-full ${isClockedIn ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`} />

                            {/* Pulsing ring when active */}
                            {isClockedIn && (
                                <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none">
                                    <div className="absolute inset-0 rounded-[2.5rem] border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                                </div>
                            )}

                            <div className="relative z-10 p-8">
                                {/* Live digital clock */}
                                <div className="mb-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">Current Time</p>
                                    <div className={`text-5xl font-black tabular-nums tracking-tight ${isClockedIn ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
                                        {format(now, 'hh:mm:ss a')}
                                    </div>
                                </div>

                                {/* Status icon */}
                                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isClockedIn ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                                    <Clock className={`w-8 h-8 ${isClockedIn ? 'text-emerald-500' : 'text-blue-500'}`} />
                                </div>

                                <h2 className="text-xl font-black uppercase tracking-tight mb-5">
                                    {isClockedIn ? t('clockedIn') : t('notClockedIn')}
                                </h2>

                                {/* Elapsed timer */}
                                {isClockedIn && (
                                    <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 mb-1">Elapsed Time</p>
                                        <p className="text-2xl font-black tabular-nums text-emerald-400 tracking-tight">
                                            {formatElapsed(elapsedSec)}
                                        </p>
                                        <p className="text-[10px] text-emerald-500/60 mt-1">
                                            Since {format(new Date(activeSession.clock_in), 'hh:mm a')}
                                        </p>
                                    </div>
                                )}

                                {/* Action button */}
                                {!isClockedIn ? (
                                    <button
                                        onClick={() => startClockAction('in')}
                                        className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        {t('clockIn')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => startClockAction('out')}
                                        className="w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-200 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/40 hover:border-rose-500 text-rose-400 hover:text-white hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {t('clockOut')}
                                    </button>
                                )}

                                {/* GPS & Camera indicators */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                    <div className={`flex items-center gap-1.5 ${gpsStatus === 'acquired' ? 'text-emerald-500' : gpsStatus === 'locating' ? 'text-amber-500' : 'text-rose-500'}`}>
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="max-w-[80px] truncate">{address || (gpsStatus === 'acquired' ? 'GPS Ready' : gpsStatus === 'locating' ? 'Locating…' : 'No GPS')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-400">
                                        <Camera className="w-3.5 h-3.5" />
                                        Selfie Required
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Weekly Stats ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[var(--bg-surface)] p-6 rounded-[2rem] border border-[var(--border-main)] shadow-sm"
                        >
                            <h3 className="font-bold mb-5 flex items-center gap-2 uppercase tracking-tight">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                {t('weeklySummary')}
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: t('hoursWorked'), value: `${summary.totalHours}h`, color: 'text-blue-500', icon: <Clock className="w-4 h-4" /> },
                                    { label: 'Overtime', value: `${summary.totalOvertime}h`, color: 'text-amber-500', icon: <TrendingUp className="w-4 h-4" /> },
                                    { label: 'Days Present', value: summary.daysPresent, color: 'text-emerald-500', icon: <CheckCircle2 className="w-4 h-4" /> },
                                ].map((stat) => (
                                    <div key={stat.label} className="p-4 bg-[var(--bg-surface-soft)] rounded-2xl border border-[var(--border-main)]/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`opacity-60 ${stat.color}`}>{stat.icon}</span>
                                            <span className="text-xs font-bold text-[var(--text-muted)] uppercase">{stat.label}</span>
                                        </div>
                                        <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* ════════════ Right: History ════════════ */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border-main)] shadow-sm overflow-hidden h-full"
                        >
                            {/* Panel header */}
                            <div className="p-6 border-b border-[var(--border-main)] flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-500">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">{t('attendanceHistory')}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border-main)] hover:bg-[var(--bg-surface-soft)] transition-colors text-[var(--text-soft)]"
                                    >
                                        <Download className="w-3.5 h-3.5" /> {t('export')}
                                    </button>
                                    <button
                                        onClick={() => { setSelectedAttendanceId(null); setShowCorrection(true); }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border-main)] hover:bg-[var(--bg-surface-soft)] transition-colors text-[var(--text-soft)]"
                                    >
                                        <AlertCircle className="w-3.5 h-3.5" /> {t('requestCorrection')}
                                    </button>
                                </div>
                            </div>

                            {/* History rows */}
                            <div className="divide-y divide-[var(--border-main)]/50 overflow-y-auto max-h-[520px]">
                                {history.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <Clock className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
                                        <p className="text-[var(--text-soft)] text-sm">No attendance records found.</p>
                                    </div>
                                ) : (
                                    history.map((row) => {
                                        const hours = row.work_hours || 0;
                                        const pct = Math.min((hours / 8) * 100, 100);
                                        const isActive = !row.clock_out;
                                        return (
                                            <motion.div
                                                key={row.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-5 hover:bg-[var(--bg-surface-soft)]/40 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    {/* Date + status */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-main)] flex flex-col items-center justify-center flex-shrink-0">
                                                            <span className="text-[9px] font-black text-blue-500 uppercase">{format(new Date(row.clock_in), 'MMM')}</span>
                                                            <span className="text-lg font-black leading-tight">{format(new Date(row.clock_in), 'dd')}</span>
                                                            <span className="text-[9px] text-[var(--text-muted)]">{format(new Date(row.clock_in), 'EEE')}</span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                                                                <span className="font-bold text-sm">{isActive ? 'In Progress' : t('clockedOut')}</span>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-3">
                                                                <span>IN: {format(new Date(row.clock_in), 'hh:mm a')}</span>
                                                                {row.clock_out && <><span>→</span><span>OUT: {format(new Date(row.clock_out), 'hh:mm a')}</span></>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Hours + progress + status badge */}
                                                    <div className="flex items-center gap-6 sm:min-w-[200px]">
                                                        <div className="flex-1">
                                                            <div className="flex justify-between text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1.5">
                                                                <span>{t('hoursWorked')}</span>
                                                                <span className="font-black text-[var(--text-primary)]">{hours}h</span>
                                                            </div>
                                                            <div className="h-1.5 rounded-full bg-[var(--bg-surface-soft)] overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 ${row.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                                row.status === 'rejected' ? 'bg-rose-500/10    text-rose-400    border-rose-500/30' :
                                                                    'bg-amber-500/10   text-amber-400   border-amber-500/30'
                                                                }`}
                                                            onClick={() => { setSelectedAttendanceId(row.id); setShowCorrection(true); }}
                                                            title="Click to request correction"
                                                        >
                                                            {row.status || 'pending'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ════ Modals ════ */}
            <AnimatePresence>
                {showWebcam && (
                    <WebcamModal
                        onCapture={handleSelfieCaptured}
                        onClose={() => { setShowWebcam(false); setPendingType(null); }}
                    />
                )}
                {showConfirm && (
                    <ConfirmStep
                        type={pendingType}
                        selfie={capturedSelfie}
                        coords={coords}
                        address={address}
                        gpsStatus={gpsStatus}
                        onConfirm={handleConfirm}
                        onCancel={() => { setShowConfirm(false); setCapturedSelfie(null); setPendingType(null); }}
                        loading={actionLoading}
                    />
                )}
            </AnimatePresence>

            {/* Correction modal */}
            <AttendanceCorrectionForm
                isOpen={showCorrection}
                onClose={() => setShowCorrection(false)}
                attendanceId={selectedAttendanceId}
                onSuccess={() => { setSuccess('Correction request submitted!'); fetchData(); }}
            />
        </>
    );
};

export default AttendanceDashboard;
