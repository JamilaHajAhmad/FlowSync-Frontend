import React, { useContext } from 'react';
import {
    List,
    Typography,
    Box,
    Button,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from './NotificationContext';
import NotificationItem from './NotificationItem';
import { Circle } from '@mui/icons-material';

const NotificationList = ({ onClose }) => {
    const { notifications, markAllAsRead, markAsRead } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleSeeAll = () => {
        navigate('/notifications');
        onClose();
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.onClick) {
            notification.onClick();
        }
        onClose();
    };

    if (notifications.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    No new notifications
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Notifications
                </Typography>
                {notifications.some(n => !n.read) && (
                    <Button 
                        size="small"
                        onClick={handleMarkAllAsRead}
                        sx={{ 
                            color: '#4caf50',
                            '&:hover': {
                                backgroundColor: 'rgba(76, 175, 80, 0.04)'
                            }
                        }}
                    >
                        Mark all as read
                    </Button>
                )}
            </Box>
            <List sx={{ 
                p: 0,  // Remove padding
                overflowY: 'visible', // Remove list scrolling
            }}>
                {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                        <Box sx={{ position: 'relative' }}>
                            {!notification.read && (
                                <Circle 
                                    sx={{
                                        position: 'absolute',
                                        top: 20,
                                        right: 16,
                                        fontSize: 8,
                                        color: '#4caf50',
                                        zIndex: 2
                                    }}
                                />
                            )}
                            <NotificationItem 
                                notification={notification}
                                onClick={() => handleNotificationClick(notification)}
                            />
                        </Box>
                        {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
            <Divider />
            <Box sx={{ p: 1 }}>
                <Button 
                    fullWidth
                    onClick={handleSeeAll}
                    sx={{ 
                        color: '#4caf50',
                        '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.04)'
                        }
                    }}
                >
                    See All
                </Button>
            </Box>
        </Box>
    );
};

export default NotificationList;