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
import { PictureAsPdf, TableView, InsertDriveFile } from '@mui/icons-material'; // Add InsertDriveFile import
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

    const fileTypes = [
        { value: 'pdf', label: 'PDF Document' },
        { value: 'excel', label: 'Excel Spreadsheet' },
        { value: 'csv', label: 'CSV File' } // Add CSV option
    ];

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <PictureAsPdf color="error" />;
            case 'excel':
                return <TableView color="success" />;
            case 'csv':
                return <InsertDriveFile color="primary" />;
            default:
                return null;
        }
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
                                margin: '5px -2px'
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
                        {fileTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getFileIcon(type.value)}
                                    <Typography>{type.label}</Typography>
                                </Box>
                            </MenuItem>
                        ))}
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

