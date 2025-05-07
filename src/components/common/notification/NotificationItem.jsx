import React from 'react';
import { ListItem, ListItemText, IconButton, Typography, Box, ListItemIcon } from '@mui/material';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import { NotificationTypes } from './NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { formatLoginNotification } from '../../../utils/notificationFormatters';
import SecurityIcon from '@mui/icons-material/Security';

const getIcon = (type) => {
    switch (type) {
        case NotificationTypes.Error:
            return <Error color="error" />;
        case NotificationTypes.Warning:
            return <Warning color="warning" />;
        case NotificationTypes.Info:
            return <Info color="info" />;
        default:
            return <CheckCircle color="success" />;
    }
};

export const NotificationItem = ({ notification, onMarkAsRead }) => {
    const getNotificationContent = (notification) => {
        if (notification.type === 'Security') {
            const { title, message, details } = formatLoginNotification(notification);
            
            return {
                icon: <SecurityIcon sx={{ color: 'warning.main' }} />,
                title: title,
                content: (
                    <Box>
                        <Typography variant="body2">{message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {details}
                        </Typography>
                    </Box>
                ),
                timestamp: notification.createdAt,
                severity: 'warning'
            };
        }
        
        switch (notification.type) {
            case NotificationTypes.Error:
                return {
                    icon: <Error color="error" />,
                    title: 'Error',
                    content: <Typography variant="body2">{notification.message}</Typography>,
                    timestamp: notification.createdAt,
                    severity: 'error'
                };
            case NotificationTypes.Warning:
                return {
                    icon: <Warning color="warning" />,
                    title: 'Warning',
                    content: <Typography variant="body2">{notification.message}</Typography>,
                    timestamp: notification.createdAt,
                    severity: 'warning'
                };
            case NotificationTypes.Info:
                return {
                    icon: <Info color="info" />,
                    title: 'Info',
                    content: <Typography variant="body2">{notification.message}</Typography>,
                    timestamp: notification.createdAt,
                    severity: 'info'
                };
            default:
                return {
                    icon: <CheckCircle color="success" />,
                    title: 'Success',
                    content: <Typography variant="body2">{notification.message}</Typography>,
                    timestamp: notification.createdAt,
                    severity: 'success'
                };
        }
    };

    const { icon, title, content, timestamp, severity } = getNotificationContent(notification);

    return (
        <ListItem
            sx={{
                py: 1.5,
                px: 2,
                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                '&:hover': {
                    bgcolor: 'action.selected'
                }
            }}
            secondaryAction={
                !notification.isRead && (
                    <IconButton 
                        edge="end" 
                        onClick={() => onMarkAsRead(notification.id)}
                        size="small"
                    >
                        {getIcon(notification.type)}
                    </IconButton>
                )
            }
        >
            <ListItemIcon sx={{ minWidth: 40 }}>
                {icon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" sx={{ color: `${severity}.main` }}>
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                        </Typography>
                    </Box>
                }
                secondary={content}
            />
        </ListItem>
    );
};