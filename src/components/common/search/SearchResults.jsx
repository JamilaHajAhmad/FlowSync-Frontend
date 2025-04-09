import React, { useEffect, useRef } from 'react';
import { 
    Box, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Typography,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as Icons from '@mui/icons-material';

const ResultPaper = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: 'calc(100% + 12px)', // Slightly increased gap
    left: -20,  // Extend beyond the search bar
    right: -20, // Extend beyond the search bar
    width: 'calc(100% + 40px)', // Compensate for the negative left/right
    maxHeight: '75vh',
    minWidth: '450px', // Minimum width for better readability
    maxWidth: '800px', // Maximum width to maintain usability
    overflowX: 'hidden', // Prevent horizontal scroll
    overflowY: 'auto',
    marginTop: theme.spacing(1),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(45, 45, 45, 0.98)' 
        : 'rgba(255, 255, 255, 0.99)',
    backdropFilter: 'blur(12px)',
    boxShadow: theme.palette.mode === 'dark' 
        ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)',
    border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.06)'}`,
    zIndex: theme.zIndex.modal + 1,
    '&::-webkit-scrollbar': {
        width: '6px'
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderRadius: '3px'
    }
}));

const HighlightedText = styled('span')(() => ({
    backgroundColor: 'transparent', // Remove default background
    color: '#10B981', // Keep the green color for matched text
    fontWeight: 600, // Make matches slightly bolder
    padding: '0 2px',
    borderRadius: '2px',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    margin: '6px 12px',
    padding: '8px 16px',
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    '&:hover': {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        transform: 'translateX(4px)',
    },
    '&.Mui-selected': {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderLeft: '3px solid #10B981',
        '&:hover': {
            backgroundColor: 'rgba(16, 185, 129, 0.15)'
        }
    }
}));

const IconWrapper = styled(ListItemIcon)(({ theme }) => ({
    minWidth: 48, // Increased from 40
    color: theme.palette.primary.main,
    '& svg': {
        fontSize: '1.5rem', // Slightly larger icons
        transition: 'transform 0.2s ease',
    },
    'ListItem:hover &': {
        '& svg': {
            transform: 'scale(1.1)'
        }
    }
}));

const SearchResults = ({ results, searchTerm, selectedIndex, onSelect }) => {
    const selectedRef = useRef(null);

    useEffect(() => {
        if (selectedRef.current) {
            selectedRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [selectedIndex]);

    const highlightMatch = (text, searchTerm) => {
        if (!searchTerm) return text;
        
        try {
            // Escape special characters in the search term
            const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
            const parts = text.split(regex);
            
            return parts.map((part, i) => 
                regex.test(part) ? (
                    <HighlightedText key={i}>
                        {part}
                    </HighlightedText>
                ) : part
            );
        } catch (e) {
            console.error("Error in highlighting matches:", e);
            return text;
        }
    };

    return (
        <ResultPaper elevation={0}>
            {results.length === 0 ? (
                <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    color: 'text.secondary',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Icons.SearchOff sx={{ fontSize: 40, opacity: 0.5 }} />
                    <Typography variant="body2">
                        No results found
                    </Typography>
                </Box>
            ) : (
                <List dense sx={{ 
                    py: 2, // Increased padding
                    px: 1, 
                    mt: 2, // Add top margin to account for close button
                    '& .MuiListItemText-primary': {
                        fontSize: '1rem',
                        fontWeight: 500,
                        mb: 0.5
                    },
                    '& .MuiListItemText-secondary': {
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        maxWidth: '100%', // Ensure text doesn't overflow
                        wordWrap: 'break-word' // Handle long words
                    }
                }}>
                    {results.map((item, index) => {
                        const IconComponent = Icons[item.icon] || Icons.Circle;
                        return (
                            <StyledListItem
                                key={item.objectID}
                                ref={selectedIndex === index ? selectedRef : null}
                                button
                                selected={selectedIndex === index}
                                onClick={() => onSelect(item)}
                            >
                                <IconWrapper>
                                    <IconComponent fontSize="small" />
                                </IconWrapper>
                                <ListItemText
                                    primary={
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: selectedIndex === index ? 600 : 500,
                                                color: selectedIndex === index ? '#10B981' : 'inherit',
                                            }}
                                        >
                                            {highlightMatch(item.title, searchTerm)}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: selectedIndex === index 
                                                    ? 'rgba(16, 185, 129, 0.8)'
                                                    : 'text.secondary',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {highlightMatch(item.description, searchTerm)}
                                        </Typography>
                                    }
                                />
                            </StyledListItem>
                        );
                    })}
                </List>
            )}
        </ResultPaper>
    );
};

export default SearchResults;