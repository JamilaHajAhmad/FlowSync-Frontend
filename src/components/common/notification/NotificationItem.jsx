import { ListItem, ListItemText, IconButton, Typography, Box, ListItemIcon } from '@mui/material';
import { CheckCircle, Error, Info, Warning, DoneAll as DoneAllIcon } from '@mui/icons-material';
import { NotificationTypes } from './NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { formatLoginNotification } from '../../../utils/notificationFormatters';
import SecurityIcon from '@mui/icons-material/Security';

const getIcon = () => {
    return (
        <DoneAllIcon 
            sx={{ 
                color: '#059669',
                '&:hover': {
                    color: '#047857'
                }
            }} 
        />
    );
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
                    content: <Typography variant="body2">{notification.message}</Typography>,
                    timestamp: notification.createdAt,
                    severity: 'error'
                };
            case NotificationTypes.Warning:
                return {
                    icon: <Warning color="warning" />,
                    content: <Typography variant="body2">{notification.message}</Typography>,
                    timestamp: notification.createdAt,
                    severity: 'warning'
                };
            case NotificationTypes.Info:
                return {
                    icon: <Info color="info" />,
                    content: <Typography variant="body2">{notification.message}</Typography>,
                    timestamp: notification.createdAt,
                    severity: 'info'
                };
            default:
                return {
                    icon: <CheckCircle color="success" />,
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
                        sx={{
                            '&:hover': {
                                bgcolor: 'rgba(5, 150, 105, 0.08)'
                            }
                        }}
                    >
                        {getIcon()}
                    </IconButton>
                )
            }
        >
            <ListItemIcon sx={{ minWidth: 40 }}>
                {icon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography variant="subtitle2" sx={{ color: `${severity}.main` }}>
                        {title}
                    </Typography>
                }
                secondary={
                    <Box sx={{ mt: 0.5 }}>
                        {content}
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                                display: 'block',
                                mt: 0.5
                            }}
                        >
                            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                        </Typography>
                    </Box>
                }
            />
        </ListItem>
    );
};