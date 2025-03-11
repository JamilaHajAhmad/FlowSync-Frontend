import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material";

const FreezeTaskForm = () => {
    const [ formData, setFormData ] = useState({
        taskId: "",
        freezeReason: "",
    });

    const theme = useTheme();

    const handleChange = (e) => {
        setFormData({ ...formData, [ e.target.name ]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.taskId || !formData.freezeReason) {
            toast.error("All fields are required!");
            return;
        }
        console.log("Task Frozen:", formData);
        toast.success("Freeze Task Request has been submitted successfully!")
    };

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", p: 3, boxShadow: 3, borderRadius: 2,
            backgroundColor: theme.palette.mode === "dark" ? "#263238" : "white" }}>
            <Typography variant="body1" textAlign="center" color="gray" mb={3}>
            Task freezing is subject to team leader confirmation.<br/> Please provide a valid reason.
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Task ID"
                    name="taskId"
                    variant="filled"
                    fullWidth
                    required
                    value={formData.taskId}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                />

                <TextField
                    label="Reason for Freezing"
                    name="freezeReason"
                    variant="filled"
                    fullWidth
                    required
                    multiline
                    rows={3}
                    value={formData.freezeReason}
                    onChange={handleChange}
                    sx={{ mb: 3 }}
                />

                <Box sx={{ textAlign: "center" }}>
                    <Button type="submit" variant="contained" color="primary">
                        Freeze Task
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default FreezeTaskForm;
