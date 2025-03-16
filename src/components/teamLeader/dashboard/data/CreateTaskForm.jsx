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
  InputLabel
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useTheme } from '@mui/material/styles';

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

const CreateTaskForm = () => {
  const [ formData, setFormData ] = useState({
    frnNumber: "",
    ossNumber: "",
    priority: "Regular",
    employee: "",
    caseType: "",
    caseSource: "",
  });

  const theme = useTheme();

  const employees = [
    { id: 1, name: "John Doe", ongoingTasks: 3 },
    { id: 2, name: "Jane Smith", ongoingTasks: 1 },
    { id: 3, name: "Michael Brown", ongoingTasks: 5 },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [ e.target.name ]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation: Ensure required fields are filled
    if (!formData.frnNumber || !formData.ossNumber || !formData.employee || !formData.caseType || !formData.caseSource) {
      toast.error("All fields are required!");
      return;
    }
    console.log("Task Created:", formData);
    toast.success("Task created successfully");
  };

  return (
    <Box sx={{
      maxWidth: 500, mx: "auto", p: 3
    }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="FRN Number"
          name="frnNumber"
          variant="filled"
          fullWidth
          required
          value={formData.frnNumber}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="OSS Number"
          name="ossNumber"
          variant="filled"
          fullWidth
          required
          value={formData.ossNumber}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Typography variant="body1" fontWeight="bold">Task Priority</Typography>
        <RadioGroup row name="priority" value={formData.priority} onChange={handleChange} sx={{ mb: 2 }}>
          <FormControlLabel value="Regular" control={<Radio />} label="Regular" />
          <FormControlLabel value="Important" control={<Radio />} label="Important" />
          <FormControlLabel value="Urgent" control={<Radio />} label="Urgent" />
        </RadioGroup>

        <FormControl fullWidth variant="filled" sx={{ mb: 2 }}>
          <InputLabel>Select Employee</InputLabel>
          <Select name="employee" value={formData.employee} onChange={handleChange} required>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.name}>
                {emp.name} (Ongoing: {emp.ongoingTasks})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Case Type"
          name="caseType"
          variant="filled"
          fullWidth
          required
          value={formData.caseType}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>Case Source</Typography>
          <input
            type="text"
            name="caseSource"
            value={formData.caseSource}
            onChange={handleChange}
            list="caseSourceOptions"
            placeholder="Select or type case source"
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
              color: theme.palette.text.primary,
              '&:focus': {
                outline: 'none',
                borderColor: theme.palette.primary.main,
              }
            }}
          />
          <datalist id="caseSourceOptions">
            {caseSources.map((source, index) => (
              <option key={index} value={source} />
            ))}
          </datalist>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateTaskForm;
