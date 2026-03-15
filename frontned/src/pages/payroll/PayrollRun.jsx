import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Alert,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    PlayArrow as PlayIcon,
    Assessment as SummaryIcon,
    ArrowForward as NextIcon,
    KeyboardArrowLeft as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import payrollService from '../../services/payrollService';

const steps = ['Verify Period', 'Run Calculation', 'Analyze Results'];

const PayrollRun = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPeriodDetail();
    }, [id]);

    const fetchPeriodDetail = async () => {
        setLoading(true);
        try {
            const data = await payrollService.getPeriodById(id);
            setPeriod(data);
            if (data.status === 'processing') setActiveStep(1);
            if (data.status === 'completed' || data.status === 'approved') setActiveStep(2);
        } catch (err) {
            setError('Failed to load period details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRunCalculation = async () => {
        setCalculating(true);
        setError(null);
        try {
            const data = await payrollService.calculatePayroll(id);
            setResults(data);
            setActiveStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Calculation failed');
        } finally {
            setCalculating(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
    if (!period) return <Container mt={5}><Alert severity="error">Period not found</Alert></Container>;

    return (
        <Container maxWidth="md">
            <Typography variant="h4" fontWeight="bold" gutterBottom>Run Payroll Wizard</Typography>
            <Typography color="textSecondary" mb={4}>
                {period.description} ({period.start_date} to {period.end_date})
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 4, borderRadius: 3 }}>
                {activeStep === 0 && (
                    <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>Step 1: Verify Payroll Period</Typography>
                        <Typography variant="body1" color="textSecondary" mb={4}>
                            Please confirm that the dates and employee data are correct before proceeding to calculation.
                            This will aggregate all approved attendance and leave records for this period.
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography color="textSecondary">Start Date</Typography>
                                        <Typography variant="h6">{period.start_date}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography color="textSecondary">End Date</Typography>
                                        <Typography variant="h6">{period.end_date}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Box mt={4}>
                            <Button
                                variant="contained"
                                endIcon={<NextIcon />}
                                onClick={() => setActiveStep(1)}
                                size="large"
                            >
                                Confirm & Continue
                            </Button>
                        </Box>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>Step 2: Run Calculation</Typography>
                        <Typography variant="body1" color="textSecondary" mb={4}>
                            The engine will now compute base salary, overtime, and gross pay for all active employees.
                        </Typography>

                        {calculating ? (
                            <Box py={5}>
                                <CircularProgress size={60} />
                                <Typography mt={2}>Processing payroll records...</Typography>
                            </Box>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PlayIcon />}
                                size="large"
                                onClick={handleRunCalculation}
                                sx={{ py: 2, px: 5, borderRadius: 50 }}
                            >
                                Start Engine
                            </Button>
                        )}
                        <Box mt={2}>
                            <Button startIcon={<BackIcon />} onClick={() => setActiveStep(0)}>Back</Button>
                        </Box>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box>
                        <Box textAlign="center" mb={4}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h5">Calculation Complete!</Typography>
                            <Typography color="textSecondary">
                                Successfully calculated <b>{results?.itemsCount || period.PayrollItems?.length || 0}</b> employee payroll items.
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>What next?</Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><SummaryIcon color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Review Summary"
                                    secondary="Check individual employee pay breakdown before approval."
                                />
                            </ListItem>
                        </List>

                        <Box display="flex" justifyContent="center" gap={2} mt={4}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/payroll/periods')}
                            >
                                Back to Periods
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/payroll/review/${id}`)}
                            >
                                Go to Review
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default PayrollRun;
