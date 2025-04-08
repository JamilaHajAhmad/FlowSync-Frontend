import * as React from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { Box, IconButton, Stack, Chip, Button, Menu, MenuItem, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

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
            accessorKey: "name",
            header: "Users",
            Cell: ({ cell }) => (
                <Typography sx={{ textAlign: 'center' }}>
                    {cell.getValue()}
                </Typography>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            Cell: ({ cell }) => (
                <Chip
                    label={cell.getValue()}
                    sx={{
                        fontSize: "12px",
                        color: getStatusColor(cell.getValue()).color,
                        backgroundColor: getStatusColor(cell.getValue()).background,
                    }}
                />
            ),
        },
        {
            accessorKey: "email",
            header: "E-mail",
        },
        {
            accessorKey: "tasks",
            header: "Ongoing Tasks",
        },
        {
            accessorKey: "actions",
            header: "Actions",
            enableColumnFilter: false, // Disable filtering for actions column
            Cell: ({ row }) => {
                return showActions ? (
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            onClick={() => handleDelete(row.original.id)}
                            sx={{ color: 'error.main' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                ) : null;
            },
        },
    ].filter(col => showActions || col.accessorKey !== "actions");

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleExportClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setAnchorEl(null);
    };

    const handleDownload = (fileType) => {
        const exportData = rows.map(row => ({
            Name: row.name,
            Status: row.status,
            Email: row.email,
            'Ongoing Tasks': row.tasks
        }));

        if (fileType === 'pdf') {
            const pdf = new jsPDF('landscape');
            
            const tableColumn = ["Name", "Status", "Email", "Ongoing Tasks"];
            const tableRows = exportData.map(item => [
                item.Name,
                item.Status,
                item.Email,
                item["Ongoing Tasks"]
            ]);

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
                    fillColor: [25, 118, 210],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                }
            });
            
            pdf.save('members-list.pdf');
        } 
        else if (fileType === 'excel') {
            try {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Members");
                XLSX.writeFile(wb, "members-list.xlsx");
            } catch (error) {
                console.error("Error creating Excel file:", error);
            }
        }
        handleExportClose();
    };

    const table = useMaterialReactTable({
        columns,
        data: rows,
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: 'white',
                color: 'black',
                fontWeight: 'bold',
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ p: 2 }}>
                <Button
                    onClick={handleExportClick}
                    startIcon={<FileDownloadIcon />}
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
    });

    return (
        <Box sx={{ height: 520, width: "100%" }}>
            <MaterialReactTable table={table} />
        </Box>
    );
}
