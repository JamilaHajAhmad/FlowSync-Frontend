import { Box, IconButton, Tooltip } from '@mui/material';
import { Download } from '@mui/icons-material';
import Sidebar from '../../dashboard/components/Sidebar';
import Topbar from '../../../common/Topbar';
import DownloadDialog from '../dialog/DownloadDialog';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const Layout = ({ children, data }) => {
    const [ open, setOpen ] = useState(false);
    const [ mode, setMode ] = useState('light');
    const [downloadOpen, setDownloadOpen] = useState(false);

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    const handleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const handleDownload = (fileType) => {
        const chartElement = document.querySelector('.chart-container');
        
        if (fileType === 'pdf') {
            const pdf = new jsPDF('landscape');
            pdf.html(chartElement, {
                callback: function(pdf) {
                    pdf.save('chart-report.pdf');
                },
                x: 10,
                y: 10,
                width: chartElement.clientWidth,
                windowWidth: 1000
            });
        } else if (fileType === 'excel') {
            // Ensure data is in the correct format for Excel
            const exportData = Array.isArray(data) ? data : [data];
            
            try {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Chart Data");
                XLSX.writeFile(wb, "chart-report.xlsx");
            } catch (error) {
                console.error("Error creating Excel file:", error);
                toast.error("Failed to generate Excel file. Please check the data format.");
            }
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Topbar open={open} handleDrawerOpen={handleDrawerOpen} setMode={handleMode} />
            <Sidebar open={open} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    width: { sm: `calc(100% - ${open ? 240 : 64}px)` }
                }}
            >
                <Box sx={{ 
                    backgroundColor: mode === 'light' ? '#f4f6f8' : '#1b1c1d', 
                    height: '100vh', 
                    width: '100%',
                    position: 'relative'
                }}>
                    <Tooltip title="Download Report" placement="left">
                        <IconButton 
                            onClick={() => setDownloadOpen(true)}
                            sx={{ 
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                backgroundColor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: mode === 'light' ? '#f5f5f5' : 'rgba(255,255,255,0.2)'
                                },
                                zIndex: 100
                            }}
                        >
                            <Download />
                        </IconButton>
                    </Tooltip>
                    <div className="chart-container" style={{ height: '100%', width: '100%' }}>
                        {children}
                    </div>
                </Box>
            </Box>
            <DownloadDialog 
                open={downloadOpen}
                handleClose={() => setDownloadOpen(false)}
                handleDownload={handleDownload}
            />
        </Box>
    );
}

export default Layout;