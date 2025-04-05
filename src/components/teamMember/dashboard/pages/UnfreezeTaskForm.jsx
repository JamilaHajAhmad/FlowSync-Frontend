import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";
import { PlayCircleOutline } from "@mui/icons-material";

const UnfreezeTaskForm = ({ open, onClose, task, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                <PlayCircleOutline color="primary" />
                Unfreeze Task
            </DialogTitle>
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
                    Are you sure you want to unfreeze task <strong>{task?.frnNumber}</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    This action will move the task back to the "Ongoing" status.
                </Typography>
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
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => onConfirm(task)}
                    variant="contained"
                    color="primary"
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnfreezeTaskForm;
