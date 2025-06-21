import * as React from 'react';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Topbar from '../../../common/Topbar';
import Sidebar from './Sidebar';
import getDesignTokens from '../../../../theme';
import PageHeading from '../../../common/PageHeading';
import Tasks from '../pages/Tasks';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

export default function MiniDrawer() {
    const [ open, setOpen ] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    React.useEffect(() => {
        document.title = "FlowSync | Team Tasks";
    }, []);

    const [ mode, setMode ] = React.useState(
        localStorage.getItem("currentMode") ? 
        localStorage.getItem("currentMode") :
        "light");
    const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [ mode ]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Topbar open={open} handleDrawerOpen={handleDrawerOpen} setMode={setMode} />
                <Sidebar open={open} />
                <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
                    <DrawerHeader />
                    <PageHeading title="Team Tasks Overview" subtitle="Manage and monitor the progress of your team's tasks efficiently" />
                    <Tasks 
                        hideCreateButton={false} 
                        showTabs={true}
                        containerWidth="100%"
                        tabsAlignment="left"
                        showTitle={false}
                        showToolbarBorder={false}
                    />
                </Box>
            </Box>
        </ThemeProvider>
    );
}