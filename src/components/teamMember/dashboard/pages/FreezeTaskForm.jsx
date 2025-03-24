import React, { useState } from "react";
import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField, 
    Button, 
    Typography 
} from "@mui/material";
import { toast } from "react-toastify";

const FreezeTaskForm = ({ open, onClose, task }) => {
    const [formData, setFormData] = useState({
        freezeReason: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.freezeReason) {
            toast.error("Please provide a reason for freezing!");
            return;
        }
        console.log("Task Frozen:", { ...formData, frnNumber: task.frnNumber });
        toast.success("Freeze Task Request has been submitted successfully!");
        onClose();
        setFormData({ freezeReason: "" }); // Reset form
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle
                sx={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5'
                }}
            >
                Freeze Task Request - {task?.frnNumber}
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    mb={3}
                    textAlign="center"
                >
                    Task freezing is subject to team leader confirmation.
                    <br /> 
                    Please provide a valid reason.
                </Typography>

                <form id="freeze-form" onSubmit={handleSubmit}>
                    <TextField
                        label="Reason for Freezing"
                        name="freezeReason"
                        variant="outlined"
                        fullWidth
                        required
                        multiline
                        rows={3}
                        value={formData.freezeReason}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit"
                    form="freeze-form"
                    variant="contained"
                    sx={{
                        backgroundColor: '#059669',
                        '&:hover': {
                            backgroundColor: '#047857'
                        }
                    }}
                >
                    Submit Request
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FreezeTaskForm;
