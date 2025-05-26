import { Card, CardContent, CardActionArea, Typography, Grid, Container, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Bar from '../../analytics/bar/Bar';
import Line from '../../analytics/line/Line';
import Stacked from '../../analytics/stacked/Stacked';
import Pie from '../../analytics/pie/Pie';
import HeatMap from '../../analytics/heatmap/HeatMap';
import Funnel from '../../analytics/funnel/Funnel';

const Analytics = () => {
    const [barChartStats, setBarChartStats] = useState({ value: '0', trend: '0%' });
    const [pieChartStats, setPieChartStats] = useState({ value: '0', trend: '0%' });
    const [lineChartStats, setLineChartStats] = useState({ value: '0', trend: '0%' });
    const [heatmapStats, setHeatmapStats] = useState({ value: '0', trend: '0%' });
    const [stackedStats, setStackedStats] = useState({ value: '0', trend: '0%' });
    const [funnelStats, setFunnelStats] = useState({ value: '0', trend: '0%' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarChartData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://localhost:49798/api/reports/task-distribution-by-member',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Calculate total tasks
                const totalTasks = response.data.reduce((sum, item) => sum + item.count, 0);
                
                // Calculate previous period total (assuming we have historical data)
                // For this example, we'll use a simple calculation
                const previousTotal = totalTasks * 0.95; // Assumes 5% growth
                
                // Calculate trend
                const trendPercentage = ((totalTasks - previousTotal) / previousTotal) * 100;
                const trend = `${trendPercentage >= 0 ? '+' : ''}${trendPercentage.toFixed(1)}%`;

                setBarChartStats({
                    value: totalTasks.toString(),
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching bar chart data:', error);
            }
        };

        const fetchPieChartData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://localhost:49798/api/reports/task-status-summary',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Calculate total tasks
                const totalTasks = response.data.reduce((sum, item) => sum + item.count, 0);
                
                // Calculate total completed tasks
                const completedTasks = response.data.find(item => item.type === 'Completed')?.count || 0;
                
                // Calculate completion rate and trend
                const completionRate = ((completedTasks / totalTasks) * 100).toFixed(1);
                const trend = `+${completionRate}%`;

                setPieChartStats({
                    value: totalTasks.toString(),
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching pie chart data:', error);
            }
        };

        const fetchLineChartData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://localhost:49798/api/reports/tasks-over-months',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Calculate total created tasks
                const totalCreated = response.data.reduce((sum, item) => sum + item.created, 0);
                
                // Calculate total completed tasks
                const totalCompleted = response.data.reduce((sum, item) => sum + item.completed, 0);
                
                // Calculate completion trend
                const completionRate = ((totalCompleted / totalCreated) * 100).toFixed(1);
                const trend = `${completionRate}%`;

                setLineChartStats({
                    value: totalCreated.toString(),
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching line chart data:', error);
            }
        };

        const fetchHeatmapData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://localhost:49798/api/reports/tasks-by-case-source',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Get unique departments
                const departments = [...new Set(response.data.map(item => item.department))];
                
                // Calculate total tasks
                const totalTasks = response.data.reduce((sum, item) => sum + item.count, 0);
                
                // Calculate average tasks per department
                const avgTasksPerDepartment = totalTasks / departments.length;
                
                // Calculate trend based on department distribution
                const trend = ((departments.length / 10) * 100).toFixed(1); // Assuming 10 is a baseline

                setHeatmapStats({
                    value: `${departments.length} Departments | ${avgTasksPerDepartment.toFixed(1)} Avg Tasks`,
                    trend: `+${trend}%`
                });
            } catch (error) {
                console.error('Error fetching heatmap data:', error);
            }
        };

        const fetchStackedData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://localhost:49798/api/reports/calendar-activity',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Calculate total tasks
                const totalTasks = response.data.reduce((sum, item) => sum + item.count, 0);
                
                // Calculate average daily tasks
                const uniqueDays = [...new Set(response.data.map(item => item.date))];
                const avgDailyTasks = totalTasks / uniqueDays.length;
                
                // Calculate trend based on daily average
                const trend = ((avgDailyTasks / 10) * 100).toFixed(1); // Assuming 10 tasks per day is baseline

                setStackedStats({
                    value: `${totalTasks} Tasks`,
                    trend: `${trend > 0 ? '+' : ''}${trend}%`
                });
            } catch (error) {
                console.error('Error fetching stacked chart data:', error);
            }
        };

        const fetchFunnelData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://localhost:49798/api/reports/requests-stream-by-type',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Group by request type and calculate totals
                const requestCounts = response.data.reduce((acc, item) => {
                    if (!acc[item.type]) {
                        acc[item.type] = 0;
                    }
                    acc[item.type] += item.count;
                    return acc;
                }, {});

                // Calculate total requests
                const totalRequests = Object.values(requestCounts).reduce((sum, count) => sum + count, 0);
                
                // Calculate completion rate (CompleteTask type)
                const completedTasks = requestCounts['CompleteTask'] || 0;
                const completionRate = ((completedTasks / totalRequests) * 100).toFixed(1);

                setFunnelStats({
                    value: `${totalRequests} Requests`,
                    trend: `${completionRate}%`
                });
            } catch (error) {
                console.error('Error fetching funnel chart data:', error);
            }
        };

        fetchBarChartData();
        fetchPieChartData();
        fetchLineChartData();
        fetchHeatmapData();
        fetchStackedData();
        fetchFunnelData();
    }, []);

    const charts = [
        {
            title: 'Task distribution by member',
            subtitle: 'Team Member Performance',
            value: barChartStats.value,
            trend: barChartStats.trend,
            path: '/analytics/bar',
            component: <Bar />,
            gridSize: { xs: 12, md: 8 }
        },
        {
            title: 'Task status summary',
            subtitle: 'Overall Task Status',
            value: pieChartStats.value,
            trend: pieChartStats.trend,
            path: '/analytics/pie',
            component: <Pie />,
            gridSize: { xs: 12, md: 4 }
        },
        {
            title: 'Tasks over months',
            subtitle: 'Monthly Task Creation & Completion',
            value: lineChartStats.value,
            trend: lineChartStats.trend,
            path: '/analytics/line',
            component: <Line />,
            gridSize: { xs: 12, md: 6 }
        },
        {
            title: 'Tasks by case source',
            subtitle: 'Department Distribution',
            value: heatmapStats.value,
            trend: heatmapStats.trend,
            path: '/analytics/heatmap',
            component: <HeatMap />,
            gridSize: { xs: 12, md: 6 }
        },
        {
            title: 'Calendar activity',
            subtitle: 'Daily Task Progress',
            value: stackedStats.value,
            trend: stackedStats.trend,
            path: '/analytics/stacked',
            component: <Stacked />,
            gridSize: { xs: 12, md: 5 }
        },
        {
            title: 'Requests stream by type',
            subtitle: 'Requests Funnel Analysis',
            value: funnelStats.value,
            trend: funnelStats.trend,
            path: '/analytics/funnel',
            component: <Funnel />,
            gridSize: { xs: 12, md: 7 }
        }
    ];

    const handleCardClick = (path) => {
        navigate(path);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

            <Grid container spacing={3}>
                {charts.map((chart, index) => (
                    <Grid item {...chart.gridSize} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                '&:hover': {
                                    boxShadow: '0 6px 30px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <CardActionArea
                                onClick={() => handleCardClick(chart.path)}
                                sx={{ height: '100%' }}
                            >
                                <CardContent sx={{ height: '100%', p: 3 }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a3d37' }}>
                                            {chart.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {chart.subtitle}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#059669' }}>
                                            {chart.value}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                ml: 1,
                                                color: chart.trend.startsWith('+') ? '#059669' : '#dc2626'
                                            }}
                                        >
                                            {chart.trend}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ height: 240, mt: 2 }}>
                                        {chart.component}
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default Analytics;
