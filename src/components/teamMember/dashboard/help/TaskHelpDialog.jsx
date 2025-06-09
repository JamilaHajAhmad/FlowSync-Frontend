import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    IconButton, 
    Typography, 
    Box, 
    Button
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
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: 'background.default'
                }
            }}
        >
            <DialogTitle sx={{ 
                m: 0, 
                p: 2, 
                background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)', 
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HelpIcon />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Task Board Help Guide
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: 'inherit' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Drag and Drop Rules:
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                        • Tasks can be dragged between columns based on these rules:
                    </Typography>
                    <Box sx={{ 
                        pl: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        mt: 2 
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
                                    alignItems: 'center',
                                    gap: 1,
                                    bgcolor: 'background.paper',
                                    p: 1.5,
                                    borderRadius: 1,
                                    boxShadow: 1
                                }}
                            >
                                {rule.icon}
                                <Box>
                                    <Typography variant="body2" color="text.primary">
                                        {rule.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom>
                    How to Use:
                </Typography>
                <Box sx={{ 
                    mb: 3,
                    bgcolor: 'background.paper',
                    p: 2,
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
                                alignItems: 'center',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Box 
                                sx={{ 
                                    minWidth: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}
                            >
                                {index + 1}
                            </Box>
                            {step}
                        </Typography>
                    ))}
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Demo Video:
                </Typography>
                <Box sx={{ 
                    position: 'relative',
                    paddingTop: '56.25%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 2
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

            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={onClose}
                    variant="contained"
                    sx={{ 
                        background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
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