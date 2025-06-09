import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Chip,
    Grid,
    IconButton,
    Paper,
    alpha,
    Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    Warning as WarningIcon,
    AccessTime as TimeIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    Source as SourceIcon
} from '@mui/icons-material';

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'Urgent': return { color: '#dc2626', bg: '#fee2e2' };
        case 'Important': return { color: '#ea580c', bg: '#ffedd5' };
        case 'Regular': return { color: '#059669', bg: '#d1fae5' };
        default: return { color: '#059669', bg: '#d1fae5' };
    }
};

const TaskConfirmationDialog = ({ open, onClose, taskData, onConfirm, loading }) => {
    const priorityColors = getPriorityColor(taskData?.priority);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                            Confirm Task Creation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please review the task details before proceeding
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            bgcolor: 'white',
                            boxShadow: 1,
                            '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, mt: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: alpha('#f59e0b', 0.08),
                        border: '1px solid',
                        borderColor: alpha('#f59e0b', 0.2),
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WarningIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                        <Typography variant="body1" color="warning.dark">
                            This action cannot be undone. The task cannot be edited or deleted once created.
                        </Typography>
                    </Box>
                </Paper>

                <Box sx={{ mb: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: '#fff'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            <AssignmentIcon sx={{ color: priorityColors.color, mt: 0.5 }} />
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                    {taskData?.title}
                                </Typography>
                                <Chip
                                    label={taskData?.priority}
                                    sx={{
                                        bgcolor: priorityColors.bg,
                                        color: priorityColors.color,
                                        fontWeight: 600,
                                        '& .MuiChip-label': { px: 2 }
                                    }}
                                    size="small"
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2.5 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 2,
                                    bgcolor: alpha(priorityColors.color, 0.08),
                                    borderRadius: 2
                                }}>
                                    <Avatar
                                        src={taskData?.pictureURL}
                                        alt={taskData?.selectedMemberName}
                                        sx={{ 
                                            width: 32, 
                                            height: 32,
                                            border: `2px solid ${priorityColors.color}`,
                                            bgcolor: alpha(priorityColors.color, 0.1)
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Assigned To
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {taskData?.selectedMemberName}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                        FRN Number
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {taskData?.frnNumber}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                        OSS Number
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {taskData?.ossNumber || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 2,
                                    bgcolor: '#f8fafc',
                                    borderRadius: 2
                                }}>
                                    <TimeIcon sx={{ color: '#64748b' }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Time Allocation
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {taskData?.priority === 'Urgent' ? '2 days' :
                                                taskData?.priority === 'Important' ? '10 days' : '10 days'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <SourceIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                        Case Source
                                    </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight={500}>
                                    {taskData?.caseSource}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <DescriptionIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                        Case Type
                                    </Typography>
                                </Box>
                                <Typography variant="body1" fontWeight={500}>
                                    {taskData?.caseType || 'Not added'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 3,
                    bgcolor: '#f8fafc',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{
                        color: '#64748b',
                        borderColor: '#cbd5e1',
                        px: 3,
                        '&:hover': {
                            borderColor: '#94a3b8',
                            bgcolor: '#f1f5f9'
                        }
                    }}
                >
                    Back
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    disabled={loading}
                    sx={{
                        bgcolor: '#059669',
                        px: 3,
                        '&:hover': {
                            bgcolor: '#047857'
                        },
                        '&:disabled': {
                            bgcolor: alpha('#059669', 0.6)
                        }
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>Creating...</span>
                        </Box>
                    ) : (
                        "Proceed"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskConfirmationDialog;