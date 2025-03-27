import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Typography, Chip, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // استيراد أيقونة الإكس

export default function Members({ showActions = true }) {
    const [rows, setRows] = React.useState(
        Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            status: i % 3 === 0 ? "On Duty" : i % 3 === 1 ? "Annual Leave" : "Temporarily Leave",
            email: `user${i + 1}@example.com`,
            tasks: Math.floor(Math.random() * 5)
        }))
    );

    const handleDelete = (id) => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "On Duty":
                return { color: "green", background: "#e0f7e9" };
            case "Annual Leave":
                return { color: "red", background: "#fde8e8" };
            case "Temporarily Leave":
                return { color: "orange", background: "#fff4e0" };
            default:
                return {};
        }
    };

    const columns = [
        {
            field: "name",
            headerName: "Users",
            flex: 1.5,
            minWidth: 180,
            renderCell: (params) => (
                <Typography sx={{ textAlign: 'center' }}>
                    {params.value}
                </Typography>
            ),
            headerAlign: "center"
        },
        {
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
        },
        {
            field: "email",
            headerName: "E-mail",
            flex: 1.5,
            minWidth: 200,
            headerAlign: "center"
        },
        {
            field: "tasks",
            headerName: "Ongoing Tasks",
            flex: 0.7,
            minWidth: 120,
            type: "number",
            headerAlign: "center"
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                return showActions ? (
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            onClick={() => handleDelete(params.row.id)}
                            sx={{ color: 'error.main' }}
                        >
                            <CloseIcon fontSize="small" /> {/* استبدال أيقونة السلة بإكس */}
                        </IconButton>
                    </Stack>
                ) : null;
            },
            headerAlign: "center"
        }
    ].filter(col => showActions || col.field !== "actions"); // إخفاء عمود Actions إذا كان showActions = false

    return (
        <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
                rows={rows}
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
                    '& .MuiDataGrid-cell': {
                        py: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    },
                    '& .MuiDataGrid-row': {
                        alignItems: 'center',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#1976D2',
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 'bold',
                        }
                    },
                    '& .MuiDataGrid-virtualScroller': {
                        overflow: 'hidden'
                    },
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none'
                    },
                    '& .MuiDataGrid-cellContent': {
                        width: '100%',
                        textAlign: 'center'
                    }
                }}
            />
        </Box>
    );
}
