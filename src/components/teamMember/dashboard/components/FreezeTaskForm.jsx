import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    CircularProgress,
    useTheme,
    useMediaQuery
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
            maxWidth={isMobile ? false : "sm"}
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : '12px',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                    ...(isMobile && {
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        maxHeight: '100vh',
                        maxWidth: '100vw',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        display: 'flex',
                        flexDirection: 'column'
                    }),
                    ...(isTablet && !isMobile && {
                        margin: '16px',
                        width: 'calc(100% - 32px)',
                        maxWidth: '600px'
                    })
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: isMobile ? '16px 16px' : '16px 24px',
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                    fontWeight: 600,
                    ...(isMobile && {
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        backgroundColor: 'white',
                        zIndex: 1,
                        flexShrink: 0
                    })
                }}
            >
                <PauseCircleOutline color="primary" />
                Freeze Request
            </DialogTitle>

            <form onSubmit={formik.handleSubmit} style={{ 
                display: isMobile ? 'flex' : 'block', 
                flexDirection: isMobile ? 'column' : 'initial',
                flex: isMobile ? 1 : 'initial',
                minHeight: isMobile ? 0 : 'initial'
            }}>
                <DialogContent
                    sx={{
                        padding: isMobile ? '16px 16px' : '24px',
                        '& .MuiTypography-root': {
                            color: 'rgba(0, 0, 0, 0.87)',
                            marginBottom: '8px',
                        },
                        ...(isMobile && {
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column'
                        })
                    }}
                >
                    <Typography variant="subtitle1" gutterBottom
                        sx={{
                            fontSize: isMobile ? '0.95rem' : '1rem',
                            lineHeight: isMobile ? 1.4 : 1.5
                        }}
                    >
                        Request leader approval to freeze task <strong>{task?.frnNumber}</strong>.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom
                        sx={{
                            fontSize: isMobile ? '0.85rem' : '0.875rem',
                            lineHeight: isMobile ? 1.3 : 1.43
                        }}
                    >
                        This action requires confirmation from your team leader.
                    </Typography>

                    <TextField
                        fullWidth
                        name="reason"
                        label="Reason for Freezing"
                        multiline
                        rows={isMobile ? 6 : 3}
                        maxRows={isMobile ? 8 : 6}
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
                                '&.Mui-focused fieldset': { borderColor: '#22c55e' },
                                fontSize: isMobile ? '0.9rem' : '1rem'
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: isMobile ? '0.9rem' : '1rem'
                            },
                            '& .MuiFormHelperText-root': {
                                fontSize: isMobile ? '0.75rem' : '0.8125rem'
                            }
                        }}
                    />
                </DialogContent>

                <DialogActions
                    sx={{
                        padding: isMobile ? '16px 16px 24px 16px' : '16px 24px',
                        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                        gap: isMobile ? '8px' : '12px',
                        flexDirection: isMobile ? 'column-reverse' : 'row',
                        ...(isMobile && {
                            backgroundColor: 'white',
                            zIndex: 1,
                            flexShrink: 0,
                            marginTop: 'auto'
                        })
                    }}
                >
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        color="inherit"
                        disabled={formik.isSubmitting}
                        sx={{
                            ...(isMobile && {
                                width: '100%',
                                minHeight: '44px'
                            })
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                        sx={{
                            ...(isMobile && {
                                width: '100%',
                                minHeight: '44px'
                            })
                        }}
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