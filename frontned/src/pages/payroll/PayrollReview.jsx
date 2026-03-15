import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Stack,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    RateReview as ReviewIcon,
    CurrencyExchange as MoneyIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import payrollService from '../../services/payrollService';

const PayrollReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '' });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await payrollService.getPeriodById(id);
            setPeriod(data);
        } catch (err) {
            setError('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        const type = confirmDialog.type;
        setConfirmDialog({ open: false, type: '' });
        setLoading(true);
        try {
            if (type === 'review') {
                await payrollService.reviewPayroll(id);
                setSuccess('Payroll marked as reviewed.');
            } else if (type === 'approve') {
                await payrollService.approvePayroll(id);
                setSuccess('Payroll approved successfully! Payslips are now available to employees.');
            }
            await fetchData();
        } catch (err) {
            setError(`Action failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !period) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
    if (!period) return <Container mt={5}><Alert severity="error">Payroll data not found</Alert></Container>;

    const totalGross = period.PayrollItems?.reduce((sum, item) => sum + parseFloat(item.gross_pay), 0) || 0;

    return (
        <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Payroll Review</Typography>
                    <Typography color="textSecondary">
                        {period.description} | {period.start_date} to {period.end_date}
                    </Typography>
                </Box>
                <Chip
                    label={period.status.toUpperCase()}
                    color={period.status === 'approved' ? 'success' : 'primary'}
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <Typography color="textSecondary" gutterBottom>Total Employees</Typography>
                        <Typography variant="h4" fontWeight="bold">{period.PayrollItems?.length || 0}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <Typography sx={{ opacity: 0.8 }} gutterBottom>Total Gross Pay</Typography>
                        <Typography variant="h4" fontWeight="bold">${totalGross.toLocaleString()}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <Typography color="textSecondary" gutterBottom>Pending Actions</Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {period.PayrollItems?.filter(i => i.status === 'draft').length || 0}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Employee</b></TableCell>
                            <TableCell><b>Position/Dept</b></TableCell>
                            <TableCell align="right"><b>Base Salary</b></TableCell>
                            <TableCell align="right"><b>Reg Hours</b></TableCell>
                            <TableCell align="right"><b>OT Hours</b></TableCell>
                            <TableCell align="right"><b>Gross Pay</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {period.PayrollItems?.map((item) => (
                            <TableRow key={item.id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {item.User?.first_name} {item.User?.last_name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {item.User?.email}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {item.User?.Employee?.Position?.title}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {item.User?.Employee?.Department?.name}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">${parseFloat(item.base_salary_snapshot).toLocaleString()}</TableCell>
                                <TableCell align="right">{item.total_hours}h</TableCell>
                                <TableCell align="right">{item.overtime_hours}h</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        ${parseFloat(item.gross_pay).toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={item.status}
                                        size="small"
                                        variant="outlined"
                                        color={item.status === 'approved' ? 'success' : 'default'}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={4} mb={6}>
                <Button variant="outlined" onClick={() => navigate('/payroll/periods')}>Back</Button>

                {period.status === 'processing' && (
                    <Button
                        variant="contained"
                        color="info"
                        startIcon={<ReviewIcon />}
                        onClick={() => setConfirmDialog({ open: true, type: 'review' })}
                    >
                        Mark as Reviewed
                    </Button>
                )}

                {(period.status === 'completed' || period.status === 'processing') && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => setConfirmDialog({ open: true, type: 'approve' })}
                    >
                        Approve & Finalize
                    </Button>
                )}
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: '' })}>
                <DialogTitle>
                    {confirmDialog.type === 'review' ? 'Review Payroll' : 'Approve Payroll'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.type === 'review'
                            ? 'Are you sure you want to mark this payroll as reviewed? This will update the status to completed.'
                            : 'This will finalize the payroll and make payslips available for all employees. This action is permanent.'}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setConfirmDialog({ open: false, type: '' })}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={confirmDialog.type === 'review' ? 'info' : 'success'}
                        onClick={handleAction}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PayrollReview;
