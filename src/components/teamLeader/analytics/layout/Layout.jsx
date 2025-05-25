import { Box, IconButton, Tooltip } from '@mui/material';
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

    const handleDrawerOpen = () => {
        setOpen(!open);
    };

    const handleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const formatDataForExport = (data) => {
        if (!data || !data.rawData) return [];

        switch (data.type) {
            case 'bar':
                // Get unique members
                { const members = [...new Set(data.rawData.map(item => item.member))];
                
                // Create a map to store task counts for each member
                return members.map(member => {
                    const memberTasks = data.rawData.filter(task => task.member === member);
                    
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
                    taskCounts['Total Tasks'] = 
                        taskCounts['Opened Tasks'] + 
                        taskCounts['Completed Tasks'] + 
                        taskCounts['Frozen Tasks'] + 
                        taskCounts['Delayed Tasks'];
                    
                    return taskCounts;
                }); }

            case 'line':
                return data.rawData.map(item => ({
                    'Year': item.year,
                    'Month': item.month,
                    'Created Tasks': item.created,
                    'Completed Tasks': item.completed,
                    'Task Completion Rate': `${((item.completed / item.created) * 100).toFixed(2)}%`
                }));
                
            case 'pie':
                // Calculate total for percentage
                { const total = data.rawData.reduce((sum, item) => sum + item.count, 0);
                
                return data.rawData.map(item => ({
                    'Status': item.status.type,
                    'Count': item.count,
                    'Percentage': `${((item.count / total) * 100).toFixed(2)}%`
                })); }
                
            case 'stacked':
                return data.rawData.map(item => ({
                    'Date': new Date(item.date).toLocaleDateString(
                        'en-US',
                        { year: 'numeric', month: '2-digit', day: '2-digit' }
                    ),
                    'Activity Count': item.count,
                    'Week Day': new Date(item.date).toLocaleString('en-US', { weekday: 'long' }),
                    'Month': new Date(item.date).toLocaleString('en-US', { month: 'long' })
                }));
                
            case 'heatmap':
                // Get unique departments and statuses
                { const departments = [...new Set(data.rawData.map(item => item.department))].sort();
                const statuses = [...new Set(data.rawData.map(item => item.status))].sort();
                
                // Create a map for quick lookup of counts
                const countMap = new Map(
                    data.rawData.map(item => [`${item.department}-${item.status}`, item.count])
                );
                
                // Create rows with department as first column followed by status columns
                return departments.map(dept => {
                    const row = { Department: dept };
                    statuses.forEach(status => {
                        const count = countMap.get(`${dept}-${status}`) || 0;
                        row[`${status} Tasks`] = count;
                    });
                    
                    // Add total tasks for department
                    row['Total Tasks'] = statuses.reduce((sum, status) => 
                        sum + (countMap.get(`${dept}-${status}`) || 0), 0
                    );
                    
                    return row;
                }); }
                
            case 'funnel':
                // First group data by type to combine counts from different months
                { const groupedByType = data.rawData.reduce((acc, item) => {
                    const key = item.type;
                    if (!acc[key]) {
                        acc[key] = {
                            type: item.type,
                            count: 0,
                            dates: []
                        };
                    }
                    acc[key].count += item.count;
                    acc[key].dates.push(`${item.year}-${item.month.toString().padStart(2, '0')}`);
                    return acc;
                }, {});

                // Convert grouped data back to array and sort by count
                const sortedData = Object.values(groupedByType)
                    .sort((a, b) => b.count - a.count);

                // Calculate conversion rates and format the data
                return sortedData.map((item) => ({
                    'Request Type': item.type,
                    'Count': item.count,
                    'Dates': item.dates.join(', '),
                    'Conversion Rate': calculateConversionRate(sortedData, item),
                    'Most Recent Date': item.dates[item.dates.length - 1]
                })); }
                
            default:
                return data.rawData;
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

                // Create chart image worksheet
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

                // Save the workbook and get the blob
                const excelBlob = XLSX.write(wb, { bookType: 'xlsx', type: 'blob' });
                const fileName = `chart-report-${new Date().toISOString().slice(0,10)}.xlsx`;
                
                // Create File object with correct type
                const file = new File([excelBlob], fileName, { 
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });

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

                // Render the chart container to canvas
                const chartContainer = document.querySelector('.chart-container');
                if (!chartContainer) {
                    toast.error('Chart container not found');
                    return null;
                }

                const canvas = await html2canvas(chartContainer);
                const imageData = canvas.toDataURL('image/png');

                // Create PDF in landscape orientation
                const doc = new jsPDF('landscape');
                
                // Add chart image on first page
                const imgWidth = 270;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                doc.addImage(imageData, 'PNG', 10, 10, imgWidth, imgHeight);

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
                    startY: 25, // Start below the title
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
                toast.error('Failed to generate PDF');
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
                    <Tooltip title="Return to Analytics" placement="right">
                        <IconButton 
                            onClick={() => navigate('/analytics')}  
                            sx={{ 
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                backgroundColor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: mode === 'light' ? '#f5f5f5' : 'rgba(255,255,255,0.2)'
                                },
                                zIndex: 100
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                    </Tooltip>
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
                    <div 
                        className="chart-container" 
                        style={{ 
                            height: '100%', // Changed from 100%
                            width: '100%',
                            minHeight: '400px',
                            position: 'relative',
                            overflow: 'visible', // Changed from hidden
                            padding: '20px'
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
            />
        </Box>
    );
}

export default Layout;