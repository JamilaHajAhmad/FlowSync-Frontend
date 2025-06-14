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
import { handleLogout } from '../../../utils';

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
            console.log('Logout response:', response.data);
            handleLogout();
            
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
        <Box sx={{ 
            maxWidth: 800, 
            mx: 'auto', 
            mt: { xs: 2, sm: 4 }, 
            p: { xs: 1, sm: 2 },
            minHeight: '100vh'
        }}>
            {/* Logo and Title Section */}
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

            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{
                    mb: 2,
                    color: '#064e3b',
                    '&:hover': { bgcolor: '#ecfdf5' },
                    width: { xs: '100%', sm: 'auto' }
                }}
            >
                Back to Settings
            </Button>

            {/* Main Card */}
            <Card elevation={3} sx={{ 
                bgcolor: 'white',
                borderRadius: { xs: 2, sm: 3 }
            }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Card Header */}
                    <Box display="flex" 
                        alignItems="center" 
                        mb={3}
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        gap={{ xs: 1, sm: 0 }}
                    >
                        <DevicesIcon sx={{ 
                            fontSize: { xs: 24, sm: 30 }, 
                            mr: { xs: 0, sm: 1 }, 
                            color: '#064e3b' 
                        }} />
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                color: '#064e3b',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                        >
                            Connected Devices
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Devices List */}
                    <List>
                        {devices.map((device, index) => {
                            const deviceDetails = parseDeviceInfo(device.deviceInfo);
                            
                            return (
                                <React.Fragment key={device.id}>
                                    <ListItem
                                        sx={{
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            py: { xs: 2, sm: 1 },
                                            '&:hover': { bgcolor: '#ecfdf5' }
                                        }}
                                        secondaryAction={
                                            <Tooltip title="Logout Device">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleLogoutDevice(device.id)}
                                                    sx={{
                                                        color: '#dc2626',
                                                        '&:hover': { bgcolor: '#fee2e2' },
                                                        position: { xs: 'static', sm: 'absolute' },
                                                        mt: { xs: 1, sm: 0 }
                                                    }}
                                                >
                                                    <LogoutIcon />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start',
                                            width: '100%',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: { xs: 1, sm: 0 }
                                        }}>
                                            <Box sx={{ 
                                                color: '#064e3b',
                                                mr: { xs: 0, sm: 2 }
                                            }}>
                                                {getDeviceIcon(deviceDetails.type)}
                                            </Box>
                                            <Box sx={{ 
                                                flex: 1,
                                                width: { xs: '100%', sm: 'auto' }
                                            }}>
                                                <ListItemText
                                                    primary={
                                                        <Typography sx={{
                                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                                        }}>
                                                            {deviceDetails.os}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" sx={{
                                                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                                        }}>
                                                            {`${deviceDetails.browser} • ${formatIPAddress(device.ipAddress)}`}
                                                        </Typography>
                                                    }
                                                />
                                                <Typography variant="caption" sx={{
                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                }}>
                                                    Login time: {formatLastActive(device.loginTime)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                    {index < devices.length - 1 && 
                                        <Divider sx={{ borderColor: '#d1fae5' }} />
                                    }
                                </React.Fragment>
                            );
                        })}
                    </List>

                    {devices.length === 0 && (
                        <Typography 
                            sx={{ 
                                color: '#059669', 
                                py: { xs: 2, sm: 4 },
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }} 
                            align="center"
                        >
                            No connected devices found
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default ConnectedDevices;