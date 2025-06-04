import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Alert
} from '@mui/material';
import { People as TeamIcon, Close as CloseIcon } from '@mui/icons-material';

export default function TeamMessageDialog({ open, onClose, onSend }) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

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
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
            }}>
                <TeamIcon />
                <Typography variant="h6" component="span">
                    Send Message to All Team Members
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{ 
                        ml: 'auto',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    This message will be sent to all team members.
                </Alert>
                
                <TextField
                    autoFocus
                    fullWidth
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message to the team..."
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'grey.50'
                        }
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onClose}
                    disabled={sending}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSend}
                    variant="contained"
                    disabled={!message.trim() || sending}
                    startIcon={<TeamIcon />}
                >
                    {sending ? 'Sending...' : 'Send to Team'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}