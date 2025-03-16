import { Box, Typography, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialRequests = [
    { id: 1, name: "Omar Zaid", email: "omar@example.com", date: "2024-03-20" },
    { id: 2, name: "Lina Khaled", email: "lina@example.com", date: "2024-03-21" },
];

const Requests = () => {
    const [requests, setRequests] = useState(initialRequests);

    const handleApprove = (id) => {
        setRequests(requests.filter((request) => request.id !== id));
        toast.success("User approved successfully!");
    };

    const handleReject = (id) => {
        setRequests(requests.filter((request) => request.id !== id));
        toast.success("User request rejected.");
    };

    const columns = [
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
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            minWidth: 180,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box display="flex" gap={1} justifyContent="center" width="100%">
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(params.row.id)}
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
                    pageSize={5} 
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell': {
                            py: 2, // Add padding to cells
                        },
                        '& .MuiDataGrid-row': {
                            alignItems: 'center', // Center content vertically
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'primary.main',
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold',
                            }
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

export default Requests;
