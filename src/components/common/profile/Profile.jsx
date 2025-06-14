import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Grid,
  Container,
  TextField,
  Tabs,
  Tab,
  Button,
  Paper,
  CircularProgress,
  styled
} from '@mui/material';
import { Edit, Business, CalendarToday, Work, Security, NotificationsActive, DeviceHub, Lock } from '@mui/icons-material';
import backgroundImg from '../../../assets/images/profile.jpg';
import { getProfile } from '../../../services/profileService';
import { toast } from 'react-toastify';
import { formatString } from '../../../utils';
import { formatDate } from '../../../utils';

const SidebarCard = styled(Card)(({ theme }) => ({
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  height: '100%',
  marginBottom: { xs: theme.spacing(2), md: 0 }
}));

const ProfileDetail = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: '1px solid #f0f0f0',
  '&:last-child': {
    borderBottom: 'none',
  },
  [ theme.breakpoints.down('sm') ]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
    textAlign: 'center'
  }
}));

const StyledTab = styled(Tab)(() => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: { xs: '13px', sm: '14px', md: '15px' },
  minWidth: { xs: '100px', sm: '110px', md: '120px' },
  padding: { xs: '6px 12px', sm: '8px 16px', md: '12px 16px' },
  '&.Mui-selected': {
    color: '#4caf50',
  }
}));

const StyledTabs = styled(Tabs)({
  borderBottom: '1px solid #e0e0e0',
  '& .MuiTabs-indicator': {
    backgroundColor: '#4caf50',
    height: '3px',
  }
});

const InfoField = styled(TextField)({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#4caf50',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4caf50',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#4caf50',
  },
  '& .MuiInputBase-input': {
    padding: '14px',
  }
});

const ActionButton = styled(Button)(() => ({
  backgroundColor: '#064e3b',
  color: 'white',
  borderRadius: '30px',
  padding: { xs: '8px 20px', sm: '10px 25px' },
  width: { xs: '100%', sm: 'auto' },
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#064e3b',
  }
}));

const getStatusColor = (status) => {
  switch (status) {
    case "On Duty":
      return { color: "green", background: "#e0f7e9" };
    case "Annually Leave":
      return { color: "red", background: "#fde8e8" };
    case "Temporarily Leave":
      return { color: "orange", background: "#fff4e0" };
    default:
      return {};
  }
};

const convertNullToText = (value) => {
  return value || 'Not added yet';
};

const Profile = () => {
  const [ tabValue, setTabValue ] = useState(0);
  const [ profileData, setProfileData ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await getProfile(token);
        const profileData = response.data;
        console.log('Profile data:', profileData);

        setProfileData({
          ...profileData,
          // Convert null values
          firstName: convertNullToText(profileData.firstName),
          lastName: convertNullToText(profileData.lastName),
          email: convertNullToText(profileData.email),
          phone: convertNullToText(profileData.phone),
          address: convertNullToText(profileData.address),
          bio: convertNullToText(profileData.bio),
          major: convertNullToText(profileData.major),
          dateOfBirth: profileData.dateOfBirth || null,
          picture: profileData.pictureURL || '/path/to/default-avatar.jpg', // Default avatar if not provided
          // Convert status and role
          status: profileData.status,
          role: `Team ${profileData.role}`,
          details: [
            {
              label: 'Major',
              value: convertNullToText(profileData.major),
              icon: <Business sx={{ fontSize: 18, color: '#4caf50' }} />
            },
            {
              label: 'Join Date',
              value: profileData.joinedAt ? new Date(profileData.joinedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                year: 'numeric',
                month: 'long'
              }) : 'Not added yet',
              icon: <CalendarToday sx={{ fontSize: 18, color: '#4caf50' }} />
            },
            {
              label: 'Status',
              value: formatString(profileData.status),
              icon: <Work sx={{ fontSize: 18, color: '#4caf50' }} />,
              useStatusColor: true
            }
          ]
        });
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Add loading state handling
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#4caf50' }} />
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">Failed to load profile data</Typography>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{
      py: { xs: 2, sm: 3, md: 4 },
      px: { xs: 1.5, sm: 2, md: 3 }
    }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Left sidebar with avatar and details */}
        <Grid item xs={12} md={3}>
          <SidebarCard>
            <Box sx={{
              position: 'relative',
              textAlign: 'center',
              pt: { xs: 3, sm: 4 },
              pb: { xs: 2, sm: 3 },
              mb: { xs: 2, sm: 4 }
            }}>
              <Avatar
                src={profileData.picture}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                sx={{
                  width: { xs: 100, sm: 110, md: 120 },
                  height: { xs: 100, sm: 110, md: 120 },
                  margin: '0 auto',
                  border: '4px solid white',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  mt: { xs: 1, sm: 2 },
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {profileData.role}
              </Typography>
            </Box>

            {/* Profile Details */}
            {profileData.details.map((detail, index) => (
              <ProfileDetail key={index}>
                <Typography variant="body2" sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  {React.cloneElement(detail.icon, {
                    sx: { fontSize: { xs: 16, sm: 18 }, color: '#4caf50' }
                  })}
                  {detail.label}
                </Typography>
                {detail.useStatusColor ? (
                  <Box sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.3, sm: 0.5 },
                    borderRadius: '16px',
                    ...getStatusColor(detail.value)
                  }}>
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      color: getStatusColor(detail.value).color,
                      fontSize: { xs: '0.813rem', sm: '0.875rem' }
                    }}>
                      {detail.value}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.813rem', sm: '0.875rem' }
                  }}>
                    {detail.value}
                  </Typography>
                )}
              </ProfileDetail>
            ))}

          </SidebarCard>
        </Grid>

        {/* Main content area */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{
            borderRadius: { xs: '8px', sm: '10px' },
            overflow: 'hidden',
            border: '1px solid #e0e0e0'
          }}>
            <Box
              sx={{
                backgroundImage: `url(${backgroundImg})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '100%',
                height: { xs: '150px', sm: '180px', md: '200px' },
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(5, 150, 105, 0.8)',
                }
              }}
            />

            <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
              <StyledTabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="profile tabs"
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <StyledTab label="Profile Info" />
                <StyledTab label="Security Settings" />
                <StyledTab label="About" />
              </StyledTabs>
            </Box>

            <Box sx={{ p: 3, mt: 2 }}>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      First Name
                    </Typography>
                    <InfoField
                      fullWidth
                      variant="outlined"
                      value={profileData.firstName}
                      InputProps={{ readOnly: true }}
                    />

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Email Address
                    </Typography>
                    <InfoField
                      fullWidth
                      variant="outlined"
                      value={profileData.email}
                      InputProps={{ readOnly: true }}
                    />


                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Address
                    </Typography>
                    <InfoField
                      fullWidth
                      variant="outlined"
                      type="text"
                      value={profileData.address}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Last Name
                    </Typography>Typography
                    <InfoField
                      fullWidth
                      variant="outlined"
                      value={profileData.lastName}
                      InputProps={{ readOnly: true }}
                    />

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Date of Birth
                    </Typography>
                    <InfoField
                      fullWidth
                      variant="outlined"
                      value={profileData.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'Not added yet'}

                      InputProps={{
                        readOnly: true
                      }}
                    />

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Phone Number
                    </Typography>
                    <InfoField
                      fullWidth
                      variant="outlined"
                      value={`${profileData.phone}`}
                      InputProps={{ readOnly: true }}
                    />

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Link
                        to="/settings/edit-profile"
                        style={{ textDecoration: 'none' }}
                      >
                        <ActionButton startIcon={<Edit />}>
                          Edit
                        </ActionButton>
                      </Link>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Box sx={{ p: 3 }}>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        mb: 2
                      }}>
                        <Lock sx={{ color: '#4caf50', fontSize: 28 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Change Password
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Update your password to keep your account secure
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          sx={{
                            ml: 'auto',
                            color: '#4caf50',
                            borderColor: '#4caf50',
                            '&:hover': {
                              borderColor: '#2e7d32',
                              backgroundColor: 'rgba(76, 175, 80, 0.04)'
                            },
                          }}
                        >
                          <Link to="/settings/change-password"
                            style={{ textDecoration: 'none', color: '#4caf50' }} >Change</Link>
                        </Button>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        mb: 2
                      }}>
                        <Security sx={{ color: '#4caf50', fontSize: 28 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Two-Factor Authentication
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          sx={{
                            ml: 'auto',
                            color: '#4caf50',
                            borderColor: '#4caf50',
                            '&:hover': {
                              borderColor: '#2e7d32',
                              backgroundColor: 'rgba(76, 175, 80, 0.04)'
                            }
                          }}
                        >
                          <Link to="/settings/security/2fa"
                            style={{ textDecoration: 'none', color: '#4caf50' }} >Enable</Link>
                        </Button>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        mb: 2
                      }}>
                        <NotificationsActive sx={{ color: '#4caf50', fontSize: 28 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Login Notifications
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Get notified when there's a login from a new device
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          sx={{
                            ml: 'auto',
                            color: '#4caf50',
                            borderColor: '#4caf50',
                            '&:hover': {
                              borderColor: '#2e7d32',
                              backgroundColor: 'rgba(76, 175, 80, 0.04)'
                            }
                          }}
                        >
                          <Link to="/settings/security/login-notifications"
                            style={{ textDecoration: 'none', color: '#4caf50' }} >Enable</Link>
                        </Button>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        mb: 2
                      }}>
                        <DeviceHub sx={{ color: '#4caf50', fontSize: 28 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            Connected Devices
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Manage devices that are connected to your account
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          sx={{
                            ml: 'auto',
                            color: '#4caf50',
                            borderColor: '#4caf50',
                            '&:hover': {
                              borderColor: '#2e7d32',
                              backgroundColor: 'rgba(76, 175, 80, 0.04)'
                            }
                          }}
                        >
                          <Link to="/settings/security/connected-devices"
                            style={{ textDecoration: 'none', color: '#4caf50' }} >View Devices</Link>
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 2 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom marginBottom={2}>
                    About Me
                  </Typography>

                  <InfoField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={profileData.bio}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;