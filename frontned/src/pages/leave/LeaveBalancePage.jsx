import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    IconButton,
    Tooltip,
    Avatar,
    Button,
    LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Info,
    ArrowRight,
    TrendingUp,
    PieChart,
    CalendarCheck,
    Briefcase,
    MinusCircle,
    PlusCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import leaveService from '../../services/leaveService';

const LeaveBalancePage = () => {
    const { t } = useSettings();
    const [requests, setRequests] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [historyRes, balanceRes] = await Promise.all([
                leaveService.getMyLeaveRequests(),
                leaveService.getMyLeaveBalances()
            ]);
            setRequests(historyRes.data);
            setBalances(balanceRes.data);
        } catch (err) {
            setError(t('errorLoadingLeaveData') || 'Failed to load leave data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return { color: 'success', icon: <CheckCircle2 size={16} />, bg: 'rgba(34, 197, 94, 0.1)' };
            case 'pending': return { color: 'warning', icon: <Clock size={16} />, bg: 'rgba(245, 158, 11, 0.1)' };
            case 'rejected': return { color: 'error', icon: <XCircle size={16} />, bg: 'rgba(239, 68, 68, 0.1)' };
            default: return { color: 'default', icon: <Info size={16} />, bg: 'rgba(100, 116, 139, 0.1)' };
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={50} />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" fontWeight="900" gutterBottom sx={{ background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('leaveDashboard') || 'Leave Dashboard'}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight="500">
                    {t('manageBalancesDescription') || 'View your available balances, accruals, and request history.'}
                </Typography>
            </Box>

            {/* Balances Section */}
            <Typography variant="h5" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PieChart size={24} className="text-blue-500" /> {t('currentBalances') || 'Current Balances'}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                {balances.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ borderRadius: 3 }}>{t('noBalancesFound') || 'No leave balances found for the current year.'}</Alert>
                    </Grid>
                ) : (
                    balances.map((b, idx) => {
                        const usagePercent = Math.min((parseFloat(b.used_days) / (parseFloat(b.accrued_days) + parseFloat(b.carried_forward))) * 100, 100);
                        return (
                            <Grid item xs={12} md={4} key={b.id}>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight="900">{b.LeaveType?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight="700">Year {b.year}</Typography>
                                            </Box>
                                            <Chip label={`${b.balance} ${t('available')}`} color="primary" sx={{ fontWeight: 800, borderRadius: 2 }} />
                                        </Box>

                                        <Grid container spacing={1} sx={{ mb: 2 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Accrued</Typography>
                                                <Typography variant="body2" fontWeight="800">{b.accrued_days}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Carried Over</Typography>
                                                <Typography variant="body2" fontWeight="800">{b.carried_forward}</Typography>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" fontWeight="700">{t('usage')}</Typography>
                                                <Typography variant="caption" fontWeight="700">{b.used_days} Days Used</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={usagePercent || 0}
                                                sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
                                            />
                                        </Box>

                                        {b.encashed_days > 0 && (
                                            <Typography variant="caption" display="flex" alignItems="center" gap={0.5} color="success.main" fontWeight="700">
                                                <TrendingUp size={12} /> {b.encashed_days} Days Encashed
                                            </Typography>
                                        )}
                                    </Paper>
                                </motion.div>
                            </Grid>
                        )
                    })
                )}
            </Grid>

            {/* History Section */}
            <Typography variant="h5" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <History size={24} className="text-purple-500" /> {t('requestHistory') || 'Request History'}
            </Typography>

            <Grid container spacing={2}>
                {requests.slice(0, 10).map((req, idx) => {
                    const styles = getStatusStyles(req.status);
                    return (
                        <Grid item xs={12} key={req.id}>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (idx * 0.05) }}>
                                <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: styles.bg, color: styles.color }}>{styles.icon}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="800">{req.LeaveType?.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{req.start_date} to {req.end_date} • {req.days_requested} Days</Typography>
                                        </Box>
                                    </Box>
                                    <Chip label={req.status} size="small" color={styles.color} variant="outlined" sx={{ fontWeight: 800, borderRadius: 1.5, textTransform: 'uppercase' }} />
                                </Paper>
                            </motion.div>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default LeaveBalancePage;
