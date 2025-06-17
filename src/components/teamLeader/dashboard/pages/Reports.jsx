import { useEffect, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { getAllReports } from '../../../../services/reportsService';
import { Box, CircularProgress, Typography, Button, Menu, MenuItem, useMediaQuery } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

const Reports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await getAllReports();
                setData(response.data);
            } catch (err) {
                setError('Failed to fetch reports');
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const columns = [
        {
            accessorKey: 'reportID',
            header: 'Report ID',
            size: 150,
            muiTableHeadCellProps: {
                align: 'center',
            },
            muiTableBodyCellProps: {
                align: 'center',
            },
        },
        {
            accessorKey: 'title',
            header: 'Report Title',
            size: 180,
            muiTableHeadCellProps: {
                align: 'center',
            },
            Cell: ({ cell }) => {
                const title = cell.getValue();
                const capitalizedTitle = title
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');

                return (
                    <Typography variant="body2" color="primary" noWrap>
                        {capitalizedTitle}
                    </Typography>
                );
            },
        },
        {
            accessorKey: 'fromDate',
            header: 'From Date',
            size: 160,
            muiTableHeadCellProps: {
                align: 'center',
            },
            Cell: ({ cell }) => (
                <Typography variant="body2" noWrap>
                    {format(new Date(cell.getValue()), 'yyyy-MM-dd')}
                </Typography>
            ),
        },
        {
            accessorKey: 'toDate',
            header: 'To Date',
            size: 160,
            muiTableHeadCellProps: {
                align: 'center',
            },
            Cell: ({ cell }) => (
                <Typography variant="body2" noWrap>
                    {format(new Date(cell.getValue()), 'yyyy-MM-dd')}
                </Typography>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            size: 250,
            muiTableHeadCellProps: {
                align: 'center',
            },
            Cell: ({ cell }) => (
                <Typography
                    variant="body2"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.2em',
                        maxHeight: '2.4em' // Allows for 2 lines
                    }}
                >
                    {cell.getValue()}
                </Typography>
            ),
        },
        {
            accessorKey: 'filtersApplied',
            header: 'Filters Applied',
            size: 180,
            muiTableHeadCellProps: {
                align: 'center',
            },
            Cell: ({ cell }) => {
                const filters = cell.getValue();
                const filterValue = Array.isArray(filters)
                    ? filters.map(filter => {
                        const [, value] = filter.split(':');
                        return value ? value.trim().replace(/['"{}]/g, '') : '';
                    }).join(', ')
                    : filters.split(':')[1]?.trim().replace(/['"{}]/g, '') || filters;

                return (
                    <Typography variant="body2" noWrap>
                        {filterValue}
                    </Typography>
                );
            }
        },
        {
            accessorKey: 'fileName',
            header: 'File Name',
            size: 100,
            muiTableHeadCellProps: {
                align: 'center',
            },
            Cell: ({ row }) => {
                const handleFileDownload = () => {
                    try {
                        const fileData = row.original.fileData;
                        const fileName = row.original.fileName;

                        const byteCharacters = atob(fileData);
                        const byteNumbers = new Array(byteCharacters.length);

                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }

                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray]);

                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        toast.success('File downloaded successfully');
                    } catch (error) {
                        toast.error('Error downloading file');
                        console.error('Error downloading file:', error);
                    }
                };

                return (
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline',
                                color: 'blue',
                            }
                        }}
                        onClick={handleFileDownload}
                    >
                        {row.original.fileName}
                    </Typography>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            size: 160,
            muiTableHeadCellProps: {
                align: 'center',
            },
            Cell: ({ cell }) => (
                <Typography variant="body2" noWrap>
                    {format(new Date(cell.getValue()), 'yyyy-MM-dd')}
                </Typography>
            )
        }
    ];

    const handleExportClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setAnchorEl(null);
    };

    const exportToExcel = () => {
        try {
            const chunkSize = 100;
            const chunks = [];
            for (let i = 0; i < data.length; i += chunkSize) {
                chunks.push(data.slice(i, i + chunkSize));
            }

            const workbook = XLSX.utils.book_new();

            chunks.forEach((chunk, index) => {
                const exportData = chunk.map(item => ({
                    'Report ID': item.reportID,
                    'Report Title': item.title?.substring(0, 32000),
                    'From Date': format(new Date(item.fromDate), 'yyyy-MM-dd'),
                    'To Date': format(new Date(item.toDate), 'yyyy-MM-dd'),
                    'Description': item.description?.substring(0, 32000),
                    'Filters Applied': Array.isArray(item.filtersApplied)
                        ? item.filtersApplied
                            .map(filter => {
                                const [, value] = filter.split(':');
                                return value ? value.trim().replace(/['"{}]/g, '') : '';
                            })
                            .join(', ')
                            .substring(0, 32000)
                        : (item.filtersApplied?.split(':')[1]?.trim().replace(/['"{}]/g, '') || '')
                            .substring(0, 32000),
                    'File Name': item.fileName,
                    'Created At': format(new Date(item.createdAt), 'yyyy-MM-dd')
                }));

                const worksheet = XLSX.utils.json_to_sheet(exportData);
                worksheet['!cols'] = [
                    { wch: 10 },
                    { wch: 20 },
                    { wch: 15 },
                    { wch: 15 },
                    { wch: 30 },
                    { wch: 20 },
                    { wch: 15 },
                    { wch: 20 }
                ];

                XLSX.utils.book_append_sheet(workbook, worksheet, `Reports${index + 1}`);
            });

            XLSX.writeFile(workbook, `reports-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
            handleExportClose();
            toast.success('Excel file exported successfully');
        } catch (error) {
            toast.error('Failed to export Excel file');
            console.error('Error exporting to Excel:', error);
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('Reports', 15, 15);

            const tableData = {
                head: [['Report ID', 'Report Title', 'From Date', 'To Date', 'Description', 'Filters Applied', 'File Name', 'Created At']],
                body: data.map(item => [
                    item.reportID,
                    (item.title || '').substring(0, 100),
                    format(new Date(item.fromDate), 'yyyy-MM-dd'),
                    format(new Date(item.toDate), 'yyyy-MM-dd'),
                    (item.description || '').substring(0, 100),
                    (Array.isArray(item.filtersApplied)
                        ? item.filtersApplied
                            .map(filter => {
                                const [, value] = filter.split(':');
                                return value ? value.trim().replace(/['"{}]/g, '') : '';
                            })
                            .join(', ')
                        : item.filtersApplied?.split(':')[1]?.trim().replace(/['"{}]/g, '') || '')
                        .substring(0, 100),
                    item.fileName,
                    format(new Date(item.createdAt), 'yyyy-MM-dd')
                ])
            };

            autoTable(doc, {
                ...tableData,
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
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 50 },
                    5: { cellWidth: 40 },
                    6: { cellWidth: 30 },
                    7: { cellWidth: 30 }
                },
                margin: { top: 25 }
            });

            doc.save(`reports-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            handleExportClose();
            toast.success('PDF file exported successfully');
        } catch (error) {
            toast.error('Failed to export PDF file');
            console.error('Error exporting to PDF:', error);
        }
    };

    const exportToCSV = () => {
        try {
            const csvRows = [];
            const headers = ['Report ID', 'Report Title', 'From Date', 'To Date', 'Description', 'Filters Applied', 'File Name', 'Created At'];
            csvRows.push(headers.join(','));

            data.forEach(item => {
                const rowData = [
                    item.reportID,
                    `"${(item.title || '').replace(/"/g, '""')}"`,
                    format(new Date(item.fromDate), 'yyyy-MM-dd'),
                    format(new Date(item.toDate), 'yyyy-MM-dd'),
                    `"${(item.description || '').replace(/"/g, '""')}"`,
                    `"${Array.isArray(item.filtersApplied)
                        ? item.filtersApplied
                            .map(filter => {
                                const [, value] = filter.split(':');
                                return value ? value.trim().replace(/['"{}]/g, '') : '';
                            })
                            .join(', ')
                        : item.filtersApplied?.split(':')[1]?.trim().replace(/['"{}]/g, '') || ''}"`,
                    item.fileName,
                    format(new Date(item.createdAt), 'yyyy-MM-dd')
                ];
                csvRows.push(rowData.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `reports-${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            handleExportClose();
            toast.success('CSV file exported successfully');
        } catch (error) {
            toast.error('Failed to export CSV file');
            console.error('Error exporting to CSV:', error);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data,
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        enableSorting: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            sorting: [{ id: 'createdAt', desc: true }],
            density: 'compact'
        },
        state: { isLoading: loading },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#f5f5f5',
                color: 'black',
                fontWeight: 'bold',
            },
        },
        muiTableContainerProps: {
            sx: {
                maxHeight: isMobile ? undefined : 600,
                width: '100%',
                overflowX: isMobile ? 'auto' : 'unset',
                WebkitOverflowScrolling: isMobile ? 'touch' : undefined,
                border: '1px solid #e0e0e0',          // Thin gray border
                borderRadius: 2,                       // Subtle rounding as in the photo
                backgroundColor: '#fff',               // White background for paper-like look
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', // Very light shadow (optional)

            }
        },
        muiTablePaperProps: {
            sx: {
                width: '100%',
                boxShadow: 'none', // Remove double shadow
                borderRadius: isMobile ? 0 : 2,
                backgroundColor: 'transparent', // Remove extra background
                            border: '1px solid #e0e0e0', // Add border to paper

            },
        },
        layoutMode: 'grid',
        enableColumnResizing: true,
        displayColumnDefOptions: {
            'mrt-row-expand': {
                size: 50,
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box>
                <Button
                    color="primary"
                    onClick={handleExportClick}
                    startIcon={<FileDownloadIcon />}
                >
                    Export
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleExportClose}
                >
                    <MenuItem onClick={exportToExcel}>Export as Excel</MenuItem>
                    <MenuItem onClick={exportToPDF}>Export as PDF</MenuItem>
                    <MenuItem onClick={exportToCSV}>Export as CSV</MenuItem>
                </Menu>
            </Box>
        ),
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    // Responsive wrapper for table with horizontal scroll on mobile
    return (
        <Box
            sx={{
                width: '100%',
                overflowX: isMobile ? 'auto' : 'unset',
                maxWidth: '100vw',
                padding: isMobile ? 0.5 : 2,
                boxSizing: 'border-box',
                backgroundColor: 'transparent',
            }}
        >
            <MaterialReactTable table={table} />
        </Box>
    );
};

export default Reports;