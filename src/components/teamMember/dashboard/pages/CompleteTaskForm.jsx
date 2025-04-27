import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    CircularProgress
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    notes: Yup.string()
        .min(10, 'Notes should be at least 10 characters')
        .max(500, 'Notes must not exceed 500 characters')
        .required('Completion notes are required')
});

const CompleteTaskForm = ({ open, onClose, task, onSubmitSuccess }) => {
    const formik = useFormik({
        initialValues: { notes: '' },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await onSubmitSuccess({
                    ...task,
                    completionNotes: values.notes.trim()
                });
                resetForm();
                onClose();
            } catch (error) {
                console.error('Error completing task:', error);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <Dialog
            open={open}
            onClose={formik.isSubmitting ? undefined : onClose}
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
                        Request leader approval to mark task <strong>{task?.frnNumber}</strong> as completed.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        This action requires confirmation from your team leader.
                    </Typography>

                    <TextField
                        fullWidth
                        name="notes"
                        label="Completion Notes"
                        multiline
                        rows={3}
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.notes && Boolean(formik.errors.notes)}
                        helperText={formik.touched.notes && formik.errors.notes}
                        disabled={formik.isSubmitting}
                        placeholder="Please provide details about task completion..."
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
                        onClick={onClose}
                        variant="outlined"
                        color="inherit"
                        disabled={formik.isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                    >
                        {formik.isSubmitting ? 'Submitting...' : 'Request Completion'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CompleteTaskForm;