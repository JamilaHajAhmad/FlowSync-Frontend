import { useState, useEffect, useRef } from 'react';
import { ResponsiveLine } from '@nivo/line';
import axios from 'axios';
import { transformApiData } from './data';
import { useChartData } from '../../../../context/ChartDataContext';

const Line = () => {
    const [data, setData] = useState([]);
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
                setData(transformedData);
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <ResponsiveLine
            data={data}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: false,
                reverse: false
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
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Month',
                legendOffset: 36,
                legendPosition: 'middle'
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Tasks',
                legendOffset: -40,
                legendPosition: 'middle'
            }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 85,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
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
        />
    );
};

export default Line;