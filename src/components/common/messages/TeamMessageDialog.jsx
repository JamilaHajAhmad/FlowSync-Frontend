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
    useMediaQuery,
    Box,
    Popover
} from '@mui/material';
import { 
    People as TeamIcon, 
    Close as CloseIcon,
    EmojiEmotions as EmojiIcon 
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';

export default function TeamMessageDialog({ open, onClose, onSend }) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleEmojiClick = (emojiData) => {
        setMessage(prev => prev + emojiData.emoji);
        setAnchorEl(null);
    };

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
                
                <Box sx={{ 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1 
                }}>
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
                    <IconButton
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            bottom: 8,
                            color: 'text.secondary'
                        }}
                    >
                        <EmojiIcon />
                    </IconButton>

                    <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        sx={{
                            '& .EmojiPickerReact': {
                                '--epr-bg-color': theme.palette.background.paper,
                                '--epr-category-label-bg-color': theme.palette.background.paper,
                                '--epr-hover-bg-color': theme.palette.action.hover,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[3],
                            }
                        }}
                    >
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            width={isMobile ? 300 : 350}
                            height={400}
                        />
                    </Popover>
                </Box>
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