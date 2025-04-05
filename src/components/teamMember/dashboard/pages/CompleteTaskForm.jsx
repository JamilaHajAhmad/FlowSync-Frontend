import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { useState } from "react";

const CompleteTaskForm = ({ open, onClose, task, onConfirm }) => {
    const [notes, setNotes] = useState("");

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle 
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '16px 24px',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                }}
            >
                <CheckCircleOutline color="success" />
                Complete Task
            </DialogTitle>
            <DialogContent 
                sx={{
                    padding: '24px',
                    '& .MuiTypography-root': {
                        color: 'rgba(0, 0, 0, 0.87)',
                        marginBottom: '8px',
                    },
                }}
            >
                <Typography variant="subtitle1" gutterBottom>
                    Request leader approval to mark task <strong>{task?.frnNumber}</strong> as completed.
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    This action requires confirmation from your team leader.
                </Typography>
                <TextField
                    fullWidth
                    label="Notes (Optional)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes or comments here..."
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions 
                sx={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                    gap: '12px',
                }}
            >
                <Button 
                    onClick={onClose} 
                    variant="outlined" 
                    color="inherit"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={() => {
                        onConfirm({ ...task, notes });
                        setNotes(""); // Clear notes after submission
                    }} 
                    variant="contained" 
                    color="success"
                >
                    Request Completion
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CompleteTaskForm;