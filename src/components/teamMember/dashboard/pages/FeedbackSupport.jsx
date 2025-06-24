import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import {
  Feedback,
  BugReport,
  Help,
  Send,
  SentimentSatisfiedAlt,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
} from '@mui/icons-material';
import { submitFeedback, submitSupport } from '../../../../services/feedbackSupportService';

const FeedbackSupport = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: '',
    priority: 'medium',
  });
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [followUp, setFollowUp] = useState('yes');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const requestTypes = [
    { value: 'feedback', label: 'General Feedback', icon: <Feedback /> },
    { value: 'issue', label: 'Report Issue', icon: <BugReport /> },
    { value: 'help', label: 'Request Help', icon: <Help /> },
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await submitFeedback({
        rating: feedbackRating,
        message: feedbackComment,
        canFollowUp: followUp === 'yes'
      }, token);
      console.log(response.data);

      setSnackbar({
        open: true,
        message: 'Thank you for your feedback!',
        severity: 'success',
      });
      // Reset form
      setFeedbackRating(null);
      setFeedbackComment('');
      setFollowUp('yes');
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit feedback. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await submitSupport({
        requestType: formData.type,
        subject: formData.subject,
        description: formData.description,
        priorityLevel: formData.priority
      }, token);
      console.log(response.data);

      setSnackbar({
        open: true,
        message: 'Your support request has been submitted successfully!',
        severity: 'success',
      });
      // Reset form
      setFormData({
        type: '',
        subject: '',
        description: '',
        priority: 'medium',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit request. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackReset = () => {
    setFeedbackRating(null);
    setFeedbackComment('');
    setFollowUp('yes');
};

const handleSupportReset = () => {
    setFormData({
        type: '',
        subject: '',
        description: '',
        priority: 'medium',
    });
};

  const FeedbackEmoji = ({ rating, selected, onClick }) => {
    const getEmoji = () => {
      switch (rating) {
        case 1: return <SentimentVeryDissatisfied />;
        case 2: return <SentimentDissatisfied />;
        case 3: return <SentimentNeutral />;
        case 4: return <SentimentSatisfiedAlt />;
        case 5: return <SentimentVerySatisfied />;
        default: return null;
      }
    };

    return (
      <Box 
        onClick={onClick}
        sx={{
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: { xs: '8px', sm: '15px' },
          borderRadius: '50%',
          border: '2px solid',
          borderColor: selected ? 'primary.main' : '#e0e0e0',
          cursor: 'pointer',
          backgroundColor: selected ? '#edf2ff' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: selected ? '#edf2ff' : '#f5f5f7',
            transform: 'scale(1.05)',
          },
          '& svg': {
            fontSize: { xs: 20, sm: 24 },
            color: selected ? 'primary.main' : '#757575',
          }
        }}
      >
        {getEmoji()}
      </Box>
    );
  };

  return (
      <Container 
        maxWidth="md" 
        sx={{ 
          mb: 4, 
          mt: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3 }
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            maxWidth: { xs: '100%', sm: 600 },
            mx: 'auto'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 500,
                minHeight: { xs: 44, sm: 48 },
              },
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tab label="Feedback" />
            <Tab label="Support" />
          </Tabs>

          {/* Feedback Tab Content */}
          {activeTab === 0 && (
            <Box 
              component="form" 
              onSubmit={handleFeedbackSubmit} 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  textAlign: 'center',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Give feedback
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 3, sm: 4 },
                  textAlign: 'center',
                  maxWidth: '450px',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 1, sm: 0 }
                }}
              >
                What do you think of the editing tool?
              </Typography>

              {/* Rating Section */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                mb: { xs: 3, sm: 4 },
                maxWidth: { xs: 280, sm: 320 },
                mx: 'auto',
                flexWrap: { xs: 'nowrap', sm: 'nowrap' },
                gap: { xs: 0, sm: 0 }
              }}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <FeedbackEmoji
                    key={rating}
                    rating={rating}
                    selected={feedbackRating === rating}
                    onClick={() => setFeedbackRating(rating)}
                  />
                ))}
              </Box>

              {/* Feedback Comment Section */}
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  textAlign: { xs: 'center', sm: 'left' },
                  alignSelf: { xs: 'center', sm: 'flex-start' }
                }}
              >
                Do you have any thoughts you'd like to share?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="There's..."
                variant="outlined"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                sx={{ 
                  mb: { xs: 3, sm: 4 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8fafc',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: 'black'
                  }
                }}
              />

              {/* Follow-Up Section */}
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  textAlign: { xs: 'center', sm: 'left' },
                  alignSelf: { xs: 'center', sm: 'flex-start' }
                }}
              >
                May we follow you up on your feedback?
              </Typography>
              <RadioGroup
                row
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                sx={{ 
                  mb: { xs: 3, sm: 4 },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              >
                <FormControlLabel 
                  value="yes" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                        padding: { xs: '6px', sm: '9px' }
                      }}
                    />
                  } 
                  label="Yes" 
                />
                <FormControlLabel 
                  value="no" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                        padding: { xs: '6px', sm: '9px' }
                      }}
                    />
                  } 
                  label="No" 
                />
              </RadioGroup>

              {/* Submit and Cancel Buttons */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    sx={{
                      py: { xs: 1.2, sm: 1.5 },
                      fontSize: { xs: '14px', sm: '16px' },
                      bgcolor: '#064e3b',
                      '&:hover': {
                          bgcolor: '#053c2e',
                      },
                    }}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleFeedbackReset}
                    sx={{
                      py: { xs: 1.2, sm: 1.5 },
                      fontSize: { xs: '14px', sm: '16px' },
                      borderColor: '#e0e0e0',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: '#bdbdbd',
                        backgroundColor: '#f5f5f7',
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Support Tab Content */}
          {activeTab === 1 && (
            <Box 
              component="form" 
              onSubmit={handleSupportSubmit} 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600, 
                  mb: { xs: 2, sm: 3 },
                  textAlign: 'center',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Request Support
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 3, sm: 4 },
                  textAlign: 'center',
                  maxWidth: '450px',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 1, sm: 0 }
                }}
              >
                Need help? Submit a support request and we'll assist you
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    Request Type
                  </Typography>
                  <TextField
                    select
                    required
                    fullWidth
                    name="type"
                    placeholder="Select request type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8fafc',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: 'black',
                      },
                      // Make the select arrow visible in dark mode
                      '& .MuiSelect-icon': {
                        color: theme => theme.palette.text.secondary,
                      }
                    }}
                  >
                    {requestTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ '& svg': { fontSize: { xs: '1.1rem', sm: '1.25rem' } } }}>
                            {option.icon}
                          </Box>
                          <span style={{ fontSize: window.innerWidth < 600 ? '0.9rem' : '1rem' }}>
                            {option.label}
                          </span>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    Subject
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    name="subject"
                    placeholder="Enter the subject of your request"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8fafc',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: 'black'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    Description
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={{ xs: 3, sm: 4 }}
                    name="description"
                    placeholder="Please provide details about your request"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8fafc',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: 'black'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    Priority Level
                  </Typography>
                  <TextField
                    select
                    required
                    fullWidth
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8fafc',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: 'black',
                      },
                      // Make the select arrow visible in dark mode
                      '& .MuiSelect-icon': {
                        color: theme => theme.palette.text.secondary,
                      }
                    }}
                  >
                    {priorityLevels.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <span style={{ fontSize: window.innerWidth < 600 ? '0.9rem' : '1rem' }}>
                          {option.label}
                        </span>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: { xs: 1, sm: 2 } }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                            sx={{
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: '14px', sm: '16px' },
                                bgcolor: '#064e3b',
                                '&:hover': {
                                    bgcolor: '#053c2e',
                                },
                            }}
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleSupportReset}
                            sx={{
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: '14px', sm: '16px' },
                                borderColor: '#e0e0e0',
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: '#bdbdbd',
                                    backgroundColor: '#f5f5f7',
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: { xs: '0.85rem', sm: '0.875rem' }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
  );
};

export default FeedbackSupport;