import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    IconButton,
    Tooltip,
    Fade,
    Zoom,
    Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    FileText, 
    Send, 
    Info, 
    ArrowLeft, 
    CheckCircle2, 
    AlertCircle,
    Clock,
    Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSettings } from '../../context/SettingsContext';
import leaveService from '../../services/leaveService';

const LeaveRequestPage = () => {
    const { t } = useSettings();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
        is_half_day: false,
        half_day_session: 'morning'
    });

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const fetchLeaveTypes = async () => {
        try {
            const response = await leaveService.getLeaveTypes();
            setLeaveTypes(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('errorLoadingLeaveTypes') || 'Failed to load leave types');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        if (!formData.leave_type_id) {
            setError(t('leaveTypeRequired'));
            setSubmitting(false);
            return;
        }

        try {
            await leaveService.requestLeave(formData);
            setSuccess(t('leaveRequestSuccess'));
            setFormData({
                leave_type_id: '',
                start_date: '',
                end_date: '',
                reason: '',
                is_half_day: false,
                half_day_session: 'morning'
            });
            // Re-fetch types to update balances if needed
            fetchLeaveTypes();
        } catch (err) {
            setError(err.response?.data?.error || t('errorSubmittingLeave'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
                <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
            </motion.div>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 } }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            fontWeight="900" 
                            sx={{ 
                                letterSpacing: '-0.02em',
                                mb: 1,
                                background: 'linear-gradient(45deg, #3b82f6 30%, #9333ea 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {t('requestLeave')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {t('leavePageSubtext') || 'Fill out the form below to submit your leave application.'}
                        </Typography>
                    </Box>
                    <Tooltip title={t('backToDashboard')}>
                        <IconButton 
                            onClick={() => navigate('/dashboard')}
                            sx={{ 
                                bgcolor: 'action.hover', 
                                border: '1px solid', 
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'action.selected' }
                            }}
                        >
                            <ArrowLeft />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Column: Leave Balances & Info */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ position: { lg: 'sticky' }, top: 100 }}>
                            {/* Summary Card */}
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    mb: 3, 
                                    borderRadius: 4, 
                                    border: '1px solid', 
                                    borderColor: 'divider',
                                    background: 'var(--bg-surface-soft)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Typography variant="h6" fontWeight="800" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Briefcase size={20} className="text-blue-500" />
                                    {t('availableBalances') || 'Available Balances'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {leaveTypes.map((type, idx) => (
                                        <motion.div 
                                            key={type.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 + 0.3 }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="700">{type.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{type.is_paid ? t('paid') : t('unpaid')}</Typography>
                                                </Box>
                                                <Typography variant="h6" fontWeight="900" color="primary.main">
                                                    {type.days_per_year} <Typography component="span" variant="caption" color="text.secondary">/yr</Typography>
                                                </Typography>
                                            </Box>
                                        </motion.div>
                                    ))}
                                    {leaveTypes.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                            <Info className="text-muted-foreground mb-2" size={32} />
                                            <Typography variant="body2" color="text.secondary">
                                                {t('noLeaveTypesAvailable')}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>

                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 4, 
                                    border: '1px solid', 
                                    borderColor: 'divider',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="800" mb={1}>{t('needHelp') || 'Need Help?'}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {t('leavePolicyText') || 'Check our company policy for leave requirements and documentation needs.'}
                                </Typography>
                                <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2 }}>
                                    <Info size={120} />
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Right Column: Request Form */}
                    <Grid item xs={12} lg={8}>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: { xs: 3, md: 5 }, 
                                borderRadius: 5, 
                                border: '1px solid', 
                                borderColor: 'divider',
                                background: 'var(--bg-surface)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Alert 
                                            severity="success" 
                                            icon={<CheckCircle2 />}
                                            sx={{ mb: 4, borderRadius: 3, fontWeight: 600, border: '1px solid', borderColor: 'success.light' }}
                                        >
                                            {success}
                                        </Alert>
                                    </motion.div>
                                )}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Alert 
                                            severity="error" 
                                            icon={<AlertCircle />}
                                            sx={{ mb: 4, borderRadius: 3, fontWeight: 600, border: '1px solid', borderColor: 'error.light' }}
                                        >
                                            {error}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12}>
                                        <Box mb={1} display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                                                {t('leaveTypeSelection') || 'Select Leave Category'}
                                            </Typography>
                                        </Box>
                                        <FormControl 
                                            fullWidth 
                                            required 
                                            variant="outlined"
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    bgcolor: 'background.paper',
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                                }
                                            }}
                                        >
                                            <InputLabel id="leave-type-label">{t('leaveType')}</InputLabel>
                                            <Select
                                                labelId="leave-type-label"
                                                id="leave_type_id"
                                                name="leave_type_id"
                                                value={formData.leave_type_id}
                                                onChange={handleChange}
                                                label={t('leaveType')}
                                                startAdornment={<Briefcase size={18} className="mr-2 text-primary" style={{ marginRight: '10px' }} />}
                                            >
                                                {leaveTypes.length === 0 ? (
                                                    <MenuItem value="" disabled>{t('noLeaveTypesAvailable')}</MenuItem>
                                                ) : (
                                                    [
                                                        <MenuItem key="placeholder" value="" disabled>{t('selectLeaveType')}</MenuItem>,
                                                        ...leaveTypes.map((type) => (
                                                            <MenuItem key={type.id} value={type.id}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                    <Typography fontWeight="600">{type.name}</Typography>
                                                                    <Chip size="small" label={type.code} sx={{ opacity: 0.6 }} />
                                                                </Box>
                                                            </MenuItem>
                                                        ))
                                                    ]
                                                )}
                                            </Select>
                                            {leaveTypes.length === 0 && (
                                                <FormHelperText error sx={{ mt: 1, fontWeight: 600 }}>
                                                    {(user?.role === 'admin' || user?.role === 'hr') ? t('pleaseSetupTypes') : t('contactAdmin')}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box mb={1} display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                                                {t('startDate') || 'Start Date'}
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            InputProps={{ 
                                                startAdornment: <Calendar size={18} className="mr-2 text-muted-foreground" style={{ marginRight: '10px' }} />,
                                                sx: { borderRadius: 3, bgcolor: 'background.paper' }
                                            }}
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box mb={1} display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                                                {t('endDate') || 'End Date'}
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            InputProps={{ 
                                                startAdornment: <Calendar size={18} className="mr-2 text-muted-foreground" style={{ marginRight: '10px' }} />,
                                                sx: { borderRadius: 3, bgcolor: 'background.paper' }
                                            }}
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box mb={1} display="flex" alignItems="center" gap={1}>
                                            <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                                                {t('reasonAndDetails') || 'Reason & Additional Details'}
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={5}
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            placeholder={t('reasonPlaceholder') || 'Please describe the reason for your leave request...'}
                                            required
                                            InputProps={{ 
                                                startAdornment: <FileText size={18} className="mr-2 text-muted-foreground mt-1" style={{ marginRight: '10px', marginTop: '10px', alignSelf: 'flex-start' }} />,
                                                sx: { borderRadius: 4, bgcolor: 'background.paper' }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                size="large"
                                                fullWidth
                                                disabled={submitting || leaveTypes.length === 0}
                                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                                                sx={{ 
                                                    py: 2.5, 
                                                    borderRadius: 4, 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '900',
                                                    textTransform: 'none',
                                                    boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
                                                    '&:hover': { boxShadow: '0 20px 30px -10px rgba(59, 130, 246, 0.6)' }
                                                }}
                                            >
                                                {submitting ? t('submitting') : t('submitRequest')}
                                            </Button>
                                        </motion.div>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </motion.div>
        </Container>
    );
};

export default LeaveRequestPage;
