import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  InputBase,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Book,
  Code,
  Settings,
  Security,
  Clear,
} from '@mui/icons-material';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';

const FAQ = () => {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const matchesSearch = (text, query) => {
    return text.toLowerCase().includes(query.toLowerCase());
  };

  const faqCategories = [
    {
      category: "Getting Started",
      icon: <Book sx={{ color: '#2196f3' }} />,
      items: [
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password?' on the login page, enter your email, and follow the instructions sent to your inbox.",
          video: "/videos/ResetPassword.mp4"
        },
        {
          question: "How do I update my profile?",
          answer: "Go to 'Settings' from your dashboard, click on 'Profile Settings', and update your information. Don't forget to save changes.",
          video: "/videos/UpdateProfile.mp4"
        },
        {
          question: "How do I change my password?",
          answer: "In the 'Settings' menu, go to 'Profile Settings', then click on 'Change Password'. Enter your current password and the new one.",
          video: "/videos/ChangePassword.mp4"
        }
      ]
    },
    {
      category: "Task Management",
      icon: <Code sx={{ color: '#4caf50' }} />,
      items: [
        {
          question: "How do I view my assigned tasks?",
          answer: "Access your dashboard and navigate to 'Tasks' section to view all tasks assigned to you."
        },
        {
          question: "How does the drag and drop functionality work?",
          answer: "You can click on ⋮⋮ and hold on a task to drag it to a different status column. Release the mouse button to drop it in the new column."
        },
        {
          question: "How do I mark a task as completed?",
          answer: "After dragging a task to the 'Completed' column, it will send a request to the leader so you must wait for his approval."
        },
        {
          question: "How do I mark a task as frozen?",
          answer: "After dragging a task to the 'Frozen' column, it will send a request to the leader so you must wait for his approval."
        },
      ]
    },
    {
      category: "Member Messaging System",
      icon: <MarkUnreadChatAltIcon sx={{ color: '#1976d2' }} />,
      items: [
        {
          question: "How do I interact with a message I sent?",
          answer: "Simply click on your own message to open a menu with options like Edit, Delete, Forward, and Copy."
        },
        {
          question: "What happens when I edit a message?",
          answer: "After editing, the message will update instantly and show an 'edited' label for transparency."
        },
        {
          question: "Can I remove a message I no longer want visible?",
          answer: "Yes, choose 'Delete' from the message menu. The message will be marked as deleted and hidden from others."
        },
        {
          question: "How can I send a message to someone else from the chat?",
          answer: "Use the 'Forward' option from the message menu to share it with another member in your team."
        },
        {
          question: "Is it possible to copy the message text?",
          answer: "Yes, just select 'Copy' from the message options to save the content to your clipboard."
        }
      ]
    },
    {
      category: "Security & Privacy",
      icon: <Security sx={{ color: '#f44336' }} />,
      items: [
        {
          question: "How do I find the connected devices?",
          answer: "In the 'Security' section of your settings, click on 'Connected Devices' to view and manage all devices linked to your account.",
          video: "/videos/ConnectedDevices.mp4"
        },
        {
          question: "How do I enable two-factor authentication?",
          answer: "In the 'Security' section of your settings, toggle on 'Two-Factor Authentication' and follow the setup instructions.",
          video: "/videos/TwoFactor.mp4"
        },
        {
          question: "How do I get the login notifications?",
          answer: "In the 'Security' section of your settings, toggle on 'Login Notifications' to receive alerts for new logins from unrecognized devices.",
          video: "/videos/Login.mp4"
        },
        {
          question: "What are the password requirements?",
          answer: "Passwords must be at least 8 characters long, including uppercase and lowercase letters, numbers, and special characters."
        },
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      matchesSearch(item.question, searchQuery) ||
      matchesSearch(item.answer, searchQuery) ||
      matchesSearch(category.category, searchQuery)
    )
  })).filter(category => category.items.length > 0);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const highlightText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <Typography component="span">
        {parts.map((part, i) =>
          matchesSearch(part, query) ? (
            <Box
              key={i}
              component="span"
              sx={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: 'primary.main',
                fontWeight: 'bold'
              }}
            >
              {part}
            </Box>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </Typography>
    );
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setExpanded(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5, md: 6 } }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: '#064e3b',
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            mb: { xs: 2, sm: 3 }
          }}
        >
          How can we help you?
        </Typography>
        <Paper
          sx={{
            p: { xs: '1px 2px', sm: '2px 4px' },
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: { xs: '100%', sm: 500, md: 600 },
            margin: '0 auto',
            mb: { xs: 3, sm: 4 },
            minHeight: { xs: 40, sm: 48 }
          }}
          elevation={3}
        >
          <IconButton sx={{ p: { xs: '8px', sm: '10px' } }} aria-label="search">
            <Search />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <IconButton sx={{ p: { xs: '8px', sm: '10px' } }} aria-label="clear search" onClick={handleClearSearch}>
              <Clear />
            </IconButton>
          )}
        </Paper>
      </Box>

      <Box sx={{ mt: 2 }}>
        {filteredCategories.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 }, px: { xs: 0.5, sm: 0 } }}>
              <Box sx={{ '& .MuiSvgIcon-root': { fontSize: { xs: '1.2rem', sm: '1.5rem' } } }}>
                {category.icon}
              </Box>
              <Typography
                variant="h5"
                sx={{ ml: 1, fontWeight: 500, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}
              >
                {highlightText(category.category, searchQuery)}
              </Typography>
            </Box>
            {category.items.map((item, itemIndex) => (
              <Accordion
                key={itemIndex}
                expanded={expanded === `${categoryIndex}-${itemIndex}`}
                onChange={handleChange(`${categoryIndex}-${itemIndex}`)}
                sx={{
                  mb: 1,
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px !important',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' },
                  ...(searchQuery &&
                    (matchesSearch(item.question, searchQuery) || matchesSearch(item.answer, searchQuery)) && {
                      borderColor: 'primary.main',
                      borderWidth: 1,
                      bgcolor: 'rgba(33, 150, 243, 0.02)'
                    })
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      margin: { xs: '8px 0', sm: '12px 0' },
                      pr: { xs: 1, sm: 2 }
                    },
                    minHeight: { xs: 48, sm: 56 }
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' }, lineHeight: { xs: 1.4, sm: 1.5 } }}>
                    {highlightText(item.question, searchQuery)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: { xs: 0, sm: 1 }, px: { xs: 2, sm: 2 }, pb: { xs: 2, sm: 2 } }}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: { xs: 1.5, sm: 1.6 } }}>
                    {highlightText(item.answer, searchQuery)}
                  </Typography>
                  {item.video && (
                    <Box
                      sx={{
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: '#f5f5f5',
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          color: 'primary.main',
                          fontWeight: 600,
                          letterSpacing: 1,
                        }}
                      >
                        Watch Tutorial
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 400,
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <video
                          src={item.video}
                          controls
                          style={{
                            width: '100%',
                            height: '220px',
                            background: '#000',
                            borderRadius: '8px',
                          }}
                          poster="/favicon.ico"
                        />
                      </Box>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default FAQ;
