import { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Avatar, Select, MenuItem, Grid, Paper, IconButton, CssBaseline, FormControl, InputLabel, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { styled, ThemeProvider } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';
import { useTheme } from '@mui/material';
import { getProfile, updateProfile } from "../../services/profileService";
import { uploadImageToCloudinary } from '../../services/imageService';
import { toast } from "react-toastify";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { adjustTimezone } from "../../utils";
import { format, parseISO } from 'date-fns';
import { ArrowBack } from "@mui/icons-material";
import AdminCredentialsDialog from '../teamLeader/dashboard/components/AdminCredentialsDialog';
import { decodeToken } from "../../utils";

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
        .notRequired(),
    pictureURL: Yup.string().nullable(),
});

const EditProfile = () => {
    const navigate = useNavigate();
    useEffect(() => {
        document.title = "FlowSync | Edit profile";
    }, []);
    const [ loading, setLoading ] = useState(false);
    const [ initialLoading, setInitialLoading ] = useState(true);
    const [ imageLoading, setImageLoading ] = useState(false);
    const [ originalValues, setOriginalValues ] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        address: "",
        bio: "",
        phone: "",
        major: "",
        status: "On_Duty",
        pictureURL: null
    });
    const [ showAdminDialog, setShowAdminDialog ] = useState(false);
    const [ pendingStatus, setPendingStatus ] = useState(null);

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
            status: "On_Duty",
            pictureURL: null
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');

                // Calculate changed fields
                const updatedFields = {};
                for (const key in values) {
                    if (values[ key ] !== originalValues[ key ]) {
                        // Adjust date of birth before sending to server
                        updatedFields[ key ] = key === 'dateOfBirth'
                            ? new Date(values[ key ]).toISOString()
                            : values[ key ];
                    }
                }

                if (Object.keys(updatedFields).length === 0) {
                    toast.info("No changes detected");
                    setLoading(false);
                    return;
                }

                // Convert status to number if it's changed
                if (updatedFields.status) {
                    const statusMapping = {
                        "On_Duty": 2,
                        "Annually_Leave": 1,
                        "Temporarily_Leave": 0
                    };
                    updatedFields.status = statusMapping[ updatedFields.status ];
                }

                const response = await updateProfile(updatedFields, token);
                console.log('Profile updated successfully:', response.data);
                toast.success(response.data);

                // Add delay before navigation
                setTimeout(() => {
                    navigate('/profile');
                }, 5000); // 2 seconds delay

            } catch (error) {
                console.error('Error updating profile:', error);
                toast.error(error.response?.data?.title || 'Failed to update profile');
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

                const formattedData = {
                    firstName: profileData.firstName || "",
                    lastName: profileData.lastName || "",
                    email: profileData.email || "",
                    dateOfBirth: profileData.dateOfBirth ? adjustTimezone(profileData.dateOfBirth) : null,
                    address: profileData.address || "",
                    bio: profileData.bio || "",
                    phone: profileData.phone || "",
                    major: profileData.major || "",
                    status: profileData.status || "On_Duty",
                    pictureURL: profileData.pictureURL || null
                };

                formik.setValues(formattedData);
                console.log(formattedData);
                setOriginalValues(formattedData);
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile data');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const theme = useTheme();

    if (initialLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress sx={{ color: '#4caf50' }} />
            </Box>
        );
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[ 0 ];
        if (!file) return;

        try {
            setImageLoading(true);

            // Validate file type
            const validTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ];
            if (!validTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPG, JPEG, or PNG)');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            // Upload image using the service
            const imageUrl = await uploadImageToCloudinary(file);

            // Update profile with new image URL
            const token = localStorage.getItem('authToken');
            try {
                await updateProfile({

                    ...formik.values,
                    pictureURL: imageUrl

                }, token);

                // Update formik state only after successful backend update
                formik.setFieldValue('pictureURL', imageUrl);
                toast.success('Profile picture updated successfully');
            } catch (updateError) {
                console.error('Error updating profile with new image:', updateError);
                toast.error(updateError.response?.data?.title || 'Failed to update profile with new image');
                throw updateError; // Re-throw to be caught by outer catch
            }
        } catch (error) {
            console.error('Error in image upload process:', error);
            // Only show error message if not already shown for specific cases
            if (!error.message?.includes('valid image file') && !error.message?.includes('less than 5MB')) {
                toast.error(error.message || 'Failed to update profile picture');
            }
        } finally {
            setImageLoading(false);
        }
    };

    const handleBackToProfile = () => {
        navigate('/profile');
    };

    const handleStatusChange = (event) => {
        const newStatus = event.target.value;

        const role = decodeToken(localStorage.getItem('authToken')).role;
        // Check if user is leader and changing to leave status
        if (role.includes('Leader') &&
            (newStatus === 'Temporarily_Leave' || newStatus === 'Annually_Leave')) {
            setPendingStatus(newStatus);
            setShowAdminDialog(true);
        } else {
            formik.setFieldValue('status', newStatus);
        }
    };

    // Dialog handlers
    const handleAdminDialogClose = () => {
        setShowAdminDialog(false);
        setPendingStatus(null);
    };

    const handleAdminConfirm = () => {
        formik.setFieldValue('status', pendingStatus);
        setShowAdminDialog(false);
        setPendingStatus(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
                maxWidth: 900,
                margin: "auto",
                padding: { xs: 2, sm: 3, md: 4 },
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 2, sm: 3, md: 4 }
            }}>
                {/* Logo & Title */}
                <Box display="flex"
                    alignItems="center"
                    sx={{
                        position: { xs: 'static', md: 'relative' },
                        left: { xs: 0, md: "-310px" },
                        mb: { xs: 2, md: 0 }
                    }}
                >
                    <img src={logo}
                        alt="FlowSync Logo"
                        style={{
                            height: 'clamp(30px, 5vw, 40px)',
                            marginRight: 10
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#059669',
                            fontWeight: 'bold',
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                    >
                        FlowSync
                    </Typography>
                </Box>

                {/* Add Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBackToProfile}
                    sx={{
                        position: { xs: 'static', md: 'absolute' },
                        bottom: { md: 35 },
                        left: { md: 32 },
                        mb: { xs: 2, md: 0 },
                        color: '#064e3b',
                        '&:hover': { bgcolor: '#ecfdf5' },
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        width: { xs: '100%', md: 'auto' }
                    }}
                >
                    Back to Profile
                </Button>

                {/* Profile Edit Section */}
                <StyledPaper elevation={0}>
                    <Typography
                        variant="h4"
                        sx={{
                            mb: { xs: 3, md: 5 },
                            mt: { xs: -3, md: -6 },
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
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
                        <Box sx={{
                            position: 'relative', // Changed to relative
                            display: 'flex',
                            justifyContent: { xs: 'center', md: 'flex-start' },
                            mb: { xs: 50, md: 50 }
                        }}>

                            <Avatar
                                src={formik.values.pictureURL || "/profile.jpg"}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: '4px solid #059669',
                                    boxShadow: '0 0 15px rgba(5,150,105,0.3)',
                                }}
                            />
                            <input
                                accept="image/jpeg,image/png,image/jpg"
                                style={{ display: 'none' }}
                                id="icon-button-file"
                                type="file"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="icon-button-file">
                                <IconButton
                                    component="span"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: -5, // Adjusted right position
                                        bgcolor: '#059669',
                                        width: 32,
                                        height: 32,
                                        '&:hover': {
                                            bgcolor: '#047857'
                                        },
                                        color: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        zIndex: 1 // Added zIndex
                                    }}
                                    disabled={imageLoading}
                                >
                                    {imageLoading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    )}
                                </IconButton>
                            </label>
                        </Box>

                        {/* Profile Form */}
                        <form onSubmit={formik.handleSubmit} style={{ flexGrow: 1 }}>
                            <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }
                                        }}
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
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }
                                        }}
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
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Date of Birth */}
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formik.values.dateOfBirth ? format(parseISO(formik.values.dateOfBirth), 'yyyy-MM-dd') : ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                                        helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            inputProps: {
                                                max: new Date().toISOString().split('T')[ 0 ] // Prevent future dates
                                            }
                                        }}
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
                                            onChange={handleStatusChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.status && Boolean(formik.errors.status)}
                                        >
                                            <MenuItem value="On_Duty">On Duty</MenuItem>
                                            <MenuItem value="Annually_Leave">Annually Leave</MenuItem>
                                            <MenuItem value="Temporarily_Leave">Temporarily Leave</MenuItem>
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
                            <Box mt={4} textAlign="right" sx={{ width: '100%' }}>
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
                                        },
                                        width: { xs: '100%', md: 'auto' }
                                    }}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </StyledPaper>

                {/* Admin Credentials Dialog */}
                <AdminCredentialsDialog
                    open={showAdminDialog}
                    onClose={handleAdminDialogClose}
                    onConfirm={handleAdminConfirm}
                    profileData={formik.values}
                    newStatus={pendingStatus}
                    adminCredentials={{
                        email: "flowsync.adm@outlook.com",
                        password: "FSAdmin2025*"
                    }}
                />
            </Box>
        </ThemeProvider>
    );
};

export default EditProfile;
