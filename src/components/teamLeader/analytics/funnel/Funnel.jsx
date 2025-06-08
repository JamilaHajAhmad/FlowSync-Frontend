import { Box, Typography } from '@mui/material';
import { ResponsiveFunnel } from '@nivo/funnel';
import { DateRange as DateRangeIcon } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { transformApiData } from './data';
import axios from 'axios';
import { useChartData } from '../../../../context/ChartDataContext';

const Funnel = () => {
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
                const response = await axios.get('https://localhost:49798/api/reports/requests-stream-by-type', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const transformedData = transformApiData(response.data);
                setData(transformedData.data);
                setDateRange(transformedData.dateRange);
                updateChartData({
                    type: 'funnel',
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
    }, [ updateChartData ]); // Keep the dependency but prevent re-fetching

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