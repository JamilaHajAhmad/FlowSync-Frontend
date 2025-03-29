import React from 'react';
import {
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Box
} from '@mui/material';
import {
    NotificationsActive,
    Assignment,
    Person,
    Warning
} from '@mui/icons-material';

const NotificationItem = ({ notification, onClick }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'task':
                return <Assignment sx={{ color: '#4caf50' }} />;
            case 'user':
                return <Person sx={{ color: '#2196f3' }} />;
            case 'alert':
                return <Warning sx={{ color: '#f44336' }} />;
            default:
                return <NotificationsActive sx={{ color: '#ff9800' }} />;
        }
    };

    return (
        <ListItem 
            onClick={onClick}
            sx={{ 
                p: 2,
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: notification.read ? 'transparent' : 'rgba(76, 175, 80, 0.04)',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
            }}
        >
            <ListItemIcon>
                {getIcon(notification.type)}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography 
                        variant="subtitle2" 
                        fontWeight={notification.read ? 400 : 600}
                    >
                        {notification.title}
                    </Typography>
                }
                secondary={
                    <Box>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            {notification.message}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block' }}
                        >
                            {notification.time}
                        </Typography>
                    </Box>
                }
            />
        </ListItem>
    );
};

export default NotificationItem;