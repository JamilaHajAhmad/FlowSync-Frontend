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
    Select,
    FormControl,
    InputLabel,
    OutlinedInput,
    Tooltip,
    IconButton,
    useMediaQuery
} from "@mui/material";
import { Add as AddIcon, FileDownload as FileDownloadIcon, Edit as EditIcon } from '@mui/icons-material';
import Box from "@mui/material/Box";
import { useState, useEffect, useMemo, useCallback } from "react";
import CreateTaskForm from '../components/CreateTaskForm';
import EditTaskForm from '../components/EditTaskForm';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllTasks } from '../../../../services/taskService';
import { getMemberNames } from '../../../../services/employeeService';
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

const getColumns = (tab, handleEditTask, showActions) => {
    const baseColumns = [
        {
            accessorKey: "name",
            header: "Member Name",
            size: 160,
        },
        {
            accessorKey: "title",
            header: "Task Title",
            size: 130,
        },
        {
            accessorKey: "frnNumber",
            header: "FRN Number",
            size: 160,
        },
        {
            accessorKey: "ossNumber",
            header: "OSS Number",
            size: 160,
        },
        {
            accessorKey: "openDate",
            header: "Open Date",
            size: 120,
        },
        {
            accessorKey: "deadline",
            header: "Deadline",
            size: 120,
            Cell: ({ cell }) => {
                const date = new Date(cell.getValue());
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }
        }
    ];

    const statusColumn = {
        accessorKey: "status",
        header: "Status",
        size: 110,
        Cell: ({ cell, row }) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip
                    label={cell.getValue()}
                    sx={{
                        fontSize: "12px",
                        color: getStatusColor(cell.getValue()).color,
                        backgroundColor: getStatusColor(cell.getValue()).background,
                    }}
                />
                {cell.getValue() === "Completed" && row.original.isDelayed && (
                    <Tooltip title="This task was delayed before completion" placement="top">
                        <Chip
                            size="small"
                            label="Was Delayed"
                            sx={{
                                height: '20px',
                                fontSize: '10px',
                                color: '#991b1b',
                                backgroundColor: '#fee2e2',
                                border: '1px dashed #ef4444',
                                '& .MuiChip-label': {
                                    padding: '0 6px',
                                }
                            }}
                        />
                    </Tooltip>
                )}
            </Box>
        ),
    };

    const actionColumn = {
        id: 'actions',
        header: 'Actions',
        size: 90,
        Cell: ({ row }) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip 
                    title={
                        row.original.status === "Completed" 
                            ? "Completed tasks cannot be edited" 
                            : "Edit Task"
                    } 
                    placement="left"
                >
                    <span>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditTask(row.original)}
                            disabled={row.original.status === "Completed"}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(5, 150, 105, 0.04)'
                                },
                                '&.Mui-disabled': {
                                    opacity: 0.5,
                                    color: 'grey.400'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
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
                    size: 100,
                },
                {
                    accessorKey: "caseType",
                    header: "Case Type",
                    size: 120,
                },
                {
                    accessorKey: "caseSource",
                    header: "Case Source",
                    size: 120,
                },
                ...(showActions ? [actionColumn] : [])
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
    hideFilterToolbar = false,
    showActions = true
}) {
    const isMobile = useMediaQuery('(max-width:600px)');

    const [activeTab, setActiveTab] = useState('All');
    const [rawTasks, setRawTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedTaskType, setSelectedTaskType] = useState('');
    const [members, setMembers] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const open = Boolean(anchorEl);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleEditTask = useCallback((task) => {
        setSelectedTask(task);
        setEditDialogOpen(true);
    }, []);

    const handleEditClose = () => {
        setSelectedTask(null);
        setEditDialogOpen(false);
    };

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

    const getExportTitle = () => {
        const filters = [];
        
        // Add active filters to the title
        if (selectedTaskType) filters.push(selectedTaskType);
        if (selectedEmployee) {
            const employeeName = members.find(m => m.id === selectedEmployee)?.fullName;
            if (employeeName) filters.push(`${employeeName}'s Tasks`);
        }
        if (startDate || endDate) {
            const dateRange = [];
            if (startDate) dateRange.push(startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            if (endDate) dateRange.push(endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            filters.push(`${dateRange.join('-')}`);
        }

        // If no filters are active, use the tab name
        if (filters.length === 0) {
            return `${activeTab}-tasks`;
        }

        // Combine filters for the title
        return `tasks-${filters.join('-')}`.toLowerCase().replace(/\s+/g, '-');
    };

    const handleDownload = (fileType) => {
        const fileName = getExportTitle();
        
        // Get current sorting from the table
        const currentSorting = table.getState().sorting;
        
        // Sort the data according to table's current sorting
        let sortedData = [...filteredTasks];
        if (currentSorting.length > 0) {
            const { id: sortField, desc } = currentSorting[0];
            sortedData.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle date fields
                if (['openDate', 'completedAt', 'frozenAt', 'deadline'].includes(sortField)) {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }

                if (aValue < bValue) return desc ? 1 : -1;
                if (aValue > bValue) return desc ? -1 : 1;
                return 0;
            });
        }
        
        // Update export data mapping with sorted data
        const exportData = sortedData.map(task => ({
            'Member Name': task.name,
            Title: task.title,
            Status: task.status + (task.status === "Completed" && task.isDelayed ? ' (Was Delayed)' : ''),
            Priority: task.priority,
            'FRN Number': task.frnNumber,
            'OSS Number': task.ossNumber,
            'Open Date': task.openDate,
            ...(activeTab === 'Completed' && { 
                'Completed At': task.completedAt,
                'Notes': task.notes,
            }),
            ...(activeTab === 'Frozen' && { 
                'Frozen At': task.frozenAt,
                'Reason': task.reason 
            }),
            ...(activeTab === 'All' && {
                'Case Type': task.caseType,
                'Case Source': task.caseSource,
            })
        }));

        if (fileType === 'csv') {
            try {
                exportToCSV(exportData, fileName);
                toast.success('CSV file exported successfully');
            } catch (error) {
                console.error("Error creating CSV file:", error);
                toast.error("Failed to create CSV file");
            }
        } else if (fileType === 'pdf') {
            const doc = new jsPDF('landscape');
            
            // Update PDF title to reflect filters
            doc.setFontSize(16);
            doc.setTextColor(5, 150, 105);
            doc.text(getExportTitle().replace(/-/g, ' ').toUpperCase(), 14, 15);

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
                    2: { cellWidth: 25 }, // Status (increased width for delayed info)
                    3: { cellWidth: 20 }, // Priority
                    4: { cellWidth: 25 }, // FRN
                    5: { cellWidth: 25 }, // OSS
                    6: { cellWidth: 25 }, // Open Date
                    ...(columns.length > 7 && {
                        7: { cellWidth: 25 },
                        8: { cellWidth: 25 },
                        9: { cellWidth: 25 },
                        10: { cellWidth: 20 } // Was Delayed column
                    })
                },
                margin: { top: yPosition + 5 }
            });

            doc.save(`${fileName}.pdf`);
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
                    { wch: 20 }, // Status (increased width for delayed info)
                    { wch: 15 }, // Priority
                    { wch: 15 }, // FRN
                    { wch: 15 }, // OSS
                    { wch: 15 }, // Open Date
                    { wch: 20 }, // Additional columns
                    { wch: 25 }, // Additional columns
                    { wch: 15 }  // Was Delayed column
                ];

                XLSX.utils.book_append_sheet(wb, ws, getExportTitle().replace(/-/g, ' '));
                XLSX.writeFile(wb, `${fileName}.xlsx`);
                toast.success('Excel file exported successfully');
            } catch (error) {
                console.error("Error creating Excel file:", error);
                toast.error("Failed to create Excel file");
            }
        }
        handleExportClose();
    };

    // Fetch tasks from API
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const type = activeTab === 'All' ? '' : activeTab.toLowerCase();

            const response = await getAllTasks(token, type);
            const formattedTasks = response.data.map(task => ({
                taskId: task.taskId,
                name: task.assignedMember.fullName,
                assignedMember: task.assignedMember,
                title: task.taskTitle,
                deadline: task.deadline ? new Date(task.deadline) : null,
                status: task.status,
                isDelayed: task.isDelayed,
                priority: task.priority,
                frnNumber: task.frnNumber,
                ossNumber: task.ossNumber,
                openDate: new Date(task.openDate),
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

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, refreshTrigger]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getMemberNames(token);
                setMembers(response.data);
            } catch (error) {
                console.error('Error fetching members:', error);
                toast.error('Failed to load team members');
            }
        };
        fetchMembers();
    }, []);

    const uniqueTaskTypes = useMemo(() => {
        const taskTypes = [...new Set(rawTasks.map(task => task.status))].filter(Boolean);
        return taskTypes.sort();
    }, [rawTasks]);

    useEffect(() => {
        let filtered = [...rawTasks];
        filtered = filtered.filter(task => {
            const taskDate = task.openDate;
            const isAfterStart = !startDate || taskDate >= startDate;
            const isBeforeEnd = !endDate || taskDate <= endDate;
            const matchesEmployee = !selectedEmployee || task.assignedMember?.id === selectedEmployee;
            const matchesTaskType = !selectedTaskType || task.status === selectedTaskType;
            return isAfterStart && isBeforeEnd && matchesEmployee && matchesTaskType;
        });
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

    const columns = useMemo(() => getColumns(activeTab, handleEditTask, showActions), [activeTab, handleEditTask, showActions]);

    const table = useMaterialReactTable({
        columns,
        data: filteredTasks,
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            sorting: [{ id: 'openDate', desc: true }],
        },
        enableColumnResizing: true,
        enableSorting: true,
        getRowId: (row) => row.id,
        sortingFns: {
            openDate: (rowA, rowB, columnId) => {
                const dateA = new Date(rowA.getValue(columnId)).getTime();
                const dateB = new Date(rowB.getValue(columnId)).getTime();
                return dateB - dateA;
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
                flexDirection: 'column',
                gap: 2,
                p: isMobile ? 1 : 2,
            }}>
                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: isMobile ? 0 : -1.5,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 1 : 0
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
                {!hideFilterToolbar && (
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        borderRadius: 1,
                        py: 2,
                        alignItems: isMobile ? 'stretch' : 'center',
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        flexDirection: isMobile ? 'column' : 'row'
                    }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                slotProps={{ 
                                    textField: { 
                                        size: "small",
                                        sx: { width: isMobile ? '100%' : 200 }
                                    } 
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                slotProps={{ 
                                    textField: { 
                                        size: "small",
                                        sx: { width: isMobile ? '100%' : 200 }
                                    } 
                                }}
                            />
                        </LocalizationProvider>
                        <FormControl size="small" sx={{ width: isMobile ? '100%' : 200 }}>
                            <InputLabel>Member</InputLabel>
                            <Select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                input={<OutlinedInput label="Employee" />}
                            >
                                <MenuItem value="">
                                    <em>All Members</em>
                                </MenuItem>
                                {members.map((member) => (
                                    <MenuItem key={member.id} value={member.id}>
                                        {member.fullName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: isMobile ? '100%' : 200 }}>
                            <InputLabel>Status</InputLabel>
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
                            sx={{ 
                                height: 40,
                                minWidth: 120,
                                borderColor: 'divider',
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                )}
            </Box>
        ),
    });

    return (
        <Box
            sx={{
                width: containerWidth,
                maxWidth: '100vw',
                minHeight: 520,
                flexGrow: 1,
                px: isMobile ? 0 : 2,
                py: isMobile ? 0 : 2,
                margin: '0 auto',
                bgcolor: 'background.default',
                overflowX: 'hidden'
            }}
        >
            <CreateTaskForm open={openDialog} onClose={handleCloseDialog} />
            {selectedTask && (
                <EditTaskForm
                    open={editDialogOpen}
                    onClose={handleEditClose}
                    task={selectedTask}
                    onTaskUpdated={() => {
                        setRefreshTrigger(prev => prev + 1);
                        handleEditClose();
                    }}
                />
            )}
            {!hideCreateButton && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        sx={{
                            backgroundColor: '#059669',
                            '&:hover': { backgroundColor: '#047857' },
                            borderRadius: '50px',
                            padding: { xs: '6px 12px', sm: '8px 16px' },
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Create New Task
                    </Button>
                </Box>
            )}
            <Box
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                    // Only horizontal scroll here!
                    background: 'white',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    boxShadow: 'none',
                    margin: '0 auto'
                }}
            >
                <MaterialReactTable
                    table={table}
                    muiTablePaperProps={{
                        sx: {
                            boxShadow: 'none',
                            border: 'none',
                            background: 'transparent',
                        },
                    }}
                    muiTableContainerProps={{
                        sx: {
                            overflowX: 'auto',
                            overflowY: 'visible',
                            maxWidth: '100vw',
                        }
                    }}
                />
            </Box>
        </Box>
    );
}