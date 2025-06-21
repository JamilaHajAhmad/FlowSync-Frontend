import React, { useState, useEffect } from "react";
import {
    Card, CardContent, Typography, Box, CircularProgress,
    Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
    ListItemIcon, Divider, IconButton
} from "@mui/material";
import { PauseCircleOutline, ErrorOutline, CheckCircleOutline } from '@mui/icons-material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CloseIcon from '@mui/icons-material/Close';
import { getMemberTasks } from "../../../../../../services/taskService";
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

const getStatusColor = (status) => {
    switch (status) {
        case "Opened":
            return {
                color: "#fff4e0",  // Light orange background
                textColor: "orange", // Orange text
                icon: <RotateLeftIcon sx={{ color: "#ed6c02" }} />,
                borderLeftColor: "#ed6c02"
            };
        case "Frozen":
            return {
                color: "#E3F2FD",  // Light blue background
                textColor: "#1976D2", // Blue text
                icon: <PauseCircleOutline sx={{ color: "#1976D2" }} />,
                borderLeftColor: "#1976D2"
            };

        case "Delayed":
            return {
                color: "#fde8e8",  // Light red background
                textColor: "red", // Red text
                icon: <ErrorOutline sx={{ color: "#d32f2f" }} />,
                borderLeftColor: "#d32f2f"
            };
        case "Completed":
            return {
                color: "#ecfdf5",  // Light green background
                textColor: "#059669", // Green text
                icon: <CheckCircleOutline sx={{ color: "#059669" }} />,
                borderLeftColor: "#059669"
            };
        default:
            return {
                color: "#f0f0f0",  // Default light gray background
                textColor: "#666", // Default gray text
                icon: <ErrorOutline sx={{ color: "#666" }} />,
                borderLeftColor: "#666"
            };
    }
};

const TaskReminderCard = () => {
    const [ tasks, setTasks ] = useState({
        Opened: [],
        Delayed: [],
        Frozen: [],
        Completed: []
    });
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ selectedType, setSelectedType ] = useState(null);
    const [ dialogOpen, setDialogOpen ] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('authToken');
                // Add Completed to the types
                const taskTypes = [ 'Delayed', 'Opened', 'Frozen', 'Completed' ];
                const tasksMap = {};

                for (const type of taskTypes) {
                    const response = await getMemberTasks(token, type);
                    tasksMap[ type ] = response.data || [];
                }

                setTasks(tasksMap);
            } catch (err) {
                setError('Failed to load tasks');
                console.error('Error fetching tasks:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handleTypeClick = (type) => {
        setSelectedType(type);
        setDialogOpen(true);
    };

    const renderTaskDialog = () => {
        const typeTasks = selectedType ? tasks[ selectedType ] || [] : [];

        return (
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: '1px solid #e2e8f0',
                        bgcolor: getStatusColor(selectedType).color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pr: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getStatusColor(selectedType).icon}
                        <Typography variant="h6" color={getStatusColor(selectedType).textColor}>
                            {selectedType} Tasks ({typeTasks.length})
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setDialogOpen(false)}
                        size="small"
                        sx={{
                            color: getStatusColor(selectedType).textColor,
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <List sx={{ p: 0 }}>
                        {typeTasks.map((task, index) => (
                            <React.Fragment key={task.frnNumber}>
                                <ListItem sx={{
                                    p: 3,
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.02)'
                                    }
                                }}>
                                    <ListItemIcon>
                                        {getStatusColor(task.status).icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight={500}>
                                                {task.taskTitle}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    FRN: <span style={{ color: '#1976d2' }}>{task.frnNumber}</span>
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Due: {new Date(task.deadline).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < typeTasks.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Card sx={{ minWidth: 300, mb: 2, bgcolor: '#fff4e0' }}>
                <CardContent>
                    <Typography color="error">{error}</Typography>
                </CardContent>CardContent
            </Card>
        );
    }

    if (Object.values(tasks).every(typeArray => typeArray.length === 0)) {
        return (
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: 2
                }}
            >
                <CelebrationIcon
                    sx={{
                        color: '#22c55e',
                        fontSize: { xs: 48, sm: 64 },
                        mb: 3
                    }}
                />
                <Typography
                    variant="h4"
                    color="#15803d"
                    sx={{
                        mb: 2,
                        fontWeight: 600,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                >
                    All Caught Up!
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        maxWidth: 500,
                        lineHeight: 1.5,
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                >
                    You're doing great! No pending tasks to remind you of
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box
                display="flex"
                gap={4}
                sx={{
                    overflowX: 'auto',
                    pb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    '&::-webkit-scrollbar': {
                        height: 8,
                        borderRadius: 2
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: '#f1f5f9'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: '#cbd5e1',
                        borderRadius: 2
                    },
                }}
                className="task-reminder-cards-container"
            >
                <Box 
                    sx={{
                        display: 'flex',
                        gap: 4,
                        px: 2
                    }}
                >
                    {Object.entries(tasks).map(([type, typeTasks]) => {
                        const { color, textColor, icon, borderLeftColor } = getStatusColor(type);

                        // Completed card: different subtitle and no click handler
                        if (type === "Completed") {
                            return (
                                <Card
                                    key={type}
                                    sx={{
                                        minWidth: 300,
                                        bgcolor: color,
                                        borderLeft: `5px solid ${borderLeftColor}`,
                                        boxShadow: 2,
                                        opacity: 0.95,
                                        position: 'relative'
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                                            {icon}
                                            <Typography variant="h6" color={textColor}>
                                                Completed Tasks
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" color={textColor}>
                                            {typeTasks.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {typeTasks.length === 1 ? 'task' : 'tasks'}
                                        </Typography>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 12,
                                                right: 16,
                                                bgcolor: '#43a047',
                                                color: '#fff',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 2,
                                                fontSize: 13,
                                                fontWeight: 500,
                                                boxShadow: 1,
                                                opacity: 0.85
                                            }}
                                        >
                                            Great job!
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        }

                        // Other cards (reminders)
                        return (
                            <Card
                                key={type}
                                sx={{
                                    minWidth: 300,
                                    bgcolor: color,
                                    borderLeft: `5px solid ${borderLeftColor}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3
                                    }
                                }}
                                onClick={() => handleTypeClick(type)}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        {icon}
                                        <Typography variant="h6" color={textColor}>
                                            {type} Tasks
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" color={textColor}>
                                        {typeTasks.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {typeTasks.length === 1 ? 'task' : 'tasks'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            </Box>
            {renderTaskDialog()}
        </>
    );
};

export default TaskReminderCard;