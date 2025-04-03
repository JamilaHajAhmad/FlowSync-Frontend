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
          question: "How do I register for FlowSync?",
          answer: "Registration requires a Dubai Police email address and an agency code. Submit your details and wait for team leader approval to access the platform."
        },
        {
          question: "What email format is accepted?",
          answer: "FlowSync only accepts official Dubai Police email addresses (@dubaipolice.gov.ae) for registration."
        },
        {
          question: "How long does account approval take?",
          answer: "Account approval typically takes 1-2 business days, depending on your team leader's availability."
        }
      ]
    },
    {
      category: "Task Management",
      icon: <Code sx={{ color: '#4caf50' }} />,
      items: [
        {
          question: "How do I view my assigned tasks?",
          answer: "Access your dashboard and navigate to 'My Tasks' section to view all tasks assigned to you, sorted by priority and due date."
        },
        {
          question: "How do I update task progress?",
          answer: "Open the task card, click on 'Update Status', and select your current progress percentage. You can also add comments for your team leader."
        },
        {
          question: "Can I reassign my tasks?",
          answer: "Task reassignment requests must go through your team leader. Use the 'Request Reassignment' option in the task details page."
        }
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
          question: "How is my data protected?",
          answer: "FlowSync uses end-to-end encryption and follows Dubai Police security protocols to protect all user data and communications."
        },
        {
          question: "What are the password requirements?",
          answer: "Passwords must be at least 12 characters long, including uppercase and lowercase letters, numbers, and special characters."
        },
        {
          question: "How often should I change my password?",
          answer: "For security purposes, you'll be prompted to change your password every 90 days. You can also change it manually at any time."
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