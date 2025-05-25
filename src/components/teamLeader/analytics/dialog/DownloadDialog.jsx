import { useState } from 'react';
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
    Typography,
    Snackbar,
    Alert
} from '@mui/material';
import { PictureAsPdf, TableView, InsertDriveFile } from '@mui/icons-material';
import { saveReport } from '../../../../services/reportsService';
import { useChartData } from '../../../../context/ChartDataContext';

const DownloadDialog = ({ open, handleClose, handleDownload, reportType }) => {
    const [ fileType, setFileType ] = useState('');
    const { getCurrentDescription } = useChartData();
    const [ snackbar, setSnackbar ] = useState({ open: false, message: '', severity: 'success' });

    const handleSubmit = async () => {
        try {
            const downloadedFile = await handleDownload(fileType);
            console.log('Downloaded file:', downloadedFile);

            const response = await saveReport(
                reportType,
                getCurrentDescription(), 
                downloadedFile
            );
            console.log('Report saved response:', response.data);

            setSnackbar({
                open: true,
                message: 'Report saved successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to save report',
                severity: 'error'
            });
            console.error('Error saving report:', error);
        } finally {
            handleClose();
            setFileType('');
        }
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
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5'
                }}>
                    Download Report
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="file-type-label"
                            sx={{
                                '&.Mui-focused': {
                                    color: '#059669',
                                },
                                '&.MuiInputLabel-shrink': {
                                    background: 'white',
                                    px: 1,
                                    margin: '5px -2px'
                                }
                            }} >Select file type</InputLabel>
                        <Select
                            labelId="file-type-label"
                            value={fileType}
                            label="Select file type"
                            onChange={(e) => setFileType(e.target.value)}
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
                        Download & Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default DownloadDialog;

