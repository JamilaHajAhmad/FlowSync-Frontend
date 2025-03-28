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
                <FormControl fullWidth variant="outlined">
                    <InputLabel 
                        id="file-type-label"
                        sx={{
                            '&.Mui-focused': {
                                color: '#059669',
                            },
                            '&.MuiInputLabel-shrink': {
                                background: 'white',
                                px: 1,
                            }
                        }}
                    >
                        Select file type
                    </InputLabel>
                    <Select
                        labelId="file-type-label"
                        value={fileType}
                        label="Select file type"
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e0e0e0',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#059669',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#059669',
                            }
                        }}
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