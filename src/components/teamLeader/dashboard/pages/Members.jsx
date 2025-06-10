import * as React from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import { Box, Stack, Chip, Button, Menu, MenuItem, Typography, 
    Avatar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllMembers } from "../../../../services/memberService";
import { getMemberDetails } from "../../../../services/employeeService";
import { formatString } from "../../../../utils";
import DeleteMemberDialog from '../components/DeleteMemberDialog';
import MemberDetailsDialog from '../components/MemberDetailsDialog';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

export default function Members({ showActions = true }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        memberId: null,
        memberName: ''
    });
    const [memberDetailsDialog, setMemberDetailsDialog] = useState({
        open: false,
        member: null,
        loading: false
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
                    tasks: member.ongoingTasks,
                    pictureURL: member.pictureURL,
                    isDeactivated: member.isDeactivated,
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

    const getStatusColor = (status, isDeactivated) => {
        if (isDeactivated) {
            return { color: "#ef4444", background: "#fef2f2" };
        }
        status = formatString(status);
        switch (status) {
            case "On Duty":
                return { color: "green", background: "#e0f7e9" };
            case "Annually Leave":
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
            Cell: ({ cell, row }) => (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <Box position="relative">
                        <Avatar
                            alt={cell.getValue()}
                            src={cell.row.original.pictureURL}
                            sx={{
                                width: 32,
                                height: 32,
                                border: '2px solid #f3f4f6',
                                filter: row.original.isDeactivated ? 'grayscale(100%)' : 'none'
                            }}
                        />
                    </Box>
                    <Typography
                        sx={{
                            fontWeight: 500,
                            color: row.original.isDeactivated ? '#94a3b8' : '#111827',
                        }}
                    >
                        {cell.getValue()}
                    </Typography>
                </Box>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            Cell: ({ cell, row }) => (
                <Chip
                    label={row.original.isDeactivated ? "Deactivated" : formatString(cell.getValue())}
                    sx={{
                        fontSize: "12px",
                        color: getStatusColor(cell.getValue(), row.original.isDeactivated).color,
                        backgroundColor: getStatusColor(cell.getValue(), row.original.isDeactivated).background,
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
            header: "Opened Tasks",
        },
        {
            accessorKey: "actions",
            header: "Actions",
            enableColumnFilter: false,
            Cell: ({ row }) => {
                if (row.original.isDeactivated) {
                    return (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                size="small"
                                disabled
                                sx={{
                                    backgroundColor: '#10b981', // Light green when not disabled
                                    minWidth: 'unset',
                                    padding: '4px 8px',
                                    '&.Mui-disabled': {
                                        backgroundColor: '#e2e8f0'
                                    }
                                }}
                                startIcon={<VisibilityIcon fontSize="small" />}
                            >
                                View
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                disabled
                                sx={{
                                    backgroundColor: '#ef4444',
                                    minWidth: 'unset',
                                    padding: '4px 8px',
                                    '&.Mui-disabled': {
                                        backgroundColor: '#e2e8f0'
                                    }
                                }}
                                startIcon={<CloseIcon fontSize="small" />}
                            >
                                Deactivate
                            </Button>
                        </Stack>
                    );
                }
                return showActions ? (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewClick(row.original)}
                            sx={{
                                backgroundColor: '#10b981', // Light green
                                minWidth: 'unset',
                                padding: '4px 8px',
                                '&:hover': {
                                    backgroundColor: '#059669' // Darker green on hover
                                }
                            }}
                            startIcon={<VisibilityIcon fontSize="small" />}
                        >
                            View
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleDeleteClick(row.original.id, row.original.name)}
                            sx={{
                                backgroundColor: '#ef4444',
                                minWidth: 'unset',
                                padding: '4px 8px',
                                '&:hover': {
                                    backgroundColor: '#dc2626'
                                }
                            }}
                            startIcon={<CloseIcon fontSize="small" />}
                        >
                            Deactivate
                        </Button>
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

    const exportToCSV = (data, filename) => {
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                // Handle values that contain commas or quotes
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDownload = (fileType) => {
        // Filter out removed members and prepare export data
        const exportData = rows
            .filter(row => !row.isDeactivated)
            .map(row => ({
                Name: row.name,
                Status: formatString(row.status),
                Email: row.email,
                'Opened Tasks': row.tasks
            }));

        switch (fileType) {
            case 'pdf':
                { const doc = new jsPDF('landscape');
                
                // Add title
                doc.setFontSize(16);
                doc.setTextColor(5, 150, 105);
                doc.text('Team Members List', 14, 15);

                autoTable(doc, {
                    head: [Object.keys(exportData[0])],
                    body: exportData.map(item => Object.values(item)),
                    startY: 25,
                    theme: 'grid',
                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        overflow: 'linebreak',
                        halign: 'left'
                    },
                    headStyles: {
                        fillColor: [5, 150, 105], // FlowSync green color
                        textColor: 255,
                        fontSize: 9,
                        fontStyle: 'bold',
                        halign: 'left'
                    },
                    columnStyles: {
                        0: { cellWidth: 50 }, // Name
                        1: { cellWidth: 30 }, // Status
                        2: { cellWidth: 70 }, // Email
                        3: { cellWidth: 30 }  // Ongoing Tasks
                    },
                    margin: { top: 25 }
                });

                doc.save('team-members.pdf');
                toast.success('PDF file exported successfully');
                break; }
            case 'excel':
                try {
                    // Create worksheet with custom column widths
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();

                    // Set column widths
                    ws['!cols'] = [
                        { wch: 30 }, // Name
                        { wch: 20 }, // Status
                        { wch: 40 }, // Email
                        { wch: 15 }  // Ongoing Tasks
                    ];

                    XLSX.utils.book_append_sheet(wb, ws, "Team Members");
                    XLSX.writeFile(wb, "team-members.xlsx");
                    toast.success('Excel file exported successfully');
                } catch (error) {
                    console.error("Error creating Excel file:", error);
                    toast.error("Failed to create Excel file");
                }
                break;
            case 'csv':
                try {
                    exportToCSV(exportData, 'team-members');
                    toast.success('CSV file exported successfully');
                } catch (error) {
                    console.error('Error creating CSV file:', error);
                    toast.error('Failed to create CSV file');
                }
                break;
            default:
                console.error('Unsupported file type');
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
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.original.isDeactivated ? '#f8fafc' : 'inherit',
                '&:hover': {
                    backgroundColor: row.original.isDeactivated ? '#f1f5f9' : undefined,
                },
                opacity: row.original.isDeactivated ? 0.75 : 1,
            }
        }),
        muiTableBodyCellProps: ({ row }) => ({
            sx: {
                color: row.original.isDeactivated ? '#94a3b8' : 'inherit',
            }
        }),
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
                    <MenuItem onClick={() => handleDownload('csv')}>
                        Export as CSV
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

    const handleMemberRemoveSuccess = (memberId) => {
        setRows(prevRows => 
            prevRows.map(row => 
                row.id === memberId 
                    ? { ...row, isDeactivated: true, status: 'Removed', tasks: 0 }
                    : row
            )
        );
        handleDeleteCancel();
    };

    const handleViewClick = async (member) => {
        try {
            setMemberDetailsDialog(prev => ({
                ...prev,
                loading: true,
                open: true
            }));
            
            const token = localStorage.getItem('authToken');
            const response = await getMemberDetails(member.id, token);
            console.log('Fetched member details:', response.data);
            
            setMemberDetailsDialog({
                open: true,
                member: response.data,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching member details:', error);
            toast.error('Failed to load member details');
            setMemberDetailsDialog(prev => ({
                ...prev,
                loading: false
            }));
        }
    };

    const handleDetailsClose = () => {
        setMemberDetailsDialog({
            open: false,
            member: null,
            loading: false
        });
    };

    return (
        <Box sx={{ height: 520, width: "100%" }}>
            <MaterialReactTable table={table} />
            <DeleteMemberDialog
                open={deleteDialog.open}
                memberName={deleteDialog.memberName}
                memberId={deleteDialog.memberId}
                onClose={handleDeleteCancel}
                onSuccess={() => handleMemberRemoveSuccess(deleteDialog.memberId)}
                type="deleteAccount"
            />
            <MemberDetailsDialog
                open={memberDetailsDialog.open}
                onClose={handleDetailsClose}
                member={memberDetailsDialog.member}
            />
        </Box>
    );
}
