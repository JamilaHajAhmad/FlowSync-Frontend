import { Box, Button, Tabs, Tab } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
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
    const [ currentTab, setCurrentTab ] = useState(0);
    const [ requests, setRequests ] = useState(initialRequests);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const getColumns = (type) => {
        const baseColumns = [
            {
                field: "name",
                headerName: "Name",
                flex: 1,
                minWidth: 150,
                align: 'center',
                headerAlign: 'center'
            },
            {
                field: "email",
                headerName: "Email",
                flex: 1,
                minWidth: 200,
                align: 'center',
                headerAlign: 'center'
            },
            {
                field: "date",
                headerName: "Request Date",
                flex: 1,
                minWidth: 130,
                align: 'center',
                headerAlign: 'center'
            },
        ];

        const typeSpecificColumns = {
            signup: [],
            freeze: [
                {
                    field: "frn",
                    headerName: "FRN",
                    flex: 1,
                    align: 'center',
                    headerAlign: 'center'
                },
                {
                    field: "reason",
                    headerName: "Reason",
                    flex: 1,
                    align: 'center',
                    headerAlign: 'center'
                },
            ],
            completion: [
                {
                    field: "frn",
                    headerName: "FRN",
                    flex: 1,
                    align: 'center',
                    headerAlign: 'center'
                }
            ]
        };

        return [ ...baseColumns,
        ...typeSpecificColumns[ type ],
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            minWidth: 250,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box display="flex" gap={1} justifyContent="center" width="100%" padding={1}>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(params.row.id, type)}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(params.row.id, type)}
                    >
                        Reject
                    </Button>
                </Box>
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

        // Add notification based on request type
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

        // Add notification based on request type
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
                <DataGrid
                    rows={requests[ Object.keys(requests)[ currentTab ] ]}
                    columns={getColumns(Object.keys(requests)[ currentTab ])}
                    disableRowSelectionOnClick
                    pagination
                    pageSizeOptions={[ 5, 10, 20 ]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 5, page: 0 },
                        },
                    }}
                    sx={{
                        overflowX: 'hidden',
                        "& .MuiDataGrid-cell": {
                            justifyContent: "center",
                            textAlign: "center",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: '#F9FAFB',
                        },
                        "& .MuiDataGrid-footerContainer": {
                            display: 'flex',
                            justifyContent: 'flex-start', // Align pagination controls to the left
                            alignItems: 'center', // Vertically center the controls
                            padding: '0 16px', // Add padding for spacing
                        },
                        "& .MuiTablePagination-toolbar": {
                            justifyContent: 'flex-start', // Align toolbar content to the left
                            alignItems: 'center', // Vertically center the toolbar content
                        },
                        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                            display: 'flex',
                            alignItems: 'center', // Vertically center the text
                            justifyContent: 'center', // Horizontally center the text
                        },
                        "& .MuiTablePagination-select": {
                            display: 'flex',
                            alignItems: 'center', // Vertically center the dropdown
                        },
                        "& .MuiTablePagination-actions": {
                            display: 'flex',
                            alignItems: 'center', // Vertically center the navigation arrows
                            marginLeft: 'auto', // Push the navigation arrows to the far right
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default Requests;
