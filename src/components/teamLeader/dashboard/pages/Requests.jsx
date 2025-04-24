import * as React from "react";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, Tabs, Tab, Stack, Menu, MenuItem, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NotificationContext } from "../../../common/notification/NotificationContext";
import { getAllSignupRequests, approveSignupRequest, rejectSignupRequest } from "../../../../services/signupRequests";
import { getAllFreezeRequests, approveFreezeRequest, rejectFreezeRequest } from "../../../../services/freezeRequests";
import { getAllCompletionRequests, approveCompletionRequest, rejectCompletionRequest } from "../../../../services/completionRequests";

const Requests = () => {
    const { addNotification } = useContext(NotificationContext);
    const [currentTab, setCurrentTab] = useState(0);
    const [requests, setRequests] = useState({
        signup: [],
        freeze: [],
        completion: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const token = localStorage.getItem('authToken');

    const fetchRequests = async (type) => {
        try {
            setIsLoading(true);
            let response;
            switch (type) {
                case 'signup':
                    response = await getAllSignupRequests();
                    console.log(response.data);
                    break;
                case 'freeze':
                    response = await getAllFreezeRequests();
                    break;
                case 'completion':
                    response = await getAllCompletionRequests();
                    break;
                default:
                    return;
            }
            setRequests(prev => ({
                ...prev,
                [type]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching ${type} requests:`, error);
            toast.error(`Failed to fetch ${type} requests`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id, type) => {
        try {
            switch (type) {
                case 'signup':
                    await approveSignupRequest(id, token);
                    break;
                case 'freeze':
                    await approveFreezeRequest(id);
                    break;
                case 'completion':
                    await approveCompletionRequest(id);
                    break;
                default:
                    return;
            }
            
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
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error(error.reponse.data.detail || 'Failed to approve request');
        }
    };

    const handleReject = async (id, type) => {
        try {
            switch (type) {
                case 'signup':
                    await rejectSignupRequest(id, token);
                    break;
                case 'freeze':
                    await rejectFreezeRequest(id);
                    break;
                case 'completion':
                    await rejectCompletionRequest(id);
                    break;
                default:
                    return;
            }
            
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
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error(error.response.data.detail || 'Failed to reject request');
        }
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
            Name: row.MemberName,
            Email: row.email,
            Date: row.RequestedAt,
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

    useEffect(() => {
        const requestTypes = ['signup', 'freeze', 'completion'];
        const currentType = requestTypes[currentTab];
        fetchRequests(currentType);
    }, [currentTab]);

    const getColumns = (type) => {
        const baseColumns = [
            {
                accessorKey: "memberName", // Updated to match database field
                header: "Name",
                size: 150,
            },
            {
                accessorKey: "email", // Updated to match database field
                header: "Email",
                size: 200,
            },
            {
                accessorKey: "requestedAt", // Updated to match database field
                header: "Request Date",
                size: 130,
            },
        ];

        const typeSpecificColumns = {
            signup: [],
            freeze: [
                {
                    accessorKey: "Freeze_FRNNumber", // Updated to match database field
                    header: "FRN",
                    size: 120,
                },
                {
                    accessorKey: "Reason", // Updated to match database field
                    header: "Reason",
                    size: 150,
                },
            ],
            completion: [
                {
                    accessorKey: "Complete_FRNNumber", // Updated to match database field
                    header: "FRN",
                    size: 120,
                },
                {
                    accessorKey: "notes", // Updated to match database field
                    header: "Notes",
                    size: 150,
                },
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
                color: '#111827', // Dark text color for headers
                fontWeight: 'bold',
            },
        },
        muiTableBodyProps: {
            sx: {
                '& .MuiTableCell-root': {
                    color: '#374151', // Dark text color for body cells
                },
            },
        },
        muiTablePaperProps: {
            sx: {
                '& .MuiToolbar-root': {
                    background: '#fff',
                },
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
        state: {
            isLoading: isLoading,
        },
    });

    return (
        <Box p={3}>
            <Tabs
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
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
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress sx={{ color: '#059669' }} />
                    </Box>
                ) : (
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
                )}
            </Box>
        </Box>
    );
};

export default Requests;
