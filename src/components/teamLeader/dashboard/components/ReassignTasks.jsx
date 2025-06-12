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
        >
            <DialogTitle>
                Reassign Tasks ({currentTaskIndex + 1}/{tasks.length})
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 4 }}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Current Task Details
                    </Typography>
                    <Box sx={{
                        p: 2
                    }}>
                        <Typography variant="body1" gutterBottom>
                            <strong>Title:</strong> {currentTask.title}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            <strong>FRN Number:</strong> {currentTask.frnNumber}
                        </Typography>
                        <Typography
                            variant="body1"
                            gutterBottom
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <strong>Type:</strong>
                            <Chip
                                label={currentTask.type}
                                size="small"
                                sx={{
                                    backgroundColor: getStatusColor(currentTask.type).background,
                                    color: getStatusColor(currentTask.type).color,
                                    fontWeight: 500
                                }}
                            />
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Select member to reassign to:
                    </Typography>
                    <Select
                        fullWidth
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                        sx={{ mt: 1 }}
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
                                        padding: '8px 16px',
                                        minHeight: '48px',
                                        '&.Mui-selected': {
                                            '& .MuiChip-root': {
                                                position: 'absolute',
                                                bottom: 20,
                                                right: 40,
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
                                            sx={{ width: 32, height: 32 }}
                                        />
                                        <Typography>
                                            {member.fullName}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: colors.background,
                                            color: colors.color,
                                            fontWeight: 'medium',
                                            minWidth: '60px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {totalTasks} tasks
                                    </Typography>
                                </MenuItem>
                            );
                        })}
                    </Select>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleReassign}
                        disabled={!selectedMember || loading}
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