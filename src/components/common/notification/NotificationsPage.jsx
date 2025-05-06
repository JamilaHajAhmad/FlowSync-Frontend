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
import { markAllAsRead as apiMarkAllAsRead } from './notificationService';

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
    }, []);

    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await apiMarkAllAsRead(token); // API call
            contextMarkAllAsRead(); // Update local state
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            // Optionally show an error message to the user
        }
    };

    const renderSidebar = () => {
        if (userRole === 'Leader') {
            return <Sidebar open={open} />;
        } else if (userRole === 'Member') {
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
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ height: 64 }} />
                    <PageHeading 
                        title="Notifications" 
                        subtitle="View and manage your notifications"
                    />
                    <Box>
                        {notifications.some(n => !n.read) && (
                            <Button 
                                onClick={handleMarkAllAsRead}
                                sx={{ 
                                    color: '#4caf50',
                                    borderColor: '#4caf50',
                                    '&:hover': {
                                        borderColor: '#2e7d32',
                                        backgroundColor: 'rgba(76, 175, 80, 0.04)'
                                    },
                                    position: 'absolute',
                                    right: 40,
                                    top: 200,
                                }}
                                variant="outlined"
                            >
                                Mark all as read
                            </Button>
                        )}
                    </Box>

                    <Container maxWidth="sm" sx={{ py: 4 }}>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                overflow: 'hidden'
                            }}
                        >
                            {notifications.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No notifications to display
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <List sx={{ p: 0 }}>
                                        {notifications.map((notification, index) => (
                                            <React.Fragment key={notification.id}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <NotificationItem 
                                                        notification={notification}
                                                        onMarkAsRead={() => markAsRead(notification.id)}
                                                    />
                                                </Box>
                                                {index < notifications.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </>
                            )}
                        </Paper>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default NotificationsPage;