import { Box, Typography } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { DataUsageOutlined as NoDataIcon } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { transformApiData } from './data';
import axios from 'axios';
import { useChartData } from '../../../../context/ChartDataContext';
import DateRangeIcon from '@mui/icons-material/DateRange';

const Pie = () => {
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
                const response = await axios.get('https://localhost:49798/api/reports/task-status-summary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const transformedData = transformApiData(response.data);
                setData(transformedData.data);
                setDateRange(transformedData.dateRange);
                updateChartData({
                    type: 'pie',
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Handle empty or invalid data states
    if (!data || 
        data.length === 0 || 
        (data.length === 1 && data[0].id === 'No Data')) {
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
                    No task status data available
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

            <ResponsivePie
                data={data}
                margin={{ top: 60, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                defs={[
                    {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true
                    }
                ]}
                legends={[
                    {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 10,
                        translateY: 80,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 24,
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: 'circle'
                    }
                ]}
                tooltip={({ datum }) => (
                    <Box
                        sx={{
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                            borderRadius: 1,
                            fontSize: '13px',
                            color: 'text.primary'
                        }}
                    >
                        <strong>{datum.label}:</strong> {datum.value} tasks
                        <br />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {((datum.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}% of total
                        </Typography>
                    </Box>
                )}
                theme={{
                    tooltip: {
                        container: {
                            background: 'white',
                            fontSize: 12
                        }
                    },
                    labels: {
                        text: {
                            fontSize: 11,
                            fontWeight: 500
                        }
                    },
                    legends: {
                        text: {
                            fontSize: 11,
                            fill: '#333333'
                        }
                    }
                }}
                animate={true}
                motionConfig="gentle"
            />
        </Box>
    );
};

export default Pie;