import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Stack
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Download as DownloadIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import payrollService from '../../services/payrollService';

const EmployeePayslips = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        setLoading(true);
        try {
            const data = await payrollService.getMyPayslips();
            setPayslips(data);
        } catch (err) {
            setError('Failed to load payslips');
        } finally {
            setLoading(false);
        }
    };

    if (loading && payslips.length === 0) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md">
            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <ReceiptIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h4" fontWeight="bold">My Payslips</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {payslips.length === 0 && !loading ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                    <Typography color="textSecondary">No payslips available yet.</Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.paper' }}>
                            <TableRow>
                                <TableCell><b>Period</b></TableCell>
                                <TableCell><b>Dates</b></TableCell>
                                <TableCell align="right"><b>Net Pay</b></TableCell>
                                <TableCell align="right"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payslips.map((slip) => (
                                <TableRow key={slip.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {slip.PayrollPeriod?.description || `Period #${slip.payroll_period_id}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="textSecondary">
                                            {slip.PayrollPeriod?.start_date} to {slip.PayrollPeriod?.end_date}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold" color="primary">
                                            ${parseFloat(slip.net_pay).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() => setSelectedPayslip(slip)}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Payslip View Dialog */}
            <Dialog
                open={!!selectedPayslip}
                onClose={() => setSelectedPayslip(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                    <Typography variant="h5" fontWeight="bold">PAYSLIP</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {selectedPayslip?.PayrollPeriod?.description}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedPayslip && (
                        <Box sx={{ mt: 2 }}>
                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography color="textSecondary">Employee</Typography>
                                    <Typography fontWeight="medium">My Profile</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography color="textSecondary">Period</Typography>
                                    <Typography>{selectedPayslip.PayrollPeriod?.start_date} - {selectedPayslip.PayrollPeriod?.end_date}</Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Typography variant="subtitle2" color="primary">EARNINGS</Typography>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Base Salary</Typography>
                                    <Typography>${parseFloat(selectedPayslip.base_salary_snapshot).toLocaleString()}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Overtime ({selectedPayslip.overtime_hours}h)</Typography>
                                    <Typography>
                                        ${(parseFloat(selectedPayslip.gross_pay) - parseFloat(selectedPayslip.base_salary_snapshot)).toLocaleString()}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box display="flex" justifyContent="space-between" sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                                    <Typography fontWeight="bold">GROSS PAY</Typography>
                                    <Typography fontWeight="bold">${parseFloat(selectedPayslip.gross_pay).toLocaleString()}</Typography>
                                </Box>

                                <Box display="flex" justifyContent="space-between" sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 1 }}>
                                    <Typography fontWeight="bold">NET TAKE HOME</Typography>
                                    <Typography fontWeight="bold">${parseFloat(selectedPayslip.net_pay).toLocaleString()}</Typography>
                                </Box>
                            </Stack>

                            <Box mt={3} mb={1} p={2} sx={{ border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant="caption" color="textSecondary">
                                    This is a system generated payslip. For inquiries, contact human resources.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setSelectedPayslip(null)}>Close</Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} disabled>Download PDF</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EmployeePayslips;
