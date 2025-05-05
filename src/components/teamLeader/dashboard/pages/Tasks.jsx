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
import jsPDF from 'jspdf';
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
            size: 200,
        },
        {
            accessorKey: "title",
            header: "Task Title",
            size: 100,
        },
        {
            accessorKey: "frnNumber",
            header: "FRN Number",
            size: 120,
        },
        {
            accessorKey: "ossNumber",
            header: "OSS Number",
            size: 120,
        },
        {
            accessorKey: "openDate",
            header: "Open Date",
            size: 130,
        }
    ];

    const statusColumn = {
        accessorKey: "status",
        header: "Status",
        size: 130,
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
                    size: 100,
                },
                {
                    accessorKey: "caseType",
                    header: "Case Type",
                    size: 130,
                },
                {
                    accessorKey: "caseSource",
                    header: "Case Source",
                    size: 120,
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
            Status: task.status,
            Priority: task.priority,
            'FRN Number': task.frnNumber,
            'OSS Number': task.ossNumber,
            'Open Date': task.openDate,
            'Case Type': task.caseType,
            'Case Source': task.caseSource
        }));

        if (fileType === 'pdf') {
            const pdf = new jsPDF('landscape');
            
            const tableColumn = ["Name", "Status", "Priority", "FRN Number", "OSS Number", "Open Date", "Case Type", "Case Source"];
            const tableRows = exportData.map(item => [
                item.Name,
                item.Status,
                item.Priority,
                item["FRN Number"],
                item["OSS Number"],
                item["Open Date"],
                item["Case Type"],
                item["Case Source"]
            ]);

            pdf.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 20,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [25, 118, 210],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                }
            });
            
            pdf.save('tasks-list.pdf');
        } 
        else if (fileType === 'excel') {
            try {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Tasks");
                XLSX.writeFile(wb, "tasks-list.xlsx");
            } catch (error) {
                console.error("Error creating Excel file:", error);
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
        <Box sx={{ height: 520, width: containerWidth, flexGrow: 1 }}>
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
