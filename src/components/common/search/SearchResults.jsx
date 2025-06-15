import { useEffect, useRef } from 'react';
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
import { getSearchItems } from './data';
import { decodeToken } from '../../../utils';

const ResultPaper = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '100%', // Match parent width
    minWidth: {
        xs: '300px',
        sm: '350px',
        md: '450px'
    },
    maxWidth: {
        xs: 'calc(100vw - 32px)',
        sm: '450px',
        md: '500px'
    },
    maxHeight: '400px',
    overflowX: 'hidden',
    overflowY: 'auto',
    marginTop: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(45, 45, 45, 0.98)' 
        : 'rgba(255, 255, 255, 0.99)',
    backdropFilter: 'blur(12px)',
    boxShadow: theme.palette.mode === 'dark' 
        ? '0 12px 40px rgba(0, 0, 0, 0.5)'
        : '0 12px 40px rgba(0, 0, 0, 0.12)',
    border: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.06)'}`,
    zIndex: theme.zIndex.modal + 1,
    transform: 'translateX(0)', // Ensure proper alignment
    left: 'auto' // Reset left position
}));

const HighlightedText = styled('span')(() => ({
    backgroundColor: 'transparent', // Remove default background
    color: '#10B981', // Keep the green color for matched text
    fontWeight: 600, // Make matches slightly bolder
    padding: '0 2px',
    borderRadius: '2px',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    margin: {
        xs: '2px 4px', // Reduced margins on mobile
        sm: '6px 12px'
    },
    padding: {
        xs: '4px 8px', // Reduced padding on mobile
        sm: '8px 16px'
    },
    borderRadius: {
        xs: theme.spacing(1),
        sm: theme.spacing(1.5)
    },
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

const IconWrapper = styled(ListItemIcon)(() => ({
    minWidth: {
        xs: 40,
        sm: 48
    },
    '& svg': {
        fontSize: {
            xs: '1.25rem',
            sm: '1.5rem'
        },
        transition: 'transform 0.2s ease',
    },
    'ListItem:hover &': {
        '& svg': {
            transform: 'scale(1.1)'
        }
    }
}));

const SearchResults = ({ results, searchTerm, selectedIndex, onSelect, onItemHover }) => {
    const selectedRef = useRef(null);
    const token = localStorage.getItem('authToken');
    const decodedToken = decodeToken(token);
    const role = decodedToken.role;

    // Get role-specific search items
    const searchItems = getSearchItems(role);

    // Filter results based on role-specific items
    const filteredResults = results.filter(result => 
        searchItems.some(item => item.objectID === result.objectID)
    );

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
            {filteredResults.length === 0 ? (
                <Box sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    textAlign: 'center', 
                    color: 'text.secondary',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 }
                }}>
                    <Icons.SearchOff sx={{ 
                        fontSize: { xs: 32, sm: 40 }, 
                        opacity: 0.5 
                    }} />
                    <Typography 
                        variant="body2"
                        sx={{
                            fontSize: { xs: '0.813rem', sm: '0.875rem' }
                        }}
                    >
                        No results found
                    </Typography>
                </Box>
            ) : (
                <List dense sx={{ 
                    py: 0.5,
                    px: 0,
                    '& .MuiListItemText-primary': {
                        fontSize: {
                            xs: '0.875rem',
                            sm: '0.875rem'
                        },
                        fontWeight: 500,
                        mb: 0.25
                    },
                    '& .MuiListItemText-secondary': {
                        fontSize: {
                            xs: '0.75rem',
                            sm: '0.75rem'
                        },
                        lineHeight: 1.3
                    }
                }}>
                    {filteredResults.map((item, index) => {
                        const IconComponent = Icons[item.icon] || Icons.Circle;
                        return (
                            <StyledListItem
                                key={item.objectID}
                                ref={selectedIndex === index ? selectedRef : null}
                                button
                                selected={selectedIndex === index}
                                onClick={() => onSelect(item)}
                                onMouseEnter={() => onItemHover(index)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(5, 150, 105, 0.08)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(5, 150, 105, 0.12)'
                                        }
                                    }
                                }}
                            >
                                <IconWrapper>
                                    <IconComponent 
                                        sx={{ 
                                            color: selectedIndex === index ? '#059669' : 'text.secondary'
                                        }} 
                                    />
                                </IconWrapper>
                                <ListItemText
                                    primary={
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: selectedIndex === index ? 600 : 500,
                                                color: selectedIndex === index ? '#10B981' : 'inherit',
                                                fontSize: {
                                                    xs: '0.875rem',
                                                    sm: '1rem'
                                                }
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
                                                fontSize: {
                                                    xs: '0.75rem',
                                                    sm: '0.85rem'
                                                }
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