import { Box, Typography } from '@mui/material';
import { DateRange as DateRangeIcon } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { transformApiData } from './data';
import { ResponsiveBar } from '@nivo/bar';
import { useChartData } from '../../../../context/ChartDataContext';
import axios from 'axios';
import { DataUsageOutlined } from '@mui/icons-material'; // Importing icon for empty state

const Bar = () => {
    const [ data, setData ] = useState([]);
    const [ dateRange, setDateRange ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const { updateChartData } = useChartData();
    const hasFetched = useRef(false); // Track if we've fetched


    useEffect(() => {
        if (hasFetched.current) return; // Skip if already fetched

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://localhost:49798/api/reports/task-distribution-by-member',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const transformedData = transformApiData(response.data);
                setData(transformedData.data);
                setDateRange(transformedData.dateRange);
                updateChartData({
                    type: 'bar',
                    rawData: response.data,
                    transformedData: transformedData.data
                });
                hasFetched.current = true; // Mark as fetched

            } catch (error) {
                console.error('Error fetching bar chart data:', error);
                setError(error.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ updateChartData ]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (!data || data.length === 0 || (data.length === 1 && data[0].member === 'No Data Available')) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 1,
                    color: 'text.secondary'
                }}
            >
                <DataUsageOutlined sx={{ fontSize: 40, opacity: 0.7 }} />
                <Typography variant="body2">No member activity data available</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', height: '100%' }}>
            {dateRange && (
                <Box
                    sx={{
                        position: 'absolute',
                    top: -5,
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

            <ResponsiveBar
                data={data}
                keys={[ 'Opened', 'Completed', 'Frozen', 'Delayed' ]}
                indexBy="member"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={({ id }) => {
                    // Updated color mapping to match the provided grades
                    const colorMap = {
                        'Opened': '#ed6c02',    // Orange from status colors
                        'Completed': '#059669',  // Green from status colors
                        'Frozen': '#1976D2',   // Blue from status colors
                        'Delayed': '#d32f2f'       // Red from status colors
                    };
                    return colorMap[ id ];
                }}
                theme={{
                    // Add gradient background colors
                    bars: {
                        gradient: {
                            colors: ({ id }) => {
                                const gradientMap = {
                                    'Opened': '#fff4e0',    // Orange background
                                    'Completed': '#e0f7e9',  // Green background
                                    'Frozen': '#E3F2FD',     // Blue background
                                    'Delayed': '#fde8e8'     // Red background
                                };
                                return [ gradientMap[ id ], gradientMap[ id ] ];
                            }
                        }
                    }
                }}
                borderColor={{
                    from: 'color',
                    modifiers: [ [ 'darker', 1.6 ] ]
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Team Members',
                    legendPosition: 'middle',
                    legendOffset: 32
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Number of Tasks',
                    legendPosition: 'middle',
                    legendOffset: -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
                role="application"
                ariaLabel="Task distribution by team member"
                barAriaLabel={e => e.id + ": " + e.formattedValue + " tasks for member: " + e.indexValue}
            />
        </Box>
    );
};

export default Bar;
