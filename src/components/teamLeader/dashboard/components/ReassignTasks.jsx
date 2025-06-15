import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Select,
    MenuItem,
    Button,
    LinearProgress,
    Alert,
    Avatar,
    Chip
} from '@mui/material';
import { getEmployeesWithTasks } from '../../../../services/employeeService';
import { reassignTask } from '../../../../services/taskService';

const ReassignTasks = ({ tasks, onComplete, excludeMemberId }) => {
    const [ currentTaskIndex, setCurrentTaskIndex ] = useState(0);
    const [ members, setMembers ] = useState([]);
    const [ selectedMember, setSelectedMember ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(null);
    const [ isCompleted, setIsCompleted ] = useState(false);
    // Add new state to track updated task counts
    const [ updatedTaskCounts, setUpdatedTaskCounts ] = useState({});

    // Calculate progress based on completed tasks
    const progress = (currentTaskIndex / tasks.length) * 100;

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getEmployeesWithTasks(token);
                console.log('Fetched members:', response.data);

                // Filter out the requesting member
                const filteredMembers = response.data.filter(
                    member => member.id !== excludeMemberId
                );

                setMembers(filteredMembers);
            } catch (err) {
                setError('Failed to fetch members');
                console.error(err);
            }
        };
        fetchMembers();
    }, [ excludeMemberId ]);

    const handleReassign = async () => {
        if (!selectedMember) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            await reassignTask(tasks[ currentTaskIndex ].frnNumber, selectedMember, token);

            // Update the task count for the selected member
            setUpdatedTaskCounts(prev => ({
                ...prev,
                [ selectedMember ]: (prev[ selectedMember ] || 0) + 1
            }));

            if (currentTaskIndex === tasks.length - 1) {
                // Last task completed
                setIsCompleted(true);
                onComplete();
            } else {
                setCurrentTaskIndex(prev => prev + 1);
                setSelectedMember('');
            }
        } catch (err) {
            setError('Failed to reassign task');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isCompleted) {
        return null;
    }

    const currentTask = tasks[ currentTaskIndex ];

    // Add the getStatusColor function at the top level
    const getStatusColor = (status) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case "completed":
                return { color: "green", background: "#e0f7e9" };
            case "delayed":
                return { color: "red", background: "#fde8e8" };
            case "opened":
                return { color: "orange", background: "#fff4e0" };
            case "frozen":
                return { color: "#1976D2", background: "#E3F2FD" };
            case "all":
                return { color: "#059669", background: "#ecfdf5" };
            default:
                return { color: "#059669", background: "#ecfdf5" };
        }
    };

    // Add this function at the top level after getStatusColor
    const getTaskLoadColor = (taskCount) => {
        if (taskCount <= 3) {
            return { color: "#059669", background: "#ecfdf5" }; // Light green - Low load
        } else if (taskCount <= 7) {
            return { color: "#d97706", background: "#fff7ed" }; // Light orange - Medium load
        } else {
            return { color: "#dc2626", background: "#fef2f2" }; // Light red - High load
        }
    };

    return (
        <Dialog
            open={!isCompleted}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: { xs: 1, sm: 2 },
                    m: { xs: 1, sm: 2 },
                    width: { xs: '95%', sm: '100%' },
                    maxHeight: { xs: '95vh', sm: '80vh' }
                }
            }}
        >
            <DialogTitle sx={{ 
                p: { xs: 2, sm: 3 },
                borderColor: 'divider',
                bgcolor: '#f8fafc'
            }}>
                <Typography sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontWeight: 600,
                    color: '#0f172a'
                }}>
                    Reassign Tasks ({currentTaskIndex + 1}/{tasks.length})
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ 
                            height: { xs: 6, sm: 8 },
                            borderRadius: 4,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#059669'
                            }
                        }}
                    />
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '0.813rem', sm: '0.875rem' }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Typography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                            mb: 1,
                            fontSize: { xs: '0.813rem', sm: '0.875rem' },
                            fontWeight: 500
                        }}
                    >
                        Current Task Details
                    </Typography>
                    <Box sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: 1, sm: 2 },
                    }}>
                        <Typography 
                            variant="body1" 
                            gutterBottom
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            <strong>Title:</strong> {currentTask.title}
                        </Typography>
                        <Typography 
                            variant="body1" 
                            gutterBottom
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            <strong>FRN Number:</strong> {currentTask.frnNumber}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            <strong>Type:</strong>
                            <Chip
                                label={currentTask.type}
                                size="small"
                                sx={{
                                    backgroundColor: getStatusColor(currentTask.type).background,
                                    color: getStatusColor(currentTask.type).color,
                                    fontWeight: 500,
                                    fontSize: { xs: '0.75rem', sm: '0.813rem' }
                            }}
                        />
                    </Typography>
                </Box>

                <Typography 
                    variant="body2" 
                    sx={{ 
                        mt: { xs: 2, sm: 3 },
                        mb: 1,
                        color: '#475569',
                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                        fontWeight: 500
                    }}
                >
                    Select member to reassign to:
                </Typography>
                <Select
                    fullWidth
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    sx={{ 
                        mt: 1,
                        '& .MuiSelect-select': {
                            py: { xs: 1.5, sm: 2 }
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e2e8f0'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#059669'
                        }
                    }}
                    renderValue={(selected) => {
                        const selectedMemberData = members.find(member => member.id === selected);
                        if (!selectedMemberData) return '';

                        return (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}>
                                <Avatar
                                    src={selectedMemberData.pictureURL}
                                    alt={selectedMemberData.fullName}
                                    sx={{ width: 24, height: 24 }}
                                />
                                <Typography>{selectedMemberData.fullName}</Typography>
                            </Box>
                        );
                    }}
                >
                    {members.map((member) => {
                        // Calculate total tasks including updates
                        const totalTasks = (member.ongoingTasks || 0) + (updatedTaskCounts[member.id] || 0);
                        // Get colors based on total tasks
                        const colors = getTaskLoadColor(totalTasks);

                        return (
                            <MenuItem
                                key={member.id}
                                value={member.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: { xs: 1.5, sm: 2 },
                                    minHeight: { xs: 40, sm: 48 },
                                    gap: { xs: 1, sm: 1.5 },
                                    '&:hover': {
                                        bgcolor: '#f8fafc'
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: '#f1f5f9',
                                        '&:hover': {
                                            bgcolor: '#e2e8f0'
                                        }
                                    }
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    flex: 1,
                                    minWidth: 0
                                }}>
                                    <Avatar
                                        src={member.pictureURL}
                                        alt={member.fullName}
                                        sx={{ 
                                            width: { xs: 32, sm: 36 }, 
                                            height: { xs: 32, sm: 36 },
                                            bgcolor: '#059669'
                                        }}
                                    >
                                        {member.fullName.charAt(0)}
                                    </Avatar>
                                    <Typography sx={{ 
                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                        fontWeight: 500
                                    }}>
                                        {member.fullName}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        px: { xs: 1, sm: 1.5 },
                                        py: { xs: 0.5, sm: 0.75 },
                                        borderRadius: 1,
                                        backgroundColor: colors.background,
                                        color: colors.color,
                                        fontWeight: 500,
                                        minWidth: '60px',
                                        textAlign: 'center',
                                        fontSize: { xs: '0.75rem', sm: '0.813rem' }
                                    }}
                                >
                                    {totalTasks} tasks
                                </Typography>
                            </MenuItem>
                        );
                    })}
                </Select>
            </Box>

            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                mt: { xs: 2, sm: 3 }
            }}>
                <Button
                    variant="contained"
                    onClick={handleReassign}
                    disabled={!selectedMember || loading}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 2, sm: 3 },
                        bgcolor: '#059669',
                        '&:hover': {
                            bgcolor: '#047857'
                        },
                        '&:disabled': {
                            bgcolor: '#059669',
                            opacity: 0.6
                        },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500,
                        textTransform: 'none'
                    }}
                >
                    {loading ? 'Reassigning...' : 'Reassign Task'}
                </Button>
            </Box>
        </DialogContent>
    </Dialog>
    );
};

ReassignTasks.defaultProps = {
    excludeMemberId: null
};

export default ReassignTasks;