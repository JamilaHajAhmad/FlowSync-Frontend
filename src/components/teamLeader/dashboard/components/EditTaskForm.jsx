import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    IconButton,
    Autocomplete,
    Typography,
    FormHelperText,
    Avatar,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { editTask } from '../../../../services/taskService';
import { getEmployeesWithTasks } from '../../../../services/employeeService';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';

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
    taskTitle: Yup.string()
        .min(3, 'Title must be at least 3 characters')
        .matches(
            /^[A-Za-z0-9\s.,!?'-]+$/,
            'Task title must be in English characters only'
        ),
    frnNumber: Yup.string()
        .matches(/^\d{5}$/, 'FRN Number must be exactly 5 digits'),
    ossNumber: Yup.string()
        .matches(/^\d{12}$/, 'OSS Number must be exactly 12 digits'),
    assignedMemberId: Yup.string(),
    caseType: Yup.string(),
    caseSource: Yup.string()
});

const EditTaskForm = ({ open, onClose, task, onTaskUpdated }) => {
    const [ members, setMembers ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const formik = useFormik({
        initialValues: {
            taskTitle: '',
            assignedMemberId: '',
            frnNumber: '',
            ossNumber: '',
            caseType: '',
            caseSource: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await editTask(task.taskId, {
                    ...values,
                    taskTitle: values.taskTitle, // Ensure this matches the API expectation
                }, token);

                if (response.status === 200) {
                    toast.success('Task updated successfully');
                    onTaskUpdated(); // Call the callback instead of onClose
                }
            } catch (error) {
                console.error('Error updating task:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    // Optionally redirect to login page
                } else {
                    toast.error(error.response?.data || 'Failed to update task');
                }
            } finally {
                setLoading(false);
            }
        }
    });

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getEmployeesWithTasks(token);
                console.log('Fetched members:', response.data);
                setMembers(response.data);
            } catch (error) {
                console.error('Error fetching members:', error);
                toast.error('Failed to load team members');
            }
        };

        if (task) {
            formik.setValues({
                taskTitle: task.title || '',
                taskId: task.taskId || '',
                priority: task.priority || 'Regular',
                assignedMemberId: task.assignedMember?.id || '',
                frnNumber: task.frnNumber || '',
                ossNumber: task.ossNumber || '',
                caseType: task.caseType || '',
                caseSource: task.caseSource || ''
            });
        }

        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ task ]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Authentication token not found');
            onClose();
        }
    }, [ onClose ]);

    // Update the Dialog and its contents with responsive styles
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: { xs: 1, sm: 2 },
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    margin: { xs: 1, sm: 2 },
                    width: { xs: '95%', sm: '100%' },
                    maxHeight: { xs: '95vh', sm: 'auto' }
                }
            }}
        >
            <DialogTitle sx={{
                m: 0,
                p: { xs: 1.5, sm: 2 },
                backgroundColor: '#F9FAFB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography 
                    variant="h6"
                    sx={{ 
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontWeight: 600
                    }}
                >
                    Edit Task
                </Typography>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: 'grey.500',
                        '&:hover': { color: 'grey.700' }
                    }}
                >
                    <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                </IconButton>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
                <DialogContent 
                    sx={{ 
                        p: { xs: 2, sm: 3 }, 
                        pt: { xs: 1, sm: 1 }
                    }}
                >
                    <Box
                        component="form"
                        onSubmit={formik.handleSubmit}
                        sx={{
                            '& .MuiFormControl-root': { mt: { xs: 2, sm: 3 } },
                            '& .MuiTextField-root': { mt: { xs: 2, sm: 3 } },
                        }}
                    >
                        <TextField
                            name="taskTitle"
                            label="Task Title"
                            value={formik.values.taskTitle}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.taskTitle && Boolean(formik.errors.taskTitle)}
                            helperText={formik.touched.taskTitle && formik.errors.taskTitle}
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    padding: { xs: '12px', sm: '16.5px 14px' }
                                }
                            }}
                        />

                        <TextField
                            name="frnNumber"
                            label="FRN Number"
                            value={formik.values.frnNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.frnNumber && Boolean(formik.errors.frnNumber)}
                            helperText={formik.touched.frnNumber && formik.errors.frnNumber}
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    padding: { xs: '12px', sm: '16.5px 14px' }
                                }
                            }}
                        />

                        <TextField
                            name="ossNumber"
                            label="OSS Number"
                            value={formik.values.ossNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.ossNumber && Boolean(formik.errors.ossNumber)}
                            helperText={formik.touched.ossNumber && formik.errors.ossNumber}
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    padding: { xs: '12px', sm: '16.5px 14px' }
                                }
                            }}
                        />
                        <FormControl
                            component="fieldset"
                            sx={{ 
                                mt: { xs: 2, sm: 3 }, 
                                width: '100%' 
                            }}
                        >
                            <Box sx={{ mt: 1, mb: 1 }}>
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
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 0.5, sm: 1 }
                            }}>
                                <Tooltip
                                    title="Priority cannot be changed after task creation"
                                    placement="top"
                                    arrow
                                >
                                    <div style={{ cursor: 'not-allowed' }}> {/* Wrapper div to handle tooltip */}
                                        <RadioGroup
                                            row
                                            sx={{
                                                gap: { xs: 1, sm: 2 },
                                                pointerEvents: 'none',
                                                opacity: 0.7
                                            }}
                                        >
                                            <FormControlLabel
                                                value="Regular"
                                                control={
                                                    <Radio
                                                        color="success"
                                                        checked={formik.values.priority === 'Regular'}
                                                    />
                                                }
                                                label="Regular"
                                            />
                                            <FormControlLabel
                                                value="Important"
                                                control={
                                                    <Radio
                                                        color="warning"
                                                        checked={formik.values.priority === 'Important'}
                                                    />
                                                }
                                                label="Important"
                                            />
                                            <FormControlLabel
                                                value="Urgent"
                                                control={
                                                    <Radio
                                                        color="error"
                                                        checked={formik.values.priority === 'Urgent'}
                                                    />
                                                }
                                                label="Urgent"
                                            />
                                        </RadioGroup>
                                    </div>
                                </Tooltip>
                            </Box>
                        </FormControl>

                        <FormControl
                            fullWidth
                            error={formik.touched.assignedMemberId && Boolean(formik.errors.assignedMemberId)}
                        >
                            <InputLabel sx={{ 
                                fontSize: { xs: '0.875rem', sm: '1rem' } 
                            }}>
                                Selected Member
                            </InputLabel>
                            <Select
                                name="assignedMemberId"
                                value={formik.values.assignedMemberId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                label="Assigned Member"
                                renderValue={(selected) => {
                                    const selectedMember = members.find(member => member.id === selected);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar
                                                src={selectedMember?.pictureURL || '/default-avatar.png'}
                                                alt={selectedMember?.fullName}
                                                sx={{ width: 24, height: 24 }}
                                            />
                                            <Typography>{selectedMember?.fullName}</Typography>
                                        </Box>
                                    );
                                }}
                                sx={{
                                    '& .MuiSelect-select': {
                                        padding: { xs: '12px', sm: '16.5px 14px' },
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                    }
                                }}
                            >
                                {members.map((member) => (
                                    <MenuItem
                                        key={member.id}
                                        value={member.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            padding: { xs: '8px 12px', sm: '12px 16px' },
                                            gap: { xs: 1, sm: 2 }
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: { xs: 1, sm: 1.5 } 
                                        }}>
                                            <Avatar
                                                src={member.pictureURL || '/default-avatar.png'}
                                                alt={member.fullName}
                                                sx={{ 
                                                    width: { xs: 24, sm: 28 }, 
                                                    height: { xs: 24, sm: 28 } 
                                                }}
                                            />
                                            <Typography sx={{ 
                                                fontSize: { xs: '0.875rem', sm: '1rem' } 
                                            }}>
                                                {member.fullName}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                ml: { xs: 1, sm: 2 },
                                                px: { xs: 0.75, sm: 1 },
                                                py: { xs: 0.25, sm: 0.5 },
                                                borderRadius: 1,
                                                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                                                color: '#059669',
                                                fontWeight: 'medium',
                                                fontSize: { xs: '0.75rem', sm: '0.813rem' }
                                            }}
                                        >
                                            {member.ongoingTasks || 0} tasks
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                            {formik.touched.assignedMemberId && formik.errors.assignedMemberId && (
                                <FormHelperText>{formik.errors.assignedMemberId}</FormHelperText>
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
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }
                                    }}
                                />
                            )}
                            fullWidth
                        />

                        <TextField
                            name="caseType"
                            label="Case Type"
                            value={formik.values.caseType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.caseType && Boolean(formik.errors.caseType)}
                            helperText={formik.touched.caseType && formik.errors.caseType}
                            fullWidth
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    backgroundColor: '#F9FAFB',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1.5 }
                }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="inherit"
                        fullWidth={isMobile}
                        sx={{ 
                            borderRadius: 2,
                            order: { xs: 2, sm: 1 }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !formik.isValid}
                        fullWidth={isMobile}
                        sx={{
                            backgroundColor: '#059669',
                            '&:hover': {
                                backgroundColor: '#047857'
                            },
                            borderRadius: 2,
                            order: { xs: 1, sm: 2 }
                        }}
                    >
                        {loading ? 'Updating...' : 'Update Task'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditTaskForm;