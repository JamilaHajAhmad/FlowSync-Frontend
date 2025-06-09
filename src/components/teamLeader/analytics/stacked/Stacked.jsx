import { Box, Typography } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { DataUsageOutlined as NoDataIcon } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { transformApiData } from './data';
import axios from 'axios';
import { useChartData } from '../../../../context/ChartDataContext';
import { DateRange as DateRangeIcon } from '@mui/icons-material';

const Stacked = () => {
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
                const response = await axios.get('https://localhost:49798/api/reports/calendar-activity', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const transformedData = transformApiData(response.data);
                setData(transformedData.data);
                setDateRange(transformedData.dateRange);
                updateChartData({
                    type: 'stacked',
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
        (data.length === 1 && data[0].date === 'No Data')) {
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
                    No activity data available
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
                        right: 50,
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
                keys={['activities']}
                indexBy="date"
                margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={({ data }) => data.activitiesColor}
                borderRadius={4}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Date',
                    legendPosition: 'middle',
                    legendOffset: 40
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Activities',
                    legendPosition: 'middle',
                    legendOffset: -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                }}
                animate={true}
                motionConfig="gentle"
                tooltip={({ value, indexValue }) => (
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
                        <strong>{indexValue}:</strong> {value} activities
                    </Box>
                )}
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
                    tooltip: {
                        container: {
                            background: 'white',
                            fontSize: 12
                        }
                    }
                }}
                role="application"
                ariaLabel="Activity calendar chart"
                barAriaLabel={e=>e.id+": "+e.formattedValue+" activities on "+e.indexValue}
            />
        </Box>
    );
};

export default Stacked;