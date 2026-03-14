import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    IconButton,
    Tooltip,
    Badge
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    XCircle, 
    ClipboardCheck, 
    User, 
    Calendar, 
    Clock, 
    FileText,
    ChevronRight,
    Search,
    Filter,
    MessageSquare,
    AlertTriangle,
    Briefcase
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import leaveService from '../../services/leaveService';

const LeaveApprovalsPage = () => {
    const { t } = useSettings();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [comment, setComment] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('approve'); // 'approve' or 'reject'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await leaveService.getPendingApprovals();
            setRequests(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('errorLoadingPendingApprovals') || 'Failed to load pending approvals');
            setLoading(false);
        }
    };

    const handleApproveClick = (req) => {
        setSelectedRequest(req);
        setDialogType('approve');
        setComment('');
        setDialogOpen(true);
    };

    const handleRejectClick = (req) => {
        setSelectedRequest(req);
        setDialogType('reject');
        setComment('');
        setDialogOpen(true);
    };

    const handleConfirmDecision = async () => {
        try {
            const isApprove = dialogType === 'approve';
            await leaveService.approveLeave(selectedRequest.id, {
                status: isApprove ? 'approved' : 'rejected',
                comments: comment,
                rejection_reason: !isApprove ? comment : null
            });
            setDialogOpen(false);
            setComment('');
            fetchData();
        } catch (err) {
            setError(dialogType === 'approve'
                ? t('errorApprovingRequest') || 'Failed to approve request'
                : t('errorRejectingRequest') || 'Failed to reject request'
            );
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={50} thickness={4} />
        </Box>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 } }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h3" fontWeight="900" sx={{ mb: 1, letterSpacing: '-0.02em', background: 'linear-gradient(45deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {t('leaveApprovals')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {t('managePendingRequests') || 'Review and respond to pending leave applications from your team.'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Badge badgeContent={requests.length} color="error" overlap="circular">
                            <Paper sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Clock size={20} className="text-primary" />
                            </Paper>
                        </Badge>
                    </Box>
                </Box>
            </motion.div>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {requests.length === 0 ? (
                    <Paper elevation={0} sx={{ py: 12, textAlign: 'center', borderRadius: 5, border: '2px dashed', borderColor: 'divider', background: 'var(--bg-surface-soft)' }}>
                        <ClipboardCheck size={64} className="text-muted-foreground opacity-20 mb-2" />
                        <Typography variant="h5" color="text.secondary" fontWeight="800">
                            {t('noPendingRequests')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {t('allCaughtUp') || 'Great job! All leave requests have been processed.'}
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {requests.map((req) => (
                            <Grid item xs={12} key={req.id}>
                                <motion.div variants={itemVariants}>
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            p: { xs: 2, md: 3 }, 
                                            borderRadius: 5, 
                                            border: '1px solid', 
                                            borderColor: 'divider',
                                            background: 'var(--bg-surface)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '4px',
                                                bgcolor: 'primary.main',
                                                opacity: 0.7
                                            },
                                            '&:hover': { 
                                                boxShadow: '0 20px 40px -20px rgba(0,0,0,0.15)',
                                                borderColor: 'primary.soft'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <Grid container spacing={3} alignItems="center">
                                            {/* Employee Info */}
                                            <Grid item xs={12} md={3}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar 
                                                        sx={{ 
                                                            width: 56, 
                                                            height: 56, 
                                                            bgcolor: 'primary.soft', 
                                                            color: 'primary.main',
                                                            border: '2px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <User size={28} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="900">
                                                            {req.Employee?.User?.first_name} {req.Employee?.User?.last_name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Briefcase size={12} /> {req.Employee?.Position?.name || 'Employee'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>

                                            {/* Leave Details */}
                                            <Grid item xs={12} md={3}>
                                                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'var(--bg-surface-soft)', border: '1px solid', borderColor: 'divider' }}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="800" textTransform="uppercase" sx={{ mb: 1, display: 'block' }}>
                                                        {t('leaveType')}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip label={req.LeaveType?.name} size="small" variant="filled" color="primary" sx={{ fontWeight: 800, height: 24 }} />
                                                        <Typography variant="body2" fontWeight="700" color="primary">
                                                            {req.days_requested} {t('days')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>

                                            {/* Dates & Reason */}
                                            <Grid item xs={12} md={3}>
                                                <Box sx={{ mb: 1.5 }}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Calendar size={14} className="text-primary" /> {t('dates')}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="700">
                                                        {req.start_date} <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {req.end_date}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <FileText size={14} className="text-primary" /> {t('reason')}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.primary" fontWeight="500" noWrap sx={{ maxWidth: '100%' }}>
                                                        {req.reason}
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            {/* Actions */}
                                            <Grid item xs={12} md={3}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        fullWidth
                                                        startIcon={<CheckCircle2 size={18} />}
                                                        onClick={() => handleApproveClick(req)}
                                                        sx={{ 
                                                            borderRadius: 3, 
                                                            py: 1, 
                                                            fontWeight: 900,
                                                            boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.3)',
                                                            '&:hover': { boxShadow: '0 12px 20px -6px rgba(16, 185, 129, 0.5)' }
                                                        }}
                                                    >
                                                        {t('approve')}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        fullWidth
                                                        startIcon={<XCircle size={18} />}
                                                        onClick={() => handleRejectClick(req)}
                                                        sx={{ 
                                                            borderRadius: 3, 
                                                            py: 1, 
                                                            fontWeight: 900,
                                                            borderWidth: 2,
                                                            '&:hover': { borderWidth: 2 }
                                                        }}
                                                    >
                                                        {t('reject')}
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </motion.div>

            <AnimatePresence>
                {dialogOpen && (
                    <Dialog 
                        open={dialogOpen} 
                        onClose={() => setDialogOpen(false)} 
                        maxWidth="sm" 
                        fullWidth
                        PaperProps={{
                            sx: { borderRadius: 5, p: 1, background: 'var(--bg-surface)' }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {dialogType === 'approve' ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-rose-500" />}
                                {dialogType === 'approve' ? t('approveLeaveRequest') : t('rejectLeaveRequest')}
                            </DialogTitle>
                            <DialogContent>
                                <Typography variant="body1" color="text.secondary" mb={3} fontWeight="500">
                                    {dialogType === 'approve'
                                        ? t('provideApprovalMessage').replace('{{name}}', selectedRequest?.Employee?.User?.first_name || '')
                                        : t('provideRejectionReason').replace('{{name}}', selectedRequest?.Employee?.User?.first_name || '')
                                    }
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label={dialogType === 'approve' ? t('approvalMessage') : t('rejectionReason')}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required={dialogType === 'reject'}
                                    placeholder={dialogType === 'approve' ? t('optional') || 'Optional comment to employee...' : t('rejectionReasonPlaceholder') || 'Why is this request being rejected?'}
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover' }
                                    }}
                                />
                            </DialogContent>
                            <DialogActions sx={{ p: 3, pt: 0 }}>
                                <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 700, px: 3 }}>
                                    {t('cancel')}
                                </Button>
                                <Button
                                    onClick={handleConfirmDecision}
                                    color={dialogType === 'approve' ? 'success' : 'error'}
                                    variant="contained"
                                    disabled={dialogType === 'reject' && !comment.trim()}
                                    sx={{ borderRadius: 3, px: 4, fontWeight: 900, py: 1.5 }}
                                >
                                    {dialogType === 'approve' ? t('confirmApproval') : t('confirmRejection')}
                                </Button>
                            </DialogActions>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default LeaveApprovalsPage;
