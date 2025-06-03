import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

function getDaysInMonth(month, year) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

function StatsCard({ taskType }) {
  const theme = useTheme();
  
  const [cardData, setCardData] = useState({
    title: `${taskType} Tasks`,
    value: '0',
    interval: '',
    trend: 'neutral',
    trendPercentage: 0,
    data: [],
    months: []
  });
  const [loading, setLoading] = useState(true);

  const trendColors = {
    Opened: theme.palette.warning.main,
    Completed: theme.palette.success.main,
    Delayed: theme.palette.error.main,
    Frozen: theme.palette.info.main,
    neutral: theme.palette.grey[400],
  };

  const labelColors = {
    Opened: 'warning',
    Completed: 'success',
    Delayed: 'error',
    Frozen: 'info',
    neutral: 'default',
  };

  const chartColor = trendColors[taskType] || trendColors.neutral;
  const color = labelColors[taskType] || labelColors.neutral;

  const calculateTrend = (current, previous) => {
    if (previous === null || previous === undefined)
      return { trend: 'neutral', percentage: 0 };
    if (previous === 0)
      return {
        trend: current > 0 ? 'up' : 'neutral',
        percentage: current > 0 ? 100 : 0,
      };

    const percentageChange = ((current - previous) / previous) * 100;
    const roundedPercentage = Math.round(percentageChange);

    let trendDirection = 'neutral';
    if (roundedPercentage > 0) trendDirection = 'up';
    else if (roundedPercentage < 0) trendDirection = 'down';

    return { trend: trendDirection, percentage: roundedPercentage };
  };

  const handleTrendCalculation = (currentCount, previousCount) => {
    if (previousCount === undefined || previousCount === null) {
      return { trend: 'neutral', percentage: 0 };
    }

    return calculateTrend(currentCount, previousCount);
  };

  useEffect(() => {
    const fetchTaskStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                'https://localhost:49798/api/reports/leader/monthly-task-status-counts',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log('Task statistics response:', response.data);
            // Sort data by year and month to ensure latest month is first
            const sortedData = [...response.data].sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });

            // Process all months' data
            const monthsData = sortedData.map(monthData => ({
                month: monthData.month,
                year: monthData.year,
                count: monthData.statusCounts?.[taskType] || 0,
                daysInMonth: getDaysInMonth(monthData.month, monthData.year)
            }));

            // Get current month's data
            const currentMonth = monthsData[0]; // Latest month after sorting
            const previousMonth = monthsData[1];

            // Calculate total for current month
            const currentMonthCount = currentMonth?.count || 0;

            // Calculate trend based on current and previous month
            const trends = handleTrendCalculation(
                currentMonthCount,
                previousMonth?.count || 0
            );

            // Create data points for current month's sparkline
            const currentMonthData = Array(currentMonth?.daysInMonth.length || 0).fill(currentMonthCount);

            // Format month name for display
            const monthName = new Date(currentMonth?.year, currentMonth?.month - 1)
                .toLocaleString('default', { month: 'long' });

            setCardData({
                title: `${taskType} Tasks`,
                value: currentMonthCount.toString(),
                interval: `${monthName}-${currentMonth?.year}`,
                trend: trends.trend || 'neutral',
                trendPercentage: trends.percentage || 0,
                data: currentMonthData,
                daysInWeek: currentMonth?.daysInMonth || [],
                months: monthsData
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching task statistics:', error);
            setLoading(false);
        }
    };

    fetchTaskStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskType]);

  if (loading || !cardData) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {cardData.title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
        >
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="h4" component="p">
                {cardData.value}
              </Typography>
              <Chip
                size="small"
                color={color}
                label={`${
                  cardData.trendPercentage > 0 ? '+' : ''
                }${cardData.trendPercentage}%`}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {cardData.interval}
            </Typography>
          </Stack>
          <Box sx={{ width: '100%', height: 50 }}>
            <SparkLineChart
              colors={[chartColor]}
              data={cardData.data}
              area
              showHighlight
              showTooltip
              tooltip={{
                label: 'Tasks',
                format: (value, index) => {
                  const date = cardData.daysInWeek?.[index];
                  return `${date}: ${value} tasks`;
                },
              }}
              xAxis={{
                scaleType: 'band',
                data: cardData.daysInWeek || [],
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${taskType})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${taskType}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default StatsCard;