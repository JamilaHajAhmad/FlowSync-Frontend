import { useState, useContext, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LightModeOutlined,
    DarkModeOutlined,
    NotificationsNoneOutlined,
    SettingsOutlined,
    Search as SearchIcon,
    Menu as MenuIcon,
    Clear as ClearIcon,
    ChatBubbleOutline as MessageIcon,
} from '@mui/icons-material';
import { 
    useTheme, 
    IconButton,
    InputBase, 
    Stack, 
    Box, 
    Typography,
    AppBar,
    Toolbar,
    Badge,
    Menu,
    ClickAwayListener
} from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { NotificationContext } from "./notification/NotificationContext.js";
import NotificationList from './notification/NotificationList';
import SearchResults from './search/SearchResults';
import { getSearchItems } from './search/data';
import { decodeToken } from '../../utils';
import { getUnreadMessages } from '../../services/chatService';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    top: '-22px',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: '400px',
    },
    [theme.breakpoints.up('md')]: {
        width: '500px',
    }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        paddingRight: '48px',
        transition: theme.transitions.create('width'),
        width: '100%',
    },
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.7)' 
        : 'rgba(0, 0, 0, 0.54)',
    padding: 6,
    '&:hover': {
        color: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(0, 0, 0, 0.87)',
    }
}));

const StyledAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    width: '100%', 
    position: 'fixed',
    left: 0,
    height: 64, 
    '& .MuiToolbar-root': {
        minHeight: 64,
        padding: theme.spacing(0, 3) 
    }
}));

const TopbarOffset = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar, 
    minHeight: '64px' 
}));

const StyledBadge = styled(Badge)(() => ({
    '& .MuiBadge-badge': {
        transform: 'scale(0.8) translate(50%, -50%)'
    }
}));

const StyledIconStack = styled(Stack)(({ theme }) => ({
    position: 'relative',
    top: '-22px', 
    marginLeft: theme.spacing(2),
}));

const LogoContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    top: '-22px', 
}));

const MenuIconButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    top: '-22px', 
    left: '-30px',
    marginRight: theme.spacing(5),
    color: 'white',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)'
    }
}));

export default function Topbar({ open, handleDrawerOpen, setMode }) {
    const theme = useTheme();
    const token = localStorage.getItem('authToken');
    const decodedToken = decodeToken(token);
    const role = decodedToken?.role;
    // eslint-disable-next-line no-unused-vars
    const { notifications, unreadCount } = useContext(NotificationContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    const searchItems = useMemo(() => {
        if (!role) return [];
        return getSearchItems(role);
    }, [role]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        
        return searchItems.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                item.title.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower)
            );
        });
    }, [searchItems, searchTerm]);

    useEffect(() => {
        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 30000); 
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUnreadMessages = async () => {
        try {
            const response = await getUnreadMessages(token);
            setUnreadMessageCount(response.data.length);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (searchResults.length && showResults) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % searchResults.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (searchResults[selectedIndex]) {
                        navigate(searchResults[selectedIndex].path);
                        setShowResults(false);
                        setSearchTerm('');
                        e.target.blur();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setShowResults(false);
                    setSearchTerm('');
                    e.target.blur();
                    break;
                default:
                    break;
            }
        } else if (e.key === 'Escape') {
            setShowResults(false);
            setSearchTerm('');
            e.target.blur();
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleSearchItemClick = (item) => {
        navigate(item.path);
        setShowResults(false);
        setSearchTerm('');
    };

    return (
        <>
            <StyledAppBar 
                position="fixed" 
                sx={{
                    background: 'linear-gradient(135deg, #064E3B, #0F766E)',
                }}
            >
                <Toolbar>
                    <MenuIconButton
                        color="inherit"
                        aria-label={open ? "close drawer" : "open drawer"}
                        onClick={handleDrawerOpen}
                        edge="start"
                    >
                        {open ? <MenuOpenIcon /> : <MenuIcon />}
                    </MenuIconButton>

                    <LogoContainer>
                        <img 
                            src={logo} 
                            alt="FlowSync" 
                            style={{ 
                                height: 40,
                                marginRight: 10,
                                filter: "brightness(160%)"
                            }} 
                        />
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: "whitesmoke",
                                fontWeight: 600,
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            FlowSync
                        </Typography>
                    </LogoContainer>

                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={() => setShowResults(true)}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                        {searchTerm && (
                            <ClearButton
                                aria-label="clear search"
                                onClick={() => {
                                    setSearchTerm('');
                                    setShowResults(false);
                                }}
                                size="small"
                            >
                                <ClearIcon fontSize="small" />
                            </ClearButton>
                        )}
                        {showResults && searchTerm && (
                            <ClickAwayListener onClickAway={() => setShowResults(false)}>
                                <Box sx={{ position: 'relative', width: '100%' }}>
                                    <SearchResults
                                        results={searchResults}
                                        searchTerm={searchTerm}
                                        selectedIndex={selectedIndex}
                                        onSelect={handleSearchItemClick}
                                        onItemHover={(index) => setSelectedIndex(index)}
                                    />
                                </Box>
                            </ClickAwayListener>
                        )}
                    </Search>

                    <StyledIconStack direction="row" spacing={-0.5}>
                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={() => navigate('/chat')}
                        >
                            <StyledBadge badgeContent={unreadMessageCount} color="error">
                                <MessageIcon />
                            </StyledBadge>
                        </IconButton>

                        <IconButton color='inherit' onClick={() => {
                            localStorage.setItem("currentMode", theme.palette.mode === 'dark' ? 'light' : 'dark');
                            setMode((prevMode) =>
                                prevMode === 'light' ? 'dark' : 'light')
                        }}>
                            {theme.palette.mode === 'light' ? <LightModeOutlined /> : <DarkModeOutlined />}
                        </IconButton>

                        <IconButton color='inherit' onClick={handleClick}>
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsNoneOutlined />
                            </Badge>
                        </IconButton>

                        <IconButton color='inherit'>
                            <Link to="/settings" style={{ color: 'white' }}> 
                                <SettingsOutlined sx={{ mt: 0.8 }}/> 
                            </Link>
                        </IconButton>
                    </StyledIconStack>

                    <Menu
                        id="notification-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        PaperProps={{
                            sx: {
                                maxHeight: '80vh',
                                width: 350,
                                mt: 1.5,
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '6px'
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#888',
                                    borderRadius: '3px'
                                }
                            }
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <NotificationList onClose={handleClose} />
                    </Menu>
                </Toolbar>
            </StyledAppBar>
            <TopbarOffset /> 
        </>
    );
}
