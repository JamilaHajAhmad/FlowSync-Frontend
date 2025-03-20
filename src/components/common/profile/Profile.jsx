import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Container,
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Use require to ensure the image is loaded correctly
import backgroundImg from '../../../assets/images/profile.jpg';
import updateProfile from '../../../assets/images/updateProfile.gif';

const ProfileBackground = styled(Box)(() => ({
  backgroundImage: `url(${backgroundImg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  width: '100%',
  height: '300px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 150, 105, 0.65)', // FlowSync green with opacity
  }
}));

const ProfileOverlay = styled(Box)(() => ({
  position: 'absolute',
  top: '80px', // Moved to the top
  left: '70px', // Moved slightly to the right
  display: 'flex',
  alignItems: 'center',
  zIndex: 2,
}));

const InfoCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  height: '100%',
}));

const Profile = () => {
  const profileData = {
    name: 'John Doe',
    email: 'john.doe@flowsync.com',
    role: 'Senior Developer',
    phone: '+1 234 567 890',
    location: 'New York, USA',
    department: 'Engineering',
    joinDate: 'January 2023',
    bio: 'Passionate developer with expertise in React and Node.js. Love building scalable applications and solving complex problems.'
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <ProfileBackground>
        <ProfileOverlay>
          <Avatar
            src="/path/to/profile-photo.jpg"
            sx={{
              width: 120,
              height: 120,
              border: '4px solid #fff',
              boxShadow: '0 0 20px rgba(0,0,0,0.15)',
              marginRight: 2, // Added margin to the right
            }}
          />
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
              {profileData.name}
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0f2f1' }}>
              {profileData.email}
            </Typography>
          </Box>
        </ProfileOverlay>
      </ProfileBackground>

      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <InfoCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: '#059669' }}>
                  Profile Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {profileData.name}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {profileData.email}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {profileData.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {profileData.department}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {profileData.location}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">
                      Join Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {profileData.joinDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Bio
                    </Typography>
                    <Typography variant="body1">
                      {profileData.bio}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard
              sx={{
                backgroundColor: '#f0fdf4',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 4
              }}
            >
              <Box
                component="img"
                src={updateProfile}
                alt="Update Profile"
                sx={{
                  width: '120px',
                  height: '120px',
                  mb: 1,
                  backgroundColor: 'transparent'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Want to update your profile information, change password, or manage your preferences?
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, color: '#059669' }}>
                Click on <Settings />
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;