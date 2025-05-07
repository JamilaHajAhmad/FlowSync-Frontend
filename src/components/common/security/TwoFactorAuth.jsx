import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { enableTwoFactor, disableTwoFactor, verifyTwoFactor } from '../../../services/twoFactorAuthService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../../utils';

const TwoFactorAuth = () => {
    const [ isEnabled, setIsEnabled ] = useState(false);
    const [ verificationCode, setVerificationCode ] = useState('');
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    const handleEnable2FA = async (token) => {
        setLoading(true);
        try {
            await disableTwoFactor(token);
            const response = await enableTwoFactor(token);
            console.log(response);
            setIsEnabled(true);
            setError('');
            toast.success(response.data || '2FA enabled successfully');
        } catch (err) {
            setError('Failed to enable 2FA');
            toast.error(err.message || 'Failed to enable 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (verificationCode, token) => {
        setLoading(true);
        try {
            const response = await verifyTwoFactor(verificationCode, token);
            console.log(response);
            setVerificationCode('');
            setError('');
            const decodedToken = decodeToken(token);
            const role = decodedToken.role;
            const user = JSON.parse(localStorage.getItem('user'));
            if (role === 'Leader') {
                toast.success(`Welcome back, ${user.displayName}!`);
                navigate('/leader-dashboard');
            }
            else {
                toast.success(`Welcome back, ${user.displayName}!`);
                navigate('/member-dashboard');
            }
        } catch (err) {
            setError('Invalid verification code');
            toast.error(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Card elevation={3}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                        <SecurityIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            Two-Factor Authentication
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box mb={3}>
                        {!isEnabled ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleEnable2FA(token)}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                            >
                                Send Verification Code
                            </Button>
                        ) : null}
                    </Box>

                    {isEnabled && (
                        <Box>
                            <TextField
                                fullWidth
                                label="Verification Code"
                                variant="outlined"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                sx={{ mb: 2 }}
                                placeholder="Enter 6-digit code"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleVerify(verificationCode, token)}
                                disabled={loading || !verificationCode}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                Verify Code
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default TwoFactorAuth;