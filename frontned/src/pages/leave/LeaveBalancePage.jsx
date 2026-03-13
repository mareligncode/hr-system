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
    Button  
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
    Filter,
    FileText,
    TrendingUp,
    PieChart
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import leaveService from '../../services/leaveService';

const LeaveBalancePage = () => {
    const { t } = useSettings();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await leaveService.getMyLeaveRequests();
            setRequests(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('errorLoadingLeaveHistory') || 'Failed to load leave history');
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

    const stats = {
        total: requests.length,
        approved: requests.filter(r => r.status === 'approved').length,
        pending: requests.filter(r => r.status === 'pending').length,
        rejected: requests.filter(r => r.status === 'rejected').length
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={50} />
        </Box>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 } }}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h3" fontWeight="900" sx={{ mb: 1, letterSpacing: '-0.02em', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {t('myLeaveHistory')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {t('trackYourLeaveRequests') || 'Track your previous and current leave applications.'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('filter')}>
                            <IconButton sx={{ border: '1px solid', borderColor: 'divider' }}><Filter size={20} /></IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </motion.div>

            {/* Statistics Row */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {[
                    { label: t('totalRequests') || 'Total Requests', value: stats.total, icon: <FileText className="text-blue-500" />, color: '#3b82f6' },
                    { label: t('approved') || 'Approved', value: stats.approved, icon: <CheckCircle2 className="text-emerald-500" />, color: '#10b981' },
                    { label: t('pending') || 'Pending', value: stats.pending, icon: <Clock className="text-amber-500" />, color: '#f59e0b' },
                    { label: t('rejected') || 'Rejected', value: stats.rejected, icon: <XCircle className="text-rose-500" />, color: '#f43f5e' }
                ].map((stat, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: 'var(--bg-surface)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 44, height: 44 }}>
                                        {stat.icon}
                                    </Avatar>
                                    <Typography variant="h4" fontWeight="900">{stat.value}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="700">{stat.label}</Typography>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

            {/* History Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {requests.length === 0 ? (
                    <Paper shadow="none" sx={{ py: 10, textAlign: 'center', borderRadius: 4, bgcolor: 'action.hover', border: '2px dashed', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <History size={64} className="text-muted-foreground opacity-20" />
                            <Typography variant="h6" color="text.secondary" fontWeight="700">
                                {t('noLeaveRequests')}
                            </Typography>
                            <Button variant="contained" onClick={() => (window.location.href = '/leave/request')}>
                                {t('requestLeave')}
                            </Button>
                        </Box>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {requests.map((req) => {
                            const styles = getStatusStyles(req.status);
                            return (
                                <Grid item xs={12} key={req.id}>
                                    <motion.div variants={itemVariants}>
                                        <Paper 
                                            elevation={0}
                                            sx={{ 
                                                p: 3, 
                                                borderRadius: 4, 
                                                border: '1px solid', 
                                                borderColor: 'divider',
                                                background: 'var(--bg-surface)',
                                                '&:hover': { borderColor: 'primary.light', boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)' },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={2}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="800" textTransform="uppercase">
                                                            {t('requestID') || 'Request ID'}
                                                        </Typography>
                                                        <Typography variant="subtitle1" fontWeight="900">#{req.request_number}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="800" textTransform="uppercase">
                                                            {t('leaveType') || 'Type'}
                                                        </Typography>
                                                        <Typography variant="subtitle1" fontWeight="700">{req.LeaveType?.name}</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 2 }}>
                                                            <Calendar size={20} className="text-blue-500" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" fontWeight="800" textTransform="uppercase">
                                                                {t('dates') || 'Duration'}
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="700">
                                                                {req.start_date} <ArrowRight size={14} style={{ display: 'inline', margin: '0 4px' }} /> {req.end_date}
                                                            </Typography>
                                                            <Typography variant="caption" fontWeight="600" color="primary">
                                                                {req.days_requested} {t('days')}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="800" textTransform="uppercase" sx={{ mb: 1, display: 'block' }}>
                                                            {t('status')}
                                                        </Typography>
                                                        <Chip 
                                                            label={req.status.toUpperCase()} 
                                                            color={styles.color}
                                                            icon={styles.icon}
                                                            size="small"
                                                            sx={{ fontWeight: 800, borderRadius: 2, bgcolor: styles.bg, border: '1px solid', borderColor: `${styles.color}.light` }}
                                                        />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <Box sx={{ bgcolor: 'var(--bg-surface-soft)', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <FileText size={12} /> {t('reason') || 'Reason'}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="500" noWrap sx={{ maxWidth: '100%' }}>{req.reason}</Typography>
                                                    </Box>
                                                </Grid>

                                                {/* Expanded Info Bar (Approver Notes) */}
                                                {(req.comments || req.rejection_reason) && (
                                                    <Grid item xs={12}>
                                                        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
                                                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.soft', color: 'primary.main' }}>
                                                                <Info size={14} />
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="caption" fontWeight="800" color="primary">{t('approverNote')}</Typography>
                                                                <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                                                                    "{req.comments || req.rejection_reason}"
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Paper>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </motion.div>
        </Container>
    );
};

export default LeaveBalancePage;
