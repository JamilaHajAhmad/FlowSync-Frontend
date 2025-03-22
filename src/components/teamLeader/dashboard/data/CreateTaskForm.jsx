import React, { useState } from "react";
import {
  Box,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import { Close as CloseIcon } from '@mui/icons-material';
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const caseSources = [
  "Email Inquiry",
  "Phone Call",
  "Walk-in Client",
  "Online Portal",
  "Internal Request",
  "Partner Referral",
  "Social Media",
  "Website Form",
  "Client Meeting",
  "Branch Office",
  "Corporate HQ",
  "Field Agent",
  "Support Ticket",
  "Customer Service",
  "External Audit"
];

const CreateTaskForm = ({ open, onClose }) => {
  const [ formData, setFormData ] = useState({
    frnNumber: "",
    ossNumber: "",
    priority: "Regular",
    employee: "",
    caseType: "",
    caseSource: "",
  });

  const employees = [
    { id: 1, name: "John Doe", ongoingTasks: 3 },
    { id: 2, name: "Jane Smith", ongoingTasks: 1 },
    { id: 3, name: "Michael Brown", ongoingTasks: 5 },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [ e.target.name ]: e.target.value });
  };

  const handleCaseSourceChange = (event, newValue) => {
    setFormData({ ...formData, caseSource: newValue || "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.frnNumber || !formData.ossNumber || !formData.employee || !formData.caseType || !formData.caseSource) {
      toast.error("All fields are required!");
      return;
    }
    console.log("Task Created:", formData);
    toast.success("Task created successfully");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a3d37' }}>
          Create New Task
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          pt: 3
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            '& .MuiFormControl-root': { mt: 3 },
            '& .MuiTextField-root': { mt: 3 },
          }}
        >
          <TextField
            label="FRN Number"
            name="frnNumber"
            fullWidth
            required
            value={formData.frnNumber}
            onChange={handleChange}
          />

          <TextField
            label="OSS Number"
            name="ossNumber"
            fullWidth
            required
            value={formData.ossNumber}
            onChange={handleChange}
          />

          <Box sx={{ mt: 4, mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a3d37' }}>
              Task Priority
            </Typography>
          </Box>

          <RadioGroup
            row
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            sx={{ gap: 2 }}
          >
            <FormControlLabel value="Regular" control={<Radio color="success" />} label="Regular" />
            <FormControlLabel value="Important" control={<Radio color="warning" />} label="Important" />
            <FormControlLabel value="Urgent" control={<Radio color="error" />} label="Urgent" />
          </RadioGroup>

          <FormControl fullWidth>
            <InputLabel id="employee-label">Select Employee</InputLabel>
            <Select
              labelId="employee-label"
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              required
              label="Select Employee"
              sx={{
                '& .MuiSelect-select': { py: 1.5 },
              }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.name}>
                  {emp.name} ({emp.ongoingTasks} tasks)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Case Type"
            name="caseType"
            fullWidth
            required
            value={formData.caseType}
            onChange={handleChange}
          >
          </TextField>

          <Autocomplete
            options={caseSources}
            value={formData.caseSource}
            onChange={handleCaseSourceChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Case Source"
                required
              />
            )}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          bgcolor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          gap: 1
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#64748b',
            borderColor: '#64748b',
            px: 3,
            '&:hover': {
              borderColor: '#475569',
              backgroundColor: 'rgba(100, 116, 139, 0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#059669',
            px: 3,
            '&:hover': {
              bgcolor: '#047857'
            }
          }}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskForm;
