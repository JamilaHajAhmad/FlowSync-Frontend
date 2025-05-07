import React, { useState } from 'react';
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
import { 
    Warning as WarningIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { deleteAccount } from '../../../services/profileService';
import { handleLogout } from '../../../utils';

const DeleteAccountModal = ({ open, onClose }) => {
    const [password, setPassword] = useState('');
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
            
            const response = await deleteAccount(password, token);
            
            if (response.data?.success) {
                toast.success('Account deleted successfully');
                handleLogout();
            } else {
                throw new Error(response.data?.message || 'Failed to delete account');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete account';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
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
                    Delete Account
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
                
                <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!error}
                    disabled={loading}
                    sx={{ mt: 1 }}
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
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
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
                    Delete Account
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteAccountModal;