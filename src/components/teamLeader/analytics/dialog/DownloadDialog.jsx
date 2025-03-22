import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel,
    Box,
    Typography
} from '@mui/material';
import { PictureAsPdf, TableView } from '@mui/icons-material';
import { useState } from 'react';

const DownloadDialog = ({ open, handleClose, handleDownload }) => {
    const [fileType, setFileType] = useState('');
    
    const handleChange = (event) => {
        setFileType(event.target.value);
    };

    const handleSubmit = () => {
        handleDownload(fileType);
        handleClose();
        setFileType('');
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ 
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5'
            }}>
                Download Report
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>File Type</InputLabel>
                    <Select
                        value={fileType}
                        label="File Type"
                        onChange={handleChange}
                        sx={{ mt: 1 }}
                    >
                        <MenuItem value="pdf">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PictureAsPdf color="error" />
                                <Typography>PDF Document</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value="excel">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TableView color="success" />
                                <Typography>Excel Spreadsheet</Typography>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button 
                    onClick={handleClose}
                    variant="outlined"
                    color="inherit"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!fileType}
                    sx={{
                        backgroundColor: '#059669',
                        '&:hover': {
                            backgroundColor: '#047857'
                        }
                    }}
                >
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DownloadDialog;