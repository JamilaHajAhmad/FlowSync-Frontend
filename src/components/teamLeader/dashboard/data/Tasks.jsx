import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import { 
    Chip, 
    Stack, 
    Button,
} from "@mui/material";
import { Add as AddIcon } from '@mui/icons-material';
import Box from "@mui/material/Box";
import { useState } from "react";
import CreateTaskForm from './CreateTaskForm';

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
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 200,
            headerAlign: "center",
        },
        {
            field: "frnNumber",
            headerName: "FRN Number",
            flex: 1,
            minWidth: 120,
            headerAlign: "center"
        },
        {
            field: "ossNumber",
            headerName: "OSS Number",
            flex: 1,
            minWidth: 120,
            headerAlign: "center"
        },
        {
            field: "openDate",
            headerName: "Open Date",
            flex: 1,
            minWidth: 130,
            headerAlign: "center"
        }
    ];

    const statusColumn = {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 130,
        renderCell: (params) => (
            <Chip
                label={params.value}
                sx={{
                    fontSize: "12px",
                    color: getStatusColor(params.value).color,
                    backgroundColor: getStatusColor(params.value).background,
                }}
            />
        ),
        headerAlign: "center"
    };

    switch(tab) {
        case 'All':
            return [
                ...baseColumns,
                statusColumn,
                {
                    field: "priority",
                    headerName: "Priority",
                    flex: 1,
                    headerAlign: "center"
                },
                {
                    field: "caseType",
                    headerName: "Case Type",
                    flex: 1,
                    headerAlign: "center"
                },
                {
                    field: "caseSource",
                    headerName: "Case Source",
                    flex: 1,
                    headerAlign: "center"
                }
            ];
        case 'Completed':
            return [
                ...baseColumns,
                {
                    field: "priority",
                    headerName: "Priority",
                    flex: 1,
                    headerAlign: "center"
                },
                {
                    field: "completedAt",
                    headerName: "Completed At",
                    flex: 1,
                    headerAlign: "center"
                }
            ];
        case 'Ongoing':
            return [
                ...baseColumns,
                {
                    field: "priority",
                    headerName: "Priority",
                    flex: 1,
                    headerAlign: "center"
                },
                {
                    field: "dayLefts",
                    headerName: "Days Left",
                    flex: 1,
                    type: "number",
                    headerAlign: "center"
                }
            ];
        case 'Delayed':
            return [
                ...baseColumns,
                {
                    field: "priority",
                    headerName: "Priority",
                    flex: 1,
                    headerAlign: "center"
                },
                {
                    field: "daysDelayed",
                    headerName: "Days Delayed",
                    flex: 1,
                    type: "number",
                    headerAlign: "center"
                }
            ];
        case 'Frozen':
            return [
                ...baseColumns,
                {
                    field: "priority",
                    headerName: "Priority",
                    flex: 1,
                    headerAlign: "center"
                },
                {
                    field: "frozenAt",
                    headerName: "Frozen At",
                    flex: 1,
                    headerAlign: "center"
                }
            ];
        default:
            return baseColumns;
    }
};

// Update the rows data to include all necessary fields
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
    // ... add more rows with all fields
];

export default function Tasks() {
    const [activeTab, setActiveTab] = useState('All');
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    return (
        <Box sx={{ height: 520, width: "100%" }}>
            <CreateTaskForm 
                open={openDialog} 
                onClose={handleCloseDialog} 
            />

            {/* Tabs and Create Button Section */}
            <Box 
                sx={{ 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
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

            {/* DataGrid */}
            <DataGrid
                rows={rows}
                columns={getColumns(activeTab)}
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
                }}
            />
        </Box>
    );
}
