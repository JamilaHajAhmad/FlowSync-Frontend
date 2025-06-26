import React, { useContext, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Divider,
    List,
    Button,
    CssBaseline
} from '@mui/material';
import { NotificationContext } from './NotificationContext';
import { NotificationItem } from './NotificationItem';
import PageHeading from '../PageHeading';
import Sidebar from '../../teamLeader/dashboard/components/Sidebar';
import MSidebar from '../../teamMember/dashboard/components/MSidebar';
import Topbar from '../Topbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import getDesignTokens from '../../../theme';
import { decodeToken } from '../../../utils';
import { markAllAsRead as apiMarkAllAsRead } from '../../../services/notificationService';

const NotificationsPage = () => {
    const { notifications, markAllAsRead: contextMarkAllAsRead, markAsRead } = useContext(NotificationContext);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState(
        localStorage.getItem("currentMode") ? 
        localStorage.getItem("currentMode") : 
        "light"
    );
    const [userRole, setUserRole] = React.useState(null);
    
    React.useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = decodeToken(token);
            setUserRole(decoded.role);
        }
        document.title = "FlowSync | Notifications";
    }, []);

    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await apiMarkAllAsRead(token);
            contextMarkAllAsRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const renderSidebar = () => {
        if (!userRole) return null;
        if (userRole.includes('Leader')) {
            return <Sidebar open={open} />;
        } else if (userRole.includes('Member')) {
            return <MSidebar open={open} />;
        }
        return null;
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Topbar open={open} handleDrawerOpen={handleDrawerOpen} setMode={setMode} />
                {renderSidebar()}
                <Box component="main" sx={{ 
                    flexGrow: 1, 
                    p: { xs: 2, sm: 3 },
                    width: '100%'
                }}>
                    <Box sx={{ height: { xs: 56, sm: 64 } }} />
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        mb: { xs: 2, sm: 3 }
                    }}>
                        <Box sx={{ flex: 1 }}>
                            <PageHeading 
                                title="Notifications" 
                                subtitle="View and manage your notifications"
                            />
                        </Box>
                        {notifications.some(n => !n.read) && (
                            <Box sx={{ 
                                mt: { xs: 2, sm: 0 },
                                ml: { xs: 0, sm: 2 }
                            }}>
                                <Button 
                                    onClick={handleMarkAllAsRead}
                                    sx={{ 
                                        color: '#4caf50',
                                        borderColor: '#4caf50',
                                        '&:hover': {
                                            borderColor: '#2e7d32',
                                            backgroundColor: 'rgba(76, 175, 80, 0.04)'
                                        },
                                        width: { xs: '100%', sm: 'auto' }
                                    }}
                                    variant="outlined"
                                >
                                    Mark all as read
                                </Button>
                            </Box>
                        )}
                    </Box>
                    <Container 
                        maxWidth="sm" 
                        sx={{ 
                            py: { xs: 2, sm: 4 },
                            px: { xs: 1, sm: 2 }
                        }}
                    >
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                borderRadius: { xs: 1, sm: 2 },
                                border: '1px solid #e0e0e0',
                                overflow: 'hidden'
                            }}
                        >
                            {notifications.length === 0 ? (
                                <Box sx={{ 
                                    p: { xs: 3, sm: 4 }, 
                                    textAlign: 'center' 
                            }}>
                                    <Typography 
                                        color="text.secondary"
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
                                    >
                                        No notifications to display
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ 
                                    p: 0,
                                    '& .MuiListItem-root': {
                                        px: { xs: 1.5, sm: 2 },
                                        py: { xs: 1.5, sm: 2 }
                                    }
                            }}>
                                {notifications.map((notification, index) => (
                                    <React.Fragment key={notification.id}>
                                        <Box sx={{ position: 'relative' }}>
                                            <NotificationItem 
                                                notification={notification}
                                                onMarkAsRead={() => markAsRead(notification.id)}
                                            />
                                        </Box>
                                        {index < notifications.length - 1 && (
                                            <Divider sx={{ 
                                                mx: { xs: 1, sm: 2 }
                                            }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Container>
            </Box>
        </Box>
    </ThemeProvider>
);
};
export default NotificationsPage;