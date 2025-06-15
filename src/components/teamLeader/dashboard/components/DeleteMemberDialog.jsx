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
    ListItemText,
    useTheme,
    useMediaQuery
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
    onSuccess,
    type, // Remove default value to help debug
    excludeMemberId,
}) => {
    // Add debug logging at the start of component
    console.log('DeleteMemberDialog received type:', type);
    const token = localStorage.getItem('authToken');
    const [ loading, setLoading ] = useState(true);
    const [ tasksToReassign, setTasksToReassign ] = useState(null);
    const [ error, setError ] = useState(null);
    const [ showReassign, setShowReassign ] = useState(false);
    const [ deletionCompleted, setDeletionCompleted ] = useState(false);
    // Add loading state for buttons
    const [ buttonLoading, setButtonLoading ] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                Object.entries(response.data).forEach(([ key, tasks ]) => {
                    // Make sure we handle both array and single task cases
                    const taskArray = Array.isArray(tasks) ? tasks : [ tasks ];
                    taskArray.forEach(task => {
                        if (task && task.type && Object.prototype.hasOwnProperty.call(formattedTasks, task.type)) {
                            formattedTasks[ task.type ].push(task);
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
    }, [ open, memberId, token ]);

    const renderTasksList = () => {
        if (!tasksToReassign) return null;

        // Display tasks in this specific order
        const taskTypes = [ 'Opened', 'Frozen', 'Delayed' ];

        return taskTypes.map(type => (
            <ListItem key={type} sx={{ py: 0 }}>
                <ListItemText
                    primary={`${type}: ${tasksToReassign[ type ]?.length || 0} ${tasksToReassign[ type ]?.length !== 1 ? 'tasks' : 'task'}`}
                />
            </ListItem>
        ));
    };

    const hasTasksToReassign = tasksToReassign &&
        Object.values(tasksToReassign).some(tasks => Array.isArray(tasks) && tasks.length > 0);
    console.log('Has tasks to reassign:', hasTasksToReassign);
    console.log('Tasks to reassign:', tasksToReassign);

    // Update the handleConfirmAction function
    const handleConfirmAction = async () => {
        setButtonLoading(true);
        try {
            console.log('Handling action for type:', type);
            if (type === 'deleteAccount') {
                await deleteMember(memberId, token);
            }
            setDeletionCompleted(true);

            if (tasksToReassign && Object.values(tasksToReassign).some(tasks => tasks.length > 0)) {
                setShowReassign(true);
            } else {
                toast.success(type === 'deleteAccount' ?
                    'Member deactivated successfully' :
                    'Member status changed successfully'
                );
                onClose();
                onSuccess();
            }
        } catch (err) {
            setError(type === 'deleteAccount' ?
                'Failed to deactivate member' :
                'Failed to change member status'
            );
            console.log('Error during action:', err);
        } finally {
            setButtonLoading(false);
        }
    };

    const handleReassignComplete = () => {
        if (deletionCompleted) {
            toast.success(type === 'deleteAccount' ?
                'Member deactivated and tasks reassigned successfully' :
                'Member status changed and tasks reassigned successfully'
            );
            onClose();
            onSuccess();
        }
    };

    // Update showReassign section to pass excludeMemberId based on type
    if (showReassign) {
        return (
            <ReassignTasks
                tasks={Object.values(tasksToReassign).flat()}
                onComplete={handleReassignComplete}
                excludeMemberId={type === 'delete' ? memberId : excludeMemberId}
            />
        );
    }

    // Update the Dialog and its content
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '95%', sm: '450px' },
                    m: { xs: 1, sm: 2 },
                    borderRadius: { xs: 1, sm: 2 },
                    maxHeight: { xs: '95vh', sm: 'auto' }
                }
            }}
        >
            <DialogTitle
                sx={{
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 },
                    color: '#111827',
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    borderColor: 'divider'
                }}
            >
                <WarningAmberIcon 
                    color="warning" 
                    sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} 
                />
                {type === 'deleteAccount' ? 'Confirm Member Deactivating' : 'Confirm Status Change'}
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <DialogContentText sx={{ 
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                    {type === 'deleteAccount' ?
                        `Are you sure you want to deactivate ${memberName} from the team?` :
                        `Are you sure you want to change ${memberName}'s status?`
                    }
                </DialogContentText>

                {loading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        my: { xs: 2, sm: 3 }
                    }}>
                        <CircularProgress size={isMobile ? 20 : 24} />
                    </Box>
                ) : error ? (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 },
                            '& .MuiAlert-message': {
                                fontSize: { xs: '0.813rem', sm: '0.875rem' }
                            }
                        }}
                    >
                        {error}
                    </Alert>
                ) : hasTasksToReassign ? (
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 }
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                mb: 1,
                                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                fontWeight: 500
                            }}
                        >
                            <strong>
                                {type === 'deleteAccount' ?
                                    'This member has the following tasks that need reassignment:' :
                                    'Before changing status, the following tasks need reassignment:'
                                }
                            </strong>
                        </Typography>
                        <List dense sx={{ 
                            mt: 1,
                            mb: 0,
                            '& .MuiListItem-root': {
                                py: { xs: 0.25, sm: 0.5 }
                            },
                            '& .MuiListItemText-primary': {
                                fontSize: { xs: '0.813rem', sm: '0.875rem' }
                            }
                        }}>
                            {renderTasksList()}
                        </List>
                    </Alert>
                ) : (
                    <Alert 
                        severity="info" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 },
                            '& .MuiAlert-message': {
                                fontSize: { xs: '0.813rem', sm: '0.875rem' }
                            }
                        }}
                    >
                        This member has no active tasks that need reassignment.
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ 
                p: { xs: 2, sm: 3 },
                pt: { xs: 0, sm: 1 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 1.5 }
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={buttonLoading}
                    fullWidth={isMobile}
                    sx={{
                        order: { xs: 2, sm: 1 },
                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                        py: { xs: 0.75, sm: 1 }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirmAction}
                    variant="contained"
                    color="error"
                    disabled={buttonLoading}
                    fullWidth={isMobile}
                    startIcon={buttonLoading ? <CircularProgress size={16} /> : null}
                    sx={{
                        order: { xs: 1, sm: 2 },
                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                        py: { xs: 0.75, sm: 1 }
                    }}
                >
                    {buttonLoading 
                        ? (type === 'deleteAccount' ? 'Deactivating...' : 'Changing Status...')
                        : (type === 'deleteAccount' ? 'Deactivate Member' : 'Change Status')
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteMemberDialog;
