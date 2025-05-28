import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import axios from 'axios';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function TasksChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState(null);
  const [previousTaskCount, setPreviousTaskCount] = useState(null);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    const fetchTasksByYear = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          'https://localhost:49798/api/reports/member/tasks-by-year',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const currentYearData = response.data[0];
        const currentTaskCount = currentYearData?.taskCount;
        
        // Get the stored previous task count from localStorage
        const storedPreviousTaskCount = localStorage.getItem('previousTaskCount');
        const storedPreviousTaskCountValue = storedPreviousTaskCount ? parseInt(storedPreviousTaskCount) : null;
        
        // Get the stored current task count (what we had before this fetch)
        const storedCurrentTaskCount = localStorage.getItem('currentTaskCount');
        const storedCurrentTaskCountValue = storedCurrentTaskCount ? parseInt(storedCurrentTaskCount) : null;
        
        if (storedCurrentTaskCountValue === null) {
          // First time loading - no previous data exists
          localStorage.setItem('currentTaskCount', currentTaskCount.toString());
          setPreviousTaskCount(null);
        } else if (currentTaskCount !== storedCurrentTaskCountValue) {
          // Task count has changed - move current to previous, update current
          setPreviousTaskCount(storedCurrentTaskCountValue);
          localStorage.setItem('previousTaskCount', storedCurrentTaskCountValue.toString());
          localStorage.setItem('currentTaskCount', currentTaskCount.toString());
        } else {
          // Task count hasn't changed - keep existing previous value
          setPreviousTaskCount(storedPreviousTaskCountValue);
        }

        setTaskData(currentYearData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks by year:', error);
        setLoading(false);
      }
    };

    fetchTasksByYear();
  }, []);

  useEffect(() => {
    // Calculate trend whenever either task count value changes
    if (taskData?.taskCount !== undefined && previousTaskCount !== undefined && previousTaskCount !== null) {
      const trendValue = previousTaskCount === 0 
        ? (taskData.taskCount > 0 ? 100 : 0) // Handle division by zero
        : ((taskData.taskCount - previousTaskCount) / previousTaskCount) * 100;
      setTrend(Math.round(trendValue));
    }
  }, [taskData, previousTaskCount]);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ width: '100%', minHeight: 250 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Tasks Overview {taskData?.year}
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {taskData?.taskCount || 0}
            </Typography>
            {previousTaskCount !== null && (
              <Chip 
                size="small" 
                color={trend >= 0 ? "success" : "error"} 
                label={`${trend >= 0 ? '+' : ''}${trend}%`} 
              />
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Yearly Task Overview for {taskData?.year || new Date().getFullYear()}
          </Typography>
        </Stack>
        <LineChart
          colors={[theme.palette.primary.main]}
          xAxis={[{
            scaleType: 'point',
            data: [taskData?.year.toString()],
            tickInterval: () => true,
          }]}
          series={[
            {
              data: [taskData?.taskCount || 0],
              area: true,
              showMark: true,
              line: {
                strokeWidth: 2,
              },
              connectNulls: true,
            }
          ]}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true, vertical: true }}
          sx={{
            '.MuiLineElement-root': {
              strokeWidth: 2,
            },
            '.MuiMarkElement-root': {
              strokeWidth: 2,
              fill: 'white',
              r: 4,
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.light} id="tasks" />
        </LineChart>
      </CardContent>
    </Card>
  );
}