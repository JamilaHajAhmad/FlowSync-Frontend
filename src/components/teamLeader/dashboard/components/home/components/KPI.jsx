import { useState, useEffect } from 'react';
import GaugeChart from 'react-gauge-chart';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { fetchLeaderAnnualKPI, fetchAdminLeaderAnnualKPI } from '../../../../../../services/homeService';
import { decodeToken } from '../../../../../../utils';

const colors = {
  completed: '#059669',
  delayed: '#EF4444',
  opened: '#F59E0B',
  frozen: '#1976D2',
  gauge: {
    red: '#EF4444',
    orange: '#F59E0B',
    green: '#10B981'
  }
};

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flexGrow: 1,
  backgroundColor: '#F0FDF4',
  borderRadius: '12px',
  padding: theme.spacing(2),
}));

const StyledGaugeChart = styled(GaugeChart)(() => ({
  height: 200,
  width: '100%',
}));

export default function KPI() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchKPI = async () => {
      let response;
      try {
        const token = localStorage.getItem('authToken');
        const role = decodeToken(token)?.role;

        if (role.includes('Leader') && !role.includes('Admin')) {
          response = await fetchLeaderAnnualKPI(token);
        } else if (role.includes('Admin')) {
          response = await fetchAdminLeaderAnnualKPI(token);
        } else {
          throw new Error('Unauthorized role');
        }

        if (!response?.data) {
          throw new Error('No data received from server');
        }

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
        console.error('KPI fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load KPI data');
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
          <CircularProgress sx={{ color: colors.completed }} />
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
            <Typography variant="h6" color="black">{kpiData.totalTasks}</Typography>
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
            <strong>KPI</strong> (Key Performance Indicator) is a measure of your team's task completion efficiency for the year.
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>How is it calculated?</strong>
          </Typography>
          <Box sx={{ bgcolor: '#F0FDF4', p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="body2">
              The KPI is calculated based on the tasks completed divided by the total tasks assigned, reflecting the completion rate.
            </Typography>
          </Box>
          <Typography variant="body2" gutterBottom>
            <strong>Why is it important?</strong>
          </Typography>
          <Typography variant="body2">
            KPI helps in assessing the efficiency and performance of the team in task completion, identifying areas of improvement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
}