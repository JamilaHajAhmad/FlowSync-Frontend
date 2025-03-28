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
    Toolbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

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

                    <Stack direction="row">
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
                    <IconButton color='inherit'>
                        <NotificationsNoneOutlined />
                    </IconButton>
                    <IconButton color='inherit' sx={{ marginTop: -1.1 }}>
                        <Link to="/settings" style={{ color: 'white' }}> <SettingsOutlined /> </Link>
                    </IconButton>
                </Stack>
                </Toolbar>
            </StyledAppBar>
            <TopbarOffset /> 
        </>
    );
}
