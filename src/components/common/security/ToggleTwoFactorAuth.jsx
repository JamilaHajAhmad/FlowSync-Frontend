import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SecurityIcon from '@mui/icons-material/Security';

const ToggleTwoFactorAuth = () => {
    // Initialize state with explicit false default
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    // Load the saved state on component mount
    useEffect(() => {
        const storedValue = localStorage.getItem('is2FAEnabled');
        if (storedValue === 'true') {
            setIs2FAEnabled(true);
        } else {
            // Ensure localStorage has the correct default value
            localStorage.setItem('is2FAEnabled', 'false');
        }
    }, []);

    const handleToggle = () => {
        const newState = !is2FAEnabled;
        setIs2FAEnabled(newState);
        localStorage.setItem('is2FAEnabled', String(newState));

        if (newState) {
            toast.info(
                'Two-Factor Authentication has been enabled. You will now receive verification codes via email when logging in.',
                { toastId: '2fa-enable' }
            );
        } else {
            toast.warn(
                'Two-Factor Authentication has been disabled. Your account is now less secure.',
                { toastId: '2fa-disable' }
            );
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Card elevation={3}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={3}>
                        <SecurityIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            Two-Factor Authentication Settings
                        </Typography>
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={is2FAEnabled}
                                onChange={handleToggle}
                                color="primary"
                            />
                        }
                        label={`Two-Factor Authentication is ${is2FAEnabled ? 'enabled' : 'disabled'}`}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default ToggleTwoFactorAuth;