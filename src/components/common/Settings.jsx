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
        if (role === 'Leader') {
            navigate('/leader-dashboard');
        } else {
            navigate('/member-dashboard');
        }
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            {/* Left Section with Logo and Message */}
            <Box
                sx={{
                    flex: 0.8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f4f6f8",
                    p: 4,
                }}
            >
                {/* Add Back to Dashboard button at the top */}
                <Box sx={{ position: 'absolute', bottom: 20, left: 18 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBackToDashboard}
                        sx={{
                            color: '#064e3b',
                            '&:hover': {
                                bgcolor: '#ecfdf5'
                            },
                            textTransform: 'capitalize',
                            fontWeight: 500
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </Box>

                <img src={logo} alt="FlowSync Logo" width={250} />
                <Typography
                    variant="h4"
                    color="#064e3b"
                    fontWeight="bold"
                    mb={1}
                >
                    Manage Your Preferences
                </Typography>
                <Typography
                    variant="subtitle1"
                    textAlign="center"
                    maxWidth={300}
                >
                    Customize your account, theme, and security settings in one place
                </Typography>
            </Box>

            {/* Right Section with Settings Options */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    p: 4,
                    backgroundColor: "#ffffff",
                    boxShadow: "-2px 0px 10px rgba(0, 0, 0, 0.1)",
                    borderRadius: "10px 0 0 10px",
                    position: "relative",
                }}
            >
                <Typography
                    variant="h4"
                    mb={2}
                    color="#064e3b"
                    fontWeight="bold"
                >
                    Settings
                </Typography>

                {/* Profile Settings */}
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

                {/* Security Options */}
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

                {/* Danger Zone */}
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

                {/* Logout Button at Bottom Left */}
                <Box sx={{ position: "absolute", bottom: 24, left: 24 }}>
                    <Button
                        startIcon={<ExitToApp color="error" />}
                        color="error"
                        onClick={() => handleLogout()}
                        sx={{ textTransform: "capitalize" }}
                    >
                        Log out
                    </Button>
                </Box>

                {/* Confirm Delete Account Modal */}
                <DeleteAccountModal 
                    open={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                />
            </Box>
        </Box>
    );
};

export default Settings;
