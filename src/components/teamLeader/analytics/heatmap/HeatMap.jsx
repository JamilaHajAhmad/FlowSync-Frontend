import { useState, useEffect, useRef } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { Box, Typography } from '@mui/material';
import { DateRange as DateRangeIcon } from '@mui/icons-material';
import axios from 'axios';
import { transformApiData } from './data';
import { useChartData } from '../../../../context/ChartDataContext';
import { DataUsageOutlined as NoDataIcon } from '@mui/icons-material';

const HeatMap = () => {
    const [data, setData] = useState([]);
    const [dateRange, setDateRange] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { updateChartData } = useChartData();
    const hasFetched = useRef(false); // Track if we've fetched

    useEffect(() => {
        if (hasFetched.current) return; // Skip if already fetched
        
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('https://localhost:49798/api/reports/tasks-by-case-source', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const transformedData = transformApiData(response.data);
                setData(transformedData.data);
                setDateRange(transformedData.dateRange);
                updateChartData({
                    type: 'heatmap',
                    rawData: response.data,
                    transformedData: transformedData.data
                });
                hasFetched.current = true; // Mark as fetched
            } catch (err) {
                setError(err.message);
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [updateChartData]); // Keep the dependency but prevent re-fetching

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Handle empty or invalid data states
    if (!data || data.length === 0 || (data.length === 1 && data[0].id === 'No Data')) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 1,
                    color: 'text.secondary',
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }}
            >
                <NoDataIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    No department activity data available
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            {dateRange && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: -20,
                        right: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: '#f8fafc',
                        px: 2,
                        py: 0.75,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider',
                        zIndex: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <DateRangeIcon sx={{ color: '#059669', fontSize: 18 }} />
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            letterSpacing: '0.25px'
                        }}
                    >
                        {dateRange.from} - {dateRange.to}
                    </Typography>
                </Box>
            )}

            <ResponsiveHeatMap
                data={data}
                margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
                valueFormat=">-.2s"
                axisTop={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Task Status',
                    legendPosition: 'middle',
                    legendOffset: 46
                }}
                axisRight={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Department',
                    legendPosition: 'middle',
                    legendOffset: 85
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Department',
                    legendPosition: 'middle',
                    legendOffset: -85
                }}
                colors={{
                    type: 'diverging',
                    scheme: 'spectral',
                    divergeAt: 0.5,
                    minValue: 0,
                    maxValue: 10
                }}
                emptyColor="#555555"
                legends={[
                    {
                        anchor: 'bottom',
                        translateX: 0,
                        translateY: 30,
                        length: 400,
                        thickness: 8,
                        direction: 'row',
                        tickPosition: 'after',
                        tickSize: 3,
                        tickSpacing: 4,
                        tickOverlap: false,
                        tickFormat: '>-.2s',
                        title: 'Number of Tasks →',
                        titleAlign: 'start',
                        titleOffset: 4
                    }
                ]}
            />
        </Box>
    );
};

export default HeatMap;