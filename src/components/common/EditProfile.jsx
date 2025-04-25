import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Avatar, Select, MenuItem, Grid, Paper, IconButton, CssBaseline, FormControl, InputLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { styled, ThemeProvider } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';
import { useTheme } from '@mui/material';
import { getProfile, updateProfile } from "../../services/profileService";
import { toast } from "react-toastify";
import { useFormik } from 'formik';
import * as Yup from 'yup';

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

const validationSchema = Yup.object({
    firstName: Yup.string()
        .min(3, 'First name must be at least 3 characters')
        .nullable(),
    lastName: Yup.string()
        .min(3, 'Last name must be at least 3 characters')
        .nullable(),
    email: Yup.string()
        .email('Invalid email format')
        .nullable(),
    dateOfBirth: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .nullable(),
    phone: Yup.string()
        .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
        .min(8, 'Phone number must be at least 8 digits')
        .nullable(),
    major: Yup.string().nullable(),
    status: Yup.string().nullable(),
    address: Yup.string().nullable()
        .max(200, 'Address must be less than 200 characters'),
    bio: Yup.string()
        .max(500, 'Bio must be less than 500 characters')
        .nullable()
        .notRequired()
});

const EditProfile = () => {
    const [ loading, setLoading ] = useState(false);

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            dateOfBirth: "",
            address: "",
            bio: "",
            phone: "",
            major: "",
            status: "OnDuty",
            pictureURL: null
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await updateProfile({ dto: values }, token);
                console.log('Profile updated successfully:', response);
                toast.success('Profile updated successfully');
            } catch (error) {
                console.error('Error updating profile:', error);
                toast.error(error.response?.data?.title || 'Failed to update profile');
                console.error('Error updating profile:', error);
            } finally {
                setLoading(false);
            }
        }
    });

    // Update useEffect to set formik values
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getProfile(token);
                console.log('Profile fetched successfully:', response);
                const profileData = response.data;

                formik.setValues({
                    firstName: profileData.firstName || "",
                    lastName: profileData.lastName || "",
                    email: profileData.email || "",
                    dateOfBirth: profileData.dateOfBirth?.split('T')[0] || "",
                    address: profileData.address || "",
                    bio: profileData.bio || "",
                    phone: profileData.phone || "",
                    major: profileData.major || "",
                    status: profileData.status || "OnDuty",
                    pictureURL: profileData.pictureURL || null
                });
            } catch (error) {
                toast.error('Failed to load profile data');
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array

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
                        <form onSubmit={formik.handleSubmit} style={{ flexGrow: 1 }}>
                            <Grid container spacing={3}>
                                {/* First Name */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formik.values.firstName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                        helperText={formik.touched.firstName && formik.errors.firstName}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Last Name */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formik.values.lastName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                        helperText={formik.touched.lastName && formik.errors.lastName}
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
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={formik.touched.email && formik.errors.email}
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
                                        value={formik.values.dateOfBirth}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                                        helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Address */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
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
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
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
                                        value={formik.values.major}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.major && Boolean(formik.errors.major)}
                                        helperText={formik.touched.major && formik.errors.major}
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
                                            value={formik.values.status}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.status && Boolean(formik.errors.status)}
                                        >
                                            <MenuItem value="OnDuty">On Duty</MenuItem>
                                            <MenuItem value="Annuallyleave">Annual leave</MenuItem>
                                            <MenuItem value="Temporarilyleave">Temporarily leave</MenuItem>
                                        </StyledSelect>
                                        {formik.touched.status && formik.errors.status && (
                                            <Typography color="error" variant="caption">
                                                {formik.errors.status}
                                            </Typography>
                                        )}
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
                                        value={formik.values.bio}
                                        onChange={formik.handleChange}
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
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading || !formik.isValid || !formik.dirty}
                                    sx={{
                                        bgcolor: '#059669',
                                        '&:hover': { bgcolor: '#047857' },
                                        '&.Mui-disabled': {
                                            bgcolor: '#82c4b3'
                                        }
                                    }}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
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
