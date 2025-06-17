import React, { useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
} from "@mui/material";
import {
    ExpandMore,
    AccountCircle,
    Lock,
    Delete,
    ExitToApp,
    Security,
    NotificationsActive,
    DeviceHub,
    ArrowBack
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { handleLogout } from "../../utils";
import DeleteAccountModal from './security/DeleteAccountModal';
import { decodeToken } from "../../utils";

const Settings = () => {
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleBackToDashboard = () => {
        const token = localStorage.getItem('authToken');
        const decodedToken = decodeToken(token);
        const role = decodedToken.role;
        if (role.includes('Leader')) {
            navigate('/leader-dashboard');
        } else {
            navigate('/member-dashboard');
        }
    };

    return (
        <Box 
            sx={{ 
                display: "flex", 
                minHeight: "100vh",
                flexDirection: { xs: "column", md: "row" } // Stack on mobile
            }}
        >
            {/* Left Section with Logo and Message */}
            <Box
                sx={{
                    flex: { xs: 1, md: 0.8 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f4f6f8",
                    p: { xs: 2, sm: 3, md: 4 },
                    position: "relative",
                    minHeight: { xs: "30vh", md: "100vh" }
                }}
            >
                {/* Back to Dashboard button */}
                <Box sx={{ 
                    position: { xs: 'static', md: 'absolute' },
                    bottom: 20, 
                    left: 18,
                    mb: { xs: 2, md: 0 },
                    width: { xs: '100%', md: 'auto' }
                }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBackToDashboard}
                        sx={{
                            color: '#064e3b',
                            '&:hover': { bgcolor: '#ecfdf5' },
                            textTransform: 'capitalize',
                            fontWeight: 500,
                            width: { xs: '100%', md: 'auto' }
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </Box>

                <img 
                    src={logo} 
                    alt="FlowSync Logo" 
                    style={{ 
                        width: 'clamp(150px, 30vw, 250px)',
                        height: 'auto'
                    }} 
                />
                <Typography
                    variant="h4"
                    color="#064e3b"
                    fontWeight="bold"
                    mb={1}
                    sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        textAlign: 'center',
                        px: 2
                    }}
                >
                    Manage Your Preferences
                </Typography>
                <Typography
                    variant="subtitle1"
                    textAlign="center"
                    sx={{
                        maxWidth: { xs: '100%', sm: 300 },
                        px: 2,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                >
                    Customize your account, theme, and security settings in one place
                </Typography>
            </Box>

            {/* Right Section with Settings Options */}
            <Box
                sx={{
                    flex: { xs: 1, md: 1 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    p: { xs: 2, sm: 3, md: 4 },
                    backgroundColor: "#ffffff",
                    boxShadow: { xs: "0 -2px 10px rgba(0,0,0,0.1)", md: "-2px 0px 10px rgba(0,0,0,0.1)" },
                    borderRadius: { xs: "10px 10px 0 0", md: "10px 0 0 10px" },
                    position: "relative",
                    minHeight: { xs: "70vh", md: "100vh" }
                }}
            >
                <Typography
                    variant="h4"
                    mb={2}
                    color="#064e3b"
                    fontWeight="bold"
                    sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        px: { xs: 1, sm: 2 }
                    }}
                >
                    Settings
                </Typography>

                {/* Accordion sections with responsive padding */}
                <Box sx={{ mb: { xs: 7, md: 0 } }}> {/* Add bottom margin for logout button */}
                    <Accordion sx={{ bgcolor: "#f9f9f9", m: 0 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight="bold">Profile Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem
                                    button
                                    onClick={() => navigate("/settings/edit-profile")}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <ListItemIcon>
                                        <AccountCircle />
                                    </ListItemIcon>
                                    <ListItemText primary="Edit Profile" />
                                </ListItem>
                                <ListItem
                                    button
                                    onClick={() => navigate("/settings/change-password")}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <ListItemIcon>
                                        <Lock />
                                    </ListItemIcon>
                                    <ListItemText primary="Change Password" />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ bgcolor: "#f9f9f9", m: 0 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight="bold">Security Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem
                                    button
                                    onClick={() => navigate("/settings/security/2fa")}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <ListItemIcon>
                                        <Security />
                                    </ListItemIcon>
                                    <ListItemText primary="Two-Factor Authentication" />
                                </ListItem>
                                <ListItem
                                    button
                                    onClick={() => navigate("/settings/security/login-notifications")}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <ListItemIcon>
                                        <NotificationsActive />
                                    </ListItemIcon>
                                    <ListItemText primary="Login Notifications" />
                                </ListItem>
                                <ListItem
                                    button
                                    onClick={() => navigate("/settings/security/connected-devices")}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <ListItemIcon>
                                        <DeviceHub />
                                    </ListItemIcon>
                                    <ListItemText primary="Connected Devices" />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ bgcolor: "#ffebee", m: 0 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography fontWeight="bold" color="error">Danger Zone</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem
                                    button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#ffcdd2" } }}
                                >
                                    <ListItemIcon>
                                        <Delete color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary="Deactivate Account" sx={{ color: "error.main" }} />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Box>

                {/* Logout Button with responsive positioning */}
                <Box sx={{ 
                    position: { xs: "fixed", md: "absolute" },
                    bottom: { xs: 16, md: 24 },
                    left: { xs: 16, md: 24 },
                    width: { xs: 'calc(100% - 32px)', md: 'auto' },
                    zIndex: 1
                }}>
                    <Button
                        startIcon={<ExitToApp color="error" />}
                        color="error"
                        onClick={() => handleLogout()}
                        sx={{ 
                            textTransform: "capitalize",
                            width: { xs: '100%', md: 'auto' }
                        }}
                    >
                        Log out
                    </Button>
                </Box>

                {/* Delete Account Modal */}
                <DeleteAccountModal 
                    open={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            </Box>
        </Box>
    );
};

export default Settings;
