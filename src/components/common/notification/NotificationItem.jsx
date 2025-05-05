import React from 'react';
import { ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import { NotificationTypes } from './NotificationContext';
import { formatDistanceToNow } from 'date-fns';

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
    const { id, type, message, isRead, createdAt } = notification;

    const formatTimeAgo = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch (error) {
            return error.message;
        }
    };

    return (
        <ListItem
            sx={{
                bgcolor: isRead ? 'transparent' : 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
            }}
            secondaryAction={
                <IconButton 
                    edge="end" 
                    onClick={() => onMarkAsRead(id)}
                    sx={{ color: isRead ? 'success.main' : 'action.disabled' }}
                >
                    <CheckCircle />
                </IconButton>
            }
        >
            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {getIcon(type)}
                        <Typography variant="body1">
                            {message}
                        </Typography>
                    </Box>
                }
                secondary={
                    <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(createdAt)}
                    </Typography>
                }
                sx={{ mr: 2 }}
            />
        </ListItem>
    );
};