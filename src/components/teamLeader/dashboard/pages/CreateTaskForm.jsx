import React, { useState } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
import { createTask } from "../../../../services/taskService";

const caseSources = [
  "جبل علي",
  "الرفاعة",
  "الراشدية",
  "البرشاء",
  "بردبي",
  "لهباب",
  "الفقع",
  "الموانئ",
  "القصيص",
  "المرقبات",
  "نايف",
  "الخوانيج",
  "حتا",
  "أمن المطارات",
  "النيابة العامة",
  "بلدية دبي",
  "جمارك دبي",
  "رأس الخيمة",
  "أم القيوين",
  "عجمان",
  "أبوظبي",
  "الفجيرة",
  "الشارقة",
  "الطب الشرعي",
  "وزارة الدفاع"
];

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Task title is required')
    .min(3, 'Title must be at least 3 characters'),
  frnNumber: Yup.string()
    .required('FRN Number is required'),
  ossNumber: Yup.string()
    .required('OSS Number is required'),
  priority: Yup.string()
    .required('Priority is required'),
  employee: Yup.string()
    .required('Employee selection is required'),
  caseType: Yup.string(),
  caseSource: Yup.string()
    .required('Case source is required'),
});

const CreateTaskForm = ({ open, onClose }) => {
  const token = localStorage.getItem('authToken');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      frnNumber: '',
      ossNumber: '',
      priority: 'Regular',
      employee: '',
      caseType: '',
      caseSource: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await createTask(values, token);
        toast.success('Task created successfully');
        onClose();
        formik.resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create task');
      } finally {
        setLoading(false);
      }
    },
  });

  const employees = [
    { id: 1, name: "John Doe", ongoingTasks: 3 },
    { id: 2, name: "Jane Smith", ongoingTasks: 1 },
    { id: 3, name: "Michael Brown", ongoingTasks: 5 },
  ];

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

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            '& .MuiFormControl-root': { mt: 3 },
            '& .MuiTextField-root': { mt: 3 },
          }}
        >
          <TextField
            label="Task Title"
            name="title"
            fullWidth
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />

          <TextField
            label="FRN Number"
            name="frnNumber"
            fullWidth
            value={formik.values.frnNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.frnNumber && Boolean(formik.errors.frnNumber)}
            helperText={formik.touched.frnNumber && formik.errors.frnNumber}
          />

          <TextField
            label="OSS Number"
            name="ossNumber"
            fullWidth
            value={formik.values.ossNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.ossNumber && Boolean(formik.errors.ossNumber)}
            helperText={formik.touched.ossNumber && formik.errors.ossNumber}
          />

          <Box sx={{ mt: 4, mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a3d37' }}>
              Task Priority
            </Typography>
          </Box>

          <RadioGroup
            row
            name="priority"
            value={formik.values.priority}
            onChange={formik.handleChange}
            sx={{ gap: 2 }}
          >
            <FormControlLabel value="Regular" control={<Radio color="success" />} label="Regular" />
            <FormControlLabel value="Important" control={<Radio color="warning" />} label="Important" />
            <FormControlLabel value="Urgent" control={<Radio color="error" />} label="Urgent" />
          </RadioGroup>

          <FormControl 
            fullWidth
            error={formik.touched.employee && Boolean(formik.errors.employee)}
          >
            <InputLabel id="employee-label">Select Employee</InputLabel>
            <Select
              labelId="employee-label"
              name="employee"
              value={formik.values.employee}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Select Employee"
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.name}>
                  {emp.name} ({emp.ongoingTasks} tasks)
                </MenuItem>
              ))}
            </Select>
            {formik.touched.employee && formik.errors.employee && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {formik.errors.employee}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Case Type"
            name="caseType"
            fullWidth
            value={formik.values.caseType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.caseType && Boolean(formik.errors.caseType)}
            helperText={formik.touched.caseType && formik.errors.caseType}
          />

          <Autocomplete
            options={caseSources}
            value={formik.values.caseSource}
            onChange={(_, newValue) => {
              formik.setFieldValue('caseSource', newValue || '');
            }}
            onBlur={formik.handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Case Source"
                error={formik.touched.caseSource && Boolean(formik.errors.caseSource)}
                helperText={formik.touched.caseSource && formik.errors.caseSource}
              />
            )}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
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
          type="submit"
          variant="contained"
          disabled={loading}
          onClick={formik.handleSubmit}
          sx={{
            bgcolor: '#059669',
            px: 3,
            '&:hover': {
              bgcolor: '#047857'
            }
          }}
        >
          {loading ? "Creating..." : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskForm;
