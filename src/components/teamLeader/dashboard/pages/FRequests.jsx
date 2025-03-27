import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const initialRequests = [
    { 
        id: 1, 
        FRN: "TSK-001", 
        requesterName: "Omar Zaid", 
        reason: "Waiting for client feedback", 
        requestDate: "2024-03-20" 
    },
    { 
        id: 2, 
        FRN: "TSK-002", 
        requesterName: "Lina Khaled", 
        reason: "Blocked by technical issues", 
        requestDate: "2024-03-21" 
    },
];

const FRequests = () => {
    const [requests, setRequests] = useState(initialRequests);

    const handleFreeze = (id) => {
        setRequests(requests.filter((request) => request.id !== id));
        toast.success("Task has been frozen successfully!");
    };

    const handleReject = (id) => {
        setRequests(requests.filter((request) => request.id !== id));
        toast.info("Freeze request rejected.");
    };

    const columns = [
        { 
            field: "FRN", 
            headerName: "FRN", 
            flex: 1, 
            minWidth: 120,
            align: 'center',
            headerAlign: 'center'
        },
        { 
            field: "requesterName", 
            headerName: "Requester", 
            flex: 1, 
            minWidth: 150,
            align: 'center',
            headerAlign: 'center'
        },
        { 
            field: "reason", 
            headerName: "Freeze Reason", 
            flex: 2, 
            minWidth: 250,
            align: 'center',
            headerAlign: 'center'
        },
        { 
            field: "requestDate", 
            headerName: "Request Date", 
            flex: 1, 
            minWidth: 130,
            align: 'center',
            headerAlign: 'center'
        },
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
                        onClick={() => handleFreeze(params.row.id)}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(params.row.id)}
                    >
                        Reject
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box p={3}>
            <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid 
                    rows={requests} 
                    columns={columns} 
                    disableRowSelectionOnClick
                    pagination
                    pageSizeOptions={[5, 10, 20]}
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

export default FRequests;
