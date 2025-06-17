import * as React from 'react';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Topbar from '../Topbar';
import Sidebar from '../../teamLeader/dashboard/components/Sidebar';
import MSidebar from '../../teamMember/dashboard/components/MSidebar';
import getDesignTokens from '../../../theme';
import PageHeading from '../PageHeading';
import Calendar from './Calendar';
import { decodeToken } from '../../../utils';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));


export default function MiniDrawer() {
    const [open, setOpen] = React.useState(false);
    const [userRole, setUserRole] = React.useState(null);

    React.useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded = decodeToken(token);
            setUserRole(decoded.role);
        }
    }, []);

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    const [mode, setMode] = React.useState(
        localStorage.getItem("currentMode") ? 
        localStorage.getItem("currentMode") :
        "light"
    );
    
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    const renderSidebar = () => {
            if (!userRole) return null; // انتظر حتى يتم تحديد الدور

        console.log('Rendering sidebar for role:', userRole); // Debug log
        if (userRole.includes('Leader')) { // Leader role
            return <Sidebar open={open} />;
        } else if (userRole.includes('Member')) { // Member role
            return <MSidebar open={open} />;
        }
        return null;
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Topbar open={open} handleDrawerOpen={handleDrawerOpen} setMode={setMode} />
                {renderSidebar()}
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <DrawerHeader />
                    <PageHeading 
                        title="Your Calendar"
                        subtitle="Manage your workflow efficiently with a calendar tailored to you" 
                    />
                    <Calendar />
                </Box>
            </Box>
        </ThemeProvider>
    );
}