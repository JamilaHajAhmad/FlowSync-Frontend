import React from "react";
import { useState } from "react";
import { Box, Button, Paper, TextField, Typography, LinearProgress, CssBaseline, InputAdornment, IconButton } from "@mui/material";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import { motion as Motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Typewriter } from 'react-simple-typewriter';
import zxcvbn from 'zxcvbn';
import logo from "../../assets/images/logo.png";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { decodeToken } from '../../utils';
import { ArrowBack } from '@mui/icons-material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#059669',
            light: '#10B981',
            dark: '#047857',
        },
        background: {
            default: '#F9FAFB',
            paper: '#FFFFFF',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        "none",
        "0px 4px 20px rgba(0, 0, 0, 0.05)",
        // ...rest of shadows
    ],
});

const PasswordStrengthBar = styled(LinearProgress)(({ theme, strength }) => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
        backgroundColor:
            strength === 0 ? '#EF4444' :
                strength === 1 ? '#F59E0B' :
                    strength === 2 ? '#10B981' :
                        strength === 3 ? '#059669' :
                            '#047857',
        transition: 'all 0.3s ease',
    },
}));

const StyledTextField = styled(TextField)(({ theme, isError }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        transition: 'all 0.3s ease',
        '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isError ? theme.palette.error.main : theme.palette.primary.light,
            }
        },
        '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isError ? theme.palette.error.main : theme.palette.primary.main,
                borderWidth: 2,
            }
        },
        // Add error state styling
        ...(isError && {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.error.main,
            },
        })
    },
    '& .MuiInputLabel-root': {
        '&.Mui-focused': {
            color: isError ? theme.palette.error.main : theme.palette.primary.main,
        }
    }
}));

const validationSchema = Yup.object({
    currentPassword: Yup.string()
        .required('Current password is required'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password'),
    confirmNewPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
});

const ChangePW = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [strength, setStrength] = useState(0);

    const handleBack = () => {
        navigate('/profile');
    };

    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    toast.error('Authentication token not found');
                    navigate('/login');
                    return;
                }

                // Decode token to get user information
                const decodedToken = decodeToken(token);
                if (!decodedToken) {
                    toast.error('Invalid authentication token');
                    navigate('/login');
                    return;
                }

                const response = await axios.post(
                    'https://localhost:49798/change-password',
                    {
                        currentPassword: values.currentPassword,
                        newPassword: values.newPassword,
                        confirmPassword: values.confirmNewPassword
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 200) {
                    toast.success('Password updated successfully!');
                    formik.resetForm();
                    // Use role from decoded token for navigation
                    const redirectPath = decodedToken.role.includes('Leader') ? '/leader-dashboard' : '/member-dashboard';
                    navigate(redirectPath);
                }
            } catch (error) {
                console.error('Error updating password:', error);
                const errorMessage = error.response.data || 'Failed to update password';
                toast.error(errorMessage);
            } finally {
                setSubmitting(false);
            }
        }
    });

    React.useEffect(() => {
        if (formik.values.newPassword) {
            const result = zxcvbn(formik.values.newPassword);
            setStrength(result.score);
        }
    }, [formik.values.newPassword]);

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3 }, // Responsive padding
                backgroundColor: 'background.default',
                position: 'relative'
            }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{
                        position: { xs: 'static', md: 'absolute' },
                        top: { md: 24 },
                        left: { md: 24 },
                        mb: { xs: 2, md: 0 },
                        width: { xs: '100%', md: 'auto' },
                        color: '#064e3b',
                        '&:hover': { bgcolor: '#ecfdf5' },
                        textTransform: 'capitalize',
                        fontWeight: 500
                    }}
                >
                    Back to Profile
                </Button>

                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={1}
                        sx={{
                            width: { xs: '100%', sm: 450 },
                            p: { xs: 3, sm: 4 }, // Responsive padding
                            display: 'flex',
                            flexDirection: 'column',
                            gap: { xs: 2, sm: 3 }, // Responsive gap
                            mx: { xs: 2, sm: 0 } // Add margin on mobile
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <img 
                                src={logo} 
                                alt="FlowSync Logo" 
                                style={{ 
                                    height: 'clamp(40px, 8vw, 50px)',
                                    width: 'auto'
                                }} 
                            />
                        </Box>

                        <Box textAlign="center">
                            <Typography 
                                variant="h5" 
                                fontWeight="bold" 
                                color="primary.main" 
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                }}
                            >
                                Change Password
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    px: { xs: 1, sm: 0 }
                                }}
                            >
                                <Typewriter
                                    words={['Keep your account secure by updating your password regularly']}
                                    cursor={false}
                                    typeSpeed={50}
                                    loop={1}
                                />
                            </Typography>
                        </Box>

                        <form onSubmit={formik.handleSubmit}>
                            <Box 
                                display="flex" 
                                flexDirection="column" 
                                gap={{ xs: 1.5, sm: 2 }}
                            >
                                {[
                                    {
                                        name: 'currentPassword',
                                        label: 'Current Password',
                                        show: showPassword.current,
                                        field: 'current'
                                    },
                                    {
                                        name: 'newPassword',
                                        label: 'New Password',
                                        show: showPassword.new,
                                        field: 'new'
                                    },
                                    {
                                        name: 'confirmNewPassword',
                                        label: 'Confirm Password',
                                        show: showPassword.confirm,
                                        field: 'confirm'
                                    }
                                ].map((field) => (
                                    <StyledTextField
                                        key={field.name}
                                        fullWidth
                                        name={field.name}
                                        label={field.label}
                                        type={field.show ? 'text' : 'password'}
                                        value={formik.values[field.name]}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
                                        helperText={formik.touched[field.name] && formik.errors[field.name]}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock
                                                        size={20}
                                                        color={formik.touched[field.name] && formik.errors[field.name]
                                                            ? '#EF4444'
                                                            : theme.palette.primary.main}
                                                    />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => togglePasswordVisibility(field.field)}
                                                        edge="end"
                                                    >
                                                        {field.show ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                                padding: { xs: '12px 14px', sm: '16.5px 14px' }
                                            },
                                            '& .MuiInputLabel-root': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }
                                        }}
                                    />
                                ))}

                                {formik.values.newPassword && (
                                    <Box sx={{ px: { xs: 1, sm: 0 } }}>
                                        <PasswordStrengthBar
                                            variant="determinate"
                                            value={(strength + 1) * 20}
                                            strength={strength}
                                        />
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary" 
                                            sx={{ 
                                                mt: 0.5,
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                            }}
                                        >
                                            Password strength: {
                                                strength === 0 ? 'Very Weak' :
                                                    strength === 1 ? 'Weak' :
                                                        strength === 2 ? 'Fair' :
                                                            strength === 3 ? 'Strong' :
                                                                'Very Strong'
                                            }
                                        </Typography>
                                    </Box>
                                )}

                                <Motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={formik.isSubmitting || !formik.isValid}
                                        sx={{
                                            mt: { xs: 1, sm: 2 },
                                            height: { xs: 42, sm: 48 },
                                            textTransform: 'none',
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
                                    >
                                        {formik.isSubmitting ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </Motion.div>
                            </Box>
                        </form>
                    </Paper>
                </Motion.div>
            </Box>
        </ThemeProvider>
    );
};

export default ChangePW;