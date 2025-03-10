import * as React from "react";
import Box from "@mui/material/Box";
import {
    DataGrid
} from "@mui/x-data-grid";
import { Avatar, Typography, Chip } from "@mui/material";


export default function Colleagues() {
    const rows = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        status: i % 3 === 0 ? "On Duty" : i % 3 === 1 ? "Annual Leave" : "Temporarily Leave",
        email: `user${i + 1}@example.com`,
        tasks: Math.floor(Math.random() * 5),
        avatar: `U${i + 1}`,
    }))

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
                <Box display="flex" alignItems="center" justifyContent= "center" gap={1} sx={{ py: 1 }}>
                    <Avatar>{params.row.avatar}</Avatar>
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
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
        }
    ];

    return (
        <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                pagination
                pageSizeOptions={[ 5, 10, 20 ]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 5, page: 0 },
                    },
                }}
                sx={{
                    "& .MuiDataGrid-row": {
                        padding: "10px 0"
                    },
                    "& .MuiDataGrid-cell": {
                        justifyContent: "center",
                        textAlign: "center",
                    },
                }}
            />
        </Box>
    );
}