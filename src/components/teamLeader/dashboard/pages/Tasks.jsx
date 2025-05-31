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
    MenuItem
} from "@mui/material";
import { Add as AddIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import CreateTaskForm from './CreateTaskForm';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllTasks } from '../../../../services/taskService';
import { toast } from 'react-toastify';

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
            size: 150, // Reduced from 200
        },
        {
            accessorKey: "title",
            header: "Task Title",
            size: 150, // Increased from 100 for better readability
        },
        {
            accessorKey: "frnNumber",
            header: "FRN Number",
            size: 100, // Reduced from 120
        },
        {
            accessorKey: "ossNumber",
            header: "OSS Number",
            size: 100, // Reduced from 120
        },
        {
            accessorKey: "openDate",
            header: "Open Date",
            size: 100, // Reduced from 130
        }
    ];

    const statusColumn = {
        accessorKey: "status",
        header: "Status",
        size: 100, // Reduced from 130
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
}) {
    const [activeTab, setActiveTab] = useState('All');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleExportClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setAnchorEl(null);
    };

    const handleDownload = (fileType) => {
        const exportData = tasks.map(task => ({
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

        if (fileType === 'pdf') {
            const doc = new jsPDF('landscape');
            
            // Add title
            doc.setFontSize(16);
            doc.setTextColor(5, 150, 105);
            doc.text(`${activeTab} Tasks`, 14, 15);

            // Get columns based on active tab
            const columns = Object.keys(exportData[0]);

            autoTable(doc, {
                head: [columns],
                body: exportData.map(item => Object.values(item)),
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
                    0: { cellWidth: 35 }, // Name
                    1: { cellWidth: 35 }, // Title
                    2: { cellWidth: 25 }, // Status
                    3: { cellWidth: 25 }, // Priority
                    4: { cellWidth: 30 }, // FRN
                    5: { cellWidth: 30 }, // OSS
                    6: { cellWidth: 25 }, // Open Date
                    ...(columns.length > 7 && {
                        7: { cellWidth: 30 },
                        8: { cellWidth: 35 }
                    })
                },
                margin: { top: 25 }
            });

            doc.save(`${activeTab.toLowerCase()}-tasks.pdf`);
        } 
        else if (fileType === 'excel') {
            try {
                // Create worksheet with custom column widths
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();

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
            } catch (error) {
                console.error("Error creating Excel file:", error);
                toast.error("Failed to create Excel file");
            }
        }
        handleExportClose();
    };

    // Add useEffect to fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const type = activeTab === 'All' ? '' : activeTab.toLowerCase();
                const response = await getAllTasks(token, type);
                console.log('Tasks fetched:', response.data);
                
                // Transform API response to match table structure
                const formattedTasks = response.data.map(task => ({
                    id: task.id,
                    name: task.assignedMember.fullName,
                    title: task.taskTitle,
                    status: task.status,
                    priority: task.priority,
                    frnNumber: task.frnNumber,
                    ossNumber: task.ossNumber,
                    openDate: new Date(task.openDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }),
                    completedAt: task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-US') : '',
                    reason: task.reason,
                    notes: task.notes,
                    frozenAt: task.frozenAt ? new Date(task.frozenAt).toLocaleDateString('en-US') : '',
                    caseType: task.caseType,
                    caseSource: task.caseSource
                }));

                setTasks(formattedTasks);
                console.log(formattedTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                toast.error('Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [activeTab]); // Fetch when tab changes

    // Update table configuration
    const table = useMaterialReactTable({
        columns: getColumns(activeTab),
        data: tasks,
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            sorting: [{ id: 'openDate', desc: true }], // Add this line for default sorting
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
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                
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
                        sx={{ mt: -3}}
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
                    </Menu>
                </Box>
            </Box>
        ),
    });

    return (
        <Box sx={{ 
            height: 520, 
            width: containerWidth, 
            flexGrow: 1,
            '& .MuiTable-root': {
                minWidth: 'auto !important' // Override default minWidth
            },
            '& .MuiTableContainer-root': {
                overflowX: 'auto'
            }
        }}>
            <CreateTaskForm 
                open={openDialog} 
                onClose={handleCloseDialog} 
            />

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
