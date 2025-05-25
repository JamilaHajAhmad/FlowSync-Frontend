import { useEffect, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { getAllReports } from '../../../../services/reportsService';
import { Box, CircularProgress, Typography } from '@mui/material';
import { format } from 'date-fns';

const Reports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await getAllReports();
                console.log('Fetched reports:', response.data);
                setData(response.data);
            } catch (err) {
                setError('Failed to fetch reports');
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const columns = [
        {
            accessorKey: 'reportID',
            header: 'Report ID',
        },
        {
            accessorKey: 'title',
            header: 'Report Title',
        },
        {
            accessorKey: 'description',
            header: 'Description',
            size: 200,
        },
        {
            accessorKey: 'filtersApplied',
            header: 'Filters Applied',
            Cell: ({ cell }) => {
                const filters = cell.getValue();
                return Array.isArray(filters) ? filters.join(', ') : filters;
            }
        },
        {
            accessorKey: 'fileData',
            header: 'File Data',
            
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            Cell: ({ cell }) => format(new Date(cell.getValue()), 'yyyy-MM-dd HH:mm:ss')
        },
    ];

    const table = useMaterialReactTable({
        columns,
        data, // Changed from rows to data
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enablePagination: true,
        enableColumnFilters: true,
        enableSorting: true,
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            sorting: [{ id: 'createdAt', desc: true }],
            density: 'compact'
        },
        state: { isLoading: loading },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#f5f5f5',
                color: 'black',
                fontWeight: 'bold',
            },
        },
        muiTableContainerProps: { 
            sx: { maxHeight: 600 } 
        },
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return <MaterialReactTable table={table} />;
};

export default Reports;