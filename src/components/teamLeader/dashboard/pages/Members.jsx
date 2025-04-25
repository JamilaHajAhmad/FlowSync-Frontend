import * as React from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { Box, IconButton, Stack, Chip, Button, Menu, MenuItem, Typography, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllMembers } from "../../../../services/memberService";
import { deleteMember } from "../../../../services/memberService";

export default function Members({ showActions = true }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        memberId: null,
        memberName: ''
    });

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getAllMembers(token);
                console.log('Fetched members:', response.data);
                const formattedMembers = response.data.map(member => ({
                    id: member.id,
                    name: member.fullName,
                    status: member.status,
                    email: member.email,
                    tasks: member.ongoingTasks
                }));
                setRows(formattedMembers);
            } catch (error) {
                console.error('Error fetching members:', error);
                toast.error('Failed to load members');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await deleteMember(id, token); // You'll need to create this service function
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            toast.success('Member removed successfully');
        } catch (error) {
            console.error('Error deleting member:', error);
            toast.error('Failed to remove member');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "OnDuty":
                return { color: "green", background: "#e0f7e9" };
            case "AnnualLeave":
                return { color: "red", background: "#fde8e8" };
            case "TemporarilyLeave":
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
            enableColumnFilter: false,
            Cell: ({ row }) => {
                return showActions ? (
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(row.original.id, row.original.name)}
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

    // Update table configuration
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
        state: { isLoading: loading },
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

    const handleDeleteClick = (id, name) => {
        setDeleteDialog({
            open: true,
            memberId: id,
            memberName: name
        });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({
            open: false,
            memberId: null,
            memberName: ''
        });
    };

    const handleDeleteConfirm = async () => {
        if (deleteDialog.memberId) {
            try {
                await handleDelete(deleteDialog.memberId);
                handleDeleteCancel(); // Close the dialog after successful deletion
            } catch (error) {
                console.error('Error in delete confirmation:', error);
                // Error is already handled in handleDelete function
            }
        }
    };

    return (
        <Box sx={{ height: 520, width: "100%" }}>
            <MaterialReactTable table={table} />
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: {
                        width: '400px',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ color: '#111827', fontWeight: 600 }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove {deleteDialog.memberName} from the team?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleDeleteCancel}
                        variant="outlined"
                        sx={{
                            color: '#64748b',
                            borderColor: '#64748b',
                            '&:hover': {
                                borderColor: '#475569',
                                backgroundColor: 'rgba(100, 116, 139, 0.04)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{
                            '&:hover': {
                                bgcolor: '#dc2626'
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
