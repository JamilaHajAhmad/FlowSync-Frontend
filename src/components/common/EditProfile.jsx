import React, { useState } from "react";
import { Box, TextField, Button, Typography, Avatar, Select, MenuItem, Grid, Paper, IconButton, CssBaseline } from "@mui/material";
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
        }
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#059669',
    }
}));

const StyledSelect = styled(Select)(() => ({
    '& .MuiOutlinedInput-notchedOutline': {
        '&:hover': {
            borderColor: '#10B981',
        }
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#059669',
    }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    background: theme.palette.mode === 'dark' ? '#1F2937' : '#ffffff',
}));


const EditProfile = () => {
    const [ formData, setFormData ] = useState({
        firstName: "Charlene",
        lastName: "Reed",
        email: "charlenereed@gmail.com",
        dateOfBirth: "1990-01-25",
        presentAddress: "San Jose, California, USA",
        permanentAddress: "San Jose, California, USA",
        city: "San Jose",
        country: "USA",
        status: "On Duty"
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [ name ]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form Data:', formData);
        // Add your submit logic here
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
                <Box display="flex" alignItems="center" position="relative" left="-180px">
                    <img src={logo} alt="FlowSync Logo" style={{ height: 40, marginRight: 10 }} />
                    <Typography variant="h6" component="div" sx={{ color: '#059669', fontWeight: 'bold' }}>
                        FlowSync
                    </Typography>
                </Box>
                <StyledPaper elevation={0}>
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 4,
                            background: 'linear-gradient(45deg, #064E3B 30%, #059669 90%)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 'bold'
                        }}
                    >
                        Edit Profile
                    </Typography>

                    <Box
                        display="flex"
                        alignItems="center"
                        gap={3}
                        mb={4}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', top: '-200px', left: '-20px' }}>
                            <Avatar
                                src="/profile.jpg"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: '4px solid #059669',
                                    boxShadow: '0 0 15px rgba(5,150,105,0.3)',
                                    marginRight: 2 // Adding space between the avatar and text fields
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

                        <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
                            <Grid container spacing={3}>
                                {[ { label: "First Name", name: "firstName", value: formData.firstName } ].map((field, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <StyledTextField
                                            fullWidth
                                            label={field.label}
                                            name={field.name}
                                            type={field.type || "text"}
                                            value={field.value}
                                            onChange={handleChange}
                                            InputLabelProps={{
                                                shrink: field.type === "date" || true,
                                                sx: { color: '#374151' }
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                }
                                            }}
                                        />
                                    </Grid>
                                ))}
                                {[ { label: "Last Name", name: "lastName", value: formData.lastName },
                                { label: "Email", name: "email", type: "email", value: formData.email },
                                { label: "Date of Birth", name: "dateOfBirth", type: "date", value: formData.dateOfBirth },
                                { label: "Present Address", name: "presentAddress", value: formData.presentAddress },
                                { label: "Permanent Address", name: "permanentAddress", value: formData.permanentAddress },
                                { label: "City", name: "city", value: formData.city },
                                { label: "Country", name: "country", value: formData.country }
                                ].map((field, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <StyledTextField
                                            fullWidth
                                            label={field.label}
                                            name={field.name}
                                            type={field.type || "text"}
                                            value={field.value}
                                            onChange={handleChange}
                                            InputLabelProps={{
                                                shrink: field.type === "date" || true,
                                                sx: { color: '#374151' }
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                }
                                            }}
                                        />
                                    </Grid>
                                ))}
                                <Grid item xs={12} sm={6}>
                                    <StyledSelect
                                        fullWidth
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        sx={{
                                            borderRadius: '8px',
                                            '& .MuiSelect-select': {
                                                padding: '16.5px 14px',
                                            }
                                        }}
                                    >
                                        <MenuItem value="On Duty">On Duty</MenuItem>
                                        <MenuItem value="Temporarily Leave">Temporarily Leave</MenuItem>
                                        <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                                    </StyledSelect>
                                </Grid>
                            </Grid>

                            <Box mt={4} textAlign="right">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: '#059669',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '8px',
                                        '&:hover': {
                                            bgcolor: '#047857'
                                        }
                                    }}
                                >
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
