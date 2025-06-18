import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    IconButton,
    Paper,
    Tooltip,
    Fade,
    CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
            borderColor: '#10B981',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#059669',
        }
    },
    // Add these styles to change the label and input text color when focused
    '& label.Mui-focused': {
        color: '#059669',
    },
}));

const CredentialsBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: '#f1f5f9',
    borderRadius: theme.spacing(1),
    border: '1px dashed #94a3b8',
    marginTop: theme.spacing(2),
    position: 'relative'
}));

const AdminCredentialsDialog = ({ 
    open, 
    onClose, 
    onConfirm, 
    profileData, 
    newStatus, // Optional - only used for status changes
    adminCredentials
}) => {
    const [step, setStep] = useState(1);
    const [nameVerification, setNameVerification] = useState({
        firstName: '',
        lastName: ''
    });
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Add loading state

    const handleVerification = () => {
        setLoading(true);
        setTimeout(() => {
            if (nameVerification.firstName.trim().toLowerCase() === profileData.firstName.toLowerCase() &&
                nameVerification.lastName.trim().toLowerCase() === profileData.lastName.toLowerCase()) {
                setStep(2);
                setError(null);
            } else {
                setError('Names do not match your profile information');
            }
            setLoading(false);
        }, 500); // Add small delay for better UX
    };

    const handleCopyCredentials = () => {
        const credentialsText = `Admin Email: ${adminCredentials.email}\nAdmin Password: ${adminCredentials.password}`;
        navigator.clipboard.writeText(credentialsText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleConfirm = () => {
        setLoading(true);
        setTimeout(() => {
            onConfirm();
            onClose();
        }, 500);
    };

    // Get status display text
    const getStatusText = () => {
        switch(newStatus) {
            case 'Temporarily_Leave':
                return 'temporary leave';
            case 'Annually_Leave':
                return 'annual leave';
            default:
                return 'leave';
        }
    };

    // Get dialog content based on context
    const getDialogContent = () => {
        if (newStatus) {
            return `For security purposes, please verify your identity before proceeding with your ${getStatusText()} request.`;
        }
        return 'For security purposes, please verify your identity before deactivating your account.';
    };

    // Get warning message based on context
    const getWarningMessage = () => {
        if (newStatus) {
            return (
                <>
                    <strong>Important:</strong> These admin credentials will be shown only once. 
                    Please copy and store them in a secure location. You will need these to access
                    the system during your {getStatusText()}.
                </>
            );
        }
        return (
            <>
                <strong>Important:</strong> These admin credentials will be shown only once. 
                Please copy and store them in a secure location. Another leader will need these 
                to access the system after your account is deactivated.
            </>
        );
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: { xs: 1, sm: 2 },
                    p: { xs: 2, sm: 3 }
                }
            }}
        >
            <DialogTitle sx={{ 
                pb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
                {step === 1 ? 'Verify Your Identity' : 'Your Admin Credentials'}
            </DialogTitle>

            <DialogContent>
                {step === 1 ? (
                    <>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            {getDialogContent()}
                        </Typography>

                        {error && (
                            <Alert 
                                severity="error" 
                                sx={{ mb: 2 }}
                                onClose={() => setError(null)}
                            >
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <StyledTextField
                                fullWidth
                                label="First Name"
                                value={nameVerification.firstName}
                                onChange={(e) => setNameVerification(prev => ({
                                    ...prev,
                                    firstName: e.target.value
                                }))}
                            />
                            <StyledTextField
                                fullWidthDialogContent
                                label="Last Name"
                                value={nameVerification.lastName}
                                onChange={(e) => setNameVerification(prev => ({
                                    ...prev,
                                    lastName: e.target.value
                                }))}
                            />
                        </Box>
                    </>
                ) : (
                    <>
                        <Alert 
                            severity="warning" 
                            icon={<WarningIcon />}
                            sx={{ mb: 3 }}
                        >
                            <Typography variant="body2">
                                {getWarningMessage()}
                            </Typography>
                        </Alert>

                        <CredentialsBox>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}>
                                <Box>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            mb: 1,
                                            fontFamily: 'monospace',
                                            fontWeight: 500
                                        }}
                                    >
                                        Admin Email: <strong>{adminCredentials.email}</strong>
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontFamily: 'monospace',
                                            fontWeight: 500
                                        }}
                                    >
                                        Admin Password: <strong>{adminCredentials.password}</strong>
                                    </Typography>
                                </Box>
                                <Tooltip 
                                    title={copied ? "Copied!" : "Copy credentials"} 
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                >
                                    <IconButton
                                        onClick={handleCopyCredentials}
                                        sx={{
                                            bgcolor: copied ? '#059669' : 'transparent',
                                            color: copied ? 'white' : '#059669',
                                            '&:hover': {
                                                bgcolor: copied ? '#047857' : 'rgba(5, 150, 105, 0.04)'
                                            }
                                        }}
                                    >
                                        {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </CredentialsBox>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ 
                pt: 3,
                gap: 1
            }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{
                        borderColor: '#10B981',
                        color: '#059669',
                        '&:hover': {
                            borderColor: '#059669',
                            bgcolor: 'rgba(5, 150, 105, 0.04)'
                        }
                    }}
                >
                    Cancel
                </Button>
                {step === 1 ? (
                    <Button
                        onClick={handleVerification}
                        variant="contained"
                        disabled={!nameVerification.firstName || !nameVerification.lastName || loading}
                        sx={{
                            bgcolor: '#059669',
                            '&:hover': { bgcolor: '#047857' },
                            minWidth: 120,
                            '&.Mui-disabled': {
                                bgcolor: 'rgba(5, 150, 105, 0.12)',
                                color: 'rgba(5, 150, 105, 0.26)'
                            }
                        }}
                    >
                        {loading ? (
                            <CircularProgress 
                                size={24} 
                                sx={{ 
                                    color: 'inherit',
                                    '& .MuiCircularProgress-circle': {
                                        color: loading ? 'rgba(255, 255, 255, 0.7)' : '#fff'
                                    }
                                }} 
                            />
                        ) : (
                            'Verify & Continue'
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        disabled={!copied || loading}
                        sx={{
                            bgcolor: '#059669',
                            '&:hover': { bgcolor: '#047857' },
                            minWidth: 120
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Confirm'
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default AdminCredentialsDialog;