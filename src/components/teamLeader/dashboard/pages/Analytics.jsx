import React from 'react';
import { Card, CardContent, CardActionArea, Typography, Grid, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Bar from '../../analytics/bar/Bar';
import Line from '../../analytics/line/Line';
import Stacked from '../../analytics/stacked/Stacked';
import Pie from '../../analytics/pie/Pie';
import HeatMap from '../../analytics/heatmap/HeatMap';
import AreaBump from '../../analytics/areabump/AreaBump';

const charts = [
    {
        title: 'Sales Overview',
        subtitle: 'Monthly Revenue Analysis',
        value: '$18,303.00',
        trend: '+5.3%',
        path: '/analytics/bar',
        component: <Bar />,
        gridSize: { xs: 12, md: 8 }
    },
    {
        title: 'Sales by Category',
        subtitle: 'Product Category Distribution',
        value: '486',
        trend: '+12%',
        path: '/analytics/pie',
        component: <Pie />,
        gridSize: { xs: 12, md: 4 }
    },
    {
        title: 'Platform Orders',
        subtitle: 'Orders by E-commerce Platform',
        value: '1,247',
        trend: '+8.4%',
        path: '/analytics/line',
        component: <Line />,
        gridSize: { xs: 12, md: 6 }
    },
    {
        title: 'Sales Distribution',
        subtitle: 'Regional Performance',
        value: '32 Regions',
        trend: '+3.2%',
        path: '/analytics/heatmap',
        component: <HeatMap />,
        gridSize: { xs: 12, md: 6 }
    },
    {
        title: 'Revenue Breakdown',
        subtitle: 'Revenue Sources Analysis',
        value: '$24,589.00',
        trend: '+15.2%',
        path: '/analytics/stacked',
        component: <Stacked />,
        gridSize: { xs: 12, md: 5 }
    },
    {
        title: 'Sales Trends',
        subtitle: 'Historical Sales Pattern',
        value: '847 Sales',
        trend: '+6.8%',
        path: '/analytics/areabump',
        component: <AreaBump />,
        gridSize: { xs: 12, md: 7 }
    }
];

export default function Analytics() {
    const navigate = useNavigate();

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
