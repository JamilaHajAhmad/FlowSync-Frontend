import { useState, useEffect } from 'react';
import axios from 'axios';
import GaugeChart from 'react-gauge-chart';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flexGrow: 1,
  backgroundColor: '#F3FCF7',
  borderRadius: '12px',
  padding: theme.spacing(2),
}));

const StyledGaugeChart = styled(GaugeChart)(() => ({
  height: 200,
  width: '100%',
}));

const colors = {
  completed: '#059669',
  delayed: '#EF4444',
  opened: '#F59E0B',
  frozen: '#1976D2',
  gauge: {
    red: '#EF4444',    // Low performance
    orange: '#F59E0B', // Medium performance
    green: '#10B981'   // High performance
  }
};

const KPI = () => {
  const [ kpiData, setKpiData ] = useState(0);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ dialogOpen, setDialogOpen ] = useState(false);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await axios.get(
          'https://localhost:49798/api/kpi/member/annual-kpi',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

        const processedData = {
          totalTasks: response.data.totalTasks || 0,
          completedTasks: response.data.completedTasks || 0,
          delayedTasks: response.data.delayedTasks || 0,
          ongoingTasks: response.data.ongoingTasks || 0,
          frozenTasks: response.data.frozenTasks || 0,
          kpi: response.data.kpi || 0
        };

        const progress = processedData.totalTasks > 0
          ? (processedData.completedTasks / processedData.totalTasks)
          : 0;

        const finalData = {
          ...processedData,
          progress: Math.min(progress, 1)
        };
        setKpiData(finalData);

      } catch (err) {
        setError(err.message || 'Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();
  }, []);

  if (loading) {
    return (
      <StyledCard variant="outlined">
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress sx={{ color: '#059669' }} />
        </CardContent>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard variant="outlined">
        <CardContent>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography component="h2" variant="subtitle2" color="black">
            KPI
          </Typography>
          <Tooltip title="What is KPI?">
            <IconButton size="small" onClick={() => setDialogOpen(true)}>
              <HelpOutlineIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyledGaugeChart
            id="gauge-chart"
            nrOfLevels={3}
            colors={[colors.gauge.red, colors.gauge.orange, colors.gauge.green]}
            arcWidth={0.3}
            percent={Math.min(kpiData?.kpi || 0, 100) / 100}
            needleColor="#059669"
            textColor="#059669"
            formatTextValue={() => `${Math.min(Math.round(kpiData?.kpi || 0), 100)}%`}
          />
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, gap: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">{kpiData.totalTasks}</Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Total
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center'}}>
            <Typography variant="h6" color={colors.opened}>
              {kpiData.ongoingTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Opened
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.frozen}>
              {kpiData.frozenTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Frozen
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.delayed}>
              {kpiData.delayedTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Delayed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color={colors.completed}>
              {kpiData.completedTasks}
            </Typography>
            <Typography sx={{fontSize: 12 }} variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      {/* KPI Explanation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          What is KPI?
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            <strong>KPI</strong> (Key Performance Indicator) is a measure of your task completion efficiency for the year.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>How is it calculated?</strong>
          </Typography>
          <Box sx={{ bgcolor: '#F0FDF4', p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" color="success.main">
              <strong>KPI = (Completed Tasks ÷ Total Tasks) × 100</strong>
            </Typography>
          </Box>
          <Typography variant="body2" gutterBottom>
            For example, if you completed 80 out of 100 tasks, your KPI would be:
          </Typography>
          <Box sx={{ bgcolor: '#F3F4F6', p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              KPI = (80 ÷ 100) × 100 = <strong>80%</strong>
            </Typography>
          </Box>
          <Typography variant="body2">
            A higher KPI means you are completing more of your assigned tasks, reflecting better performance.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained" color="success">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
};

export default KPI;