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
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
    IconButton,
    Chip,
    Tooltip,
    Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Settings, 
    Plus, 
    Calendar, 
    Users, 
    CreditCard, 
    Hash, 
    ShieldCheck, 
    Wand2,
    Briefcase
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import leaveService from '../../services/leaveService';

const LeaveTypePage = () => {
    const { t } = useSettings();
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        days_per_year: 20,
        is_paid: true,
        applicable_gender: 'all'
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const response = await leaveService.getLeaveTypes();
            setLeaveTypes(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('errorLoadingLeaveTypes') || 'Failed to fetch leave types');
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setFormData({
            name: '',
            code: '',
            days_per_year: 20,
            is_paid: true,
            applicable_gender: 'all'
        });
        setDialogOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await leaveService.createLeaveType(formData);
            setDialogOpen(false);
            fetchTypes();
        } catch (err) {
            setError(t('errorCreatingLeaveType') || 'Failed to create leave type');
        }
    };

    const handleSeedDefaults = async () => {
        const defaults = [
            { name: 'Annual Leave', code: 'AL', days_per_year: 21, is_paid: true, applicable_gender: 'all' },
            { name: 'Sick Leave', code: 'SL', days_per_year: 15, is_paid: true, applicable_gender: 'all' },
            { name: 'Maternity Leave', code: 'ML', days_per_year: 90, is_paid: true, applicable_gender: 'female' },
            { name: 'Paternity Leave', code: 'PL', days_per_year: 5, is_paid: true, applicable_gender: 'male' }
        ];

        try {
            setLoading(true);
            for (const type of defaults) {
                await leaveService.createLeaveType(type).catch(() => null); // Ignore duplicates
            }
            await fetchTypes();
        } catch (err) {
            setError(t('errorSeedingLeaveTypes') || 'Failed to seed default types');
            setLoading(false);
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
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 } }}>
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}>
                                <Settings size={24} />
                            </Avatar>
                            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.02em', color: 'text.primary' }}>
                                {t('manageLeaveTypes')}
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" fontWeight="500" sx={{ pl: 7.5 }}>
                            {t('configureLeavePolicies') || 'Configure leave policies, allowances, and rules.'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleSeedDefaults}
                            startIcon={<Wand2 size={18} />}
                            sx={{ borderRadius: 3, fontWeight: 700, paddingX: 3 }}
                        >
                            {t('seedDefaults')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Plus size={18} />}
                            onClick={handleOpenDialog}
                            sx={{ borderRadius: 3, fontWeight: 800, paddingX: 3, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
                        >
                            {t('addLeaveType')}
                        </Button>
                    </Box>
                </Box>
            </motion.div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 600 }}>{error}</Alert>
                </motion.div>
            )}

            {/* Leave Types Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {leaveTypes.length === 0 ? (
                    <Paper elevation={0} sx={{ py: 10, textAlign: 'center', borderRadius: 4, bgcolor: 'action.hover', border: '2px dashed', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Briefcase size={64} className="text-muted-foreground opacity-20" />
                            <Typography variant="h6" color="text.secondary" fontWeight="700">
                                {t('noLeaveTypesAvailable')}
                            </Typography>
                            <Button variant="contained" startIcon={<Wand2 size={18} />} onClick={handleSeedDefaults} sx={{ mt: 1, borderRadius: 3, fontWeight: 700 }}>
                                {t('autoGenerateDefaults') || 'Auto-Generate Defaults'}
                            </Button>
                        </Box>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {leaveTypes.map((type) => (
                            <Grid item xs={12} sm={6} md={4} key={type.id}>
                                <motion.div variants={cardVariants}>
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            p: 3, 
                                            borderRadius: 4, 
                                            border: '1px solid', 
                                            borderColor: 'divider',
                                            background: 'var(--bg-surface)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
                                                borderColor: 'primary.soft'
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: 'primary.main' }} />
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1.2 }}>
                                                {type.name}
                                            </Typography>
                                            <Chip 
                                                label={type.code} 
                                                size="small" 
                                                sx={{ fontWeight: 800, bgcolor: 'primary.soft', color: 'primary.main' }} 
                                            />
                                        </Box>
                                        
                                        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.hover', color: 'text.secondary' }}>
                                                    <Calendar size={14} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                                                        {t('allowance') || 'Allowance'}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="800">
                                                        {type.days_per_year} {t('daysPerYear') || 'Days/Year'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: type.is_paid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: type.is_paid ? 'success.main' : 'error.main' }}>
                                                    <CreditCard size={14} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                                                        {t('paymentStatus') || 'Payment Status'}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="800" color={type.is_paid ? 'success.main' : 'error.main'}>
                                                        {type.is_paid ? t('paid') || 'Paid' : t('unpaid') || 'Unpaid'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.hover', color: 'text.secondary' }}>
                                                    <Users size={14} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                                                        {t('applicableGender') || 'Gender Eligibility'}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="800" textTransform="capitalize">
                                                        {type.applicable_gender}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </motion.div>

            {/* Add Policy Dialog */}
            <AnimatePresence>
                {dialogOpen && (
                    <Dialog 
                        open={dialogOpen} 
                        onClose={() => setDialogOpen(false)} 
                        maxWidth="sm" 
                        fullWidth
                        PaperProps={{
                            sx: { borderRadius: 4, p: 1, background: 'var(--bg-surface)' }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <ShieldCheck className="text-primary" size={28} />
                                {t('addLeaveType')}
                            </DialogTitle>
                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                                    {t('createNewLeaveTypeDesc') || 'Define a new leave policy including its code, allowance, and rules.'}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            label={t('name') || 'Policy Name'}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Annual Leave"
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label={t('code')}
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="e.g. AL"
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label={t('daysPerYear') || 'Allowance (Days)'}
                                            name="days_per_year"
                                            value={formData.days_per_year}
                                            onChange={handleChange}
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            select
                                            fullWidth
                                            label={t('isPaid') || 'Paid Leave?'}
                                            name="is_paid"
                                            value={formData.is_paid}
                                            onChange={handleChange}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            <MenuItem value={true}>Yes</MenuItem>
                                            <MenuItem value={false}>No</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            select
                                            fullWidth
                                            label={t('applicableGender')}
                                            name="applicable_gender"
                                            value={formData.applicable_gender}
                                            onChange={handleChange}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="male">Male Only</MenuItem>
                                            <MenuItem value="female">Female Only</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions sx={{ p: 3, pt: 1 }}>
                                <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 700 }}>
                                    {t('cancel')}
                                </Button>
                                <Button 
                                    onClick={handleSubmit} 
                                    variant="contained" 
                                    color="primary"
                                    disabled={!formData.name || !formData.code || !formData.days_per_year}
                                    sx={{ borderRadius: 2, fontWeight: 800, px: 3, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
                                >
                                    {t('save')}
                                </Button>
                            </DialogActions>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default LeaveTypePage;
