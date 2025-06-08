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
    Typography
} from '@mui/material';
import { toast } from 'react-toastify';
import { createCompletionRequest } from '../../../../services/completionRequests';

const CompleteTaskForm = ({ open, onClose, task, onSubmitSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const token = localStorage.getItem('authToken');

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
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ 
                pb: 1,
                color: '#059669',
                fontWeight: 'bold' 
            }}>
                Complete Task Request
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                        Task: {task?.taskTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        FRN: {task?.frnNumber}
                    </Typography>
                </Box>
                <TextField
                    autoFocus
                    multiline
                    rows={4}
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
                            }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#059669'
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
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
                        minWidth: 100
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