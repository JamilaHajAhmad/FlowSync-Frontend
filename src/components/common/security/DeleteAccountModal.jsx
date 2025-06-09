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

const DeleteAccountModal = ({ open, onClose }) => {
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            onClose();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={() => !loading && onClose()}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ 
                bgcolor: 'error.lighter', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
            }}>
                <WarningIcon color="error" />
                <Typography color="error.main" fontWeight="bold">
                    Deactivate Account
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Typography variant="body1" paragraph>
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
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleTogglePasswordVisibility}
                                    edge="end"
                                    disabled={loading}
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                    sx={{ mb: 2, mt: 2 }}
                    placeholder="Please tell us why you're deactivating your account..."
                />
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{ color: 'text.secondary' }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteAccount}
                    disabled={!password || loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    Deactivate Account
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteAccountModal;