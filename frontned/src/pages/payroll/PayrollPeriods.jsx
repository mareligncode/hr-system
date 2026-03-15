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
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    PlayArrow as PlayIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import payrollService from '../../services/payrollService';

const PayrollPeriods = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        description: ''
    });

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            const data = await payrollService.getAllPeriods();
            setPeriods(data.periods);
        } catch (err) {
            setError('Failed to load payroll periods');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePeriod = async () => {
        try {
            await payrollService.createPeriod(formData);
            setOpenDialog(false);
            fetchPeriods();
            setFormData({ start_date: '', end_date: '', description: '' });
        } catch (err) {
            setError('Failed to create payroll period');
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'primary';
            case 'processing': return 'warning';
            case 'completed': return 'info';
            case 'approved': return 'success';
            default: return 'default';
        }
    };

    if (loading && periods.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Payroll Periods</Typography>
                <Box>
                    <IconButton onClick={fetchPeriods} sx={{ mr: 1 }}><RefreshIcon /></IconButton>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Create Period
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.paper' }}>
                        <TableRow>
                            <TableCell><b>Description</b></TableCell>
                            <TableCell><b>Start Date</b></TableCell>
                            <TableCell><b>End Date</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {periods.map((period) => (
                            <TableRow key={period.id} hover>
                                <TableCell>{period.description || `Payroll ${period.id}`}</TableCell>
                                <TableCell>{period.start_date}</TableCell>
                                <TableCell>{period.end_date}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={period.status.toUpperCase()}
                                        color={getStatusColor(period.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Review">
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/payroll/review/${period.id}`)}
                                            color="info"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Run Calculation">
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/payroll/run/${period.id}`)}
                                            color="primary"
                                            disabled={period.status === 'approved'}
                                        >
                                            <PlayIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Period Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Payroll Period</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="e.g. March 2025 Monthly Payroll"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreatePeriod} disabled={!formData.start_date || !formData.end_date}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PayrollPeriods;
