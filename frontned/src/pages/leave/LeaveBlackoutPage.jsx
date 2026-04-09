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
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tooltip,
    Alert,
    CircularProgress,
    MenuItem
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    CalendarOff,
    Plus,
    Trash2,
    Calendar,
    AlertTriangle,
    Info,
    Search
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import leaveService from '../../services/leaveService';
import organizationService from '../../services/organizationService';
import toast from 'react-hot-toast';

const LeaveBlackoutPage = () => {
    const { t } = useSettings();
    const [blackouts, setBlackouts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        description: '',
        department_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [blackoutRes, deptRes] = await Promise.all([
                leaveService.getBlackoutDates(),
                organizationService.getDepartments()
            ]);
            setBlackouts(blackoutRes.data);
            setDepartments(deptRes);
        } catch (err) {
            toast.error(t('failedToFetchData') || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await leaveService.createBlackoutDate(formData);
            toast.success(t('blackoutCreated') || 'Blackout period created');
            setOpen(false);
            setFormData({ name: '', start_date: '', end_date: '', description: '', department_id: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create blackout');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirmDeleteBlackout') || 'Are you sure you want to delete this blackout period?')) {
            try {
                await leaveService.deleteBlackoutDate(id);
                toast.success(t('blackoutDeleted') || 'Blackout period deleted');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete');
            }
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
                    <Box>
                        <Typography variant="h3" fontWeight="900" sx={{ fontSize: { xs: '2rem', sm: '3rem' }, tracking: '-0.05em' }}>
                            {t('blackoutDates') || 'Blackout Dates'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {t('manageBlackoutDescription') || 'Global or department-specific dates where leave is restricted.'}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        fullWidth={true}
                        startIcon={<Plus size={20} />}
                        onClick={() => setOpen(true)}
                        sx={{ borderRadius: 4, py: 1.5, px: 4, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', width: { xs: '100%', sm: 'auto' }, shadow: 'none' }}
                    >
                        {t('addBlackout') || 'Add Period'}
                    </Button>
                </Box>
            </motion.div>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
                        <Table size={window.innerWidth < 640 ? 'small' : 'medium'}>
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('name')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('department')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('startDate')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('endDate')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('status')}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em' }}>{t('actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {blackouts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <CalendarOff size={48} style={{ opacity: 0.2, marginBottom: 8 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                {t('noBlackoutsDefined') || 'No blackout periods defined yet.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    blackouts.map((b) => (
                                        <TableRow key={b.id} hover>
                                            <TableCell>
                                                <Typography fontWeight="700" variant="body2">{b.name}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{b.description}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {b.Department ? (
                                                    <Chip label={b.Department.name} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                                ) : (
                                                    <Chip label="All Departments" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.875rem' }}>{b.start_date}</TableCell>
                                            <TableCell sx={{ fontSize: '0.875rem' }}>{b.end_date}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={new Date(b.end_date) < new Date() ? 'Expired' : 'Active'}
                                                    color={new Date(b.end_date) < new Date() ? 'default' : 'success'}
                                                    size="small"
                                                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton onClick={() => handleDelete(b.id)} color="error" size="small">
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {/* Create Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="800">{t('addNewBlackout') || 'Define New Blackout Period'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={t('blackoutName') || 'Event Name'}
                                placeholder="e.g. New Year Peak Season"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label={t('department') || 'Restriction Scope'}
                                value={formData.department_id}
                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                            >
                                <MenuItem value="">All Departments</MenuItem>
                                {departments.map(d => (
                                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label={t('startDate')}
                                InputLabelProps={{ shrink: true }}
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label={t('endDate')}
                                InputLabelProps={{ shrink: true }}
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label={t('description')}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!formData.name || !formData.start_date || !formData.end_date}>
                        {t('create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LeaveBlackoutPage;
