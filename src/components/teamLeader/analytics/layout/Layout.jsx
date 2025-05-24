import { Box, IconButton, Tooltip } from '@mui/material';
import { Download, ArrowBack } from '@mui/icons-material';  // Add ArrowBack import
import Sidebar from '../../dashboard/components/Sidebar';
import Topbar from '../../../common/Topbar';
import DownloadDialog from '../dialog/DownloadDialog';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
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
    const { chartData } = useChartData();

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

            case 'areabump':
                { const areaBumpData = data.rawData;
                const periods = [...new Set(areaBumpData.map(item => `${item.year}-${item.month}`))].sort();
                const types = [...new Set(areaBumpData.map(item => item.type))];
                
                return periods.map(period => {
                    const [year, month] = period.split('-');
                    const periodData = areaBumpData.filter(
                        item => item.year === parseInt(year) && item.month === parseInt(month)
                    );
                    
                    const row = {
                        'Period': `${year}-${month.padStart(2, '0')}`
                    };
                    
                    // Add count for each request type
                    types.forEach(type => {
                        const typeData = periodData.find(d => d.type === type);
                        row[`${type} Requests`] = typeData?.count || 0;
                    });
                    
                    // Add total for the period
                    row['Total Requests'] = periodData.reduce((sum, item) => sum + item.count, 0);
                    
                    return row;
                }); }
                
            default:
                return data.rawData;
        }
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
                
                // Create and trigger download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `chart-data-${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                
                toast.success('CSV file generated successfully');
            } catch (error) {
                console.error('CSV generation error:', error);
                toast.error(`Failed to generate CSV file: ${error.message}`);
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

                // Save the workbook
                XLSX.writeFile(wb, `chart-report-${new Date().toISOString().slice(0,10)}.xlsx`);
                toast.success('Excel file generated successfully');
            } catch (error) {
                console.error('Excel generation error:', error);
                toast.error(`Failed to generate Excel file: ${error.message}`);
            }
        } else if (fileType === 'pdf') {
            try {
                // Render the chart container to canvas using html2canvas
                const chartContainer = document.querySelector('.chart-container');
                if (!chartContainer) {
                    toast.error('Chart container not found');
                    return;
                }
                const canvas = await html2canvas(chartContainer);
                // Convert to image
                const imageData = canvas.toDataURL('image/png');

                // Create PDF with proper dimensions
                const imgWidth = 290; // A4 landscape width - margins
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                const pdf = new jsPDF('landscape');
                pdf.addImage(imageData, 'PNG', 10, 10, imgWidth, imgHeight);
                pdf.save('chart-report.pdf');
                
                toast.success('PDF generated successfully');
            } catch (error) {
                console.error('PDF generation error:', error);
                toast.error('Failed to generate PDF');
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
            />
        </Box>
    );
}

export default Layout;