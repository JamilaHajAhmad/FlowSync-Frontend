import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    IconButton,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { People as TeamIcon, Close as CloseIcon } from '@mui/icons-material';

export default function TeamMessageDialog({ open, onClose, onSend }) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSend = async () => {
        if (!message.trim()) return;
        
        setSending(true);
        try {
            await onSend(message);
            setMessage('');
            onClose();
        } catch (error) {
            console.error('Failed to send team message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    m: isMobile ? 0 : 2,
                    borderRadius: isMobile ? 0 : 2
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    p: { xs: 1.5, sm: 2 },
                    minHeight: { xs: 56, sm: 64 }
                }}
            >
                <TeamIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography 
                    variant="h6" 
                    component="span"
                    sx={{
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        fontWeight: 600
                    }}
                >
                    Send Message to All Team Members
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{ 
                        ml: 'auto',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'primary.dark' },
                        padding: { xs: 1, sm: 1.5 }
                    }}
                >
                    <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ 
                mt: { xs: 1, sm: 2 },
                p: { xs: 1.5, sm: 2 }
            }}>
                <Alert 
                    severity="info" 
                    sx={{ 
                        mb: { xs: 1.5, sm: 2 },
                        '& .MuiAlert-message': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                    }}
                >
                    This message will be sent to all team members.
                </Alert>
                
                <TextField
                    autoFocus
                    fullWidth
                    multiline
                    rows={isMobile ? 6 : 4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message to the team..."
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'grey.50',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                pt: 0,
                mt: { xs: -1, sm: -1 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 1 }
            }}>
                <Button
                    onClick={onClose}
                    disabled={sending}
                    fullWidth={isMobile}
                    sx={{
                        order: { xs: 2, sm: 1 },
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSend}
                    variant="contained"
                    disabled={!message.trim() || sending}
                    startIcon={<TeamIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />}
                    fullWidth={isMobile}
                    sx={{
                        order: { xs: 1, sm: 2 },
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                >
                    {sending ? 'Sending...' : 'Send to Team'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}