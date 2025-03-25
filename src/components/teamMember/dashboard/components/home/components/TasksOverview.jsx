import * as React from 'react';
import {
  Box,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip
} from "@mui/material";
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
  switch (tab) {
    case 'All':
      return [
        { id: 'frnNumber', label: 'FRN Number' },
        { id: 'ossNumber', label: 'OSS Number' },
        { id: 'status', label: 'Status' },
        { id: 'priority', label: 'Priority' },
        { id: 'caseType', label: 'Case Type' },
        { id: 'caseSource', label: 'Case Source' },
        { id: 'openDate', label: 'Open Date' }
      ];
    case 'Completed':
      return [
        { id: 'frnNumber', label: 'FRN Number' },
        { id: 'ossNumber', label: 'OSS Number' },
        { id: 'priority', label: 'Priority' },
        { id: 'openDate', label: 'Open Date' },
        { id: 'completedAt', label: 'Completed At' }
      ];
    case 'On Going':
      return [
        { id: 'frnNumber', label: 'FRN Number' },
        { id: 'ossNumber', label: 'OSS Number' },
        { id: 'priority', label: 'Priority' },
        { id: 'openDate', label: 'Open Date' },
        { id: 'dayLefts', label: 'Days Left' }
      ];
    case 'Delayed':
      return [
        { id: 'frnNumber', label: 'FRN Number' },
        { id: 'ossNumber', label: 'OSS Number' },
        { id: 'priority', label: 'Priority' },
        { id: 'openDate', label: 'Open Date' },
        { id: 'daysDelayed', label: 'Days Delayed' }
      ];
    case 'Frozen':
      return [
        { id: 'frnNumber', label: 'FRN Number' },
        { id: 'ossNumber', label: 'OSS Number' },
        { id: 'priority', label: 'Priority' },
        { id: 'openDate', label: 'Open Date' },
        { id: 'frozenAt', label: 'Frozen At' }
      ];
    default:
      return [];
  }
};

function TasksOverview() {
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Tasks Overview</Typography>
      <TableContainer component={Paper} elevation={0}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 2,
          gap: 2
        }}>
          <Stack direction="row" spacing={1}>
            {['All', 'Completed', 'On Going', 'Delayed', 'Frozen'].map((status) => (
              <Button
                key={status}
                variant="contained"
                onClick={() => setActiveTab(status)}
                sx={{
                  backgroundColor: getStatusColor(status).background,
                  color: getStatusColor(status).color,
                  '&:hover': {
                    backgroundColor: getStatusColor(status).background,
                    opacity: 0.9
                  },
                  '&.Mui-selected': {
                    backgroundColor: getStatusColor(status).background,
                    opacity: 1
                  }
                }}
              >
                {renderStatus(status)}
              </Button>
            ))}
          </Stack>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              {getColumns(activeTab).map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow key={index}>
                {getColumns(activeTab).map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      textAlign: 'center',
                      ...(column.id === 'status' && {
                        color: getStatusColor(row[column.id]).color,
                        backgroundColor: getStatusColor(row[column.id]).background,
                      })
                    }}
                  >
                    {row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            '.MuiTablePagination-select': {
              color: '#059669',
            },
            '.MuiTablePagination-selectIcon': {
              color: '#059669',
            },
            '.MuiTablePagination-displayedRows': {
              color: '#374151',
            },
            '.MuiTablePagination-actions': {
              color: '#059669',
            }
          }}
        />
      </TableContainer>
    </Box>
  );
}

export default TasksOverview;