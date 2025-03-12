import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Avatar, Typography, Chip } from "@mui/material";
import Box from "@mui/material/Box";

const columns = [
    {
        field: "name",
        headerName: "Name",
        flex: 1.5,
        minWidth: 180,
        renderCell: (params) => (
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ py: 1 }}>
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
        field: "frnNumber",
        headerName: "FRN Number",
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
    },
    {
        field: "dayLefts",
        headerName: "Day Lefts",
        flex: 1,
        minWidth: 100,
        type: "number",
        headerAlign: "center"
    }
];


const rows = [
    { id: 1, name: "Omar Zaid Al-Malek", status: "Ongoing", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
    { id: 2, name: "Omar Zaid Al-Malek", status: "Delayed", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
    { id: 3, name: "Omar Zaid Al-Malek", status: "Frozen", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
    { id: 4, name: "Omar Zaid Al-Malek", status: "Ongoing", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
    { id: 5, name: "Omar Zaid Al-Malek", status: "Completed", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
    { id: 1, name: "Omar Zaid Al-Malek", status: "Ongoing", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
    { id: 1, name: "Omar Zaid Al-Malek", status: "Ongoing", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
    { id: 1, name: "Omar Zaid Al-Malek", status: "Ongoing", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 4 },
];

const getStatusColor = (status) => {
    switch (status) {
        case "Completed":
            return { color: "green", background: "#e0f7e9" };
        case "Delayed":
            return { color: "red", background: "#fde8e8" };
        case "Ongoing":
            return { color: "orange", background: "#fff4e0" };
        case "Frozen":
            return { color: "#1976D2", background: "#E3F2FD" }; // Light blue for Frozen
        default:
            return {};
    }
};



export default function Tasks() {
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
                slots={{ toolbar: GridToolbar }}
            />
        </Box>
    );
}
