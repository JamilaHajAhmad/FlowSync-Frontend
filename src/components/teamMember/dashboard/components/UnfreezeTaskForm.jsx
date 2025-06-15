import { useState } from 'react';
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
                    // Responsive margin for mobile
                    margin: {
                        xs: '16px',
                        sm: '32px',
                    },
                    // Ensure dialog doesn't exceed viewport
                    maxHeight: {
                        xs: 'calc(100vh - 32px)',
                        sm: 'calc(100vh - 64px)',
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    // Responsive padding
                    padding: {
                        xs: '12px 16px',
                        sm: '16px 24px',
                    },
                    // Responsive font size
                    fontSize: {
                        xs: '1.1rem',
                        sm: '1.25rem',
                    },
                    fontWeight: 600,
                    // Ensure title doesn't wrap awkwardly
                    wordBreak: 'keep-all',
                }}
            >
                <PlayCircleOutline 
                    color="primary" 
                    sx={{
                        // Responsive icon size
                        fontSize: {
                            xs: '1.3rem',
                            sm: '1.5rem',
                        }
                    }}
                />
                Unfreeze Task
            </DialogTitle>

            <DialogContent
                sx={{
                    // Responsive padding
                    padding: {
                        xs: '16px',
                        sm: '24px',
                    },
                    '& .MuiTypography-root': {
                        color: 'rgba(0, 0, 0, 0.87)',
                        marginBottom: '8px',
                    },
                }}
            >
                <Typography 
                    variant="subtitle1" 
                    gutterBottom
                    sx={{
                        // Responsive font size for main text
                        fontSize: {
                            xs: '0.95rem',
                            sm: '1rem',
                        },
                        // Better line height for readability on small screens
                        lineHeight: {
                            xs: 1.4,
                            sm: 1.5,
                        },
                        // Ensure text wraps properly
                        wordBreak: 'break-word',
                    }}
                >
                    Are you sure you want to unfreeze task <strong>{task?.frnNumber}</strong>?
                </Typography>

                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                        // Responsive font size for secondary text
                        fontSize: {
                            xs: '0.85rem',
                            sm: '0.875rem',
                        },
                        lineHeight: {
                            xs: 1.3,
                            sm: 1.4,
                        },
                    }}
                >
                    This action will move the task back to the "Ongoing" status.
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    // Responsive padding
                    padding: {
                        xs: '12px 16px',
                        sm: '16px 24px',
                    },
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                    // Responsive gap and layout
                    gap: {
                        xs: '8px',
                        sm: '12px',
                    },
                    // Stack buttons vertically on very small screens if needed
                    flexDirection: {
                        xs: 'column-reverse',
                        sm: 'row',
                    },
                    // Align buttons properly
                    '& .MuiButton-root': {
                        // Full width on mobile for better touch targets
                        width: {
                            xs: '100%',
                            sm: 'auto',
                        },
                        // Responsive button size
                        minHeight: {
                            xs: '44px',
                            sm: '36px',
                        },
                        // Responsive font size
                        fontSize: {
                            xs: '0.9rem',
                            sm: '0.875rem',
                        },
                    },
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