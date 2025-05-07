import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

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

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Card elevation={3}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                        <NotificationsIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            Login Notifications
                        </Typography>
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isEnabled}
                                onChange={handleToggle}
                                color="primary"
                            />
                        }
                        label={`Login notifications are ${isEnabled ? 'enabled' : 'disabled'}`}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        When enabled, you'll receive notifications about new login attempts and security-related events.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginNotifications;