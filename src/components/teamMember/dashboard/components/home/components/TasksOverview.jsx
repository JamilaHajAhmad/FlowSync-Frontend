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
import { useState, useEffect } from 'react';
import { getMemberTasks } from '../../../../../../services/taskService';

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return { color: "green", background: "#e0f7e9" };
    case "Delayed":
      return { color: "red", background: "#fde8e8" };
    case "Opened":
      return { color: "orange", background: "#fff4e0" };
    case "Frozen":
      return { color: "#1976D2", background: "#E3F2FD" };
    default:
      return { color: "#059669", background: "#ecfdf5" };
  }
};

const getColumns = (tab) => {
  const baseColumns = [
    {
      accessorKey: "taskTitle",
      header: "Task Title",
      size: 150,
    },
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
      accessorKey: 'type',
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
      accessorKey: 'createdAt',
      header: 'Open Date',
      size: 100,
      Cell: ({ cell }) => {
        const date = new Date(cell.getValue());
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        return <span>{formattedDate}</span>;
      },
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
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
          const formattedDate = date.toLocaleDateString('en-US', options);
          return <span>{formattedDate}</span>;
        },
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 150,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      }
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
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
          const formattedDate = date.toLocaleDateString('en-US', options);
          return <span>{formattedDate}</span>;
        },
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        size: 150,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      }
    ],
  };

  return [ ...baseColumns, ...(additionalColumns[ tab ] || []) ];
};

function TasksOverview() {
  const [activeTab, setActiveTab] = useState('All');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = 'your-auth-token'; // Replace with actual token retrieval logic
        const response = await getMemberTasks(token, activeTab === 'All' ? 'Opened' : activeTab);
        console.log('Fetched tasks:', response.data);
        setFilteredData(response.data); // Assuming the API returns data in `response.data`
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [activeTab]);

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
        {[ 'All', 'Completed', 'Opened', 'Delayed', 'Frozen' ].map((tab) => (
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
        maxWidth: '900px',
        minHeight: '400px',
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>Tasks Overview</Typography>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '300px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
        }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <MaterialReactTable
          table={table}
          renderEmptyRowsFallback={() => (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
              }}
            >
              <Typography color="text.secondary">No tasks available</Typography>
            </Box>
          )}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              minHeight: '400px',
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
      )}
    </Box>
  );
}

export default TasksOverview;