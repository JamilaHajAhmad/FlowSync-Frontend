import * as React from "react";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, Tabs, Tab, Stack, Menu, MenuItem, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllSignupRequests, approveSignupRequest, rejectSignupRequest } from "../../../../services/signupRequests";
import { getAllFreezeRequests, approveFreezeRequest, rejectFreezeRequest } from "../../../../services/freezeRequests";
import { getAllCompletionRequests, approveCompletionRequest } from "../../../../services/completionRequests";
import { 
    getAllDeleteAccountRequests, 
    approveDeleteAccountRequest, 
    rejectDeleteAccountRequest 
} from "../../../../services/deleteAccountRequests";
import { 
    getAllChangeStatusRequests, 
    approveChangeStatusRequest, 
    rejectChangeStatusRequest 
} from "../../../../services/changeStatusRequests";
import DeleteMemberDialog from '../components/DeleteMemberDialog';
import { formatString } from "../../../../utils";

const Requests = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [requests, setRequests] = useState({
        signup: [],
        freeze: [],
        completion: [],
        deleteAccount: [],
        changeStatus: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        actionType: '',
        requestId: null,
        requestType: ''
    });
    const [deleteMemberDialog, setDeleteMemberDialog] = useState({
        open: false,
        memberId: null,
        memberName: '',
        requestId: null,
        type: null
    });
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);
    const token = localStorage.getItem('authToken');

    const fetchRequests = async (type) => {
        try {
            setIsLoading(true);
            let response;
            switch (type) {
                case 'signup':
                    response = await getAllSignupRequests(token);
                    break;
                case 'freeze':
                    response = await getAllFreezeRequests(token);
                    break;
                case 'completion':
                    response = await getAllCompletionRequests(token);
                    break;
                case 'deleteAccount':
                    response = await getAllDeleteAccountRequests(token);
                    break;
                case 'changeStatus':
                    response = await getAllChangeStatusRequests(token);
                    break;
                default:
                    return;
            }
            // Filter pending requests
            const pendingRequests = response.data.filter(request => 
                request.requestStatus === 'Pending'
            );
            setRequests(prev => ({
                ...prev,
                [type]: pendingRequests
            }));
        } catch (error) {
            toast.error(`Failed to fetch ${type === 'deleteAccount' ? 'deactivateAccount ' : type} requests`);
            console.error(`Error fetching ${type} requests:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id, type) => {
        try {
            if (!token) throw new Error('No authentication token found');
            const request = requests[type].find(req => req.requestId === id);
            if (type === 'deleteAccount' || type === 'changeStatus') {
                setDeleteMemberDialog({
                    open: true,
                    memberId: request.memberId,
                    memberName: request.memberName,
                    requestId: id,
                    type: type
                });
                return;
            }
            switch (type) {
                case 'signup':
                    await approveSignupRequest(id, token);
                    break;
                case 'freeze':
                    await approveFreezeRequest(id, token);
                    break;
                case 'completion':
                    await approveCompletionRequest(id, token);
                    break;
                default:
                    return;
            }
            setRequests(prev => ({
                ...prev,
                [type]: prev[type].filter(req => req.requestId !== id)
            }));
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} request approved successfully!`);
            fetchRequests(type);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleReject = async (id, type) => {
        try {
            if (!token) throw new Error('No authentication token found');
            switch (type) {
                case 'deleteAccount':
                    await rejectDeleteAccountRequest(id, token);
                    break;
                case 'signup':
                    await rejectSignupRequest(id, token);
                    break;
                case 'freeze':
                    await rejectFreezeRequest(id, token);
                    break;
                case 'changeStatus':
                    await rejectChangeStatusRequest(id, token);
                    break;
                default:
                    return;
            }
            setRequests(prev => ({
                ...prev,
                [type]: prev[type].filter(req => req.requestId !== id)
            }));
            toast.success(`${type === 'deleteAccount' ? 'DeactivateAccount ' : type.charAt(0).toUpperCase() + type.slice(1)} request rejected successfully`);
            fetchRequests(type);
        } catch (error) {
            toast.error(error.response?.data || 'Failed to reject request');
        }
    };

    const handleExportClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setAnchorEl(null);
    };

    const handleDownload = (fileType) => {
        const currentType = Object.keys(requests)[currentTab];
        const getExportColumns = (type) => {
            const baseColumns = {
                'Name': row => row.memberName,
                'Email': row => row.email,
                'Request Date': row => new Date(row.requestedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            };
            const typeSpecificColumns = {
                'signup': {},
                'freeze': { 'FRN': row => row.frnNumber, 'Reason': row => row.reason },
                'completion': { 'FRN': row => row.frnNumber, 'Notes': row => row.notes },
                'deactivateAccount': { 'Reason': row => row.reason },
                'changeStatus': {
                    'Current Status': row => formatString(row.previousStatus),
                    'Requested Status': row => formatString(row.newStatus),
                    'Reason': row => row.reason
                }
            };
            return { ...baseColumns, ...typeSpecificColumns[type] };
        };

        const columns = getExportColumns(currentType);
        const exportData = requests[currentType].map(row => {
            const rowData = {};
            Object.entries(columns).forEach(([header, getter]) => {
                rowData[header] = getter(row);
            });
            return rowData;
        });

        switch (fileType) {
            case 'pdf':
                { const doc = new jsPDF('landscape');
                const tableColumn = Object.keys(columns);
                const tableRows = exportData.map(item => Object.values(item));
                doc.setFontSize(16);
                doc.setTextColor(5, 150, 105);
                doc.text(`${currentType.charAt(0).toUpperCase() + currentType.slice(1)} Requests`, 14, 15);
                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: 25,
                    theme: 'grid',
                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        overflow: 'linebreak',
                        halign: 'left'
                    },
                    headStyles: {
                        fillColor: [5, 150, 105],
                        textColor: 255,
                        fontSize: 9,
                        fontStyle: 'bold',
                        halign: 'left'
                    },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 30 },
                        3: { cellWidth: 30 },
                        4: { cellWidth: 70 }
                    },
                    margin: { top: 25 }
                });
                doc.save(`${currentType}-requests.pdf`);
                toast.success('PDF file exported successfully');
                break; }
            case 'excel':
                try {
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();
                    const colWidths = [
                        { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
                    ];
                    ws['!cols'] = colWidths;
                    XLSX.utils.book_append_sheet(wb, ws, "Requests");
                    XLSX.writeFile(wb, `${currentType}-requests.xlsx`);
                    toast.success('Excel file exported successfully');
                } catch (error) {
                    toast.error("Failed to create Excel file");
                    console.error("Error exporting to Excel:", error);
                }
                break;
            case 'csv':
                try {
                    exportToCSV(exportData, `${currentType}-requests.csv`);
                    toast.success('CSV file exported successfully');
                } catch (error) {
                    toast.error("Failed to create CSV file");
                    console.error("Error exporting to CSV:", error);
                }
                break;
            default:
                break;
        }
        handleExportClose();
    };

    const exportToCSV = (data, filename) => {
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchRequests(Object.keys(requests)[currentTab]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTab]);

    const getColumns = (type) => {
        const baseColumns = [
            {
                accessorKey: "memberName",
                header: "Name",
                size: 150,
            },
            {
                accessorKey: "email",
                header: "Email",
                size: 200,
            },
            {
                accessorKey: "requestedAt",
                header: "Request Date",
                size: 130,
                Cell: ({ cell }) => {
                    const date = new Date(cell.getValue());
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                }
            },
        ];
        const typeSpecificColumns = {
            signup: [],
            freeze: [
                { accessorKey: "frnNumber", header: "FRN", size: 120 },
                { accessorKey: "reason", header: "Reason", size: 150 }
            ],
            completion: [
                { accessorKey: "frnNumber", header: "FRN", size: 120 },
                { accessorKey: "notes", header: "Notes", size: 150 }
            ],
            deleteAccount: [
                { accessorKey: "reason", header: "Reason", size: 200 }
            ],
            changeStatus: [
                {
                    accessorKey: "previousStatus",
                    header: "Current Status",
                    size: 120,
                    Cell: ({ cell }) => formatString(cell.getValue())
                },
                {
                    accessorKey: "newStatus",
                    header: "Requested Status",
                    size: 120,
                    Cell: ({ cell }) => formatString(cell.getValue())
                }
            ]
        };
        return [
            ...baseColumns,
            ...typeSpecificColumns[type],
            {
                accessorKey: "actions",
                header: "Actions",
                size: 250,
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleConfirmAction(row.original.requestId, type, 'approve', 'Are you sure you want to approve this request?')}
                        >
                            Approve
                        </Button>
                        {type !== 'completion' && (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => handleConfirmAction(row.original.requestId, type, 'reject', 'Are you sure you want to reject this request?')}
                            >
                                Reject
                            </Button>
                        )}
                    </Stack>
                ),
            }
        ];
    };

    const table = useMaterialReactTable({
        columns: getColumns(Object.keys(requests)[currentTab]),
        data: requests[Object.keys(requests)[currentTab]],
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#F9FAFB',
                color: '#111827',
                fontWeight: 'bold',
            },
        },
        muiTableBodyProps: {
            sx: {
                '& .MuiTableCell-root': {
                    color: '#374151',
                },
            },
        },
        muiTablePaperProps: {
            sx: {
                '& .MuiToolbar-root': {
                    background: '#fff',
                },
            },
        },
        muiTableContainerProps: {
            sx: {
                width: '100%',
                borderRadius: 2,
                backgroundColor: '#fff',
                overflowX: { xs: 'auto', sm: 'auto', md: 'unset' }, // Responsive horizontal scroll
                // No fixed height here so only one scroll (horizontal if needed)
            },
        },
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '16px', p: 2, justifyContent: 'flex-end' }}>
                <Button
                    onClick={handleExportClick}
                    startIcon={<FileDownloadIcon />}
                    sx={{ mt: -2 }}
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
        state: {
            isLoading: isLoading,
        },
    });

    const handleConfirmAction = (id, type, action, message) => {
        setConfirmDialog({
            isOpen: true,
            title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            message: message,
            actionType: action,
            requestId: id,
            requestType: type
        });
    };

    const handleConfirmClose = () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
    };

    const handleConfirmYes = async () => {
        const { actionType, requestId, requestType } = confirmDialog;
        setIsConfirmLoading(true);
        try {
            if (actionType === 'approve') {
                await handleApprove(requestId, requestType);
            } else {
                await handleReject(requestId, requestType);
            }
        } finally {
            setIsConfirmLoading(false);
            handleConfirmClose();
        }
    };

    const handleDeleteMemberDialogClose = () => {
        setDeleteMemberDialog({
            open: false,
            memberId: null,
            memberName: '',
            requestId: null,
            type: null
        });
    };

    const handleDeleteSuccess = async () => {
        try {
            await approveDeleteAccountRequest(deleteMemberDialog.requestId, token);
            setRequests(prev => ({
                ...prev,
                deleteAccount: prev.deleteAccount.filter(req => 
                    req.requestId !== deleteMemberDialog.requestId
                )
            }));
            handleDeleteMemberDialogClose();
            fetchRequests('deleteAccount');
        } catch (error) {
            toast.error('Failed to approve deactivate account request');
            console.error('Error approving deactivate account request:', error);
        }
    };

    const handleReassignSuccess = async () => {
        try {
            await approveChangeStatusRequest(deleteMemberDialog.requestId, token);
            setRequests(prev => ({
                ...prev,
                changeStatus: prev.changeStatus.filter(req => 
                    req.requestId !== deleteMemberDialog.requestId
                )
            }));
            handleDeleteMemberDialogClose();
            fetchRequests('changeStatus');
        } catch (error) {
            toast.error('Failed to approve change status request');
            console.error('Error approving change status request:', error);
        }
    };

    return (
        <Box p={3}>
            <Tabs
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                        textTransform: 'capitalize',
                        minWidth: 120
                    },
                    '& .Mui-selected': {
                        color: '#059669 !important'
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#059669'
                    }
                }}
            >
                <Tab label="Sign Up" />
                <Tab label="Freeze" />
                <Tab label="Completion" />
                <Tab label="Deactivate Account" />
                <Tab label="Change Status" />
            </Tabs>

            <Box
                sx={{
                    width: '100%',
                    overflowX: { xs: 'auto', sm: 'auto', md: 'unset' },
                    maxWidth: '100vw',
                    backgroundColor: 'transparent',
                }}
            >
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                        <CircularProgress sx={{ color: '#059669' }} />
                    </Box>
                ) : (
                    <MaterialReactTable table={table} />
                )}
            </Box>

            <Dialog
                open={confirmDialog.isOpen}
                onClose={handleConfirmClose}
                PaperProps={{
                    sx: {
                        width: '400px',
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ color: '#111827', fontWeight: 600 }}>
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleConfirmClose}
                        variant="outlined"
                        disabled={isConfirmLoading}
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
                        onClick={handleConfirmYes}
                        variant="contained"
                        disabled={isConfirmLoading}
                        startIcon={isConfirmLoading ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{
                            bgcolor: '#059669',
                            '&:hover': {
                                bgcolor: '#047857'
                            }
                        }}
                    >
                        {isConfirmLoading ? 'Processing...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <DeleteMemberDialog
                open={deleteMemberDialog.open}
                memberId={deleteMemberDialog.memberId}
                memberName={deleteMemberDialog.memberName}
                onClose={() => setDeleteMemberDialog(prev => ({ ...prev, open: false }))}
                onSuccess={deleteMemberDialog.type === 'deleteAccount' ? handleDeleteSuccess : handleReassignSuccess}
                type={deleteMemberDialog.type}
                excludeMemberId={deleteMemberDialog.memberId}
            />
        </Box>
    );
};

export default Requests;