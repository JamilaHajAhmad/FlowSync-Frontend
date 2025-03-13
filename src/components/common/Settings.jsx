import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Accordion, AccordionSummary, AccordionDetails, Switch, Button, Modal } from "@mui/material";
import { ExpandMore, AccountCircle, Lock, Delete, ExitToApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png"; 
import { useState } from "react";
import { toast } from "react-toastify";

const Settings = () => {
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteAccount = () => {
        // Implement account deletion logic here
        setIsDeleteModalOpen(false);
        toast.success("Account deleted successfully!");
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
                    padding: 4,
                }}
            >
                <img src={logo} alt="FlowSync Logo" width={250} />
                <Typography variant="h4" color="#064e3b" fontWeight="bold" marginBottom="5px">
                    Manage Your Preferences
                </Typography>
                <Typography variant="subtitle1" textAlign="center" maxWidth={300}>
                    Customize your account, theme, and security settings in one place.
                </Typography>
            </Box>

            {/* Right Section with Settings Options */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: 4,
                    backgroundColor: "#ffffff",
                    boxShadow: "-2px 0px 10px rgba(0, 0, 0, 0.1)",
                    borderRadius: "10px 0 0 10px"
                }}
            >
                <Typography variant="h4" mb={2} color="#064e3b" fontWeight="bold">
                    Settings
                </Typography>
                
                {/* Profile Settings */}
                <Accordion sx={{ backgroundColor: "#f9f9f9" }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography fontWeight="bold">Profile Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem button onClick={() => navigate("/settings/edit-profile")}>
                                <ListItemIcon><AccountCircle /></ListItemIcon>
                                <ListItemText primary="Edit Profile" sx={{cursor: "pointer"}}/>
                            </ListItem>
                            <ListItem button onClick={() => navigate("/settings/change-password")}>
                                <ListItemIcon><Lock /></ListItemIcon>
                                <ListItemText primary="Change Password" sx={{cursor: "pointer"}}/>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
                
                {/* Account Actions */}
                <Accordion sx={{ backgroundColor: "#f9f9f9" }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography fontWeight="bold">Account Actions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem button onClick={() => navigate("/")}
                                sx={{ "&:hover": { backgroundColor: "#ffcdd2" } }}>
                                <ListItemIcon><ExitToApp color="error" /></ListItemIcon>
                                <ListItemText primary="Logout" sx={{ color: "#D32F2F", cursor: "pointer" }} />
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
                
                {/* Danger Zone */}
                <Accordion sx={{ backgroundColor: "#ffebee" }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography fontWeight="bold" color="error">Danger Zone</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem button onClick={() => setIsDeleteModalOpen(true)}
                                sx={{ "&:hover": { backgroundColor: "#ffcdd2" } }}>
                                <ListItemIcon><Delete color="error" /></ListItemIcon>
                                <ListItemText primary="Delete Account" sx={{ color: "#D32F2F", cursor: "pointer" }} />
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
            </Box>

            {/* Confirm Delete Account Modal */}
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 500,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Confirm Delete Account
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Are you sure you want to delete your account? This action cannot be undone.
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" color="error" onClick={handleDeleteAccount}>
                            Delete
                        </Button>
                        <Button variant="outlined" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default Settings;


