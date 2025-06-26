import { Box, Typography } from '@mui/material';
import { ResponsiveFunnel } from '@nivo/funnel';
import { DateRange as DateRangeIcon } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { transformApiData } from './data';
import { getRequestsStreamByType } from '../../../../services/analyticsService';
import { useChartData } from '../../../../context/ChartDataContext';
import { DataUsageOutlined } from '@mui/icons-material'; 

const Funnel = () => {
    const [ dateRange, setDateRange ] = useState(null);
    const [ data, setData ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const { updateChartData } = useChartData();

    const hasFetched = useRef(false); 

    useEffect(() => {
        if (hasFetched.current) return; 

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getRequestsStreamByType(token);
                const transformedData = transformApiData(response.data);
                setData(transformedData.data);
                setDateRange(transformedData.dateRange);
                updateChartData({
                    type: 'funnel',
                    rawData: response.data,
                    transformedData: transformedData
                });
                hasFetched.current = true;
            } catch (err) {
                setError(err.message);
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ updateChartData ]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (!data || data.length === 0 || (data.length === 1 && data[0].id === 'empty_state')) {
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
                <Typography variant="body2">No activity data available</Typography>
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

            <ResponsiveFunnel
                data={data}
                margin={{ top: 50, right: 20, bottom: 20, left: 20 }}
                valueFormat=">-.0f"
                colors={{ datum: 'color' }}
                labelColor={{ from: 'color', modifiers: [['darker', 3]] }}
                enableLabel={true}
                currentPartSizeExtension={10}
                motionConfig="gentle"
            />
        </Box>
    );
};
export default Funnel;