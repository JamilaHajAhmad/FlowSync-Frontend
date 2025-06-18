import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Card, CardContent, Typography, Stack, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress, Tooltip, Box, Divider, Grid
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TaskIcon from '@mui/icons-material/Task';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LineChart } from '@mui/x-charts/LineChart';
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

// Add new InfoCard component
const InfoCard = ({ icon, title, value, subtitle }) => (
  <Box sx={{
    p: 2,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    height: '100%',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    }
  }}>
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Stack>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Box>
);

export default function TasksChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState(null);
  const [previousTaskCount, setPreviousTaskCount] = useState(null);
  const [trend, setTrend] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  // Add TaskDetailsDialog component
  const TaskDetailsDialog = () => (
    <Dialog
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 2,
          maxWidth: 800
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <TaskIcon color="primary" />
        <Typography variant="h6">
          Tasks Analysis {taskData?.year}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ p: 1 }}>
          {/* Main Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <InfoCard
                icon={<TaskIcon color="primary" />}
                title="Total Tasks"
                value={taskData?.taskCount || 0}
                subtitle="Tasks assigned this year"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoCard
                icon={<CalendarMonthIcon color="success" />}
                title="Monthly Average"
                value={Math.round((taskData?.taskCount || 0) / 12)}
                subtitle="Estimated tasks per month"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Detailed Analysis */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Performance Insights
          </Typography>
          
          <Box sx={{
            bgcolor: 'background.default',
            p: 2,
            borderRadius: 2,
            mb: 3
          }}>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                • You have been assigned <strong>{taskData?.taskCount}</strong> tasks in {taskData?.year}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • On average, you handle approximately <strong>{Math.round((taskData?.taskCount || 0) / 12)}</strong> tasks per month
              </Typography>
              {previousTaskCount !== null && (
                <Typography variant="body2" color="text.secondary">
                  • Task volume has {trend >= 0 ? 'increased' : 'decreased'} by <strong>{Math.abs(trend)}%</strong> compared to previous data
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Visualization */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Visual Overview
          </Typography>
          <Box sx={{ height: 300, mb: 2 }}>
            <LineChart
              colors={[theme.palette.primary.main]}
              xAxis={[{
                scaleType: 'point',
                data: [taskData?.year.toString()],
                tickInterval: () => true,
              }]}
              series={[{
                data: [taskData?.taskCount || 0],
                area: true,
                showMark: true,
              }]}
              margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
              grid={{ horizontal: true, vertical: true }}
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setDetailsOpen(false)}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Update the return statement to include the help icon and dialog
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography component="h2" variant="subtitle2">
            Tasks Overview {taskData?.year}
          </Typography>
          <Tooltip title="View Detailed Analysis">
            <IconButton 
              size="small" 
              onClick={() => setDetailsOpen(true)}
              sx={{ color: theme.palette.text.secondary }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        
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
            data: [taskData?.year.toString() || new Date().getFullYear().toString()],
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
        <TaskDetailsDialog />
      </CardContent>
    </Card>
  );
}