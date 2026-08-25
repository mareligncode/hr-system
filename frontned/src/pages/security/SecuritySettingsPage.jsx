import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Switch,
    FormControlLabel,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    Security as SecurityIcon,
    Smartphone as PhoneIcon,
    Computer as ComputerIcon,
    Tablet as TabletIcon,
    Delete as DeleteIcon,
    QrCode as QrCodeIcon,
    VpnKey as KeyIcon,
    History as HistoryIcon,
    Shield as ShieldIcon
} from '@mui/icons-material';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const SecuritySettingsPage = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // MFA Setup Dialog
    const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [manualKey, setManualKey] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [setupStep, setSetupStep] = useState(1);
    
    // MFA Disable Dialog
    const [disableMfaOpen, setDisableMfaOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disableTotpCode, setDisableTotpCode] = useState('');

    useEffect(() => {
        loadSecurityData();
    }, []);

    const loadSecurityData = async () => {
        try {
            setLoading(true);
            const [sessionsRes] = await Promise.all([
                authService.getSessions()
            ]);
            
            setSessions(sessionsRes.sessions);
            setMfaEnabled(user?.mfa_enabled || false);
        } catch (error) {
            setError('Failed to load security data');
            console.error('Security data load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetupMfa = async () => {
        try {
            const response = await authService.setupMfa();
            setQrCode(response.qrCode);
            setManualKey(response.manualEntryKey);
            setBackupCodes(response.backupCodes);
            setMfaSetupOpen(true);
            setSetupStep(1);
        } catch (error) {
            setError('Failed to setup MFA: ' + error.message);
        }
    };

    const handleVerifyMfa = async () => {
        try {
            await authService.verifyMfa(verificationCode);
            setMfaEnabled(true);
            setMfaSetupOpen(false);
            setSuccess('MFA enabled successfully!');
            setVerificationCode('');
        } catch (error) {
            setError('Invalid verification code');
        }
    };

    const handleDisableMfa = async () => {
        try {
            await authService.disableMfa(disablePassword, disableTotpCode);
            setMfaEnabled(false);
            setDisableMfaOpen(false);
            setSuccess('MFA disabled successfully');
            setDisablePassword('');
            setDisableTotpCode('');
        } catch (error) {
            setError('Failed to disable MFA: ' + error.message);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await authService.revokeSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
            setSuccess('Session revoked successfully');
        } catch (error) {
            setError('Failed to revoke session');
        }
    };

    const handleRevokeAllSessions = async () => {
        try {
            await authService.revokeAllSessions();
            // Keep only current session
            setSessions(sessions.filter(s => s.is_current));
            setSuccess('All other sessions revoked successfully');
        } catch (error) {
            setError('Failed to revoke sessions');
        }
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case 'mobile':
                return <PhoneIcon />;
            case 'tablet':
                return <TabletIcon />;
            default:
                return <ComputerIcon />;
        }
    };

    const formatLastActivity = (date) => {
        return new Date(date).toLocaleString();
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Typography>Loading security settings...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Security Settings
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Two-Factor Authentication */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <ShieldIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6">
                                        Two-Factor Authentication
                                    </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add an extra layer of security to your account with TOTP authentication.
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={mfaEnabled}
                                            disabled={true} // Controlled by setup/disable actions
                                        />
                                    }
                                    label={mfaEnabled ? 'Enabled' : 'Disabled'}
                                />

                                <Box sx={{ mt: 2 }}>
                                    {mfaEnabled ? (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => setDisableMfaOpen(true)}
                                        >
                                            Disable MFA
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={<QrCodeIcon />}
                                            onClick={handleSetupMfa}
                                        >
                                            Setup MFA
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Active Sessions */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="h6">
                                            Active Sessions
                                        </Typography>
                                    </Box>
                                    {sessions.length > 1 && (
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={handleRevokeAllSessions}
                                        >
                                            Revoke All Others
                                        </Button>
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Manage your active sessions across all devices.
                                </Typography>

                                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    {sessions.map((session) => (
                                        <Box
                                            key={session.id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 1,
                                                border: 1,
                                                borderColor: session.is_current ? 'primary.main' : 'divider',
                                                borderRadius: 1,
                                                mb: 1,
                                                backgroundColor: session.is_current ? 'primary.50' : 'transparent'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {getDeviceIcon(session.device_type)}
                                                <Box sx={{ ml: 1 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {session.browser_name} on {session.os_name}
                                                        {session.is_current && (
                                                            <Chip
                                                                label="Current"
                                                                size="small"
                                                                color="primary"
                                                                sx={{ ml: 1 }}
                                                            />
                                                        )}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {session.ip_address} • Last active: {formatLastActivity(session.last_activity_at)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {!session.is_current && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRevokeSession(session.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* MFA Setup Dialog */}
                <Dialog open={mfaSetupOpen} onClose={() => setMfaSetupOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Setup Two-Factor Authentication
                    </DialogTitle>
                    <DialogContent>
                        {setupStep === 1 && (
                            <Box>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.):
                                </Typography>
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%' }} />
                                </Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Or enter this key manually:
                                </Typography>
                                <TextField
                                    value={manualKey}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => setSetupStep(2)}
                                >
                                    Continue to Verification
                                </Button>
                            </Box>
                        )}

                        {setupStep === 2 && (
                            <Box>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Enter the 6-digit code from your authenticator app:
                                </Typography>
                                <TextField
                                    label="Verification Code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />
                                
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Backup Codes
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Save these codes in a safe place. You can use them if you lose access to your authenticator app:
                                </Typography>
                                <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                                    {backupCodes.map((code, index) => (
                                        <Typography key={index} variant="body2" fontFamily="monospace">
                                            {code}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMfaSetupOpen(false)}>Cancel</Button>
                        {setupStep === 2 && (
                            <Button
                                onClick={handleVerifyMfa}
                                variant="contained"
                                disabled={!verificationCode || verificationCode.length !== 6}
                            >
                                Enable MFA
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                {/* MFA Disable Dialog */}
                <Dialog open={disableMfaOpen} onClose={() => setDisableMfaOpen(false)}>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            To disable MFA, please enter your password and a verification code from your authenticator app:
                        </Typography>
                        <TextField
                            label="Password"
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Verification Code"
                            value={disableTotpCode}
                            onChange={(e) => setDisableTotpCode(e.target.value)}
                            fullWidth
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDisableMfaOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleDisableMfa}
                            color="error"
                            variant="contained"
                            disabled={!disablePassword || !disableTotpCode}
                        >
                            Disable MFA
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default SecuritySettingsPage;