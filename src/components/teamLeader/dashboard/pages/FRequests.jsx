import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AcUnitIcon from '@mui/icons-material/AcUnit'; // Ice icon for freeze
import CancelIcon from "@mui/icons-material/Cancel";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialRequests = [
    { 
        id: 1, 
        taskId: "TSK-001", 
        requesterName: "Omar Zaid", 
        reason: "Waiting for client feedback", 
        requestDate: "2024-03-20" 
    },
    { 
        id: 2, 
        taskId: "TSK-002", 
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
            field: "taskId", 
            headerName: "Task ID", 
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
            minWidth: 200,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box display="flex" gap={1} justifyContent="center" width="100%">
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#1976D2',
                            '&:hover': {
                                bgcolor: '#1565C0'
                            }
                        }}
                        size="small"
                        startIcon={<AcUnitIcon />}
                        onClick={() => handleFreeze(params.row.id)}
                    >
                        Freeze
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
                            py: 2,
                        },
                        '& .MuiDataGrid-row': {
                            alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#1976D2',
                            color: 'black',
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

export default FRequests;
