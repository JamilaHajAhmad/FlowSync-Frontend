import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    IconButton, 
    Box, 
    Avatar, 
    Typography, 
    Grid, 
    Chip,
    Stack,
    Paper,
    useTheme
} from '@mui/material';
import { 
    Close as CloseIcon,
    CalendarMonth as JoinDateIcon,
    CheckCircleOutline as CompletedIcon,
    Loop as OngoingIcon,
    PauseCircle as FrozenIcon,
    ErrorOutline as DelayedIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import React from 'react';

const formatStatus = (status) => {
    switch (status) {
        case 'On_Duty':
            return 'On Duty';
        case 'Annually_Leave':
            return 'Annual Leave';
        case 'Temporarily_Leave':
            return 'Temporarily Leave';
        default:
            return 'Unknown';
    }
};

const MemberDetailsDialog = ({ open, onClose, member }) => {
    const theme = useTheme();
    if (!member) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: { xs: 1, sm: 2 },
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    minHeight: { xs: '100vh', sm: '80vh' },
                    m: { xs: 0, sm: 2 },
                    maxHeight: { xs: '100vh', sm: '90vh' }
                }
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box 
                    sx={{ 
                        background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
                        p: { xs: 2, sm: 3 },
                        height: { xs: '140px', sm: '180px' },
                        position: 'relative',
                        mb: { xs: 6, sm: 8 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: { xs: 8, sm: 16 },
                            top: { xs: 8, sm: 16 },
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)'
                            }
                        }}
                    >
                        <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                    </IconButton>
                    
                    <Avatar
                        src={member.pictureURL}
                        alt={member.fullName}
                        sx={{
                            width: { xs: 100, sm: 140 },
                            height: { xs: 100, sm: 140 },
                            border: '5px solid white',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            position: 'absolute',
                            bottom: { xs: -50, sm: -70 },
                            backgroundColor: '#059669',
                            fontSize: { xs: '2rem', sm: '3rem' }
                        }}
                    >
                        {member.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ 
                mt: { xs: 4, sm: 6 }, 
                pb: { xs: 2, sm: 4 },
                px: { xs: 2, sm: 3 }
            }}>
                <Box textAlign="center" mb={{ xs: 3, sm: 4 }}>
                    <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        color="primary.dark" 
                        sx={{ 
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            mb: 1 
                        }}
                    >
                        {member.fullName}
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                            mb: 2,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        {member.email}
                    </Typography>
                    <Chip
                        label={formatStatus(member.status)}
                        sx={{
                            mt: 1,
                            px: 2,
                            py: 1,
                            bgcolor: member.status === 'On_Duty' ? '#e0f7e9' : 
                                    member.status === 'Annually_Leave' ? '#fde8e8' : '#fff4e0',
                            color:  member.status === 'On_Duty' ? '#059669' : 
                                    member.status === 'Annually_Leave' ? '#dc2626' : '#d97706',
                            fontWeight: 600,
                            borderRadius: '20px',
                            '& .MuiChip-label': {
                                px: 1
                            }
                        }}
                    />
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mt: 2,
                            color: 'text.secondary'
                        }}
                    >
                        <JoinDateIcon sx={{ fontSize: 20, mr: 1 }} />
                        <Typography variant="body2">
                            Joined {format(new Date(member.joinDate ? member.joinDate : new Date() ), 'MMMM dd, yyyy')}
                        </Typography>
                    </Box>
                </Box>

                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        bgcolor: '#f8fafc',
                        borderRadius: { xs: 1, sm: 2 },
                        mb: { xs: 3, sm: 4 }
                    }}
                >
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                        <Grid item xs={12} md={6}>
                            <DetailItem 
                                label="Phone" 
                                value={member.phone || 'Not provided'} 
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DetailItem 
                                label="Date of Birth" 
                                value={member.dateOfBirth ? format(new Date(member.dateOfBirth), 'MMM dd, yyyy') : 'Not provided'} 
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DetailItem 
                                label="Major" 
                                value={member.major || 'Not provided'} 
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DetailItem 
                                label="Address" 
                                value={member.address || 'Not provided'} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DetailItem 
                                label="Bio" 
                                value={member.bio || 'No bio provided'} 
                                multiline
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Task Statistics Section */}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        mb: { xs: 3, sm: 4 },
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: { xs: 30, sm: 40 },
                            height: 3,
                            bgcolor: '#059669',
                            borderRadius: 1
                        }
                    }}
                >
                    Task Statistics
                </Typography>

                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 3 }} 
                    justifyContent="center"
                    sx={{ px: { xs: 1, sm: 2 } }}
                >
                    <StatCard
                        icon={<DelayedIcon />}
                        title="Delayed"
                        value={member.taskStatistics?.delayed || 0}
                        color="#d32f2f"
                        lightColor="#eff6ff"
                    />
                    <StatCard
                        icon={<OngoingIcon />}
                        title="Opened"
                        value={member.taskStatistics?.opened || 0}
                        color="#ed6c02"
                        lightColor="#eff6ff"
                    />
                    <StatCard
                        icon={<FrozenIcon />}
                        title="Frozen"
                        value={member.taskStatistics?.frozen || 0}
                        color="#1976D2"
                        lightColor="#eff6ff"
                    />
                    <StatCard
                        icon={<CompletedIcon />}
                        title="Completed"
                        value={member.taskStatistics?.completed || 0}
                        color="#059669"
                        lightColor="#eff6ff"
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

const DetailItem = ({ label, value, multiline }) => (
    <Box mb={multiline ? { xs: 2, sm: 3 } : { xs: 1.5, sm: 2 }}>
        <Typography
            variant="caption"
            color="text.secondary"
            textTransform="uppercase"
            fontWeight={500}
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
        >
            {label}
        </Typography>
        <Typography
            variant={multiline ? "body2" : "body1"}
            color="text.primary"
            sx={{
                mt: 0.5,
                lineHeight: multiline ? 1.6 : 1.4,
                whiteSpace: multiline ? 'pre-wrap' : 'normal',
                fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
        >
            {value}
        </Typography>
    </Box>
);

// Update StatCard component
const StatCard = ({ icon, title, value, color, lightColor }) => (
    <Paper
        elevation={0}
        sx={{
            p: { xs: 2, sm: 3 },
            width: { xs: '100%', sm: '180px', md: '200px' },
            bgcolor: lightColor,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: { xs: 2, sm: 3 },
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 16px ${color}15`,
                borderColor: color
            }
        }}
    >
        <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
            <Box 
                sx={{ 
                    color: color,
                    bgcolor: `${color}15`,
                    p: { xs: 0.75, sm: 1 },
                    borderRadius: { xs: 1.5, sm: 2 }
                }}
            >
                {React.cloneElement(icon, { 
                    sx: { fontSize: { xs: 24, sm: 28 } } 
                })}
            </Box>
            <Typography 
                variant="h3" 
                sx={{ 
                    color: color, 
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', sm: '2rem' }
                }}
            >
                {value}
            </Typography>
            <Typography 
                variant="body2" 
                sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: { xs: '0.75rem', sm: '0.813rem' }
                }}
            >
                {title}
            </Typography>
        </Stack>
    </Paper>
);

export default MemberDetailsDialog;