import { useState, useEffect } from 'react';
import { ResponsiveAreaBump } from '@nivo/bump';
import axios from 'axios';
import { transformApiData } from './data';
import { useChartData } from '../../../../context/ChartDataContext';
import { CircularProgress } from '@mui/material';

const AreaBump = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { updateChartData } = useChartData();

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('https://localhost:49798/api/reports/requests-stream-by-type', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (isMounted) {
                    const transformedData = transformApiData(response.data);
                    // Ensure data is not empty and properly structured
                    if (transformedData && transformedData.length > 0) {
                        setData(transformedData);
                        updateChartData({
                            type: 'areabump',
                            rawData: response.data,
                            transformedData: transformedData
                        });
                    } else {
                        setError('No data available');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    console.error('Error fetching data:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [updateChartData]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></div>;
    if (error) return <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>Error: {error}</div>;
    if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '20px' }}>No data available</div>;

    return (
        <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveAreaBump
                data={data}
                margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
                align="start"
                colors={{ scheme: 'nivo' }}
                blendMode="multiply"
                startLabel={false}
                endLabel={false}
                axisTop={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: '',
                    legendPosition: 'middle',
                    legendOffset: 32
                }}
                animate={false}
                motionConfig="gentle"
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                fillOpacity={0.85}
                activeOpacity={0.85}
                inactiveOpacity={0.15}
                enableGridY={false}
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'column',
                        translateX: 60,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemTextColor: '#999999',
                        symbolSize: 12,
                        symbolShape: 'circle',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#000000'
                                }
                            }
                        ]
                    }
                ]}
            />
        </div>
    );
};

export default AreaBump;