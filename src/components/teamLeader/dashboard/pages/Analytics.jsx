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
    const [ barChartStats, setBarChartStats ] = useState({ value: '0', trend: '0%' });
    const [ pieChartStats, setPieChartStats ] = useState({ value: '0', trend: '0%' });
    const [ lineChartStats, setLineChartStats ] = useState({ value: '0', trend: '0%' });
    const [ heatmapStats, setHeatmapStats ] = useState({ value: '0', trend: '0%' });
    const [ stackedStats, setStackedStats ] = useState({ value: '0', trend: '0%' });
    const [ funnelStats, setFunnelStats ] = useState({ value: '0', trend: '0%' });
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

                // Calculate total tasks from the new response format
                const totalTasks = response.data.date.reduce((sum, item) => sum + item.count, 0);

                // Get highest and lowest task counts per member
                const memberCounts = {};
                response.data.date.forEach(item => {
                    if (!memberCounts[ item.member ]) {
                        memberCounts[ item.member ] = 0;
                    }
                    memberCounts[ item.member ] += item.count;
                });

                const counts = Object.values(memberCounts);
                const maxTasks = Math.max(...counts);
                const minTasks = Math.min(...counts);

                // Calculate distribution trend
                const distributionRange = maxTasks - minTasks;
                const avgTasks = totalTasks / Object.keys(memberCounts).length;
                const distributionIndex = (distributionRange / avgTasks) * 100;
                const trend = `${distributionIndex > 50 ? '+' : '-'}${Math.abs(distributionIndex - 50).toFixed(1)}%`;

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

                // Calculate total tasks from the new response format
                const totalTasks = response.data.date.reduce((sum, item) => sum + item.count, 0);

                // Calculate status distribution using the new format
                const statusCounts = response.data.date.reduce((acc, item) => {
                    acc[ item.status.type ] = item.count;
                    return acc;
                }, {});

                // Calculate completion rate and trend
                const completedTasks = statusCounts[ 'Completed' ] || 0;
                const openedTasks = statusCounts[ 'Opened' ] || 0;

                let trend = "0%";

                if (totalTasks > 0) {
                    const taskEfficiencyRate = ((completedTasks - openedTasks) / totalTasks) * 100;
                    trend = `${taskEfficiencyRate >= 0 ? '+' : ''}${taskEfficiencyRate.toFixed(1)}%`;
                }

                setPieChartStats({
                    value: totalTasks.toString(),
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching pie chart data:', error);
                setPieChartStats({
                    value: '0',
                    trend: '0%'
                });
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

                // Calculate totals from all months
                const totalCreated = response.data.date.reduce((sum, month) => sum + month.created, 0);

                // Calculate trend based on current month vs previous month
                let trend = "0%";
                const months = response.data.date;
                if (months.length >= 2) {
                    const currentMonth = months[months.length - 1];
                    const previousMonth = months[months.length - 2];
                    
                    const currentRate = currentMonth.completed / currentMonth.created * 100;
                    const previousRate = previousMonth.completed / previousMonth.created * 100;
                    
                    const trendValue = currentRate - previousRate;
                    trend = `${trendValue >= 0 ? '+' : ''}${trendValue.toFixed(1)}%`;
                }

                // Set the stats
                setLineChartStats({
                    value: totalCreated.toString(),
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching line chart data:', error);
                setLineChartStats({
                    value: '0',
                    trend: '0%'
                });
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

                // Calculate total tasks across all departments
                const totalTasks = response.data.date.reduce((sum, item) => sum + item.count, 0);

                // Calculate department coverage
                const uniqueDepartments = new Set(response.data.date.map(item => item.department));
                const departmentCount = uniqueDepartments.size;

                // Calculate average tasks per department
                const avgTasksPerDepartment = totalTasks / departmentCount;

                // Calculate distribution trend
                const trend = `${avgTasksPerDepartment >= 5 ? '+' : '-'}${Math.abs(avgTasksPerDepartment - 5).toFixed(1)}%`;

                setHeatmapStats({
                    value: `${departmentCount} Departments`,
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching heatmap data:', error);
                setHeatmapStats({
                    value: '0',
                    trend: '0%'
                });
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

                // Calculate total activities
                const totalActivities = response.data.date.reduce((sum, item) => sum + item.count, 0);
                
                // Calculate daily average
                const uniqueDays = new Set(response.data.date.map(item => 
                    new Date(item.date).toISOString().split('T')[0]
                )).size;
                
                const averagePerDay = totalActivities / uniqueDays;
                
                // Calculate trend based on daily average
                const trend = `${averagePerDay >= 3 ? '+' : '-'}${Math.abs(averagePerDay - 3).toFixed(1)}%`;

                setStackedStats({
                    value: totalActivities.toString(),
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching stacked data:', error);
                setStackedStats({
                    value: '0',
                    trend: '0%'
                });
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

                // Calculate total activities
                const totalActivities = response.data.date.reduce((sum, item) => sum + item.count, 0);
                
                // Calculate activity distribution and trend
                const activityTypes = new Set(response.data.date.map(item => item.type));
                const uniqueActivitiesCount = activityTypes.size;
                
                // Calculate month-over-month growth
                const monthlyTotals = response.data.date.reduce((acc, item) => {
                    const key = `${item.year}-${item.month}`;
                    acc[key] = (acc[key] || 0) + item.count;
                    return acc;
                }, {});
                
                const months = Object.keys(monthlyTotals).sort();
                const currentMonth = monthlyTotals[months[months.length - 1]];
                const previousMonth = monthlyTotals[months[months.length - 2]] || 0;
                
                const growthRate = previousMonth > 0 
                    ? ((currentMonth - previousMonth) / previousMonth) * 100 
                    : 100;
                
                const trend = `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`;

                setFunnelStats({
                    value: `${uniqueActivitiesCount} Types (${totalActivities} Total)`,
                    trend: trend
                });
            } catch (error) {
                console.error('Error fetching funnel data:', error);
                setFunnelStats({
                    value: '0',
                    trend: '0%'
                });
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
