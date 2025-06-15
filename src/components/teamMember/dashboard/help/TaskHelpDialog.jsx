import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    IconButton, 
    Typography, 
    Box, 
    Button,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Close as CloseIcon,
    HelpOutline as HelpIcon,
    ErrorOutline as ErrorIcon,
    CheckCircle as CompletedIcon,
    PauseCircle as FrozenIcon,
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import { RotateLeft as OpenedIcon } from '@mui/icons-material';

const TaskHelpDialog = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile} // Full screen on mobile for better UX
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : 2,
                    bgcolor: 'background.default',
                    margin: isMobile ? 0 : theme.spacing(2),
                    maxHeight: isMobile ? '100vh' : '90vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                m: 0, 
                p: isMobile ? theme.spacing(1.5, 2) : theme.spacing(2), 
                background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)', 
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? 0.5 : 1,
                    minWidth: 0, // Allow text to shrink
                    flex: 1
                }}>
                    <HelpIcon sx={{ 
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        flexShrink: 0 
                    }} />
                    <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        sx={{ 
                            fontWeight: 600,
                            fontSize: isMobile ? '1.1rem' : '1.25rem',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: isMobile ? 'nowrap' : 'normal'
                        }}
                    >
                        Task Board Help Guide
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ 
                        color: 'inherit',
                        p: isMobile ? 0.5 : 1,
                        ml: 1
                    }}
                >
                    <CloseIcon sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ 
                mt: isMobile ? 1 : 2,
                p: isMobile ? theme.spacing(1, 2) : theme.spacing(0, 3, 0, 3),
                overflow: 'auto'
            }}>
                <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    gutterBottom
                    sx={{ 
                        fontSize: isMobile ? '1.1rem' : '1.25rem',
                        fontWeight: 600,
                        mb: isMobile ? 1.5 : 2
                    }}
                >
                    Drag and Drop Rules:
                </Typography>
                <Box sx={{ mb: isMobile ? 2 : 3 }}>
                    <Typography 
                        variant="body1" 
                        gutterBottom
                        sx={{ 
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            mb: isMobile ? 1 : 1.5
                        }}
                    >
                        • Tasks can be dragged between columns based on these rules:
                    </Typography>
                    <Box sx={{ 
                        pl: isMobile ? 1 : 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? 1 : 1.5,
                        mt: isMobile ? 1 : 2 
                    }}>
                        {[
                            {
                                icon: <OpenedIcon sx={{ color: '#ed6c02' }} />,
                                text: 'Opened tasks can be moved to Frozen or Completed'
                            },
                            {
                                icon: <FrozenIcon sx={{ color: '#1976D2' }} />,
                                text: 'Frozen tasks can only be moved back to Opened'
                            },
                            {
                                icon: <ErrorIcon sx={{ color: '#d32f2f' }} />,
                                text: 'Delayed tasks can only be moved to Completed'
                            },
                            {
                                icon: <CompletedIcon sx={{ color: '#059669' }} />,
                                text: 'Completed tasks cannot be moved'
                            }
                        ].map((rule, index) => (
                            <Box 
                                key={index}
                                sx={{ 
                                    display: 'flex',
                                    alignItems: isMobile ? 'flex-start' : 'center',
                                    gap: isMobile ? 0.75 : 1,
                                    bgcolor: 'background.paper',
                                    p: isMobile ? theme.spacing(1, 1.25) : theme.spacing(1.5),
                                    borderRadius: 1,
                                    boxShadow: 1
                                }}
                            >
                                <Box sx={{ 
                                    mt: isMobile ? 0.25 : 0,
                                    flexShrink: 0,
                                    '& svg': {
                                        fontSize: isMobile ? '1.25rem' : '1.5rem'
                                    }
                                }}>
                                    {rule.icon}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography 
                                        variant="body2" 
                                        color="text.primary"
                                        sx={{ 
                                            fontSize: isMobile ? '0.85rem' : '0.9rem',
                                            lineHeight: isMobile ? 1.3 : 1.4
                                        }}
                                    >
                                        {rule.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    gutterBottom
                    sx={{ 
                        fontSize: isMobile ? '1.1rem' : '1.25rem',
                        fontWeight: 600,
                        mb: isMobile ? 1.5 : 2
                    }}
                >
                    How to Use:
                </Typography>
                <Box sx={{ 
                    mb: isMobile ? 2 : 3,
                    bgcolor: 'background.paper',
                    p: isMobile ? theme.spacing(1.5) : theme.spacing(2),
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    {[
                        'Click and hold the drag handle (⋮⋮) on any task card',
                        'Drag the task to the desired column',
                        'Complete any required forms when prompted'
                    ].map((step, index) => (
                        <Typography 
                            key={index}
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                display: 'flex',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: isMobile ? 0.75 : 1,
                                mb: index < 2 ? (isMobile ? 1 : 1.5) : 0,
                                fontSize: isMobile ? '0.85rem' : '0.9rem',
                                lineHeight: isMobile ? 1.3 : 1.4
                            }}
                        >
                            <Box 
                                sx={{ 
                                    minWidth: isMobile ? '20px' : '24px',
                                    height: isMobile ? '20px' : '24px',
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    fontWeight: 600,
                                    flexShrink: 0,
                                    mt: isMobile ? 0.25 : 0
                                }}
                            >
                                {index + 1}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                {step}
                            </Box>
                        </Typography>
                    ))}
                </Box>

                <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    gutterBottom 
                    sx={{ 
                        mt: isMobile ? 2 : 3,
                        fontSize: isMobile ? '1.1rem' : '1.25rem',
                        fontWeight: 600,
                        mb: isMobile ? 1.5 : 2
                    }}
                >
                    Demo Video:
                </Typography>
                <Box sx={{ 
                    position: 'relative',
                    paddingTop: '56.25%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 2,
                    mb: isMobile ? 2 : 0
                }}>
                    <ReactPlayer
                        url="/videos/drag-drop-demo.mp4"
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={false}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                        config={{
                            file: {
                                attributes: {
                                    controlsList: 'download',
                                    disablePictureInPicture: true
                                },
                                forceVideo: true
                            }
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ 
                p: isMobile ? theme.spacing(1.5, 2, 2, 2) : theme.spacing(2),
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 0
            }}>
                <Button 
                    onClick={onClose}
                    variant="contained"
                    fullWidth={isMobile}
                    sx={{ 
                        background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
                        fontSize: isMobile ? '0.9rem' : '0.875rem',
                        py: isMobile ? 1.25 : 0.75,
                        minHeight: isMobile ? '44px' : 'auto', // Touch-friendly on mobile
                        '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskHelpDialog;