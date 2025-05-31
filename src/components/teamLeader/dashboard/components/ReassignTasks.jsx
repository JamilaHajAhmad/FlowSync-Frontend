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
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    // Add new state to track updated task counts
    const [updatedTaskCounts, setUpdatedTaskCounts] = useState({});

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
    }, [excludeMemberId]);

    const handleReassign = async () => {
        if (!selectedMember) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            await reassignTask(tasks[currentTaskIndex].frnNumber, selectedMember, token);
            
            // Update the task count for the selected member
            setUpdatedTaskCounts(prev => ({
                ...prev,
                [selectedMember]: (prev[selectedMember] || 0) + 1
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

    const currentTask = tasks[currentTaskIndex];

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
                        Current Task
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        FRN Number: {currentTask.frnNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Select member to reassign to:
                    </Typography>
                    <Select
                        fullWidth
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                        sx={{ mt: 1 }}
                    >
                        {members.map((member) => (
                            <MenuItem 
                                key={member.id} 
                                value={member.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                        src={member.pictureURL}
                                        alt={member.fullName}
                                        sx={{ width: 32, height: 32 }}
                                    />
                                    <Typography>{member.fullName}</Typography>
                                </Box>
                                <Chip 
                                    label={`${(member.ongoingTasks || 0) + (updatedTaskCounts[member.id] || 0)} tasks`}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: '#e2e8f0',
                                        '& .MuiChip-label': {
                                            fontSize: '0.75rem'
                                        }
                                    }}
                                />
                            </MenuItem>
                        ))}
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