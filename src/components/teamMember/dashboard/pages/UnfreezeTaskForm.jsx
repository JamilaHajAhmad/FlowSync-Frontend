import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
} from "@mui/material";
import { PlayCircleOutline } from "@mui/icons-material";
import { unfreezeTask } from '../../../../services/taskService';
import { toast } from 'react-toastify';

const UnfreezeTaskForm = ({ open, onClose, task, onSubmitSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            if (!task?.frnNumber) {
                throw new Error('Task FRN number is missing');
            }

            console.log('Sending unfreeze request for task:', task.frnNumber);
            
            const result = await unfreezeTask(task.frnNumber, token);
            
            console.log('Unfreeze API response:', result);
            
            onSubmitSuccess(task);
            toast.success('Task unfrozen successfully');
            onClose();
        } catch (error) {
            console.error('Error in handleConfirm:', error);
            const errorMessage = error.response?.data?.errors?.$?.[0] || 
                               error.response?.data?.errors?.dto?.[0] ||
                               error.message || 
                               'Failed to unfreeze task';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '16px 24px',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                }}
            >
                <PlayCircleOutline color="primary" />
                Unfreeze Task
            </DialogTitle>

            <DialogContent
                sx={{
                    padding: '24px',
                    '& .MuiTypography-root': {
                        color: 'rgba(0, 0, 0, 0.87)',
                        marginBottom: '8px',
                    },
                }}
            >
                <Typography variant="subtitle1" gutterBottom>
                    Are you sure you want to unfreeze task <strong>{task?.frnNumber}</strong>?
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    This action will move the task back to the "Ongoing" status.
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                    gap: '12px',
                }}
            >
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    disabled={loading}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                    {loading ? 'Unfreezing...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnfreezeTaskForm;