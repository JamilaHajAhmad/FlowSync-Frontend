import { useEffect, useState } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Typography, Box } from '@mui/material';
import defaultImg from '../../../../assets/images/default.jpg';
import { ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { handleLogout } from '../../../../utils';
import { decodeToken } from '../../../../utils';
import { getProfilePicture } from '../../../../services/profileService';
import BadgeIcon from '@mui/icons-material/Badge';

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
            marginTop: '64px',
            height: `calc(100% - 64px)`,
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
    { "text": "Badges", "icon": <BadgeIcon />, "path": "/badges" },
    { "text": "Calendar", "icon": <CalendarMonthOutlinedIcon />, "path": "/calendar" },
    { "text": "Profile", "icon": <AccountCircleOutlinedIcon />, "path": "/profile" },
    { "text": "FAQs", "icon": <QuestionMarkIcon />, "path": "/faq" },
    { "text": "Feedback & Support", "icon": <SupportAgentIcon />, "path": "/feedback&support" }
];


export default function MSidebar({ open }) {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('authToken');
    const decodedToken = decodeToken(token);
    const userRole = decodedToken?.role;
    const user = localStorage.getItem('user');
    const userName = user ? JSON.parse(user).displayName : 'User';
    const [ profilePicture, setProfilePicture ] = useState(null);

    useEffect(() => {
        const fetchProfilePicture = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const pictureURL = await getProfilePicture(token);
                    console.log('Fetched picture URL:', pictureURL);
                    setProfilePicture(pictureURL);
                } catch (error) {
                    console.error('Error fetching profile picture:', error);
                    setProfilePicture(null);
                }
            }
        };

        fetchProfilePicture();
    }, []);

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
                        src={profilePicture || 'avatar/default.jpg'}
                        alt={userName}
                        onError={(e) => {
                            console.log('Error loading profile picture, falling back to default');
                            e.target.src = defaultImg;
                        }}
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
                                {userName}
                            </Typography>
                            <Typography
                                sx={{
                                    color: "whitesmoke",
                                    fontSize: '0.8rem',
                                    opacity: 0.8
                                }}
                            >
                                Team {userRole}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Main Navigation */}
                <List sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    {links.map((link) => {
                        const active = location.pathname === link.path;
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
                                                backgroundColor: 'white',
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
                            onClick={() => handleLogout()}
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