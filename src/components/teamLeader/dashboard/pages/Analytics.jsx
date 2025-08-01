import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Grid,
    Container,
    Box,
    IconButton,
    Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Bar from '../../analytics/bar/Bar';
import Line from '../../analytics/line/Line';
import Stacked from '../../analytics/stacked/Stacked';
import Pie from '../../analytics/pie/Pie';
import HeatMap from '../../analytics/heatmap/HeatMap';
import Funnel from '../../analytics/funnel/Funnel';
import { Help as HelpIcon } from '@mui/icons-material';
import HelpDialog from '../../analytics/help/HelpDialog';
import {
    getTaskDistributionByMember,
    getTaskStatusSummary,
    getTasksOverMonths,
    getTasksByCaseSource,
    getCalendarActivity,
    getRequestsStreamByType
} from '../../../../services/analyticsService';

const Analytics = () => {
    const [barChartStats, setBarChartStats] = useState({ value: '0', trend: '0%' });
    const [pieChartStats, setPieChartStats] = useState({ value: '0', trend: '0%' });
    const [lineChartStats, setLineChartStats] = useState({ value: '0', trend: '0%' });
    const [heatmapStats, setHeatmapStats] = useState({ value: '0', trend: '0%' });
    const [stackedStats, setStackedStats] = useState({ value: '0', trend: '0%' });
    const [funnelStats, setFunnelStats] = useState({ value: '0', trend: '0%' });
    const [helpOpen, setHelpOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarChartData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await getTaskDistributionByMember(token);
                if (!response.data?.date || response.data.date.length === 0) {
                    setBarChartStats({
                        value: 'No Data',
                        trend: '0%'
                    });
                    return;
                }
                const totalTasks = response.data.date.reduce((sum, item) => sum + item.count, 0);
                const memberCounts = {};
                response.data.date.forEach(item => {
                    if (!memberCounts[item.member]) {
                        memberCounts[item.member] = 0;
                    }
                    memberCounts[item.member] += item.count;
                });
                const counts = Object.values(memberCounts);
                const maxTasks = Math.max(...counts);
                const minTasks = Math.min(...counts);
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
                const response = await getTaskStatusSummary(token);
                if (!response.data?.date || response.data.date.length === 0) {
                    setPieChartStats({
                        value: 'No Data',
                        trend: '0%'
                    });
                    return;
                }
                const totalTasks = response.data.date.reduce((sum, item) => sum + item.count, 0);
                const statusCounts = response.data.date.reduce((acc, item) => {
                    acc[item.status.type] = item.count;
                    return acc;
                }, {});
                const completedTasks = statusCounts['Completed'] || 0;
                const openedTasks = statusCounts['Opened'] || 0;
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
                const response = await getTasksOverMonths(token);
                if (!response.data?.date || response.data.date.length === 0) {
                    setLineChartStats({
                        value: 'No Data',
                        trend: '0%'
                    });
                    return;
                }
                const totalCreated = response.data.date.reduce((sum, month) => sum + month.created, 0);
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
                const response = await getTasksByCaseSource(token);
                if (!response.data?.date || response.data.date.length === 0) {
                    setHeatmapStats({
                        value: 'No Data',
                        trend: '0%'
                    });
                    return;
                }
                const totalTasks = response.data.date.reduce((sum, item) => sum + item.count, 0);
                const uniqueDepartments = new Set(response.data.date.map(item => item.department));
                const departmentCount = uniqueDepartments.size;
                const avgTasksPerDepartment = totalTasks / departmentCount;
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
                const response = await getCalendarActivity(token);
                if (!response.data?.date || response.data.date.length === 0) {
                    setStackedStats({
                        value: 'No Activities',
                        trend: '0%'
                    });
                    return;
                }
                const totalActivities = response.data.date.reduce((sum, item) => sum + item.count, 0);
                const uniqueDays = new Set(response.data.date.map(item =>
                    new Date(item.date).toISOString().split('T')[0]
                )).size;
                const averagePerDay = totalActivities / uniqueDays;
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
                const response = await getRequestsStreamByType(token);
                if (!response.data?.date || response.data.date.length === 0) {
                    setFunnelStats({
                        value: 'No Activities',
                        trend: '0%'
                    });
                    return;
                }
                const totalActivities = response.data.date.reduce((sum, item) => sum + item.count, 0);
                const activityTypes = new Set(response.data.date.map(item => item.type));
                const uniqueActivitiesCount = activityTypes.size;
                const monthlyTotals = response.data.date.reduce((acc, item) => {
                    if (item.year && item.month) {
                        const key = `${item.year}-${item.month.toString().padStart(2, '0')}`;
                        acc[key] = (acc[key] || 0) + item.count;
                    }
                    return acc;
                }, {});
                const months = Object.keys(monthlyTotals).sort();
                const currentMonth = monthlyTotals[months[months.length - 1]] || 0;
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
                    value: 'Error Loading Data',
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
            gridSize: { xs: 12, md: 7 }
        },
        {
            title: 'Requests stream by type',
            subtitle: 'Requests Funnel Analysis',
            value: funnelStats.value,
            trend: funnelStats.trend,
            path: '/analytics/funnel',
            component: <Funnel />,
            gridSize: { xs: 12, md: 5 }
        }
    ];

    const handleCardClick = (path) => {
        navigate(path);
    };

    return (
        <Container
            maxWidth="xl"
            sx={{
                mt: { xs: 2, sm: 4 },
                mb: { xs: 2, sm: 4 },
                px: { xs: 1, sm: 2, md: 3 },
                boxSizing: 'border-box',
                width: '100%',
                maxWidth: '100% !important',
                overflowX: 'hidden'
            }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mb: { xs: 1, sm: 2 }
            }}>
                <Tooltip
                    title="View Analytics Guide"
                    placement="left"
                    arrow
                >
                    <IconButton
                        onClick={() => setHelpOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
                            },
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 }
                        }}
                    >
                        <HelpIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid
                container
                spacing={{ xs: 2, sm: 3 }}
                sx={{
                    boxSizing: 'border-box',
                    width: '100%',
                    maxWidth: '100%',
                    margin: 0,
                }}
            >
                {charts.map((chart, index) => (
                    <Grid
                        item
                        {...chart.gridSize}
                        key={index}
                        sx={{
                            width: '100%',
                            maxWidth: '100%',
                        }}
                    >
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: { xs: 1, sm: 2 },
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                '&:hover': {
                                    boxShadow: '0 6px 30px rgba(0,0,0,0.1)',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                                width: '100%',
                                maxWidth: '100%',
                                overflow: 'visible'
                            }}
                        >
                            <CardActionArea
                                onClick={() => handleCardClick(chart.path)}
                                sx={{ height: '100%', width: '100%' }}
                            >
                                <CardContent sx={{
                                    height: '100%',
                                    p: { xs: 2, sm: 3 },
                                    width: '100%',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box'
                                }}>
                                    <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1a3d37',
                                                fontSize: { xs: '1rem', sm: '1.25rem' }
                                            }}
                                        >
                                            {chart.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                            }}
                                        >
                                            {chart.subtitle}
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        mb: { xs: 2, sm: 3 }
                                    }}>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#059669',
                                                fontSize: { xs: '1.5rem', sm: '2rem' }
                                            }}
                                        >
                                            {chart.value}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                ml: 1,
                                                color: chart.trend.startsWith('+') ? '#059669' : '#dc2626',
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                            }}
                                        >
                                            {chart.trend}
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        height: { xs: 200, sm: 240 },
                                        mt: { xs: 1, sm: 2 },
                                        width: '100%',
                                        maxWidth: '100%',
                                        overflow: 'visible'
                                    }}>
                                        {chart.component}
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <HelpDialog
                open={helpOpen}
                onClose={() => setHelpOpen(false)}
                sx={{
                    '& .MuiDialog-paper': {
                        width: { xs: '95%', sm: '80%', md: '70%' },
                        maxWidth: 800,
                        m: { xs: 1, sm: 2 },
                        p: { xs: 1, sm: 2 }
                    }
                }}
            />
        </Container>
    );
}
export default Analytics;