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

  // FIXED: Improved trend calculation function
  const calculateTrend = (current, previous) => {
    // Handle edge cases
    if (previous === null || previous === undefined || isNaN(previous)) {
      return { trend: 'neutral', percentage: 0 };
    }
    
    if (current === null || current === undefined || isNaN(current)) {
      return { trend: 'neutral', percentage: 0 };
    }

    // Convert to numbers to ensure proper calculation
    const currentNum = Number(current);
    const previousNum = Number(previous);

    // If previous is 0, handle specially to avoid division by zero
    if (previousNum === 0) {
      if (currentNum > 0) {
        return { trend: 'up', percentage: 100 };
      } else if (currentNum < 0) {
        return { trend: 'down', percentage: 100 };
      } else {
        return { trend: 'neutral', percentage: 0 };
      }
    }

    // Calculate percentage change
    const percentageChange = ((currentNum - previousNum) / Math.abs(previousNum)) * 100;
    const roundedPercentage = Math.round(Math.abs(percentageChange)); // Always positive for display

    // Determine trend direction with a small threshold to avoid noise
    let trendDirection = 'neutral';
    const threshold = 1; // Ignore changes less than 1%
    
    if (Math.abs(percentageChange) >= threshold) {
      if (percentageChange > 0) {
        trendDirection = 'up';
      } else if (percentageChange < 0) {
        trendDirection = 'down';
      }
    }

    return { trend: trendDirection, percentage: roundedPercentage };
  };

  // Process the new API response format
  const processApiData = (dataArr) => {
    if (!Array.isArray(dataArr) || dataArr.length === 0) {
      return {
        dailyCounts: [],
        totalCount: 0,
        month: null,
        year: null,
        daysInMonth: []
      };
    }

    // Get month and year from the first data point
    const { month, year } = dataArr[0];
    const daysInMonth = getDaysInMonth(month, year);
    
    // Initialize daily counts array with zeros
    const dailyCounts = Array(daysInMonth.length).fill(0);
    
    // Filter and aggregate data for the specific task type
    const normalize = s => (s || '').toString().trim().toLowerCase();
    const normalizedTaskType = normalize(taskType);
    
    // Group data by day and sum counts for matching status
    const dayMap = {};
    
    dataArr.forEach(item => {
      const itemStatus = normalize(item.status);
      const day = item.day;
      
      if (itemStatus === normalizedTaskType && day >= 1 && day <= daysInMonth.length) {
        if (!dayMap[day]) {
          dayMap[day] = 0;
        }
        dayMap[day] += item.count || 0;
      }
    });
    
    // Fill the dailyCounts array with aggregated data
    Object.keys(dayMap).forEach(day => {
      const dayIndex = parseInt(day) - 1;
      if (dayIndex >= 0 && dayIndex < dailyCounts.length) {
        dailyCounts[dayIndex] = dayMap[day];
      }
    });
    
    const totalCount = dailyCounts.reduce((sum, val) => sum + val, 0);
    
    return {
      dailyCounts,
      totalCount,
      month,
      year,
      daysInMonth
    };
  };

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          'https://localhost:49798/api/reports/member/monthly-task-status-summary',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Task statistics response:', response);

        const dataArr = response.data || [];
        
        if (!Array.isArray(dataArr) || dataArr.length === 0) {
          setCardData({
            title: `${taskType} Tasks`,
            value: '0',
            interval: 'No Data',
            trend: 'neutral',
            trendPercentage: 0,
            data: [],
            daysInWeek: [],
            months: [],
          });
          setLoading(false);
          return;
        }

        // Process the new API response format
        const { dailyCounts, totalCount, month, year, daysInMonth } = processApiData(dataArr);

        // IMPROVED: Better trend calculation logic
        let trend = { trend: 'neutral', percentage: 0 };
        
        if (dailyCounts.length >= 14) {
          // Compare last 7 days vs previous 7 days
          const last7Days = dailyCounts.slice(-7).reduce((a, b) => a + b, 0);
          const prev7Days = dailyCounts.slice(-14, -7).reduce((a, b) => a + b, 0);
          trend = calculateTrend(last7Days, prev7Days);
          
        } else if (dailyCounts.length >= 8) {
          // Compare second half vs first half of available data
          const midPoint = Math.floor(dailyCounts.length / 2);
          const secondHalf = dailyCounts.slice(midPoint).reduce((a, b) => a + b, 0);
          const firstHalf = dailyCounts.slice(0, midPoint).reduce((a, b) => a + b, 0);
          trend = calculateTrend(secondHalf, firstHalf);
          
        } else if (dailyCounts.length >= 4) {
          // Compare last quarter vs first quarter of available data
          const quarterSize = Math.floor(dailyCounts.length / 4);
          if (quarterSize > 0) {
            const lastQuarter = dailyCounts.slice(-quarterSize).reduce((a, b) => a + b, 0);
            const firstQuarter = dailyCounts.slice(0, quarterSize).reduce((a, b) => a + b, 0);
            trend = calculateTrend(lastQuarter, firstQuarter);
          }
          
        } else if (dailyCounts.length >= 2) {
          // Compare last day vs average of previous days
          const lastDay = dailyCounts[dailyCounts.length - 1];
          const previousDays = dailyCounts.slice(0, -1);
          const avgPreviousDays = previousDays.length > 0 ? 
            previousDays.reduce((a, b) => a + b, 0) / previousDays.length : 0;
          trend = calculateTrend(lastDay, avgPreviousDays);
        }

        // Add debug logging to help troubleshoot
        console.log('Trend calculation debug:', {
          taskType,
          dailyCounts,
          totalCount,
          calculatedTrend: trend
        });

        // Format interval display
        const monthName = month && year ? 
          new Date(year, month - 1).toLocaleString('default', { 
            month: isMobile ? 'short' : 'long' 
          }) : 'Unknown';
        
        const intervalText = month && year ? 
          `${monthName}${isMobile ? '' : '-'}${year}` : 'No Data';

        setCardData({
          title: `${taskType} Tasks`,
          value: totalCount.toString(),
          interval: intervalText,
          trend: trend.trend,
          trendPercentage: trend.percentage, // Already absolute value from calculateTrend
          data: dailyCounts,
          daysInWeek: daysInMonth,
          months: [],
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching task statistics:', error);
        
        // Set error state
        setCardData({
          title: `${taskType} Tasks`,
          value: '0',
          interval: 'Error',
          trend: 'neutral',
          trendPercentage: 0,
          data: [],
          daysInWeek: [],
          months: [],
        });
        
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
                label={`${cardData.trend === 'up' ? '+' : cardData.trend === 'down' ? '-' : ''}${cardData.trendPercentage}%`}
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
            {cardData.data.length > 0 && cardData.data.some(val => val > 0) ? (
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