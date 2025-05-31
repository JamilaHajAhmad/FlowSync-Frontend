import { useState, useEffect } from "react";
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
  IconButton,
  Avatar
} from "@mui/material";
import { Close as CloseIcon } from '@mui/icons-material';
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { createTask } from "../../../../services/taskService";
import { getEmployeesWithTasks } from '../../../../services/employeeService';
import TaskConfirmationDialog from './TaskConfirmationDialog';

const caseSources = [
  'JebelAli',          
  'AlRaffa',              
  'AlRashidiya',          
  'AlBarsha',             
  'BurDubai',            
  'Lahbab',               
  'AlFuqaa',              
  'Ports',                
  'AlQusais',             
  'AlMuraqqabat',         
  'Naif',                 
  'AlKhawanij',        
  'Hatta',                
  'AirportSecurity',      
  'PublicProsecution',    
  'DubaiMunicipality',    
  'DubaiCustoms',         
  'RasAlKhaimah',         
  'UmmAlQuwain',      
  'Ajman',                
  'AbuDhabi',             
  'Fujairah',             
  'Sharjah',              
  'Forensics',            
  'MinistryOfDefense'     
];

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Task title is required')
    .min(3, 'Title must be at least 3 characters')
    .matches(
      /^[A-Za-z0-9\s.,!?'-]+$/,
      'Task title must be in English characters only'
    ),
  frnNumber: Yup.string()
    .required('FRN Number is required')
    .matches(/^\d{5}$/, 'FRN Number must be exactly 5 digits'),
  ossNumber: Yup.string()
    .required('OSS Number is required')
    .matches(/^\d{12}$/, 'OSS Number must be exactly 12 digits'),
  priority: Yup.string()
    .required('Priority is required'),
  selectedMemberId: Yup.string()
    .required('Employee selection is required'),
  caseType: Yup.string(),
  caseSource: Yup.string()
    .required('Case source is required'),
});

const CreateTaskForm = ({ open, onClose }) => {
  const token = localStorage.getItem('authToken');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  // Add useEffect to fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
        try {
            setEmployeesLoading(true);
            const data = await getEmployeesWithTasks(token);
            console.log('Fetched employees:', data.data);
            // Sort by tasks count, then alphabetically
            const sortedEmployees = data.data.sort((a, b) => {
                const taskDiff = a.ongoingTasks - b.ongoingTasks;
                // If task counts are equal, sort alphabetically
                return taskDiff === 0 ? 
                    a.fullName.localeCompare(b.fullName) : 
                    taskDiff;
            });
            setEmployees(sortedEmployees);
        } catch (error) {
            setEmployeesError(error.message);
            toast.error('Failed to load employees');
        } finally {
            setEmployeesLoading(false);
        }
    };

    fetchEmployees();
  }, [token]);

  const mapPriorityToEnum = (priority) => {
    switch(priority) {
      case 'Regular': return 1;
      case 'Important': return 2;
      case 'Urgent': return 0;
      default: return 0;
    }
  };

  const handleSubmit = (values) => {
    const selectedEmployee = employees.find(emp => emp.id === values.selectedMemberId);
    
    setConfirmationData({
      ...values,
      selectedMemberName: selectedEmployee?.fullName,
      pictureURL: selectedEmployee?.pictureURL
    });
    setShowConfirmation(true);
  };

  // Add updateEmployeeTaskCount to update a specific employee's task count
  const updateEmployeeTaskCount = (employeeId) => {
    setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
            emp.id === employeeId
                ? { ...emp, ongoingTasks: emp.ongoingTasks + 1 }
                : emp
        )
    );
  };

  // Update the handleConfirm function
  const handleConfirm = async () => {
    try {
        setLoading(true);
        const payload = {
            ...confirmationData,
            priority: mapPriorityToEnum(confirmationData.priority),
            type: 'Opened'
        };
        
        const response = await createTask(payload, token);
        console.log('Task created successfully:', response.data);
        
        // Update the task count immediately
        updateEmployeeTaskCount(confirmationData.selectedMemberId);
        
        toast.success('Task created successfully');
        onClose();
        formik.resetForm();
    } catch (error) {
        console.error('Error creating task:', error);
        toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
        setLoading(false);
        setShowConfirmation(false);
    }
  };

  // Update formik config
  const formik = useFormik({
    initialValues: {
      title: '',
      frnNumber: '',
      ossNumber: '',
      priority: 'Regular', 
      caseType: '',
      caseSource: '',
      selectedMemberId: '',
      type: 'Opened',
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  return (
    <>
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
                name="selectedMemberId"
                value={formik.values.selectedMemberId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Select Employee"
                disabled={employeesLoading}
                renderValue={(selected) => {
                    const employee = employees.find(emp => emp.id === selected);
                    if (!employee) return '';
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                                src={employee.pictureURL}
                                alt={employee.fullName}
                                sx={{ width: 24, height: 24 }}
                            />
                            <Typography>
                                {employee.fullName} ({employee.ongoingTasks} tasks)
                            </Typography>
                        </Box>
                    );
                }}
              >
                {employeesLoading ? (
                  <MenuItem disabled>Loading employees...</MenuItem>
                ) : employeesError ? (
                  <MenuItem disabled>Error loading employees</MenuItem>
                ) : Array.isArray(employees) && employees.length > 0 ? (
                  employees.map((emp) => (
                    <MenuItem 
                      key={emp.id} 
                      value={emp.id}
                      sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                      }}
                    >
                      <Avatar
                          src={emp.pictureURL}
                          alt={emp.fullName}
                          sx={{ width: 24, height: 24 }}
                      />
                      <Typography>
                          {emp.fullName} ({emp.ongoingTasks} tasks)
                      </Typography>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No employees available</MenuItem>
                )}
              </Select>
              {formik.touched.selectedMemberId && formik.errors.selectedMemberId && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {formik.errors.selectedMemberId}
                </Typography>
              )}
            </FormControl>

          
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
                  name="caseSource"
                  error={formik.touched.caseSource && Boolean(formik.errors.caseSource)}
                  helperText={formik.touched.caseSource && formik.errors.caseSource}
                />
              )}

              fullWidth
            />
              <TextField
  label="Case Type"
  name="caseType"
  fullWidth
  value={formik.values.caseType}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  error={formik.touched.caseType && Boolean(formik.errors.caseType)}
  helperText={formik.touched.caseType && formik.errors.caseType}
  placeholder="(Optional)"
  InputLabelProps={{
    shrink: true,
  }}
  InputProps={{
    notched: true,
  }}
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

      <TaskConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        taskData={confirmationData}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
};

export default CreateTaskForm;
