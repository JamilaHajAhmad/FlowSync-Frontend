import React, { useState } from 'react';
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

const FAQ = () => {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to check if text matches search query
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
          answer: "Click on 'Forgot Password?' on the login page, enter your email, and follow the instructions sent to your inbox."
        },
        {
          question: "How do I update my profile?",
          answer: "Go to 'Settings' from your dashboard, click on 'Profile', and update your information. Don't forget to save changes."
        },
        {
          question: "How do I change my password?",
          answer: "In the 'Settings' menu, go to 'Security', then click on 'Change Password'. Enter your current password and the new one."
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
      category: "Team Collaboration",
      icon: <Settings sx={{ color: '#ff9800' }} />,
      items: [
        {
          question: "How do I communicate with my team?",
          answer: "Use the built-in chat feature or task comments for team communication. For urgent matters, use the 'Priority Message' feature."
        },
        {
          question: "Where can I find team schedules?",
          answer: "Access the 'Team Calendar' from your dashboard to view schedules, meetings, and task deadlines for your entire team."
        },
        {
          question: "How do I submit progress reports?",
          answer: "Weekly progress reports can be generated automatically from your completed tasks or created manually in the 'Reports' section."
        }
      ]
    },
    {
      category: "Security & Privacy",
      icon: <Security sx={{ color: '#f44336' }} />,
      items: [
        {
          question: "How do I find the connected devices?",
          answer: "In the 'Security' section of your settings, click on 'Connected Devices' to view and manage all devices linked to your account."
        },
        {
          question: "What are the password requirements?",
          answer: "Passwords must be at least 8 characters long, including uppercase and lowercase letters, numbers, and special characters."
        },
        {
          question: "How do I enable two-factor authentication?",
          answer: "In the 'Security' section of your settings, toggle on 'Two-Factor Authentication' and follow the setup instructions."
        },
        {
          question: "How do I get the login notifications?",
          answer: "In the 'Security' section of your settings, toggle on 'Login Notifications' to receive alerts for new logins from unrecognized devices."
        }
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

  // Automatically expand items that match search
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Highlight matching text
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#064e3b' }}>
          How can we help you?
        </Typography>
        <Paper
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 600,
            margin: '0 auto',
            mb: 4,
          }}
          elevation={3}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <Search />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <IconButton 
              sx={{ p: '10px' }} 
              aria-label="clear search"
              onClick={handleClearSearch}
            >
              <Clear />
            </IconButton>
          )}
        </Paper>
      </Box>

      <Box sx={{ mt: 2 }}>
        {filteredCategories.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {category.icon}
              <Typography variant="h5" sx={{ ml: 1, fontWeight: 500 }}>
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
                  '&:not(:last-child)': { mb: 1 },
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' },
                  ...(searchQuery && (
                    matchesSearch(item.question, searchQuery) || 
                    matchesSearch(item.answer, searchQuery)
                  ) && {
                    borderColor: 'primary.main',
                    borderWidth: 1,
                    bgcolor: 'rgba(33, 150, 243, 0.02)'
                  })
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    '& .MuiAccordionSummary-content': { margin: '12px 0' }
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>
                    {highlightText(item.question, searchQuery)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    {highlightText(item.answer, searchQuery)}
                  </Typography>
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