import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Box,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { toast } from 'react-toastify';
import { createCompletionRequest } from '../../../../services/completionRequests';

const CompleteTaskForm = ({ open, onClose, task, onSubmitSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const token = localStorage.getItem('authToken');
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!task?.frnNumber) {
            toast.error('Task information is missing');
            return;
        }

        try {
            setLoading(true);
            const requestData = {
                frnNumber: task.frnNumber,
                notes: notes.trim()
            };

            await createCompletionRequest(requestData, token);
            
            // Create updated task object with completion info
            const updatedTask = {
                ...task,
                completionNotes: notes.trim(),
                completedDate: new Date().toLocaleDateString('en-US')
            };

            // Call onSubmitSuccess with updated task
            onSubmitSuccess(updatedTask);
            
            toast.success('Completion request submitted successfully');
            setNotes('');
            onClose();
        } catch (error) {
            console.error('Error submitting completion request:', error);
            toast.error(error?.response?.data || 'Failed to submit completion request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={() => !loading && onClose()}
            maxWidth={isMobile ? false : "sm"}
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : '8px',
                    ...(isMobile && {
                        width: '100%',
                        height: '100%',
                        margin: 0,
                        maxHeight: '100%'
                    }),
                    ...(isTablet && !isMobile && {
                        margin: '16px',
                        width: 'calc(100% - 32px)',
                        maxWidth: '600px'
                    })
                },
            }}
        >
            <DialogTitle sx={{ 
                pb: 1,
                px: isMobile ? 2 : 3,
                pt: isMobile ? 2 : 3,
                color: '#059669',
                fontWeight: 'bold',
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                ...(isMobile && {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 1
                })
            }}>
                Complete Task Request
            </DialogTitle>

            <DialogContent sx={{
                px: isMobile ? 2 : 3,
                py: isMobile ? 2 : 3,
                ...(isMobile && {
                    flex: 1,
                    overflowY: 'auto'
                })
            }}>
                <Box sx={{ 
                    mb: 2,
                    p: isMobile ? 1.5 : 2,
                    backgroundColor: 'rgba(5, 150, 105, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(5, 150, 105, 0.1)'
                }}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{
                        fontSize: isMobile ? '0.95rem' : '1rem',
                        fontWeight: 500,
                        mb: 0.5
                    }}>
                        Task: {task?.taskTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: isMobile ? '0.85rem' : '0.875rem'
                    }}>
                        FRN: {task?.frnNumber}
                    </Typography>
                </Box>
                
                <TextField
                    autoFocus={!isMobile}
                    multiline
                    rows={isMobile ? 5 : 4}
                    label="Completion Notes (optional)"
                    fullWidth
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                    placeholder="Please provide details about task completion..."
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                                borderColor: '#059669'
                            },
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            '&.Mui-focused': {
                                color: '#059669'
                            }
                        },
                        '& .MuiOutlinedInput-input': {
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ 
                px: isMobile ? 2 : 3, 
                pb: isMobile ? 3 : 3,
                pt: isMobile ? 2 : 1,
                gap: isMobile ? 1 : 1.5,
                flexDirection: isMobile ? 'column-reverse' : 'row',
                ...(isMobile && {
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: 'white',
                    zIndex: 1,
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                })
            }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        },
                        ...(isMobile && {
                            width: '100%',
                            minHeight: '44px',
                            fontSize: '0.95rem'
                        })
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        bgcolor: '#059669',
                        '&:hover': {
                            bgcolor: '#047857'
                        },
                        '&.Mui-disabled': {
                            bgcolor: '#82c4b3'
                        },
                        minWidth: isMobile ? 'auto' : 100,
                        ...(isMobile && {
                            width: '100%',
                            minHeight: '44px',
                            fontSize: '0.95rem'
                        })
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : (
                        'Submit'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CompleteTaskForm;