import React from 'react';
import { Link } from 'react-router-dom';
import {
    LightModeOutlined,
    DarkModeOutlined,
    NotificationsNoneOutlined,
    SettingsOutlined,
    Search as SearchIcon,
    Menu as MenuIcon
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
    Menu
} from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { NotificationContext } from "./notification/NotificationContext.js";
import { useState, useContext } from 'react';
import NotificationList from './notification/NotificationList';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
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
        width: 'auto',
    },
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
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const StyledAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    width: '100%', // This ensures the Topbar spans full width
    position: 'fixed',
    left: 0,
    height: 64, // Set a fixed height for the AppBar
    '& .MuiToolbar-root': {
        minHeight: 64, // Match the height
        padding: theme.spacing(0, 3) // Add horizontal padding
    }
}));

const TopbarOffset = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar, // This adds proper toolbar spacing
    minHeight: '64px' // Match the AppBar height
}));

export default function Topbar({ open, handleDrawerOpen, setMode }) {
    const theme = useTheme();
    const { notifications } = useContext(NotificationContext);
    const [anchorEl, setAnchorEl] = useState(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <StyledAppBar 
                position="fixed" 
                sx={{
                    background: 'linear-gradient(135deg, #064E3B, #0F766E)',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label={open ? "close drawer" : "open drawer"}
                        onClick={handleDrawerOpen} // Same function handles both open and close
                        edge="start"
                        sx={{
                            marginRight: 5,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)'
                            }
                        }}
                    >
                        {open ? <MenuOpenIcon /> : <MenuIcon />}
                    </IconButton>

                    <Box 
                        display="flex" 
                        alignItems="center" 
                    >
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
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>

                    <Stack direction="row" spacing={-0.5}>
                    {theme.palette.mode === 'light' ? (
                        <IconButton color='inherit' onClick={() => {
                            localStorage.setItem("currentMode", theme.palette.mode === 'dark' ? 'light' : 'dark');
                            setMode((prevMode) =>
                                prevMode === 'light' ? 'dark' : 'light')
                        }}>
                            <LightModeOutlined />
                        </IconButton>
                    ) : (
                        <IconButton color='inherit' onClick={() => {
                            localStorage.setItem("currentMode", theme.palette.mode === 'dark' ? 'light' : 'dark');
                            setMode((prevMode) =>
                                prevMode === 'light' ? 'dark' : 'light');
                        }}>
                            <DarkModeOutlined />
                        </IconButton>
                    )}
                    <IconButton 
                        color='inherit' 
                        onClick={handleClick}
                        aria-controls="notification-menu"
                        aria-haspopup="true"
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsNoneOutlined />
                        </Badge>
                    </IconButton>

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

                    <IconButton color='inherit'>
                        <Link to="/settings" style={{ color: 'white' }}> 
                            <SettingsOutlined sx={{ mt: -0.5 }}/> 
                        </Link>
                    </IconButton>
                </Stack>
                </Toolbar>
            </StyledAppBar>
            <TopbarOffset /> 
        </>
    );
}
