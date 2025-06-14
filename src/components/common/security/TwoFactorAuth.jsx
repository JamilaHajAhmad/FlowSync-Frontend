import { useState } from 'react';
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
import logo from '../../../assets/images/logo.png';

const TwoFactorAuth = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
                toast.success(`Welcome, ${user.displayName}!`);
                navigate('/leader-dashboard');
            } else {
                toast.success(`Welcome, ${user.displayName}!`);
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
        <Box sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            mt: { xs: 2, sm: 4 }, 
            p: { xs: 1.5, sm: 2 },
            minHeight: '100vh'
        }}>
            {/* Logo and Title */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: { xs: 2, sm: 4 }, 
                ml: { xs: 0, sm: -15, md: -30 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
                <img 
                    src={logo} 
                    alt="FlowSync Logo" 
                    style={{ 
                        width: 'clamp(40px, 8vw, 60px)',
                        marginRight: '12px' 
                    }} 
                />
                <Typography 
                    variant="h5" 
                    sx={{ 
                        color: '#059669',
                        fontWeight: 'bold',
                        fontSize: { xs: '20px', sm: '24px' }
                    }}
                >
                    FlowSync
                </Typography>
            </Box>

            <Card elevation={3} sx={{ 
                bgcolor: 'white',
                borderRadius: { xs: 2, sm: 3 }
            }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" 
                        alignItems="center" 
                        mb={3}
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        gap={{ xs: 1, sm: 0 }}
                    >
                        <SecurityIcon sx={{ 
                            fontSize: { xs: 24, sm: 30 }, 
                            mr: { xs: 0, sm: 1 }, 
                            color: '#064e3b' 
                        }} />
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                color: '#064e3b',
                                fontWeight: 'bold',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                textAlign: { xs: 'center', sm: 'left' }
                            }}
                        >
                            Two-Factor Authentication
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                '& .MuiAlert-icon': {
                                    color: '#dc2626'
                                },
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box sx={{
                        mb: 3,
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: '#f0fdf4',
                        borderRadius: 1,
                        border: '1px solid #d1fae5'
                    }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#065f46',
                                lineHeight: 1.6,
                                fontSize: { xs: '0.813rem', sm: '0.875rem' }
                            }}
                        >
                            {!isEnabled ?
                                "To enable two-factor authentication, click the button below to receive a verification code via email." :
                                "Enter the 6-digit verification code that was sent to your email address."
                            }
                        </Typography>
                    </Box>

                    <Box mb={3}>
                        {!isEnabled ? (
                            <Button
                                variant="contained"
                                onClick={() => handleEnable2FA(token)}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                                sx={{
                                    bgcolor: '#059669',
                                    '&:hover': { bgcolor: '#047857' },
                                    '&.Mui-disabled': {
                                        bgcolor: '#d1fae5',
                                        color: '#065f46'
                                    },
                                    width: { xs: '100%', sm: 'auto' },
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                            >
                                Send Verification Code
                            </Button>
                        ) : (
                            <Box sx={{ width: '100%' }}>
                                <TextField
                                    fullWidth
                                    label="Verification Code"
                                    variant="outlined"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#059669'
                                            },
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#059669'
                                        }
                                    }}
                                    placeholder="Enter 6-digit code"
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleVerify(verificationCode, token)}
                                    disabled={loading || !verificationCode}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                                    sx={{
                                        bgcolor: '#059669',
                                        '&:hover': { bgcolor: '#047857' },
                                        '&.Mui-disabled': {
                                            bgcolor: '#d1fae5',
                                            color: '#065f46'
                                        },
                                        width: { xs: '100%', sm: 'auto' },
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                    }}
                                >
                                    Verify Code
                                </Button>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TwoFactorAuth;