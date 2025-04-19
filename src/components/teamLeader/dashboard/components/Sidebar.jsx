import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    AssignmentOutlined,
    GroupOutlined,
    AccountCircleOutlined,
    CalendarMonthOutlined,
    Analytics,
    ExitToApp as ExitToAppIcon,
    AddTask as AddTaskIcon
} from '@mui/icons-material';
import MuiDrawer from '@mui/material/Drawer';
import {
    Avatar,
    Typography,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled
} from '@mui/material';
import defaultImg from '../../../../assets/images/default.jpg';

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
    { text: "Dashboard", icon: <HomeOutlined />, path: "/leader-dashboard" },
    { text: "Requests", icon: <AddTaskIcon />, path: "/requests" },
    { text: "Tasks", icon: <AssignmentOutlined />, path: "/team-tasks" },
    { text: "Team Members", icon: <GroupOutlined />, path: "/team" },
    { text: "Calendar", icon: <CalendarMonthOutlined />, path: "/calendar" },
    { text: "Profile", icon: <AccountCircleOutlined />, path: "/profile" },
    { text: "Analytics", icon: <Analytics />, path: "/analytics" }
];

export default function Sidebar({ open }) {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer variant="permanent" open={open}>
            <Box sx={{
                background: 'linear-gradient(135deg, #064E3B, #0F766E)',
                height: '100%',
                color: 'white',
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
                                Team Leader
                            </Typography>
                        </Box>
                    )}
                </Box>

                <List sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    {links.map((link) => {
                        const active = location.pathname === link.path; // Check if active
                        return (
                            <ListItem key={link.text} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                        // Active state styles
                                        ...(active && {
                                            backgroundColor: 'white',
                                            borderRadius: '20px',
                                            borderTopRightRadius: !open ? 0 : '0px',
                                            borderBottomRightRadius: !open ? 0 : '0px',
                                            '&:hover': {
                                                backgroundColor: 'white', // Keep white on hover
                                            },
                                        }),
                                        '&:hover': {
                                            backgroundColor: active ? 'white' : 'rgba(255, 255, 255, 0.08)',
                                        },
                                    }}
                                    onClick={() => navigate(link.path)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 3 : 'auto',
                                            justifyContent: 'center',
                                            color: active ? '#064e3b' : 'white',
                                            '& .MuiSvgIcon-root': { 
                                                color: active ? '#064e3b' : 'inherit',
                                            }
                                        }}
                                    >
                                        {link.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={link.text}
                                        sx={{
                                            opacity: open ? 1 : 0,
                                            color: active ? '#064e3b' : 'white',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

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
