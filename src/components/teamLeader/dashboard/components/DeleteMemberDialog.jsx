import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getMemberTasksToReassign } from '../../../../services/taskService';
import { deleteMember } from '../../../../services/memberService';
import ReassignTasks from './ReassignTasks';
import { toast } from 'react-toastify';

const DeleteMemberDialog = ({ 
    open, 
    memberId,
    memberName, 
    onClose,
}) => {
    const token = localStorage.getItem('authToken');
    const [loading, setLoading] = useState(true);
    const [tasksToReassign, setTasksToReassign] = useState(null);
    const [error, setError] = useState(null);
    const [showReassign, setShowReassign] = useState(false);
    const [deletionCompleted, setDeletionCompleted] = useState(false);

    useEffect(() => {
        const fetchTasksToReassign = async () => {
            if (!open || !memberId) return;
            console.log('Member ID:', memberId);
            try {
                setLoading(true);
                const response = await getMemberTasksToReassign(memberId, token);
                console.log('Fetched tasks:', response.data);
                

                // Group tasks by their type
                const formattedTasks = {
                    'Opened': [],
                    'Frozen': [],
                    'Delayed': []
                };

                // Response.data is an object with task arrays
                // eslint-disable-next-line no-unused-vars
                Object.entries(response.data).forEach(([key,tasks]) => {
                    // Make sure we handle both array and single task cases
                    const taskArray = Array.isArray(tasks) ? tasks : [tasks];
                    taskArray.forEach(task => {
                        if (task && task.type && Object.prototype.hasOwnProperty.call(formattedTasks, task.type)) {
                            formattedTasks[task.type].push(task);
                        }
                    });
                });

                console.log('Formatted tasks:', formattedTasks);
                setTasksToReassign(formattedTasks);
                setError(null);
            } catch (err) {
                setError('Failed to fetch member tasks');
                console.error('Error fetching tasks:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasksToReassign();
    }, [open, memberId, token]);

    const renderTasksList = () => {
        if (!tasksToReassign) return null;
        
        // Display tasks in this specific order
        const taskTypes = ['Opened', 'Frozen', 'Delayed'];
        
        return taskTypes.map(type => (
            <ListItem key={type} sx={{ py: 0 }}>
                <ListItemText 
                    primary={`${type}: ${tasksToReassign[type]?.length || 0} ${tasksToReassign[type]?.length !== 1 ? 'tasks' : 'task'}`}
                />
            </ListItem>
        ));
    };

    const hasTasksToReassign = tasksToReassign &&
        Object.values(tasksToReassign).some(tasks => Array.isArray(tasks) && tasks.length > 0);
    console.log('Has tasks to reassign:', hasTasksToReassign);
    console.log('Tasks to reassign:', tasksToReassign);

    const handleDeleteConfirm = async () => {
        try {
            await deleteMember(memberId, token);
            setDeletionCompleted(true);
            if (tasksToReassign && Object.values(tasksToReassign).some(tasks => tasks.length > 0)) {
                setShowReassign(true);
            } else {
                // No tasks to reassign, show success immediately
                toast.success('Member removed successfully');
                onClose();
            }
        } catch (err) {
            setError('Failed to delete member');
            console.error('Error deleting member:', err);
        }
    };

    const handleReassignComplete = () => {
        if (deletionCompleted) {
            toast.success('Member removed and tasks reassigned successfully');
            onClose();
        }
    };

    if (showReassign) {
        return (
            <ReassignTasks 
                tasks={Object.values(tasksToReassign).flat()}
                onComplete={handleReassignComplete}
            />
        );
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: '450px',
                    p: 1
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    color: '#111827', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <WarningAmberIcon color="warning" />
                Confirm Member Removal
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Are you sure you want to remove <strong>{memberName}</strong> from the team?
                </DialogContentText>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : hasTasksToReassign ? (
                    <Alert 
                        severity="warning" 
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>This member has the following tasks that need reassignment:</strong>
                        </Typography>
                        <List dense sx={{ mt: 1, mb: 0 }}>
                            {renderTasksList()}
                        </List>
                        <Typography variant="body2" sx={{ mt: 1, color: 'warning.dark' }}>
                            These tasks must be reassigned before removing the member.
                        </Typography>
                    </Alert>
                ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        This member has no active tasks that need reassignment.
                    </Alert>
                )}

                <Typography 
                    variant="body2" 
                    color="error" 
                    sx={{ mt: 2, fontWeight: 500 }}
                >
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: '#64748b',
                        borderColor: '#64748b',
                        '&:hover': {
                            borderColor: '#475569',
                            backgroundColor: 'rgba(100, 116, 139, 0.04)'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleDeleteConfirm}
                    variant="contained"
                    color="error"
                    sx={{
                        '&:hover': {
                            bgcolor: '#dc2626'
                        }
                    }}
                >
                    Remove Member
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteMemberDialog;