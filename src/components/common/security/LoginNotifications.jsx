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
    Notifications as NotificationsIcon,
    ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';

const LoginNotifications = () => {
    const [isEnabled, setIsEnabled] = useState(() => {
        return localStorage.getItem('securityNotificationsEnabled') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('securityNotificationsEnabled', isEnabled);
    }, [isEnabled]);

    const handleToggle = () => {
        setIsEnabled(prev => !prev);
        toast.info(
            !isEnabled 
                ? 'Login notifications enabled' 
                : 'Login notifications disabled',
            { toastId: 'security-notifications-toggle' }
        );
    };

    const navigate = useNavigate();

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
                        <NotificationsIcon sx={{ fontSize: 30, mr: 1, color: '#064e3b' }} />
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                color: '#064e3b',
                                fontWeight: 'bold'
                            }}
                        >
                            Login Notifications
                        </Typography>
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isEnabled}
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
                            <Typography sx={{ color: '#064e3b', fontWeight: 500 }}>
                                {`Login notifications are ${isEnabled ? 'enabled' : 'disabled'}`}
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
                            When enabled, you'll receive notifications about:
                            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                                <li>New login attempts</li>
                                <li>Suspicious activity detection</li>
                                <li>Security-related events</li>
                                <li>Device verification requests</li>
                            </Box>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginNotifications;