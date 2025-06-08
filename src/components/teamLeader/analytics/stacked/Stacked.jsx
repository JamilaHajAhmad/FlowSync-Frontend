import { Box, Typography } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { DateRange as DateRangeIcon } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { transformApiData } from './data';
import axios from 'axios';
import { useChartData } from '../../../../context/ChartDataContext';

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
                keys={['activities']}
                indexBy="date"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                colors={'#ed6c02'} // Use the orange color from your data
                theme={{
                    background: 'transparent',
                    textColor: '#333333',
                    fontSize: 11,
                    axis: {
                        ticks: {
                            text: {
                                fill: '#666666'
                            }
                        },
                        legend: {
                            text: {
                                fill: '#333333'
                            }
                        }
                    }
                }}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.2]]
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
                    legend: 'Activity Count',
                    legendPosition: 'middle',
                    legendOffset: -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                }}
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
                ariaLabel="Activity calendar chart"
                barAriaLabel={e=>e.id+": "+e.formattedValue+" activities on "+e.indexValue}
            />
        </Box>
    );
};

export default Stacked;