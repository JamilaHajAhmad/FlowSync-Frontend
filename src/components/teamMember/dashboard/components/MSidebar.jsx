import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MuiDrawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useNavigate } from 'react-router-dom';
import { Avatar, Typography, Box } from '@mui/material';
import defaultImg from '../../../../assets/images/default.jpg';
import { ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const drawerWidth = 260;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [ theme.breakpoints.up('sm') ]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, #064E3B, #0F766E)',
            color: '#fff',
            border: 'none',
            marginTop: '64px', // Add top margin to account for Topbar height
            height: `calc(100% - 64px)`, // Adjust height to account for Topbar
            '& .MuiListItemIcon-root': {
                color: '#fff',
            },
            '& .MuiIconButton-root': {
                color: '#fff',
            },
        },
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': {
                        ...openedMixin(theme),
                        marginTop: '64px',
                        height: `calc(100% - 64px)`,
                    },
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': {
                        ...closedMixin(theme),
                        marginTop: '64px',
                        height: `calc(100% - 64px)`,
                    },
                },
            },
        ],
    }),
);

const links = [
    { "text": "Dashboard", "icon": <HomeOutlinedIcon />, "path": "/member-dashboard" },
    { "text": "Tasks", "icon": <AssignmentOutlinedIcon />, "path": "/member-tasks" },
    { "text": "Calendar", "icon": <CalendarMonthOutlinedIcon />, "path": "/member-calendar" },
    { "text": "Profile", "icon": <AccountCircleOutlinedIcon />, "path": "/profile" },
    { "text": "FAQs", "icon": <QuestionMarkIcon />, "path": "/faq" },
    { "text": "Feedback & Support", "icon": <SupportAgentIcon />, "path": "/feedback&support" }
];


export default function MSidebar({ open }) {
    const navigate = useNavigate();

    return (
        <Drawer variant="permanent" open={open} className='sidebar'>
            <Box sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box 
                    sx={{ 
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: open ? 'flex-start' : 'center',
                        transition: '0.2s'
                    }}
                >
                    <Avatar
                        src={defaultImg}
                        sx={{
                            width: open ? 50 : 40,
                            height: open ? 50 : 40,
                            border: "2px solid grey",
                            transition: '0.2s'
                        }}
                    />
                    {open && (
                        <Box sx={{ ml: 2 }}>
                            <Typography 
                                sx={{ 
                                    color: "white",
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    lineHeight: 1.2
                                }}
                            >
                                John Doe
                            </Typography>
                            <Typography 
                                sx={{ 
                                    color: "whitesmoke",
                                    fontSize: '0.8rem',
                                    opacity: 0.8
                                }}
                            >
                                Team Member
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Main Navigation */}
                <List sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    {links.map((item) => (
                        <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    sx={{ 
                                        opacity: open ? 1 : 0,
                                        color: 'white'
                                    }} 
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* Sign Out Button */}
                <List sx={{ mt: 'auto' }}>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                }
                            }}
                            onClick={() => navigate('/')}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}
                            >
                                <ExitToAppIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Sign Out" 
                                sx={{ 
                                    opacity: open ? 1 : 0,
                                    color: 'white',
                                    '& .MuiTypography-root': {
                                        fontWeight: 600
                                    }
                                }} 
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}