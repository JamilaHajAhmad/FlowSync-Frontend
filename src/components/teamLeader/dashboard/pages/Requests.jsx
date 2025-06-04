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
                    console.log(response.data);
                    break;
                case 'freeze':
                    response = await getAllFreezeRequests(token);
                    console.log(response.data);
                    break;
                case 'completion':
                    response = await getAllCompletionRequests(token);
                    console.log(response.data);
                    break;
                case 'deleteAccount':
                    response = await getAllDeleteAccountRequests(token);
                    console.log('Delete account requests:', response.data);
                    break;
                case 'changeStatus':
                    response = await getAllChangeStatusRequests(token);
                    console.log('Change status requests:', response.data);
                    break;
                default:
                    return;
            }

            // Filter pending requests and create notifications for each
            const pendingRequests = response.data.filter(request => 
                request.requestStatus === 'Pending'
            );

            setRequests(prev => ({
                ...prev,
                [type]: pendingRequests
            }));
        } catch (error) {
            console.error(`Error fetching ${type} requests:`, error);
            toast.error(`Failed to fetch ${type} requests`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id, type) => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            const request = requests[type].find(req => req.requestId === id);
            console.log('Request type:', type); // Debug log
            
            if (type === 'deleteAccount' || type === 'changeStatus') {
                setDeleteMemberDialog({
                    open: true,
                    memberId: request.memberId,
                    memberName: request.memberName,
                    requestId: id,
                    type: type // This should now match exactly with what we're checking for
                });
                return;
            }

            // Handle other request types as before
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
            
            // Update local state and show success message
            setRequests(prev => ({
                ...prev,
                [type]: prev[type].filter(req => req.requestId !== id)
            }));
            
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} request approved successfully!`);
            fetchRequests(type);
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error(error?.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleReject = async (id, type) => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

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
            
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} request rejected successfully`);
            fetchRequests(type);
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error(error.response.data || 'Failed to reject request');
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
        
        // Get all possible columns based on request type
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
                'freeze': {
                    'FRN': row => row.frnNumber,
                    'Reason': row => row.reason
                },
                'completion': {
                    'FRN': row => row.frnNumber,
                    'Notes': row => row.notes
                },
                'deleteAccount': {
                    'Reason': row => row.reason
                },
                'changeStatus': {
                    'Current Status': row => formatString(row.previousStatus), // Changed from currentStatus
                    'Requested Status': row => formatString(row.newStatus), // Changed from requestedStatus
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

                // Add title to PDF
                doc.setFontSize(16);
                doc.setTextColor(5, 150, 105);
                doc.text(`${currentType.charAt(0).toUpperCase() + currentType.slice(1)} Requests`, 14, 15);

                // Add table
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
                        0: { cellWidth: 40 }, // Name
                        1: { cellWidth: 60 }, // Email
                        2: { cellWidth: 30 }, // Date
                        3: { cellWidth: 30 }, // FRN (if exists)
                        4: { cellWidth: 70 }  // Reason/Notes (if exists)
                    },
                    margin: { top: 25 }
                });

                doc.save(`${currentType}-requests.pdf`);
                toast.success('PDF file exported successfully');
                break; }
            
            case 'excel':
                try {
                    // Add headers style
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();

                    // Set column widths
                    const colWidths = [
                        { wch: 20 }, // Name
                        { wch: 30 }, // Email
                        { wch: 15 }, // Date
                        { wch: 15 }, // FRN
                        { wch: 40 }  // Reason/Notes
                    ];
                    ws['!cols'] = colWidths;

                    XLSX.utils.book_append_sheet(wb, ws, "Requests");
                    XLSX.writeFile(wb, `${currentType}-requests.xlsx`);
                    toast.success('Excel file exported successfully');
                } catch (error) {
                    console.error("Error creating Excel file:", error);
                    toast.error("Failed to create Excel file");
                }
                break;
            
            case 'csv':
                try {
                    exportToCSV(exportData, `${currentType}-requests.csv`);
                    toast.success('CSV file exported successfully');
                } catch (error) {
                    console.error("Error creating CSV file:", error);
                    toast.error("Failed to create CSV file");
                }
                break;
            
            default:
                console.error('Unsupported file type');
        }
        
        handleExportClose();
    };

    // Add this new function for CSV export
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

    // Update useEffect to fetch requests for current tab only
    useEffect(() => {
        fetchRequests(Object.keys(requests)[currentTab]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTab]);

    const getColumns = (type) => {
        const baseColumns = [
            {
                accessorKey: "memberName", // Updated to match database field
                header: "Name",
                size: 150,
            },
            {
                accessorKey: "email", // Updated to match database field
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
                {
                    accessorKey: "frnNumber", // Updated to match database field
                    header: "FRN",
                    size: 120,
                },
                {
                    accessorKey: "reason", // Updated to match database field
                    header: "Reason",
                    size: 150,
                },
            ],
            completion: [
                {
                    accessorKey: "frnNumber", // Updated to match database field
                    header: "FRN",
                    size: 120,
                },
                {
                    accessorKey: "notes", // Updated to match database field
                    header: "Notes",
                    size: 150,
                },
            ],
            deleteAccount: [
                {
                    accessorKey: "reason",
                    header: "Reason",
                    size: 200,
                }
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
            columnOrder: ['Name', 'Email','Requested At', 'Actions']
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#F9FAFB',
                color: '#111827', // Dark text color for headers
                fontWeight: 'bold',
            },
        },
        muiTableBodyProps: {
            sx: {
                '& .MuiTableCell-root': {
                    color: '#374151', // Dark text color for body cells
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
            columnOrder: ['Name', 'Email','Requested At', 'Actions']
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
        console.log(id, type, action);
    };

    const handleConfirmClose = () => {
        setConfirmDialog({
            ...confirmDialog,
            isOpen: false
        });
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
            // Call the approve API after successful deletion and reassignment
            await approveDeleteAccountRequest(deleteMemberDialog.requestId, token);
            
            // Update local state
            setRequests(prev => ({
                ...prev,
                deleteAccount: prev.deleteAccount.filter(req => 
                    req.requestId !== deleteMemberDialog.requestId
                )
            }));
            
            toast.success('Account deletion request approved successfully');
            handleDeleteMemberDialogClose();
            fetchRequests('deleteAccount');
        } catch (error) {
            console.error('Error approving delete account request:', error);
            toast.error('Failed to approve delete account request');
        }
    };

    // Update handleReassignSuccess function to fix the typo and handle the approval correctly
    const handleReassignSuccess = async () => {
        try {
            // Call the approve API after successful reassignment
            await approveChangeStatusRequest(deleteMemberDialog.requestId, token);
            
            // Update local state
            setRequests(prev => ({
                ...prev,
                changeStatus: prev.changeStatus.filter(req => 
                    req.requestId !== deleteMemberDialog.requestId
                )
            }));
            
            toast.success('Status change request approved successfully');
            handleDeleteMemberDialogClose(); // Use the existing close handler
            fetchRequests('changeStatus');
        } catch (error) {
            console.error('Error approving change status request:', error);
            toast.error('Failed to approve change status request');
        }
    };

    return (
        <Box p={3}>
            <Tabs
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
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
                <Tab label="Delete Account" />
                <Tab label="Change Status" />
            </Tabs>

            <Box sx={{ height: 400, width: "100%" }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress sx={{ color: '#059669' }} />
                    </Box>
                ) : (
                    <MaterialReactTable
                        table={table}
                        muiTablePaperProps={{
                            sx: {
                                '& .MuiToolbar-root': {
                                    background: '#fff',
                                },
                            },
                        }}
                    />
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
                type={deleteMemberDialog.type} // Pass the type directly
                excludeMemberId={deleteMemberDialog.memberId}
            />
        </Box>
    );
};

export default Requests;
