import { useState } from "react";
import { Box, Button, Paper, TextField, Typography, LinearProgress, CssBaseline, InputAdornment, IconButton } from "@mui/material";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import { motion as Motion } from "framer-motion";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { Typewriter } from 'react-simple-typewriter';
import zxcvbn from 'zxcvbn';
import logo from "../../assets/images/logo.png";

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
    backgroundColor: theme.palette.grey[ 200 ],
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

const ChangePW = () => {
    const [ formData, setFormData ] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [ showPassword, setShowPassword ] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [ strength, setStrength ] = useState(0);
    const [ error, setError ] = useState("");
    const [ passwordMatch, setPasswordMatch ] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [ name ]: value }));
        setError("");

        if (name === 'newPassword') {
            const result = zxcvbn(value);
            setStrength(result.score);
            // Check password match when new password changes
            setPasswordMatch(value === formData.confirmNewPassword);
        }

        if (name === 'confirmNewPassword') {
            // Check password match when confirm password changes
            setPasswordMatch(value === formData.newPassword);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError("Passwords do not match");
            return;
        }
        // Add API call logic here
        console.log("Password changed:", formData);
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [ field ]: !prev[ field ] }));
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
                p: 3,
                backgroundColor: 'background.default'
            }}>
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={1}
                        sx={{
                            width: { xs: '100%', sm: 450 },
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <img src={logo} alt="FlowSync Logo" style={{ height: 50 }} />
                        </Box>

                        <Box textAlign="center">
                            <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                                Change Password
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <Typewriter
                                    words={[ 'Keep your account secure by updating your password regularly' ]}
                                    cursor={false}
                                    typeSpeed={50}
                                    loop={1}
                                />
                            </Typography>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            <Box display="flex" flexDirection="column" gap={2}>
                                {[
                                    { name: 'currentPassword', label: 'Current Password', show: showPassword.current, field: 'current' },
                                    { name: 'newPassword', label: 'New Password', show: showPassword.new, field: 'new' },
                                    {
                                        name: 'confirmNewPassword',
                                        label: 'Confirm Password',
                                        show: showPassword.confirm,
                                        field: 'confirm',
                                        error: !passwordMatch && formData.confirmNewPassword.length > 0,
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderColor: (!passwordMatch && formData.confirmNewPassword) ? 'error.main' : undefined,
                                            }
                                        }
                                    }
                                ].map((field) => (
                                    <StyledTextField
                                        key={field.name}
                                        fullWidth
                                        name={field.name}
                                        label={field.label}
                                        type={field.show ? 'text' : 'password'}
                                        value={formData[ field.name ]}
                                        onChange={handleChange}
                                        required
                                        error={field.error}
                                        sx={field.sx}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock
                                                        size={20}
                                                        color={
                                                            field.name === 'confirmNewPassword' && !passwordMatch && formData.confirmNewPassword.length > 0
                                                                ? '#EF4444'  // red color for error
                                                                : theme.palette.primary.main
                                                        }
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
                                        isError={field.error}
                                    />
                                ))}

                                {formData.newPassword && (
                                    <Box>
                                        <PasswordStrengthBar
                                            variant="determinate"
                                            value={(strength + 1) * 20}
                                            strength={strength}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
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

                                {!passwordMatch && formData.confirmNewPassword && (
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mt: 1
                                        }}
                                    >
                                        <AlertCircle size={16} />
                                        Passwords do not match
                                    </Typography>
                                )}

                                {error && (
                                    <Typography
                                        color="error"
                                        variant="body2"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </Typography>
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
                                        sx={{
                                            mt: 2,
                                            height: 48,
                                            textTransform: 'none',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Update Password
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