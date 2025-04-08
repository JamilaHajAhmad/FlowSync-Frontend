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
import { useState } from "react";
import CreateTaskForm from './CreateTaskForm';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
        case "completed":
            return { color: "green", background: "#e0f7e9" };
        case "delayed":
            return { color: "red", background: "#fde8e8" };
        case "ongoing":
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
                }
            ];
        case 'Ongoing':
            return [
                ...baseColumns,
                {
                    accessorKey: "priority",
                    header: "Priority",
                },
                {
                    accessorKey: "dayLefts",
                    header: "Days Left",
                }
            ];
        case 'Delayed':
            return [
                ...baseColumns,
                {
                    accessorKey: "priority",
                    header: "Priority",
                },
                {
                    accessorKey: "daysDelayed",
                    header: "Days Delayed",
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
                }
            ];
        default:
            return baseColumns;
    }
};

const rows = [
    {
        id: 1,
        name: "Omar Zaid Al-Malek",
        status: "Ongoing",
        priority: "High",
        frnNumber: "#123",
        ossNumber: "OSS-456",
        openDate: "08.08.2024",
        dayLefts: 4,
        daysDelayed: 0,
        completedAt: "",
        frozenAt: "",
        caseType: "Investigation",
        caseSource: "Email"
    },
    {
        id: 2,
        name: "John Doe",
        status: "Completed",
        priority: "Medium",
        frnNumber: "#124",
        ossNumber: "OSS-457",
        openDate: "07.08.2024",
        dayLefts: 0,
        daysDelayed: 0,
        completedAt: "10.08.2024",
        frozenAt: "",
        caseType: "Review",
        caseSource: "Phone"
    },
];

export default function Tasks({ 
    hideCreateButton, 
    showTabs,
    containerWidth = "100%",
}) {
    const [activeTab, setActiveTab] = useState('All');
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
        const exportData = rows.map(row => ({
            Name: row.name,
            Status: row.status,
            Priority: row.priority,
            'FRN Number': row.frnNumber,
            'OSS Number': row.ossNumber,
            'Open Date': row.openDate,
            'Days Left': row.dayLefts,
            'Case Type': row.caseType,
            'Case Source': row.caseSource
        }));

        if (fileType === 'pdf') {
            const pdf = new jsPDF('landscape');
            
            const tableColumn = ["Name", "Status", "Priority", "FRN Number", "OSS Number", "Open Date", "Days Left", "Case Type", "Case Source"];
            const tableRows = exportData.map(item => [
                item.Name,
                item.Status,
                item.Priority,
                item["FRN Number"],
                item["OSS Number"],
                item["Open Date"],
                item["Days Left"],
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

    const table = useMaterialReactTable({
        columns: getColumns(activeTab),
        data: rows,
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
        },
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
                        {['All', 'Completed', 'Ongoing', 'Delayed', 'Frozen'].map((tab) => (
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
