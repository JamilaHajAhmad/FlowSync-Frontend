import * as React from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { 
    Chip, 
    Stack, 
    Button,
    Menu,
    MenuItem,
    TextField,
    Select,
    FormControl,
    InputLabel,
    OutlinedInput,
} from "@mui/material";
import { Add as AddIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import Box from "@mui/material/Box";
import { useState, useEffect, useMemo } from "react";
import CreateTaskForm from './CreateTaskForm';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllTasks } from '../../../../services/taskService';
import { toast } from 'react-toastify';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
        case "completed":
            return { color: "green", background: "#e0f7e9" };
        case "delayed":
            return { color: "red", background: "#fde8e8" };
        case "opened":
            return { color: "orange", background: "#fff4e0" };
        case "frozen":
            return { color: "#1976D2", background: "#E3F2FD" };
        case "all":
            return { color: "#059669", background: "#ecfdf5" };
        default:
            return { color: "#059669", background: "#ecfdf5" };
    }
};

const getColumns = (tab) => {
    const baseColumns = [
        {
            accessorKey: "name",
            header: "Name",
            size: 150,
        },
        {
            accessorKey: "title",
            header: "Task Title",
            size: 150,
        },
        {
            accessorKey: "frnNumber",
            header: "FRN Number",
            size: 100,
        },
        {
            accessorKey: "ossNumber",
            header: "OSS Number",
            size: 100,
        },
        {
            accessorKey: "openDate",
            header: "Open Date",
            size: 100,
        }
    ];

    const statusColumn = {
        accessorKey: "status",
        header: "Status",
        size: 100,
        Cell: ({ cell }) => (
            <Chip
                label={cell.getValue()}
                sx={{
                    fontSize: "12px",
                    color: getStatusColor(cell.getValue()).color,
                    backgroundColor: getStatusColor(cell.getValue()).background,
                }}
            />
        ),
    };

    switch(tab) {
        case 'All':
            return [
                ...baseColumns,
                statusColumn,
                {
                    accessorKey: "priority",
                    header: "Priority",
                    size: 90,
                },
                {
                    accessorKey: "caseType",
                    header: "Case Type",
                    size: 110,
                },
                {
                    accessorKey: "caseSource",
                    header: "Case Source",
                    size: 110,
                }
            ];
        case 'Completed':
            return [
                ...baseColumns,
                {
                    accessorKey: "priority",
                    header: "Priority",
                },
                {
                    accessorKey: "completedAt",
                    header: "Completed At",
                },
                {
                    accessorKey: 'notes',
                    header: 'Notes',
                }
            ];
        case 'Opened':
            return [
                ...baseColumns,
                {
                    accessorKey: "priority",
                    header: "Priority",
                }
            ];
        case 'Delayed':
            return [
                ...baseColumns,
                {
                    accessorKey: "priority",
                    header: "Priority",
                }
            ];
        case 'Frozen':
            return [
                ...baseColumns,
                {
                    accessorKey: "priority",
                    header: "Priority",
                },
                {
                    accessorKey: "frozenAt",
                    header: "Frozen At",
                },
                {
                    accessorKey: "reason",
                    header: "Reason",
                }
            ];
        default:
            return baseColumns;
    }
};

export default function Tasks({ 
    hideCreateButton, 
    showTabs,
    containerWidth = "100%",
    hideFilterToolbar = false
}) {
    const [activeTab, setActiveTab] = useState('All');
    const [rawTasks, setRawTasks] = useState([]); // Store raw data
    const [filteredTasks, setFilteredTasks] = useState([]); // Store filtered data
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedTaskType, setSelectedTaskType] = useState('');
    
    const open = Boolean(anchorEl);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleExportClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setAnchorEl(null);
    };

    const exportToCSV = (data, filename) => {
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                // Handle values that contain commas or quotes
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDownload = (fileType) => {
        const exportData = filteredTasks.map(task => ({
            Name: task.name,
            Title: task.title,
            Status: task.status,
            Priority: task.priority,
            'FRN Number': task.frnNumber,
            'OSS Number': task.ossNumber,
            'Open Date': task.openDate,
            ...(activeTab === 'Completed' && { 
                'Completed At': task.completedAt,
                'Notes': task.notes 
            }),
            ...(activeTab === 'Frozen' && { 
                'Frozen At': task.frozenAt,
                'Reason': task.reason 
            }),
            ...(activeTab === 'All' && {
                'Case Type': task.caseType,
                'Case Source': task.caseSource
            })
        }));

        if (fileType === 'csv') {
            try {
                exportToCSV(exportData, `${activeTab.toLowerCase()}-tasks`);
                toast.success('CSV file exported successfully');
            } catch (error) {
                console.error("Error creating CSV file:", error);
                toast.error("Failed to create CSV file");
            }
        } else if (fileType === 'pdf') {
            const doc = new jsPDF('landscape');
            
            // Add title
            doc.setFontSize(16);
            doc.setTextColor(5, 150, 105);
            doc.text(`${activeTab} Tasks`, 14, 15);

            // Add date range metadata
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            let yPosition = 25;
            
            if (startDate || endDate) {
                const startDateStr = startDate ? startDate.toLocaleDateString('en-US') : 'Not specified';
                const endDateStr = endDate ? endDate.toLocaleDateString('en-US') : 'Not specified';
                doc.text(`Date Range: ${startDateStr} - ${endDateStr}`, 14, yPosition);
                yPosition += 10;
            }

            // Get columns based on active tab
            const columns = Object.keys(exportData[0]);

            autoTable(doc, {
                head: [columns],
                body: exportData.map(item => Object.values(item)),
                startY: yPosition + 5,
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
                    0: { cellWidth: 30 }, // Name
                    1: { cellWidth: 30 }, // Title
                    2: { cellWidth: 20 }, // Status
                    3: { cellWidth: 20 }, // Priority
                    4: { cellWidth: 25 }, // FRN
                    5: { cellWidth: 25 }, // OSS
                    6: { cellWidth: 25 }, // Open Date
                    ...(columns.length > 7 && {
                        7: { cellWidth: 25 },
                        8: { cellWidth: 30 },
                        9: { cellWidth: 30 }
                    })
                },
                margin: { top: yPosition + 5 }
            });

            doc.save(`${activeTab.toLowerCase()}-tasks.pdf`);
            toast.success('PDF file exported successfully');
        } 
        else if (fileType === 'excel') {
            try {
                const wb = XLSX.utils.book_new();
                let ws;

                // Add metadata if date range is selected
                if (startDate || endDate) {
                    const startDateStr = startDate ? startDate.toLocaleDateString('en-US') : 'Not specified';
                    const endDateStr = endDate ? endDate.toLocaleDateString('en-US') : 'Not specified';
                    
                    // Create an empty worksheet first
                    ws = XLSX.utils.aoa_to_sheet([]);
                    
                    // Add metadata at the top
                    XLSX.utils.sheet_add_aoa(ws, [
                        [`Date Range: ${startDateStr} - ${endDateStr}`],
                        [] // Empty row for spacing
                    ], { origin: 'A1' });
                    
                    // Add the data starting from row 3
                    XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A3' });
                } else {
                    // No metadata, just add the data normally
                    ws = XLSX.utils.json_to_sheet(exportData);
                }

                // Set column widths
                ws['!cols'] = [
                    { wch: 20 }, // Name
                    { wch: 30 }, // Title
                    { wch: 15 }, // Status
                    { wch: 15 }, // Priority
                    { wch: 15 }, // FRN
                    { wch: 15 }, // OSS
                    { wch: 15 }, // Open Date
                    { wch: 20 }, // Additional columns
                    { wch: 25 }  // Additional columns
                ];

                XLSX.utils.book_append_sheet(wb, ws, `${activeTab} Tasks`);
                XLSX.writeFile(wb, `${activeTab.toLowerCase()}-tasks.xlsx`);
                toast.success('Excel file exported successfully');
            } catch (error) {
                console.error("Error creating Excel file:", error);
                toast.error("Failed to create Excel file");
            }
        }
        handleExportClose();
    };

    // Fetch tasks from API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const type = activeTab === 'All' ? '' : activeTab.toLowerCase();

                const response = await getAllTasks(token, type);
                
                // Format tasks but keep dates as Date objects for filtering
                const formattedTasks = response.data.map(task => ({
                    id: task.id,
                    name: task.assignedMember.fullName,
                    title: task.taskTitle,
                    status: task.status,
                    priority: task.priority,
                    frnNumber: task.frnNumber,
                    ossNumber: task.ossNumber,
                    openDate: new Date(task.openDate),  // Keep as Date object for filtering
                    completedAt: task.completedAt ? new Date(task.completedAt) : null,
                    reason: task.reason,
                    notes: task.notes,
                    frozenAt: task.frozenAt ? new Date(task.frozenAt) : null,
                    caseType: task.caseType,
                    caseSource: task.caseSource,
                    taskType: task.taskType
                }));

                setRawTasks(formattedTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                toast.error('Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [activeTab]); // Only refetch when tab changes

    // Get unique employees for the dropdown
    const uniqueEmployees = useMemo(() => {
        const employeeMap = new Map();
        rawTasks.forEach(task => {
            if (!employeeMap.has(task.name)) {
                employeeMap.set(task.name, {
                    id: task.name, // Use name as ID since we don't have unique employee IDs
                    fullName: task.name
                });
            }
        });
        return Array.from(employeeMap.values())
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
    }, [rawTasks]);

    // Get unique task types for the dropdown
    const uniqueTaskTypes = useMemo(() => {
        const taskTypes = [...new Set(rawTasks.map(task => {
            // Use task status as task types
            return task.status;
        }))].filter(Boolean);
        
        return taskTypes.sort();
    }, [rawTasks]);

    // Apply filters whenever filter values change
    useEffect(() => {
        let filtered = [...rawTasks];

        // Apply all filters concurrently
        filtered = filtered.filter(task => {
            // Date range filtering (based on openDate)
            const taskDate = task.openDate;
            const isAfterStart = !startDate || taskDate >= startDate;
            const isBeforeEnd = !endDate || taskDate <= endDate;
            
            // Employee filtering
            const matchesEmployee = !selectedEmployee || task.name === selectedEmployee;
            
            // Task type filtering - now using status field
            const matchesTaskType = !selectedTaskType || task.status === selectedTaskType;

            // All conditions must be true for the task to be included
            return isAfterStart && isBeforeEnd && matchesEmployee && matchesTaskType;
        });

        // Format dates for display after filtering
        const displayTasks = filtered.map(task => ({
            ...task,
            openDate: task.openDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }),
            completedAt: task.completedAt ? task.completedAt.toLocaleDateString('en-US') : '',
            frozenAt: task.frozenAt ? task.frozenAt.toLocaleDateString('en-US') : ''
        }));

        setFilteredTasks(displayTasks);
    }, [rawTasks, startDate, endDate, selectedEmployee, selectedTaskType]);

    // Update table configuration
    const table = useMaterialReactTable({
        columns: getColumns(activeTab),
        data: filteredTasks,
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            sorting: [{ id: 'openDate', desc: true }],
        },
        enableSorting: true,
        getRowId: (row) => row.id,
        sortingFns: {
            openDate: (rowA, rowB, columnId) => {
                // Convert date strings to timestamps for proper sorting
                const dateA = new Date(rowA.getValue(columnId)).getTime();
                const dateB = new Date(rowB.getValue(columnId)).getTime();
                return dateB - dateA; // Descending order
            },
        },
        state: { isLoading: loading },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#F9FAFB',
                color: 'black',
                fontWeight: 'bold',
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ 
                display: 'flex', 
                width: '100%',
                flexDirection: 'column', // Change to column layout
                gap: 2, // Add gap between tabs and filters
                p: 2,
            }}>
                {/* Tabs and Export Section */}
                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: -1.5,
                }}>
                    {showTabs && (
                        <Stack direction="row" spacing={1}>
                            {['All', 'Completed', 'Opened', 'Delayed', 'Frozen'].map((tab) => (
                                <Button
                                    key={tab}
                                    variant={activeTab === tab ? "contained" : "outlined"}
                                    onClick={() => setActiveTab(tab)}
                                    size="small"
                                    sx={{
                                        backgroundColor: activeTab === tab ? getStatusColor(tab).background : 'transparent',
                                        color: getStatusColor(tab).color,
                                        borderColor: getStatusColor(tab).color,
                                        '&:hover': {
                                            backgroundColor: getStatusColor(tab).background,
                                            opacity: 0.9
                                        }
                                    }}
                                >
                                    {tab}
                                </Button>
                            ))}
                        </Stack>
                    )}

                    <Box>
                        <Button
                            onClick={handleExportClick}
                            startIcon={<FileDownloadIcon />}
                        >
                            Export
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleExportClose}
                        >
                            <MenuItem onClick={() => handleDownload('excel')}>
                                Export as Excel
                            </MenuItem>
                            <MenuItem onClick={() => handleDownload('pdf')}>
                                Export as PDF
                            </MenuItem>
                            <MenuItem onClick={() => handleDownload('csv')}>
                                Export as CSV
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* Filter Toolbar */}
                {!hideFilterToolbar && (
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        borderRadius: 1,
                        py: 2,
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                renderInput={(params) => <TextField {...params} size="small" />}
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                renderInput={(params) => <TextField {...params} size="small" />}
                            />
                        </LocalizationProvider>

                        <FormControl size="small" sx={{ width: 200 }}>
                            <InputLabel>Employee</InputLabel>
                            <Select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                input={<OutlinedInput label="Employee" />}
                            >
                                <MenuItem value="">
                                    <em>All Employees</em>
                                </MenuItem>
                                {uniqueEmployees.map((employee) => (
                                    <MenuItem key={employee.id} value={employee.id}>
                                        {employee.fullName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ width: 200 }}>
                            <InputLabel>Status Filter</InputLabel>
                            <Select
                                value={selectedTaskType}
                                onChange={(e) => setSelectedTaskType(e.target.value)}
                                input={<OutlinedInput label="Status Filter" />}
                            >
                                <MenuItem value="">
                                    <em>All Statuses</em>
                                </MenuItem>
                                {uniqueTaskTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setStartDate(null);
                                setEndDate(null);
                                setSelectedEmployee('');
                                setSelectedTaskType('');
                            }}
                            sx={{ height: 40 }}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                )}
            </Box>
        ),
    });

    return (
        <Box sx={{ height: 520, width: containerWidth, flexGrow: 1 }}>
            <CreateTaskForm open={openDialog} onClose={handleCloseDialog} />
            
            {!hideCreateButton && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        sx={{
                            backgroundColor: '#059669',
                            '&:hover': {
                                backgroundColor: '#047857'
                            },
                            borderRadius: '50px',
                            padding: '8px 16px',
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Create New Task
                    </Button>
                </Box>
            )}

            <MaterialReactTable 
                table={table}
                muiTablePaperProps={{
                    sx: {
                        '& .MuiToolbar-root': {
                            background: '#fff',
                        },
                    },
                }}
            />
        </Box>
    );
}