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
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '15px',
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
            fontSize: 24,
            color: selected ? 'primary.main' : '#757575',
          }
        }}
      >
        {getEmoji()}
      </Box>
    );
  };

  return (
      <Container maxWidth="md" sx={{ mb: 4, mt: 6 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            maxWidth: 600,
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
                py: 2,
                fontSize: '16px',
                fontWeight: 500,
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
                p: 4,
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
                  textAlign: 'center'
                }}
              >
                Give feedback
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  textAlign: 'center',
                  maxWidth: '450px'
                }}
              >
                What do you think of the editing tool?
              </Typography>

              {/* Rating Section */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 4,
                maxWidth: 320,
                mx: 'auto'
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
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
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
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8fafc',
                  }
                }}
              />

              {/* Follow-Up Section */}
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                May we follow you up on your feedback?
              </Typography>
              <RadioGroup
                row
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                sx={{ mb: 4 }}
              >
                <FormControlLabel 
                  value="yes" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        }
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
                        }
                      }}
                    />
                  } 
                  label="No" 
                />
              </RadioGroup>

              {/* Submit and Cancel Buttons */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    sx={{
                      py: 1.5,
                      fontSize: '16px',
                      bgcolor: '#064e3b',
                      '&:hover': {
                          bgcolor: '#053c2e',
                      },
                    }}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleFeedbackReset}
                    sx={{
                      py: 1.5,
                      fontSize: '16px',
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
                p: 4,
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
                  mb: 3,
                  textAlign: 'center'
                }}
              >
                Request Support
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  textAlign: 'center',
                  maxWidth: '450px'
                }}
              >
                Need help? Submit a support request and we'll assist you
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
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
                      }
                    }}
                  >
                    {requestTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.icon}
                          <span>{option.label}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
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
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Description
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    placeholder="Please provide details about your request"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f8fafc',
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
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
                      }
                    }}
                  >
                    {priorityLevels.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                            sx={{
                                py: 1.5,
                                fontSize: '16px',
                                bgcolor: '#064e3b',
                                '&:hover': {
                                    bgcolor: '#053c2e',
                                },
                            }}
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleSupportReset}
                            sx={{
                                py: 1.5,
                                fontSize: '16px',
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
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
  );
};

export default FeedbackSupport;