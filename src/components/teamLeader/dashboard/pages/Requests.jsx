import * as React from "react";
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, Tabs, Tab, Stack, Menu, MenuItem, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
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
import DeleteMemberDialog from '../components/DeleteMemberDialog';

const Requests = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [requests, setRequests] = useState({
        signup: [],
        freeze: [],
        completion: [],
        deleteAccount: []
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
        requestId: null
    });
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
            
            if (type === 'deleteAccount') {
                // Open delete member dialog instead of immediate approval
                setDeleteMemberDialog({
                    open: true,
                    memberId: request.memberId,
                    memberName: request.memberName,
                    requestId: id
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
            toast.error(error?.response?.data?.title || 'Failed to approve request');
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
            toast.error(error?.response?.data?.message || 'Failed to reject request');
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
        const exportData = requests[currentType].map(row => ({
            Name: row.MemberName,
            Email: row.email,
            Date: row.RequestedAt,
            ...(row.frn && { FRN: row.frn }),
            ...(row.reason && { Reason: row.reason })
        }));

        if (fileType === 'pdf') {
            const pdf = new jsPDF('landscape');

            const tableColumn = Object.keys(exportData[0]);
            const tableRows = exportData.map(item => Object.values(item));

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
                    fillColor: [5, 150, 105],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                }
            });

            pdf.save(`${currentType}-requests.pdf`);
        }
        else if (fileType === 'excel') {
            try {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Requests");
                XLSX.writeFile(wb, `${currentType}-requests.xlsx`);
            } catch (error) {
                console.error("Error creating Excel file:", error);
            }
        }
        handleExportClose();
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
        
        if (actionType === 'approve') {
            await handleApprove(requestId, requestType);
        } else {
            await handleReject(requestId, requestType);
        }
        
        handleConfirmClose();
    };

    const handleDeleteMemberDialogClose = () => {
        setDeleteMemberDialog({
            open: false,
            memberId: null,
            memberName: '',
            requestId: null
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
                        sx={{
                            bgcolor: '#059669',
                            '&:hover': {
                                bgcolor: '#047857'
                            }
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <DeleteMemberDialog
                open={deleteMemberDialog.open}
                memberId={deleteMemberDialog.memberId}
                memberName={deleteMemberDialog.memberName}
                onClose={handleDeleteMemberDialogClose}
                onSuccess={handleDeleteSuccess}
            />
        </Box>
    );
};

export default Requests;
