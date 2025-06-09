import { Box, Typography } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { DataUsageOutlined as NoDataIcon } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { transformApiData } from './data';
import axios from 'axios';
import { useChartData } from '../../../../context/ChartDataContext';
import DateRangeIcon from '@mui/icons-material/DateRange';

const Line = () => {
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
                const response = await axios.get('https://localhost:49798/api/reports/tasks-over-months', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const transformedData = transformApiData(response.data);
                setData(transformedData.data);
                setDateRange(transformedData.dateRange);
                updateChartData({
                    type: 'line',
                    rawData: response.data,
                    transformedData: transformedData
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

    // Handle empty or invalid data states
    if (!data || 
        data.length === 0 || 
        (data[0].data.length === 1 && data[0].data[0].x === 'No Data')) {
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
                    No task activity data available
                </Typography>
            </Box>
        );
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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

            <ResponsiveLine
                data={data}
                margin={{ top: 30, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: false
                }}
                curve="monotoneX"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Month',
                    legendOffset: 40,
                    legendPosition: 'middle'
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Tasks Count',
                    legendOffset: -40,
                    legendPosition: 'middle'
                }}
                colors={({ id }) => {
                    switch (id) {
                        case 'Created Tasks':
                            return '#ed6c02';    // Orange
                        case 'Completed Tasks':
                            return '#059669';    // Green
                        default:
                            return '#999999';
                    }
                }}
                yFormat=" >-.2f"
                pointSize={8}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                enableSlices="x"
                enableGridX={false}
                enableArea={true}
                areaOpacity={0.1}
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 85,
                        translateY: 50,
                        itemsSpacing: 0,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 15,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemBackground: 'rgba(0, 0, 0, .03)',
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
                theme={{
                    axis: {
                        ticks: {
                            text: {
                                fill: '#6B7280',
                                fontSize: 11
                            }
                        },
                        legend: {
                            text: {
                                fill: '#374151',
                                fontSize: 12,
                                fontWeight: 500
                            }
                        }
                    },
                    legends: {
                        text: {
                            fill: '#374151',
                            fontSize: 11
                        }
                    },
                    tooltip: {
                        container: {
                            backgroundColor: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            fontSize: '13px'
                        }
                    }
                }}
                animate={true}
                motionConfig="gentle"
            />
        </Box>
    );
};

export default Line;