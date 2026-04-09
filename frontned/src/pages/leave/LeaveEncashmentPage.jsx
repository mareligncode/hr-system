import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    MenuItem,
    Alert,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Coins,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Wallet,
    Info
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSettings } from '../../context/SettingsContext';
import leaveService from '../../services/leaveService';
import toast from 'react-hot-toast';

const LeaveEncashmentPage = () => {
    const { t } = useSettings();
    const { user } = useSelector((state) => state.auth);
    const [requests, setRequests] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        leave_type_id: '',
        days_to_encash: '',
        amount_per_day: '',
        comments: ''
    });

    const isHRorAdmin = ['admin', 'hr', 'finance'].includes(user?.role);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, balRes] = await Promise.all([
                leaveService.getEncashmentRequests(),
                leaveService.getMyLeaveBalances()
            ]);
            setRequests(reqRes.data);
            setBalances(balRes.data);
        } catch (err) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async () => {
        try {
            await leaveService.requestEncashment(formData);
            toast.success('Encashment request submitted');
            setOpen(false);
            setFormData({ leave_type_id: '', days_to_encash: '', amount_per_day: '', comments: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Request failed');
        }
    };

    const handleApprove = async (id, status) => {
        try {
            await leaveService.approveEncashment(id, { status });
            toast.success(`Request ${status}`);
            fetchData();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return { color: 'success', icon: <CheckCircle2 size={16} /> };
            case 'paid': return { color: 'info', icon: <DollarSign size={16} /> };
            case 'pending': return { color: 'warning', icon: <Clock size={16} /> };
            case 'rejected': return { color: 'error', icon: <XCircle size={16} /> };
            default: return { color: 'default', icon: <Info size={16} /> };
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
                    <Box>
                        <Typography variant="h3" fontWeight="900" sx={{ fontSize: { xs: '2rem', sm: '3rem' }, tracking: '-0.05em' }}>
                            {t('leaveEncashment') || 'Leave Encashment'}
                        </Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                            {t('encashmentDesc') || 'Sell back your unused vacation days at year-end.'}
                        </Typography>
                    </Box>
                    {!isHRorAdmin && (
                        <Button
                            variant="contained"
                            fullWidth={true}
                            startIcon={<Plus size={20} />}
                            onClick={() => setOpen(true)}
                            sx={{ borderRadius: 4, py: 1.5, px: 4, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', width: { xs: '100%', sm: 'auto' } }}
                        >
                            {t('requestEncashment') || 'New Request'}
                        </Button>
                    )}
                </Box>

                {!isHRorAdmin && balances.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="800" gutterBottom>{t('availableForEncashment') || 'Available for Encashment'}</Typography>
                        <Grid container spacing={2}>
                            {balances.map(b => (
                                <Grid item xs={12} sm={4} key={b.id}>
                                    <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary" fontWeight="700">{b.LeaveType?.name}</Typography>
                                            <Typography variant="h4" fontWeight="900">{b.balance} {t('days')}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
                    <Table size={window.innerWidth < 640 ? 'small' : 'medium'}>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                {isHRorAdmin && <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('employee')}</TableCell>}
                                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('leaveType')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('days')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('totalAmount')}</TableCell>
                                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('status')}</TableCell>
                                {isHRorAdmin && <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('actions')}</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isHRorAdmin ? 6 : 5} align="center" sx={{ py: 6 }}>
                                        <Coins size={48} style={{ opacity: 0.1, marginBottom: 8 }} />
                                        <Typography color="text.secondary">{t('noRequestsFound') || 'No encashment requests found.'}</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((r) => {
                                    const style = getStatusStyle(r.status);
                                    return (
                                        <TableRow key={r.id} hover>
                                            {isHRorAdmin && (
                                                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                    {r.Employee?.User?.first_name} {r.Employee?.User?.last_name}
                                                </TableCell>
                                            )}
                                            <TableCell sx={{ fontSize: '0.875rem' }}>{r.LeaveType?.name}</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: '0.875rem' }}>{r.days_to_encash}</TableCell>
                                            <TableCell sx={{ color: 'success.main', fontWeight: 800, fontSize: '0.875rem' }}>${r.total_amount}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={r.status.toUpperCase()}
                                                    color={style.color}
                                                    icon={style.icon}
                                                    size="small"
                                                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                                                />
                                            </TableCell>
                                            {isHRorAdmin && (
                                                <TableCell align="right">
                                                    {r.status === 'pending' && (
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                            <Button size="small" variant="contained" color="success" onClick={() => handleApprove(r.id, 'approved')} sx={{ fontWeight: 900, borderRadius: 2 }}>Approve</Button>
                                                            <Button size="small" variant="outlined" color="error" onClick={() => handleApprove(r.id, 'rejected')} sx={{ fontWeight: 900, borderRadius: 2 }}>Reject</Button>
                                                        </Box>
                                                    )}
                                                    {r.status === 'approved' && (
                                                        <Button size="small" variant="contained" color="info" onClick={() => handleApprove(r.id, 'paid')} sx={{ fontWeight: 900, borderRadius: 2 }}>Mark Paid</Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </motion.div>

            {/* Request Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="800">Request Leave Encashment</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                        Policy: You can only encash days from your active balance.
                    </Alert>
                    {balances.length === 0 && (
                        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                            You have no active leave balances to encash. Please ensure leave accruals have been run.
                        </Alert>
                    )}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Leave Type"
                                value={formData.leave_type_id}
                                onChange={(e) => {
                                    const bal = balances.find(b => b.leave_type_id === e.target.value);
                                    setFormData({ ...formData, leave_type_id: e.target.value });
                                }}
                            >
                                {balances.map(b => (
                                    <MenuItem key={b.leave_type_id} value={b.leave_type_id}>
                                        {b.LeaveType?.name} ({b.balance} available)
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Days to Encash"
                                value={formData.days_to_encash}
                                onChange={(e) => setFormData({ ...formData, days_to_encash: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Basic Rate / Day"
                                value={formData.amount_per_day}
                                onChange={(e) => setFormData({ ...formData, amount_per_day: e.target.value })}
                                helperText="Estimated value based on your current salary"
                            />
                        </Grid>
                        {formData.days_to_encash && formData.amount_per_day && (
                            <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: 'success.soft', borderRadius: 2, border: '1px solid', borderColor: 'success.light' }}>
                                    <Typography variant="subtitle2" color="success.dark">Total Estimated Payout</Typography>
                                    <Typography variant="h5" fontWeight="900" color="success.main">
                                        ${(parseFloat(formData.days_to_encash) * parseFloat(formData.amount_per_day)).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
                    <Button
                        variant="contained"
                        onClick={handleRequest}
                        disabled={!formData.leave_type_id || !formData.days_to_encash || parseFloat(formData.days_to_encash) <= 0 || parseFloat(formData.amount_per_day) <= 0}
                    >
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LeaveEncashmentPage;
