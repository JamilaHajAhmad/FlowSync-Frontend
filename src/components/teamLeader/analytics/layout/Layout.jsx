import { Box, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { Download, ArrowBack } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../../dashboard/components/Sidebar';
import Topbar from '../../../common/Topbar';
import DownloadDialog from '../dialog/DownloadDialog';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { useChartData } from '../../../../context/ChartDataContext';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [ open, setOpen ] = useState(false);
    const [ mode, setMode ] = useState('light');
    const [downloadOpen, setDownloadOpen] = useState(false);
    const { chartData, getCurrentReportType } = useChartData();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    const handleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const formatDataForExport = (data) => {
        if (!data || !data.rawData || !data.type) {
            console.warn('Invalid data format:', data);
            return [];
        }

        const rawData = Array.isArray(data.rawData.date) ? data.rawData.date : [];
        
        switch (data.type) {
            case 'bar':
                // Get unique members
                { const members = [...new Set(rawData.map(item => item.member))];
                
                // Create a map to store task counts for each member
                return members.map(member => {
                    const memberTasks = rawData.filter(task => task.member === member);
                    
                    // Initialize task counts
                    const taskCounts = {
                        'Team Member': member,
                        'Opened Tasks': 0,
                        'Completed Tasks': 0,
                        'Frozen Tasks': 0,
                        'Delayed Tasks': 0
                    };
                    
                    // Sum up tasks by status
                    memberTasks.forEach(task => {
                        switch (task.status) {
                            case 'Opened':
                                taskCounts['Opened Tasks'] = task.count;
                                break;
                            case 'Completed':
                                taskCounts['Completed Tasks'] = task.count;
                                break;
                            case 'Frozen':
                                taskCounts['Frozen Tasks'] = task.count;
                                break;
                            case 'Delayed':
                                taskCounts['Delayed Tasks'] = task.count;
                                break;
                            default:
                                break;
                        }
                    });
                    
                    // Calculate total tasks
                    taskCounts['Total Tasks'] = Object.values(taskCounts)
                        .filter(value => typeof value === 'number')
                        .reduce((a, b) => a + b, 0);
                    
                    return taskCounts;
                }); }

            case 'line':
                return rawData.map(item => ({
                    'Year': item.year,
                    'Month': item.month,
                    'Created Tasks': item.created,
                    'Completed Tasks': item.completed,
                    'Task Completion Rate': item.created > 0 ? 
                        `${((item.completed / item.created) * 100).toFixed(2)}%` : '0%'
                }));
                
            case 'pie':
                { const total = rawData.reduce((sum, item) => sum + item.count, 0);
                return rawData.map(item => ({
                    'Status': item.status.type,
                    'Count': item.count,
                    'Percentage': `${((item.count / total) * 100).toFixed(2)}%`
                })); }
                
            case 'stacked':
                return rawData.map(item => ({
                    'Date': new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }),
                    'Activity Count': item.count,
                    'Week Day': new Date(item.date).toLocaleString('en-US', { weekday: 'long' }),
                    'Month': new Date(item.date).toLocaleString('en-US', { month: 'long' })
                }));
                
            case 'heatmap':
                { const departments = [...new Set(rawData.map(item => item.department))].sort();
                const statuses = [...new Set(rawData.map(item => item.status))].sort();
                
                const countMap = new Map(
                    rawData.map(item => [`${item.department}-${item.status}`, item.count])
                );
                
                return departments.map(dept => {
                    const row = { Department: dept };
                    statuses.forEach(status => {
                        row[`${status} Tasks`] = countMap.get(`${dept}-${status}`) || 0;
                    });
                    
                    row['Total Tasks'] = statuses.reduce((sum, status) => 
                        sum + (countMap.get(`${dept}-${status}`) || 0), 0
                    );
                    
                    return row;
                }); }
                
            case 'funnel': {
                const groupedByType = rawData.reduce((acc, item) => {
                    if (!acc[item.type]) {
                        acc[item.type] = {
                            type: item.type,
                            count: 0,
                            months: new Set()
                        };
                    }
                    acc[item.type].count += item.count;
                    acc[item.type].months.add(`${item.year}-${String(item.month).padStart(2, '0')}`);
                    return acc;
                }, {});

                const sortedData = Object.values(groupedByType).sort((a, b) => b.count - a.count);

                return sortedData.map(item => ({
                    'Activity Type': item.type,
                    'Count': item.count,
                    'Months Active': Array.from(item.months).join(', '),
                    'Conversion Rate': calculateConversionRate(sortedData, item)
                }));
            }
            
            default:
                console.warn('Unknown chart type:', data.type);
                return [];
        }
    };

    const calculateConversionRate = (data, currentItem) => {
        const sortedData = [...data].sort((a, b) => b.count - a.count);
        const currentIndex = sortedData.findIndex(item => item.type === currentItem.type);
        
        if (currentIndex === 0) return '100%';
        
        const previousCount = sortedData[currentIndex - 1].count;
        const conversionRate = (currentItem.count / previousCount) * 100;
        
        return `${conversionRate.toFixed(2)}%`;
    };

    const handleDownload = async (fileType) => {
        if (!chartData) {
            toast.error('No data available for export');
            return;
        }

        const exportData = formatDataForExport(chartData);
        console.log('Formatted export data:', exportData); // Debug log

        if (fileType === 'csv') {
            try {
                if (!exportData || exportData.length === 0) {
                    throw new Error('No data to export');
                }

                // Get all possible headers from all objects
                const headers = [...new Set(exportData.flatMap(obj => Object.keys(obj)))];
                
                // Create CSV rows with all possible columns
                const rows = exportData.map(row => 
                    headers.map(header => {
                        const value = row[header] ?? '';
                        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                    }).join(',')
                );

                const csvContent = [headers.join(','), ...rows].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const fileName = `chart-data-${new Date().toISOString().slice(0,10)}.csv`;
                
                // Create File object with correct type
                const file = new File([blob], fileName, { type: 'text/csv' });

                // Trigger download
                const downloadUrl = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);

                return {
                    file,
                    fileName,
                    fileType: 'csv'
                };
            } catch (error) {
                console.error('CSV generation error:', error);
                toast.error(`Failed to generate CSV file: ${error.message}`);
                return null;
            }
        } else if (fileType === 'excel') {
            try {
                if (!exportData || exportData.length === 0) {
                    throw new Error('No data to export');
                }

                // Create workbook
                const wb = XLSX.utils.book_new();

                // Add data worksheet
                const ws_data = XLSX.utils.json_to_sheet(exportData);

                // Style the worksheet
                ws_data['!cols'] = Object.keys(exportData[0]).map(() => ({ width: 15 }));
                
                // Add the data worksheet
                XLSX.utils.book_append_sheet(wb, ws_data, "Data");

                // Create chart image worksheet if chart container exists
                const chartContainer = document.querySelector('.chart-container');
                if (chartContainer) {
                    const canvas = await html2canvas(chartContainer, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });

                    const imgBase64 = canvas.toDataURL('image/png').split(',')[1];
                    
                    // Create visualization worksheet
                    const ws_viz = XLSX.utils.aoa_to_sheet([['Chart Visualization']]);
                    
                    ws_viz['!cols'] = [{ width: 100 }];
                    ws_viz['!rows'] = [{ hpt: 30 }, { hpt: 400 }];
                    
                    ws_viz['!images'] = [{
                        name: 'chart.png',
                        data: imgBase64,
                        position: {
                            type: 'twoCellAnchor',
                            editAs: 'oneCell',
                            from: { col: 0, row: 1 },
                            to: { col: 8, row: 20 }
                        }
                    }];

                    // Add the visualization worksheet
                    XLSX.utils.book_append_sheet(wb, ws_viz, "Visualization");
                }

                // Generate array buffer instead of blob
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                
                // Convert buffer to blob
                const blob = new Blob([excelBuffer], { 
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });
                
                const fileName = `chart-report-${new Date().toISOString().slice(0,10)}.xlsx`;
                
                // Create File object with correct type
                const file = new File([blob], fileName, { 
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });

                // Trigger download
                const downloadUrl = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);

                return {
                    file,
                    fileName,
                    fileType: 'excel'
                };
            } catch (error) {
                console.error('Excel generation error:', error);
                toast.error(`Failed to generate Excel file: ${error.message}`);
                return null;
            }
        } else if (fileType === 'pdf') {
            try {
                if (!exportData || exportData.length === 0) {
                    throw new Error('No data to export');
                }

                const chartContainer = document.querySelector('.chart-container');
                if (!chartContainer) {
                    toast.error('Chart container not found');
                    return null;
                }

                // Clone the chart container to create a fixed-size version for capture
                const clonedContainer = chartContainer.cloneNode(true);
                clonedContainer.style.position = 'absolute';
                clonedContainer.style.left = '-9999px';
                clonedContainer.style.width = '1200px'; // Fixed width for consistent capture
                clonedContainer.style.height = 'auto';
                clonedContainer.style.overflow = 'visible';
                document.body.appendChild(clonedContainer);

                // Use a fixed scale regardless of device
                const captureScale = 2;

                const canvas = await html2canvas(clonedContainer, {
                    scale: captureScale,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: 1200, // Fixed width for capture
                    windowWidth: 1200, // Fixed window width
                    allowTaint: true,
                    removeContainer: true // Clean up cloned element after capture
                });

                // Remove the cloned container
                document.body.removeChild(clonedContainer);

                // Create PDF in landscape orientation
                const doc = new jsPDF('landscape');
                
                // Get page dimensions
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                // Fixed margins
                const margin = 10;
                const maxWidth = pageWidth - (margin * 2);
                const maxHeight = pageHeight - (margin * 2);
                
                // Calculate proportional dimensions
                let imgWidth = maxWidth;
                let imgHeight = (canvas.height * maxWidth) / canvas.width;

                // Adjust dimensions if height exceeds page
                if (imgHeight > maxHeight) {
                    imgHeight = maxHeight;
                    imgWidth = (canvas.width * maxHeight) / canvas.height;
                }

                // Center the image
                const xPos = (pageWidth - imgWidth) / 2;
                const yPos = (pageHeight - imgHeight) / 2;

                // Add chart image with high quality
                doc.addImage(
                    canvas.toDataURL('image/png', 1.0),
                    'PNG',
                    xPos,
                    yPos,
                    imgWidth,
                    imgHeight,
                    undefined,
                    'FAST'
                );

                // Add a new page for the table
                doc.addPage();

                // Add title for data table
                doc.setFontSize(16);
                doc.setTextColor(5, 150, 105);
                doc.text('Data Overview', 14, 15);

                // Add table using autoTable on the new page
                autoTable(doc, {
                    head: [Object.keys(exportData[0])],
                    body: exportData.map(row => Object.values(row)),
                    startY: 25,
                    theme: 'grid',
                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        overflow: 'linebreak',
                        halign: 'left'
                    },
                    headStyles: {
                        fillColor: [5, 150, 105],
                        textColor: 255,
                        fontSize: 9,
                        fontStyle: 'bold',
                        halign: 'left'
                    },
                    margin: { top: 25, right: 10, bottom: 10, left: 10 }
                });

                // Create blob for API
                const pdfBlob = doc.output('blob');
                const fileName = `chart-report-${new Date().toISOString().slice(0,10)}.pdf`;

                // Save locally
                doc.save(fileName);
                
                // Create File object with correct type
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

                return {
                    file
                };
            } catch (error) {
                console.error('PDF generation error:', error);
                toast.error(`Failed to generate PDF file: ${error.message}`);
                return null;
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
                    p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
                    mt: { xs: 7, sm: 8 }, // Adjusted top margin
                    width: {
                        xs: '100%',
                        sm: `calc(100% - ${open ? 240 : 64}px)`
                    }
                }}
            >
                <Box sx={{ 
                    backgroundColor: mode === 'light' ? '#f4f6f8' : '#1b1c1d', 
                    height: '100vh',
                    width: '100%',
                    position: 'relative',
                    borderRadius: { xs: 0, sm: 1, md: 2 }, // Responsive border radius
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 16 },
                        left: { xs: 8, sm: 16 },
                        right: { xs: 8, sm: 16 },
                        display: 'flex',
                        justifyContent: 'space-between',
                        zIndex: 100
                    }}>
                        <Tooltip title="Return to Analytics" placement="right">
                            <IconButton 
                                onClick={() => navigate('/analytics')}  
                                sx={{ 
                                    backgroundColor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        backgroundColor: mode === 'light' ? '#f5f5f5' : 'rgba(255,255,255,0.2)'
                                    },
                                    padding: { xs: 1, sm: 1.5 }, // Responsive padding
                                }}
                            >
                                <ArrowBack sx={{ 
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                                }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Report" placement="left">
                            <IconButton 
                                onClick={() => setDownloadOpen(true)}
                                sx={{ 
                                    backgroundColor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        backgroundColor: mode === 'light' ? '#f5f5f5' : 'rgba(255,255,255,0.2)'
                                    },
                                    padding: { xs: 1, sm: 1.5 }, // Responsive padding
                                }}
                            >
                                <Download sx={{ 
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                                }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <div 
                        className="chart-container" 
                        style={{ 
                            height: '100%',
                            width: '100%',
                            minHeight: isMobile ? '300px' : '400px',
                            position: 'relative',
                            overflow: 'visible',
                            padding: isMobile ? '40px 10px 10px' : '60px 20px 20px'
                        }}
                    >
                        {children}
                    </div>
                </Box>
            </Box>
            <DownloadDialog 
                open={downloadOpen}
                handleClose={() => setDownloadOpen(false)}
                handleDownload={handleDownload}
                reportType={getCurrentReportType()}
                fullScreen={isMobile} // Make dialog fullscreen on mobile
            />
        </Box>
    );
}

export default Layout;