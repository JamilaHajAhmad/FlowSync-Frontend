import * as React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';

function renderStatus(status) {
  return <Chip label={status} style={{ backgroundColor: getStatusColor(status).background, color: getStatusColor(status).color }} size="small" />;
}

// Add the color scheme function
const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return { color: "green", background: "#e0f7e9" };
    case "Delayed":
      return { color: "red", background: "#fde8e8" };
    case "On Going":  // Changed from "Ongoing" to match your tab naming
      return { color: "orange", background: "#fff4e0" };
    case "Frozen":
      return { color: "#1976D2", background: "#E3F2FD" };
    default:
      return { color: "#059669", background: "#ecfdf5" }; // Default for "All" tab
  }
};

const rows = [
  {
    frnNumber: '#123',
    ossNumber: 'OSS-456',
    status: 'On Going',
    priority: 'High',
    caseType: 'Investigation',
    caseSource: 'Email',
    openDate: '08.08.2024',
    completedAt: '10.08.2024',
    dayLefts: 4,
    daysDelayed: 2,
    frozenAt: '09.08.2024'
  },
  {
    frnNumber: '#124',
    ossNumber: 'OSS-457',
    status: 'Completed',
    priority: 'Medium',
    caseType: 'Review',
    caseSource: 'Phone',
    openDate: '07.08.2024',
    completedAt: '11.08.2024',
    dayLefts: 0,
    daysDelayed: 0,
    frozenAt: ''
  },
  {
    frnNumber: '#125',
    ossNumber: 'OSS-458',
    status: 'Delayed',
    priority: 'High',
    caseType: 'Investigation',
    caseSource: 'Email',
    openDate: '06.08.2024',
    completedAt: '',
    dayLefts: 0,
    daysDelayed: 5,
    frozenAt: ''
  },
  {
    frnNumber: '#126',
    ossNumber: 'OSS-459',
    status: 'Frozen',
    priority: 'Low',
    caseType: 'Documentation',
    caseSource: 'Email',
    openDate: '05.08.2024',
    completedAt: '',
    dayLefts: 2,
    daysDelayed: 0,
    frozenAt: '08.08.2024'
  },
  {
    frnNumber: '#127',
    ossNumber: 'OSS-460',
    status: 'On Going',
    priority: 'Medium',
    caseType: 'Support',
    caseSource: 'Chat',
    openDate: '04.08.2024',
    completedAt: '',
    dayLefts: 3,
    daysDelayed: 0,
    frozenAt: ''
  },
  {
    frnNumber: '#128',
    ossNumber: 'OSS-461',
    status: 'Completed',
    priority: 'High',
    caseType: 'Bug Fix',
    caseSource: 'Internal',
    openDate: '03.08.2024',
    completedAt: '07.08.2024',
    dayLefts: 0,
    daysDelayed: 0,
    frozenAt: ''
  }
];

const getColumns = (tab) => {
  const baseColumns = [
    {
      field: 'frnNumber',
      headerName: 'FRN Number',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'ossNumber',
      headerName: 'OSS Number',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => renderStatus(params.value)
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'caseType',
      headerName: 'Case Type',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'caseSource',
      headerName: 'Case Source',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'openDate',
      headerName: 'Open Date',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'completedAt',
      headerName: 'Completed At',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'dayLefts',
      headerName: 'Days Left',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'daysDelayed',
      headerName: 'Days Delayed',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'frozenAt',
      headerName: 'Frozen At',
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    }
  ];

  switch (tab) {
    case 'All':
      return baseColumns.slice(0, 7);
    case 'Completed':
      return [ baseColumns[ 0 ], baseColumns[ 1 ], baseColumns[ 3 ], baseColumns[ 6 ], baseColumns[ 7 ] ];
    case 'On Going':
      return [ baseColumns[ 0 ], baseColumns[ 1 ], baseColumns[ 3 ], baseColumns[ 6 ], baseColumns[ 8 ] ];
    case 'Delayed':
      return [ baseColumns[ 0 ], baseColumns[ 1 ], baseColumns[ 3 ], baseColumns[ 6 ], baseColumns[ 9 ] ];
    case 'Frozen':
      return [ baseColumns[ 0 ], baseColumns[ 1 ], baseColumns[ 3 ], baseColumns[ 6 ], baseColumns[ 10 ] ];
    default:
      return [];
  }
};

// Add IDs to rows
const rowsWithIds = rows.map((row, index) => ({
  id: index,
  ...row
}));

function TasksOverview() {
  const [ activeTab, setActiveTab ] = useState('All');

  return (
    <Box sx={{ mt: 4, width: '750px' }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Tasks Overview</Typography>
      <Box sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <Stack
          direction="row"
          sx={{
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f9fafb',
          }}
        >
          {[ 'All', 'Completed', 'On Going', 'Delayed', 'Frozen' ].map((status) => {
            const colors = getStatusColor(status);
            return (
              <Button
                key={status}
                variant="text"
                onClick={() => setActiveTab(status)}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: 0,
                  borderBottom: activeTab === status ? `2px solid ${colors.color}` : '2px solid transparent',
                  backgroundColor: activeTab === status ? colors.background : 'transparent',
                  color: activeTab === status ? colors.color : 'inherit',
                  '&:hover': {
                    backgroundColor: activeTab === status ? colors.background : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {status}
              </Button>
            );
          })}
        </Stack>
        <DataGrid
          rows={rowsWithIds}
          columns={getColumns(activeTab)}
          pagination
          pageSizeOptions={[ 5, 10, 20 ]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          disableSelectionOnClick
          disableColumnMenu
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e0e0e0',
            },
            // Add these styles for footer alignment
            '& .MuiDataGrid-footerContainer': {
              justifyContent: 'flex-end',
              alignItems: 'center',
              display: 'flex',
            },
            '& .MuiTablePagination-root': {
              display: 'flex',
              alignItems: 'center'
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0
            },
            '& .MuiDataGrid-selectedRowCount': {
              display: 'none'
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default TasksOverview;