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
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  DataUsageOutlined as NoDataIcon
} from '@mui/icons-material';

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
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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

  // Responsive chart dimensions
  const getChartHeight = () => {
    if (isMobile) return 40;
    if (isTablet) return 45;
    return 50;
  };

  // Responsive typography variants
  const getTitleVariant = () => {
    if (isMobile) return 'body2';
    return 'subtitle2';
  };

  const getValueVariant = () => {
    if (isMobile) return 'h5';
    if (isTablet) return 'h4';
    return 'h4';
  };

  const getIntervalVariant = () => {
    if (isMobile) return 'body2';
    return 'caption';
  };

  // Responsive chip size
  const getChipSize = () => {
    return isMobile ? 'small' : 'small';
  };

  // Responsive padding and spacing
  const getCardPadding = () => {
    if (isMobile) return 1.5;
    if (isTablet) return 2;
    return 2.5;
  };

  const getStackSpacing = () => {
    if (isMobile) return 0.5;
    return 1;
  };

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
          'https://localhost:49798/api/reports/member/monthly-task-status-counts',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Task statistics response:', response);
        if (!response.data || response.data.length === 0) {
          setCardData({
            title: `${taskType} Tasks`,
            value: '0',
            interval: '',
            trend: 'neutral',
            trendPercentage: 0,
            data: [],
            daysInWeek: [],
            months: [],
          });
          setLoading(false);
          return;
        }

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

        // Format month name for display - responsive formatting
        const monthName = new Date(currentMonth?.year, currentMonth?.month - 1)
          .toLocaleString('default', { 
            month: isMobile ? 'short' : 'long' 
          });

        setCardData({
          title: `${taskType} Tasks`,
          value: currentMonthCount.toString(),
          interval: `${monthName}${isMobile ? '' : '-'}${currentMonth?.year}`,
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
  }, [taskType, isMobile]);

  if (loading || !cardData) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: { xs: 'auto', sm: '100%' },
          minHeight: { xs: 180, sm: 200, md: 220 },
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mx: { xs: 1, sm: 0 },
        }}
      >
        <CircularProgress size={isMobile ? 24 : 32} />
      </Card>
    );
  }

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: { xs: 'auto', sm: '100%' },
        minHeight: { xs: 180, sm: 200, md: 220 },
        flexGrow: 1,
        mx: { xs: 1, sm: 0 },
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: { xs: 1, sm: 2, md: 3 },
          transform: { xs: 'none', sm: 'translateY(-2px)' },
        }
      }}
    >
      <CardContent
        sx={{
          p: getCardPadding(),
          '&:last-child': {
            pb: getCardPadding(),
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography 
          component="h2" 
          variant={getTitleVariant()} 
          gutterBottom
          sx={{
            fontWeight: { xs: 500, sm: 600 },
            fontSize: { xs: '0.875rem', sm: '0.875rem', md: '1rem' },
            lineHeight: 1.2,
            mb: { xs: 1, sm: 1.5 },
          }}
        >
          {cardData.title}
        </Typography>

        <Stack
          direction="column"
          sx={{ 
            justifyContent: 'space-between', 
            flexGrow: 1, 
            gap: getStackSpacing(),
            height: '100%',
          }}
        >
          <Stack sx={{ justifyContent: 'space-between', flexGrow: 1 }}>
            <Stack
              direction={isMobile ? 'column' : 'row'}
              sx={{ 
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 0,
                mb: { xs: 1, sm: 1.5 }
              }}
            >
              <Typography 
                variant={getValueVariant()} 
                component="p"
                sx={{
                  color: chartColor,
                  fontWeight: { xs: 600, sm: 700 },
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                  lineHeight: 1,
                }}
              >
                {cardData.value}
              </Typography>
              <Chip
                size={getChipSize()}
                color={color}
                label={`${cardData.trendPercentage > 0 ? '+' : ''}${cardData.trendPercentage}%`}
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 28 },
                  alignSelf: isMobile ? 'flex-start' : 'center',
                }}
              />
            </Stack>
            
            <Typography 
              variant={getIntervalVariant()} 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.75rem' },
                fontWeight: 500,
              }}
            >
              {cardData.interval}
            </Typography>
          </Stack>

          <Box 
            sx={{ 
              width: '100%', 
              height: getChartHeight(),
              mt: { xs: 1, sm: 1.5 },
              minHeight: getChartHeight(),
            }}
          >
            {cardData.data.length !== 0 ? (
              <SparkLineChart
                colors={[chartColor]}
                data={cardData.data}
                area
                showHighlight={!isMobile}
                showTooltip={!isMobile}
                tooltip={!isMobile ? {
                  label: 'Tasks',
                  format: (value, index) => {
                    const date = cardData.daysInWeek?.[index];
                    return `${date}: ${value} tasks`;
                  },
                } : undefined}
                xAxis={{
                  scaleType: 'band',
                  data: cardData.daysInWeek || [],
                }}
                height={getChartHeight()}
                sx={{
                  [`& .${areaElementClasses.root}`]: {
                    fill: `url(#area-gradient-${taskType})`,
                  },
                  width: '100%',
                }}
              >
                <AreaGradient color={chartColor} id={`area-gradient-${taskType}`} />
              </SparkLineChart>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  p: { xs: 1, sm: 1.5 },
                  bgcolor: 'background.default',
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{
                    mb: 0.5,
                    color: trendColors[taskType]
                  }}
                >
                  <NoDataIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  No activity recorded
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

StatsCard.propTypes = {
  taskType: PropTypes.string.isRequired,
};

export default StatsCard;