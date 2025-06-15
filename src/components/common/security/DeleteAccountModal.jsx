import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
    Warning as WarningIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { deleteAccount } from '../../../services/profileService';
import { handleLogout } from '../../../utils';
import AdminCredentialsDialog from '../../teamLeader/dashboard/components/AdminCredentialsDialog';
import { decodeToken } from '../../../utils';

const StyledTextField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#e5e7eb',
        },
        '&:hover fieldset': {
            borderColor: '#10B981',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#059669 !important',
            borderWidth: '2px'
        }
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#059669'
    }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '90%',
        maxWidth: 500,
        margin: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            margin: theme.spacing(1),
            width: 'calc(100% - 16px)'
        }
    }
}));

const DeleteAccountModal = ({ open, onClose }) => {
    const role = decodeToken(localStorage.getItem('authToken')).role;
    const user = JSON.parse(localStorage.getItem('user'));
    const [showCredentials, setShowCredentials] = useState(role === 'Leader');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Add admin credentials (these would come from your backend in production)
    const adminCredentials = {
        email: "admin@dubaipolice.gov.ae",
        password: "Admin123*",
    };

    const firstName = user.displayName.split(' ')[0];
    const lastName = user.displayName.split(' ').slice(1).join(' ');

    const handleCredentialsConfirm = () => {
        setShowCredentials(false);
        setShowDeleteModal(true);
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
        onClose();
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleDeleteAccount = async () => {
        if (!password) {
            setError('Password is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('authToken');
            
            const response = await deleteAccount(password, reason, token);
            
            if (response.data.status === 200) {
                toast.success(response.data.detail);
                handleLogout();
            }
            else {
                const errorMessage = response.data.detail || response.data || 'Failed to deactivate account';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            console.error('Error deactivating account:', err);
            const errorMessage = err.response.data.detail || err.response.data || 'Failed to deactivate account';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            handleDeleteModalClose();
        }
    };

    return (
        <>
            {role === 'Leader' && showCredentials && (
                <AdminCredentialsDialog
                    open={open}
                    onClose={onClose}
                    onConfirm={handleCredentialsConfirm}
                    profileData={{firstName, lastName}}
                    adminCredentials={adminCredentials}
                />
            )}
            
            <StyledDialog 
                open={(!showCredentials && open) || showDeleteModal}
                onClose={() => !loading && handleDeleteModalClose()}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ 
                    bgcolor: 'error.lighter', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 2, sm: 3 }
                }}>
                    <WarningIcon 
                        color="error" 
                        sx={{ 
                            fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                        }} 
                    />
                    <Typography 
                        color="error.main" 
                        fontWeight="bold"
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        Deactivate Account
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ 
                    mt: 2,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 }
                }}>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 2,
                                '& .MuiAlert-message': {
                                    fontSize: { xs: '0.813rem', sm: '0.875rem' }
                            }
                        }}
                    >
                        {error}
                    </Alert>
                    )}
                    
                    <Typography 
                        variant="body1" 
                        paragraph
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            mb: { xs: 1.5, sm: 2 }
                        }}
                    >
                        This action cannot be undone. Please enter your password to confirm.
                    </Typography>

                    <StyledTextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error}
                        disabled={loading}
                        sx={{
                            mb: { xs: 1.5, sm: 2 },
                            '& .MuiInputBase-input': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                        disabled={loading}
                                        sx={{
                                            padding: { xs: '4px', sm: '8px' }
                                        }}
                                    >
                                        {showPassword ? 
                                            <VisibilityOffIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} /> : 
                                            <VisibilityIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                                        }
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <StyledTextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason (Optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={loading}
                        sx={{
                            mb: { xs: 1.5, sm: 2 },
                            '& .MuiInputBase-input': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }
                        }}
                        placeholder="Please tell us why you're deactivating your account..."
                    />
                </DialogContent>

                <DialogActions sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    pt: 0,
                    gap: { xs: 1, sm: 2 }
                }}>
                    <Button
                        onClick={handleDeleteModalClose}
                        disabled={loading}
                        sx={{ 
                            color: 'text.secondary',
                            fontSize: { xs: '0.813rem', sm: '0.875rem' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteAccount}
                        disabled={!password || loading}
                        startIcon={loading && 
                            <CircularProgress 
                                size={16} 
                                sx={{ 
                                    mr: { xs: 0.5, sm: 1 } 
                            }} 
                        />
                        }
                        sx={{
                            fontSize: { xs: '0.813rem', sm: '0.875rem' },
                            py: { xs: 0.75, sm: 1 }
                        }}
                    >
                        Deactivate Account
                    </Button>
                </DialogActions>
            </StyledDialog>
        </>
    );
};

export default DeleteAccountModal;