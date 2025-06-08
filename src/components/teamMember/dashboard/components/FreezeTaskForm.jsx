import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    CircularProgress
} from "@mui/material";
import { PauseCircleOutline } from "@mui/icons-material";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createFreezeRequest } from '../../../../services/taskService';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    reason: Yup.string()
        .min(10, 'Reason must be at least 10 characters')
        .max(500, 'Reason must not exceed 500 characters')
        .required('Reason is required')
});

const FreezeTaskForm = ({ open, onClose, task, onSubmitSuccess }) => {
    const formik = useFormik({
        initialValues: { reason: '' },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                if (!task.frnNumber) {
                    throw new Error('Task FRN number is missing');
                }

                await createFreezeRequest({
                    frnNumber: task.frnNumber,
                    reason: values.reason.trim()
                }, token);

                onSubmitSuccess({
                    ...task,
                    freezingReason: values.reason.trim()
                });

                resetForm();
                onClose();
                toast.success('Freeze request sent successfully');
            } catch (error) {
                console.error('Error creating freeze request:', error);
                console.log(task)
                toast.error(error.response?.data || 'Failed to create freeze request');
            } finally {
                setSubmitting(false);
            }
        }
    });

    const handleClose = () => {
        formik.resetForm();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={formik.isSubmitting ? undefined : handleClose}
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
                <PauseCircleOutline color="primary" />
                Freeze Request
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
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
                        Request leader approval to freeze task <strong>{task?.frnNumber}</strong>.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        This action requires confirmation from your team leader.
                    </Typography>

                    <TextField
                        fullWidth
                        name="reason"
                        label="Reason for Freezing"
                        multiline
                        rows={3}
                        value={formik.values.reason}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.reason && Boolean(formik.errors.reason)}
                        helperText={formik.touched.reason && formik.errors.reason}
                        disabled={formik.isSubmitting}
                        placeholder="Please provide a detailed reason for freezing this task..."
                        sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: '#4ade80' },
                                '&.Mui-focused fieldset': { borderColor: '#22c55e' }
                            }
                        }}
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
                        onClick={handleClose}
                        variant="outlined"
                        color="inherit"
                        disabled={formik.isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                    >
                        {formik.isSubmitting ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Send Request'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default FreezeTaskForm;