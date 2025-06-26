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
import { NotificationItem } from './NotificationItem';
import { markAllAsRead as apiMarkAllAsRead } from '../../../services/notificationService';

const NotificationList = ({ onClose }) => {
    const { notifications, markAllAsRead: contextMarkAllAsRead, markAsRead } = useContext(NotificationContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    const handleSeeAll = () => {
        navigate('/notifications');
        onClose();
    };

    const handleMarkAllAsRead = async () => {
        try {
            await apiMarkAllAsRead(token);
            contextMarkAllAsRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
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
                {notifications.some(n => !n.isRead) && (
                    <Button 
                        size="small"
                        onClick={handleMarkAllAsRead}
                        sx={{ 
                            color: 'success.main',
                            '&:hover': {
                                backgroundColor: 'success.lighter'
                            }
                        }}
                    >
                        Mark all as read
                    </Button>
                )}
            </Box>
            <List sx={{ 
                p: 0,
                maxHeight: '400px',
                overflowY: 'auto',
            }}>
                {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                        <NotificationItem 
                            notification={notification}
                            onMarkAsRead={(id) => {
                                markAsRead(id);
                                if (notification.onClick) {
                                    notification.onClick();
                                }
                            }}
                        />
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
                        color: 'success.main',
                        '&:hover': {
                            backgroundColor: 'success.lighter'
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