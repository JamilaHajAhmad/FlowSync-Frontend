import React, { useState } from "react";
import { Box, TextField, Button, Typography, Avatar, Select, MenuItem, Grid, Paper, IconButton, CssBaseline, FormControl, InputLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { styled, ThemeProvider } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';
import { useTheme } from '@mui/material';

// Custom styled components
const StyledTextField = styled(TextField)(() => ({
    '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
            borderColor: '#10B981',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#059669',
            borderWidth: 2
        }
    },
    '& .MuiInputLabel-root': {
        '&.MuiInputLabel-shrink': {
            backgroundColor: '#ffffff',
            padding: '0 8px',
            transform: 'translate(14px, -9px) scale(0.75)',
        },
        '&.Mui-focused': {
            color: '#059669',
        }
    }
}));

const StyledSelect = styled(Select)(() => ({
    '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: '8px',
        borderColor: '#e5e7eb',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#10B981',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#059669',
        borderWidth: 2
    },
    '& .MuiSelect-select': {
        padding: '16.5px 14px',
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    background: theme.palette.mode === 'dark' ? '#1F2937' : '#ffffff',
}));

const EditProfile = () => {
    const [formData, setFormData] = useState({
        firstName: "Charlene",
        lastName: "Reed",
        email: "charlenereed@gmail.com",
        dateOfBirth: "1990-01-25",
        address: "San Jose, California",
        bio: "Passionate developer and tech enthusiast.",
        phone: "+1 123 456 7890",
        major: "Computer Science",
        status: "On Duty"
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form Data:', formData);
    };

    const theme = useTheme();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
                maxWidth: 900,
                margin: "auto",
                padding: 4,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
            }}>
                {/* Logo & Title */}
                <Box display="flex" alignItems="center" position="relative" left="-200px">
                    <img src={logo} alt="FlowSync Logo" style={{ height: 40, marginRight: 10 }} />
                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold' }}>
                        FlowSync
                    </Typography>
                </Box>

                {/* Profile Edit Section */}
                <StyledPaper elevation={0}>
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 4,
                            mt: -4,
                            background: 'linear-gradient(45deg, #064E3B 30%, #059669 90%)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 'bold'
                        }}
                    >
                        Edit Profile
                    </Typography>

                    <Box display="flex" alignItems="center" gap={3} mb={4}>
                        {/* Profile Avatar */}
                        <Box sx={{ position: 'relative', top: -200, left: -30 }}>
                            <Avatar
                                src="/profile.jpg"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: '4px solid #059669',
                                    boxShadow: '0 0 15px rgba(5,150,105,0.3)',
                                }}
                            />
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: '#059669',
                                    '&:hover': {
                                        bgcolor: '#047857'
                                    },
                                    color: '#fff'
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Box>

                        {/* Profile Form */}
                        <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
                            <Grid container spacing={3}>
                                {/* First Name */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Last Name */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Email */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Date of Birth */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Address */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your address"
                                        InputLabelProps={{ 
                                            shrink: true,
                                            sx: {
                                                bgcolor: 'background.paper'
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Phone */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone"
                                        InputLabelProps={{ 
                                            shrink: true,
                                            sx: {
                                                bgcolor: 'background.paper'
                                            }
                                        }}
                                    />
                                </Grid>

                               
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Major"
                                        name="major"
                                        type="text"
                                        value={formData.major}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Status Select */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel
                                            id="status-label"
                                            sx={{
                                                bgcolor: 'background.paper',
                                                px: 1,
                                                '&.MuiInputLabel-shrink': {
                                                    transform: 'translate(14px, -9px) scale(0.75)',
                                                },
                                                '&.Mui-focused': {
                                                    color: '#059669',
                                                },
                                                color: '#374151',
                                            }}
                                        >
                                            Status
                                        </InputLabel>
                                        <StyledSelect
                                            labelId="status-label"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            label="Status"
                                        >
                                            <MenuItem value="On Duty">On Duty</MenuItem>
                                            <MenuItem value="Temporarily Leave">Temporarily Leave</MenuItem>
                                            <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                                        </StyledSelect>
                                    </FormControl>
                                </Grid>
                                 {/* Bio (Full Width) */}
                                 <Grid item xs={12}>
                                    <StyledTextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Write about yourself..."
                                        InputLabelProps={{ 
                                            shrink: true,
                                            sx: {
                                                bgcolor: 'background.paper'
                                            }
                                        }}
                                    />
                                </Grid>

                            </Grid>

                            {/* Save Button */}
                            <Box mt={4} textAlign="right">
                                <Button type="submit" variant="contained" size="large" sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
                                    Save Changes
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </StyledPaper>
            </Box>
        </ThemeProvider>
    );
};

export default EditProfile;
