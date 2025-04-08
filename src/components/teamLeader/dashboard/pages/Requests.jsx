import * as React from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, Tabs, Tab, Stack, Menu, MenuItem } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NotificationContext } from "../../../common/notification/NotificationContext";

const initialRequests = {
    signup: [
        {
            id: 101,
            type: 'signup',
            name: "Omar Zaid",
            email: "omar@example.com",
            date: "2024-03-20",
        },
        {
            id: 102,
            type: 'signup',
            name: "Omar Zaid",
            email: "omar@example.com",
            date: "2024-03-20",
        },
        // ...more signup requests with unique IDs
    ],
    freeze: [
        {
            id: 201,
            type: 'freeze',
            name: "Lina Khaled",
            email: "lina@example.com",
            date: "2024-03-21",
            frn: "TASK-123",
            reason: "Medical Leave"
        },
        {
            id: 202,
            type: 'freeze',
            name: "Lina Khaled",
            email: "lina@example.com",
            date: "2024-03-21",
            frn: "TASK-123",
            reason: "Medical Leave"
        },
        // ...more freeze requests with unique IDs
    ],
    completion: [
        {
            id: 301,
            type: 'completion',
            name: "Ahmad Hassan",
            email: "ahmad@example.com",
            date: "2024-03-22",
            frn: "TASK-123"
        },
        {
            id: 302,
            type: 'completion',
            name: "Ahmad Hassan",
            email: "ahmad@example.com",
            date: "2024-03-22",
            frn: "TASK-123"
        },
        // ...more completion requests with unique IDs
    ]
};

const Requests = () => {
    const { addNotification } = useContext(NotificationContext);
    const [currentTab, setCurrentTab] = useState(0);
    const [requests, setRequests] = useState(initialRequests);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleExportClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setAnchorEl(null);
    };

    const handleDownload = (fileType) => {
        const currentType = Object.keys(requests)[currentTab];
        const exportData = requests[currentType].map(row => ({
            Name: row.name,
            Email: row.email,
            Date: row.date,
            ...(row.frn && { FRN: row.frn }),
            ...(row.reason && { Reason: row.reason })
        }));

        if (fileType === 'pdf') {
            const pdf = new jsPDF('landscape');

            const tableColumn = Object.keys(exportData[0]);
            const tableRows = exportData.map(item => Object.values(item));

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
                    fillColor: [5, 150, 105],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                }
            });

            pdf.save(`${currentType}-requests.pdf`);
        }
        else if (fileType === 'excel') {
            try {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Requests");
                XLSX.writeFile(wb, `${currentType}-requests.xlsx`);
            } catch (error) {
                console.error("Error creating Excel file:", error);
            }
        }
        handleExportClose();
    };

    const getColumns = (type) => {
        const baseColumns = [
            {
                accessorKey: "name",
                header: "Name",
                size: 150,
            },
            {
                accessorKey: "email",
                header: "Email",
                size: 200,
            },
            {
                accessorKey: "date",
                header: "Request Date",
                size: 130,
            },
        ];

        const typeSpecificColumns = {
            signup: [],
            freeze: [
                {
                    accessorKey: "frn",
                    header: "FRN",
                    size: 120,
                },
                {
                    accessorKey: "reason",
                    header: "Reason",
                    size: 150,
                },
            ],
            completion: [
                {
                    accessorKey: "frn",
                    header: "FRN",
                    size: 120,
                }
            ]
        };

        return [
            ...baseColumns,
            ...typeSpecificColumns[type],
            {
                accessorKey: "actions",
                header: "Actions",
                size: 250,
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApprove(row.original.id, type)}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleReject(row.original.id, type)}
                        >
                            Reject
                        </Button>
                    </Stack>
                ),
            }
        ];
    };

    const handleApprove = (id, type) => {
        const request = requests[type].find(req => req.id === id);
        setRequests(prev => ({
            ...prev,
            [type]: prev[type].filter(request => request.id !== id)
        }));

        const notificationData = {
            id: Date.now(),
            type: 'success',
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Request Approved`,
            message: getNotificationMessage(type, request),
            time: new Date().toLocaleTimeString(),
            read: false
        };

        addNotification(notificationData);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} request approved successfully!`);
    };

    const handleReject = (id, type) => {
        const request = requests[type].find(req => req.id === id);
        setRequests(prev => ({
            ...prev,
            [type]: prev[type].filter(request => request.id !== id)
        }));

        const notificationData = {
            id: Date.now(),
            type: 'error',
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Request Rejected`,
            message: getNotificationMessage(type, request),
            time: new Date().toLocaleTimeString(),
            read: false
        };

        addNotification(notificationData);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} request rejected.`);
    };

    const getNotificationMessage = (type, request) => {
        switch (type) {
            case 'signup':
                return `Account request for ${request.name} has been ${request.status}`;
            case 'freeze':
                return `Task freeze request (${request.frn}) from ${request.name} has been ${request.status}`;
            case 'completion':
                return `Task completion request (${request.frn}) from ${request.name} has been ${request.status}`;
            default:
                return `Request has been ${request.status}`;
        }
    };

    const table = useMaterialReactTable({
        columns: getColumns(Object.keys(requests)[currentTab]),
        data: requests[Object.keys(requests)[currentTab]],
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
                fontWeight: 'bold',
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '16px', p: 2, justifyContent: 'flex-end' }}>
                <Button
                    onClick={handleExportClick}
                    startIcon={<FileDownloadIcon />}
                    sx={{ mt: -2 }}
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
        ),
    });

    return (
        <Box p={3}>
            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                        textTransform: 'capitalize',
                        minWidth: 120
                    },
                    '& .Mui-selected': {
                        color: '#059669 !important'
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#059669'
                    }
                }}
            >
                <Tab label="Sign Up" />
                <Tab label="Freeze" />
                <Tab label="Completion" />
            </Tabs>

            <Box sx={{ height: 400, width: "100%" }}>
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
        </Box>
    );
};

export default Requests;
