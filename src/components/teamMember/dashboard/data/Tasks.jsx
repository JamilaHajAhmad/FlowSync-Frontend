import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Chip } from "@mui/material";

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return { color: "green", background: "#e0f7e9" };
    case "Delayed":
      return { color: "red", background: "#fde8e8" };
    case "Ongoing":
      return { color: "orange", background: "#fff4e0" };
    case "Frozen":
      return { color: "#1976D2", background: "#E3F2FD" };
    default:
      return {};
  }
};

const columns = [
  {
    field: "frnNumber",
    headerName: "FRN Number",
    flex: 1,
    minWidth: 120,
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
    field: "openDate",
    headerName: "Open Date",
    flex: 1,
    minWidth: 130,
    headerAlign: "center"
  },
  {
    field: "dayLefts",
    headerName: "Days Left",
    flex: 1,
    minWidth: 100,
    type: "number",
    headerAlign: "center"
  }
];

const rows = [
  { id: 1, status: "Ongoing", frnNumber: "#123", openDate: "08.08.2024", dayLefts: 5 },
  { id: 2, status: "Frozen", frnNumber: "#124", openDate: "07.08.2024", dayLefts: 10 },
  { id: 3, status: "Delayed", frnNumber: "#125", openDate: "06.08.2024", dayLefts: 2 },
  { id: 4, status: "Completed", frnNumber: "#126", openDate: "05.08.2024", dayLefts: 0 }
];

const TeamMemberTasks = () => {
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
};

export default TeamMemberTasks;

