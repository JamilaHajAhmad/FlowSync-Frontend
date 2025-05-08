import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Button
} from '@mui/material';
import { 
    Security as SecurityIcon,
    ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';

const ToggleTwoFactorAuth = () => {
    const navigate = useNavigate();
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    useEffect(() => {
        const storedValue = localStorage.getItem('is2FAEnabled');
        if (storedValue === 'true') {
            setIs2FAEnabled(true);
        } else {
            localStorage.setItem('is2FAEnabled', 'false');
        }
    }, []);

    const handleToggle = () => {
        const newState = !is2FAEnabled;
        setIs2FAEnabled(newState);
        localStorage.setItem('is2FAEnabled', String(newState));

        if (newState) {
            toast.info('Two-Factor Authentication has been enabled', { toastId: '2fa-enable' });
        } else {
            toast.warn('Two-Factor Authentication has been disabled', { toastId: '2fa-disable' });
        }
    };

    const handleBack = () => {
        navigate('/settings');
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, ml: -30 }}>
                <img src={logo} alt="FlowSync Logo" style={{ width: '60px', marginRight: '12px' }} />
                <Typography 
                    variant="h5" 
                    sx={{ 
                        color: '#059669',
                        fontWeight: 'bold',
                        fontSize: '24px',
                    }}
                >
                    FlowSync
                </Typography>
            </Box>

            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{
                    mb: 2,
                    color: '#064e3b',
                    '&:hover': {
                        bgcolor: '#ecfdf5'
                    }
                }}
            >
                Back to Settings
            </Button>

            <Card elevation={3} sx={{ bgcolor: 'white' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                        <SecurityIcon sx={{ fontSize: 30, mr: 1, color: '#064e3b' }} />
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                color: '#064e3b',
                                fontWeight: 'bold'
                            }}
                        >
                            Two-Factor Authentication
                        </Typography>
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={is2FAEnabled}
                                onChange={handleToggle}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#059669',
                                        '&:hover': {
                                            backgroundColor: '#ecfdf5'
                                        }
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#059669'
                                    }
                                }}
                            />
                        }
                        label={
                            <Typography sx={{ color: '#065f46', fontWeight: 500 }}>
                                {`Two-Factor Authentication is ${is2FAEnabled ? 'enabled' : 'disabled'}`}
                            </Typography>
                        }
                    />

                    <Box sx={{ 
                        mt: 3, 
                        p: 2, 
                        bgcolor: '#f0fdf4', 
                        borderRadius: 1,
                        border: '1px solid #d1fae5'
                    }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                lineHeight: 1.6
                            }}
                        >
                            When enabled, you'll need to:
                            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                                <li>Enter your password</li>
                                <li>Provide a verification code sent to your email</li>
                                <li>Complete both steps to access your account</li>
                            </Box>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ToggleTwoFactorAuth;