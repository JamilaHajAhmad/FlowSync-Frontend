import * as React from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip
} from "@mui/material";
import { useState } from 'react';

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return { color: "green", background: "#e0f7e9" };
    case "Delayed":
      return { color: "red", background: "#fde8e8" };
    case "On Going":
      return { color: "orange", background: "#fff4e0" };
    case "Frozen":
      return { color: "#1976D2", background: "#E3F2FD" };
    default:
      return { color: "#059669", background: "#ecfdf5" };
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
      accessorKey: 'frnNumber',
      header: 'FRN Number',
      size: 100,
      muiTableHeadCellProps: {
        align: 'center',
      },
      muiTableBodyCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'ossNumber',
      header: 'OSS Number',
      size: 100,
      muiTableHeadCellProps: {
        align: 'center',
      },
      muiTableBodyCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue()}
          sx={{
            fontSize: '12px',
            color: getStatusColor(cell.getValue()).color,
            backgroundColor: getStatusColor(cell.getValue()).background,
          }}
        />
      ),
      muiTableHeadCellProps: {
        align: 'center',
      },
      muiTableBodyCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      size: 90,
      muiTableHeadCellProps: {
        align: 'center',
      },
      muiTableBodyCellProps: {
        align: 'center',
      },
    },
    {
      accessorKey: 'openDate',
      header: 'Open Date',
      size: 100,
      muiTableHeadCellProps: {
        align: 'center',
      },
      muiTableBodyCellProps: {
        align: 'center',
      },
    },
  ];

  const additionalColumns = {
    'All': [
      {
        accessorKey: 'caseType',
        header: 'Case Type',
        size: 110,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      },
      {
        accessorKey: 'caseSource',
        header: 'Case Source',
        size: 100,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      },
    ],
    'Completed': [
      {
        accessorKey: 'completedAt',
        header: 'Completed At',
        size: 130,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      },
    ],
    'On Going': [
      {
        accessorKey: 'dayLefts',
        header: 'Days Left',
        size: 100,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      },
    ],
    'Delayed': [
      {
        accessorKey: 'daysDelayed',
        header: 'Days Delayed',
        size: 120,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      },
    ],
    'Frozen': [
      {
        accessorKey: 'frozenAt',
        header: 'Frozen At',
        size: 120,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      },
    ],
  };

  return [ ...baseColumns, ...(additionalColumns[ tab ] || []) ];
};

function TasksOverview() {
  const [ activeTab, setActiveTab ] = useState('All');
  const [ filteredData, setFilteredData ] = React.useState(rows);

  React.useEffect(() => {
    if (activeTab === 'All') {
      setFilteredData(rows);
    } else {
      setFilteredData(rows.filter(row => row.status === activeTab));
    }
  }, [ activeTab ]);

  const table = useMaterialReactTable({
    columns: getColumns(activeTab),
    data: filteredData,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enablePagination: true,
    enableColumnFilters: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnResizing: false,
    enableHiding: true,
    initialState: {
      pagination: { pageSize: 5, pageIndex: 0 },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#F9FAFB',
        fontWeight: 'bold',
      },
    },
    renderTopToolbarCustomActions: () => (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: '8px 0',
          width: '100%',
          overflowX: 'auto',
          '::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {[ 'All', 'Completed', 'On Going', 'Delayed', 'Frozen' ].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "contained" : "outlined"}
            onClick={() => setActiveTab(tab)}
            size="small"
            sx={{
              backgroundColor: activeTab === tab ? getStatusColor(tab).background : 'transparent',
              color: getStatusColor(tab).color,
              borderColor: getStatusColor(tab).color,
              '&:hover': {
                backgroundColor: getStatusColor(tab).background,
                opacity: 0.9
              },
              margin: '15px 5px',
              ':first-of-type': {
                marginLeft: '15px'
              }
            }}
          >
            {tab}
          </Button>
        ))}
      </Stack>
    ),
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        width: '100%',
      },
    },
    muiTableContainerProps: {
      sx: {
        border: 'none',
        maxWidth: '100%',
      },
    },
  });

  return (
    <Box 
      sx={{ 
        mt: 4, 
        width: '100%', 
        maxWidth: '800px',
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>Tasks Overview</Typography>
      <MaterialReactTable
        table={table}
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
          },
        }}
        muiTableContainerProps={{
          sx: {
            border: 'none',
          },
        }}
        muiTopToolbarProps={{
          sx: {
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e0e0e0',
          },
        }}
        muiBottomToolbarProps={{
          sx: {
            borderTop: '1px solid #e0e0e0',
          },
        }}
      />
    </Box>
  );
}

export default TasksOverview;