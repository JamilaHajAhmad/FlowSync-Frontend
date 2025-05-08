import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    Tooltip,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import {
    Devices as DevicesIcon,
    Logout as LogoutIcon,
    Computer as ComputerIcon,
    Smartphone as SmartphoneIcon,
    Tablet as TabletIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getConnectedDevices, logoutDevice } from '../../../services/connectedDevices';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';

const ConnectedDevices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        fetchConnectedDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchConnectedDevices = async () => {
        try {
            setLoading(true);
            const response = await getConnectedDevices(token);
            console.log('Connected devices:', response.data);
            setDevices(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch connected devices');
            toast.error(err.message || 'Could not load connected devices');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutDevice = async (sessionId) => {
        try {
            const response = await logoutDevice(sessionId, token);
            console.log('Logout response:', response);
            
            // Remove device from local state
            setDevices(devices.filter(device => device.sessionId !== sessionId));
            toast.success('Device logged out successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to logout device');
        }
    };

    const handleBack = () => {
        navigate('/settings');
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType.toLowerCase()) {
            case 'desktop':
                return <ComputerIcon />;
            case 'mobile':
                return <SmartphoneIcon />;
            case 'tablet':
                return <TabletIcon />;
            default:
                return <DevicesIcon />;
        }
    };

    const parseDeviceInfo = (deviceInfo) => {
        const browserInfo = deviceInfo.match(/Chrome\/[\d.]+|Firefox\/[\d.]+|Safari\/[\d.]+/);
        const osInfo = deviceInfo.match(/\((.*?)\)/)?.[1];
        
        return {
            browser: browserInfo ? browserInfo[0].split('/')[0] : 'Unknown Browser',
            os: osInfo || 'Unknown OS',
            type: deviceInfo.toLowerCase().includes('mobile') ? 'mobile' : 
                deviceInfo.toLowerCase().includes('tablet') ? 'tablet' : 'desktop'
        };
    };

    const formatLastActive = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatIPAddress = (ip) => {
        return ip === "::1" ? "localhost" : ip;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
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
                        <DevicesIcon sx={{ fontSize: 30, mr: 1, color: '#064e3b' }} />
                        <Typography variant="h5" component="h2" sx={{ color: '#064e3b' }}>
                            Connected Devices
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <List>
                        {devices.map((device, index) => {
                            const deviceDetails = parseDeviceInfo(device.deviceInfo);
                            
                            return (
                                <React.Fragment key={device.id}>
                                    <ListItem
                                        sx={{
                                            '&:hover': {
                                                bgcolor: '#ecfdf5'
                                            }
                                        }}
                                        secondaryAction={
                                            <Tooltip title="Logout Device">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleLogoutDevice(device.id)}
                                                    sx={{
                                                        color: '#dc2626',
                                                        '&:hover': {
                                                            bgcolor: '#fee2e2'
                                                        }
                                                    }}
                                                >
                                                    <LogoutIcon />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ color: '#064e3b' }}>
                                                {getDeviceIcon(deviceDetails.type)}
                                            </Box>
                                            <Box sx={{ ml: 2, flex: 1 }}>
                                                <ListItemText
                                                    primary={
                                                        <Typography >
                                                            {deviceDetails.os}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2">
                                                            {`${deviceDetails.browser} • ${formatIPAddress(device.ipAddress)}`}
                                                        </Typography>
                                                    }
                                                />
                                                <Typography variant="caption">
                                                    Login time: {formatLastActive(device.loginTime)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                    {index < devices.length - 1 && <Divider sx={{ borderColor: '#d1fae5' }} />}
                                </React.Fragment>
                            );
                        })}
                    </List>

                    {devices.length === 0 && (
                        <Typography sx={{ color: '#059669', py: 4 }} align="center">
                            No connected devices found
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ConnectedDevices;