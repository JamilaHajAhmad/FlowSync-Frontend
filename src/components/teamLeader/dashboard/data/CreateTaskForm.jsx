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
  Autocomplete
} from "@mui/material";
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

const CreateTaskForm = () => {
  const [formData, setFormData] = useState({
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 3 }}>
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

        <Autocomplete
          options={caseSources}
          value={formData.caseSource}
          onChange={handleCaseSourceChange}
          disablePortal
          PopperProps={{
            placement: 'bottom-start',
            style: {
              width: 'fit-content'
            }
          }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Case Source" 
              variant="filled" 
              required 
            />
          )}
          fullWidth
          sx={{ 
            mb: 2,
            '& .MuiAutocomplete-popper': {
              position: 'absolute',
              zIndex: 1000
            }
          }}
        />

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
