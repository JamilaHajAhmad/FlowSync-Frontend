import * as React from 'react';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Topbar from '../../../common/Topbar';
import Sidebar from './Sidebar';
import getDesignTokens from '../../../../theme';
import Members from '../pages/Members';
import PageHeading from '../../../common/PageHeading';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));


export default function MiniDrawer() {
    const [ open, setOpen ] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    React.useEffect(() => {
        document.title = "FlowSync | Members"
    }
, []);

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
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <DrawerHeader />
                    <PageHeading title="Team Members" subtitle="Manage and oversee your team with ease!"/>
                    <Members />
                </Box>
            </Box>
        </ThemeProvider>
    );
}