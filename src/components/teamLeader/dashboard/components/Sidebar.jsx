import React from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MuiDrawer from '@mui/material/Drawer';
import { styled, useTheme } from '@mui/material/styles';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ControlPointOutlinedIcon from '@mui/icons-material/ControlPointOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Typography, Box } from '@mui/material';
import defaultImg from '../../../../assets/images/default.jpg';
import logo from '../../../../assets/images/logo.png';
import { grey } from "@mui/material/colors";

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

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
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

const array1 = [
    { "text": "Create New Task", "icon": <ControlPointOutlinedIcon />, "path": "/create-new-task" },
    { "text": "Dashboard", "icon": <HomeOutlinedIcon />, "path": "/leader-dashboard" },
    { "text": "Tasks", "icon": <AssignmentOutlinedIcon />, "path": "/tasks" },
    { "text": "Team Members", "icon": <GroupOutlinedIcon />, "path": "/members" }
];

const array2 = [
    { "text": "Board", "icon": <GridViewOutlinedIcon />, "path": "/leader-board" },
    { "text": "Calendar", "icon": <CalendarMonthOutlinedIcon />, "path": "/calendar" },
    { "text": "Profile", "icon": <AccountCircleOutlinedIcon />, "path": "/profile" }
];


const array3 = [
    { "text": "Bar Chart", "icon": <BarChartOutlinedIcon />, "path": "/bar-chart" },
    { "text": "Pie Chart", "icon": <PieChartOutlineOutlinedIcon />, "path": "/pie-chart" },
    { "text": "Line Chart", "icon": <TimelineOutlinedIcon />, "path": "/line-chart" }
];



export default function Sidebar({ open, handleDrawerClose }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer variant="permanent" open={open} className='sidebar'>
            <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </DrawerHeader>
            {open && (
                <Box display="flex" alignItems="center" sx={{ mt: -2.5, mx: 5 }}>
                    <img src={logo} alt="Platform Logo" style={{ height: 40, marginRight: 10 }} />
                    <Typography variant="h6" noWrap component="div"
                        sx={{
                            background: "linear-gradient(135deg, #064e3b, #16a34a, #10b981)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            display: "inline-block",
                        }}>
                        FlowSync
                    </Typography>
                </Box>
            )}
            <Avatar sx={{
                mx: "auto",
                my: 1.5,
                width: open ? 65 : 44,
                height: open ? 65 : 44,
                border: "2px solid grey",
                transition: "0.3s"
            }} alt="avatar" src={defaultImg} />
            <Typography align='center' sx={{ fontSize: open ? 17 : 0, mb: 1 }}>John Doe</Typography>
            <Typography align='center' sx={{
                fontSize: open ? 15 : 0, mb: 1, background: "linear-gradient(135deg, #064e3b, #16a34a, #10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
            }}>Team Leader</Typography>
            <List>
                {array1.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton onClick={() => {
                            navigate(item.path);
                        }}
                            sx={[
                                {
                                    minHeight: 48,
                                    px: 2.5,
                                },
                                open
                                    ? {
                                        justifyContent: 'initial',
                                    }
                                    : {
                                        justifyContent: 'center',
                                    },
                                {
                                    bgcolor: location.pathname === item.path ?
                                        theme.palette.mode === 'dark' ?
                                            grey[ 700 ] :
                                            grey[ 300 ] :
                                        null
                                }
                            ]}
                        >
                            <ListItemIcon
                                sx={[
                                    {
                                        minWidth: 0,
                                        justifyContent: 'center',
                                    },
                                    open
                                        ? {
                                            mr: 3,
                                        }
                                        : {
                                            mr: 'auto',
                                        },
                                ]}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={[
                                    open
                                        ? {
                                            opacity: 1,
                                        }
                                        : {
                                            opacity: 0,
                                        },
                                ]}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {array2.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton onClick={() => {
                            navigate(item.path);
                        }}
                            sx={[
                                {
                                    minHeight: 48,
                                    px: 2.5,
                                },
                                open
                                    ? {
                                        justifyContent: 'initial',
                                    }
                                    : {
                                        justifyContent: 'center',
                                    },
                                {
                                    bgcolor: location.pathname === item.path ?
                                        theme.palette.mode === 'dark' ?
                                            grey[ 700 ] :
                                            grey[ 300 ] :
                                        null
                                }
                            ]}
                        >
                            <ListItemIcon
                                sx={[
                                    {
                                        minWidth: 0,
                                        justifyContent: 'center',
                                    },
                                    open
                                        ? {
                                            mr: 3,
                                        }
                                        : {
                                            mr: 'auto',
                                        },
                                ]}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={[
                                    open
                                        ? {
                                            opacity: 1,
                                        }
                                        : {
                                            opacity: 0,
                                        },
                                ]}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {array3.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => {
                                localStorage.clear()
                                navigate(item.path)
                            }}
                            sx={[
                                {
                                    minHeight: 48,
                                    px: 2.5,
                                },
                                open
                                    ? {
                                        justifyContent: 'initial',
                                    }
                                    : {
                                        justifyContent: 'center',
                                    },
                                {
                                    bgcolor: location.pathname === item.path ?
                                        theme.palette.mode === 'dark' ?
                                            grey[ 700 ] :
                                            grey[ 300 ] :
                                        null
                                }
                            ]}
                        >
                            <ListItemIcon
                                sx={[
                                    {
                                        minWidth: 0,
                                        justifyContent: 'center',
                                    },
                                    open
                                        ? {
                                            mr: 3,
                                        }
                                        : {
                                            mr: 'auto',
                                        },
                                ]}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={[
                                    open
                                        ? {
                                            opacity: 1,
                                        }
                                        : {
                                            opacity: 0,
                                        },
                                ]}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    )
}
