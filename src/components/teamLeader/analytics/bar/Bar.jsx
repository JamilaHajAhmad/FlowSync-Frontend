import { useState, useEffect, useRef } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import axios from 'axios';
import { transformApiData } from './data';
import { useChartData } from '../../../../context/ChartDataContext';

const Bar = () => {
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
                const response = await axios.get('https://localhost:49798/api/reports/task-distribution-by-member', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const transformedData = transformApiData(response.data);
                setData(transformedData);
                updateChartData({
                    type: 'bar',
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
        <ResponsiveBar
            data={data}
            keys={['Opened', 'Completed', 'Frozen', 'Delayed']}
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
                return colorMap[id];
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
                            return [gradientMap[id], gradientMap[id]];
                        }
                    }
                }
            }}
            borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
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
            barAriaLabel={e=>e.id+": "+e.formattedValue+" tasks for member: "+e.indexValue}
        />
    );
};

export default Bar;