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
  Avatar,
  useTheme,
  useMediaQuery
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
  const [ loading, setLoading ] = useState(false);
  const [ employees, setEmployees ] = useState([]);
  const [ employeesLoading, setEmployeesLoading ] = useState(true);
  const [ employeesError, setEmployeesError ] = useState(null);
  const [ showConfirmation, setShowConfirmation ] = useState(false);
  const [ confirmationData, setConfirmationData ] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  }, [ token ]);

  const mapPriorityToEnum = (priority) => {
    switch (priority) {
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
      toast.error(error.response.data || 'Failed to create task');
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
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            m: { xs: 1, sm: 2 },
            width: { xs: '95%', sm: '100%' },
            maxHeight: { xs: '95vh', sm: 'auto' }
          }
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 2, sm: 3 },
            pb: { xs: 1.5, sm: 2 },
            bgcolor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#1a3d37',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Create New Task
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 16 },
              top: { xs: 8, sm: 16 },
              color: 'grey.500',
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ 
          p: { xs: 2, sm: 3 }, 
          pt: { xs: 2, sm: 3 }
        }}>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
              '& .MuiFormControl-root': { mt: { xs: 2, sm: 3 } },
              '& .MuiTextField-root': { mt: { xs: 2, sm: 3 } },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              },
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                padding: { xs: '12px', sm: '16.5px 14px' }
              }
            }}
          >
            <TextField
              label="Task Title"
              name="title"
              placeholder="Task title in English"
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
              placeholder="5-digits FRN Number"
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
              placeholder="12-digits OSS Number"
              fullWidth
              value={formik.values.ossNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ossNumber && Boolean(formik.errors.ossNumber)}
              helperText={formik.touched.ossNumber && formik.errors.ossNumber}
            />

            <Box sx={{ 
              mt: { xs: 3, sm: 4 }, 
              mb: { xs: 1, sm: 1 }
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1a3d37',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
              >
                Task Priority
              </Typography>
            </Box>



            <RadioGroup
              row={!isMobile}
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              sx={{ 
                gap: { xs: 1, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <FormControlLabel value="Regular" control={<Radio color="success" />} label="Regular" />
              <FormControlLabel value="Important" control={<Radio color="warning" />} label="Important" />
              <FormControlLabel value="Urgent" control={<Radio color="error" />} label="Urgent" />
            </RadioGroup>

            <FormControl
              fullWidth
              error={formik.touched.employee && Boolean(formik.errors.employee)}
            >
              <InputLabel id="employee-label">Select Member</InputLabel>
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
                        {employee.fullName}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 },
                    py: { xs: 1.5, sm: 2 }
                }
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
                        justifyContent: 'space-between', // This ensures proper spacing
                        width: '100%',
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1.5, sm: 2 },
                        '& .MuiAvatar-root': {
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 }
                        },
                        '& .MuiTypography-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={emp.pictureURL}
                          alt={emp.fullName}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Typography>
                          {emp.fullName} 
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 'rgba(5, 150, 105, 0.1)',
                          color: '#059669',
                          fontWeight: 'medium',
                          minWidth: '60px', // Ensure consistent width for the tasks count
                          textAlign: 'center' // Center the text within the pill
                        }}
                      >
                        {emp.ongoingTasks || 0} tasks
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
              sx={{
                '& .MuiAutocomplete-input': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  padding: { xs: '12px', sm: '16.5px 14px' }
              }
              }}
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
              placeholder="Optional"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                notched: true,
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          pt: { xs: 1, sm: 1.5 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1.5 }
        }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            fullWidth={isMobile}
            sx={{
              color: '#64748b',
              borderColor: '#64748b',
              order: { xs: 2, sm: 1 },
              py: { xs: 0.75, sm: 1 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
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
            fullWidth={isMobile}
            sx={{
              bgcolor: '#059669',
              order: { xs: 1, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
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
